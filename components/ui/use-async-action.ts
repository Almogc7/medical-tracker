"use client";

import { useCallback, useState, useTransition } from "react";

/**
 * Runs an async handler (usually a server action passed as a prop) and exposes honest state:
 * `pending` while it runs, `failed` if it rejected. `run` resolves true only when the handler succeeded,
 * so callers can show success feedback only after a real success.
 */
export function useAsyncAction() {
  const [pending, startTransition] = useTransition();
  const [failed, setFailed] = useState(false);

  const run = useCallback((action: () => Promise<void>) => {
    setFailed(false);
    return new Promise<boolean>((resolve) => {
      startTransition(async () => {
        try {
          await action();
          resolve(true);
        } catch {
          setFailed(true);
          resolve(false);
        }
      });
    });
  }, []);

  return { run, pending, failed, clearFailed: () => setFailed(false) };
}
