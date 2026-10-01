"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  MapPin,
  Users,
  CalendarDays,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Wifi,
  Monitor,
  Coffee,
  Video,
  Presentation,
  Phone,
  Zap,
  ChevronRight,
  ShieldCheck,
  Building2,
  Sparkles,
  ArrowRight,
  Info,
  Check,
  AlertTriangle,
  RotateCcw,
} from "lucide-react";
import { roomApi } from "@/services/rooms";
import { bookingApi } from "@/services/bookings";
import { AppShell } from "@/components/shell/app-shell";
import { ActionButton } from "@/components/ui/action-button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Modal } from "@/components/ui/modal";
import { LoadingState } from "@/components/ui/loading-state";
import { ErrorState } from "@/components/ui/error-state";
import { cn } from "@/lib/utils";
import type { Room } from "@/types/domain";

const FACILITY_ICONS: Record<string, React.ReactNode> = {
  WiFi: <Wifi className="size-4" />,
  TV: <Monitor className="size-4" />,
  Projector: <Presentation className="size-4" />,
  Whiteboard: <Presentation className="size-4" />,
  "Video Conference": <Video className="size-4" />,
  Phone: <Phone className="size-4" />,
  Coffee: <Coffee className="size-4" />,
};

// Standard business hours slots for timeline checking (08:00 - 18:00)
const TIMELINE_SLOTS = [
  { start: "08:00", end: "09:00", label: "08:00 – 09:00" },
  { start: "09:00", end: "10:00", label: "09:00 – 10:00" },
  { start: "10:00", end: "11:00", label: "10:00 – 11:00" },
  { start: "11:00", end: "12:00", label: "11:00 – 12:00" },
  { start: "12:00", end: "13:00", label: "12:00 – 13:00" },
  { start: "13:00", end: "14:00", label: "13:00 – 14:00" },
  { start: "14:00", end: "15:00", label: "14:00 – 15:00" },
  { start: "15:00", end: "16:00", label: "15:00 – 16:00" },
  { start: "16:00", end: "17:00", label: "16:00 – 17:00" },
  { start: "17:00", end: "18:00", label: "17:00 – 18:00" },
];

function formatDuration(startTime: string, endTime: string): string {
  if (!startTime || !endTime || startTime >= endTime) return "";
  const [sH, sM] = startTime.split(":").map(Number);
  const [eH, eM] = endTime.split(":").map(Number);
  const totalMins = eH * 60 + eM - (sH * 60 + sM);
  if (totalMins <= 0) return "";
  const hours = Math.floor(totalMins / 60);
  const mins = totalMins % 60;
  if (hours > 0 && mins > 0) return `${hours} hr ${mins} min`;
  if (hours > 0) return `${hours} hr${hours > 1 ? "s" : ""}`;
  return `${mins} min`;
}

