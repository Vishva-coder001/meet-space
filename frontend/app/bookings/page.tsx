"use client";

import * as React from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CalendarCheck,
  CalendarDays,
  Clock,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ChevronRight,
  Filter,
  PlusCircle,
  Search,
  X,
  Building2,
  Calendar,
  AlertCircle,
  Info,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { bookingApi, type Booking } from "@/services/bookings";
import { roomApi } from "@/services/rooms";
import { AppShell } from "@/components/shell/app-shell";
import { PageHeader } from "@/components/ui/page-header";
import { SectionHeader } from "@/components/ui/section-header";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { LoadingState, Skeleton } from "@/components/ui/loading-state";
import { Modal } from "@/components/ui/modal";
import { ActionButton } from "@/components/ui/action-button";
import { cn } from "@/lib/utils";
import type { Room } from "@/types/domain";

function formatDuration(startTime: string, endTime: string): string {
  if (!startTime || !endTime || startTime >= endTime) return "";
  const [sH, sM] = startTime.split(":").map(Number);
  const [eH, eM] = endTime.split(":").map(Number);
  const totalMins = eH * 60 + eM - (sH * 60 + sM);
  if (totalMins <= 0) return "";
  const hours = Math.floor(totalMins / 60);
  const mins = totalMins % 60;
  if (hours > 0 && mins > 0) return `${hours} hr ${mins} min`;
  if (hours > 0) return `${hours} hr${hours > 1 ? "s" : ""}`;
  return `${mins} min`;
}

