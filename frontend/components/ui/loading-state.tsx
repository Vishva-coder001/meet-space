import * as React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface LoadingStateProps {
  message?: string;
  className?: string;
  inline?: boolean;
}

export function LoadingState({
  message = "Loading...",
  className,
  inline = false,
}: LoadingStateProps) {
  if (inline) {
    return (
      <div className={cn("flex items-center gap-2 text-sm text-slate-500", className)}>
        <Loader2 className="size-4 animate-spin text-work-blue" />
        <span>{message}</span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-line/60 bg-white/40 p-12 text-center",
        className
      )}
    >
      <div className="flex size-10 items-center justify-center rounded-xl bg-work-blue-50 text-work-blue mb-3">
        <Loader2 className="size-5 animate-spin" />
      </div>
      <p className="text-sm font-medium text-slate-600">{message}</p>
    </div>
  );
}

export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-lg bg-slate-200/80", className)}
      {...props}
    />
  );
}
