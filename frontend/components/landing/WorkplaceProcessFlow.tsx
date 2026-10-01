"use client";

import * as React from "react";
import { Compass, CheckSquare, CalendarCheck, Users, ArrowRight } from "lucide-react";

const STEPS = [
  {
    step: "01",
    title: "DISCOVER",
    subtitle: "Spatial Directory & Filters",
    description:
      "Explore meeting spaces through floor directory, capacity filters, and real-time status availability.",
    icon: Compass,
  },
  {
    step: "02",
    title: "SELECT",
    subtitle: "3D Spatial Twin or List",
    description:
      "Inspect room amenities, display equipment, whiteboard facilities, and seating configurations.",
    icon: CheckSquare,
  },
  {
    step: "03",
    title: "RESERVE",
    subtitle: "Instant Conflict Prevention",
    description:
      "Select meeting slots with database-level serialized overlap guarantees and zero double-bookings.",
    icon: CalendarCheck,
  },
  {
    step: "04",
    title: "MEET",
    subtitle: "Realtime Collaboration",
    description:
      "Automated transactional Gmail calendar alerts and live STOMP room occupancy sync across the team.",
    icon: Users,
  },
];

export function WorkplaceProcessFlow() {
  return (
    <section className="py-20 border-t border-line/60 bg-paper">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="max-w-2xl mb-14">
          <p className="font-mono text-xs uppercase tracking-wider text-work-blue font-semibold">
            Architectural Workflow
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            How MeetSpace operates
          </h2>
          <p className="mt-3 text-slate-500 text-sm leading-relaxed">
            A frictionless workflow designed for enterprise physical offices and digital twin workplaces.
          </p>
        </div>

        {/* Process Steps Connected Visual Flow */}
        <div className="relative">
          {/* Subtle connecting line for desktop */}
          <div className="hidden lg:block absolute top-12 left-8 right-8 h-0.5 bg-line z-0" />

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 relative z-10">
            {STEPS.map((s, idx) => {
              const Icon = s.icon;
              return (
                <div key={s.step} className="flex flex-col">
                  {/* Step Header Indicator */}
                  <div className="flex items-center gap-3 mb-5">
                    <div className="flex size-12 items-center justify-center rounded-2xl bg-white border border-line shadow-subtle-sm text-work-blue">
                      <Icon className="size-5" />
                    </div>
                    <span className="font-mono text-xs font-bold text-slate-400 bg-paper-subtle px-2 py-1 rounded-md border border-line">
                      STEP {s.step}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-ink tracking-tight">
                    {s.title}
                  </h3>
                  <p className="text-xs font-semibold text-work-blue font-mono mt-0.5">
                    {s.subtitle}
                  </p>
                  <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                    {s.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
