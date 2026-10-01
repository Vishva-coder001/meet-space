"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import * as THREE from "three";

export type XRState =
  | "XR_CHECKING"
  | "XR_SUPPORTED"
  | "XR_UNSUPPORTED"
  | "XR_STARTING"
  | "XR_ACTIVE"
  | "XR_ERROR";

export function useWebXR() {
  const [xrState, setXrState] = useState<XRState>("XR_CHECKING");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const activeSessionRef = useRef<XRSession | null>(null);
  const glRef = useRef<THREE.WebGLRenderer | null>(null);

  // 1. Detect WebXR immersive-vr support
  useEffect(() => {
    let isMounted = true;

    async function checkSupport() {
      if (typeof window === "undefined" || !("xr" in navigator) || !navigator.xr) {
        if (isMounted) setXrState("XR_UNSUPPORTED");
        return;
      }

      try {
        const supported = await navigator.xr.isSessionSupported("immersive-vr");
        if (isMounted) {
          setXrState(supported ? "XR_SUPPORTED" : "XR_UNSUPPORTED");
        }
      } catch (err) {
        if (isMounted) {
          setXrState("XR_UNSUPPORTED");
        }
      }
    }

    checkSupport();

    return () => {
      isMounted = false;
      // Clean up session if component unmounts while in VR
      if (activeSessionRef.current) {
        activeSessionRef.current.end().catch(() => {});
        activeSessionRef.current = null;
      }
    };
  }, []);

  const registerGL = useCallback((gl: THREE.WebGLRenderer) => {
    glRef.current = gl;
    gl.xr.enabled = true;
  }, []);

  // 2. Request and start WebXR Immersive Session
  const enterVR = useCallback(async () => {
    if (typeof window === "undefined" || !navigator.xr || !glRef.current) {
      setXrState("XR_UNSUPPORTED");
      return;
    }

    setXrState("XR_STARTING");
    setErrorMessage(null);

    try {
      const session = await navigator.xr.requestSession("immersive-vr", {
        optionalFeatures: ["local-floor", "bounded-floor", "hand-tracking"],
      });

      activeSessionRef.current = session;
      const gl = glRef.current;
      gl.xr.enabled = true;

      session.addEventListener("end", () => {
        activeSessionRef.current = null;
        if (glRef.current) {
          glRef.current.xr.enabled = false;
        }
        setXrState("XR_SUPPORTED");
      });

      await gl.xr.setSession(session);
      setXrState("XR_ACTIVE");
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to initialize WebXR immersive session. Please check your VR headset connection.";
      setErrorMessage(message);
      setXrState("XR_ERROR");
      if (activeSessionRef.current) {
        activeSessionRef.current = null;
      }
    }
  }, []);

  // 3. Exit WebXR session
  const exitVR = useCallback(async () => {
    if (activeSessionRef.current) {
      try {
        await activeSessionRef.current.end();
      } catch {
        // ignore already ended session
      }
      activeSessionRef.current = null;
    }
    if (glRef.current) {
      glRef.current.xr.enabled = false;
    }
    setXrState("XR_SUPPORTED");
  }, []);

  return {
    xrState,
    errorMessage,
    isVRActive: xrState === "XR_ACTIVE",
    isVRSupported: xrState === "XR_SUPPORTED" || xrState === "XR_ACTIVE",
    isChecking: xrState === "XR_CHECKING",
    registerGL,
    enterVR,
    exitVR,
  };
}
