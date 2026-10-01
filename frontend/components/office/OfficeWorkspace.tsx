"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueries } from "@tanstack/react-query";
import {
  Building2,
  CheckCircle2,
  Clock,
  Sparkles,
  Glasses,
  AlertCircle,
  Radio,
} from "lucide-react";
import { roomApi } from "@/services/rooms";
import { bookingApi } from "@/services/bookings";
import { AppShell } from "@/components/shell/app-shell";
import { PageHeader } from "@/components/ui/page-header";
import { LoadingState } from "@/components/ui/loading-state";
import { ErrorState } from "@/components/ui/error-state";
import { OfficeControls, type Scope } from "./OfficeControls";
import { OfficeScene } from "./OfficeScene";
import { OfficeInfoPanel } from "./OfficeInfoPanel";
import { OfficeDirectory } from "./OfficeDirectory";
import { useWebXR } from "./xr/useWebXR";
import { EnterVRButton } from "./xr/EnterVRButton";
import type { Room } from "@/types/domain";
import { OfficeErrorBoundary } from "./OfficeErrorBoundary";

export type RoomStatus = "AVAILABLE" | "UNAVAILABLE" | "INACTIVE" | "CHECKING";

export function OfficeWorkspace() {
  const router = useRouter();
  const todayStr = React.useMemo(() => new Date().toISOString().slice(0, 10), []);

  const [scope, setScope] = React.useState<Scope>({
    date: todayStr,
    start: "10:00",
    end: "11:00",
  });

  const [selectedRoom, setSelectedRoom] = React.useState<Room | null>(null);

  // WebXR Hook
  const {
    xrState,
    errorMessage: xrError,
    isVRActive,
    isVRSupported,
    registerGL,
    enterVR,
    exitVR,
  } = useWebXR();

  const isValidScope = Boolean(
    scope.date &&
      scope.start &&
      scope.end &&
      scope.start < scope.end &&
      scope.date >= todayStr
  );

  // 1. Fetch Room Catalogue
  const roomsQuery = useQuery({
    queryKey: ["rooms"],
    queryFn: async () => {
      const res = await roomApi.list();
      return res.data || [];
    },
  });

  const rooms: Room[] = React.useMemo(
    () => roomsQuery.data || [],
    [roomsQuery.data]
  );

  // Auto-select first room if none selected
  React.useEffect(() => {
    if (!selectedRoom && rooms.length > 0) {
      setSelectedRoom(rooms[0]);
    }
  }, [rooms, selectedRoom]);

  // 2. Individual Room Availability Queries keyed by ["availability", room.id, ...]
  // Allows granular RealtimeProvider invalidation: q.invalidateQueries({ queryKey: ["availability", r.data.roomId] })
  const availabilityQueries = useQueries({
    queries: rooms.map((room) => ({
      queryKey: ["availability", room.id, scope.date, scope.start, scope.end],
      queryFn: async () => {
        if (!room.active) {
          return { roomId: room.id, status: "INACTIVE" as RoomStatus };
        }
        try {
          const res = await bookingApi.availability(
            room.id,
            scope.date,
            scope.start,
            scope.end
          );
          return {
            roomId: room.id,
            status: res.data?.available
              ? ("AVAILABLE" as RoomStatus)
              : ("UNAVAILABLE" as RoomStatus),
          };
        } catch {
          return { roomId: room.id, status: "UNAVAILABLE" as RoomStatus };
        }
      },
      enabled: isValidScope,
      staleTime: 10 * 1000,
    })),
  });

  // Reconcile status map from individual queries
  const statuses = React.useMemo(() => {
    const map: Record<string, RoomStatus> = {};
    rooms.forEach((room, idx) => {
      const q = availabilityQueries[idx];
      if (!room.active) {
        map[room.id] = "INACTIVE";
      } else if (q?.isLoading) {
        map[room.id] = "CHECKING";
      } else if (q?.data) {
        map[room.id] = q.data.status;
      } else {
        map[room.id] = "CHECKING";
      }
    });
    return map;
  }, [rooms, availabilityQueries]);

  const handleNavigateRoom = React.useCallback(
    (roomId: string) => {
      if (isVRActive) {
        exitVR();
      }
      router.push(`/rooms/${roomId}`);
    },
    [isVRActive, exitVR, router]
  );

  // Metrics
  const availableCount = Object.values(statuses).filter(
    (s) => s === "AVAILABLE"
  ).length;
  const occupiedCount = Object.values(statuses).filter(
    (s) => s === "UNAVAILABLE"
  ).length;

  const isCheckingAny = availabilityQueries.some((q) => q.isFetching);

  return (
    <AppShell>
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <PageHeader
          badge="3D Digital Twin"
          title="Digital Workplace Office"
          description="Real-time 3D and WebXR digital twin of our office campus. Inspect room footprints, live availability states, and equipment configurations."
        />

        {/* WebXR Enter VR Control */}
        <div className="shrink-0 self-start sm:self-auto">
          <EnterVRButton
            xrState={xrState}
            errorMessage={xrError}
            onEnterVR={enterVR}
            onExitVR={exitVR}
          />
        </div>
      </div>

      {/* WebXR Error Banner if any */}
      {xrError && (
        <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-800 flex items-center gap-2">
          <AlertCircle className="size-4 shrink-0 text-rose-600" />
          <span>WebXR Session notice: {xrError}. Desktop 3D visualization remains active.</span>
        </div>
      )}

      {/* Campus Overview Metrics Bar */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <div className="rounded-2xl border border-line/80 bg-white p-4 shadow-subtle-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Suites</span>
            <Building2 className="size-4 text-work-blue/80" />
          </div>
          <div className="text-2xl font-bold font-mono text-ink">{rooms.length}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Campus footprint</div>
        </div>

        <div className="rounded-2xl border border-line/80 bg-white p-4 shadow-subtle-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Available Now</span>
            <CheckCircle2 className="size-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-600">
            {isCheckingAny && availableCount === 0 ? "—" : availableCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">In inspected window</div>
        </div>

        <div className="rounded-2xl border border-line/80 bg-white p-4 shadow-subtle-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Occupied</span>
            <Clock className="size-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-ink">
            {isCheckingAny && occupiedCount === 0 ? "—" : occupiedCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Reserved slots</div>
        </div>

        <div className="rounded-2xl border border-line/80 bg-white p-4 shadow-subtle-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Realtime Link</span>
            <Radio className="size-4 text-emerald-600" />
          </div>
          <div className="text-sm font-semibold text-ink flex items-center gap-1.5 pt-1">
            <span
              className={`size-2 rounded-full ${
                isCheckingAny
                  ? "bg-amber-500 animate-spin"
                  : "bg-emerald-500 animate-pulse"
              }`}
            />
            {isCheckingAny ? "Syncing Event…" : "STOMP Live"}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {isVRActive ? "WebXR Immersive" : "Live reactive twin"}
          </div>
        </div>
      </div>

      {/* Time & Date Scope Controls */}
      <div className="mb-6">
        <OfficeControls
          scope={scope}
          onChangeScope={setScope}
          isValid={isValidScope}
        />
      </div>

      {/* Main 3D Office + Info Panel Split */}
      {roomsQuery.isLoading ? (
        <LoadingState message="Loading 3D digital workplace twin and room specifications…" />
      ) : roomsQuery.isError ? (
        <ErrorState
          message="Unable to load workplace room catalogue. Please try again."
          onRetry={() => roomsQuery.refetch()}
        />
      ) : rooms.length === 0 ? (
        <div className="rounded-3xl border border-line/80 bg-white p-10 text-center text-slate-500">
          No meeting rooms are configured in the campus directory.
        </div>
      ) : (
        <div className="space-y-8">
          <OfficeErrorBoundary>
            <div className="grid gap-6 lg:grid-cols-12 items-stretch">
              {/* 3D Scene Viewport (8 cols) */}
              <div className="lg:col-span-8">
                <OfficeScene
                  rooms={rooms}
                  statuses={statuses}
                  selectedRoom={selectedRoom}
                  onSelectRoom={(r) => setSelectedRoom(r)}
                  onNavigateRoom={handleNavigateRoom}
                  onRegisterGL={registerGL}
                  isVRActive={isVRActive}
                />
              </div>

              {/* Room Inspection Panel (4 cols) */}
              <div className="lg:col-span-4">
                <OfficeInfoPanel
                  room={selectedRoom}
                  scope={scope}
                  status={
                    selectedRoom
                      ? statuses[selectedRoom.id] ||
                        (selectedRoom.active ? "AVAILABLE" : "INACTIVE")
                      : "CHECKING"
                  }
                />
              </div>
            </div>
          </OfficeErrorBoundary>

          {/* Accessible Room Directory — always rendered */}
          <OfficeDirectory
            rooms={rooms}
            statuses={statuses}
            selectedRoom={selectedRoom}
            onSelectRoom={(r) => setSelectedRoom(r)}
          />
        </div>
      )}
    </AppShell>
  );
}
