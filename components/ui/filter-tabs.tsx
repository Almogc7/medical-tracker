"use client";

import { cn } from "@/utils/cn";

export function FilterTabs({
  items,
  value,
  onChange,
}: {
  items: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="overflow-x-auto pb-1">
      <div className="inline-flex min-w-max rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
        {items.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => onChange(item.value)}
            className={cn(
              "rounded-lg whitespace-nowrap px-3 py-1.5 text-sm transition",
              value === item.value ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}
