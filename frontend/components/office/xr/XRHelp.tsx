"use client";

import * as React from "react";
import { useState } from "react";
import { Html } from "@react-three/drei";
import { X, Navigation, MousePointer, HelpCircle, Glasses } from "lucide-react";

interface XRHelpProps {
  isVRActive?: boolean;
}

export function XRHelp({ isVRActive = false }: XRHelpProps) {
  const [dismissed, setDismissed] = useState(false);

  if (!isVRActive || dismissed) return null;

  return (
    <group position={[0, 1.8, 2.5]} rotation={[-0.1, 0, 0]}>
      <Html center distanceFactor={14} zIndexRange={[150, 0]}>
        <div className="w-72 rounded-3xl border border-work-blue/60 bg-slate-900/95 p-4 text-white shadow-subtle-lg backdrop-blur-md select-none pointer-events-auto">
          <div className="flex items-center justify-between border-b border-slate-700/80 pb-2.5">
            <div className="flex items-center gap-1.5">
              <Glasses className="size-4 text-sky-400" />
              <h3 className="font-bold text-xs tracking-wide uppercase text-sky-400">
                MeetSpace VR Controls
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setDismissed(true)}
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
              aria-label="Dismiss VR Help"
            >
              <X className="size-3.5" />
            </button>
          </div>

          <div className="mt-3 space-y-2.5 text-xs">
            <div className="flex items-start gap-2.5">
              <div className="mt-0.5 grid size-5 place-items-center rounded-lg bg-sky-500/20 text-sky-400 border border-sky-500/30 shrink-0">
                <MousePointer className="size-3" />
              </div>
              <div>
                <p className="font-semibold text-slate-200">Point & Right Trigger</p>
                <p className="text-[11px] text-slate-400">
                  Select and inspect any meeting room suite.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <div className="mt-0.5 grid size-5 place-items-center rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
                <Navigation className="size-3" />
              </div>
              <div>
                <p className="font-semibold text-slate-200">Left Trigger / Squeeze</p>
                <p className="text-[11px] text-slate-400">
                  Aim at corridor floor to teleport.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-3.5 pt-2.5 border-t border-slate-700/80">
            <button
              type="button"
              onClick={() => setDismissed(true)}
              className="w-full rounded-xl bg-work-blue py-1.5 text-xs font-semibold text-white hover:bg-work-blue-600 transition-colors shadow-subtle-sm"
            >
              Got It
            </button>
          </div>
        </div>
      </Html>
    </group>
  );
}