function formatDateDisplay(dateStr: string): string {
  if (!dateStr) return "";
  try {
    const [y, m, d] = dateStr.split("-").map(Number);
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export default function RoomDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const qc = useQueryClient();

  // Step state: 1 (Overview), 2 (Date & Time/Slots), 3 (Review & Confirm)
  const [activeStep, setActiveStep] = React.useState<number>(1);

  const todayStr = React.useMemo(() => new Date().toISOString().slice(0, 10), []);

  const [bookingDate, setBookingDate] = React.useState(todayStr);
  const [startTime, setStartTime] = React.useState("09:00");
  const [endTime, setEndTime] = React.useState("10:00");
  const [purpose, setPurpose] = React.useState("");

  const [conflictError, setConflictError] = React.useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = React.useState(false);

  // 1. Fetch Room Details
  const roomQuery = useQuery({
    queryKey: ["room", params.id],
    queryFn: async () => {
      const res = await roomApi.get(params.id);
      return res.data;
    },
  });

  const room: Room | undefined = roomQuery.data;

  // 2. Fetch Timeline Availability Slots for chosen date
  // Keyed under ["availability", params.id, bookingDate] so RealtimeProvider invalidations hit it!
  const timelineQuery = useQuery({
    queryKey: ["availability", params.id, "timeline", bookingDate],
    queryFn: async () => {
      if (!params.id || !bookingDate) return [];
      const checks = await Promise.all(
        TIMELINE_SLOTS.map(async (slot) => {
          try {
            const res = await bookingApi.availability(
              params.id,
              bookingDate,
              slot.start,
              slot.end
            );
            return {
              ...slot,
              available: res.data?.available ?? false,
            };
          } catch {
            return { ...slot, available: false };
          }
        })
      );
      return checks;
    },
    enabled: Boolean(params.id && bookingDate && room?.active),
  });

  // 3. Precise Slot Availability Query for user-selected custom time range
  const rangeCheckQuery = useQuery({
    queryKey: [
      "availability",
      params.id,
      "range",
      bookingDate,
      startTime,
      endTime,
    ],
    queryFn: async () => {
      if (!params.id || !bookingDate || !startTime || !endTime || startTime >= endTime) {
        return null;
      }
      const res = await bookingApi.availability(
        params.id,
        bookingDate,
        startTime,
        endTime
      );
      return res.data;
    },
    enabled: Boolean(
      params.id &&
        bookingDate &&
        startTime &&
        endTime &&
        startTime < endTime &&
        room?.active
    ),
  });

  // 4. Create Booking Mutation
  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await bookingApi.create({
        roomId: params.id,
        bookingDate,
        startTime,
        endTime,
        purpose: purpose.trim(),
      });
      return res.data;
    },
    onSuccess: () => {
      setConflictError(null);
      setShowSuccessModal(true);
      // Invalidate both personal bookings and room availability caches
      qc.invalidateQueries({ queryKey: ["bookings"] });
      qc.invalidateQueries({ queryKey: ["availability", params.id] });
    },
    onError: (err: Error) => {
      const msg = err.message || "";
      if (
        msg.includes("ROOM_UNAVAILABLE") ||
        msg.includes("already booked") ||
        msg.includes("available")
      ) {
        setConflictError(
          "This room is no longer available for the selected time. Another reservation may have just been confirmed."
        );
      } else {
        setConflictError(
          msg || "Unable to complete reservation. Please review details and try again."
        );
      }
      // Trigger instant cache refresh on conflict
      qc.invalidateQueries({ queryKey: ["availability", params.id] });
    },
  });

  // Date Presets
  const setDatePreset = (daysFromToday: number) => {
    const d = new Date();
    d.setDate(d.getDate() + daysFromToday);
    setBookingDate(d.toISOString().slice(0, 10));
    setConflictError(null);
  };

  const isTimeValid = Boolean(
    bookingDate &&
      startTime &&
      endTime &&
      startTime < endTime &&
      bookingDate >= todayStr
  );

  const isRangeAvailable = rangeCheckQuery.data?.available;
  const isFormValid = isTimeValid && purpose.trim().length > 0;

  if (roomQuery.isLoading) {
    return (
      <AppShell>
        <LoadingState message="Loading room specifications and real-time calendar…" />
      </AppShell>
    );
  }

  if (roomQuery.isError || !room) {
    return (
      <AppShell>
        <ErrorState
          message="Unable to locate this meeting room. It may have been archived or removed from the directory."
          onRetry={() => router.push("/rooms")}
        />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/rooms"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-work-blue transition-colors group"
          >
            <ArrowLeft className="size-4 group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to Room Directory</span>
          </Link>
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
            Realtime Availability Connected
          </div>
        </div>

        {/* Room Profile Header Card */}
        <div className="rounded-3xl border border-line/80 bg-white p-6 sm:p-8 shadow-subtle-sm space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between border-b border-line/60 pb-6">
            <div>
              <div className="flex items-center gap-2.5 mb-2">
                <span className="font-mono text-xs font-bold text-work-blue bg-work-blue-50 border border-work-blue-100 px-3 py-1 rounded-xl">
                  {room.roomCode}
                </span>
                <StatusBadge
                  status={room.active ? "ACTIVE" : "INACTIVE"}
                  label={room.active ? "Available for Booking" : "Inactive"}
                />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
                {room.name}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-xs sm:text-sm text-slate-600 font-mono">
                <span className="inline-flex items-center gap-1.5 bg-slate-100 px-3 py-1 rounded-xl">
                  <MapPin className="size-4 text-work-blue" />
                  Floor {room.floor}
                </span>
                <span className="inline-flex items-center gap-1.5 bg-slate-100 px-3 py-1 rounded-xl">
                  <Users className="size-4 text-slate-500" />
                  {room.capacity} seats capacity
                </span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="shrink-0 flex items-center gap-2">
              <Link href="/office">
                <ActionButton
                  variant="outline"
                  size="sm"
                  leftIcon={<Building2 className="size-3.5 text-work-blue" />}
                >
                  View in Digital Office
                </ActionButton>
              </Link>
            </div>
          </div>

          {/* Description */}
          {room.description && (
            <div className="text-sm text-slate-600 leading-relaxed bg-paper-subtle border border-line/60 rounded-2xl p-4">
              <p className="font-medium text-ink mb-1 text-xs uppercase tracking-wide">
                Room Description & Purpose
              </p>
              {room.description}
            </div>
          )}

          {/* Facilities Breakdown */}
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              Equipped Room Facilities
            </h2>
            {room.facilities && room.facilities.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {room.facilities.map((fac) => (
                  <div
                    key={fac}
                    className="flex items-center gap-2 text-xs font-medium text-slate-700 bg-paper-subtle border border-line/80 px-3 py-2 rounded-xl"
                  >
                    <span className="text-work-blue shrink-0">
                      {FACILITY_ICONS[fac] || <Zap className="size-4" />}
                    </span>
                    <span className="truncate">{fac}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">
                Standard conference setup. No specialized equipment specified.
              </p>
            )}
          </div>

          {/* Inactive Notice */}
          {!room.active && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-4 flex items-start gap-3 text-amber-900">
              <AlertTriangle className="size-5 shrink-0 text-amber-600 mt-0.5" />
              <div>
                <h2 className="font-semibold text-sm">Room Currently Inactive</h2>
                <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
                  This room has been temporarily deactivated by workplace operations. New reservations cannot be scheduled at this time.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* 5-Step Guided Booking Experience (Only active when room is active) */}
        {room.active ? (
          <div className="rounded-3xl border border-line/80 bg-white p-6 sm:p-8 shadow-subtle-sm space-y-6">
            {/* Step Progress Header */}
            <div className="border-b border-line/60 pb-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold font-mono uppercase tracking-wider text-work-blue bg-work-blue-50 border border-work-blue-100 px-3 py-1 rounded-xl">
                  Reservation Workflow
                </span>
                <span className="text-xs font-mono text-slate-400">
                  Step {activeStep === 1 ? "1 of 3: Date & Time" : activeStep === 2 ? "2 of 3: Review" : "3 of 3: Confirmed"}
                </span>
              </div>

              {/* Visual Step Indicator */}
              <div className="grid grid-cols-3 gap-2">
                <div
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-300",
                    activeStep >= 1 ? "bg-work-blue" : "bg-slate-200"
                  )}
                />
                <div
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-300",
                    activeStep >= 2 ? "bg-work-blue" : "bg-slate-200"
                  )}
                />
                <div
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-300",
                    activeStep >= 3 ? "bg-emerald-500" : "bg-slate-200"
                  )}
                />
              </div>
            </div>

            {/* Error / Conflict Alert Banner */}
            {conflictError && (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 flex items-start gap-3">
                <AlertCircle className="size-5 shrink-0 text-rose-600 mt-0.5" />
                <div className="flex-1">
                  <div className="font-semibold">{conflictError}</div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <ActionButton
                      variant="secondary"
                      size="sm"
                      leftIcon={<RotateCcw className="size-3.5" />}
                      onClick={() => {
                        setConflictError(null);
                        setActiveStep(1);
                        qc.invalidateQueries({ queryKey: ["availability", params.id] });
                      }}
                    >
                      Choose Another Slot
                    </ActionButton>
                    <Link href="/rooms">
                      <ActionButton variant="outline" size="sm">
                        Browse Other Rooms
                      </ActionButton>
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 1: Date & Time Selection + Visual Timeline */}
            {activeStep === 1 && (
              <div className="space-y-6">
                {/* 1. Date Selection Row */}
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                      1. Select Reservation Date
                    </label>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setDatePreset(0)}
                        className={cn(
                          "px-2.5 py-1 text-xs font-medium rounded-lg border transition-all",
                          bookingDate === todayStr
                            ? "bg-work-blue-50 border-work-blue-200 text-work-blue font-semibold"
                            : "bg-paper-subtle border-line text-slate-600 hover:bg-slate-100"
                        )}
                      >
                        Today
                      </button>
                      <button
                        type="button"
                        onClick={() => setDatePreset(1)}
                        className="px-2.5 py-1 text-xs font-medium rounded-lg border border-line bg-paper-subtle text-slate-600 hover:bg-slate-100 transition-all"
                      >
                        Tomorrow
                      </button>
                    </div>
                  </div>
                  <div className="relative">
                    <input
                      type="date"
                      min={todayStr}
                      value={bookingDate}
                      onChange={(e) => {
                        setBookingDate(e.target.value);
                        setConflictError(null);
                      }}
                      className="w-full rounded-2xl border border-line bg-paper-subtle px-4 py-3 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-work-blue/30 focus:border-work-blue/50 transition-all font-mono"
                      required
                    />
                  </div>
                </div>

                {/* 2. Visual Realtime Availability Timeline */}
                <div className="rounded-2xl border border-line/80 bg-paper-subtle p-4 sm:p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="size-4 text-work-blue" />
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                        Live Availability Timeline · {formatDateDisplay(bookingDate)}
                      </span>
                    </div>
                    {timelineQuery.isFetching && (
                      <span className="text-[11px] font-mono text-slate-400 animate-pulse">
                        Refreshing slots…
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-500">
                    Click any open slot to instantly configure your meeting hours.
                  </p>

                  {/* Hourly Slot Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
                    {timelineQuery.isLoading ? (
                      Array.from({ length: 10 }).map((_, idx) => (
                        <div
                          key={idx}
                          className="h-14 rounded-xl bg-slate-200/70 animate-pulse"
                        />
                      ))
                    ) : (
                      (timelineQuery.data || []).map((slot) => {
                        const isSelected =
                          startTime === slot.start && endTime === slot.end;
                        return (
                          <button
                            key={slot.start}
                            type="button"
                            disabled={!slot.available}
                            onClick={() => {
                              setStartTime(slot.start);
                              setEndTime(slot.end);
                              setConflictError(null);
                            }}
                            className={cn(
                              "p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all duration-150",
                              slot.available
                                ? isSelected
                                  ? "bg-work-blue text-white border-work-blue shadow-subtle ring-2 ring-work-blue/30"
                                  : "bg-white border-emerald-200/80 text-ink hover:border-emerald-500 hover:shadow-subtle-sm"
                                : "bg-slate-100/90 border-slate-200 text-slate-400 cursor-not-allowed opacity-70"
                            )}
                          >
                            <span className="text-xs font-mono font-semibold">
                              {slot.start}
                            </span>
                            <div className="flex items-center justify-between mt-1 text-[11px]">
                              {slot.available ? (
                                <span
                                  className={cn(
                                    "font-medium",
                                    isSelected ? "text-white" : "text-emerald-600"
                                  )}
                                >
                                  {isSelected ? "Selected" : "Available"}
                                </span>
                              ) : (
                                <span className="text-slate-400 font-mono">Booked</span>
                              )}
                              {slot.available && !isSelected && (
                                <span className="size-1.5 rounded-full bg-emerald-500" />
                              )}
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* 3. Custom Time & Duration Configuration */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                      Start Time
                    </label>
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => {
                        setStartTime(e.target.value);
                        setConflictError(null);
                      }}
                      className="w-full rounded-xl border border-line bg-paper-subtle px-3.5 py-2.5 text-sm font-mono text-ink focus:outline-none focus:ring-2 focus:ring-work-blue/30 transition-all"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                      End Time
                    </label>
                    <input
                      type="time"
                      value={endTime}
                      onChange={(e) => {
                        setEndTime(e.target.value);
                        setConflictError(null);
                      }}
                      className="w-full rounded-xl border border-line bg-paper-subtle px-3.5 py-2.5 text-sm font-mono text-ink focus:outline-none focus:ring-2 focus:ring-work-blue/30 transition-all"
                      required
                    />
                  </div>
                </div>

                {/* Duration & Availability Verification Feedback */}
                {isTimeValid && (
                  <div
                    className={cn(
                      "rounded-xl border p-3.5 flex items-center justify-between text-xs",
                      isRangeAvailable === true
                        ? "bg-emerald-50/80 border-emerald-200 text-emerald-900"
                        : isRangeAvailable === false
                        ? "bg-rose-50 border-rose-200 text-rose-900"
                        : "bg-paper-subtle border-line text-slate-700"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      {isRangeAvailable === true ? (
                        <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                      ) : isRangeAvailable === false ? (
                        <AlertCircle className="size-4 text-rose-600 shrink-0" />
                      ) : (
                        <Clock className="size-4 text-slate-400 shrink-0" />
                      )}
                      <span>
                        Duration: <strong>{formatDuration(startTime, endTime)}</strong> ·{" "}
                        {isRangeAvailable === true
                          ? "Slot verified as available"
                          : isRangeAvailable === false
                          ? "Slot conflict: Room is already booked for this window"
                          : "Checking slot availability…"}
                      </span>
                    </div>
                  </div>
                )}

                {/* 4. Purpose Statement */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                      2. Meeting Purpose / Agenda
                    </label>
                    <span className="text-[11px] font-mono text-slate-400">
                      {purpose.length}/500
                    </span>
                  </div>
                  <textarea
                    rows={3}
                    maxLength={500}
                    value={purpose}
                    placeholder="E.g., Weekly engineering sprint sync, Client architecture review, Product roadmap demo…"
                    onChange={(e) => setPurpose(e.target.value)}
                    className="w-full rounded-2xl border border-line bg-paper-subtle p-3.5 text-sm text-ink placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-work-blue/30 focus:border-work-blue/50 transition-all resize-none"
                    required
                  />
                </div>

                {/* Proceed Action */}
                <div className="pt-2 flex items-center justify-end">
                  <ActionButton
                    variant="soft-blue"
                    size="md"
                    rightIcon={<ArrowRight className="size-4" />}
                    disabled={!isFormValid || isRangeAvailable === false}
                    onClick={() => {
                      setConflictError(null);
                      setActiveStep(2);
                    }}
                  >
                    Review Booking Summary
                  </ActionButton>
                </div>
              </div>
            )}

            {/* STEP 2: Review Booking Summary Before Confirmation */}
            {activeStep === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-ink mb-1">
                    Review Your Reservation
                  </h2>
                  <p className="text-xs text-slate-500">
                    Please confirm your meeting details before final submission.
                  </p>
                </div>

                <div className="rounded-2xl border border-line bg-paper-subtle p-5 space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                        Space
                      </span>
                      <div className="font-bold text-ink text-base mt-0.5">
                        {room.name}
                      </div>
                      <div className="text-xs font-mono text-work-blue mt-0.5">
                        {room.roomCode} · Floor {room.floor} · {room.capacity} seats
                      </div>
                    </div>

                    <div>
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                        Date & Time
                      </span>
                      <div className="font-bold text-ink text-sm mt-0.5">
                        {formatDateDisplay(bookingDate)}
                      </div>
                      <div className="text-xs font-mono text-slate-600 mt-0.5">
                        {startTime} – {endTime} ({formatDuration(startTime, endTime)})
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-line/60 pt-3">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      Meeting Purpose
                    </span>
                    <p className="text-sm text-ink mt-1 bg-white border border-line/60 rounded-xl p-3">
                      {purpose}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-500 border-t border-line/60 pt-3">
                    <ShieldCheck className="size-4 text-work-blue" />
                    <span>Instant booking with automated confirmation email dispatch.</span>
                  </div>
                </div>

                {/* Review Step Actions */}
                <div className="flex items-center justify-between pt-2">
                  <ActionButton
                    variant="outline"
                    size="md"
                    leftIcon={<ArrowLeft className="size-4" />}
                    onClick={() => setActiveStep(1)}
                  >
                    Back to Edit
                  </ActionButton>

                  <ActionButton
                    variant="soft-blue"
                    size="md"
                    isLoading={createMutation.isPending}
                    disabled={createMutation.isPending}
                    leftIcon={<Check className="size-4" />}
                    onClick={() => createMutation.mutate()}
                  >
                    {createMutation.isPending ? "Confirming…" : "Confirm Booking"}
                  </ActionButton>
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>

      {/* Success Modal */}
      <Modal
        open={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="ROOM RESERVED"
      >
        <div className="text-center py-2 space-y-4">
          <div className="mx-auto grid size-14 place-items-center rounded-full bg-emerald-100 ring-4 ring-emerald-50">
            <CheckCircle2 className="size-8 text-emerald-600" />
          </div>

          <div>
            <span className="font-mono text-xs font-bold text-emerald-700 uppercase tracking-wider">
              ✓ Workspace confirmed
            </span>
            <h2 className="text-lg font-bold text-ink mt-1">{room.name}</h2>
            <p className="text-xs text-slate-500 font-mono mt-1">
              {formatDateDisplay(bookingDate)} · {startTime} – {endTime}
            </p>
          </div>

          <div className="rounded-2xl border border-line/80 bg-paper-subtle p-3.5 text-xs text-slate-600 text-left">
            <p className="font-semibold text-ink mb-1 font-mono text-[11px] uppercase tracking-wider">Agenda / Purpose:</p>
            <p className="line-clamp-2">{purpose}</p>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed font-mono">
            Reservation synchronized across PostgreSQL, STOMP realtime, and 3D digital office.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2.5">
            <Link href="/bookings" className="w-full sm:w-auto">
              <ActionButton variant="soft-blue" size="md" className="w-full sm:w-auto">
                View My Bookings
              </ActionButton>
            </Link>
            <Link href="/office" className="w-full sm:w-auto">
              <ActionButton variant="secondary" size="md" className="w-full sm:w-auto">
                Open Digital Office
              </ActionButton>
            </Link>
            <ActionButton
              variant="outline"
              size="md"
              className="w-full sm:w-auto"
              onClick={() => {
                setShowSuccessModal(false);
                setActiveStep(1);
                setPurpose("");
                qc.invalidateQueries({ queryKey: ["availability", params.id] });
              }}
            >
              Book Another Slot
            </ActionButton>
          </div>
        </div>
      </Modal>
    </AppShell>
  );
}