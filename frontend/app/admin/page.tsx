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
  X,
  FileSpreadsheet,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import {
  adminApi,
  type AdminEmployee,
  type AdminBooking,
  type AdminDashboard,
} from "@/services/admin";
import { roomApi } from "@/services/rooms";
import { AdminRoomManager } from "@/components/admin-room-manager";
import { AppShell } from "@/components/shell/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { SectionHeader } from "@/components/ui/section-header";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { LoadingState, Skeleton } from "@/components/ui/loading-state";
import { ActionButton } from "@/components/ui/action-button";
import { cn } from "@/lib/utils";

function MetricCard({
  label,
  value,
  sublabel,
  icon: Icon,
  accent = "blue",
  isLoading,
}: {
  label: string;
  value: number | undefined;
  sublabel?: string;
  icon: React.ElementType;
  accent?: "blue" | "green" | "violet" | "amber" | "rose" | "sky";
  isLoading?: boolean;
}) {
  const colors: Record<string, string> = {
    blue: "bg-work-blue-50 text-work-blue border-work-blue-100",
    green: "bg-emerald-50 text-emerald-600 border-emerald-100",
    violet: "bg-indigo-50 text-indigo-600 border-indigo-100",
    amber: "bg-amber-50 text-amber-600 border-amber-100",
    rose: "bg-rose-50 text-rose-600 border-rose-100",
    sky: "bg-sky-50 text-sky-600 border-sky-100",
  };

  return (
    <div className="rounded-2xl border border-line/80 bg-white p-4 sm:p-5 shadow-subtle-sm flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className={cn("inline-flex rounded-xl border p-2", colors[accent])}>
            <Icon className="size-4" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Metric
          </span>
        </div>
        {isLoading ? (
          <Skeleton className="h-8 w-20 mb-1" />
        ) : (
          <p className="text-2xl font-bold font-mono text-ink tabular-nums">{value ?? "—"}</p>
        )}
      </div>
      <div className="mt-2 pt-2 border-t border-line/40">
        <p className="text-xs font-semibold text-slate-600">{label}</p>
        {sublabel && <p className="text-[11px] text-slate-400 mt-0.5">{sublabel}</p>}
      </div>
    </div>
  );
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = React.useState<"overview" | "rooms" | "employees" | "bookings">(
    "overview"
  );
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
    dashboardQuery.isError ||
    employeesQuery.isError ||
    bookingsQuery.isError ||
    roomsQuery.isError;

  if (hasError) {
    return (
      <AppShell>
        <ErrorState
          message="You do not have permission to access the workplace administration console, or an authentication error occurred."
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
    const q = empSearch.toLowerCase().trim();
    if (!q) return true;
    return (
      e.firstName.toLowerCase().includes(q) ||
      e.lastName.toLowerCase().includes(q) ||
      e.email.toLowerCase().includes(q) ||
      e.employeeCode.toLowerCase().includes(q) ||
      e.department.toLowerCase().includes(q)
    );
  });

  // Filtered bookings
  const filteredBookings = bookings.filter((b) => {
    const q = bookingSearch.toLowerCase().trim();
    const matchSearch =
      !q ||
      b.employeeName.toLowerCase().includes(q) ||
      b.employeeEmail.toLowerCase().includes(q) ||
      b.roomName.toLowerCase().includes(q) ||
      b.roomCode.toLowerCase().includes(q) ||
      (b.purpose || "").toLowerCase().includes(q) ||
      b.bookingDate.includes(q);

    const matchStatus = bookingStatus === "all" || b.status === bookingStatus;
    return matchSearch && matchStatus;
  });

  return (
    <AppShell>
      {/* Page Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold text-work-blue uppercase tracking-wider mb-1">
          <ShieldCheck className="size-3.5" />
          Administration Console
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
          Workplace Operations
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Internal operations console for workspace resource cataloging, employee provisioning, and reservation auditing.
        </p>
      </div>

      {/* Operational Nav Tabs */}
      <div className="mb-6 flex items-center gap-2 border-b border-line pb-3 overflow-x-auto">
        {[
          { id: "overview", label: "Operations Overview", icon: ShieldCheck },
          { id: "rooms", label: "Meeting Rooms", count: rooms.length, icon: DoorOpen },
          { id: "employees", label: "Employee Directory", count: employees.length, icon: Users },
          { id: "bookings", label: "Reservation Log", count: bookings.length, icon: CalendarDays },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={cn(
                "inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap",
                isActive
                  ? "bg-work-blue text-white shadow-subtle-sm"
                  : "text-slate-600 hover:text-ink hover:bg-paper-subtle"
              )}
            >
              <Icon className="size-3.5" />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={cn(
                    "text-[10px] font-mono px-1.5 py-0.2 rounded-md",
                    isActive ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"
                  )}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === "overview" && (
        <div className="space-y-8">
          {/* Metrics Grid */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <SectionHeader title="Realtime Workplace Metrics" />
              <span className="text-xs font-mono text-slate-400">
                Synced from database
              </span>
            </div>
            <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
              <MetricCard
                label="Total Employees"
                value={d?.totalEmployees}
                sublabel="Provisioned accounts"
                icon={Users}
                accent="blue"
                isLoading={dashboardQuery.isLoading}
              />
              <MetricCard
                label="Active Employees"
                value={d?.activeEmployees}
                sublabel="Authorized staff"
                icon={CheckCircle2}
                accent="green"
                isLoading={dashboardQuery.isLoading}
              />
              <MetricCard
                label="Active Rooms"
                value={d?.activeRooms}
                sublabel="Bookable spaces"
                icon={DoorOpen}
                accent="violet"
                isLoading={dashboardQuery.isLoading}
              />
              <MetricCard
                label="Bookings Today"
                value={d?.bookingsToday}
                sublabel="Daily schedule"
                icon={CalendarDays}
                accent="sky"
                isLoading={dashboardQuery.isLoading}
              />
              <MetricCard
                label="Upcoming"
                value={d?.upcomingBookings}
                sublabel="Scheduled reservations"
                icon={TrendingUp}
                accent="amber"
                isLoading={dashboardQuery.isLoading}
              />
              <MetricCard
                label="Cancelled"
                value={d?.cancelledBookings}
                sublabel="Released meetings"
                icon={XCircle}
                accent="rose"
                isLoading={dashboardQuery.isLoading}
              />
            </div>
          </section>

          {/* Quick Rooms Overview */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <SectionHeader title="Active Room Inventory" />
              <button
                type="button"
                onClick={() => setActiveTab("rooms")}
                className="text-xs font-semibold text-work-blue hover:underline"
              >
                Manage all rooms →
              </button>
            </div>
            <AdminRoomManager rooms={rooms} />
          </section>
        </div>
      )}

      {/* TAB 2: ROOMS */}
      {activeTab === "rooms" && (
        <section className="space-y-4">
          <SectionHeader title="Meeting Room Catalog & Specifications" />
          <AdminRoomManager rooms={rooms} />
        </section>
      )}

      {/* TAB 3: EMPLOYEES */}
      {activeTab === "employees" && (
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <SectionHeader title="Employee Directory & Provisioning" />
            <div className="relative max-w-xs w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, code, department…"
                value={empSearch}
                onChange={(e) => setEmpSearch(e.target.value)}
                className="w-full rounded-xl border border-line bg-paper-subtle pl-8 pr-8 py-1.5 text-xs text-ink placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-work-blue/30"
              />
              {empSearch && (
                <button
                  type="button"
                  onClick={() => setEmpSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-ink"
                >
                  <X className="size-3" />
                </button>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-line/80 bg-white overflow-hidden shadow-subtle-sm">
            {employeesQuery.isLoading ? (
              <div className="p-6 space-y-3">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : filteredEmployees.length === 0 ? (
              <div className="p-8 text-center">
                <EmptyState
                  icon={<Users className="size-6 text-slate-300" />}
                  title="No employees found"
                  description={
                    empSearch
                      ? `No employee records match "${empSearch}".`
                      : "No employee accounts registered in the database."
                  }
                  action={
                    empSearch ? (
                      <ActionButton
                        variant="secondary"
                        size="sm"
                        onClick={() => setEmpSearch("")}
                      >
                        Clear search
                      </ActionButton>
                    ) : undefined
                  }
                />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[44rem] text-left text-sm">
                  <thead className="border-b border-line bg-paper-subtle text-slate-600 font-semibold text-xs uppercase tracking-wider">
                    <tr>
                      <th className="px-4 py-3">Employee Code</th>
                      <th className="px-4 py-3">Full Name & Email</th>
                      <th className="px-4 py-3">Department</th>
                      <th className="px-4 py-3">Phone</th>
                      <th className="px-4 py-3">Account Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line/60">
                    {filteredEmployees.map((e) => (
                      <tr key={e.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-4 py-3 font-mono text-xs">
                          <span className="font-bold text-work-blue bg-work-blue-50 border border-work-blue-100 px-2 py-0.5 rounded-lg">
                            {e.employeeCode}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-semibold text-ink text-sm">
                            {e.firstName} {e.lastName}
                          </p>
                          <p className="text-xs text-slate-400 font-mono">{e.email}</p>
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-600">{e.department}</td>
                        <td className="px-4 py-3 text-xs font-mono text-slate-500">
                          {e.phone || "—"}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span
                              className={cn(
                                "text-[11px] font-semibold px-2 py-0.5 rounded-full border",
                                e.active
                                  ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                                  : "bg-slate-100 border-slate-200 text-slate-500"
                              )}
                            >
                              {e.active ? "Active" : "Inactive"}
                            </span>
                            <span
                              className={cn(
                                "text-[11px] font-semibold px-2 py-0.5 rounded-full border",
                                e.emailVerified
                                  ? "bg-sky-50 border-sky-200 text-work-blue"
                                  : "bg-amber-50 border-amber-200 text-amber-700"
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
          </div>
        </section>
      )}

      {/* TAB 4: BOOKINGS AUDIT */}
      {activeTab === "bookings" && (
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <SectionHeader title="All System Reservations & Audit Log" />
            <div className="flex items-center gap-2">
              <div className="relative max-w-xs w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search reservations…"
                  value={bookingSearch}
                  onChange={(e) => setBookingSearch(e.target.value)}
                  className="w-full rounded-xl border border-line bg-paper-subtle pl-8 pr-8 py-1.5 text-xs text-ink placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-work-blue/30"
                />
                {bookingSearch && (
                  <button
                    type="button"
                    onClick={() => setBookingSearch("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-ink"
                  >
                    <X className="size-3" />
                  </button>
                )}
              </div>

              <select
                value={bookingStatus}
                onChange={(e) => setBookingStatus(e.target.value)}
                className="rounded-xl border border-line bg-paper-subtle px-3 py-1.5 text-xs font-semibold text-ink focus:outline-none focus:ring-2 focus:ring-work-blue/30 cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="PENDING">Pending</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="rounded-2xl border border-line/80 bg-white overflow-hidden shadow-subtle-sm">
            {bookingsQuery.isLoading ? (
              <div className="p-6 space-y-3">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : filteredBookings.length === 0 ? (
              <div className="p-8 text-center">
                <EmptyState
                  icon={<CalendarDays className="size-6 text-slate-300" />}
                  title="No reservations found"
                  description={
                    bookingSearch
                      ? `No booking records match "${bookingSearch}".`
                      : "No reservations have been recorded in the system."
                  }
                  action={
                    bookingSearch || bookingStatus !== "all" ? (
                      <ActionButton
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setBookingSearch("");
                          setBookingStatus("all");
                        }}
                      >
                        Reset filters
                      </ActionButton>
                    ) : undefined
                  }
                />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[50rem] text-left text-sm">
                  <thead className="border-b border-line bg-paper-subtle text-slate-600 font-semibold text-xs uppercase tracking-wider">
                    <tr>
                      <th className="px-4 py-3">Reference ID</th>
                      <th className="px-4 py-3">Employee</th>
                      <th className="px-4 py-3">Room & Code</th>
                      <th className="px-4 py-3">Scheduled Time</th>
                      <th className="px-4 py-3">Purpose</th>
                      <th className="px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line/60">
                    {filteredBookings.map((b) => (
                      <tr key={b.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-4 py-3 font-mono text-xs text-slate-400">
                          <span className="truncate block max-w-[7rem]">{b.id.slice(0, 8)}…</span>
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-semibold text-ink text-sm truncate max-w-[12rem]">
                            {b.employeeName}
                          </p>
                          <p className="text-xs text-slate-400 font-mono truncate max-w-[12rem]">
                            {b.employeeEmail}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-semibold text-ink text-sm">{b.roomName}</p>
                          <span className="font-mono text-[11px] text-work-blue bg-work-blue-50 border border-work-blue-100 px-1.5 py-0.5 rounded">
                            {b.roomCode}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-slate-600">
                          <p>{b.bookingDate}</p>
                          <p className="text-work-blue font-semibold">
                            {b.startTime.slice(0, 5)} – {b.endTime.slice(0, 5)}
                          </p>
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-500 max-w-[14rem]">
                          <p className="line-clamp-2">{b.purpose || "—"}</p>
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
          </div>
        </section>
      )}
    </AppShell>
  );
}
