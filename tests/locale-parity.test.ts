import { describe, expect, it } from "vitest";

import { en } from "@/locales/en";
import { he } from "@/locales/he";

type Tree = { [key: string]: string | Tree };

function leaves(tree: Tree, prefix = ""): Record<string, string> {
  return Object.entries(tree).reduce<Record<string, string>>((acc, [key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    return typeof value === "string" ? { ...acc, [path]: value } : { ...acc, ...leaves(value, path) };
  }, {});
}

const placeholders = (s: string) => (s.match(/\{\w+\}/g) ?? []).sort();

describe("English / Hebrew translation parity", () => {
  const e = leaves(en as unknown as Tree);
  const h = leaves(he as unknown as Tree);

  it("has exactly the same keys in both languages", () => {
    expect(Object.keys(h).sort()).toEqual(Object.keys(e).sort());
  });

  it("has no empty strings", () => {
    for (const [k, v] of [...Object.entries(e), ...Object.entries(h)]) expect(v.trim(), k).not.toBe("");
  });

  it("uses the same {placeholders} in both languages for every key", () => {
    for (const k of Object.keys(e)) expect(placeholders(h[k]), k).toEqual(placeholders(e[k]));
  });

  it("uses one label per urgency level (no two statuses share the same text in a language)", () => {
    for (const t of [en, he]) {
      const labels = [t.status.expired, t.status.urgent, t.status.expiringSoon, t.status.active, t.status.issued];
      expect(new Set(labels).size).toBe(labels.length);
    }
  });
});
