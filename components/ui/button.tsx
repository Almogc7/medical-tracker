"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/utils/cn";

// ─── Variant → colour ────────────────────────────────────────────────────────
// primary   — accent sage:  all main forward-motion actions
// secondary — outlined:     cancel, back, secondary actions
// danger    — rose outlined: destructive actions (delete, remove)
// ghost     — no border:    low-emphasis actions inside cards/rows
const variants = {
  primary:   "bg-accent text-accent-fg hover:bg-accent-hover active:bg-accent-hover",
  secondary: "border border-border bg-surface text-slate-700 hover:bg-border-subtle active:bg-border",
  danger:    "border border-rose-300 bg-transparent text-rose-700 hover:bg-rose-50 active:bg-rose-100",
  ghost:     "bg-transparent text-slate-600 hover:bg-border-subtle active:bg-border",
} as const;

// ─── Size → geometry ─────────────────────────────────────────────────────────
// sm  36px — compact rows, badges, inline actions
// md  40px — default form buttons
// lg  44px — primary CTAs, mobile touch targets (WCAG 2.5.5)
const sizes = {
  sm: "h-9  px-3 text-xs  rounded-[var(--radius-component)]",
  md: "h-10 px-4 text-sm  rounded-[var(--radius-component)]",
  lg: "h-11 px-5 text-sm  rounded-[var(--radius-component)]",
} as const;

export type ButtonVariant = keyof typeof variants;
export type ButtonSize    = keyof typeof sizes;

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant  = "primary",
      size     = "md",
      loading  = false,
      disabled,
      children,
      className,
      ...props
    },
    ref,
  ) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        // Base
        "inline-flex items-center justify-center gap-2 font-semibold",
        "transition-colors duration-150",
        // Disabled / loading
        "disabled:cursor-not-allowed disabled:opacity-50",
        // Variant + size
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {loading ? (
        <>
          <span
            className="h-3.5 w-3.5 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent"
            aria-hidden="true"
          />
          {children}
        </>
      ) : (
        children
      )}
    </button>
  ),
);

Button.displayName = "Button";
