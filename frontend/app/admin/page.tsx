"use client";

import * as React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  Users,
  DoorOpen,
  CalendarDays,
  ShieldCheck,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Search,
  Building2,
  Clock,
  AlertCircle,
} from "lucide-react";
import { adminApi, type AdminEmployee, type AdminBooking, type AdminDashboard } from "@/services/admin";
import { roomApi } from "@/services/rooms";
import { AdminRoomManager } from "@/components/admin-room-manager";
import { AppShell } from "@/components/shell/app-shell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { SectionHeader } from "@/components/ui/section-header";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Skeleton } from "@/components/ui/loading-state";
import { cn } from "@/lib/utils";

function MetricCard({
  label,
  value,
  icon: Icon,
  accent = "blue",
  isLoading,
}: {
  label: string;
  value: number | undefined;
  icon: React.ElementType;
  accent?: "blue" | "green" | "violet" | "amber" | "rose" | "sky";
  isLoading?: boolean;
}) {
  const colors: Record<string, string> = {
    blue: "bg-work-blue-50 text-work-blue border-work-blue-100",
    green: "bg-emerald-50 text-emerald-600 border-emerald-100",
    violet: "bg-violet-50 text-violet-600 border-violet-100",
    amber: "bg-amber-50 text-amber-600 border-amber-100",
    rose: "bg-rose-50 text-rose-600 border-rose-100",
    sky: "bg-sky-50 text-sky-600 border-sky-100",
  };

  return (
    <div className="rounded-2xl border border-line/80 bg-white p-5 shadow-subtle-sm">
      <div className={cn("inline-flex rounded-xl border p-2.5 mb-3", colors[accent])}>
        <Icon className="size-5" />
      </div>
      {isLoading ? (
        <Skeleton className="h-8 w-20 mb-1" />
      ) : (
        <p className="text-2xl font-bold text-ink tabular-nums">{value ?? "—"}</p>
      )}
      <p className="text-xs font-medium text-slate-500 mt-0.5">{label}</p>
    </div>
  );
}

