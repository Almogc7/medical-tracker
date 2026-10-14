import { Heebo } from "next/font/google";

// Hebrew-capable companion to Geist (which has no Hebrew glyphs). Applied once by AppShell so every page shares the same Hebrew typography.
export const heebo = Heebo({ subsets: ["hebrew", "latin"], variable: "--font-heebo", display: "swap" });
