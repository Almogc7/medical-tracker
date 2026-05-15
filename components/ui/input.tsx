import { forwardRef, useId, type InputHTMLAttributes } from "react";
import { cn } from "@/utils/cn";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className, id: idProp, required, ...props }, ref) => {
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

        <input
          ref={ref}
          id={id}
          required={required}
          aria-invalid={error ? "true" : undefined}
          aria-describedby={describedBy}
          className={cn(
            "w-full bg-surface px-3 py-2 text-sm text-slate-900",
            "rounded-[var(--radius-component)] border",
            "placeholder:text-slate-400",
            "transition-colors duration-150",
            // Focus — overrides global *:focus-visible ring so border color also updates
            "focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent",
            // State
            error
              ? "border-status-danger"
              : "border-border hover:border-slate-400",
            "disabled:cursor-not-allowed disabled:bg-border-subtle disabled:opacity-60",
            className,
          )}
          {...props}
        />

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

Input.displayName = "Input";
