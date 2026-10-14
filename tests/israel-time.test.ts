import { describe, expect, it } from "vitest";

import { daysUntilIsrael, formatDateTimeInIsrael, israelParts } from "@/utils/israel-time";

// Israel is UTC+3 until 2026-10-25 (DST ends), then UTC+2.
describe("israelParts / formatDateTimeInIsrael", () => {
  it("converts UTC instants to Israel date and time", () => {
    expect(israelParts(new Date("2026-10-13T06:05:00Z"))).toEqual({ day: "2026-10-13", time: "09:05" });
    expect(formatDateTimeInIsrael(new Date("2026-10-12T21:30:00Z"))).toBe("2026-10-13 00:30");
  });
  it("follows the end of daylight saving time", () => {
    expect(formatDateTimeInIsrael(new Date("2026-10-24T21:30:00Z"))).toBe("2026-10-25 00:30"); // still UTC+3
    expect(formatDateTimeInIsrael(new Date("2026-10-25T21:30:00Z"))).toBe("2026-10-25 23:30"); // now UTC+2
  });
});

describe("daysUntilIsrael", () => {
  const expiry = new Date("2026-10-15T12:00:00Z"); // stored at UTC noon of the Israeli date 2026-10-15

  it("counts calendar days in Israel", () => {
    expect(daysUntilIsrael(expiry, new Date("2026-10-13T09:00:00Z"))).toBe(2);
    expect(daysUntilIsrael(expiry, new Date("2026-10-15T09:00:00Z"))).toBe(0);
    expect(daysUntilIsrael(expiry, new Date("2026-10-16T09:00:00Z"))).toBe(-1);
  });

  it("rolls over at Israeli midnight, not UTC midnight", () => {
    // 22:30Z on the 14th is already 01:30 on the 15th in Israel, so the prescription expires today.
    expect(daysUntilIsrael(expiry, new Date("2026-10-14T22:30:00Z"))).toBe(0);
    // 20:30Z on the 14th is 23:30 on the 14th in Israel: one day left.
    expect(daysUntilIsrael(expiry, new Date("2026-10-14T20:30:00Z"))).toBe(1);
  });
});
