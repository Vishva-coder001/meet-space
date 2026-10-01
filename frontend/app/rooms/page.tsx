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
  CheckCircle2,
  XCircle,
  ChevronRight,
  Wifi,
  Monitor,
  Coffee,
  VideoIcon,
  Presentation,
  Phone,
} from "lucide-react";
import { roomApi } from "@/services/rooms";
import { AppShell } from "@/components/shell/app-shell";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState, Skeleton } from "@/components/ui/loading-state";
import { ErrorState } from "@/components/ui/error-state";
import { cn } from "@/lib/utils";
import type { Room } from "@/types/domain";

const FACILITY_ICONS: Record<string, React.ReactNode> = {
  WiFi: <Wifi className="size-3" />,
  TV: <Monitor className="size-3" />,
  Projector: <Presentation className="size-3" />,
  Whiteboard: <Presentation className="size-3" />,
  "Video Conference": <VideoIcon className="size-3" />,
  Phone: <Phone className="size-3" />,
  Coffee: <Coffee className="size-3" />,
};

export default function RoomsPage() {
  const [search, setSearch] = React.useState("");
  const [floorFilter, setFloorFilter] = React.useState("all");
  const [capacityFilter, setCapacityFilter] = React.useState("all");
  const [activeOnly, setActiveOnly] = React.useState(false);

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
    return Array.from(set).sort();
  }, [rooms]);

  // Filtered rooms
  const filtered = React.useMemo(() => {
    return rooms.filter((r) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        r.name.toLowerCase().includes(q) ||
        r.roomCode.toLowerCase().includes(q) ||
        (r.description || "").toLowerCase().includes(q) ||
        r.facilities.some((f) => f.toLowerCase().includes(q));
      const matchFloor =
        floorFilter === "all" || String(r.floor) === floorFilter;
      const matchCapacity =
        capacityFilter === "all" ||
        (capacityFilter === "small" && r.capacity <= 6) ||
        (capacityFilter === "medium" && r.capacity > 6 && r.capacity <= 12) ||
        (capacityFilter === "large" && r.capacity > 12);
      const matchActive = !activeOnly || r.active;
      return matchSearch && matchFloor && matchCapacity && matchActive;
    });
  }, [rooms, search, floorFilter, capacityFilter, activeOnly]);

  return (
    <AppShell>
      <PageHeader
        badge="Room Directory"
        title="Meeting Rooms"
        description="Browse and book available office meeting rooms. Filter by floor, capacity, or facilities."
      />

      {/* Search & Filters Bar */}
      <div className="mb-6 rounded-2xl border border-line/80 bg-white p-4 shadow-subtle-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {/* Search input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search rooms by name, code, or facilities…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-line bg-paper-subtle pl-9 pr-3 py-2.5 text-sm text-ink placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-work-blue/30 focus:border-work-blue/50 transition-all"
            />
          </div>

          {/* Filter group */}
          <div className="flex items-center gap-2 flex-wrap">
            <SlidersHorizontal className="size-4 text-slate-400 shrink-0" />
            <select
              value={floorFilter}
              onChange={(e) => setFloorFilter(e.target.value)}
              className="rounded-xl border border-line bg-paper-subtle px-3 py-2 text-xs font-medium text-ink focus:outline-none focus:ring-2 focus:ring-work-blue/30 cursor-pointer"
            >
              <option value="all">All Floors</option>
              {floors.map((f) => (
                <option key={f} value={f}>
                  Floor {f}
                </option>
              ))}
            </select>

            <select
              value={capacityFilter}
              onChange={(e) => setCapacityFilter(e.target.value)}
              className="rounded-xl border border-line bg-paper-subtle px-3 py-2 text-xs font-medium text-ink focus:outline-none focus:ring-2 focus:ring-work-blue/30 cursor-pointer"
            >
              <option value="all">Any Capacity</option>
              <option value="small">Small (≤6)</option>
              <option value="medium">Medium (7–12)</option>
              <option value="large">Large (13+)</option>
            </select>

            <label className="flex items-center gap-1.5 text-xs font-medium text-slate-600 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={activeOnly}
                onChange={(e) => setActiveOnly(e.target.checked)}
                className="rounded border-line accent-work-blue"
              />
              Active only
            </label>
          </div>
        </div>

        {filtered.length !== rooms.length && rooms.length > 0 && (
          <p className="mt-3 text-xs font-mono text-slate-400">
            Showing {filtered.length} of {rooms.length} rooms
          </p>
        )}
      </div>

      {/* Room Grid */}
      {query.isLoading ? (
        <LoadingState message="Loading meeting rooms…" />
      ) : query.isError ? (
        <ErrorState
          message="Unable to load the room catalogue. Please try again."
          onRetry={() => query.refetch()}
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<DoorOpen className="size-6 text-slate-400" />}
          title="No rooms found"
          description={
            search
              ? `No rooms match "${search}". Try clearing the search or adjusting filters.`
              : "No rooms match the current filters."
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((room) => (
            <RoomCard key={room.id} room={room} />
          ))}
        </div>
      )}
    </AppShell>
  );
}

