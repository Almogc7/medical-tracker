import { describe, expect, it } from "vitest";

import { NAV_ITEMS, isNavActive } from "@/components/layout/nav-config";

describe("NAV_ITEMS", () => {
  it("keeps the existing four routes in order", () => {
    expect(NAV_ITEMS.map((i) => i.href)).toEqual(["/dashboard", "/people", "/upload", "/notifications"]);
    expect(NAV_ITEMS.map((i) => i.key)).toEqual(["dashboard", "people", "upload", "notifications"]);
  });
});

describe("isNavActive", () => {
  it("is active on the route itself and on nested routes", () => {
    expect(isNavActive("/dashboard", "/dashboard")).toBe(true);
    expect(isNavActive("/people", "/people")).toBe(true);
    expect(isNavActive("/people/abc123", "/people")).toBe(true);
    expect(isNavActive("/notifications/", "/notifications")).toBe(true);
  });

  it("is not active on other routes or look-alike prefixes", () => {
    expect(isNavActive("/people", "/dashboard")).toBe(false);
    expect(isNavActive("/uploads/file.pdf", "/upload")).toBe(false);
    expect(isNavActive("/dashboard-old", "/dashboard")).toBe(false);
    expect(isNavActive("/", "/dashboard")).toBe(false);
  });

  it("marks exactly one nav item active for each real route", () => {
    for (const item of NAV_ITEMS) {
      const active = NAV_ITEMS.filter((n) => isNavActive(`${item.href}/x`, n.href));
      expect(active.map((n) => n.href)).toEqual([item.href]);
    }
  });
});
