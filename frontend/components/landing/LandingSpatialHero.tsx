"use client";

import * as React from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Sparkles, Users, MapPin, CheckCircle2, Clock, Glasses } from "lucide-react";

interface RoomModelProps {
  id: string;
  name: string;
  code: string;
  capacity: number;
  floor: number;
  position: [number, number, number];
  size: [number, number, number];
  status: "AVAILABLE" | "OCCUPIED" | "SELECTED";
  isHovered: boolean;
  isSelected: boolean;
  onHover: (id: string | null) => void;
  onSelect: (id: string) => void;
}

// Low-poly architectural meeting room volume
function ArchitecturalRoom({
  id,
  name,
  code,
  capacity,
  position,
  size,
  status,
  isHovered,
  isSelected,
  onHover,
  onSelect,
}: RoomModelProps) {
  const meshRef = React.useRef<THREE.Group>(null);
  const [w, h, d] = size;

  // Status color scheme
  const statusColor = React.useMemo(() => {
    if (isSelected) return "#0284C7"; // Sky / Selected
    if (status === "AVAILABLE") return "#10B981"; // Emerald / Available
    return "#F59E0B"; // Amber / Occupied
  }, [status, isSelected]);

  // Gentle subtle hover breathing animation
  useFrame((state) => {
    if (!meshRef.current) return;
    if (isHovered || isSelected) {
      const t = state.clock.getElapsedTime();
      meshRef.current.position.y = position[1] + Math.sin(t * 3) * 0.04;
    } else {
      meshRef.current.position.y = THREE.MathUtils.lerp(
        meshRef.current.position.y,
        position[1],
        0.1
      );
    }
  });

  return (
    <group
      ref={meshRef}
      position={position}
      onPointerOver={(e) => {
        e.stopPropagation();
        onHover(id);
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        onHover(null);
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(id);
      }}
    >
      {/* Room Floor Plate */}
      <mesh position={[0, 0.02, 0]} receiveShadow>
        <boxGeometry args={[w - 0.1, 0.04, d - 0.1]} />
        <meshStandardMaterial
          color={isSelected ? "#F0F9FF" : isHovered ? "#F8FAFC" : "#FFFFFF"}
          roughness={0.4}
        />
      </mesh>

      {/* Glass Perimeter Walls */}
      {/* Back Wall */}
      <mesh position={[0, h / 2, -d / 2]}>
        <boxGeometry args={[w, h, 0.08]} />
        <meshStandardMaterial
          color="#334155"
          transparent
          opacity={0.35}
          roughness={0.2}
        />
      </mesh>
      {/* Left Wall */}
      <mesh position={[-w / 2, h / 2, 0]}>
        <boxGeometry args={[0.08, h, d]} />
        <meshStandardMaterial
          color="#334155"
          transparent
          opacity={0.35}
          roughness={0.2}
        />
      </mesh>
      {/* Right Wall */}
      <mesh position={[w / 2, h / 2, 0]}>
        <boxGeometry args={[0.08, h, d]} />
        <meshStandardMaterial
          color="#334155"
          transparent
          opacity={0.35}
          roughness={0.2}
        />
      </mesh>
      {/* Front Wall with door opening */}
      <mesh position={[-w / 4, h / 2, d / 2]}>
        <boxGeometry args={[w / 2 - 0.2, h, 0.08]} />
        <meshStandardMaterial
          color="#334155"
          transparent
          opacity={0.35}
          roughness={0.2}
        />
      </mesh>

      {/* Conference Table */}
      <mesh position={[0, 0.35, 0]}>
        <boxGeometry args={[w * 0.5, 0.06, d * 0.4]} />
        <meshStandardMaterial color="#0F172A" roughness={0.3} />
      </mesh>
      {/* Table Legs */}
      <mesh position={[-w * 0.2, 0.175, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 0.35, 8]} />
        <meshStandardMaterial color="#475569" />
      </mesh>
      <mesh position={[w * 0.2, 0.175, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 0.35, 8]} />
        <meshStandardMaterial color="#475569" />
      </mesh>

      {/* Wall Corner Pillars (Dark Architectural Finish) */}
      <mesh position={[-w / 2, h / 2, -d / 2]}>
        <boxGeometry args={[0.1, h, 0.1]} />
        <meshStandardMaterial color="#1E293B" />
      </mesh>
      <mesh position={[w / 2, h / 2, -d / 2]}>
        <boxGeometry args={[0.1, h, 0.1]} />
        <meshStandardMaterial color="#1E293B" />
      </mesh>
      <mesh position={[-w / 2, h / 2, d / 2]}>
        <boxGeometry args={[0.1, h, 0.1]} />
        <meshStandardMaterial color="#1E293B" />
      </mesh>
      <mesh position={[w / 2, h / 2, d / 2]}>
        <boxGeometry args={[0.1, h, 0.1]} />
        <meshStandardMaterial color="#1E293B" />
      </mesh>

      {/* Ceiling Trim Frame */}
      <mesh position={[0, h, 0]}>
        <boxGeometry args={[w + 0.05, 0.06, d + 0.05]} />
        <meshStandardMaterial color="#0F172A" />
      </mesh>

      {/* Active Status Beacon / Ring */}
      <mesh position={[0, h + 0.25, 0]}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial
          color={statusColor}
          emissive={statusColor}
          emissiveIntensity={isHovered || isSelected ? 0.9 : 0.4}
        />
      </mesh>

      {/* Subtle selection ring on floor */}
      {(isHovered || isSelected) && (
        <mesh position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[w * 0.55, w * 0.6, 32]} />
          <meshBasicMaterial color={statusColor} transparent opacity={0.6} />
        </mesh>
      )}
    </group>
  );
}

