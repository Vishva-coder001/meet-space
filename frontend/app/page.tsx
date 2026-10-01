"use client";

import Link from "next/link";
import {
  Building2,
  CalendarDays,
  MapPinned,
  ArrowUpRight,
  Glasses,
  Radio,
  ShieldCheck,
  Zap,
  Clock,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Lock,
} from "lucide-react";
import { useEffect, useRef } from "react";
import { PublicNavbar } from "@/components/shell/public-navbar";
import { ActionButton } from "@/components/ui/action-button";

export default function HomePage() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0,
      x = 0.68,
      y = 0.28,
      tx = x,
      ty = y;

    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      tx = (e.clientX - r.left) / r.width;
      ty = (e.clientY - r.top) / r.height;
      if (!frame) frame = requestAnimationFrame(tick);
    };

    const tick = () => {
      x += (tx - x) * 0.08;
      y += (ty - y) * 0.08;
      el.style.setProperty("--cursor-x", `${x * 100}%`);
      el.style.setProperty("--cursor-y", `${y * 100}%`);
      if (Math.abs(tx - x) + Math.abs(ty - y) > 0.002)
        frame = requestAnimationFrame(tick);
      else frame = 0;
    };

    el.addEventListener("pointermove", move);
    return () => {
      el.removeEventListener("pointermove", move);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div className="min-h-screen bg-paper flex flex-col text-ink antialiased">
      <PublicNavbar />

      <main ref={ref} className="landing flex-1 overflow-hidden">
        {/* HERO SECTION */}
        <section className="relative z-10 mx-auto max-w-6xl px-5 pb-24 pt-16 sm:px-8 lg:pt-24">
          <div className="grid gap-12 lg:grid-cols-[1.1fr_.9fr] lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-work-blue-200/70 bg-work-blue-50 px-3.5 py-1 text-xs font-semibold font-mono text-work-blue mb-6 shadow-subtle-sm">
                <Sparkles className="size-3.5" />
                <span>Workplace Room Operating System</span>
              </div>
              <h1 className="text-4xl font-bold leading-[1.05] tracking-tight text-ink sm:text-6xl">
                Reserve the right room.
                <br />
                <span className="text-work-blue">Keep every team moving.</span>
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-600">
                Book meeting spaces with live PostgreSQL-backed availability, experience your office in immersive 3D and WebXR VR, and receive instant STOMP updates across your team.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3.5">
                <Link href="/rooms">
                  <ActionButton
                    variant="primary"
                    size="lg"
                    rightIcon={<ArrowUpRight className="size-4" />}
                  >
                    Explore Meeting Rooms
                  </ActionButton>
                </Link>
                <Link href="/office">
                  <ActionButton
                    variant="secondary"
                    size="lg"
                    leftIcon={<Glasses className="size-4 text-work-blue" />}
                  >
                    Enter 3D Digital Office
                  </ActionButton>
                </Link>
              </div>

              {/* Feature Checklist */}
              <div className="mt-10 grid grid-cols-2 gap-3 text-xs font-medium text-slate-600 sm:grid-cols-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                  <span>Zero double-bookings</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                  <span>Live WebSocket STOMP</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                  <span>WebXR VR Locomotion</span>
                </div>
              </div>
            </div>

            {/* Interactive Preview Card */}
            <div className="relative rounded-3xl border border-white/80 bg-white/75 p-6 shadow-subtle-lg backdrop-blur-md">
              <div className="flex items-center justify-between border-b border-line/60 pb-4">
                <div className="flex items-center gap-2">
                  <div className="size-3 rounded-full bg-rose-400" />
                  <div className="size-3 rounded-full bg-amber-400" />
                  <div className="size-3 rounded-full bg-emerald-400" />
                </div>
                <span className="font-mono text-xs text-slate-400">
                  Floor 1 · Live Schedule
                </span>
              </div>

              <div className="mt-5 space-y-3.5">
                <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4 transition-all hover:bg-emerald-50">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-emerald-700">
                      DEV-A-01
                    </span>
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                      Available Now
                    </span>
                  </div>
                  <p className="mt-1.5 font-semibold text-ink">Focus Room A</p>
                  <p className="text-xs text-slate-500">Floor 1 · 4 seats · Display, Whiteboard</p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-subtle-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-work-blue">
                      DEV-B-01
                    </span>
                    <span className="rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
                      Booked 11:00 - 12:00
                    </span>
                  </div>
                  <p className="mt-1.5 font-semibold text-ink">Collaboration Room B</p>
                  <p className="text-xs text-slate-500">Floor 1 · 8 seats · Video conferencing, HDMI display</p>
                </div>

                <div className="rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50/80 to-sky-50/80 p-4">
                  <div className="flex items-center gap-2 text-xs font-semibold text-work-blue">
                    <Glasses className="size-4" />
                    <span>3D Office Spatial View Ready</span>
                  </div>
                  <p className="mt-1 text-xs text-slate-600">
                    Interact directly with rooms in 3D canvas or WebXR VR headset.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CORE CAPABILITIES SECTION */}
        <section className="border-t border-line/60 bg-white/70 py-20 backdrop-blur-sm">
          <div className="mx-auto max-w-6xl px-5 sm:px-8">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <p className="font-mono text-xs uppercase tracking-wider text-work-blue font-semibold">
                Engineered for Workplaces
              </p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
                Everything required for meeting room management
              </h2>
              <p className="mt-3 text-slate-500 text-sm leading-relaxed">
                MeetSpace replaces messy calendar booking chains with guaranteed database persistence, instant realtime synchronization, and 3D spatial exploration.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {/* Feature 1 */}
              <div className="rounded-2xl border border-line/80 bg-white p-6 shadow-subtle-sm transition-all hover:shadow-subtle-md">
                <div className="flex size-10 items-center justify-center rounded-xl bg-work-blue-50 text-work-blue mb-4">
                  <CalendarDays className="size-5" />
                </div>
                <h3 className="text-base font-semibold text-ink">
                  Guaranteed Overlap Protection
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-500">
                  Serialized scheduling and PostgreSQL exclusion constraints prevent race conditions and guarantee zero double-bookings.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="rounded-2xl border border-line/80 bg-white p-6 shadow-subtle-sm transition-all hover:shadow-subtle-md">
                <div className="flex size-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 mb-4">
                  <Glasses className="size-5" />
                </div>
                <h3 className="text-base font-semibold text-ink">
                  Immersive 3D & WebXR VR
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-500">
                  Walk through your digital office in 3D canvas or jump into VR with teleport locomotion and controller ray selection.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="rounded-2xl border border-line/80 bg-white p-6 shadow-subtle-sm transition-all hover:shadow-subtle-md">
                <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 mb-4">
                  <Radio className="size-5" />
                </div>
                <h3 className="text-base font-semibold text-ink">
                  Live STOMP Synchronization
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-500">
                  Bookings and cancellations immediately publish availability events over WebSocket, keeping all browsers updated in real time.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="rounded-2xl border border-line/80 bg-white p-6 shadow-subtle-sm transition-all hover:shadow-subtle-md">
                <div className="flex size-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 mb-4">
                  <Clock className="size-5" />
                </div>
                <h3 className="text-base font-semibold text-ink">
                  Booking History & Cancellation
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-500">
                  View past, upcoming, and cancelled meetings with immutable historical logs and instant slot re-opening upon cancellation.
                </p>
              </div>

              {/* Feature 5 */}
              <div className="rounded-2xl border border-line/80 bg-white p-6 shadow-subtle-sm transition-all hover:shadow-subtle-md">
                <div className="flex size-10 items-center justify-center rounded-xl bg-sky-50 text-sky-600 mb-4">
                  <ShieldCheck className="size-5" />
                </div>
                <h3 className="text-base font-semibold text-ink">
                  Admin Operations Console
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-500">
                  Role-based administration for managing meeting rooms, facility amenities, employee directories, and organization schedules.
                </p>
              </div>

              {/* Feature 6 */}
              <div className="rounded-2xl border border-line/80 bg-white p-6 shadow-subtle-sm transition-all hover:shadow-subtle-md">
                <div className="flex size-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600 mb-4">
                  <Lock className="size-5" />
                </div>
                <h3 className="text-base font-semibold text-ink">
                  Enterprise Security
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-500">
                  BCrypt password encryption, secure session cookies, CSRF header verification, and Gmail SMTP transactional notifications.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA BANNER */}
        <section className="py-20">
          <div className="mx-auto max-w-5xl px-5 sm:px-8">
            <div className="rounded-3xl border border-work-blue-700 bg-gradient-to-br from-work-blue-800 to-work-blue p-8 sm:p-12 text-white shadow-subtle-lg">
              <div className="max-w-2xl">
                <p className="font-mono text-xs uppercase tracking-wider text-sky-300 font-semibold mb-2">
                  Ready to optimize your meetings?
                </p>
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                  Start booking meeting rooms with MeetSpace today.
                </h2>
                <p className="mt-4 text-sm text-sky-100/90 leading-relaxed">
                  Join your team workplace directory, view live availability, and reserve rooms effortlessly in 2D or 3D.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link href="/register">
                    <ActionButton
                      variant="secondary"
                      size="lg"
                      rightIcon={<ArrowRight className="size-4" />}
                      className="bg-white text-work-blue border-white hover:bg-sky-50"
                    >
                      Create Account
                    </ActionButton>
                  </Link>
                  <Link href="/login">
                    <ActionButton
                      variant="outline"
                      size="lg"
                      className="border-sky-300/40 text-white hover:bg-white/10"
                    >
                      Sign In to Workplace
                    </ActionButton>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-line/60 bg-white py-8 text-xs text-slate-500">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 sm:flex-row sm:px-8">
          <div className="flex items-center gap-2">
            <span className="font-bold text-ink">MeetSpace</span>
            <span>·</span>
            <span>Office Meeting Room Booking System</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <Link href="/rooms" className="hover:text-ink">Rooms</Link>
            <Link href="/office" className="hover:text-ink">3D Office</Link>
            <Link href="/login" className="hover:text-ink">Sign In</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}