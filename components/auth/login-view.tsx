"use client";

import { useEffect, useId, useRef, useState } from "react";

import { heebo } from "@/components/layout/app-font";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { Banner } from "@/components/ui/banner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LocaleProvider } from "@/components/ui/locale-provider";
import { useLocale } from "@/components/ui/locale-provider";
import type { LocaleContextValue } from "@/types/i18n";
import { cn } from "@/utils/cn";

const FONT_STACK = {
  en: "var(--font-geist-sans), var(--font-heebo), system-ui, sans-serif",
  he: "var(--font-heebo), var(--font-geist-sans), system-ui, sans-serif",
} as const;

const icon = { width: 22, height: 22, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true } as const;

type FieldErrors = { email?: string; password?: string };

function LoginCard({ hasError, action }: { hasError: boolean; action: string }) {
  const { t } = useLocale();
  const emailId = useId();
  const passwordId = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // If the browser restores this page from its back/forward cache, do not stay stuck on "Signing in…".
  useEffect(() => {
    const reset = (e: PageTransitionEvent) => {
      if (e.persisted) setSubmitting(false);
    };
    window.addEventListener("pageshow", reset);
    return () => window.removeEventListener("pageshow", reset);
  }, []);

  /**
   * Validates before the native POST. When valid, the event is left alone, so the browser submits the same
   * form (fields "email" and "password") to the same action as before; only the checks and messages are new.
   */
  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    const data = new FormData(e.currentTarget);
    const email = String(data.get("email") || "").trim();
    const password = String(data.get("password") || "");

    const next: FieldErrors = {};
    if (!email) next.email = t.auth.emailRequired;
    else if (!/^\S+@\S+\.\S+$/.test(email)) next.email = t.auth.emailInvalid;
    if (!password) next.password = t.auth.passwordRequired;
    setErrors(next);

    if (next.email || next.password) {
      e.preventDefault();
      (formRef.current?.elements.namedItem(next.email ? "email" : "password") as HTMLElement | null)?.focus();
      return;
    }
    setSubmitting(true);
  }

  return (
    <div className="w-full max-w-md">
      <div className="mb-6 flex items-center gap-3">
        <span className="flex size-11 items-center justify-center rounded-[var(--radius-panel)] bg-accent text-accent-fg">
          <svg {...icon}><path d="M5 19c0-8 5-13 14-14 0 9-5 14-13 14M5 19c2-4 5-7 9-9" /></svg>
        </span>
        <p className="text-base font-semibold tracking-wide text-accent">{t.appName}</p>
      </div>

      <div className="rounded-[var(--radius-panel)] border border-border bg-surface p-5 sm:p-6">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">{t.auth.title}</h1>
        <p className="mt-1 text-sm text-foreground-muted">{t.auth.subtitle}</p>

        {hasError ? (
          <Banner id="login-error" tone="error" className="mt-5">{t.auth.invalid}</Banner>
        ) : null}

        <form ref={formRef} action={action} method="post" noValidate onSubmit={onSubmit} className="mt-5 space-y-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor={emailId} className="text-sm font-medium text-foreground-muted">{t.auth.email}</label>
            <Input
              id={emailId}
              name="email"
              type="email"
              inputMode="email"
              autoComplete="username"
              autoCapitalize="none"
              spellCheck={false}
              autoFocus={hasError}
              aria-describedby={errors.email ? `${emailId}-error` : hasError ? "login-error" : undefined}
              error={errors.email}
              onChange={() => errors.email && setErrors((e) => ({ ...e, email: undefined }))}
              className="h-12"
              dir="ltr"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor={passwordId} className="text-sm font-medium text-foreground-muted">{t.auth.password}</label>
            <div className="relative">
              <Input
                id={passwordId}
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                aria-describedby={errors.password ? `${passwordId}-error` : undefined}
                error={errors.password}
                onChange={() => errors.password && setErrors((e) => ({ ...e, password: undefined }))}
                className="h-12 pe-12"
                dir="ltr"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-pressed={showPassword}
                aria-label={showPassword ? t.auth.hidePassword : t.auth.showPassword}
                className="absolute end-0 top-0 inline-flex size-12 touch-manipulation items-center justify-center rounded-[var(--radius-component)] text-foreground-muted transition-colors hover:text-foreground"
              >
                {showPassword ? (
                  <svg {...icon}><path d="M3 3l18 18M10.6 6.2A9.8 9.8 0 0 1 12 6c5 0 8.5 4 9.5 6a12 12 0 0 1-2.4 3.1M6.5 7.6C4.3 9 2.9 11 2.5 12c1 2 4.5 6 9.5 6 1.4 0 2.6-.3 3.7-.8M9.9 9.9a3 3 0 0 0 4.2 4.2" /></svg>
                ) : (
                  <svg {...icon}><path d="M2.5 12C3.5 10 7 6 12 6s8.5 4 9.5 6c-1 2-4.5 6-9.5 6s-8.5-4-9.5-6z" /><circle cx="12" cy="12" r="3" /></svg>
                )}
              </button>
            </div>
          </div>

          <Button type="submit" variant="primary" size="lg" className="w-full touch-manipulation active:scale-[0.98]" loading={submitting}>
            {submitting ? t.auth.signingIn : t.auth.login}
          </Button>
        </form>
      </div>
    </div>
  );
}

/**
 * Login screen. Authentication itself is unchanged: this is still a native form POST to /api/auth/login
 * (fields "email" and "password"), and a failed login still comes back as /login?error=1 (`hasError`).
 * No email is prefilled (nothing from the server environment reaches this public page); browsers can still autofill
 * through autocomplete="username" / "current-password".
 */
export function LoginView({ localeContext, hasError, action = "/api/auth/login" }: { localeContext: LocaleContextValue; hasError: boolean; action?: string }) {
  return (
    <LocaleProvider value={localeContext}>
      <div
        dir={localeContext.dir}
        style={{ fontFamily: FONT_STACK[localeContext.locale] }}
        className={cn(
          heebo.variable,
          "flex min-h-dvh flex-col bg-canvas",
          // viewport-fit=cover is on, so keep content clear of notches and the home indicator.
          "pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))] ps-[max(1rem,env(safe-area-inset-left))] pe-[max(1rem,env(safe-area-inset-right))]",
        )}
      >
        <div className="flex justify-end"><LanguageSwitcher /></div>
        <main className="flex flex-1 items-center justify-center py-6">
          <LoginCard hasError={hasError} action={action} />
        </main>
      </div>
    </LocaleProvider>
  );
}
