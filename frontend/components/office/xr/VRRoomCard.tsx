"use client";

import * as React from "react";
import { Html } from "@react-three/drei";
import { ChevronRight, Navigation, Users, MapPin, ExternalLink } from "lucide-react";
import type { Room } from "@/types/domain";

interface VRRoomCardProps {
  room: Room | null;
  position: [number, number, number];
  status: "AVAILABLE" | "UNAVAILABLE" | "INACTIVE" | "CHECKING";
  onBookRoom: (roomId: string) => void;
  onGoToRoom?: (roomId: string) => void;
}

export function VRRoomCard({
  room,
  position,
  status,
  onBookRoom,
  onGoToRoom,
}: VRRoomCardProps) {
  if (!room) return null;

  const isAvailable = status === "AVAILABLE";

  return (
    <group position={[position[0], position[1] + 3.4, position[2]]}>
      <Html center distanceFactor={16} zIndexRange={[120, 0]}>
        <div className="w-68 rounded-3xl border border-work-blue bg-white/95 p-4 shadow-subtle-lg backdrop-blur-md select-none text-ink pointer-events-auto">
          {/* Header */}
          <div className="flex items-start justify-between border-b border-line/60 pb-2.5">
            <div>
              <span className="font-mono text-[10px] font-bold text-work-blue bg-work-blue-50 border border-work-blue-100 px-1.5 py-0.5 rounded">
                {room.roomCode}
              </span>
              <h3 className="font-bold text-sm text-ink truncate mt-1">
                {room.name}
              </h3>
            </div>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                isAvailable
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-rose-50 text-rose-700 border-rose-200"
              }`}
            >
              {status}
            </span>
          </div>

          {/* Specs */}
          <div className="mt-2.5 flex items-center justify-between text-xs font-mono text-slate-500">
            <span className="flex items-center gap-1">
              <MapPin className="size-3 text-work-blue" />
              Floor {room.floor}
            </span>
            <span className="flex items-center gap-1">
              <Users className="size-3 text-slate-400" />
              {room.capacity} seats
            </span>
          </div>

          {/* Action Buttons: Go To Room & Exit VR & Book */}
          <div className="mt-3.5 pt-2.5 border-t border-line/60 flex flex-col gap-1.5">
            {onGoToRoom && (
              <button
                type="button"
                onClick={() => onGoToRoom(room.id)}
                className="w-full rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 py-1.5 text-xs font-semibold transition-all flex items-center justify-center gap-1.5 border border-slate-200"
              >
                <Navigation className="size-3.5 text-work-blue" />
                <span>Go To Suite Entrance</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => onBookRoom(room.id)}
              className="w-full rounded-xl bg-work-blue text-white py-1.5 text-xs font-semibold hover:bg-work-blue-600 transition-all flex items-center justify-center gap-1.5 shadow-subtle-sm"
            >
              <span>{isAvailable ? "Exit VR & Book" : "View Details"}</span>
              <ChevronRight className="size-3.5" />
            </button>
          </div>
        </div>
      </Html>
    </group>
  );
}
