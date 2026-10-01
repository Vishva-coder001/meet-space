"use client";

import * as React from "react";
import { CheckCircle2, Clock, Users, ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { ActionButton } from "@/components/ui/action-button";

interface RoomStateDemo {
  id: string;
  name: string;
  code: string;
  status: "AVAILABLE" | "OCCUPIED" | "SELECTED";
  timeSlot: string;
  occupant?: string;
  capacity: number;
}

const DEMO_ROOMS: RoomStateDemo[] = [
  {
    id: "1",
    name: "Focus Pod Alpha",
    code: "DEV-A-01",
    status: "AVAILABLE",
    timeSlot: "Now — 11:30 AM",
    capacity: 4,
  },
  {
    id: "2",
    name: "Collaboration Suite Beta",
    code: "DEV-B-01",
    status: "OCCUPIED",
    timeSlot: "10:00 — 11:30 AM",
    occupant: "Product Design Sprint",
    capacity: 8,
  },
  {
    id: "3",
    name: "Executive Boardroom",
    code: "DEV-C-01",
    status: "SELECTED",
    timeSlot: "11:30 AM — 12:30 PM",
    capacity: 16,
  },
];

export function SpatialAvailabilityDemo() {
  const [selectedState, setSelectedState] = React.useState<"ALL" | "AVAILABLE" | "OCCUPIED">("ALL");

  const filteredRooms = DEMO_ROOMS.filter((r) => {
    if (selectedState === "AVAILABLE") return r.status === "AVAILABLE";
    if (selectedState === "OCCUPIED") return r.status === "OCCUPIED";
    return true;
  });

  return (
    <section className="py-20 border-t border-line/60 bg-white/60">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <p className="font-mono text-xs uppercase tracking-wider text-work-blue font-semibold">
              Live State Synchronization
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
              Spatial Availability Engine
            </h2>
            <p className="mt-3 text-slate-500 text-sm max-w-xl">
              Every room slot transitions between states instantly across PostgreSQL constraints, WebSocket STOMP broadcast, and 3D spatial twin visualizers.
            </p>
          </div>

          {/* Interactive State Toggle Filter */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-paper-subtle border border-line" role="group" aria-label="Filter availability state preview">
            <button
              onClick={() => setSelectedState("ALL")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedState === "ALL"
                  ? "bg-white text-ink shadow-subtle-sm"
                  : "text-slate-500 hover:text-ink"
              }`}
            >
              All States
            </button>
            <button
              onClick={() => setSelectedState("AVAILABLE")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedState === "AVAILABLE"
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "text-slate-500 hover:text-ink"
              }`}
            >
              Available
            </button>
            <button
              onClick={() => setSelectedState("OCCUPIED")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedState === "OCCUPIED"
                  ? "bg-amber-50 text-amber-700 border border-amber-200"
                  : "text-slate-500 hover:text-ink"
              }`}
            >
              Occupied
            </button>
          </div>
        </div>

        {/* Structured Horizontal Availability Stream (NOT a generic card grid) */}
        <div className="rounded-3xl border border-line bg-white shadow-subtle-sm overflow-hidden divide-y divide-line/60">
          {filteredRooms.map((room) => (
            <div
              key={room.id}
              className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors hover:bg-slate-50/70"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`size-3 rounded-full shrink-0 ${
                    room.status === "AVAILABLE"
                      ? "bg-emerald-500 ring-4 ring-emerald-100"
                      : room.status === "OCCUPIED"
                      ? "bg-amber-500 ring-4 ring-amber-100"
                      : "bg-sky-500 ring-4 ring-sky-100"
                  }`}
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-500">
                      {room.code}
                    </span>
                    <span className="text-sm font-bold text-ink">{room.name}</span>
                  </div>
                  <p className="mt-0.5 text-xs text-slate-500 font-mono flex items-center gap-2">
                    <Clock className="size-3 text-slate-400" />
                    <span>{room.timeSlot}</span>
                    {room.occupant && (
                      <>
                        <span>·</span>
                        <span className="text-amber-700 font-sans font-medium">
                          {room.occupant}
                        </span>
                      </>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 self-end sm:self-auto">
                <div className="flex items-center gap-1.5 text-xs font-mono text-slate-500">
                  <Users className="size-3.5" />
                  <span>{room.capacity} seats</span>
                </div>
                <span
                  className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                    room.status === "AVAILABLE"
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : room.status === "OCCUPIED"
                      ? "bg-amber-50 text-amber-700 border border-amber-200"
                      : "bg-sky-50 text-sky-700 border border-sky-200"
                  }`}
                >
                  {room.status}
                </span>
                <Link href="/rooms">
                  <ActionButton variant="outline" size="sm">
                    View
                  </ActionButton>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
