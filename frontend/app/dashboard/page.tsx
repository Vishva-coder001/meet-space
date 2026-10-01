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
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { bookingApi, type Booking } from "@/services/bookings";
import { roomApi } from "@/services/rooms";
import type { Room } from "@/types/domain";
import { AppShell } from "@/components/shell/app-shell";
import { PageHeader } from "@/components/ui/page-header";
import { SectionHeader } from "@/components/ui/section-header";
import { ActionButton } from "@/components/ui/action-button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState, Skeleton } from "@/components/ui/loading-state";
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
    return [...(rawBookings || [])].slice(0, 4);
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

  return (
    <AppShell>
      {/* Top Welcome & Context Area */}
      <div className="mb-8">
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
              {upcomingBooking
                ? "Here is your upcoming schedule and room availability for today."
                : "Your schedule is clear. Book a room or explore the 3D office."}
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
                Book a Room
              </ActionButton>
            </Link>
            <Link href="/office">
              <ActionButton
                variant="secondary"
                size="md"
                leftIcon={<Glasses className="size-4 text-work-blue" />}
              >
                Open 3D Office
              </ActionButton>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Grid Layout: 2 Columns */}
      <div className="grid gap-8 lg:grid-cols-[1.8fr_1.2fr] items-start">
        {/* LEFT COLUMN: Schedule, Next Meeting, Timeline */}
        <div className="space-y-8">
          {/* UPCOMING MEETING SPOTLIGHT */}
          <Card className="border-work-blue-100 bg-gradient-to-br from-white via-white to-work-blue-50/40">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Clock className="size-4 text-work-blue" />
                    <span>Next Upcoming Meeting</span>
                  </CardTitle>
                  <CardDescription>
                    Your next scheduled room reservation
                  </CardDescription>
                </div>
                {upcomingBooking && (
                  <StatusBadge status={upcomingBooking.status} size="sm" />
                )}
              </div>
            </CardHeader>

            <CardContent>
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
                <div className="rounded-2xl border border-line/80 bg-white p-5 shadow-subtle-sm">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-lg font-bold text-ink">
                        {roomMap.get(upcomingBooking.roomId)?.name || "Meeting Room"}
                      </p>
                      <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-500 font-mono">
                        <span className="flex items-center gap-1">
                          <MapPin className="size-3.5 text-work-blue" />
                          <span>
                            Floor {roomMap.get(upcomingBooking.roomId)?.floor || "1"} (
                            {roomMap.get(upcomingBooking.roomId)?.roomCode || "Room"}
                            )
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
                        <p className="mt-3 text-xs text-slate-600 bg-paper-subtle p-2.5 rounded-xl border border-line/60">
                          <span className="font-semibold text-slate-700">Purpose: </span>
                          {upcomingBooking.purpose}
                        </p>
                      )}
                    </div>

                    <div className="shrink-0 flex items-center gap-2">
                      <Link href="/bookings">
                        <ActionButton variant="secondary" size="sm">
                          Manage Booking
                        </ActionButton>
                      </Link>
                    </div>
                  </div>
                </div>
              ) : (
                <EmptyState
                  icon={<CalendarDays className="size-6 text-slate-400" />}
                  title="No upcoming meetings"
                  description="You have no upcoming meeting room reservations scheduled."
                  action={
                    <Link href="/rooms">
                      <ActionButton variant="secondary" size="sm">
                        Book a Room Now
                      </ActionButton>
                    </Link>
                  }
                />
              )}
            </CardContent>
          </Card>

          {/* TODAY'S SCHEDULE TIMELINE */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <CalendarDays className="size-4 text-work-blue" />
                    <span>Today&apos;s Schedule</span>
                  </CardTitle>
                  <CardDescription>
                    Your meeting timeline for today ({todayStr})
                  </CardDescription>
                </div>
                <span className="text-xs font-mono text-slate-400">
                  {todayBookings.length} {todayBookings.length === 1 ? "booking" : "bookings"}
                </span>
              </div>
            </CardHeader>

            <CardContent>
              {bookingsQuery.isLoading ? (
                <div className="space-y-3 py-2">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : todayBookings.length > 0 ? (
                <div className="relative pl-6 border-l-2 border-work-blue-200/80 space-y-6 my-2">
                  {todayBookings.map((b) => {
                    const room = roomMap.get(b.roomId);
                    const isCancelled = b.status === "CANCELLED";
                    return (
                      <div key={b.id} className="relative group">
                        {/* Timeline dot */}
                        <div
                          className={cn(
                            "absolute -left-[31px] top-1.5 size-3.5 rounded-full border-2 border-white shadow-subtle-sm transition-transform group-hover:scale-125",
                            isCancelled ? "bg-rose-400" : "bg-work-blue"
                          )}
                        />
                        <div
                          className={cn(
                            "rounded-2xl border p-4 transition-all",
                            isCancelled
                              ? "bg-rose-50/40 border-rose-100 text-slate-500"
                              : "bg-white border-line/80 shadow-subtle-sm hover:border-slate-300"
                          )}
                        >
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-ink text-sm">
                                  {room?.name || "Meeting Room"}
                                </span>
                                <span className="font-mono text-xs text-slate-400">
                                  ({room?.roomCode || "Room"})
                                </span>
                              </div>
                              <p className="mt-1 text-xs text-slate-500 font-mono">
                                {b.startTime.slice(0, 5)} – {b.endTime.slice(0, 5)} · Floor {room?.floor || "1"}
                              </p>
                            </div>
                            <div>
                              <StatusBadge status={b.status} size="sm" />
                            </div>
                          </div>
                          {b.purpose && (
                            <p className="mt-2 text-xs text-slate-600 line-clamp-1">
                              {b.purpose}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <EmptyState
                  icon={<Clock className="size-6 text-slate-400" />}
                  title="No meetings today"
                  description="You have no room reservations scheduled for today."
                />
              )}
            </CardContent>
          </Card>

          {/* RECENT BOOKINGS ACTIVITY */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <CalendarCheck className="size-4 text-work-blue" />
                    <span>Recent Bookings</span>
                  </CardTitle>
                  <CardDescription>
                    Your recent meeting room booking history
                  </CardDescription>
                </div>
                <Link
                  href="/bookings"
                  className="text-xs font-semibold text-work-blue hover:underline flex items-center gap-1"
                >
                  <span>View all</span>
                  <ChevronRight className="size-3.5" />
                </Link>
              </div>
            </CardHeader>

            <CardContent>
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
                  description="Your recent meeting room reservations will appear here."
                />
              )}
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN: Quick Actions & Room Directory */}
        <div className="space-y-8">
          {/* QUICK ACTIONS */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Workplace Quick Actions</CardTitle>
              <CardDescription>Instant access to primary tools</CardDescription>
            </CardHeader>

            <CardContent>
              <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-1">
                <Link
                  href="/rooms"
                  className="flex items-center gap-3.5 rounded-2xl border border-line/80 bg-white p-3.5 shadow-subtle-sm transition-all hover:bg-slate-50 hover:border-slate-300 group"
                >
                  <div className="grid size-10 place-items-center rounded-xl bg-work-blue-50 text-work-blue group-hover:bg-work-blue group-hover:text-white transition-colors">
                    <DoorOpen className="size-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-ink">Book a Room</p>
                    <p className="text-xs text-slate-400 truncate">
                      Search meeting rooms & reserve slots
                    </p>
                  </div>
                  <ChevronRight className="size-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </Link>

                <Link
                  href="/office"
                  className="flex items-center gap-3.5 rounded-2xl border border-line/80 bg-white p-3.5 shadow-subtle-sm transition-all hover:bg-slate-50 hover:border-slate-300 group"
                >
                  <div className="grid size-10 place-items-center rounded-xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    <Glasses className="size-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-ink">3D Digital Office</p>
                    <p className="text-xs text-slate-400 truncate">
                      Spatial view & WebXR VR experience
                    </p>
                  </div>
                  <ChevronRight className="size-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </Link>

                <Link
                  href="/bookings"
                  className="flex items-center gap-3.5 rounded-2xl border border-line/80 bg-white p-3.5 shadow-subtle-sm transition-all hover:bg-slate-50 hover:border-slate-300 group"
                >
                  <div className="grid size-10 place-items-center rounded-xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    <CalendarCheck className="size-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-ink">My Bookings</p>
                    <p className="text-xs text-slate-400 truncate">
                      Manage upcoming and historical reservations
                    </p>
                  </div>
                  <ChevronRight className="size-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </Link>

                <Link
                  href="/profile"
                  className="flex items-center gap-3.5 rounded-2xl border border-line/80 bg-white p-3.5 shadow-subtle-sm transition-all hover:bg-slate-50 hover:border-slate-300 group"
                >
                  <div className="grid size-10 place-items-center rounded-xl bg-sky-50 text-sky-600 group-hover:bg-sky-600 group-hover:text-white transition-colors">
                    <User className="size-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-ink">Employee Profile</p>
                    <p className="text-xs text-slate-400 truncate">
                      View details & update workplace identity
                    </p>
                  </div>
                  <ChevronRight className="size-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </Link>

                {isAdmin && (
                  <Link
                    href="/admin"
                    className="flex items-center gap-3.5 rounded-2xl border border-indigo-200 bg-indigo-50/40 p-3.5 shadow-subtle-sm transition-all hover:bg-indigo-50 group"
                  >
                    <div className="grid size-10 place-items-center rounded-xl bg-indigo-100 text-indigo-700 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                      <ShieldCheck className="size-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-indigo-950">Admin Console</p>
                      <p className="text-xs text-indigo-700/80 truncate">
                        Manage rooms, employees & system metrics
                      </p>
                    </div>
                    <ChevronRight className="size-4 text-indigo-600 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>

          {/* ROOM DIRECTORY OVERVIEW */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <DoorOpen className="size-4 text-work-blue" />
                    <span>Meeting Rooms</span>
                  </CardTitle>
                  <CardDescription>Active office spaces</CardDescription>
                </div>
                <Link
                  href="/rooms"
                  className="text-xs font-semibold text-work-blue hover:underline flex items-center gap-1"
                >
                  <span>All rooms</span>
                  <ChevronRight className="size-3.5" />
                </Link>
              </div>
            </CardHeader>

            <CardContent>
              {roomsQuery.isLoading ? (
                <div className="space-y-3">
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
                  {rawRooms.slice(0, 4).map((room) => (
                    <Link
                      key={room.id}
                      href={`/rooms/${room.id}`}
                      className="block rounded-2xl border border-line/70 bg-white p-3.5 transition-all hover:border-work-blue-300 hover:shadow-subtle-sm"
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
                      <p className="text-sm font-semibold text-ink">{room.name}</p>
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
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
