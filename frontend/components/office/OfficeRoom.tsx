"use client";

import * as React from "react";
import { Html } from "@react-three/drei";
import { MeetingFurniture } from "./OfficeFurniture";
import type { Room } from "@/types/domain";
import { cn } from "@/lib/utils";

interface OfficeRoomProps {
  room: Room;
  position: [number, number, number];
  isLeftWing: boolean;
  status: "AVAILABLE" | "UNAVAILABLE" | "INACTIVE" | "CHECKING";
  isSelected: boolean;
  onSelect: (room: Room) => void;
}

export function OfficeRoomSuite({
  room,
  position,
  isLeftWing,
  status,
  isSelected,
  onSelect,
}: OfficeRoomProps) {
  const [hovered, setHovered] = React.useState(false);

  // Status colors & materials
  const isAvailable = status === "AVAILABLE";
  const isInactive = !room.active || status === "INACTIVE";

  const floorGlowColor = isSelected
    ? "#1F4E79"
    : hovered
    ? "#3B9FE3"
    : isAvailable
    ? "#10B981"
    : isInactive
    ? "#94A3B8"
    : "#F43F5E";

  const glassTint = isSelected
    ? "#7DC0EE"
    : isAvailable
    ? "#E0EFFB"
    : isInactive
    ? "#F1F5F9"
    : "#FFE4E6";

  const statusLabel =
    status === "AVAILABLE"
      ? "Available"
      : status === "UNAVAILABLE"
      ? "Occupied"
      : status === "INACTIVE"
      ? "Inactive"
      : "Checking…";

  const statusBg =
    status === "AVAILABLE"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : status === "UNAVAILABLE"
      ? "bg-rose-50 text-rose-700 border-rose-200"
      : status === "INACTIVE"
      ? "bg-slate-100 text-slate-600 border-slate-200"
      : "bg-amber-50 text-amber-700 border-amber-200";

  return (
    <group
      position={position}
      userData={{ roomId: room.id }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(room);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = "auto";
      }}
    >
      {/* 1. Room Floor Slab */}
      <mesh position={[0, 0.02, 0]} receiveShadow>
        <boxGeometry args={[5.0, 0.04, 3.8]} />
        <meshStandardMaterial
          color={isSelected ? "#EBF3FB" : "#F8FAFC"}
          roughness={0.4}
        />
      </mesh>

      {/* 2. Floor Perimeter Accent Border */}
      <mesh position={[0, 0.035, 0]}>
        <boxGeometry args={[5.1, 0.01, 3.9]} />
        <meshStandardMaterial
          color={floorGlowColor}
          emissive={floorGlowColor}
          emissiveIntensity={isSelected ? 0.8 : hovered ? 0.4 : 0.15}
          roughness={0.2}
        />
      </mesh>

      {/* 3. Exterior Solid Back Wall */}
      <mesh position={[isLeftWing ? -2.46 : 2.46, 1.1, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.08, 2.2, 3.8]} />
        <meshStandardMaterial color="#E2E8F0" roughness={0.7} />
      </mesh>

      {/* 4. Side Divider Walls (North & South) */}
      <mesh position={[0, 1.1, 1.86]} castShadow receiveShadow>
        <boxGeometry args={[5.0, 2.2, 0.08]} />
        <meshStandardMaterial color="#E2E8F0" roughness={0.7} />
      </mesh>
      <mesh position={[0, 1.1, -1.86]} castShadow receiveShadow>
        <boxGeometry args={[5.0, 2.2, 0.08]} />
        <meshStandardMaterial color="#E2E8F0" roughness={0.7} />
      </mesh>

      {/* 5. Corridor Glass Partition Wall with Doorway Opening */}
      {/* Corridor Wall Segment 1 */}
      <mesh
        position={[isLeftWing ? 2.46 : -2.46, 1.1, -1.0]}
        castShadow
      >
        <boxGeometry args={[0.04, 2.2, 1.7]} />
        <meshStandardMaterial
          color={glassTint}
          transparent
          opacity={0.55}
          roughness={0.1}
          metalness={0.1}
        />
      </mesh>

      {/* Corridor Wall Segment 2 */}
      <mesh
        position={[isLeftWing ? 2.46 : -2.46, 1.1, 1.0]}
        castShadow
      >
        <boxGeometry args={[0.04, 2.2, 1.7]} />
        <meshStandardMaterial
          color={glassTint}
          transparent
          opacity={0.55}
          roughness={0.1}
          metalness={0.1}
        />
      </mesh>

      {/* Doorway Header / Frame at y = 1.95 (Door opening in the middle z = 0) */}
      <mesh position={[isLeftWing ? 2.46 : -2.46, 2.05, 0]}>
        <boxGeometry args={[0.08, 0.3, 1.1]} />
        <meshStandardMaterial color="#CBD5E1" roughness={0.5} />
      </mesh>

      {/* 6. Interior Conference Furniture */}
      <MeetingFurniture
        capacity={room.capacity}
        isAvailable={isAvailable && !isInactive}
      />

      {/* 7. Floating 3D Room Signage & Status Badge */}
      <Html
        position={[0, 2.7, 0]}
        center
        distanceFactor={20}
        zIndexRange={[100, 0]}
      >
        <div
          className={cn(
            "select-none transition-all duration-200 transform pointer-events-auto cursor-pointer",
            isSelected ? "scale-110 -translate-y-1" : hovered ? "scale-105" : "scale-100"
          )}
          onClick={(e) => {
            e.stopPropagation();
            onSelect(room);
          }}
        >
          <div
            className={cn(
              "flex flex-col items-center rounded-2xl border bg-white/95 px-3.5 py-2 shadow-subtle-md backdrop-blur-md transition-colors",
              isSelected
                ? "border-work-blue ring-2 ring-work-blue/40 shadow-brand-glow"
                : hovered
                ? "border-work-blue-300"
                : "border-line/80"
            )}
          >
            {/* Header: Room Code + Name */}
            <div className="flex items-center gap-1.5 whitespace-nowrap">
              <span className="font-mono text-xs font-bold text-work-blue bg-work-blue-50 border border-work-blue-100 px-1.5 py-0.5 rounded-md">
                {room.roomCode}
              </span>
              <span className="text-xs font-bold text-ink max-w-[9rem] truncate">
                {room.name}
              </span>
            </div>

            {/* Status & Capacity row */}
            <div className="mt-1 flex items-center gap-1.5 text-[10px] font-mono">
              <span
                className={cn(
                  "inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full border font-semibold",
                  statusBg
                )}
              >
                <span
                  className={cn(
                    "size-1.5 rounded-full",
                    status === "AVAILABLE"
                      ? "bg-emerald-500"
                      : status === "UNAVAILABLE"
                      ? "bg-rose-500"
                      : "bg-slate-400"
                  )}
                />
                {statusLabel}
              </span>
              <span className="text-slate-400">{room.capacity} seats</span>
            </div>
          </div>
        </div>
      </Html>
    </group>
  );
}
