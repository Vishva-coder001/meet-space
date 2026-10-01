"use client";

import * as React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  CalendarDays,
  DoorOpen,
  CalendarCheck,
  Glasses,
  User,
  ShieldCheck,
  ArrowUpRight,
  Clock,
  MapPin,
  Users,
  Sparkles,
  ChevronRight,
  PlusCircle,
  Calendar,
  Radio,
  ArrowRight,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { bookingApi, type Booking } from "@/services/bookings";
import { roomApi } from "@/services/rooms";
import type { Room } from "@/types/domain";
import { AppShell } from "@/components/shell/app-shell";
import { ActionButton } from "@/components/ui/action-button";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/loading-state";
import { ErrorState } from "@/components/ui/error-state";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  const { user, profile, isAuthenticated, isAdmin, isLoading: isAuthLoading } = useAuth();

  // Fetch employee bookings
  const bookingsQuery = useQuery({
    queryKey: ["bookings"],
    queryFn: async () => {
      const res = await bookingApi.mine();
      return res.data || [];
    },
    enabled: isAuthenticated,
  });

  // Fetch rooms list
  const roomsQuery = useQuery({
    queryKey: ["rooms"],
    queryFn: async () => {
      const res = await roomApi.list();
      return res.data || [];
    },
  });

  const rawBookings = bookingsQuery.data;
  const rawRooms = roomsQuery.data;

  // Map rooms by ID for quick lookup
  const roomMap = React.useMemo(() => {
    const map = new Map<string, Room>();
    (rawRooms || []).forEach((r) => map.set(r.id, r));
    return map;
  }, [rawRooms]);

  // Dynamic greeting based on current local hour
  const greeting = React.useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  }, []);

  // Today's date string YYYY-MM-DD
  const todayStr = React.useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }, []);

  // Find nearest upcoming booking (CONFIRMED/PENDING for today or future)
  const upcomingBooking = React.useMemo(() => {
    const list = rawBookings || [];
    const active = list.filter(
      (b) =>
        (b.status === "CONFIRMED" || b.status === "PENDING") &&
        b.bookingDate >= todayStr
    );
    if (active.length === 0) return null;
    return active.sort((a, b) => {
      if (a.bookingDate !== b.bookingDate) {
        return a.bookingDate.localeCompare(b.bookingDate);
      }
      return a.startTime.localeCompare(b.startTime);
    })[0];
  }, [rawBookings, todayStr]);

  // Today's schedule
  const todayBookings = React.useMemo(() => {
    const list = rawBookings || [];
    return list
      .filter((b) => b.bookingDate === todayStr)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [rawBookings, todayStr]);

  // Recent bookings (up to 4)
  const recentBookings = React.useMemo(() => {
    return [...(rawBookings || [])].slice(0, 5);
  }, [rawBookings]);

  // If unauthenticated and done loading, redirect or display sign in card
  if (!isAuthLoading && !isAuthenticated) {
    return (
      <AppShell>
        <div className="py-16 text-center max-w-md mx-auto">
          <EmptyState
            icon={<User className="size-6 text-work-blue" />}
            title="Authentication Required"
            description="Please sign in to access your MeetSpace workplace command center."
            action={
              <Link href="/login">
                <ActionButton variant="primary" size="md">
                  Sign in to MeetSpace
                </ActionButton>
              </Link>
            }
          />
        </div>
      </AppShell>
    );
  }

  const activeRoomsCount = (rawRooms || []).filter((r) => r.active).length;

  return (
    <AppShell>
      {/* 1. TOP GREETING & COMMAND CENTER HEADER */}
      <div className="mb-8 border-b border-line/60 pb-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold text-work-blue uppercase tracking-wider mb-1">
              <Sparkles className="size-3.5" />
              <span>Workplace Command Center</span>
            </div>
            {isAuthLoading ? (
              <Skeleton className="h-9 w-64 mt-1" />
            ) : (
              <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
                {greeting}, {profile?.firstName || user?.email?.split("@")[0] || "there"}
              </h1>
            )}
            <p className="mt-1 text-sm text-slate-500 max-w-xl">
              Your workplace at a glance. Manage reservations and inspect active room availability.
            </p>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-3 shrink-0">
            <Link href="/rooms">
              <ActionButton
                variant="primary"
                size="md"
                leftIcon={<PlusCircle className="size-4" />}
              >
                Reserve Space
              </ActionButton>
            </Link>
            <Link href="/office">
              <ActionButton
                variant="secondary"
                size="md"
                leftIcon={<Glasses className="size-4 text-work-blue" />}
              >
                3D Digital Twin
              </ActionButton>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. LIVE WORKSPACE SPATIAL BANNER */}
      <div className="mb-8 rounded-3xl border border-line bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950 p-6 sm:p-8 text-white shadow-subtle-lg relative overflow-hidden">
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/30 bg-sky-500/10 px-3 py-1 text-xs font-mono text-sky-300 mb-3 backdrop-blur-sm">
              <Radio className="size-3 text-emerald-400 animate-pulse" />
              <span>LIVE WORKSPACE · {activeRoomsCount} ACTIVE ROOMS</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Explore your office in interactive 3D
            </h2>
            <p className="mt-1.5 text-xs sm:text-sm text-slate-300 leading-relaxed">
              Real-time room occupancy, WebXR virtual reality locomotion, and spatial room directory.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link href="/office">
              <ActionButton
                variant="secondary"
                size="md"
                className="bg-white text-slate-900 border-white hover:bg-slate-100 font-semibold"
                rightIcon={<ArrowRight className="size-4" />}
              >
                Launch 3D Office
              </ActionButton>
            </Link>
          </div>
        </div>
      </div>

      {/* 3. MAIN WORKSPACE SPLIT (Timeline + Room Availability Stream) */}
      <div className="grid gap-8 lg:grid-cols-[1.6fr_1.4fr] items-start">
        {/* LEFT COLUMN: Next Meeting & Schedule Timeline */}
        <div className="space-y-8">
          {/* NEXT RESERVATION SPOTLIGHT */}
          <div className="rounded-3xl border border-line bg-white p-6 shadow-subtle-sm">
            <div className="flex items-center justify-between border-b border-line/60 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <Clock className="size-4 text-work-blue" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-ink font-mono">
                  Next Reservation
                </h2>
              </div>
              {upcomingBooking && (
                <StatusBadge status={upcomingBooking.status} size="sm" />
              )}
            </div>

            {bookingsQuery.isLoading ? (
              <div className="space-y-2 py-4">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ) : bookingsQuery.isError ? (
              <ErrorState
                message="Failed to load your upcoming booking"
                onRetry={() => bookingsQuery.refetch()}
              />
            ) : upcomingBooking ? (
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-ink">
                      {roomMap.get(upcomingBooking.roomId)?.name || "Meeting Room"}
                    </h3>
                    <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-slate-500 font-mono">
                      <span className="flex items-center gap-1">
                        <MapPin className="size-3.5 text-work-blue" />
                        <span>
                          Floor {roomMap.get(upcomingBooking.roomId)?.floor || "1"} (
                          {roomMap.get(upcomingBooking.roomId)?.roomCode || "Room"})
                        </span>
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="size-3.5 text-slate-400" />
                        <span>{upcomingBooking.bookingDate}</span>
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1 font-semibold text-work-blue">
                        <Clock className="size-3.5" />
                        <span>
                          {upcomingBooking.startTime.slice(0, 5)} – {upcomingBooking.endTime.slice(0, 5)}
                        </span>
                      </span>
                    </div>
                    {upcomingBooking.purpose && (
                      <p className="mt-3 text-xs text-slate-600 bg-paper-subtle p-3 rounded-xl border border-line/60">
                        <span className="font-semibold text-slate-700">Agenda: </span>
                        {upcomingBooking.purpose}
                      </p>
                    )}
                  </div>

                  <div className="shrink-0 flex items-center gap-2">
                    <Link href="/bookings">
                      <ActionButton variant="secondary" size="sm">
                        Manage
                      </ActionButton>
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <EmptyState
                icon={<CalendarDays className="size-6 text-slate-400" />}
                title="No upcoming reservations"
                description="Your calendar is open. Reserve a workspace whenever you are ready."
                action={
                  <Link href="/rooms">
                    <ActionButton variant="secondary" size="sm">
                      Browse Rooms
                    </ActionButton>
                  </Link>
                }
              />
            )}
          </div>

          {/* RECENT BOOKINGS TIMELINE */}
          <div className="rounded-3xl border border-line bg-white p-6 shadow-subtle-sm">
            <div className="flex items-center justify-between border-b border-line/60 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <CalendarCheck className="size-4 text-work-blue" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-ink font-mono">
                  Recent Activity
                </h2>
              </div>
              <Link
                href="/bookings"
                className="text-xs font-semibold text-work-blue hover:underline flex items-center gap-1 font-mono"
              >
                <span>View all bookings</span>
                <ChevronRight className="size-3.5" />
              </Link>
            </div>

            {bookingsQuery.isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : recentBookings.length > 0 ? (
              <div className="divide-y divide-line/60">
                {recentBookings.map((b) => {
                  const room = roomMap.get(b.roomId);
                  return (
                    <div
                      key={b.id}
                      className="py-3.5 flex items-center justify-between gap-4 first:pt-0 last:pb-0"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-ink truncate">
                          {room?.name || "Meeting Room"}
                        </p>
                        <p className="text-xs text-slate-500 font-mono">
                          {b.bookingDate} · {b.startTime.slice(0, 5)} – {b.endTime.slice(0, 5)}
                        </p>
                      </div>
                      <div className="shrink-0">
                        <StatusBadge status={b.status} size="sm" />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <EmptyState
                title="No booking history"
                description="Your past and current reservations will appear here."
              />
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Room Availability Stream */}
        <div className="space-y-8">
          <div className="rounded-3xl border border-line bg-white p-6 shadow-subtle-sm">
            <div className="flex items-center justify-between border-b border-line/60 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <DoorOpen className="size-4 text-work-blue" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-ink font-mono">
                  Room Availability
                </h2>
              </div>
              <Link
                href="/rooms"
                className="text-xs font-semibold text-work-blue hover:underline flex items-center gap-1 font-mono"
              >
                <span>Directory</span>
                <ChevronRight className="size-3.5" />
              </Link>
            </div>

            {roomsQuery.isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-14 w-full" />
                <Skeleton className="h-14 w-full" />
                <Skeleton className="h-14 w-full" />
              </div>
            ) : roomsQuery.isError ? (
              <ErrorState
                message="Unable to load room catalogue"
                onRetry={() => roomsQuery.refetch()}
              />
            ) : rawRooms && rawRooms.length > 0 ? (
              <div className="space-y-3">
                {rawRooms.map((room) => (
                  <Link
                    key={room.id}
                    href={`/rooms/${room.id}`}
                    className="block rounded-2xl border border-line/70 bg-paper-subtle/40 p-3.5 transition-all hover:bg-white hover:border-work-blue-300 hover:shadow-subtle-sm group"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-xs font-bold text-work-blue">
                        {room.roomCode}
                      </span>
                      <StatusBadge
                        status={room.active ? "ACTIVE" : "INACTIVE"}
                        size="sm"
                      />
                    </div>
                    <p className="text-sm font-semibold text-ink group-hover:text-work-blue transition-colors">
                      {room.name}
                    </p>
                    <div className="mt-1 flex items-center gap-3 text-xs text-slate-500 font-mono">
                      <span className="flex items-center gap-1">
                        <MapPin className="size-3" />
                        <span>Floor {room.floor}</span>
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Users className="size-3" />
                        <span>{room.capacity} seats</span>
                      </span>
                    </div>
                    {room.facilities && room.facilities.length > 0 && (
                      <p className="mt-2 text-[11px] text-slate-400 truncate">
                        {room.facilities.join(" · ")}
                      </p>
                    )}
                  </Link>
                ))}
              </div>
            ) : (
              <EmptyState
                title="No active rooms"
                description="No rooms are currently available in the catalogue."
              />
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
