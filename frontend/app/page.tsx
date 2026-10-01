"use client";

import * as React from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
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
  Layers,
  Compass,
} from "lucide-react";
import { PublicNavbar } from "@/components/shell/public-navbar";
import { ActionButton } from "@/components/ui/action-button";
import { SpatialAvailabilityDemo } from "@/components/landing/SpatialAvailabilityDemo";
import { WorkplaceProcessFlow } from "@/components/landing/WorkplaceProcessFlow";

// Dynamically import the Three.js spatial hero with no SSR for optimal performance
const LandingSpatialHero = dynamic(
  () =>
    import("@/components/landing/LandingSpatialHero").then(
      (mod) => mod.LandingSpatialHero
    ),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[460px] sm:h-[520px] lg:h-[580px] rounded-3xl border border-line bg-slate-900/90 animate-pulse flex flex-col items-center justify-center text-slate-400">
        <Glasses className="size-10 text-sky-400 animate-bounce mb-3" />
        <span className="font-mono text-xs text-slate-300">
          Loading 3D Spatial Environment...
        </span>
      </div>
    ),
  }
);

export default function HomePage() {
  return (
    <div className="min-h-screen bg-paper flex flex-col text-ink antialiased">
      <PublicNavbar />

      <main className="flex-1 overflow-hidden">
        {/* EDITORIAL HERO SECTION */}
        <section className="relative z-10 mx-auto max-w-6xl px-5 pt-12 pb-16 sm:px-8 lg:pt-16">
          {/* Headline & Concise Statement */}
          <div className="max-w-3xl mb-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-work-blue-200/70 bg-work-blue-50 px-3.5 py-1 text-xs font-semibold font-mono text-work-blue mb-4 shadow-subtle-sm">
              <Sparkles className="size-3.5" />
              <span>Enterprise Spatial Workplace</span>
            </div>
            <h1 className="text-4xl font-bold leading-[1.08] tracking-tight text-ink sm:text-6xl">
              Your workplace,
              <br />
              <span className="text-work-blue">intelligently mapped.</span>
            </h1>
            <p className="mt-4 max-w-2xl text-base sm:text-lg leading-relaxed text-slate-600">
              Transform physical meeting spaces into an interactive spatial system. Real-time PostgreSQL availability, WebXR virtual office locomotion, and instant STOMP team synchronization.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3.5">
              <Link href="/rooms">
                <ActionButton
                  variant="primary"
                  size="lg"
                  rightIcon={<ArrowUpRight className="size-4" />}
                >
                  Explore Workspace
                </ActionButton>
              </Link>
              <Link href="/office">
                <ActionButton
                  variant="secondary"
                  size="lg"
                  leftIcon={<Glasses className="size-4 text-work-blue" />}
                >
                  Open 3D Digital Twin
                </ActionButton>
              </Link>
            </div>
          </div>

          {/* Three.js React Three Fiber Spatial Hero */}
          <div className="mt-2">
            <LandingSpatialHero />
          </div>
        </section>

        {/* SPATIAL AVAILABILITY ENGINE */}
        <SpatialAvailabilityDemo />

        {/* WORKPLACE PROCESS FLOW (DISCOVER -> SELECT -> RESERVE -> MEET) */}
        <WorkplaceProcessFlow />

        {/* DIGITAL WORKPLACE & WEBXR CONNECTION */}
        <section className="py-20 border-t border-line/60 bg-white">
          <div className="mx-auto max-w-6xl px-5 sm:px-8">
            <div className="grid gap-12 lg:grid-cols-[1.1fr_.9fr] lg:items-center">
              <div>
                <p className="font-mono text-xs uppercase tracking-wider text-work-blue font-semibold">
                  Spatial Digital Twin
                </p>
                <h2 className="mt-2 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
                  Step inside your office in 3D & WebXR VR
                </h2>
                <p className="mt-4 text-sm sm:text-base leading-relaxed text-slate-600">
                  MeetSpace connects physical rooms directly with digital twins. Inspect room amenities in a full 3D interactive viewport or put on a WebXR VR headset to teleport through corridors and book rooms with controller ray pointers.
                </p>

                <div className="mt-8 space-y-4">
                  <div className="flex items-start gap-3.5">
                    <div className="grid size-8 place-items-center rounded-lg bg-work-blue-50 text-work-blue shrink-0">
                      <Glasses className="size-4" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-ink">WebXR Locomotion</p>
                      <p className="text-xs text-slate-500">
                        Smooth teleportation, controller pointer selection, and VR room status cards.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5">
                    <div className="grid size-8 place-items-center rounded-lg bg-emerald-50 text-emerald-600 shrink-0">
                      <Radio className="size-4" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-ink">Live WebSocket Sync</p>
                      <p className="text-xs text-slate-500">
                        Room lights and beacon colors update in real time as colleagues book or check out.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5">
                    <div className="grid size-8 place-items-center rounded-lg bg-indigo-50 text-indigo-600 shrink-0">
                      <Layers className="size-4" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-ink">Accessible 2D Fallback</p>
                      <p className="text-xs text-slate-500">
                        Complete screen-reader directory table and keyboard navigation for full WCAG AA compliance.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-8">
                  <Link href="/office">
                    <ActionButton
                      variant="primary"
                      size="md"
                      rightIcon={<ArrowRight className="size-4" />}
                    >
                      Launch Office Workspace
                    </ActionButton>
                  </Link>
                </div>
              </div>

              {/* Architectural Blueprint Visual Card */}
              <div className="rounded-3xl border border-line bg-slate-900 p-6 text-white shadow-subtle-lg">
                <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-5 font-mono text-xs text-slate-400">
                  <span className="text-sky-400">OFFICE_WORKSPACE.V2</span>
                  <span>IMMERSIVE MODE</span>
                </div>
                <div className="space-y-4 font-mono text-xs">
                  <div className="rounded-xl border border-white/10 bg-slate-800/80 p-4">
                    <p className="text-sky-300 font-bold">VR Headset Compatibility</p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Meta Quest 2/3/Pro, Apple Vision Pro (WebXR), HTC Vive, Desktop Chrome & Edge WebXR.
                    </p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-slate-800/80 p-4">
                    <p className="text-emerald-300 font-bold">STOMP Protocol Connection</p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Topic subscriptions: <span className="text-slate-200">/topic/rooms</span> & <span className="text-slate-200">/topic/bookings</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FINAL RESTRAINED PRODUCT CTA */}
        <section className="py-20 bg-paper">
          <div className="mx-auto max-w-5xl px-5 sm:px-8">
            <div className="rounded-3xl border border-work-blue-700 bg-gradient-to-br from-work-blue-900 via-work-blue-800 to-work-blue p-8 sm:p-12 text-white shadow-subtle-lg">
              <div className="max-w-2xl">
                <p className="font-mono text-xs uppercase tracking-wider text-sky-300 font-semibold mb-2">
                  Ready to optimize your meetings?
                </p>
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                  Transform your workplace with MeetSpace.
                </h2>
                <p className="mt-3 text-sm text-sky-100/90 leading-relaxed">
                  Join your organization directory, view live availability, and reserve meeting spaces effortlessly.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link href="/register">
                    <ActionButton
                      variant="secondary"
                      size="lg"
                      rightIcon={<ArrowRight className="size-4" />}
                      className="bg-white text-work-blue border-white hover:bg-sky-50"
                    >
                      Get Started Free
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
            <span>Enterprise Office Meeting Room Booking System</span>
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