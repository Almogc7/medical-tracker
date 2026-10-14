/** Centered empty state. The optional icon sits in a sage circle so every empty state looks the same. */
export function EmptyState({ title, message, icon }: { title: string; message: string; icon?: React.ReactNode }) {
  return (
    <div className="px-4 py-10 text-center">
      {icon ? <span className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-accent-subtle text-accent">{icon}</span> : null}
      <p className="text-sm font-medium text-foreground-muted">{title}</p>
      <p className="mt-1 text-xs text-foreground-muted">{message}</p>
    </div>
  );
}
