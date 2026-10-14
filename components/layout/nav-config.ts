// Single source of truth for primary navigation, shared by the desktop sidebar and mobile bottom bar.
export const NAV_ITEMS = [
  { href: "/dashboard", key: "dashboard" },
  { href: "/people", key: "people" },
  { href: "/upload", key: "upload" },
  { href: "/notifications", key: "notifications" },
] as const;

export type NavKey = (typeof NAV_ITEMS)[number]["key"];

/** Active on the route itself or any nested route, but not on a look-alike prefix (e.g. "/uploads"). */
export function isNavActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}
