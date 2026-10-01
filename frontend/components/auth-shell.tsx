import * as React from "react";
import Link from "next/link";
import { Building2, CalendarDays, MapPin, Users, Glasses, Radio, Sparkles } from "lucide-react";

interface AuthShellProps {
  title: string;
  detail: string;
  children: React.ReactNode;
}

export function AuthShell({ title, detail, children }: AuthShellProps) {
  return (
    <main className="min-h-screen bg-paper text-ink flex flex-col antialiased">
      <div className="mx-auto grid min-h-screen w-full max-w-7xl lg:grid-cols-[1.1fr_.9fr]">
        {/* Left Side: Architectural Workplace Spatial Brand & Blueprint */}
        <section className="relative hidden lg:flex flex-col justify-between border-r border-line bg-slate-900 p-12 text-white overflow-hidden">
          {/* Subtle architectural grid pattern */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

          {/* Top Logo */}
          <div className="relative z-10 flex items-center justify-between">
            <Link
              href="/"
              className="inline-flex items-center gap-3 text-lg font-bold tracking-tight text-white hover:opacity-90 transition-opacity"
            >
              <span className="grid size-9 place-items-center rounded-xl bg-work-blue text-white shadow-subtle-sm font-mono text-sm">
                MS
              </span>
              <span>MeetSpace</span>
            </Link>

            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-slate-800/80 px-3 py-1 font-mono text-xs text-sky-300">
              <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>SPATIAL SYSTEM ACTIVE</span>
            </div>
          </div>

          {/* Center Brand Statement & Visual Architectural Blueprint */}
          <div className="relative z-10 my-auto py-10 max-w-lg">
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/30 bg-sky-500/10 px-3.5 py-1 text-xs font-mono text-sky-300 mb-6">
              <Sparkles className="size-3.5" />
              <span>Enterprise Room Operations</span>
            </div>
            <h1 className="text-4xl font-bold leading-tight tracking-tight text-white">
              Reserve the right room.
              <br />
              <span className="text-sky-400">Keep every team moving.</span>
            </h1>
            <p className="mt-4 text-sm leading-relaxed text-slate-300">
              Transform physical meeting spaces into an interactive spatial system with live PostgreSQL availability, WebXR virtual office locomotion, and instant STOMP updates.
            </p>

            {/* Architectural Room Blueprint Highlights */}
            <div className="mt-8 grid grid-cols-2 gap-3 font-mono text-xs text-slate-300">
              <div className="rounded-2xl border border-white/10 bg-slate-800/60 p-3.5 backdrop-blur-sm">
                <div className="flex items-center gap-2 text-sky-400 font-bold mb-1">
                  <CalendarDays className="size-4" />
                  <span>Overlap Lock</span>
                </div>
                <p className="text-[11px] text-slate-400">Zero double-bookings with exclusion constraints.</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-slate-800/60 p-3.5 backdrop-blur-sm">
                <div className="flex items-center gap-2 text-emerald-400 font-bold mb-1">
                  <Radio className="size-4" />
                  <span>Live STOMP</span>
                </div>
                <p className="text-[11px] text-slate-400">Instant WebSocket room status synchronization.</p>
              </div>
            </div>
          </div>

          {/* Bottom Security Assurance */}
          <div className="relative z-10 flex items-center justify-between text-xs text-slate-400 border-t border-white/10 pt-6 font-mono">
            <span>Secure Enterprise Authentication</span>
            <span>BCrypt · CSRF · Session Protected</span>
          </div>
        </section>

        {/* Right Side: Clean Enterprise Form */}
        <section className="flex items-center justify-center p-6 sm:p-10 lg:p-16 bg-white">
          <div className="w-full max-w-md">
            {/* Mobile Brand Logo */}
            <div className="lg:hidden mb-8">
              <Link
                href="/"
                className="inline-flex items-center gap-2.5 text-base font-bold text-ink"
              >
                <span className="grid size-8 place-items-center rounded-lg bg-work-blue text-white text-xs font-mono">
                  MS
                </span>
                <span>MeetSpace</span>
              </Link>
            </div>

            <div className="mb-6">
              <span className="font-mono text-xs font-semibold uppercase tracking-wider text-work-blue">
                Workplace Account
              </span>
              <h2 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-ink">
                {title}
              </h2>
              <p className="mt-1.5 text-sm text-slate-500">{detail}</p>
            </div>

            {children}
          </div>
        </section>
      </div>
    </main>
  );
}