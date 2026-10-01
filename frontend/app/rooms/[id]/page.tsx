"use client";

import * as React from "react";
import Link from "next/link";
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
  VideoIcon,
  Presentation,
  Phone,
  Zap,
} from "lucide-react";
import { roomApi } from "@/services/rooms";
import { bookingApi } from "@/services/bookings";
import { AppShell } from "@/components/shell/app-shell";
import { ActionButton } from "@/components/ui/action-button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { cn } from "@/lib/utils";

const FACILITY_ICONS: Record<string, React.ReactNode> = {
  WiFi: <Wifi className="size-4" />,
  TV: <Monitor className="size-4" />,
  Projector: <Presentation className="size-4" />,
  Whiteboard: <Presentation className="size-4" />,
  "Video Conference": <VideoIcon className="size-4" />,
  Phone: <Phone className="size-4" />,
  Coffee: <Coffee className="size-4" />,
};

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1.5">
      {children}
    </label>
  );
}

function FieldInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="block w-full rounded-xl border border-line bg-paper-subtle px-3.5 py-2.5 text-sm text-ink placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-work-blue/30 focus:border-work-blue/50 transition-all disabled:opacity-50"
    />
  );
}

export default function RoomPage({ params }: { params: { id: string } }) {
  const qc = useQueryClient();

  const roomQuery = useQuery({
    queryKey: ["room", params.id],
    queryFn: () => roomApi.get(params.id),
  });

  const [form, setForm] = React.useState({
    bookingDate: "",
    startTime: "",
    endTime: "",
    purpose: "",
  });

  const [notice, setNotice] = React.useState<{
    type: "success" | "error" | "info";
    message: string;
  } | null>(null);

  const [showSuccessModal, setShowSuccessModal] = React.useState(false);

  const today = new Date().toISOString().slice(0, 10);

  const valid = Boolean(
    form.bookingDate &&
      form.startTime &&
      form.endTime &&
      form.purpose.trim() &&
      form.startTime < form.endTime &&
      form.bookingDate >= today
  );

  const availabilityQuery = useMutation({
    mutationFn: () =>
      bookingApi.availability(
        params.id,
        form.bookingDate,
        form.startTime,
        form.endTime
      ),
    onSuccess: (res) => {
      if (res.data?.available) {
        setNotice({ type: "success", message: "This room is available for the selected time!" });
      } else {
        setNotice({
          type: "error",
          message: "This room is already booked during the selected time. Please choose a different slot.",
        });
      }
    },
    onError: () => {
      setNotice({ type: "error", message: "Unable to check availability. Please try again." });
    },
  });

  const createMutation = useMutation({
    mutationFn: () => bookingApi.create({ roomId: params.id, ...form }),
    onSuccess: () => {
      setShowSuccessModal(true);
      setNotice(null);
      qc.invalidateQueries({ queryKey: ["bookings"] });
      qc.invalidateQueries({ queryKey: ["availability", params.id] });
    },
    onError: (e: Error) => {
      const msg =
        e.message?.includes("available")
          ? "This room is no longer available for the selected slot. Please pick another time."
          : "Unable to create booking. Please try again.";
      setNotice({ type: "error", message: msg });
    },
  });

  const isAvailable = availabilityQuery.data?.data?.available;
  const canBook = valid && isAvailable === true && !createMutation.isPending;

  const r = roomQuery.data?.data;

  if (roomQuery.isLoading) {
    return (
      <AppShell>
        <div className="max-w-3xl mx-auto space-y-4 animate-pulse">
          <div className="h-6 w-24 rounded-xl bg-slate-200" />
          <div className="h-9 w-64 rounded-xl bg-slate-200" />
          <div className="h-4 w-80 rounded-xl bg-slate-200" />
          <div className="h-48 rounded-2xl bg-slate-100 mt-6" />
        </div>
      </AppShell>
    );
  }

  if (!r) {
    return (
      <AppShell>
        <div className="max-w-3xl mx-auto text-center py-20">
          <AlertCircle className="size-12 text-slate-300 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-ink">Room not found</h1>
          <p className="mt-2 text-sm text-slate-500">
            This meeting room is unavailable or does not exist.
          </p>
          <Link href="/rooms" className="mt-6 inline-block">
            <ActionButton variant="secondary" size="md" leftIcon={<ArrowLeft className="size-4" />}>
              Back to Rooms
            </ActionButton>
          </Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto">
        {/* Back link */}
        <Link
          href="/rooms"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-work-blue transition-colors mb-5 group"
        >
          <ArrowLeft className="size-3.5 group-hover:-translate-x-0.5 transition-transform" />
          Room Directory
        </Link>

        {/* Room Header */}
        <div className="mb-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="font-mono text-xs font-bold text-work-blue bg-work-blue-50 border border-work-blue-100 px-2.5 py-1 rounded-lg">
                  {r.roomCode}
                </span>
                {r.active ? (
                  <span className="flex items-center gap-1 text-xs text-emerald-600 font-semibold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-lg">
                    <CheckCircle2 className="size-3.5" />
                    Available
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs text-slate-400 font-semibold bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-lg">
                    Inactive
                  </span>
                )}
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">{r.name}</h1>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-slate-500 font-mono">
                <span className="flex items-center gap-1.5">
                  <MapPin className="size-4 text-work-blue/70" />
                  Floor {r.floor}
                </span>
                <span>·</span>
                <span className="flex items-center gap-1.5">
                  <Users className="size-4 text-slate-400" />
                  {r.capacity} seats
                </span>
              </div>
            </div>
          </div>

          {/* Description */}
          {r.description && (
            <p className="mt-4 text-sm text-slate-600 bg-paper-subtle border border-line/60 rounded-2xl px-4 py-3 leading-relaxed">
              {r.description}
            </p>
          )}

          {/* Facilities */}
          {r.facilities && r.facilities.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {r.facilities.map((f) => (
                <span
                  key={f}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 bg-white border border-line/80 px-3 py-1.5 rounded-xl shadow-subtle-sm"
                >
                  {FACILITY_ICONS[f] || <Zap className="size-3.5 text-slate-400" />}
                  {f}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Booking Form Card */}
        <Card className={cn(!r.active && "opacity-60 pointer-events-none")}>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <CalendarDays className="size-4 text-work-blue" />
              Book This Room
            </CardTitle>
            <CardDescription>
              {r.active
                ? "Select your date, time, and meeting purpose to reserve this room."
                : "This room is currently inactive and cannot be booked."}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!valid) {
                  setNotice({
                    type: "error",
                    message: "Please fill all fields and ensure end time is after start time.",
                  });
                  return;
                }
                setNotice(null);
                createMutation.mutate();
              }}
              className="space-y-5"
            >
              {/* Date + Time Row */}
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <FieldLabel>Date</FieldLabel>
                  <FieldInput
                    type="date"
                    value={form.bookingDate}
                    min={today}
                    required
                    onChange={(e) => {
                      setForm({ ...form, bookingDate: e.target.value });
                      setNotice(null);
                      availabilityQuery.reset();
                    }}
                  />
                </div>
                <div>
                  <FieldLabel>Start Time</FieldLabel>
                  <FieldInput
                    type="time"
                    value={form.startTime}
                    required
                    onChange={(e) => {
                      setForm({ ...form, startTime: e.target.value });
                      setNotice(null);
                      availabilityQuery.reset();
                    }}
                  />
                </div>
                <div>
                  <FieldLabel>End Time</FieldLabel>
                  <FieldInput
                    type="time"
                    value={form.endTime}
                    required
                    onChange={(e) => {
                      setForm({ ...form, endTime: e.target.value });
                      setNotice(null);
                      availabilityQuery.reset();
                    }}
                  />
                </div>
              </div>

              {/* Purpose */}
              <div>
                <FieldLabel>Meeting Purpose</FieldLabel>
                <textarea
                  value={form.purpose}
                  maxLength={500}
                  required
                  rows={3}
                  placeholder="Describe the meeting purpose, agenda, or participants…"
                  onChange={(e) => setForm({ ...form, purpose: e.target.value })}
                  className="block w-full rounded-xl border border-line bg-paper-subtle px-3.5 py-2.5 text-sm text-ink placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-work-blue/30 focus:border-work-blue/50 transition-all resize-none"
                />
                <p className="mt-1 text-[11px] text-slate-400 font-mono text-right">
                  {form.purpose.length}/500
                </p>
              </div>

              {/* Availability Notice */}
              {notice && (
                <div
                  className={cn(
                    "flex items-start gap-2.5 rounded-xl border px-4 py-3 text-sm",
                    notice.type === "success"
                      ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                      : notice.type === "error"
                      ? "bg-rose-50 border-rose-200 text-rose-800"
                      : "bg-work-blue-50 border-work-blue-100 text-work-blue"
                  )}
                >
                  {notice.type === "success" ? (
                    <CheckCircle2 className="size-4 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="size-4 shrink-0 mt-0.5" />
                  )}
                  {notice.message}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 pt-1">
                <ActionButton
                  type="button"
                  variant="secondary"
                  size="md"
                  leftIcon={<Clock className="size-4" />}
                  isLoading={availabilityQuery.isPending}
                  disabled={!valid || availabilityQuery.isPending}
                  onClick={() => {
                    setNotice(null);
                    availabilityQuery.mutate();
                  }}
                >
                  {availabilityQuery.isPending ? "Checking…" : "Check Availability"}
                </ActionButton>

                <ActionButton
                  type="submit"
                  variant="primary"
                  size="md"
                  leftIcon={<CalendarDays className="size-4" />}
                  isLoading={createMutation.isPending}
                  disabled={!canBook}
                >
                  {createMutation.isPending ? "Booking…" : "Confirm Booking"}
                </ActionButton>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Booking Success Modal */}
      <Modal
        open={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Booking Confirmed!"
      >
        <div className="text-center py-2">
          <div className="mx-auto mb-4 grid size-16 place-items-center rounded-full bg-emerald-100">
            <CheckCircle2 className="size-8 text-emerald-600" />
          </div>
          <p className="text-sm text-slate-600">
            Your booking for <span className="font-semibold text-ink">{r.name}</span> on{" "}
            <span className="font-semibold text-ink">{form.bookingDate}</span> from{" "}
            <span className="font-mono font-semibold text-work-blue">
              {form.startTime} – {form.endTime}
            </span>{" "}
            has been confirmed. A confirmation email has been sent.
          </p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <Link href="/bookings">
              <ActionButton variant="primary" size="md">
                View My Bookings
              </ActionButton>
            </Link>
            <ActionButton
              variant="secondary"
              size="md"
              onClick={() => {
                setShowSuccessModal(false);
                setForm({ bookingDate: "", startTime: "", endTime: "", purpose: "" });
                availabilityQuery.reset();
              }}
            >
              Book Again
            </ActionButton>
          </div>
        </div>
      </Modal>
    </AppShell>
  );
}