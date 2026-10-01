"use client";

import * as React from "react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  User,
  Mail,
  Building2,
  Phone,
  Edit3,
  Save,
  CheckCircle2,
  AlertCircle,
  IdCard,
  ShieldCheck,
  KeyRound,
  Lock,
  ExternalLink,
  Sparkles,
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
      className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5"
    >
      {children}
    </label>
  );
}

function ReadOnlyField({
  icon: Icon,
  label,
  value,
  badge,
}: {
  icon: React.ElementType;
  label: string;
  value: string | undefined;
  badge?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between p-4 rounded-2xl border border-line/60 bg-paper-subtle">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-xl bg-work-blue-50 text-work-blue border border-work-blue-100">
          <Icon className="size-4" />
        </div>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
          <p className="text-sm font-semibold text-ink mt-0.5 font-mono">{value || "—"}</p>
        </div>
      </div>
      {badge && <div className="shrink-0 ml-2">{badge}</div>}
    </div>
  );
}

export default function ProfilePage() {
  const qc = useQueryClient();

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
  const [successNotice, setSuccessNotice] = useState(false);

  const saveMutation = useMutation({
    mutationFn: employeeApi.update,
    onSuccess: (res) => {
      const updated = res.data;
      setForm({
        firstName: updated.firstName,
        lastName: updated.lastName,
        department: updated.department,
        phone: updated.phone ?? "",
      });
      setIsDirty(false);
      setSuccessNotice(true);
      qc.invalidateQueries({ queryKey: ["profile"] });
      qc.invalidateQueries({ queryKey: ["employee", "me"] });
      setTimeout(() => setSuccessNotice(false), 4000);
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
    setSuccessNotice(false);
  };

  if (profileQuery.isLoading) {
    return (
      <AppShell>
        <div className="max-w-3xl mx-auto space-y-4 animate-pulse">
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
          message="Unable to retrieve employee profile. Please refresh or sign in again."
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
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <div className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold text-work-blue uppercase tracking-wider mb-1">
            <User className="size-3.5" />
            Account Center
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            Employee Profile
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            View and manage your personal workplace identity, department assignments, and security settings.
          </p>
        </div>

        {/* Profile Identity Card */}
        <div className="rounded-3xl border border-line/80 bg-white p-6 shadow-subtle-sm flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="grid size-16 shrink-0 place-items-center rounded-2xl bg-work-blue text-white font-bold text-xl shadow-subtle-sm">
            {initials}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h2 className="text-xl font-bold text-ink truncate">
                {p.firstName} {p.lastName}
              </h2>
              <span className="font-mono text-xs font-bold text-work-blue bg-work-blue-50 border border-work-blue-100 px-2 py-0.5 rounded-lg">
                {p.employeeCode}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 font-mono truncate">{p.email}</p>

            <div className="mt-2.5 flex flex-wrap items-center gap-2">
              <StatusBadge status={p.role} size="sm" />
              {p.emailVerified ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                  <CheckCircle2 className="size-3 text-emerald-600" />
                  Email Verified
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
                  <AlertCircle className="size-3 text-amber-600" />
                  Unverified
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Read-Only Account Information */}
        <div className="rounded-3xl border border-line/80 bg-white p-6 shadow-subtle-sm space-y-4">
          <SectionHeader title="Account Identity" />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <ReadOnlyField
              icon={Mail}
              label="Corporate Email"
              value={p.email}
              badge={
                <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                  Immutable
                </span>
              }
            />
            <ReadOnlyField
              icon={IdCard}
              label="Employee ID Code"
              value={p.employeeCode}
              badge={
                <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                  System ID
                </span>
              }
            />
            <ReadOnlyField
              icon={ShieldCheck}
              label="System Authority"
              value={p.role}
            />
            <ReadOnlyField
              icon={CheckCircle2}
              label="Account Status"
              value={p.active ? "Active & Authorized" : "Deactivated"}
            />
          </div>
        </div>

        {/* Editable Profile Form */}
        <Card className="rounded-3xl border-line/80 shadow-subtle-sm">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Edit3 className="size-4 text-work-blue" />
              Editable Workplace Information
            </CardTitle>
            <CardDescription>
              Update your contact details and department assignment. Changes take effect immediately across all reservation records.
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
                    placeholder="e.g. Platform Engineering, Design, Operations"
                    onChange={(e) => handleChange("department", e.target.value)}
                    className="block w-full rounded-xl border border-line bg-paper-subtle px-3.5 py-2.5 text-sm text-ink placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-work-blue/30 focus:border-work-blue/50 transition-all"
                  />
                </div>

                {/* Phone */}
                <div>
                  <FieldLabel htmlFor="phone">Contact Phone (Optional)</FieldLabel>
                  <input
                    id="phone"
                    type="tel"
                    value={form.phone}
                    placeholder="+1 (555) 000-0000"
                    onChange={(e) => handleChange("phone", e.target.value)}
                    className="block w-full rounded-xl border border-line bg-paper-subtle px-3.5 py-2.5 text-sm text-ink placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-work-blue/30 focus:border-work-blue/50 transition-all font-mono"
                  />
                </div>
              </div>

              {/* Status alerts */}
              {saveMutation.isError && (
                <div className="flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 text-xs text-rose-800">
                  <AlertCircle className="size-4 shrink-0 text-rose-600" />
                  Unable to update profile. Please verify your input and try again.
                </div>
              )}

              {successNotice && (
                <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-xs text-emerald-800">
                  <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
                  Profile updated successfully! All records have been synchronized.
                </div>
              )}

              <div className="pt-2 flex items-center justify-end">
                <ActionButton
                  type="submit"
                  variant="primary"
                  size="md"
                  leftIcon={<Save className="size-4" />}
                  isLoading={saveMutation.isPending}
                  disabled={saveMutation.isPending || !isDirty}
                >
                  {saveMutation.isPending ? "Saving changes…" : "Save Profile"}
                </ActionButton>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Account Security Card */}
        <div className="rounded-3xl border border-line/80 bg-white p-6 shadow-subtle-sm space-y-4">
          <SectionHeader title="Account Security & Authentication" />
          <div className="p-4 rounded-2xl border border-line/60 bg-paper-subtle flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-xl bg-work-blue-50 text-work-blue border border-work-blue-100">
                <KeyRound className="size-4" />
              </div>
              <div>
                <h3 className="font-semibold text-ink text-sm">Security & Password Management</h3>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                  Need to update your login password? Use our secure verification email dispatch to reset your password.
                </p>
              </div>
            </div>

            <Link href="/forgot-password" className="shrink-0 w-full sm:w-auto">
              <ActionButton
                variant="outline"
                size="sm"
                rightIcon={<ExternalLink className="size-3" />}
                className="w-full sm:w-auto"
              >
                Reset Password
              </ActionButton>
            </Link>
          </div>
        </div>
      </div>
    </AppShell>
  );
}