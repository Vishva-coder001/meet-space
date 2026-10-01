"use client";

import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface XRTeleportProps {
  floorDepth: number;
  onTeleport: (destination: [number, number, number]) => void;
  enabled?: boolean;
}

export function XRTeleport({
  floorDepth,
  onTeleport,
  enabled = true,
}: XRTeleportProps) {
  const { gl, scene } = useThree();
  const [reticlePosition, setReticlePosition] = useState<[number, number, number] | null>(null);
  const [isValidTarget, setIsValidTarget] = useState(false);

  const raycasterRef = useRef(new THREE.Raycaster());
  const tempMatrix = useRef(new THREE.Matrix4());
  const targetPointRef = useRef<THREE.Vector3 | null>(null);

  // Validate that point is on walkable corridor or safe room approach
  const validateDestination = React.useCallback(
    (point: THREE.Vector3): boolean => {
      // 1. Must be near floor height
      if (Math.abs(point.y) > 0.4) return false;

      // 2. Must be within office floor boundary
      const maxZ = floorDepth / 2 - 1.2;
      if (Math.abs(point.z) > maxZ) return false;

      // 3. Must be in central corridor (|x| <= 1.8) or safe approach zone (|x| <= 2.4)
      if (Math.abs(point.x) > 2.4) return false;

      return true;
    },
    [floorDepth]
  );

  useEffect(() => {
    if (!gl.xr || !enabled) return;

    // Use controller 1 (typically left controller) for teleportation, or controller 0 on squeeze
    const teleportController = gl.xr.getController(1);
    const primaryController = gl.xr.getController(0);

    const handleSqueezeOrSelect = (event: THREE.Event) => {
      if (targetPointRef.current && isValidTarget) {
        onTeleport([
          targetPointRef.current.x,
          0,
          targetPointRef.current.z,
        ]);
        setReticlePosition(null);
        targetPointRef.current = null;
      }
    };

    teleportController.addEventListener("select", handleSqueezeOrSelect as (event: any) => void);
    teleportController.addEventListener("squeeze", handleSqueezeOrSelect as (event: any) => void);
    primaryController.addEventListener("squeeze", handleSqueezeOrSelect as (event: any) => void);

    return () => {
      teleportController.removeEventListener("select", handleSqueezeOrSelect as (event: any) => void);
      teleportController.removeEventListener("squeeze", handleSqueezeOrSelect as (event: any) => void);
      primaryController.removeEventListener("squeeze", handleSqueezeOrSelect as (event: any) => void);
    };
  }, [gl, enabled, isValidTarget, onTeleport]);

  // Per-frame raycast from left controller to detect floor destination
  useFrame(() => {
    if (!gl.xr?.isPresenting || !enabled) {
      if (reticlePosition) setReticlePosition(null);
      return;
    }

    const controller = gl.xr.getController(1);
    if (!controller) return;

    tempMatrix.current.identity().extractRotation(controller.matrixWorld);
    raycasterRef.current.ray.origin.setFromMatrixPosition(controller.matrixWorld);
    raycasterRef.current.ray.direction.set(0, 0, -1).applyMatrix4(tempMatrix.current);

    // Raycast against walkable floor objects in the scene
    const intersects = raycasterRef.current.intersectObjects(scene.children, true);
    let hitFloorPoint: THREE.Vector3 | null = null;

    for (const hit of intersects) {
      if (hit.object.userData?.isWalkableFloor) {
        hitFloorPoint = hit.point;
        break;
      }
    }

    if (hitFloorPoint && validateDestination(hitFloorPoint)) {
      targetPointRef.current = hitFloorPoint;
      setReticlePosition([hitFloorPoint.x, 0.04, hitFloorPoint.z]);
      setIsValidTarget(true);
    } else {
      targetPointRef.current = null;
      if (reticlePosition) setReticlePosition(null);
      setIsValidTarget(false);
    }
  });

  if (!reticlePosition) return null;

  return (
    <group position={reticlePosition}>
      {/* Outer Teleport Ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.3, 0.38, 32]} />
        <meshBasicMaterial
          color="#38BDF8"
          side={THREE.DoubleSide}
          transparent
          opacity={0.8}
        />
      </mesh>

      {/* Inner Target Glow Disc */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.22, 32]} />
        <meshBasicMaterial
          color="#0284C7"
          side={THREE.DoubleSide}
          transparent
          opacity={0.35}
        />
      </mesh>

      {/* Central Nav Pin */}
      <mesh position={[0, 0.05, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 0.08, 16]} />
        <meshBasicMaterial color="#38BDF8" />
      </mesh>
    </group>
  );
}
