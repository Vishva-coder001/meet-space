"use client";

import * as React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  DoorOpen,
  MapPin,
  Users,
  Search,
  SlidersHorizontal,
  X,
  ChevronRight,
  Wifi,
  Monitor,
  Coffee,
  Video,
  Presentation,
  Phone,
  Grid,
  List,
  CheckCircle2,
  XCircle,
  Building2,
  CalendarDays,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import { roomApi } from "@/services/rooms";
import { AppShell } from "@/components/shell/app-shell";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { ActionButton } from "@/components/ui/action-button";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { ErrorState } from "@/components/ui/error-state";
import { cn } from "@/lib/utils";
import type { Room } from "@/types/domain";

const FACILITY_ICONS: Record<string, React.ReactNode> = {
  WiFi: <Wifi className="size-3.5" />,
  TV: <Monitor className="size-3.5" />,
  Projector: <Presentation className="size-3.5" />,
  Whiteboard: <Presentation className="size-3.5" />,
  "Video Conference": <Video className="size-3.5" />,
  Phone: <Phone className="size-3.5" />,
  Coffee: <Coffee className="size-3.5" />,
};

const STANDARD_FACILITIES = [
  "WiFi",
  "Video Conference",
  "TV",
  "Whiteboard",
  "Projector",
  "Coffee",
  "Phone",
];

