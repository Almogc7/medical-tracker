import type { NavKey } from "@/components/layout/nav-config";

// Decorative inline icons (the label always accompanies them or is provided via aria-label).
const base = {
  width: 22,
  height: 22,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
} as const;

export function NavIcon({ name, className }: { name: NavKey; className?: string }) {
  switch (name) {
    case "dashboard":
      return <svg {...base} className={className}><path d="M4 11.5 12 5l8 6.5V19a1 1 0 0 1-1 1h-4v-5H9v5H5a1 1 0 0 1-1-1z" /></svg>;
    case "people":
      return <svg {...base} className={className}><circle cx="9" cy="8" r="3.2" /><path d="M3.5 19c.5-3 2.7-4.8 5.5-4.8s5 1.8 5.5 4.8" /><path d="M16 5.2a3 3 0 0 1 0 5.6M17.5 14.4c1.6.6 2.7 2 3 4.6" /></svg>;
    case "upload":
      return <svg {...base} className={className}><path d="M12 16V5m0 0-4 4m4-4 4 4M5 19h14" /></svg>;
    case "notifications":
      return <BellIcon className={className} />;
  }
}

export function BellIcon({ className }: { className?: string }) {
  return <svg {...base} className={className}><path d="M6 16.5V11a6 6 0 1 1 12 0v5.5l1.5 1.5h-15zM10 20.5a2 2 0 0 0 4 0" /></svg>;
}

export function LogoutIcon({ className }: { className?: string }) {
  return <svg {...base} className={className}><path d="M14 4h4a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-4M10 8l-4 4 4 4M6 12h9" /></svg>;
}

export function CheckIcon({ className }: { className?: string }) {
  return <svg {...base} className={className}><path d="m5 12.5 4.5 4.5L19 7.5" /></svg>;
}

export function AlertIcon({ className }: { className?: string }) {
  return <svg {...base} className={className}><path d="M12 4 3 20h18zM12 10v4m0 3h.01" /></svg>;
}
