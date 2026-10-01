"use client";

import * as React from "react";
import Link from "next/link";
import { Search, X, ChevronRight, MapPin, Users } from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import { ActionButton } from "@/components/ui/action-button";
import { SectionHeader } from "@/components/ui/section-header";
import { cn } from "@/lib/utils";
import type { Room } from "@/types/domain";

interface OfficeDirectoryProps {
  rooms: Room[];
  statuses: Record<string, "AVAILABLE" | "UNAVAILABLE" | "INACTIVE" | "CHECKING">;
  selectedRoom: Room | null;
  onSelectRoom: (room: Room) => void;
}

export function OfficeDirectory({
  rooms,
  statuses,
  selectedRoom,
  onSelectRoom,
}: OfficeDirectoryProps) {
  const [search, setSearch] = React.useState("");

  const filtered = React.useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return rooms;
    return rooms.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.roomCode.toLowerCase().includes(q) ||
        (r.description || "").toLowerCase().includes(q) ||
        String(r.floor).includes(q) ||
        (r.facilities || []).some((f) => f.toLowerCase().includes(q))
    );
  }, [rooms, search]);

  return (
    <section className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <SectionHeader title="Accessible Workplace Directory" />
          <p className="text-xs text-slate-500 mt-0.5">
            Full accessible tabular view of all meeting suites and current availability.
          </p>
        </div>

        <div className="relative max-w-xs w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-slate-400" aria-hidden="true" />
          <input
            type="text"
            id="office-directory-search"
            placeholder="Search room directory…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search office directory by room name, code or facilities"
            className="w-full rounded-xl border border-line bg-paper-subtle pl-8 pr-8 py-1.5 text-xs text-ink placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-work-blue/30"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              aria-label="Clear directory search"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-ink"
            >
              <X className="size-3" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-line/80 bg-white overflow-hidden shadow-subtle-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[44rem] text-left text-sm" aria-label="Office room directory">
            <thead className="border-b border-line bg-paper-subtle text-slate-600 font-semibold text-xs uppercase tracking-wider">
              <tr>
                <th scope="col" className="py-3 px-4">Room &amp; Code</th>
                <th scope="col" className="py-3 px-4">Location</th>
                <th scope="col" className="py-3 px-4">Capacity</th>
                <th scope="col" className="py-3 px-4">Facilities</th>
                <th scope="col" className="py-3 px-4">Status</th>
                <th scope="col" className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line/60">
              {filtered.map((room) => {
                const isSelected = selectedRoom?.id === room.id;
                const status = statuses[room.id] || (room.active ? "AVAILABLE" : "INACTIVE");

                return (
                  <tr
                    key={room.id}
                    onClick={() => onSelectRoom(room)}
                    className={cn(
                      "cursor-pointer transition-colors",
                      isSelected
                        ? "bg-work-blue-50/80 border-l-4 border-l-work-blue"
                        : "hover:bg-slate-50/70",
                      !room.active && "opacity-75 bg-slate-50/40"
                    )}
                  >
                    <td className="py-3 px-4">
                      <div className="font-semibold text-ink">{room.name}</div>
                      <div className="font-mono text-xs text-work-blue mt-0.5">
                        {room.roomCode}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-xs text-slate-600">
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="size-3.5 text-work-blue/80" />
                        Floor {room.floor}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-xs text-slate-600">
                      <span className="inline-flex items-center gap-1">
                        <Users className="size-3.5 text-slate-400" />
                        {room.capacity} seats
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {(room.facilities || []).slice(0, 3).map((f) => (
                          <span
                            key={f}
                            className="text-[10px] font-medium bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded text-slate-600"
                          >
                            {f}
                          </span>
                        ))}
                        {(room.facilities || []).length > 3 && (
                          <span className="text-[10px] text-slate-400 font-mono">
                            +{room.facilities.length - 3}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge
                        status={status}
                        label={
                          status === "AVAILABLE"
                            ? "Available"
                            : status === "UNAVAILABLE"
                            ? "Occupied"
                            : status === "INACTIVE"
                            ? "Inactive"
                            : "Checking…"
                        }
                        size="sm"
                      />
                    </td>
                    <td className="py-3 px-4 text-right space-x-2" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => onSelectRoom(room)}
                        aria-label={isSelected ? `Inspecting ${room.name} on map` : `Select ${room.name} on 3D map`}
                        aria-pressed={isSelected}
                        className={cn(
                          "text-xs font-semibold px-2.5 py-1 rounded-lg border transition-all",
                          isSelected
                            ? "bg-work-blue text-white border-work-blue"
                            : "bg-paper-subtle text-slate-600 border-line hover:bg-slate-100 hover:text-ink"
                        )}
                      >
                        {isSelected ? "Inspecting" : "Select on Map"}
                      </button>
                      <Link href={`/rooms/${room.id}`}>
                        <ActionButton variant="outline" size="sm" aria-label={`View details for ${room.name}`}>
                          Details
                        </ActionButton>
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
