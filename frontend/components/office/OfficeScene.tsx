"use client";

import * as React from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { OfficeRoomSuite } from "./OfficeRoom";
import { XRControllers } from "./xr/XRControllers";
import { VRRoomCard } from "./xr/VRRoomCard";
import { XRTeleport } from "./xr/XRTeleport";
import { XRHelp } from "./xr/XRHelp";
import type { Room } from "@/types/domain";

interface OfficeSceneProps {
  rooms: Room[];
  statuses: Record<string, "AVAILABLE" | "UNAVAILABLE" | "INACTIVE" | "CHECKING">;
  selectedRoom: Room | null;
  onSelectRoom: (room: Room) => void;
  onNavigateRoom: (roomId: string) => void;
  onRegisterGL?: (gl: THREE.WebGLRenderer) => void;
  isVRActive?: boolean;
}

export function OfficeScene({
  rooms,
  statuses,
  selectedRoom,
  onSelectRoom,
  onNavigateRoom,
  onRegisterGL,
  isVRActive = false,
}: OfficeSceneProps) {
  const roomCount = rooms.length;
  const rowCount = Math.max(1, Math.ceil(roomCount / 2));
  const floorDepth = Math.max(16, rowCount * 5.0 + 4);
  const floorWidth = 18;

  // VR Player Rig position state (Locomotion / Teleportation)
  const [playerRigPosition, setPlayerRigPosition] = React.useState<[number, number, number]>([0, 0, 4]);

  // Reset rig position when VR session ends
  React.useEffect(() => {
    if (!isVRActive) {
      setPlayerRigPosition([0, 0, 4]);
    }
  }, [isVRActive]);

  // Find position of selected room for VR floating card
  const selectedRoomPosition = React.useMemo<[number, number, number] | null>(() => {
    if (!selectedRoom) return null;
    const idx = rooms.findIndex((r) => r.id === selectedRoom.id);
    if (idx === -1) return null;
    const isLeft = idx % 2 === 0;
    const row = Math.floor(idx / 2);
    const x = isLeft ? -4.1 : 4.1;
    const z = (row - (rowCount - 1) / 2) * 4.6;
    return [x, 0, z];
  }, [selectedRoom, rooms, rowCount]);

  // Room-focused navigation: Teleport to doorway approach position
  const handleGoToRoom = React.useCallback(
    (roomId: string) => {
      const idx = rooms.findIndex((r) => r.id === roomId);
      if (idx === -1) return;
      const isLeft = idx % 2 === 0;
      const row = Math.floor(idx / 2);
      const approachX = isLeft ? -1.6 : 1.6;
      const approachZ = (row - (rowCount - 1) / 2) * 4.6;
      setPlayerRigPosition([approachX, 0, approachZ]);
    },
    [rooms, rowCount]
  );

  return (
    <div
      className="relative w-full h-[460px] sm:h-[540px] rounded-3xl border border-line/80 bg-slate-900 overflow-hidden shadow-subtle-md"
      role="img"
      aria-label="3D Interactive Digital Office Map. Use mouse to orbit, zoom, and click meeting suites. In VR, point and trigger to teleport and inspect rooms."
    >
      <Canvas
        shadows
        camera={{ position: [14, 15, 16], fov: 42, near: 0.1, far: 100 }}
        gl={{ antialias: true, alpha: false }}
        onCreated={({ gl }) => {
          if (onRegisterGL) {
            onRegisterGL(gl);
          }
        }}
      >
        <color attach="background" args={["#0F172A"]} />

        {/* 1. Lighting Setup */}
        <ambientLight intensity={1.2} />
        <directionalLight
          position={[15, 22, 12]}
          intensity={1.8}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
          shadow-bias={-0.0001}
        />
        <hemisphereLight args={["#E0EFFB", "#1E293B", 0.6]} />
        <pointLight position={[0, 8, 0]} intensity={1.2} color="#F0F7FD" />

        {/* 2. Main Floor & Corridor Foundation (Tagged with isWalkableFloor for Teleportation) */}
        <group position={[0, 0, 0]}>
          {/* Main Floor Slab */}
          <mesh
            position={[0, -0.05, 0]}
            receiveShadow
            userData={{ isWalkableFloor: true }}
          >
            <boxGeometry args={[floorWidth, 0.1, floorDepth]} />
            <meshStandardMaterial color="#1E293B" roughness={0.8} />
          </mesh>

          {/* Central Corridor Pathway (Warm Polished Tile - Walkable) */}
          <mesh
            position={[0, 0.01, 0]}
            receiveShadow
            userData={{ isWalkableFloor: true }}
          >
            <boxGeometry args={[3.2, 0.02, floorDepth - 0.4]} />
            <meshStandardMaterial color="#334155" roughness={0.3} metalness={0.1} />
          </mesh>

          {/* Corridor Center Accent Guide Line */}
          <mesh position={[0, 0.025, 0]}>
            <boxGeometry args={[0.08, 0.01, floorDepth - 1.2]} />
            <meshStandardMaterial
              color="#38BDF8"
              emissive="#38BDF8"
              emissiveIntensity={0.5}
            />
          </mesh>
        </group>

        {/* 3. Meeting Room Suites */}
        {rooms.map((room, idx) => {
          const isLeft = idx % 2 === 0;
          const row = Math.floor(idx / 2);
          const x = isLeft ? -4.1 : 4.1;
          const z = (row - (rowCount - 1) / 2) * 4.6;
          const status = statuses[room.id] || (room.active ? "AVAILABLE" : "INACTIVE");

          return (
            <OfficeRoomSuite
              key={room.id}
              room={room}
              position={[x, 0, z]}
              isLeftWing={isLeft}
              status={status}
              isSelected={selectedRoom?.id === room.id}
              onSelect={onSelectRoom}
            />
          );
        })}

        {/* 4. WebXR In-VR Floating Room Card */}
        {selectedRoom && selectedRoomPosition && (
          <VRRoomCard
            room={selectedRoom}
            position={selectedRoomPosition}
            status={statuses[selectedRoom.id] || (selectedRoom.active ? "AVAILABLE" : "INACTIVE")}
            onBookRoom={onNavigateRoom}
            onGoToRoom={handleGoToRoom}
          />
        )}

        {/* 5. WebXR Locomotion & Teleportation System */}
        <XRTeleport
          floorDepth={floorDepth}
          onTeleport={(dest) => setPlayerRigPosition(dest)}
          enabled={isVRActive}
        />

        {/* 6. WebXR In-VR Help Controls HUD */}
        <XRHelp isVRActive={isVRActive} />

        {/* 7. WebXR Controllers & Pointer Interaction */}
        <XRControllers
          rooms={rooms}
          onSelectRoom={onSelectRoom}
        />

        {/* 8. Desktop Controls & Camera Rig (Disabled during VR session) */}
        {!isVRActive && (
          <OrbitControls
            enableDamping
            dampingFactor={0.06}
            minDistance={6}
            maxDistance={32}
            maxPolarAngle={Math.PI / 2.15}
            target={[0, 0.8, 0]}
          />
        )}
      </Canvas>

      {/* Viewport Overlay Controls Hint */}
      <div className="absolute bottom-3 left-3 bg-slate-900/85 backdrop-blur-md border border-slate-700/80 px-3 py-1.5 rounded-xl text-[11px] font-mono text-slate-300 flex items-center gap-2 select-none">
        <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
        <span>
          {isVRActive
            ? "WebXR Active · Left Trigger: Teleport · Right Trigger: Select Room"
            : "Drag to orbit · Scroll to zoom · Click room suite to inspect"}
        </span>
      </div>
    </div>
  );
}