export default function AdminPage() {
  const [empSearch, setEmpSearch] = React.useState("");
  const [bookingSearch, setBookingSearch] = React.useState("");
  const [bookingStatus, setBookingStatus] = React.useState("all");

  const dashboardQuery = useQuery({
    queryKey: ["admin", "dashboard"],
    queryFn: adminApi.dashboard,
  });
  const employeesQuery = useQuery({
    queryKey: ["admin", "employees"],
    queryFn: adminApi.employees,
  });
  const bookingsQuery = useQuery({
    queryKey: ["admin", "bookings"],
    queryFn: adminApi.bookings,
  });
  const roomsQuery = useQuery({
    queryKey: ["rooms"],
    queryFn: roomApi.list,
  });

  const hasError =
    dashboardQuery.isError || employeesQuery.isError || bookingsQuery.isError || roomsQuery.isError;

  if (hasError) {
    return (
      <AppShell>
        <ErrorState
          message="You do not have access to this administration area, or there was a server error."
        />
      </AppShell>
    );
  }

  const d: AdminDashboard | undefined = dashboardQuery.data?.data;
  const employees: AdminEmployee[] = employeesQuery.data?.data || [];
  const bookings: AdminBooking[] = bookingsQuery.data?.data || [];
  const rooms = roomsQuery.data?.data || [];

  // Filtered employees
  const filteredEmployees = employees.filter((e) => {
    const q = empSearch.toLowerCase();
    return (
      !q ||
      e.firstName.toLowerCase().includes(q) ||
      e.lastName.toLowerCase().includes(q) ||
      e.email.toLowerCase().includes(q) ||
      e.employeeCode.toLowerCase().includes(q) ||
      e.department.toLowerCase().includes(q)
    );
  });

  // Filtered bookings
  const filteredBookings = bookings.filter((b) => {
    const q = bookingSearch.toLowerCase();
    const matchSearch =
      !q ||
      b.employeeName.toLowerCase().includes(q) ||
      b.employeeEmail.toLowerCase().includes(q) ||
      b.roomName.toLowerCase().includes(q) ||
      b.roomCode.toLowerCase().includes(q);
    const matchStatus = bookingStatus === "all" || b.status === bookingStatus;
    return matchSearch && matchStatus;
  });

  return (
    <AppShell>
      {/* Page Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold text-work-blue uppercase tracking-wider mb-1">
          <ShieldCheck className="size-3.5" />
          Administration
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
          Workplace Operations
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Monitor and manage all employees, rooms, and booking activity across MeetSpace.
        </p>
      </div>

      {/* Metrics Grid */}
      <section className="mb-8">
        <SectionHeader title="System Metrics" />
        <div className="mt-4 grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
          <MetricCard
            label="Total Employees"
            value={d?.totalEmployees}
            icon={Users}
            accent="blue"
            isLoading={dashboardQuery.isLoading}
          />
          <MetricCard
            label="Active Employees"
            value={d?.activeEmployees}
            icon={CheckCircle2}
            accent="green"
            isLoading={dashboardQuery.isLoading}
          />
          <MetricCard
            label="Active Rooms"
            value={d?.activeRooms}
            icon={DoorOpen}
            accent="violet"
            isLoading={dashboardQuery.isLoading}
          />
          <MetricCard
            label="Bookings Today"
            value={d?.bookingsToday}
            icon={CalendarDays}
            accent="sky"
            isLoading={dashboardQuery.isLoading}
          />
          <MetricCard
            label="Upcoming"
            value={d?.upcomingBookings}
            icon={TrendingUp}
            accent="amber"
            isLoading={dashboardQuery.isLoading}
          />
          <MetricCard
            label="Cancelled"
            value={d?.cancelledBookings}
            icon={XCircle}
            accent="rose"
            isLoading={dashboardQuery.isLoading}
          />
        </div>
      </section>

      {/* Room Manager */}
      <section className="mb-8">
        <SectionHeader title="Meeting Room Management" />
        <div className="mt-4">
          <AdminRoomManager rooms={rooms} />
        </div>
      </section>

      {/* Employees Table */}
      <section className="mb-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
          <SectionHeader title="Employee Directory" />
          <div className="relative max-w-xs w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search employees…"
              value={empSearch}
              onChange={(e) => setEmpSearch(e.target.value)}
              className="w-full rounded-xl border border-line bg-white pl-8 pr-3 py-2 text-xs text-ink placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-work-blue/30"
            />
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            {employeesQuery.isLoading ? (
              <div className="p-4 space-y-2">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : filteredEmployees.length === 0 ? (
              <div className="p-8 text-center">
                <EmptyState
                  icon={<Users className="size-5 text-slate-300" />}
                  title="No employees found"
                  description={empSearch ? `No match for "${empSearch}"` : "No employees registered yet."}
                />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[36rem] text-left text-sm">
                  <thead className="border-b border-line/80 bg-paper-subtle">
                    <tr>
                      {["Code", "Employee", "Department", "Phone", "Account"].map((h) => (
                        <th
                          key={h}
                          className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line/60">
                    {filteredEmployees.map((e) => (
                      <tr key={e.id} className="hover:bg-paper-subtle/60 transition-colors">
                        <td className="px-4 py-3">
                          <span className="font-mono text-xs font-bold text-work-blue bg-work-blue-50 border border-work-blue-100 px-2 py-0.5 rounded-lg">
                            {e.employeeCode}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-semibold text-ink text-sm">
                            {e.firstName} {e.lastName}
                          </p>
                          <p className="text-xs text-slate-400">{e.email}</p>
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-600">{e.department}</td>
                        <td className="px-4 py-3 text-xs font-mono text-slate-500">
                          {e.phone || "—"}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-col gap-1">
                            <span
                              className={cn(
                                "text-[11px] font-medium",
                                e.active ? "text-emerald-600" : "text-slate-400"
                              )}
                            >
                              {e.active ? "Active" : "Inactive"}
                            </span>
                            <span
                              className={cn(
                                "text-[11px] font-medium",
                                e.emailVerified ? "text-emerald-600" : "text-amber-600"
                              )}
                            >
                              {e.emailVerified ? "Verified" : "Unverified"}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      {/* All Bookings Table */}
      <section className="mb-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
          <SectionHeader title="All Bookings" />
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search bookings…"
                value={bookingSearch}
                onChange={(e) => setBookingSearch(e.target.value)}
                className="w-full rounded-xl border border-line bg-white pl-8 pr-3 py-2 text-xs text-ink placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-work-blue/30"
              />
            </div>
            <select
              value={bookingStatus}
              onChange={(e) => setBookingStatus(e.target.value)}
              className="rounded-xl border border-line bg-white px-3 py-2 text-xs font-medium text-ink focus:outline-none focus:ring-2 focus:ring-work-blue/30"
            >
              <option value="all">All Statuses</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="PENDING">Pending</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            {bookingsQuery.isLoading ? (
              <div className="p-4 space-y-2">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : filteredBookings.length === 0 ? (
              <div className="p-8 text-center">
                <EmptyState
                  icon={<CalendarDays className="size-5 text-slate-300" />}
                  title="No bookings found"
                  description={bookingSearch ? `No match for "${bookingSearch}"` : "No bookings in the system."}
                />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[48rem] text-left text-sm">
                  <thead className="border-b border-line/80 bg-paper-subtle">
                    <tr>
                      {["Reference", "Employee", "Room", "When", "Purpose", "Status"].map((h) => (
                        <th
                          key={h}
                          className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line/60">
                    {filteredBookings.map((b) => (
                      <tr key={b.id} className="hover:bg-paper-subtle/60 transition-colors">
                        <td className="px-4 py-3">
                          <span className="font-mono text-[11px] text-slate-400 truncate block max-w-[8rem]">
                            {b.id.slice(0, 8)}…
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-semibold text-ink text-sm truncate max-w-[10rem]">
                            {b.employeeName}
                          </p>
                          <p className="text-xs text-slate-400 truncate max-w-[10rem]">
                            {b.employeeEmail}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-semibold text-ink text-sm">{b.roomName}</p>
                          <span className="font-mono text-[11px] text-work-blue bg-work-blue-50 border border-work-blue-100 px-1.5 py-0.5 rounded-lg">
                            {b.roomCode}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-slate-600">
                          <p>{b.bookingDate}</p>
                          <p className="text-work-blue font-semibold">
                            {b.startTime.slice(0, 5)} – {b.endTime.slice(0, 5)}
                          </p>
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-500 max-w-[12rem]">
                          <p className="truncate">{b.purpose || "—"}</p>
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={b.status} size="sm" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </AppShell>
  );
}
