"use client";

import * as React from "react";
import * as THREE from "three";

interface FurnitureProps {
  capacity?: number;
  isAvailable?: boolean;
}

/**
 * Procedural lightweight office furniture for meeting suites
 */
export function MeetingFurniture({ capacity = 6, isAvailable = true }: FurnitureProps) {
  // Determine chair count based on room capacity (clamped between 4 and 8 for optimal visual density)
  const chairCount = Math.min(8, Math.max(4, Math.floor(capacity / 2) * 2));
  const chairsPerSide = chairCount / 2;

  return (
    <group position={[0, 0, 0]}>
      {/* 1. Conference Table */}
      <group position={[0, 0.36, 0]}>
        {/* Table Top */}
        <mesh position={[0, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.4, 0.08, 1.2]} />
          <meshStandardMaterial
            color="#2E3A4D"
            roughness={0.3}
            metalness={0.1}
          />
        </mesh>

        {/* Table Inset Cable Well */}
        <mesh position={[0, 0.045, 0]}>
          <boxGeometry args={[0.8, 0.02, 0.2]} />
          <meshStandardMaterial color="#1E293B" roughness={0.6} />
        </mesh>

        {/* Table Legs / Base */}
        <mesh position={[-0.85, -0.18, 0]}>
          <boxGeometry args={[0.1, 0.32, 0.8]} />
          <meshStandardMaterial color="#0F172A" metalness={0.7} roughness={0.2} />
        </mesh>
        <mesh position={[0.85, -0.18, 0]}>
          <boxGeometry args={[0.1, 0.32, 0.8]} />
          <meshStandardMaterial color="#0F172A" metalness={0.7} roughness={0.2} />
        </mesh>
      </group>

      {/* 2. Conference Chairs */}
      {Array.from({ length: chairsPerSide }).map((_, i) => {
        const xOffset = -0.7 + (i * 1.4) / (chairsPerSide - 1 || 1);
        return (
          <React.Fragment key={i}>
            {/* North Side Chair */}
            <Chair position={[xOffset, 0, 0.85]} rotation={[0, 0, 0]} />
            {/* South Side Chair */}
            <Chair position={[xOffset, 0, -0.85]} rotation={[0, Math.PI, 0]} />
          </React.Fragment>
        );
      })}

      {/* 3. Wall-Mounted Presentation Display (on West wall) */}
      <group position={[-2.4, 1.3, 0]}>
        {/* Screen Frame */}
        <mesh position={[0.04, 0, 0]}>
          <boxGeometry args={[0.06, 1.0, 1.8]} />
          <meshStandardMaterial color="#0F172A" roughness={0.2} metalness={0.8} />
        </mesh>
        {/* Screen Glass Display with Status Graphic */}
        <mesh position={[0.08, 0, 0]}>
          <boxGeometry args={[0.01, 0.92, 1.68]} />
          <meshStandardMaterial
            color={isAvailable ? "#0F3354" : "#451A24"}
            emissive={isAvailable ? "#1F4E79" : "#881337"}
            emissiveIntensity={0.6}
            roughness={0.2}
          />
        </mesh>
      </group>

      {/* 4. Ceiling Acoustic Lighting Fixture */}
      <mesh position={[0, 2.1, 0]}>
        <boxGeometry args={[2.0, 0.04, 0.8]} />
        <meshStandardMaterial
          color="#F8FAFC"
          emissive="#FFFFFF"
          emissiveIntensity={0.4}
          roughness={0.4}
        />
      </mesh>
    </group>
  );
}

function Chair({
  position,
  rotation,
}: {
  position: [number, number, number];
  rotation: [number, number, number];
}) {
  return (
    <group position={position} rotation={rotation}>
      {/* Chair Seat */}
      <mesh position={[0, 0.28, 0]}>
        <boxGeometry args={[0.42, 0.06, 0.42]} />
        <meshStandardMaterial color="#334155" roughness={0.5} />
      </mesh>
      {/* Chair Backrest */}
      <mesh position={[0, 0.52, 0.18]}>
        <boxGeometry args={[0.4, 0.44, 0.06]} />
        <meshStandardMaterial color="#1E293B" roughness={0.5} />
      </mesh>
      {/* Chair Stem & Star Base */}
      <mesh position={[0, 0.13, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 0.24, 8]} />
        <meshStandardMaterial color="#94A3B8" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0, 0.02, 0]}>
        <cylinderGeometry args={[0.22, 0.22, 0.03, 5]} />
        <meshStandardMaterial color="#64748B" metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  );
}
