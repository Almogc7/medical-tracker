"use client";

import { useTransition, useState } from "react";
import { useLocale } from "@/components/ui/locale-provider";
import { usePacksAction } from "@/app/actions";

type IssuableItem = {
  id: string;
  title: string;
  person: string;
  daysRemaining: string;
  totalPacks: number;
  usedPacks: number;
};

function UsePacksInline({ item }: { item: IssuableItem }) {
  const { t } = useLocale();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("1");
  const [, startTransition] = useTransition();

  const remaining = item.totalPacks - item.usedPacks;
  const parsed = parseInt(value, 10);
  const valid = !isNaN(parsed) && parsed >= 1 && parsed <= remaining;

  if (remaining <= 0) return null;

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-2 rounded-lg bg-slate-900 px-3 py-1 text-xs font-semibold text-white"
      >
        {t.common.usePacks}
      </button>
    );
  }

  return (
    <div className="mt-2 flex items-center gap-2">
      <input
        type="number"
        min={1}
        max={remaining}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-16 rounded-lg border border-slate-300 px-2 py-1 text-xs"
        autoFocus
      />
      <span className="text-xs text-slate-500">/ {remaining}</span>
      <button
        type="button"
        disabled={!valid}
        onClick={() => {
          if (!valid) return;
          startTransition(async () => {
            await usePacksAction(item.id, parsed);
          });
          setOpen(false);
          setValue("1");
        }}
        className="rounded-lg bg-slate-900 px-2 py-1 text-xs font-semibold text-white disabled:opacity-50"
      >
        {t.common.confirm}
      </button>
      <button
        type="button"
        onClick={() => { setOpen(false); setValue("1"); }}
        className="rounded-lg border border-slate-300 px-2 py-1 text-xs text-slate-600"
      >
        {t.common.cancel}
      </button>
    </div>
  );
}

export function IssuableList({
  items,
  urgent = false,
}: {
  items: IssuableItem[];
  urgent?: boolean;
}) {
  if (!items.length) return null;

  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div
          key={item.id}
          className={
            urgent
              ? "rounded-xl border border-rose-200 bg-rose-50 p-3"
              : "rounded-xl border border-slate-200 p-3"
          }
        >
          <p className={`font-medium ${urgent ? "text-rose-800" : "text-slate-900"}`}>{item.title}</p>
          <p className={`text-sm ${urgent ? "text-rose-700" : "text-slate-600"}`}>{item.person}</p>
          <p className={`text-xs ${urgent ? "text-rose-600" : "text-slate-500"}`}>
            {item.daysRemaining} · {item.usedPacks}/{item.totalPacks} packs used
          </p>
          <UsePacksInline item={item} />
        </div>
      ))}
    </div>
  );
}
