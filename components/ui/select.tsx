import { forwardRef, useId, type SelectHTMLAttributes } from "react";
import { cn } from "@/utils/cn";

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, hint, className, id: idProp, required, children, ...props }, ref) => {
    const generated = useId();
    const id      = idProp ?? generated;
    const errorId = `${id}-error`;
    const hintId  = `${id}-hint`;

    const describedBy = [error ? errorId : null, hint && !error ? hintId : null]
      .filter(Boolean)
      .join(" ") || undefined;

    return (
      <div className="flex flex-col gap-1.5">
        {label ? (
          <label htmlFor={id} className="text-sm font-medium text-slate-700">
            {label}
            {required ? (
              <span className="ml-0.5 text-status-danger" aria-hidden="true">*</span>
            ) : null}
          </label>
        ) : null}

        <select
          ref={ref}
          id={id}
          required={required}
          aria-invalid={error ? "true" : undefined}
          aria-describedby={describedBy}
          className={cn(
            "w-full bg-surface px-3 py-2 text-sm text-slate-900",
            "rounded-[var(--radius-component)] border",
            "transition-colors duration-150",
            "focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent",
            error
              ? "border-status-danger"
              : "border-border hover:border-slate-400",
            "disabled:cursor-not-allowed disabled:bg-border-subtle disabled:opacity-60",
            className,
          )}
          {...props}
        >
          {children}
        </select>

        {hint && !error ? (
          <p id={hintId} className="text-xs text-slate-500">{hint}</p>
        ) : null}

        {error ? (
          <p id={errorId} role="alert" className="text-xs text-status-danger">{error}</p>
        ) : null}
      </div>
    );
  },
);

Select.displayName = "Select";
