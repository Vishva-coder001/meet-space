"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

interface ModalProps {
  /** Canonical open prop */
  open?: boolean;
  /** Alias for open (legacy) */
  isOpen?: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  maxWidth?: "sm" | "md" | "lg" | "xl";
}

const FOCUSABLE_SELECTORS = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

export function Modal({
  open,
  isOpen,
  onClose,
  title,
  description,
  children,
  className,
  maxWidth = "md",
}: ModalProps) {
  const visible = open ?? isOpen ?? false;
  const dialogRef = React.useRef<HTMLDivElement>(null);
  const previousFocusRef = React.useRef<HTMLElement | null>(null);

  // Save and restore focus
  React.useEffect(() => {
    if (visible) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      // Defer focus to allow dialog to render
      const timer = setTimeout(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;
        const focusable = dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS);
        if (focusable.length > 0) focusable[0].focus();
      }, 50);
      return () => clearTimeout(timer);
    } else {
      previousFocusRef.current?.focus();
    }
  }, [visible]);

  // Keyboard handling: Escape + focus trap
  React.useEffect(() => {
    if (!visible) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab") return;

      const dialog = dialogRef.current;
      if (!dialog) return;
      const focusable = Array.from(
        dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS)
      ).filter((el) => !el.closest('[inert]'));
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "unset";
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [visible, onClose]);

  if (!visible) return null;

  const maxWidthStyles = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
  };

  const titleId = title ? "modal-title" : undefined;
  const descId = description ? "modal-desc" : undefined;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-ink-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        className={cn(
          "relative w-full rounded-3xl border border-line/80 bg-white p-6 shadow-subtle-lg transition-all z-10",
          maxWidthStyles[maxWidth],
          className
        )}
      >
        <button
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute right-4 top-4 rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-ink-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-work-blue/40"
        >
          <X className="size-4" aria-hidden="true" />
        </button>

        {(title || description) && (
          <div className="mb-5 pr-6">
            {title && (
              <h2 id="modal-title" className="text-lg font-semibold text-ink">
                {title}
              </h2>
            )}
            {description && (
              <p id="modal-desc" className="mt-1 text-xs text-slate-500 leading-relaxed">
                {description}
              </p>
            )}
          </div>
        )}

        <div>{children}</div>
      </div>
    </div>
  );
}
