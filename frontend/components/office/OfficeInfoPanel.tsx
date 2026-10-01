"use client";

import * as React from "react";
import Link from "next/link";
import {
  MapPin,
  Users,
  CalendarDays,
  Clock,
  ChevronRight,
  Sparkles,
  Zap,
  Building2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import { ActionButton } from "@/components/ui/action-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Room } from "@/types/domain";
import type { Scope } from "./OfficeControls";

interface OfficeInfoPanelProps {
  room: Room | null;
  scope: Scope;
  status: "AVAILABLE" | "UNAVAILABLE" | "INACTIVE" | "CHECKING";
}

export function OfficeInfoPanel({
  room,
  scope,
  status,
}: OfficeInfoPanelProps) {
  if (!room) {
    return (
      <div className="h-full rounded-3xl border border-line/80 bg-white p-6 shadow-subtle-sm flex flex-col items-center justify-center text-center">
        <div className="grid size-12 place-items-center rounded-2xl bg-paper-subtle border border-line/60 text-slate-400 mb-3">
          <Building2 className="size-6" />
        </div>
        <h3 className="font-bold text-ink text-base">Select a Meeting Room</h3>
        <p className="mt-1 text-xs text-slate-500 max-w-xs leading-relaxed">
          Click any 3D meeting suite on the campus map or pick from the directory below to inspect room specifications, real-time availability, and equipment.
        </p>
      </div>
    );
  }

  const isAvailable = status === "AVAILABLE";
  const isInactive = !room.active || status === "INACTIVE";

  return (
    <div className="h-full rounded-3xl border border-line/80 bg-white p-6 shadow-subtle-sm flex flex-col justify-between space-y-4">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-line/60 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs font-bold text-work-blue bg-work-blue-50 border border-work-blue-100 px-2 py-0.5 rounded-md">
                {room.roomCode}
              </span>
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
            </div>
            <h2 className="text-xl font-bold text-ink leading-snug">{room.name}</h2>
          </div>
        </div>

        {/* Specifications */}
        <div className="grid grid-cols-2 gap-2 text-xs font-mono">
          <div className="bg-paper-subtle border border-line/60 p-2.5 rounded-xl">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
              Floor Location
            </span>
            <span className="font-semibold text-ink flex items-center gap-1 mt-0.5">
              <MapPin className="size-3.5 text-work-blue" />
              Floor {room.floor}
            </span>
          </div>

          <div className="bg-paper-subtle border border-line/60 p-2.5 rounded-xl">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
              Capacity
            </span>
            <span className="font-semibold text-ink flex items-center gap-1 mt-0.5">
              <Users className="size-3.5 text-slate-500" />
              {room.capacity} seats
            </span>
          </div>
        </div>

        {/* Inspected Time Window */}
        <div className="rounded-xl border border-line/60 bg-paper-subtle p-3 text-xs space-y-1">
          <div className="flex items-center justify-between font-mono">
            <span className="text-slate-400 uppercase text-[10px]">Inspected Window:</span>
            <span className="font-semibold text-ink">{scope.date}</span>
          </div>
          <p className="font-mono font-semibold text-work-blue">
            {scope.start} – {scope.end}
          </p>
        </div>

        {/* Description */}
        {room.description && (
          <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed bg-paper-subtle border border-line/40 rounded-xl p-3">
            {room.description}
          </p>
        )}

        {/* Facilities */}
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
            Equipped Facilities
          </span>
          {room.facilities && room.facilities.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {room.facilities.map((f) => (
                <span
                  key={f}
                  className="text-[11px] font-medium bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-lg text-slate-700"
                >
                  {f}
                </span>
              ))}
            </div>
          ) : (
            <span className="text-xs text-slate-400 italic">Standard room setup</span>
          )}
        </div>
      </div>

      {/* Action Footer */}
      <div className="border-t border-line/60 pt-4">
        {room.active ? (
          <Link href={`/rooms/${room.id}`} className="block w-full">
            <ActionButton
              variant={isAvailable ? "soft-blue" : "secondary"}
              size="md"
              className="w-full"
              rightIcon={<ChevronRight className="size-4" />}
            >
              {isAvailable ? "Book This Space" : "View Schedule & Slots"}
            </ActionButton>
          </Link>
        ) : (
          <div className="rounded-xl bg-slate-100 border border-slate-200 p-2.5 text-center text-xs text-slate-500 font-medium">
            Room Currently Inactive
          </div>
        )}
      </div>
    </div>
  );
}
