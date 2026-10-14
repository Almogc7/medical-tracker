import { AlertIcon, CheckIcon } from "@/components/layout/nav-icons";
import { cn } from "@/utils/cn";

/**
 * The one message style for the whole app: success (role=status, polite) or error (role=alert, assertive),
 * optionally with a bold headline. Used for action results, form-level errors and failed loads alike.
 */
export function Banner({
  tone,
  title,
  children,
  id,
  className,
}: {
  tone: "success" | "error";
  title?: string;
  children?: React.ReactNode;
  id?: string;
  className?: string;
}) {
  const error = tone === "error";
  return (
    <div
      id={id}
      role={error ? "alert" : "status"}
      className={cn(
        "flex items-start gap-2.5 rounded-[var(--radius-component)] border px-4 py-3 text-sm",
        error ? "border-status-danger/40 bg-status-danger-bg text-status-danger" : "border-status-healthy/40 bg-status-healthy-bg text-status-healthy",
        className,
      )}
    >
      {error ? <AlertIcon className="mt-0.5 size-5 shrink-0" /> : <CheckIcon className="mt-0.5 size-5 shrink-0" />}
      <div className="min-w-0">
        {title ? <p className="font-semibold">{title}</p> : null}
        {children ? <div className={cn(title && "mt-0.5", !title && "font-medium")}>{children}</div> : null}
      </div>
    </div>
  );
}
