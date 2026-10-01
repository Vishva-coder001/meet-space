import * as React from "react";
import { cn } from "@/lib/utils";
import { AlertCircle, RefreshCw } from "lucide-react";
import { ActionButton } from "./action-button";

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = "Something went wrong",
  message,
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-rose-200/80 bg-rose-50/50 p-8 text-center",
        className
      )}
    >
      <div className="flex size-10 items-center justify-center rounded-xl bg-rose-100 text-rose-600 mb-3">
        <AlertCircle className="size-5" />
      </div>
      <h4 className="text-sm font-semibold text-rose-900">{title}</h4>
      <p className="mt-1 text-xs text-rose-700 max-w-sm leading-relaxed mb-4">
        {message}
      </p>
      {onRetry && (
        <ActionButton
          variant="outline"
          size="sm"
          onClick={onRetry}
          leftIcon={<RefreshCw className="size-3.5" />}
          className="border-rose-200 text-rose-800 hover:bg-rose-100/60 bg-white"
        >
          Try again
        </ActionButton>
      )}
    </div>
  );
}
