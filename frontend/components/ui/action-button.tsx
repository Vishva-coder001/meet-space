import * as React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface ActionButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "destructive" | "danger" | "soft-blue";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const ActionButton = React.forwardRef<HTMLButtonElement, ActionButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium transition-all duration-150 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-work-blue/40 disabled:opacity-50 disabled:pointer-events-none select-none active:scale-[0.98]";

    const variantStyles = {
      primary:
        "bg-ink text-white hover:bg-ink-800 shadow-subtle border border-ink-800",
      "soft-blue":
        "bg-work-blue text-white hover:bg-work-blue-600 shadow-subtle border border-work-blue-700",
      secondary:
        "bg-white text-ink-700 hover:bg-slate-50 border border-line shadow-subtle-sm hover:border-slate-300",
      outline:
        "bg-transparent text-slate-700 hover:bg-slate-100 border border-slate-200",
      ghost:
        "bg-transparent text-slate-700 hover:bg-slate-100 hover:text-ink-800",
      destructive:
        "bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200",
      danger:
        "bg-rose-600 text-white hover:bg-rose-700 shadow-subtle border border-rose-700",
    };

    const sizeStyles = {
      sm: "h-8 px-3 text-xs gap-1.5",
      md: "h-10 px-4 text-sm gap-2",
      lg: "h-12 px-6 text-base gap-2.5",
      icon: "size-9 p-0",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          baseStyles,
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="size-4 animate-spin shrink-0" />
        ) : (
          leftIcon && <span className="shrink-0">{leftIcon}</span>
        )}
        {children}
        {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

ActionButton.displayName = "ActionButton";
