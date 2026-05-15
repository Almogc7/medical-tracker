# Design

## Color Strategy
Restrained. Warm tinted neutrals + one deep sage accent.

Avoided reflexes:
- Healthcare white+teal (first-order: "medical = teal")
- Trustworthy navy blue (second-order: "medical tracker = navy")

Chosen direction: warm parchment base + deep forest sage action color.
Rationale: grounded, natural, reliable — not corporate, not clinical.

## Color Tokens (OKLCH)

### Base surfaces
- `--color-canvas`: `oklch(97% 0.008 100)` — warm parchment background
- `--color-surface`: `oklch(99.5% 0.004 100)` — card/panel surface
- `--color-border`: `oklch(88.5% 0.010 100)` — default border
- `--color-border-subtle`: `oklch(93% 0.007 100)` — subtle divider

### Accent — deep sage
- `--color-accent`: `oklch(40% 0.13 155)` — primary actions, active nav
- `--color-accent-hover`: `oklch(34% 0.13 155)` — hover state
- `--color-accent-fg`: `oklch(98% 0.004 100)` — text on accent bg
- `--color-accent-subtle`: `oklch(94% 0.04 155)` — tinted accent bg

### Sidebar (dark chrome)
- `--color-sidebar`: `oklch(17% 0.016 100)` — dark sidebar bg
- `--color-sidebar-hover`: `oklch(24% 0.016 100)` — hover row
- `--color-sidebar-active`: `oklch(40% 0.13 155)` — active row
- `--color-sidebar-text`: `oklch(62% 0.012 100)` — default nav label
- `--color-sidebar-text-active`: `oklch(97% 0.006 100)` — active/hover label

### Status semantics
- Healthy/Active: `oklch(45% 0.15 145)` on `oklch(95% 0.045 145)`
- Warning/Expiring: `oklch(50% 0.17 80)` on `oklch(96% 0.05 80)`
- Danger/Expired: `oklch(48% 0.20 25)` on `oklch(96% 0.06 25)`
- Issued/Neutral: `oklch(50% 0.06 240)` on `oklch(95% 0.025 240)`

## Typography
- Family: Geist (already loaded via Next.js). System-ui fallback. No second family needed.
- Scale: fixed rem (product UI, not marketing). `text-wrap: balance` on headings.
- Body: 0.875rem (14px), line-height 1.5
- Labels: 0.75rem (12px), uppercase + letter-spacing for section labels
- Tabular nums on all numeric data (`font-variant-numeric: tabular-nums`)

## Spacing
- Content padding: `p-3` mobile → `p-6` desktop (existing, keep)
- Card padding: `p-4` (slightly tighter than current `p-5`)
- Section gap: `gap-5` between major sections
- List items: `gap-2` between siblings, `py-3` vertical padding

## Elevation
- Cards: 1px border, no shadow by default (shadow-sm only on interactive hover)
- Modals: `shadow-xl` with dark overlay
- Sidebar: separate chrome via dark background, no shadow needed

## Components

### Sidebar
Dark. Width 240px. App name in accent color at top. Nav items: default muted text, hover darkens bg, active uses accent bg with white text.

### Status Badge
Dot indicator + text. Not pill-only. Example: `● Active`, `● Expiring Soon`.

### Stats
Inline stat items, no card per stat. Numbers in tabular-nums. Grouped in a single lightly-bordered row.

### Empty State
No card wrapper. Simple centered text: a short descriptive title + one-line instruction. No "No data available" generic copy.

## Accessibility
- Focus rings: 2px sage outline, 2px offset, on all interactive elements
- Minimum touch target: 44px height on all buttons
- Contrast: all text meets WCAG AA (4.5:1 minimum)
- Semantic HTML: proper heading hierarchy, landmark roles
