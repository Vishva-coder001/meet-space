"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Building2,
  LayoutDashboard,
  DoorOpen,
  CalendarCheck,
  Glasses,
  User,
  ShieldCheck,
  LogOut,
  Menu,
  X,
  Radio,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { StatusBadge } from "@/components/ui/status-badge";
import { PageTransition } from "@/components/transitions/page-transition";
import { cn } from "@/lib/utils";

interface AppShellProps {
  children: React.ReactNode;
  activeNav?: string;
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, isAuthenticated, isAdmin, isLoading, logout, isLoggingOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = React.useState(false);

  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  React.useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  // Navigation routes configuration
  const navItems = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      active: pathname === "/dashboard",
    },
    {
      href: "/rooms",
      label: "Rooms",
      icon: DoorOpen,
      active: pathname.startsWith("/rooms"),
    },
    {
      href: "/bookings",
      label: "Bookings",
      icon: CalendarCheck,
      active: pathname.startsWith("/bookings"),
    },
    {
      href: "/office",
      label: "3D Office",
      icon: Glasses,
      active: pathname.startsWith("/office"),
    },
    ...(isAdmin
      ? [
          {
            href: "/admin",
            label: "Admin Console",
            icon: ShieldCheck,
            active: pathname.startsWith("/admin"),
          },
        ]
      : []),
  ];

  return (
    <div className="min-h-screen bg-paper flex flex-col text-ink antialiased">
      {/* Top Application Bar */}
      <header className="sticky top-0 z-40 w-full border-b border-line/70 bg-white/90 backdrop-blur-md shadow-subtle-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Brand Logo */}
          <div className="flex items-center gap-8">
            <Link
              href="/dashboard"
              className="flex items-center gap-2.5 font-bold text-ink hover:opacity-90 transition-opacity"
            >
              <span className="grid size-9 place-items-center rounded-xl bg-work-blue text-white shadow-subtle-sm">
                <Building2 className="size-5" />
              </span>
              <div className="flex flex-col">
                <span className="text-base font-bold tracking-tight leading-none">
                  MeetSpace
                </span>
                <span className="text-[10px] font-mono text-work-blue uppercase tracking-wider font-semibold">
                  Workplace OS
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all",
                      item.active
                        ? "bg-work-blue-50 text-work-blue font-semibold shadow-subtle-sm border border-work-blue-100"
                        : "text-slate-600 hover:text-ink hover:bg-slate-100/70"
                    )}
                  >
                    <Icon className={cn("size-4", item.active ? "text-work-blue" : "text-slate-400")} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Header Area: Live indicator + User Profile / Menu */}
          <div className="flex items-center gap-3">
            {/* Live Realtime Indicator */}
            <div className="hidden sm:flex items-center gap-1.5 rounded-full border border-emerald-200/80 bg-emerald-50 px-2.5 py-1 text-xs font-mono font-medium text-emerald-700">
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Realtime Live</span>
            </div>

            {/* User Profile Pill / Menu */}
            {isLoading ? (
              <div className="h-9 w-28 animate-pulse rounded-xl bg-slate-200" />
            ) : isAuthenticated && user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  aria-expanded={userDropdownOpen}
                  aria-haspopup="menu"
                  aria-label="User account menu"
                  className="flex items-center gap-2 rounded-xl border border-line bg-white px-3 py-1.5 text-xs font-medium text-ink hover:bg-slate-50 transition-colors shadow-subtle-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-work-blue/30"
                >
                  <div className="grid size-6 place-items-center rounded-lg bg-work-blue-100 text-work-blue font-bold text-xs">
                    {(profile?.firstName?.[0] || user.email[0]).toUpperCase()}
                  </div>
                  <div className="hidden sm:flex flex-col text-left">
                    <span className="font-semibold truncate max-w-[120px]">
                      {profile ? `${profile.firstName} ${profile.lastName}` : user.email.split("@")[0]}
                    </span>
                  </div>
                  <ChevronDown className="size-3 text-slate-400" />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-line bg-white p-2 shadow-subtle-lg z-50 text-xs">
                    <div className="px-3 py-2 border-b border-line/60 mb-1">
                      <p className="font-semibold text-ink truncate">
                        {profile ? `${profile.firstName} ${profile.lastName}` : user.email}
                      </p>
                      <p className="text-slate-400 text-[11px] truncate">{user.email}</p>
                      <div className="mt-2">
                        <StatusBadge status={user.role} size="sm" />
                      </div>
                    </div>

                    <Link
                      href="/profile"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-slate-700 hover:bg-slate-100 hover:text-ink transition-colors"
                    >
                      <User className="size-4 text-slate-400" />
                      <span>Employee Profile</span>
                    </Link>

                    {isAdmin && (
                      <Link
                        href="/admin"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-slate-700 hover:bg-slate-100 hover:text-ink transition-colors"
                      >
                        <ShieldCheck className="size-4 text-slate-400" />
                        <span>Admin Console</span>
                      </Link>
                    )}

                    <div className="my-1 border-t border-line/60" />

                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        logout();
                      }}
                      disabled={isLoggingOut}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-rose-600 hover:bg-rose-50 transition-colors text-left"
                    >
                      <LogOut className="size-4 text-rose-500" />
                      <span>{isLoggingOut ? "Signing out..." : "Sign out"}</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="rounded-xl bg-ink px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-ink-800 transition-colors shadow-subtle-sm"
              >
                Sign in
              </Link>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-nav-menu"
              className="md:hidden rounded-xl p-2 text-slate-600 hover:bg-slate-100 transition-colors"
            >
              {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div id="mobile-nav-menu" className="md:hidden border-b border-line bg-white px-4 py-3 space-y-1 shadow-subtle-md">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                    item.active
                      ? "bg-work-blue-50 text-work-blue font-semibold border border-work-blue-100"
                      : "text-slate-600 hover:bg-slate-50 hover:text-ink"
                  )}
                >
                  <Icon className={cn("size-4", item.active ? "text-work-blue" : "text-slate-400")} />
                  <span>{item.label}</span>
                </Link>
              );
            })}

            <div className="pt-2 mt-2 border-t border-line/60">
              <Link
                href="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                <User className="size-4 text-slate-400" />
                <span>My Profile</span>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main id="main-content" className="flex-1 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <PageTransition>{children}</PageTransition>
      </main>

      {/* Global Compact Footer */}
      <footer className="mt-auto border-t border-line/60 bg-white/60 py-6 text-xs text-slate-400">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 sm:flex-row sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-ink">MeetSpace</span>
            <span>·</span>
            <span>Enterprise Office Meeting Room Booking System</span>
          </div>
          <div className="flex items-center gap-4 font-mono text-[11px]">
            <span>STOMP Realtime Active</span>
            <span>·</span>
            <span>Neon PostgreSQL</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