function RoomCard({ room }: { room: Room }) {
  return (
    <Link href={`/rooms/${room.id}`} className="group block">
      <div
        className={cn(
          "h-full rounded-2xl border bg-white p-5 shadow-subtle-sm transition-all duration-200",
          "hover:shadow-subtle-md hover:border-work-blue-300 hover:-translate-y-0.5",
          room.active ? "border-line/80" : "border-line/40 opacity-70"
        )}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <span className="font-mono text-xs font-bold text-work-blue bg-work-blue-50 border border-work-blue-100 px-2 py-0.5 rounded-lg">
            {room.roomCode}
          </span>
          <div className="flex items-center gap-2">
            {room.active ? (
              <span className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
                <CheckCircle2 className="size-3.5" />
                Active
              </span>
            ) : (
              <span className="flex items-center gap-1 text-xs text-slate-400 font-medium">
                <XCircle className="size-3.5" />
                Inactive
              </span>
            )}
          </div>
        </div>

        {/* Name */}
        <h2 className="text-base font-bold text-ink group-hover:text-work-blue transition-colors leading-snug">
          {room.name}
        </h2>

        {/* Description */}
        {room.description && (
          <p className="mt-1.5 text-xs text-slate-500 line-clamp-2 leading-relaxed">
            {room.description}
          </p>
        )}

        {/* Meta */}
        <div className="mt-3 flex items-center gap-3 text-xs text-slate-500 font-mono">
          <span className="flex items-center gap-1">
            <MapPin className="size-3.5 text-work-blue/70" />
            Floor {room.floor}
          </span>
          <span>·</span>
          <span className="flex items-center gap-1">
            <Users className="size-3.5 text-slate-400" />
            {room.capacity} seats
          </span>
        </div>

        {/* Facilities */}
        {room.facilities && room.facilities.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {room.facilities.slice(0, 5).map((f) => (
              <span
                key={f}
                className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 bg-slate-100 border border-slate-200/80 px-2 py-0.5 rounded-lg"
              >
                {FACILITY_ICONS[f] || null}
                {f}
              </span>
            ))}
            {room.facilities.length > 5 && (
              <span className="text-[11px] text-slate-400 font-mono px-1">
                +{room.facilities.length - 5} more
              </span>
            )}
          </div>
        )}

        {/* CTA Footer */}
        <div className="mt-4 pt-3 border-t border-line/60 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            {room.active ? "Available to book" : "Currently inactive"}
          </span>
          <span className="flex items-center gap-1 text-xs font-semibold text-work-blue group-hover:gap-2 transition-all">
            {room.active ? "Book room" : "View details"}
            <ChevronRight className="size-3.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}