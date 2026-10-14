"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { useLocale } from "@/components/ui/locale-provider";
import { cn } from "@/utils/cn";

const OPTIONS = [
  { value: "en", label: "EN", name: "English" },
  { value: "he", label: "עב", name: "עברית" },
] as const;

export function LanguageSwitcher() {
  const { locale, t } = useLocale();
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function onLocaleChange(nextLocale: string) {
    if (nextLocale === locale || pending) return;
    setPending(true);

    try {
      await fetch("/api/locale", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale: nextLocale }),
      });

      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <div role="group" aria-label={t.navbar.language} className="flex shrink-0 overflow-hidden rounded-[var(--radius-component)] border border-border text-sm">
      {OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          lang={option.value}
          aria-label={option.name}
          aria-pressed={locale === option.value}
          disabled={pending}
          onClick={() => onLocaleChange(option.value)}
          className={cn(
            "min-h-11 min-w-11 touch-manipulation px-3 font-medium transition-colors disabled:opacity-60",
            locale === option.value ? "bg-accent text-accent-fg" : "text-foreground-muted hover:bg-border-subtle",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
