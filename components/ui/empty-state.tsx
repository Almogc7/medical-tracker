export function EmptyState({ title, message }: { title: string; message: string }) {
  return (
    <div className="py-8 text-center">
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <p className="mt-1 text-xs text-slate-400">{message}</p>
    </div>
  );
}
