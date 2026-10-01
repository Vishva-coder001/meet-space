import { cn } from "@/lib/utils";

export type StatusType =
  | "CONFIRMED"
  | "CANCELLED"
  | "PENDING"
  | "AVAILABLE"
  | "OCCUPIED"
  | "ACTIVE"
  | "INACTIVE"
  | "ADMIN"
  | "EMPLOYEE"
  | string;

interface StatusBadgeProps {
  status: StatusType;
  label?: string;
  size?: "sm" | "md";
  className?: string;
}

export function StatusBadge({ status, label, size = "sm", className }: StatusBadgeProps) {
  const normalized = (status || "").toUpperCase();
  const displayLabel = label || status;

  const styleMap: Record<string, string> = {
    CONFIRMED: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
    AVAILABLE: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
    ACTIVE: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
    
    CANCELLED: "bg-rose-50 text-rose-700 border-rose-200/80",
    INACTIVE: "bg-slate-100 text-slate-600 border-slate-200",
    
    PENDING: "bg-amber-50 text-amber-700 border-amber-200/80",
    OCCUPIED: "bg-amber-50 text-amber-700 border-amber-200/80",
    
    ADMIN: "bg-indigo-50 text-indigo-700 border-indigo-200/80",
    ROLE_ADMIN: "bg-indigo-50 text-indigo-700 border-indigo-200/80",
    EMPLOYEE: "bg-sky-50 text-work-blue border-sky-200/80",
  };

  const dotColorMap: Record<string, string> = {
    CONFIRMED: "bg-emerald-500",
    AVAILABLE: "bg-emerald-500",
    ACTIVE: "bg-emerald-500",
    CANCELLED: "bg-rose-500",
    INACTIVE: "bg-slate-400",
    PENDING: "bg-amber-500",
    OCCUPIED: "bg-amber-500",
    ADMIN: "bg-indigo-500",
    ROLE_ADMIN: "bg-indigo-500",
    EMPLOYEE: "bg-work-blue",
  };

  const currentStyle = styleMap[normalized] || "bg-slate-50 text-slate-700 border-slate-200";
  const currentDot = dotColorMap[normalized] || "bg-slate-400";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 font-medium border rounded-full font-mono tracking-tight transition-colors",
        size === "sm" ? "px-2.5 py-0.5 text-xs" : "px-3 py-1 text-xs",
        currentStyle,
        className
      )}
    >
      <span className={cn("size-1.5 rounded-full shrink-0", currentDot)} />
      <span>{displayLabel}</span>
    </span>
  );
}
