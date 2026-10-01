"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  User,
  Mail,
  Building2,
  Phone,
  BadgeCheck,
  Edit3,
  Save,
  CheckCircle2,
  AlertCircle,
  IdCard,
} from "lucide-react";
import { employeeApi } from "@/services/employee";
import type { EmployeeProfileUpdate } from "@/types/domain";
import { AppShell } from "@/components/shell/app-shell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { ActionButton } from "@/components/ui/action-button";
import { Skeleton } from "@/components/ui/loading-state";
import { ErrorState } from "@/components/ui/error-state";
import { StatusBadge } from "@/components/ui/status-badge";
import { cn } from "@/lib/utils";

function FieldLabel({ htmlFor, children }: { htmlFor?: string; children: React.ReactNode }) {
  return (
    <label
      htmlFor={htmlFor}
      className="block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1.5"
    >
      {children}
    </label>
  );
}

function ReadOnlyField({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string | undefined;
}) {
  return (
    <div className="flex items-start gap-3 p-4 rounded-2xl border border-line/60 bg-paper-subtle">
      <div className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-xl bg-work-blue-50 text-work-blue border border-work-blue-100">
        <Icon className="size-4" />
      </div>
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{label}</p>
        <p className="text-sm font-semibold text-ink mt-0.5">{value || "—"}</p>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const profileQuery = useQuery({
    queryKey: ["profile"],
    queryFn: employeeApi.me,
  });

  const [form, setForm] = useState<EmployeeProfileUpdate>({
    firstName: "",
    lastName: "",
    department: "",
    phone: "",
  });

  const [isDirty, setIsDirty] = useState(false);

  const saveMutation = useMutation({
    mutationFn: employeeApi.update,
    onSuccess: (r) => {
      setForm({
        firstName: r.data.firstName,
        lastName: r.data.lastName,
        department: r.data.department,
        phone: r.data.phone ?? "",
      });
      setIsDirty(false);
    },
  });

  useEffect(() => {
    const p = profileQuery.data?.data;
    if (p) {
      setForm({
        firstName: p.firstName,
        lastName: p.lastName,
        department: p.department,
        phone: p.phone ?? "",
      });
    }
  }, [profileQuery.data]);

  const handleChange = (key: keyof EmployeeProfileUpdate, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setIsDirty(true);
  };

  if (profileQuery.isLoading) {
    return (
      <AppShell>
        <div className="max-w-2xl mx-auto space-y-4 animate-pulse">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-9 w-64" />
          <div className="grid grid-cols-2 gap-4 mt-6">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-2xl" />
            ))}
          </div>
        </div>
      </AppShell>
    );
  }

  if (profileQuery.isError) {
    return (
      <AppShell>
        <ErrorState
          message="Unable to load your profile. Please try again."
          onRetry={() => profileQuery.refetch()}
        />
      </AppShell>
    );
  }

  const p = profileQuery.data?.data;
  if (!p) return null;

  const initials = `${p.firstName?.[0] || ""}${p.lastName?.[0] || ""}`.toUpperCase() || "?";

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="font-mono text-xs font-semibold text-work-blue uppercase tracking-wider mb-1">
            Employee Profile
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            Your Workplace Identity
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            View and update your personal details and workplace information.
          </p>
        </div>

        {/* Profile Identity Card */}
        <div className="mb-6 rounded-2xl border border-line/80 bg-white p-5 shadow-subtle-sm flex items-center gap-5">
          <div className="grid size-16 shrink-0 place-items-center rounded-2xl bg-work-blue text-white font-bold text-xl shadow-subtle-sm">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-lg font-bold text-ink truncate">
              {p.firstName} {p.lastName}
            </p>
            <p className="text-sm text-slate-500 truncate">{p.email}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <StatusBadge status={p.role} size="sm" />
              {p.emailVerified ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-lg">
                  <CheckCircle2 className="size-3" />
                  Email Verified
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-lg">
                  <AlertCircle className="size-3" />
                  Unverified
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Read-only identity fields */}
        <div className="mb-6">
          <SectionHeader title="Account Information" />
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <ReadOnlyField icon={Mail} label="Email Address" value={p.email} />
            <ReadOnlyField icon={IdCard} label="Employee Code" value={p.employeeCode} />
          </div>
        </div>

        {/* Editable Profile Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Edit3 className="size-4 text-work-blue" />
              Edit Profile
            </CardTitle>
            <CardDescription>
              Update your personal information and department details below.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                saveMutation.mutate(form);
              }}
              className="space-y-4"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                {/* First Name */}
                <div>
                  <FieldLabel htmlFor="firstName">First Name</FieldLabel>
                  <input
                    id="firstName"
                    type="text"
                    value={form.firstName}
                    required
                    onChange={(e) => handleChange("firstName", e.target.value)}
                    className="block w-full rounded-xl border border-line bg-paper-subtle px-3.5 py-2.5 text-sm text-ink placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-work-blue/30 focus:border-work-blue/50 transition-all"
                  />
                </div>

                {/* Last Name */}
                <div>
                  <FieldLabel htmlFor="lastName">Last Name</FieldLabel>
                  <input
                    id="lastName"
                    type="text"
                    value={form.lastName}
                    required
                    onChange={(e) => handleChange("lastName", e.target.value)}
                    className="block w-full rounded-xl border border-line bg-paper-subtle px-3.5 py-2.5 text-sm text-ink placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-work-blue/30 focus:border-work-blue/50 transition-all"
                  />
                </div>

                {/* Department */}
                <div>
                  <FieldLabel htmlFor="department">Department</FieldLabel>
                  <input
                    id="department"
                    type="text"
                    value={form.department}
                    required
                    placeholder="e.g. Engineering, Marketing…"
                    onChange={(e) => handleChange("department", e.target.value)}
                    className="block w-full rounded-xl border border-line bg-paper-subtle px-3.5 py-2.5 text-sm text-ink placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-work-blue/30 focus:border-work-blue/50 transition-all"
                  />
                </div>

                {/* Phone */}
                <div>
                  <FieldLabel htmlFor="phone">Phone (optional)</FieldLabel>
                  <input
                    id="phone"
                    type="tel"
                    value={form.phone}
                    placeholder="+1 (555) 000-0000"
                    onChange={(e) => handleChange("phone", e.target.value)}
                    className="block w-full rounded-xl border border-line bg-paper-subtle px-3.5 py-2.5 text-sm text-ink placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-work-blue/30 focus:border-work-blue/50 transition-all"
                  />
                </div>
              </div>

              {/* Status messages */}
              {saveMutation.isError && (
                <div className="flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-700">
                  <AlertCircle className="size-4 shrink-0" />
                  Unable to save your profile. Please try again.
                </div>
              )}

              {saveMutation.isSuccess && !isDirty && (
                <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700">
                  <CheckCircle2 className="size-4 shrink-0" />
                  Profile saved successfully!
                </div>
              )}

              <div className="pt-1">
                <ActionButton
                  type="submit"
                  variant="primary"
                  size="md"
                  leftIcon={<Save className="size-4" />}
                  isLoading={saveMutation.isPending}
                  disabled={saveMutation.isPending || !isDirty}
                >
                  {saveMutation.isPending ? "Saving…" : "Save Changes"}
                </ActionButton>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}