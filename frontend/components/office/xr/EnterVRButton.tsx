"use client";

import * as React from "react";
import { Glasses, Loader2, LogOut, AlertCircle, HelpCircle } from "lucide-react";
import { ActionButton } from "@/components/ui/action-button";
import type { XRState } from "./useWebXR";
import { cn } from "@/lib/utils";

interface EnterVRButtonProps {
  xrState: XRState;
  errorMessage: string | null;
  onEnterVR: () => void;
  onExitVR: () => void;
  className?: string;
}

export function EnterVRButton({
  xrState,
  errorMessage,
  onEnterVR,
  onExitVR,
  className,
}: EnterVRButtonProps) {
  if (xrState === "XR_ACTIVE") {
    return (
      <ActionButton
        type="button"
        variant="danger"
        size="sm"
        leftIcon={<LogOut className="size-3.5" />}
        onClick={onExitVR}
        className={cn("shadow-subtle", className)}
      >
        Exit VR Session
      </ActionButton>
    );
  }

  if (xrState === "XR_STARTING") {
    return (
      <ActionButton
        type="button"
        variant="soft-blue"
        size="sm"
        isLoading
        disabled
        className={className}
      >
        Starting VR Session…
      </ActionButton>
    );
  }

  if (xrState === "XR_SUPPORTED") {
    return (
      <ActionButton
        type="button"
        variant="soft-blue"
        size="sm"
        leftIcon={<Glasses className="size-4" />}
        onClick={onEnterVR}
        className={cn("shadow-subtle hover:scale-[1.02]", className)}
      >
        Enter WebXR
      </ActionButton>
    );
  }

  if (xrState === "XR_ERROR") {
    return (
      <div className="flex items-center gap-2">
        <ActionButton
          type="button"
          variant="outline"
          size="sm"
          leftIcon={<AlertCircle className="size-3.5 text-rose-500" />}
          onClick={onEnterVR}
          className={className}
        >
          Retry VR
        </ActionButton>
      </div>
    );
  }

  if (xrState === "XR_CHECKING") {
    return (
      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-400 font-mono">
        <Loader2 className="size-3 animate-spin" />
        <span>Detecting VR…</span>
      </div>
    );
  }

  // XR_UNSUPPORTED
  return (
    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-line/60 bg-paper-subtle text-xs text-slate-400 font-mono select-none">
      <Glasses className="size-3.5 opacity-50" />
      <span>WebXR Unsupported</span>
    </div>
  );
}
