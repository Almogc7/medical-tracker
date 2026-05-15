export function SummaryCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "green" | "amber" | "red" | "gray";
}) {
  const valueClass =
    tone === "green"
      ? "text-status-healthy"
      : tone === "amber"
        ? "text-status-warning"
        : tone === "red"
          ? "text-status-danger"
          : "text-slate-500";

  return (
    <div className="flex flex-col gap-0.5 px-4 py-3 first:pl-0 last:pr-0">
      <span className={`text-2xl font-semibold tabular-nums ${valueClass}`}>{value}</span>
      <span className="text-xs text-slate-500">{label}</span>
    </div>
  );
}
