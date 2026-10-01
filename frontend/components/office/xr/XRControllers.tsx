"use client";

import * as React from "react";
import { useEffect, useRef } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { Room } from "@/types/domain";

interface XRControllersProps {
  rooms: Room[];
  onSelectRoom: (room: Room) => void;
  onControllerStatusChange?: (status: {
    left: boolean;
    right: boolean;
  }) => void;
}

export function XRControllers({
  rooms,
  onSelectRoom,
  onControllerStatusChange,
}: XRControllersProps) {
  const { gl, scene } = useThree();
  const raycasterRef = useRef(new THREE.Raycaster());
  const tempMatrix = useRef(new THREE.Matrix4());

  useEffect(() => {
    if (!gl.xr) return;

    const controllerStatus = { left: false, right: false };

    function buildControllerRay(): THREE.Line {
      const geometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 0, -6),
      ]);
      const material = new THREE.LineBasicMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.75,
        linewidth: 2,
      });
      const line = new THREE.Line(geometry, material);
      line.name = "xr-ray";
      return line;
    }

    function buildReticle(): THREE.Mesh {
      const geometry = new THREE.RingGeometry(0.02, 0.04, 32);
      geometry.rotateX(-Math.PI / 2);
      const material = new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        side: THREE.DoubleSide,
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.name = "xr-reticle";
      mesh.visible = false;
      return mesh;
    }

    const controllers: THREE.XRTargetRaySpace[] = [];

    [0, 1].forEach((index) => {
      const controller = gl.xr.getController(index);
      const ray = buildControllerRay();
      controller.add(ray);
      scene.add(controller);
      controllers.push(controller);

      const onConnected = (event: THREE.Event & { data?: XRInputSource }) => {
        const handedness = event.data?.handedness;
        if (handedness === "left") controllerStatus.left = true;
        if (handedness === "right") controllerStatus.right = true;
        if (onControllerStatusChange) {
          onControllerStatusChange({ ...controllerStatus });
        }
      };

      const onDisconnected = (event: THREE.Event & { data?: XRInputSource }) => {
        const handedness = event.data?.handedness;
        if (handedness === "left") controllerStatus.left = false;
        if (handedness === "right") controllerStatus.right = false;
        if (onControllerStatusChange) {
          onControllerStatusChange({ ...controllerStatus });
        }
      };

      const onSelect = () => {
        tempMatrix.current.identity().extractRotation(controller.matrixWorld);
        raycasterRef.current.ray.origin.setFromMatrixPosition(controller.matrixWorld);
        raycasterRef.current.ray.direction.set(0, 0, -1).applyMatrix4(tempMatrix.current);

        // Raycast against all meshes in the scene
        const intersects = raycasterRef.current.intersectObjects(scene.children, true);

        for (const hit of intersects) {
          let curr: THREE.Object3D | null = hit.object;
          // Traverse up the parent chain to check if it has a room association
          while (curr && curr !== scene) {
            if (curr.userData && curr.userData.roomId) {
              const matchedRoom = rooms.find((r) => r.id === curr?.userData.roomId);
              if (matchedRoom) {
                onSelectRoom(matchedRoom);
                return;
              }
            }
            curr = curr.parent;
          }
        }
      };

      controller.addEventListener("connected", onConnected as (event: any) => void);
      controller.addEventListener("disconnected", onDisconnected as (event: any) => void);
      controller.addEventListener("select", onSelect as (event: any) => void);
    });

    return () => {
      controllers.forEach((controller) => {
        controller.children.forEach((child) => {
          if (child.name === "xr-ray") {
            controller.remove(child);
          }
        });
        scene.remove(controller);
      });
    };
  }, [gl, scene, rooms, onSelectRoom, onControllerStatusChange]);

  return null;
}
