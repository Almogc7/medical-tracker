"use client";

import type { PrescriptionStatus } from "@/types/domain";

import { useLocale } from "@/components/ui/locale-provider";
import { cn } from "@/utils/cn";
import { getExpirationSeverity } from "@/utils/date";

export function StatusBadge({
  status,
  expirationDate,
}: {
  status: PrescriptionStatus;
  expirationDate?: Date;
}) {
  const { t } = useLocale();

  const severe = expirationDate ? getExpirationSeverity(expirationDate) : "none";

  const { dot, classes, label } = (() => {
    if (status === "expired") {
      return {
        dot: "bg-status-danger",
        classes: "bg-status-danger-bg text-status-danger",
        label: t.status.expired,
      };
    }
    if (status === "issued") {
      return {
        dot: "bg-status-issued",
        classes: "bg-status-issued-bg text-status-issued",
        label: t.status.issued,
      };
    }
    if (severe !== "none" && severe !== "low") {
      return {
        dot: "bg-status-warning",
        classes: "bg-status-warning-bg text-status-warning",
        label: t.status.expiringSoon,
      };
    }
    return {
      dot: "bg-status-healthy",
      classes: "bg-status-healthy-bg text-status-healthy",
      label: t.status.active,
    };
  })();

  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium", classes)}>
      <span className={cn("h-1.5 w-1.5 rounded-full flex-shrink-0", dot)} aria-hidden="true" />
      {label}
    </span>
  );
}
