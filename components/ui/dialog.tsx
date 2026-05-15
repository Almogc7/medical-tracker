"use client";

import { useEffect, useId, useRef } from "react";
import { cn } from "@/utils/cn";

const maxWidthMap = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
} as const;

export interface DialogProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  maxWidth?: keyof typeof maxWidthMap;
  children: React.ReactNode;
  className?: string;
}

export function Dialog({
  open,
  onClose,
  title,
  description,
  maxWidth = "md",
  children,
  className,
}: DialogProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId  = useId();
  const descId   = useId();

  // ── Focus trap + Escape ───────────────────────────────────────────────────
  useEffect(() => {
    if (!open) return;

    const panel = panelRef.current;
    if (!panel) return;

    const getFocusables = () =>
      Array.from(
        panel.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      );

    // Focus first element on open
    const focusables = getFocusables();
    focusables[0]?.focus();

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
        return;
      }

      if (e.key === "Tab") {
        const current = getFocusables();
        if (!current.length) return;
        const first = current[0];
        const last  = current[current.length - 1];

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
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    // Backdrop container — not a dialog role itself
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-describedby={description ? descId : undefined}
        className={cn(
          "relative w-full rounded-[var(--radius-panel)] border border-border bg-surface shadow-xl",
          "animate-in fade-in-0 slide-in-from-bottom-4 duration-200",
          "sm:slide-in-from-bottom-0 sm:zoom-in-95",
          maxWidthMap[maxWidth],
          className,
        )}
      >
        {title || description ? (
          <div className="border-b border-border-subtle px-5 py-4">
            {title ? (
              <h2 id={titleId} className="text-base font-semibold text-slate-900">
                {title}
              </h2>
            ) : null}
            {description ? (
              <p id={descId} className="mt-1 text-sm text-slate-500">
                {description}
              </p>
            ) : null}
          </div>
        ) : null}

        <div className="px-5 py-4">{children}</div>
      </div>
    </div>
  );
}
