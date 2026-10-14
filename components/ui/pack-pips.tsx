"use client";

import { fill, toneStyles, type RowTone } from "@/components/prescriptions/prescription-format";
import { useLocale } from "@/components/ui/locale-provider";
import { cn } from "@/utils/cn";

/** One segment per pack: used packs are muted, remaining ones carry the tone color. */
export function PackPips({ total, used, tone, size = "sm" }: { total: number; used: number; tone: RowTone; size?: "sm" | "lg" }) {
  const { t } = useLocale();
  const label = fill(t.dashboard.packsUsedOf, { used, total });

  return (
    <div role="img" aria-label={label} className="flex gap-1.5">
      {Array.from({ length: Math.max(0, total) }, (_, i) => (
        <span key={i} className={cn("flex-1 rounded-full", size === "lg" ? "h-3" : "h-2", i < used ? "bg-border" : toneStyles[tone].bar)} />
      ))}
    </div>
  );
}