// Camera controller with subtle mouse parallax
function SceneRig({ mousePos }: { mousePos: { x: number; y: number } }) {
  useFrame(({ camera }) => {
    // Smooth lerp camera position based on normalized mouse
    const targetX = mousePos.x * 1.5;
    const targetY = 7.5 - mousePos.y * 1.2;
    const targetZ = 10.5;

    camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetX, 0.04);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetY, 0.04);
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, 0.04);
    camera.lookAt(0, 0.5, 0);
  });
  return null;
}

const ROOMS_DATA = [
  {
    id: "dev-a-01",
    name: "Focus Room A",
    code: "DEV-A-01",
    capacity: 4,
    floor: 1,
    position: [-2.8, 0, -1.8] as [number, number, number],
    size: [2.2, 1.4, 2.0] as [number, number, number],
    status: "AVAILABLE" as const,
    facilities: ["Display", "Whiteboard", "Quiet Zone"],
  },
  {
    id: "dev-b-01",
    name: "Collab Room B",
    code: "DEV-B-01",
    capacity: 8,
    floor: 1,
    position: [2.8, 0, -1.8] as [number, number, number],
    size: [2.6, 1.4, 2.2] as [number, number, number],
    status: "OCCUPIED" as const,
    facilities: ["Video Conference", "Dual Display", "Whiteboard"],
  },
  {
    id: "dev-c-01",
    name: "Executive Boardroom",
    code: "DEV-C-01",
    capacity: 16,
    floor: 1,
    position: [-2.8, 0, 1.8] as [number, number, number],
    size: [2.8, 1.4, 2.4] as [number, number, number],
    status: "SELECTED" as const,
    facilities: ["Surround Audio", "4K Display", "Presenter Station"],
  },
  {
    id: "dev-d-01",
    name: "Innovation Hub",
    code: "DEV-D-01",
    capacity: 10,
    floor: 1,
    position: [2.8, 0, 1.8] as [number, number, number],
    size: [2.4, 1.4, 2.2] as [number, number, number],
    status: "AVAILABLE" as const,
    facilities: ["Smart Board", "Mobile Pods", "Mic Array"],
  },
];