function formatDateDisplay(dateStr: string): string {
  if (!dateStr) return "";
  try {
    const [y, m, d] = dateStr.split("-").map(Number);
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export default function BookingsPage() {
  const qc = useQueryClient();
  const [cancelTarget, setCancelTarget] = React.useState<Booking | null>(null);
  const [detailTarget, setDetailTarget] = React.useState<Booking | null>(null);
  const [tabFilter, setTabFilter] = React.useState<"all" | "upcoming" | "past" | "cancelled">("all");
  const [search, setSearch] = React.useState("");

  const todayStr = React.useMemo(() => new Date().toISOString().slice(0, 10), []);

  // Fetch bookings
  const bookingsQuery = useQuery({
    queryKey: ["bookings"],
    queryFn: async () => {
      const res = await bookingApi.mine();
      return res.data || [];
    },
  });

  // Fetch rooms for lookup
  const roomsQuery = useQuery({
    queryKey: ["rooms"],
    queryFn: async () => {
      const res = await roomApi.list();
      return res.data || [];
    },
  });

  const roomMap = React.useMemo(() => {
    const map = new Map<string, Room>();
    (roomsQuery.data || []).forEach((r) => map.set(r.id, r));
    return map;
  }, [roomsQuery.data]);

  const cancelMutation = useMutation({
    mutationFn: (id: string) => bookingApi.cancel(id),
    onSuccess: (res) => {
      const updated = res.data;
      setCancelTarget(null);
      if (detailTarget?.id === updated?.id) {
        setDetailTarget(null);
      }
      qc.invalidateQueries({ queryKey: ["bookings"] });
      if (updated?.roomId) {
        qc.invalidateQueries({ queryKey: ["availability", updated.roomId] });
      }
    },
  });

  const allBookings: Booking[] = React.useMemo(
    () => bookingsQuery.data || [],
    [bookingsQuery.data]
  );

  // Categorize
  const upcomingBookings = React.useMemo(() => {
    return allBookings
      .filter(
        (b) =>
          (b.status === "CONFIRMED" || b.status === "PENDING") &&
          b.bookingDate >= todayStr
      )
      .sort((a, b) => {
        if (a.bookingDate !== b.bookingDate) return a.bookingDate.localeCompare(b.bookingDate);
        return a.startTime.localeCompare(b.startTime);
      });
  }, [allBookings, todayStr]);

  const pastBookings = React.useMemo(() => {
    return allBookings
      .filter(
        (b) =>
          b.status === "CONFIRMED" &&
          b.bookingDate < todayStr
      )
      .sort((a, b) => b.bookingDate.localeCompare(a.bookingDate));
  }, [allBookings, todayStr]);

  const cancelledBookings = React.useMemo(() => {
    return allBookings
      .filter((b) => b.status === "CANCELLED")
      .sort((a, b) => b.bookingDate.localeCompare(a.bookingDate));
  }, [allBookings]);

  // Filtered by tab + search
  const filteredBookings = React.useMemo(() => {
    let list: Booking[] = [];
    if (tabFilter === "all") list = allBookings;
    else if (tabFilter === "upcoming") list = upcomingBookings;
    else if (tabFilter === "past") list = pastBookings;
    else if (tabFilter === "cancelled") list = cancelledBookings;

    const q = search.toLowerCase().trim();
    if (!q) return list;

    return list.filter((b) => {
      const room = roomMap.get(b.roomId);
      return (
        (room?.name || "").toLowerCase().includes(q) ||
        (room?.roomCode || "").toLowerCase().includes(q) ||
        (b.purpose || "").toLowerCase().includes(q) ||
        b.bookingDate.toLowerCase().includes(q) ||
        b.status.toLowerCase().includes(q)
      );
    });
  }, [
    allBookings,
    upcomingBookings,
    pastBookings,
    cancelledBookings,
    tabFilter,
    search,
    roomMap,
  ]);

  return (
    <AppShell>
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold text-work-blue uppercase tracking-wider mb-1">
            <CalendarCheck className="size-3.5" />
            My Schedule
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            My Bookings
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage your meeting reservations, view upcoming schedules, and inspect history.
          </p>
        </div>

        <Link href="/rooms">
          <ActionButton
            variant="primary"
            size="md"
            leftIcon={<PlusCircle className="size-4" />}
          >
            Book a Room
          </ActionButton>
        </Link>
      </div>

      {/* Schedule Metrics Overview */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <div className="rounded-2xl border border-line/80 bg-white p-4 shadow-subtle-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Bookings</span>
            <Calendar className="size-4 text-work-blue/80" />
          </div>
          <div className="text-2xl font-bold font-mono text-ink">{allBookings.length}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Lifetime reservations</div>
        </div>

        <div className="rounded-2xl border border-line/80 bg-white p-4 shadow-subtle-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Upcoming</span>
            <CheckCircle2 className="size-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-600">
            {upcomingBookings.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Active reservations</div>
        </div>

        <div className="rounded-2xl border border-line/80 bg-white p-4 shadow-subtle-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Completed</span>
            <Clock className="size-4 text-slate-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-ink">{pastBookings.length}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Past meetings</div>
        </div>

        <div className="rounded-2xl border border-line/80 bg-white p-4 shadow-subtle-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Cancelled</span>
            <XCircle className="size-4 text-rose-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-rose-600">
            {cancelledBookings.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Released slots</div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="mb-6 rounded-2xl border border-line/80 bg-white p-4 shadow-subtle-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          {/* Tab Filters */}
          <div className="flex items-center gap-1.5 flex-wrap" role="tablist" aria-label="Filter bookings by status">
            {[
              { id: "all", label: "All Bookings", count: allBookings.length },
              { id: "upcoming", label: "Upcoming", count: upcomingBookings.length },
              { id: "past", label: "Past", count: pastBookings.length },
              { id: "cancelled", label: "Cancelled", count: cancelledBookings.length },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={tabFilter === tab.id}
                onClick={() => setTabFilter(tab.id as typeof tabFilter)}
                className={cn(
                  "rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all flex items-center gap-1.5",
                  tabFilter === tab.id
                    ? "bg-work-blue text-white border-work-blue shadow-subtle-sm"
                    : "bg-paper-subtle text-slate-600 border-line hover:border-slate-300 hover:text-ink"
                )}
              >
                <span>{tab.label}</span>
                <span
                  className={cn(
                    "text-[10px] font-mono px-1.5 py-0.2 rounded-md",
                    tabFilter === tab.id
                      ? "bg-white/20 text-white"
                      : "bg-slate-200 text-slate-600"
                  )}
                  aria-label={`${tab.count} results`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative max-w-xs w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-slate-400" aria-hidden="true" />
            <input
              type="text"
              id="bookings-search"
              placeholder="Search by room, purpose, date…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search bookings by room, purpose, or date"
              className="w-full rounded-xl border border-line bg-paper-subtle pl-8 pr-8 py-1.5 text-xs text-ink placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-work-blue/30"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="Clear search"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-ink"
              >
                <X className="size-3" aria-hidden="true" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Bookings Content */}
      {bookingsQuery.isLoading ? (
        <LoadingState message="Loading your reservation schedule…" />
      ) : bookingsQuery.isError ? (
        <ErrorState
          message="Unable to load your bookings. Please try again."
          onRetry={() => bookingsQuery.refetch()}
        />
      ) : allBookings.length === 0 ? (
        <EmptyState
          icon={<CalendarCheck className="size-6 text-slate-400" />}
          title="No bookings yet"
          description="You haven't made any meeting room reservations yet. Explore available spaces across campus to schedule a meeting."
          action={
            <Link href="/rooms">
              <ActionButton variant="primary" size="md">
                Browse Meeting Rooms
              </ActionButton>
            </Link>
          }
        />
      ) : filteredBookings.length === 0 ? (
        <EmptyState
          icon={<Filter className="size-6 text-slate-400" />}
          title="No matching bookings found"
          description={
            search
              ? `No bookings match your search for "${search}".`
              : "No bookings found for the selected tab filter."
          }
          action={
            <ActionButton
              variant="secondary"
              size="sm"
              leftIcon={<RotateCcw className="size-3.5" />}
              onClick={() => {
                setSearch("");
                setTabFilter("all");
              }}
            >
              Reset filters
            </ActionButton>
          }
        />
      ) : (
        <div className="space-y-8">
          {/* If viewing All or Upcoming, display Upcoming Group */}
          {(tabFilter === "all" || tabFilter === "upcoming") && upcomingBookings.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <SectionHeader title="Upcoming Reservations" />
                <span className="text-xs font-mono text-slate-400">
                  {upcomingBookings.length} scheduled
                </span>
              </div>
              <div className="grid gap-3.5">
                {upcomingBookings
                  .filter((b) => filteredBookings.includes(b))
                  .map((b) => (
                    <BookingItemCard
                      key={b.id}
                      booking={b}
                      room={roomMap.get(b.roomId)}
                      onCancel={() => setCancelTarget(b)}
                      onViewDetails={() => setDetailTarget(b)}
                    />
                  ))}
              </div>
            </section>
          )}

          {/* If viewing All, Past, or Cancelled, display History Group */}
          {(tabFilter === "all" || tabFilter === "past" || tabFilter === "cancelled") && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <SectionHeader
                  title={
                    tabFilter === "cancelled"
                      ? "Cancelled Bookings"
                      : tabFilter === "past"
                      ? "Completed Meetings"
                      : "Booking History"
                  }
                />
                <span className="text-xs font-mono text-slate-400">
                  {tabFilter === "cancelled"
                    ? `${cancelledBookings.length} records`
                    : tabFilter === "past"
                    ? `${pastBookings.length} records`
                    : `${pastBookings.length + cancelledBookings.length} records`}
                </span>
              </div>

              {filteredBookings.filter((b) => !upcomingBookings.includes(b)).length > 0 ? (
                <div className="grid gap-3.5">
                  {filteredBookings
                    .filter((b) => !upcomingBookings.includes(b))
                    .map((b) => (
                      <BookingItemCard
                        key={b.id}
                        booking={b}
                        room={roomMap.get(b.roomId)}
                        onCancel={() => setCancelTarget(b)}
                        onViewDetails={() => setDetailTarget(b)}
                        isPast
                      />
                    ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-line/60 bg-white p-6 text-center text-xs text-slate-400">
                  No historical bookings match the current filter.
                </div>
              )}
            </section>
          )}
        </div>
      )}

      {/* Booking Details Modal */}
      <Modal
        open={Boolean(detailTarget)}
        onClose={() => setDetailTarget(null)}
        title="Booking Details"
      >
        {detailTarget && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-line/80 bg-paper-subtle p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-ink text-base">
                    {roomMap.get(detailTarget.roomId)?.name || "Meeting Room"}
                  </h3>
                  <p className="text-xs font-mono text-work-blue mt-0.5">
                    {roomMap.get(detailTarget.roomId)?.roomCode || "Room"} · Floor{" "}
                    {roomMap.get(detailTarget.roomId)?.floor || "—"}
                  </p>
                </div>
                <StatusBadge status={detailTarget.status} size="md" />
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs border-t border-line/60 pt-3 font-mono">
                <div>
                  <span className="text-slate-400 uppercase text-[10px]">Date:</span>
                  <p className="font-semibold text-ink mt-0.5">
                    {formatDateDisplay(detailTarget.bookingDate)}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400 uppercase text-[10px]">Time:</span>
                  <p className="font-semibold text-work-blue mt-0.5">
                    {detailTarget.startTime.slice(0, 5)} – {detailTarget.endTime.slice(0, 5)} (
                    {formatDuration(detailTarget.startTime, detailTarget.endTime)})
                  </p>
                </div>
              </div>

              {detailTarget.purpose && (
                <div className="border-t border-line/60 pt-3 text-xs">
                  <span className="text-slate-400 uppercase text-[10px]">Meeting Purpose:</span>
                  <p className="mt-1 text-ink bg-white border border-line/60 rounded-xl p-3 leading-relaxed">
                    {detailTarget.purpose}
                  </p>
                </div>
              )}

              <div className="border-t border-line/60 pt-2 text-[11px] font-mono text-slate-400">
                Reference: {detailTarget.id}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2.5 pt-2">
              <Link href={`/rooms/${detailTarget.roomId}`}>
                <ActionButton variant="secondary" size="md">
                  View Room Page
                </ActionButton>
              </Link>
              {(detailTarget.status === "CONFIRMED" || detailTarget.status === "PENDING") &&
                detailTarget.bookingDate >= todayStr && (
                  <ActionButton
                    variant="danger"
                    size="md"
                    onClick={() => {
                      const target = detailTarget;
                      setDetailTarget(null);
                      setCancelTarget(target);
                    }}
                  >
                    Cancel Booking
                  </ActionButton>
                )}
            </div>
          </div>
        )}
      </Modal>

      {/* Cancel Confirmation Modal */}
      <Modal
        open={Boolean(cancelTarget)}
        onClose={() => setCancelTarget(null)}
        title="Cancel This Reservation?"
      >
        <div>
          {cancelTarget && (
            <div className="mb-4 rounded-2xl bg-rose-50/80 border border-rose-200 p-4 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-rose-900">
                  {roomMap.get(cancelTarget.roomId)?.name || "Meeting Room"}
                </span>
                <span className="font-mono text-xs text-rose-700 bg-rose-100 border border-rose-200 px-2 py-0.5 rounded-lg">
                  {roomMap.get(cancelTarget.roomId)?.roomCode || "Room"}
                </span>
              </div>
              <p className="text-xs font-mono text-rose-800">
                {formatDateDisplay(cancelTarget.bookingDate)} ·{" "}
                {cancelTarget.startTime.slice(0, 5)} – {cancelTarget.endTime.slice(0, 5)}
              </p>
              {cancelTarget.purpose && (
                <p className="text-xs text-rose-700/90 italic pt-1 truncate">
                  &ldquo;{cancelTarget.purpose}&rdquo;
                </p>
              )}
            </div>
          )}

          <p className="text-sm text-slate-600 leading-relaxed">
            This reservation will be transitioned to <strong>CANCELLED</strong> status. The time
            slot will be immediately released to other colleagues. Historical record of this
            booking will be preserved.
          </p>

          {cancelMutation.isError && (
            <div className="mt-3 rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-800 flex items-center gap-2">
              <AlertCircle className="size-4 shrink-0 text-rose-600" />
              Unable to cancel this reservation. It may have already started or been modified.
            </div>
          )}

          <div className="mt-6 flex items-center justify-end gap-3">
            <ActionButton
              variant="outline"
              size="md"
              onClick={() => setCancelTarget(null)}
              disabled={cancelMutation.isPending}
            >
              Keep Reservation
            </ActionButton>
            <ActionButton
              variant="danger"
              size="md"
              isLoading={cancelMutation.isPending}
              onClick={() => cancelTarget && cancelMutation.mutate(cancelTarget.id)}
            >
              {cancelMutation.isPending ? "Cancelling…" : "Confirm Cancellation"}
            </ActionButton>
          </div>
        </div>
      </Modal>
    </AppShell>
  );
}

function BookingItemCard({
  booking,
  room,
  onCancel,
  onViewDetails,
  isPast = false,
}: {
  booking: Booking;
  room: Room | undefined;
  onCancel: () => void;
  onViewDetails: () => void;
  isPast?: boolean;
}) {
  const isCancelled = booking.status === "CANCELLED";
  const canCancel =
    (booking.status === "PENDING" || booking.status === "CONFIRMED") && !isPast;
  const duration = formatDuration(booking.startTime, booking.endTime);

  return (
    <Card
      className={cn(
        "p-4 sm:p-5 transition-all duration-200",
        isCancelled
          ? "border-line/50 opacity-75 bg-slate-50/50"
          : "border-line/80 hover:border-slate-300 hover:shadow-subtle-md"
      )}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1">
          {/* Room name & Code */}
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <h3 className="text-base font-bold text-ink truncate">
              {room?.name || "Meeting Room"}
            </h3>
            <span className="font-mono text-xs font-bold text-work-blue bg-work-blue-50 border border-work-blue-100 px-2 py-0.5 rounded-lg">
              {room?.roomCode || "ROOM"}
            </span>
          </div>

          {/* Meta: Date, Time, Duration, Floor */}
          <div className="flex flex-wrap items-center gap-2.5 text-xs font-mono text-slate-500">
            <span className="inline-flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-lg">
              <CalendarDays className="size-3.5 text-work-blue" />
              {formatDateDisplay(booking.bookingDate)}
            </span>
            <span className="inline-flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-lg text-ink font-semibold">
              <Clock className="size-3.5 text-work-blue" />
              {booking.startTime.slice(0, 5)} – {booking.endTime.slice(0, 5)}
              {duration && <span className="text-slate-500 font-normal">({duration})</span>}
            </span>
            {room && (
              <span className="inline-flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-lg">
                <MapPin className="size-3.5 text-slate-400" />
                Floor {room.floor}
              </span>
            )}
          </div>

          {/* Purpose */}
          {booking.purpose && (
            <p className="mt-2.5 text-xs text-slate-600 line-clamp-1 leading-relaxed bg-paper-subtle border border-line/40 rounded-xl px-3 py-1.5 max-w-2xl">
              <span className="font-semibold text-ink">Purpose: </span>
              {booking.purpose}
            </p>
          )}
        </div>

        {/* Status & Actions */}
        <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-center border-t sm:border-t-0 border-line/60 pt-2 sm:pt-0 w-full sm:w-auto justify-between sm:justify-end">
          <StatusBadge status={booking.status} size="sm" />

          <button
            type="button"
            onClick={onViewDetails}
            aria-label={`View details for ${room?.name ?? "this booking"}`}
            className="text-xs font-semibold text-slate-600 hover:text-work-blue hover:bg-paper-subtle px-2.5 py-1 rounded-lg border border-line transition-all"
          >
            Details
          </button>

          {canCancel && (
            <ActionButton
              variant="destructive"
              size="sm"
              onClick={onCancel}
            >
              Cancel
            </ActionButton>
          )}

          <Link href={`/rooms/${booking.roomId}`}>
            <ActionButton
              variant="outline"
              size="sm"
              rightIcon={<ChevronRight className="size-3" />}
            >
              Room
            </ActionButton>
          </Link>
        </div>
      </div>
    </Card>
  );
}