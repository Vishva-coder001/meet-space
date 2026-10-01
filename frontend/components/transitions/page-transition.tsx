"use client";

import * as React from "react";
import { usePathname } from "next/navigation";

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * PageTransition provides an architectural reveal and spatial depth transition
 * on route changes. Fast (220ms-300ms), respecting prefers-reduced-motion.
 */
export function PageTransition({ children, className = "" }: PageTransitionProps) {
  const pathname = usePathname();
  const [mounted, setMounted] = React.useState(false);
  const [isTransitioning, setIsTransitioning] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (!mounted) return;
    setIsTransitioning(true);
    const timer = setTimeout(() => {
      setIsTransitioning(false);
    }, 280);
    return () => clearTimeout(timer);
  }, [pathname, mounted]);

  return (
    <div
      key={pathname}
      className={`page-transition-wrapper ${
        isTransitioning ? "page-transitioning" : "page-entered"
      } ${className}`}
    >
      {children}
    </div>
  );
}
