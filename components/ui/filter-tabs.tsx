"use client";

import { cn } from "@/utils/cn";

// Chip row (same look as the dashboard's person filter). `label` names the group for assistive tech.
export function FilterTabs({
  items,
  value,
  onChange,
  label,
}: {
  items: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  label: string;
}) {
  return (
    <div role="group" aria-label={label} className="-mx-3 flex gap-2 overflow-x-auto px-3 pb-1 [scrollbar-width:none] sm:-mx-4 sm:px-4 md:mx-0 md:px-0 [&::-webkit-scrollbar]:hidden">
      {items.map((item) => {
        const active = value === item.value;
        return (
          <button
            key={item.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(item.value)}
            className={cn(
              "min-h-11 shrink-0 touch-manipulation select-none whitespace-nowrap rounded-full border px-4 text-sm font-medium transition-colors active:scale-[0.98]",
              active ? "border-accent bg-accent-subtle text-accent" : "border-border bg-surface text-foreground-muted hover:bg-border-subtle",
            )}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
