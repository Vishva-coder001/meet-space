"use client";

import * as React from "react";
import { CalendarDays, Clock, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Scope {
  date: string;
  start: string;
  end: string;
}

interface OfficeControlsProps {
  scope: Scope;
  onChangeScope: (newScope: Scope) => void;
  isValid: boolean;
}

export function OfficeControls({
  scope,
  onChangeScope,
  isValid,
}: OfficeControlsProps) {
  const todayStr = React.useMemo(() => new Date().toISOString().slice(0, 10), []);

  const setPreset = (preset: "now" | "afternoon" | "tomorrow") => {
    if (preset === "now") {
      const now = new Date();
      const currentHour = now.getHours();
      const startH = Math.min(17, Math.max(8, currentHour));
      const endH = startH + 1;
      const startStr = `${String(startH).padStart(2, "0")}:00`;
      const endStr = `${String(endH).padStart(2, "0")}:00`;
      onChangeScope({ date: todayStr, start: startStr, end: endStr });
    } else if (preset === "afternoon") {
      onChangeScope({ date: todayStr, start: "14:00", end: "15:00" });
    } else if (preset === "tomorrow") {
      const d = new Date();
      d.setDate(d.getDate() + 1);
      const tomorrowStr = d.toISOString().slice(0, 10);
      onChangeScope({ date: tomorrowStr, start: "10:00", end: "11:00" });
    }
  };

  return (
    <div className="rounded-2xl border border-line/80 bg-white p-4 sm:p-5 shadow-subtle-sm space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-line/60 pb-3">
        <div className="flex items-center gap-2">
          <Clock className="size-4 text-work-blue" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Temporal Availability Inspector
          </span>
        </div>

        {/* Presets */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-mono text-slate-400 mr-1">Presets:</span>
          <button
            type="button"
            onClick={() => setPreset("now")}
            className="px-2.5 py-1 text-xs font-medium rounded-lg border border-line bg-paper-subtle text-slate-600 hover:bg-slate-100 transition-all"
          >
            Today Next Hr
          </button>
          <button
            type="button"
            onClick={() => setPreset("afternoon")}
            className="px-2.5 py-1 text-xs font-medium rounded-lg border border-line bg-paper-subtle text-slate-600 hover:bg-slate-100 transition-all"
          >
            2:00–3:00 PM
          </button>
          <button
            type="button"
            onClick={() => setPreset("tomorrow")}
            className="px-2.5 py-1 text-xs font-medium rounded-lg border border-line bg-paper-subtle text-slate-600 hover:bg-slate-100 transition-all"
          >
            Tomorrow 10 AM
          </button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {/* Date */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
            Inspection Date
          </label>
          <input
            type="date"
            min={todayStr}
            value={scope.date}
            onChange={(e) => onChangeScope({ ...scope, date: e.target.value })}
            className="w-full rounded-xl border border-line bg-paper-subtle px-3 py-2 text-xs font-mono text-ink focus:outline-none focus:ring-2 focus:ring-work-blue/30"
            required
          />
        </div>

        {/* Start Time */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
            Slot Start
          </label>
          <input
            type="time"
            value={scope.start}
            onChange={(e) => onChangeScope({ ...scope, start: e.target.value })}
            className="w-full rounded-xl border border-line bg-paper-subtle px-3 py-2 text-xs font-mono text-ink focus:outline-none focus:ring-2 focus:ring-work-blue/30"
            required
          />
        </div>

        {/* End Time */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
            Slot End
          </label>
          <input
            type="time"
            value={scope.end}
            onChange={(e) => onChangeScope({ ...scope, end: e.target.value })}
            className="w-full rounded-xl border border-line bg-paper-subtle px-3 py-2 text-xs font-mono text-ink focus:outline-none focus:ring-2 focus:ring-work-blue/30"
            required
          />
        </div>
      </div>

      {!isValid && (
        <p className="text-xs font-medium text-rose-600 pt-1">
          Start time must be before end time, and date cannot be in the past.
        </p>
      )}
    </div>
  );
}