export default function RoomsPage() {
  const [search, setSearch] = React.useState("");
  const [floorFilter, setFloorFilter] = React.useState("all");
  const [capacityFilter, setCapacityFilter] = React.useState("all");
  const [facilityFilter, setFacilityFilter] = React.useState("all");
  const [statusFilter, setStatusFilter] = React.useState<"all" | "active" | "inactive">("all");
  const [viewMode, setViewMode] = React.useState<"grid" | "list">("list");

  const query = useQuery({
    queryKey: ["rooms"],
    queryFn: async () => {
      const res = await roomApi.list();
      return res.data || [];
    },
  });

  const rooms: Room[] = React.useMemo(
    () => query.data || [],
    [query.data]
  );

  const floors = React.useMemo(() => {
    const set = new Set(rooms.map((r) => String(r.floor)));
    return Array.from(set).sort((a, b) => Number(a) - Number(b));
  }, [rooms]);

  const hasActiveFilters = Boolean(
    search.trim() ||
      floorFilter !== "all" ||
      capacityFilter !== "all" ||
      facilityFilter !== "all" ||
      statusFilter !== "all"
  );

  const clearAllFilters = () => {
    setSearch("");
    setFloorFilter("all");
    setCapacityFilter("all");
    setFacilityFilter("all");
    setStatusFilter("all");
  };

  // Filtered rooms
  const filtered = React.useMemo(() => {
    return rooms.filter((r) => {
      const q = search.toLowerCase().trim();
      const matchSearch =
        !q ||
        r.name.toLowerCase().includes(q) ||
        r.roomCode.toLowerCase().includes(q) ||
        (r.description || "").toLowerCase().includes(q) ||
        (r.facilities || []).some((f) => f.toLowerCase().includes(q));

      const matchFloor =
        floorFilter === "all" || String(r.floor) === floorFilter;

      const matchCapacity =
        capacityFilter === "all" ||
        (capacityFilter === "focus" && r.capacity <= 4) ||
        (capacityFilter === "team" && r.capacity >= 5 && r.capacity <= 8) ||
        (capacityFilter === "boardroom" && r.capacity >= 9 && r.capacity <= 16) ||
        (capacityFilter === "large" && r.capacity > 16);

      const matchFacility =
        facilityFilter === "all" ||
        (r.facilities || []).some(
          (f) => f.toLowerCase() === facilityFilter.toLowerCase()
        );

      const matchStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && r.active) ||
        (statusFilter === "inactive" && !r.active);

      return matchSearch && matchFloor && matchCapacity && matchFacility && matchStatus;
    });
  }, [rooms, search, floorFilter, capacityFilter, facilityFilter, statusFilter]);

  const activeCount = React.useMemo(
    () => rooms.filter((r) => r.active).length,
    [rooms]
  );

  return (
    <AppShell>
      <PageHeader
        badge="Room Directory"
        title="Meeting Rooms"
        description="Find the right space for your meeting. Explore conference rooms, team hubs, and boardrooms across campus."
      />

      {/* Directory Overview Metrics */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <div className="rounded-2xl border border-line/80 bg-white p-4 shadow-subtle-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Rooms</span>
            <Building2 className="size-4 text-work-blue/80" />
          </div>
          <div className="text-2xl font-bold font-mono text-ink">{rooms.length}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Campus catalog</div>
        </div>

        <div className="rounded-2xl border border-line/80 bg-white p-4 shadow-subtle-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Available Spaces</span>
            <CheckCircle2 className="size-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-600">{activeCount}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Ready for booking</div>
        </div>

        <div className="rounded-2xl border border-line/80 bg-white p-4 shadow-subtle-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Floors</span>
            <MapPin className="size-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-ink">{floors.length || 1}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Active floors</div>
        </div>

        <div className="rounded-2xl border border-line/80 bg-white p-4 shadow-subtle-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Realtime Sync</span>
            <Sparkles className="size-4 text-amber-500" />
          </div>
          <div className="text-sm font-semibold text-ink flex items-center gap-1.5 pt-1">
            <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
            Live Connected
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Instant availability</div>
        </div>
      </div>

      {/* Search & Filters Bar */}
      <div
        className="mb-6 rounded-2xl border border-line/80 bg-white p-4 sm:p-5 shadow-subtle-sm space-y-4"
        role="search"
        aria-label="Search and filter meeting rooms"
      >
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" aria-hidden="true" />
            <input
              type="text"
              id="room-search"
              placeholder="Search rooms by name, code, description, or facilities…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search rooms by name, code, description or facilities"
              className="w-full rounded-xl border border-line bg-paper-subtle pl-10 pr-9 py-2.5 text-sm text-ink placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-work-blue/30 focus:border-work-blue/50 transition-all"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-ink-700 p-0.5"
                aria-label="Clear search query"
              >
                <X className="size-3.5" aria-hidden="true" />
              </button>
            )}
          </div>

          {/* View mode toggle */}
          <div className="flex items-center gap-1 border border-line/80 bg-paper-subtle p-1 rounded-xl shrink-0 self-end lg:self-auto">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={cn(
                "p-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5",
                viewMode === "grid"
                  ? "bg-white text-work-blue shadow-subtle-sm font-semibold"
                  : "text-slate-500 hover:text-ink"
              )}
              aria-label="Grid view"
            >
              <Grid className="size-3.5" />
              <span className="hidden sm:inline">Grid</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={cn(
                "p-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5",
                viewMode === "list"
                  ? "bg-white text-work-blue shadow-subtle-sm font-semibold"
                  : "text-slate-500 hover:text-ink"
              )}
              aria-label="List view"
            >
              <List className="size-3.5" />
              <span className="hidden sm:inline">Directory</span>
            </button>
          </div>
        </div>

        {/* Filter Controls Row */}
        <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-line/60">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wide mr-1">
            <SlidersHorizontal className="size-3.5 text-slate-400" />
            <span>Filters:</span>
          </div>

          {/* Floor filter */}
          <select
            value={floorFilter}
            onChange={(e) => setFloorFilter(e.target.value)}
            className="rounded-xl border border-line bg-paper-subtle px-3 py-1.5 text-xs font-medium text-ink focus:outline-none focus:ring-2 focus:ring-work-blue/30 cursor-pointer"
            aria-label="Filter by floor"
          >
            <option value="all">All Floors</option>
            {floors.map((f) => (
              <option key={f} value={f}>
                Floor {f}
              </option>
            ))}
          </select>

          {/* Capacity filter */}
          <select
            value={capacityFilter}
            onChange={(e) => setCapacityFilter(e.target.value)}
            className="rounded-xl border border-line bg-paper-subtle px-3 py-1.5 text-xs font-medium text-ink focus:outline-none focus:ring-2 focus:ring-work-blue/30 cursor-pointer"
            aria-label="Filter by capacity"
          >
            <option value="all">Any Capacity</option>
            <option value="focus">Focus (1–4 seats)</option>
            <option value="team">Team (5–8 seats)</option>
            <option value="boardroom">Boardroom (9–16 seats)</option>
            <option value="large">Large Hall (17+ seats)</option>
          </select>

          {/* Facility filter */}
          <select
            value={facilityFilter}
            onChange={(e) => setFacilityFilter(e.target.value)}
            className="rounded-xl border border-line bg-paper-subtle px-3 py-1.5 text-xs font-medium text-ink focus:outline-none focus:ring-2 focus:ring-work-blue/30 cursor-pointer"
            aria-label="Filter by facility"
          >
            <option value="all">All Facilities</option>
            {STANDARD_FACILITIES.map((fac) => (
              <option key={fac} value={fac}>
                {fac}
              </option>
            ))}
          </select>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as "all" | "active" | "inactive")
            }
            className="rounded-xl border border-line bg-paper-subtle px-3 py-1.5 text-xs font-medium text-ink focus:outline-none focus:ring-2 focus:ring-work-blue/30 cursor-pointer"
            aria-label="Filter by status"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>

          {/* Clear filters action */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearAllFilters}
              className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-2.5 py-1.5 rounded-xl transition-all ml-auto"
            >
              <X className="size-3" />
              Clear filters
            </button>
          )}
        </div>

        {/* Results summary bar */}
        <div className="flex items-center justify-between text-xs text-slate-500 font-mono pt-1">
          <span aria-live="polite" aria-atomic="true">
            Showing <strong className="text-ink font-semibold">{filtered.length}</strong> of{" "}
            {rooms.length} rooms
          </span>
          {hasActiveFilters && (
            <span className="text-work-blue">Active filters applied</span>
          )}
        </div>
      </div>

      {/* Directory Content */}
      {query.isLoading ? (
        <LoadingState message="Loading meeting rooms catalogue…" />
      ) : query.isError ? (
        <ErrorState
          message="Unable to load the room catalogue. Please try again."
          onRetry={() => query.refetch()}
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<DoorOpen className="size-6 text-slate-400" />}
          title="No matching rooms found"
          description={
            hasActiveFilters
              ? "No rooms match the selected search and filter criteria. Try adjusting your filters or search terms."
              : "No meeting rooms are currently configured in the directory."
          }
          action={
            hasActiveFilters ? (
              <ActionButton
                variant="secondary"
                size="sm"
                leftIcon={<RefreshCw className="size-3.5" />}
                onClick={clearAllFilters}
              >
                Reset all filters
              </ActionButton>
            ) : undefined
          }
        />
      ) : viewMode === "grid" ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((room) => (
            <RoomGridCard key={room.id} room={room} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-line/80 bg-white overflow-hidden shadow-subtle-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-line bg-paper-subtle text-slate-600 font-semibold text-xs uppercase tracking-wider">
                  <th scope="col" className="py-3.5 px-4">Room &amp; Code</th>
                  <th scope="col" className="py-3.5 px-4">Location</th>
                  <th scope="col" className="py-3.5 px-4">Capacity</th>
                  <th scope="col" className="py-3.5 px-4">Facilities</th>
                  <th scope="col" className="py-3.5 px-4">Status</th>
                  <th scope="col" className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/60">
                {filtered.map((room) => (
                  <RoomTableRow key={room.id} room={room} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AppShell>
  );
}

function RoomGridCard({ room }: { room: Room }) {
  return (
    <Card
      className={cn(
        "flex flex-col justify-between h-full p-5 transition-all duration-200",
        "hover:shadow-subtle-md hover:border-work-blue-300 hover:-translate-y-0.5",
        room.active ? "border-line/80" : "border-line/40 opacity-75 bg-slate-50/50"
      )}
    >
      <div>
        {/* Top Header: Code & Status */}
        <div className="flex items-center justify-between mb-3">
          <span className="font-mono text-xs font-bold text-work-blue bg-work-blue-50 border border-work-blue-100 px-2.5 py-1 rounded-lg">
            {room.roomCode}
          </span>
          <StatusBadge
            status={room.active ? "ACTIVE" : "INACTIVE"}
            label={room.active ? "Available" : "Inactive"}
          />
        </div>

        {/* Room Name */}
        <h2 className="text-base font-bold text-ink leading-snug hover:text-work-blue transition-colors">
          <Link href={`/rooms/${room.id}`}>{room.name}</Link>
        </h2>

        {/* Room Description */}
        {room.description ? (
          <p className="mt-1.5 text-xs text-slate-500 line-clamp-2 leading-relaxed">
            {room.description}
          </p>
        ) : (
          <p className="mt-1.5 text-xs text-slate-400 italic">
            No specific description provided.
          </p>
        )}

        {/* Specifications */}
        <div className="mt-4 flex items-center gap-3 text-xs text-slate-600 font-mono">
          <span className="inline-flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-lg">
            <MapPin className="size-3.5 text-work-blue" />
            Floor {room.floor}
          </span>
          <span className="inline-flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-lg">
            <Users className="size-3.5 text-slate-500" />
            {room.capacity} seats
          </span>
        </div>

        {/* Facilities list */}
        {room.facilities && room.facilities.length > 0 && (
          <div className="mt-3.5 flex flex-wrap gap-1.5">
            {room.facilities.slice(0, 4).map((f) => (
              <span
                key={f}
                className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 bg-paper-subtle border border-line/80 px-2 py-0.5 rounded-lg"
              >
                {FACILITY_ICONS[f] || null}
                {f}
              </span>
            ))}
            {room.facilities.length > 4 && (
              <span className="text-[11px] text-slate-400 font-mono px-1 py-0.5 self-center">
                +{room.facilities.length - 4} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer CTA */}
      <div className="mt-5 pt-3.5 border-t border-line/60 flex items-center justify-between">
        <span className="text-xs text-slate-400 font-mono">
          {room.active ? "Ready to reserve" : "Unavailable"}
        </span>
        <Link href={`/rooms/${room.id}`}>
          <ActionButton
            variant={room.active ? "soft-blue" : "secondary"}
            size="sm"
            rightIcon={<ChevronRight className="size-3.5" />}
          >
            {room.active ? "Book Space" : "View Details"}
          </ActionButton>
        </Link>
      </div>
    </Card>
  );
}

function RoomTableRow({ room }: { room: Room }) {
  return (
    <tr
      className={cn(
        "hover:bg-slate-50/70 transition-colors",
        !room.active && "opacity-75 bg-slate-50/30"
      )}
    >
      <td className="py-3.5 px-4">
        <div className="font-semibold text-ink">
          <Link href={`/rooms/${room.id}`} className="hover:text-work-blue transition-colors">
            {room.name}
          </Link>
        </div>
        <div className="font-mono text-xs text-work-blue mt-0.5">{room.roomCode}</div>
      </td>
      <td className="py-3.5 px-4 font-mono text-xs text-slate-600">
        <span className="inline-flex items-center gap-1">
          <MapPin className="size-3.5 text-work-blue/80" />
          Floor {room.floor}
        </span>
      </td>
      <td className="py-3.5 px-4 font-mono text-xs text-slate-600">
        <span className="inline-flex items-center gap-1">
          <Users className="size-3.5 text-slate-400" />
          {room.capacity} seats
        </span>
      </td>
      <td className="py-3.5 px-4">
        <div className="flex flex-wrap gap-1">
          {room.facilities && room.facilities.length > 0 ? (
            room.facilities.slice(0, 3).map((f) => (
              <span
                key={f}
                className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 bg-paper-subtle border border-line/80 px-2 py-0.5 rounded-lg"
              >
                {FACILITY_ICONS[f] || null}
                {f}
              </span>
            ))
          ) : (
            <span className="text-xs text-slate-400 italic">None listed</span>
          )}
          {room.facilities && room.facilities.length > 3 && (
            <span className="text-[11px] text-slate-400 font-mono px-1">
              +{room.facilities.length - 3}
            </span>
          )}
        </div>
      </td>
      <td className="py-3.5 px-4">
        <StatusBadge
          status={room.active ? "ACTIVE" : "INACTIVE"}
          label={room.active ? "Available" : "Inactive"}
        />
      </td>
      <td className="py-3.5 px-4 text-right">
        <Link href={`/rooms/${room.id}`}>
          <ActionButton
            variant={room.active ? "soft-blue" : "secondary"}
            size="sm"
            rightIcon={<ChevronRight className="size-3.5" />}
          >
            {room.active ? "Book" : "Details"}
          </ActionButton>
        </Link>
      </td>
    </tr>
  );
}