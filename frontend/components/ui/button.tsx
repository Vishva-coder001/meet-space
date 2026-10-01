import { Slot } from "@radix-ui/react-slot";
import { type ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean };

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, asChild = false, type = "button", ...props },
  ref
) {
  const Component = asChild ? Slot : "button";
  return <Component ref={ref} type={asChild ? undefined : type} className={cn("inline-flex items-center justify-center border border-ink px-4 py-2 text-sm font-semibold transition-colors hover:bg-ink hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-work-blue disabled:pointer-events-none disabled:opacity-50", className)} {...props} />;
});