export function LandingSpatialHero() {
  const [hoveredRoomId, setHoveredRoomId] = React.useState<string | null>(null);
  const [selectedRoomId, setSelectedRoomId] = React.useState<string>("dev-c-01");
  const [mousePos, setMousePos] = React.useState({ x: 0, y: 0 });
  const [hasWebGL, setHasWebGL] = React.useState(true);

  const containerRef = React.useRef<HTMLDivElement>(null);

  // Check WebGL support
  React.useEffect(() => {
    try {
      const canvas = document.createElement("canvas");
      const gl =
        canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
      if (!gl) setHasWebGL(false);
    } catch {
      setHasWebGL(false);
    }
  }, []);

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1;
    setMousePos({ x: nx, y: ny });
  };

  const activeRoom =
    ROOMS_DATA.find((r) => r.id === (hoveredRoomId || selectedRoomId)) ||
    ROOMS_DATA[0];

  return (
    <div
      ref={containerRef}
      onPointerMove={handlePointerMove}
      className="relative w-full h-[460px] sm:h-[520px] lg:h-[580px] rounded-3xl border border-line/80 bg-slate-900/95 overflow-hidden shadow-subtle-lg select-none"
    >
      {/* Top Architectural Blueprint Header */}
      <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2 rounded-full border border-white/10 bg-slate-900/80 px-3.5 py-1.5 backdrop-blur-md">
          <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-mono text-xs font-semibold text-slate-200">
            FLOOR 1 · SPATIAL TWIN ACTIVE
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-3 font-mono text-[11px] text-slate-400 bg-slate-900/80 px-3 py-1.5 rounded-full border border-white/10 backdrop-blur-md">
          <span>4 ROOM VOLUMES</span>
          <span>·</span>
          <span>PARALLAX NAVIGATION</span>
        </div>
      </div>

      {/* 3D Canvas Scene */}
      {hasWebGL ? (
        <Canvas
          camera={{ position: [0, 7.5, 10.5], fov: 42 }}
          className="w-full h-full cursor-grab active:cursor-grabbing"
        >
          <color attach="background" args={["#0B132B"]} />
          <ambientLight intensity={0.7} />
          <directionalLight
            position={[5, 10, 5]}
            intensity={1.2}
            castShadow
            shadow-mapSize={[1024, 1024]}
          />
          <pointLight
            position={[mousePos.x * 4, 3, 2]}
            intensity={0.8}
            color="#38BDF8"
          />

          <SceneRig mousePos={mousePos} />

          {/* Office Floor Plate */}
          <mesh position={[0, -0.05, 0]} receiveShadow>
            <boxGeometry args={[11, 0.1, 9]} />
            <meshStandardMaterial
              color="#0F172A"
              roughness={0.7}
              metalness={0.1}
            />
          </mesh>

          {/* Central Corridor Floor Inset */}
          <mesh position={[0, 0.01, 0]}>
            <boxGeometry args={[2.2, 0.02, 8.8]} />
            <meshStandardMaterial
              color="#1E293B"
              roughness={0.5}
            />
          </mesh>

          {/* Architectural Grid Lines */}
          <gridHelper
            args={[11, 22, "#1E293B", "#1E293B"]}
            position={[0, 0.02, 0]}
          />

          {/* 4 Architectural Meeting Room Volumes */}
          {ROOMS_DATA.map((room) => (
            <ArchitecturalRoom
              key={room.id}
              {...room}
              isHovered={hoveredRoomId === room.id}
              isSelected={selectedRoomId === room.id}
              onHover={setHoveredRoomId}
              onSelect={setSelectedRoomId}
            />
          ))}
        </Canvas>
      ) : (
        /* Accessible Fallback when WebGL is unavailable */
        <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-slate-900 text-white">
          <Glasses className="size-12 text-sky-400 mb-3" />
          <h3 className="text-lg font-bold">3D Architectural Workspace</h3>
          <p className="text-xs text-slate-400 max-w-sm mt-1">
            Experience real-time meeting room status and digital twin layout directly from your browser.
          </p>
        </div>
      )}

      {/* Floating Active Room HUD Card */}
      <div className="absolute bottom-4 left-4 right-4 z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-2xl border border-white/15 bg-slate-900/90 p-4 backdrop-blur-md text-white shadow-subtle-lg">
        <div className="flex items-center gap-3.5">
          <div
            className={`grid size-10 place-items-center rounded-xl font-mono text-xs font-bold ${
              activeRoom.status === "AVAILABLE"
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                : activeRoom.status === "OCCUPIED"
                ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                : "bg-sky-500/20 text-sky-400 border border-sky-500/40"
            }`}
          >
            {activeRoom.code.split("-")[1] || "RM"}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-bold text-slate-100">{activeRoom.name}</p>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                  activeRoom.status === "AVAILABLE"
                    ? "bg-emerald-500/20 text-emerald-300"
                    : activeRoom.status === "OCCUPIED"
                    ? "bg-amber-500/20 text-amber-300"
                    : "bg-sky-500/20 text-sky-300"
                }`}
              >
                {activeRoom.status}
              </span>
            </div>
            <div className="mt-0.5 flex items-center gap-3 text-xs text-slate-400 font-mono">
              <span className="flex items-center gap-1">
                <MapPin className="size-3 text-sky-400" />
                <span>Floor {activeRoom.floor}</span>
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Users className="size-3" />
                <span>{activeRoom.capacity} seats</span>
              </span>
              <span>·</span>
              <span>{activeRoom.facilities.join(", ")}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto font-mono text-[11px] text-slate-400">
          <span>Click room to select · Move mouse to orbit</span>
        </div>
      </div>
    </div>
  );
}
