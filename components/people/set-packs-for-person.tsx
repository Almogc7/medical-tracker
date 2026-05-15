"use client";

import { useState, useTransition } from "react";
import { setAllPacksForPersonAction } from "@/app/actions";

export function SetPacksForPerson({ personId, prescriptionCount }: { personId: string; prescriptionCount: number }) {
  const [value, setValue] = useState("");
  const [done, setDone] = useState(false);
  const [, startTransition] = useTransition();

  if (prescriptionCount === 0) return null;

  const parsed = parseInt(value, 10);
  const valid = !isNaN(parsed) && parsed >= 1;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid) return;
    startTransition(async () => {
      await setAllPacksForPersonAction(personId, parsed);
      setDone(true);
      setValue("");
    });
  }

  if (done) {
    return (
      <p className="mt-2 text-center text-xs text-emerald-600">
        ✓ All {prescriptionCount} prescription{prescriptionCount > 1 ? "s" : ""} updated
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-2 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
      <input
        type="number"
        min={1}
        placeholder="Packs"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-20 rounded-lg border border-slate-300 px-2 py-1 text-xs"
      />
      <button
        type="submit"
        disabled={!valid}
        className="rounded-lg bg-slate-900 px-3 py-1 text-xs font-semibold text-white disabled:opacity-50"
      >
        Set all
      </button>
    </form>
  );
}
