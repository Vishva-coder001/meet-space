"use client";

import * as React from "react";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  DoorOpen,
  PlusCircle,
  Edit2,
  AlertTriangle,
  Users,
  MapPin,
  Search,
  X,
  Check,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { adminApi, type RoomSave } from "@/services/admin";
import { StatusBadge } from "@/components/ui/status-badge";
import { ActionButton } from "@/components/ui/action-button";
import { Modal } from "@/components/ui/modal";
import { cn } from "@/lib/utils";
import type { Room } from "@/types/domain";

const BLANK_ROOM: RoomSave = {
  roomCode: "",
  name: "",
  floor: "",
  capacity: 6,
  description: "",
  facilities: ["WiFi", "TV", "Whiteboard"],
};

export function AdminRoomManager({ rooms }: { rooms: Room[] }) {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Room | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<RoomSave>(BLANK_ROOM);
  const [deactivateTarget, setDeactivateTarget] = useState<Room | null>(null);
  const [search, setSearch] = useState("");
  const [facilitiesInput, setFacilitiesInput] = useState("");

  const saveMutation = useMutation({
    mutationFn: () =>
      editing ? adminApi.updateRoom(editing.id, form) : adminApi.createRoom(form),
    onSuccess: () => {
      setEditing(null);
      setCreating(false);
      setForm(BLANK_ROOM);
      qc.invalidateQueries({ queryKey: ["rooms"] });
      qc.invalidateQueries({ queryKey: ["admin", "dashboard"] });
      qc.invalidateQueries({ queryKey: ["availability"] });
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: (id: string) => adminApi.deactivateRoom(id),
    onSuccess: () => {
      setDeactivateTarget(null);
      qc.invalidateQueries({ queryKey: ["rooms"] });
      qc.invalidateQueries({ queryKey: ["admin", "dashboard"] });
      qc.invalidateQueries({ queryKey: ["availability"] });
    },
  });

  const handleOpenModal = (room?: Room) => {
    if (room) {
      setEditing(room);
      setCreating(false);
      const roomForm: RoomSave = {
        roomCode: room.roomCode,
        name: room.name,
        floor: String(room.floor),
        capacity: room.capacity,
        description: room.description ?? "",
        facilities: room.facilities || [],
      };
      setForm(roomForm);
      setFacilitiesInput((room.facilities || []).join(", "));
    } else {
      setEditing(null);
      setCreating(true);
      setForm(BLANK_ROOM);
      setFacilitiesInput(BLANK_ROOM.facilities.join(", "));
    }
  };

  const handleFacilitiesChange = (val: string) => {
    setFacilitiesInput(val);
    const parsed = val
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    setForm((prev) => ({ ...prev, facilities: parsed }));
  };

  const filteredRooms = React.useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return rooms;
    return rooms.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.roomCode.toLowerCase().includes(q) ||
        (r.description || "").toLowerCase().includes(q) ||
        String(r.floor).includes(q)
    );
  }, [rooms, search]);

  const isModalOpen = creating || editing !== null;

  return (
    <div className="space-y-4">
      {/* Top action row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="relative max-w-xs w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search rooms by name, code, floor…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-line bg-paper-subtle pl-8 pr-8 py-1.5 text-xs text-ink placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-work-blue/30"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-ink"
            >
              <X className="size-3" />
            </button>
          )}
        </div>

        <ActionButton
          variant="primary"
          size="sm"
          leftIcon={<PlusCircle className="size-3.5" />}
          onClick={() => handleOpenModal()}
        >
          Create Room
        </ActionButton>
      </div>

      {/* Operational Room Table */}
      <div className="rounded-2xl border border-line/80 bg-white overflow-hidden shadow-subtle-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[42rem] text-left text-sm">
            <thead className="border-b border-line bg-paper-subtle text-slate-600 font-semibold text-xs uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Room & Code</th>
                <th className="py-3 px-4">Floor</th>
                <th className="py-3 px-4">Capacity</th>
                <th className="py-3 px-4">Facilities</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line/60">
              {filteredRooms.map((room) => (
                <tr
                  key={room.id}
                  className={cn(
                    "hover:bg-slate-50/70 transition-colors",
                    !room.active && "opacity-75 bg-slate-50/40"
                  )}
                >
                  <td className="py-3 px-4">
                    <div className="font-semibold text-ink">{room.name}</div>
                    <div className="font-mono text-xs text-work-blue mt-0.5">
                      {room.roomCode}
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono text-xs text-slate-600">
                    Floor {room.floor}
                  </td>
                  <td className="py-3 px-4 font-mono text-xs text-slate-600">
                    {room.capacity} seats
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex flex-wrap gap-1">
                      {(room.facilities || []).slice(0, 3).map((f) => (
                        <span
                          key={f}
                          className="inline-flex text-[10px] font-medium bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded"
                        >
                          {f}
                        </span>
                      ))}
                      {(room.facilities || []).length > 3 && (
                        <span className="text-[10px] text-slate-400 font-mono">
                          +{room.facilities.length - 3}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <StatusBadge
                      status={room.active ? "ACTIVE" : "INACTIVE"}
                      label={room.active ? "Active" : "Inactive"}
                      size="sm"
                    />
                  </td>
                  <td className="py-3 px-4 text-right space-x-2">
                    <button
                      type="button"
                      onClick={() => handleOpenModal(room)}
                      className="text-xs font-semibold text-work-blue hover:text-work-blue-700 bg-work-blue-50 hover:bg-work-blue-100 border border-work-blue-200 px-2.5 py-1 rounded-lg transition-all"
                    >
                      Edit
                    </button>
                    {room.active && (
                      <button
                        type="button"
                        onClick={() => setDeactivateTarget(room)}
                        className="text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-2.5 py-1 rounded-lg transition-all"
                      >
                        Deactivate
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Room Modal */}
      <Modal
        open={isModalOpen}
        onClose={() => {
          setEditing(null);
          setCreating(false);
        }}
        title={editing ? `Edit Room: ${editing.name}` : "Create New Meeting Room"}
        maxWidth="lg"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            saveMutation.mutate();
          }}
          className="space-y-4"
        >
          <div className="grid gap-3.5 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Room Code (e.g. CONF-A, BD-101)
              </label>
              <input
                required
                type="text"
                placeholder="CONF-A"
                value={form.roomCode}
                onChange={(e) =>
                  setForm({ ...form, roomCode: e.target.value.toUpperCase().trim() })
                }
                className="w-full rounded-xl border border-line bg-paper-subtle px-3 py-2 text-xs font-mono text-ink focus:outline-none focus:ring-2 focus:ring-work-blue/30"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Room Display Name
              </label>
              <input
                required
                type="text"
                placeholder="Executive Boardroom"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-xl border border-line bg-paper-subtle px-3 py-2 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-work-blue/30"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Floor / Location
              </label>
              <input
                required
                type="text"
                placeholder="1"
                value={form.floor}
                onChange={(e) => setForm({ ...form, floor: e.target.value })}
                className="w-full rounded-xl border border-line bg-paper-subtle px-3 py-2 text-xs font-mono text-ink focus:outline-none focus:ring-2 focus:ring-work-blue/30"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Capacity (Seats)
              </label>
              <input
                required
                min={1}
                max={200}
                type="number"
                value={form.capacity}
                onChange={(e) =>
                  setForm({ ...form, capacity: Math.max(1, Number(e.target.value)) })
                }
                className="w-full rounded-xl border border-line bg-paper-subtle px-3 py-2 text-xs font-mono text-ink focus:outline-none focus:ring-2 focus:ring-work-blue/30"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Facilities (Comma-separated)
            </label>
            <input
              type="text"
              placeholder="WiFi, Video Conference, Whiteboard, TV, Projector"
              value={facilitiesInput}
              onChange={(e) => handleFacilitiesChange(e.target.value)}
              className="w-full rounded-xl border border-line bg-paper-subtle px-3 py-2 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-work-blue/30"
            />
            <p className="mt-1 text-[11px] text-slate-400">
              Standard facilities: WiFi, Video Conference, TV, Whiteboard, Projector, Phone, Coffee
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Description / Notes
            </label>
            <textarea
              rows={3}
              placeholder="Describe room layout, special audiovisual capabilities, or location markers…"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full rounded-xl border border-line bg-paper-subtle p-3 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-work-blue/30 resize-none"
            />
          </div>

          {saveMutation.isError && (
            <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-800 flex items-center gap-2">
              <AlertCircle className="size-4 shrink-0 text-rose-600" />
              Unable to save room. Ensure the room code is unique and all required fields are filled.
            </div>
          )}

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <ActionButton
              type="button"
              variant="outline"
              size="md"
              onClick={() => {
                setEditing(null);
                setCreating(false);
              }}
              disabled={saveMutation.isPending}
            >
              Cancel
            </ActionButton>

            <ActionButton
              type="submit"
              variant="primary"
              size="md"
              isLoading={saveMutation.isPending}
            >
              {saveMutation.isPending ? "Saving…" : editing ? "Update Room" : "Create Room"}
            </ActionButton>
          </div>
        </form>
      </Modal>

      {/* Deactivate Confirmation Modal */}
      <Modal
        open={Boolean(deactivateTarget)}
        onClose={() => setDeactivateTarget(null)}
        title="Deactivate Meeting Room?"
      >
        <div>
          {deactivateTarget && (
            <div className="mb-4 rounded-2xl bg-amber-50 border border-amber-200 p-4 space-y-1">
              <p className="text-sm font-bold text-amber-900">{deactivateTarget.name}</p>
              <p className="text-xs font-mono text-amber-700">
                {deactivateTarget.roomCode} · Floor {deactivateTarget.floor} ·{" "}
                {deactivateTarget.capacity} seats
              </p>
            </div>
          )}

          <p className="text-sm text-slate-600 leading-relaxed">
            Deactivating this space will prevent any new bookings. Historical reservation records and logs will remain preserved.
          </p>

          {deactivateMutation.isError && (
            <div className="mt-3 rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-800 flex items-center gap-2">
              <AlertCircle className="size-4 shrink-0 text-rose-600" />
              Unable to deactivate room. Please try again.
            </div>
          )}

          <div className="mt-6 flex items-center justify-end gap-3">
            <ActionButton
              variant="outline"
              size="md"
              onClick={() => setDeactivateTarget(null)}
              disabled={deactivateMutation.isPending}
            >
              Keep Active
            </ActionButton>
            <ActionButton
              variant="danger"
              size="md"
              isLoading={deactivateMutation.isPending}
              onClick={() => deactivateTarget && deactivateMutation.mutate(deactivateTarget.id)}
            >
              {deactivateMutation.isPending ? "Deactivating…" : "Deactivate Room"}
            </ActionButton>
          </div>
        </div>
      </Modal>
    </div>
  );
}
