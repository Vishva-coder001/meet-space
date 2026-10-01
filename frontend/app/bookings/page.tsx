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
  Loader2,
} from "lucide-react";
import { bookingApi, type Booking } from "@/services/bookings";
import { roomApi } from "@/services/rooms";
import { AppShell } from "@/components/shell/app-shell";
import { PageHeader } from "@/components/ui/page-header";
import { SectionHeader } from "@/components/ui/section-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Skeleton } from "@/components/ui/loading-state";
import { Modal } from "@/components/ui/modal";
import { ActionButton } from "@/components/ui/action-button";
import { cn } from "@/lib/utils";
import type { Room } from "@/types/domain";

export default function BookingsPage() {
  const qc = useQueryClient();
  const [cancelTarget, setCancelTarget] = React.useState<string | null>(null);
  const [statusFilter, setStatusFilter] = React.useState<string>("all");

  // Fetch bookings
  const bookingsQuery = useQuery({
    queryKey: ["bookings"],
    queryFn: async () => {
      const res = await bookingApi.mine();
      return res.data || [];
    },
  });

  // Fetch rooms for name lookup
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
    onSuccess: () => {
      setCancelTarget(null);
      qc.invalidateQueries({ queryKey: ["bookings"] });
    },
  });

  const rows = React.useMemo(
    () => bookingsQuery.data || [],
    [bookingsQuery.data]
  );
  const todayStr = new Date().toISOString().slice(0, 10);

  // Filtered rows
  const filteredRows = React.useMemo(() => {
    if (statusFilter === "all") return rows;
    return rows.filter((b) => b.status === statusFilter);
  }, [rows, statusFilter]);

  // Upcoming: CONFIRMED or PENDING on today or future
  const upcoming = React.useMemo(
    () =>
      filteredRows.filter(
        (b) =>
          (b.status === "CONFIRMED" || b.status === "PENDING") &&
          b.bookingDate >= todayStr
      ).sort((a, b) => {
        if (a.bookingDate !== b.bookingDate) return a.bookingDate.localeCompare(b.bookingDate);
        return a.startTime.localeCompare(b.startTime);
      }),
    [filteredRows, todayStr]
  );

  // Past: everything else
  const past = React.useMemo(
    () =>
      filteredRows
        .filter((b) => !upcoming.includes(b))
        .sort((a, b) => b.bookingDate.localeCompare(a.bookingDate)),
    [filteredRows, upcoming]
  );

  const cancelTarget_booking = rows.find((b) => b.id === cancelTarget);

  return (
    <AppShell>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <div className="font-mono text-xs font-semibold text-work-blue uppercase tracking-wider mb-1">
            My Schedule
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">My Bookings</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage your meeting room reservations and track booking history.
          </p>
        </div>
        <Link href="/rooms">
          <ActionButton variant="primary" size="md" leftIcon={<PlusCircle className="size-4" />}>
            Book a Room
          </ActionButton>
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="mb-6 flex items-center gap-2 flex-wrap">
        <Filter className="size-4 text-slate-400 shrink-0" />
        {["all", "CONFIRMED", "PENDING", "CANCELLED"].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={cn(
              "rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all",
              statusFilter === s
                ? "bg-work-blue text-white border-work-blue shadow-subtle-sm"
                : "bg-white text-slate-600 border-line hover:border-slate-300 hover:text-ink"
            )}
          >
            {s === "all" ? "All Bookings" : s.charAt(0) + s.slice(1).toLowerCase()}
            {s !== "all" && (
              <span className="ml-1.5 text-[10px] opacity-70">
                ({rows.filter((b) => b.status === s).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {bookingsQuery.isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : bookingsQuery.isError ? (
        <ErrorState
          message="Unable to load your bookings. Please try again."
          onRetry={() => bookingsQuery.refetch()}
        />
      ) : rows.length === 0 ? (
        <EmptyState
          icon={<CalendarCheck className="size-6 text-slate-400" />}
          title="No bookings yet"
          description="You haven't made any meeting room reservations. Book your first room to get started."
          action={
            <Link href="/rooms">
              <ActionButton variant="secondary" size="md">
                Browse Rooms
              </ActionButton>
            </Link>
          }
        />
      ) : (
        <div className="space-y-8">
          {/* Upcoming Bookings */}
          <section>
            <SectionHeader title="Upcoming Reservations" />
            {upcoming.length > 0 ? (
              <div className="space-y-3 mt-4">
                {upcoming.map((b) => (
                  <BookingRow
                    key={b.id}
                    booking={b}
                    room={roomMap.get(b.roomId)}
                    onCancel={() => setCancelTarget(b.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="mt-4 rounded-2xl border border-line/60 bg-white p-6 text-center">
                <CalendarDays className="size-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-500">No upcoming reservations.</p>
                <Link href="/rooms" className="mt-3 inline-block">
                  <ActionButton variant="secondary" size="sm">
                    Book a room
                  </ActionButton>
                </Link>
              </div>
            )}
          </section>

          {/* Past Bookings */}
          <section>
            <SectionHeader title="Booking History" />
            {past.length > 0 ? (
              <div className="space-y-3 mt-4">
                {past.map((b) => (
                  <BookingRow
                    key={b.id}
                    booking={b}
                    room={roomMap.get(b.roomId)}
                    onCancel={() => setCancelTarget(b.id)}
                    isPast
                  />
                ))}
              </div>
            ) : (
              <div className="mt-4 rounded-2xl border border-line/60 bg-white p-6 text-center">
                <p className="text-sm text-slate-400">No historical bookings.</p>
              </div>
            )}
          </section>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      <Modal
        open={!!cancelTarget}
        onClose={() => setCancelTarget(null)}
        title="Cancel Booking?"
      >
        <div>
          {cancelTarget_booking && (
            <div className="mb-4 rounded-xl bg-rose-50 border border-rose-200 p-4">
              <p className="text-sm font-semibold text-rose-900">
                {roomMap.get(cancelTarget_booking.roomId)?.name || "Meeting Room"}
              </p>
              <p className="text-xs font-mono text-rose-700 mt-1">
                {cancelTarget_booking.bookingDate} ·{" "}
                {cancelTarget_booking.startTime.slice(0, 5)} –{" "}
                {cancelTarget_booking.endTime.slice(0, 5)}
              </p>
            </div>
          )}
          <p className="text-sm text-slate-600">
            This booking will be marked as cancelled and retained in your history. This action cannot be undone.
          </p>
          {cancelMutation.isError && (
            <p className="mt-3 text-sm text-rose-600 flex items-center gap-1.5">
              <AlertTriangle className="size-4" />
              Unable to cancel this booking. Please try again.
            </p>
          )}
          <div className="mt-6 flex items-center gap-3">
            <ActionButton
              variant="secondary"
              size="md"
              onClick={() => setCancelTarget(null)}
              disabled={cancelMutation.isPending}
            >
              Keep Booking
            </ActionButton>
            <ActionButton
              variant="danger"
              size="md"
              isLoading={cancelMutation.isPending}
              onClick={() => cancelTarget && cancelMutation.mutate(cancelTarget)}
            >
              {cancelMutation.isPending ? "Cancelling…" : "Cancel Booking"}
            </ActionButton>
          </div>
        </div>
      </Modal>
    </AppShell>
  );
}

function BookingRow({
  booking,
  room,
  onCancel,
  isPast = false,
}: {
  booking: Booking;
  room: Room | undefined;
  onCancel: () => void;
  isPast?: boolean;
}) {
  const isCancelled = booking.status === "CANCELLED";
  const canCancel = (booking.status === "PENDING" || booking.status === "CONFIRMED") && !isPast;

  return (
    <div
      className={cn(
        "rounded-2xl border bg-white p-4 shadow-subtle-sm transition-all",
        isCancelled
          ? "border-line/40 opacity-70"
          : "border-line/80 hover:border-slate-300 hover:shadow-subtle-md"
      )}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <p className="text-sm font-bold text-ink truncate">
              {room?.name || "Meeting Room"}
            </p>
            <span className="font-mono text-[11px] text-slate-400">
              ({room?.roomCode || "Room"})
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-slate-500">
            <span className="flex items-center gap-1">
              <CalendarDays className="size-3.5 text-work-blue/70" />
              {booking.bookingDate}
            </span>
            <span>·</span>
            <span className="flex items-center gap-1 font-semibold text-work-blue">
              <Clock className="size-3.5" />
              {booking.startTime.slice(0, 5)} – {booking.endTime.slice(0, 5)}
            </span>
            {room && (
              <>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <MapPin className="size-3.5 text-slate-400" />
                  Floor {room.floor}
                </span>
              </>
            )}
          </div>
          {booking.purpose && (
            <p className="mt-2 text-xs text-slate-500 line-clamp-1">{booking.purpose}</p>
          )}
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <StatusBadge status={booking.status} size="sm" />
          {canCancel && (
            <button
              onClick={onCancel}
              className="text-xs font-semibold text-rose-600 hover:text-rose-800 hover:bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200 transition-all"
            >
              Cancel
            </button>
          )}
          <Link href={`/rooms/${booking.roomId}`}>
            <ChevronRight className="size-4 text-slate-300 hover:text-slate-500 transition-colors" />
          </Link>
        </div>
      </div>
    </div>
  );
}