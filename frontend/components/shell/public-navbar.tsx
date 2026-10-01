"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, Menu, X, ArrowRight, Sparkles } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { ActionButton } from "@/components/ui/action-button";
import { cn } from "@/lib/utils";

export function PublicNavbar() {
  const pathname = usePathname();
  const { isAuthenticated, user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { href: "/rooms", label: "Rooms" },
    { href: "/office", label: "3D Office" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-line/60 bg-white/80 backdrop-blur-md transition-all">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
        {/* Brand Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 font-bold text-ink hover:opacity-90 transition-opacity"
        >
          <span className="grid size-9 place-items-center rounded-xl bg-work-blue text-white shadow-subtle-sm">
            <Building2 className="size-5" />
          </span>
          <span className="text-lg tracking-tight">MeetSpace</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-3.5 py-2 text-sm font-medium rounded-xl transition-colors",
                  isActive
                    ? "bg-slate-100 text-ink font-semibold"
                    : "text-slate-600 hover:text-ink hover:bg-slate-50"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Action / Auth Buttons */}
        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated ? (
            <Link href="/dashboard">
              <ActionButton
                variant="primary"
                size="sm"
                rightIcon={<ArrowRight className="size-3.5" />}
              >
                Go to Dashboard
              </ActionButton>
            </Link>
          ) : (
            <>
              <Link href="/login">
                <ActionButton variant="ghost" size="sm">
                  Sign in
                </ActionButton>
              </Link>
              <Link href="/register">
                <ActionButton
                  variant="primary"
                  size="sm"
                  rightIcon={<ArrowRight className="size-3.5" />}
                >
                  Get Started
                </ActionButton>
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
          className="md:hidden rounded-xl p-2 text-slate-600 hover:bg-slate-100 transition-colors"
        >
          {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {/* Mobile menu drawer */}
      {mobileOpen && (
        <div className="md:hidden border-b border-line bg-white px-5 py-4 space-y-2 shadow-subtle-md">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="block rounded-xl px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-3 border-t border-line/60 flex flex-col gap-2">
            {isAuthenticated ? (
              <Link href="/dashboard" onClick={() => setMobileOpen(false)}>
                <ActionButton variant="primary" size="sm" className="w-full">
                  Go to Dashboard
                </ActionButton>
              </Link>
            ) : (
              <>
                <Link href="/login" onClick={() => setMobileOpen(false)}>
                  <ActionButton variant="secondary" size="sm" className="w-full">
                    Sign in
                  </ActionButton>
                </Link>
                <Link href="/register" onClick={() => setMobileOpen(false)}>
                  <ActionButton variant="primary" size="sm" className="w-full">
                    Get Started
                  </ActionButton>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
