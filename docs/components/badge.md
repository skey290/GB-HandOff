# Badge

Figma: [📌 GB_Design-System — Atom](https://www.figma.com/design/G9YNa2vjdqDjnML9y5hXJ4/%F0%9F%93%8C-GB_Design-System--Atom-?node-id=665-2024) · node-id `665:2024`
Code: `components/ui/badge/badge.tsx`

## Overview

A small inline component for a label, count, or status. It is `<span>`-based and lays out the text (`children`) beside an optional icon slot (`icon`).

The axes are `Style` (six colors) and `Size` (20 / 28), and all twelve products are drawn. There is no `Status` axis — no disabled variant exists in Figma, and none exists in code either, so the two agree.

## When to use

- To emphasize a short label, a count, or a status/delta value on one line (live examples: counts beside tabs, tags on history rows, growth indicators).
- When a small icon must sit beside the text (`icon` prop, 10×10 or 14×14 depending on `size`).

## When not to use

**When a clickable, selectable, or deletable pill is needed, use [Chips](./chips.md), not Badge.** Badge is a passive display element with no selected state — the Figma description says so explicitly.

## How to use

```tsx
// Basic
<Badge variant="default">Badge</Badge>

// Success delta
<Badge variant="success">+0.2pp</Badge>

// destructive — semibold typography is applied automatically
<Badge variant="destructive">Badge</Badge>

// size 28
<Badge variant="default" size="28">Badge</Badge>

// Icon slot
<Badge
  variant="default"
  icon={
    <svg viewBox="0 0 10 10" fill="none" aria-hidden="true">
      <circle cx="5" cy="5" r="4" stroke="currentColor" strokeDasharray="2 2" />
    </svg>
  }
>
  Badge
</Badge>
```

## Structure

- Root: `<span>`, extending `React.HTMLAttributes<HTMLSpanElement>` with the rest of the props spread through.
- Icon slot: rendered only when `icon` is given, wrapped in `<span aria-hidden="true">`. 10px at `size=20`, 14px at `size=28`.
- `children` renders after the icon.

## Props

| Prop       | Type                                                                           | Required | Default     | Description                                                                     |
| ---------- | ------------------------------------------------------------------------------ | -------- | ----------- | ------------------------------------------------------------------------------- |
| `variant`  | `"default" \| "reverse" \| "outline" \| "alarm" \| "success" \| "destructive"` | no       | `"default"` | Color variant, mapping 1:1 onto the six Figma `Style` values                    |
| `size`     | `"20" \| "28"`                                                                 | no       | `"20"`      | Badge height, using the Figma `Size` values verbatim as strings                 |
| `icon`     | `React.ReactNode`                                                              | no       | —           | Leading icon slot (Figma `leadingIcon`). 10×10 at `size=20`, 14×14 at `size=28` |
| `children` | `React.ReactNode`                                                              | no       | —           | Label text. Omitting it renders the icon alone (Figma `Label=false`)            |
| rest       | `React.HTMLAttributes<HTMLSpanElement>`                                        | no       | —           | `onClick`, `className`, `data-*`, … forwarded to the span                       |

## Variants

### Style (color)

| variant             | Background                      | Text                     | Border                       |
| ------------------- | ------------------------------- | ------------------------ | ---------------------------- |
| `default` (default) | `--gb-background-bold`          | `--gb-text-invert`       | none                         |
| `reverse`           | `--gb-background-default`       | `--gb-text-default`      | inset, `--gb-border-bolder`  |
| `outline`           | transparent                     | `--gb-text-subtle`       | inset, `--gb-border-muted`   |
| `alarm`             | transparent                     | `--gb-text-warning`      | inset, `--gb-border-warning` |
| `success`           | transparent                     | `--gb-text-success`      | inset, `--gb-border-success` |
| `destructive`       | `--gb-background-error-default` | `--gb-text-static-white` | none                         |

Borders are implemented as an inset `box-shadow` rather than a real `border`, so they take no layout space and every variant keeps exactly the same height.

### Size

| size           | Height | Horizontal padding | Typography       |
| -------------- | ------ | ------------------ | ---------------- |
| `20` (default) | 20px   | `--gb-spacing-1-5` | `text-xs-medium` |
| `28`           | 28px   | `--gb-spacing-3`   | `text-sm-medium` |

### Compound variant

`destructive` uses semibold typography (`text-xs-semi-bold` / `text-sm-semi-bold`) at either size; the other five use medium. `badge.test.tsx` pins this with "uses semibold typography only for the destructive variant".

## States and behaviors

- There is no state axis — no hover, focus, active, or disabled styles exist in Figma or in code.
- In a disabled context, the Badge is **not rendered at all** rather than given a state — `tabs.tsx` omits it when `item.disabled`.
- The icon wrapper always carries `aria-hidden="true"` (treated as decorative).

## Composition with other components

- **Tabs** (`components/ui/tabs`): count beside a tab label, rendered only when `count` is a number and the tab is not disabled. `variant={selected ? "default" : "outline"}` ties the badge color to selection.
- **NotiDropdown** (`components/app/noti-dropdown`): reuses Badge indirectly through Tabs (the All/Unread header tabs with counts).
- **Gnb Work History panel** (`GnbHistoryPanel` in `components/app/gnb`): a fixed `variant="outline"` tag at the start of each history row, beside the label and timestamp.
- **PersonaRadialChart** (`components/screens/dashboard/ui/persona-radial-chart`): a passive, non-clickable metric display, toggling `default` / `outline` by `emphasized`. In the unselected state it overrides Badge's outline color directly, and adds a custom fade transition class through `className`.
- Compass's four Badge consumers (**CompassDialTick**, **CompassSelfAvatar**, **CompassMetricCard**, **CompassDetailView**) moved to the private GB-Review repo along with the rest of Compass — not part of this repo's handoff scope yet.

The shared pattern: Badge is always composed by **toggling between two variants based on a value or state** (default ↔ outline, alarm ↔ reverse). When a custom color is needed, override it through `className` with another `var(--…)` token rather than a Tailwind arbitrary value.

## Icon color is not defined in Figma

All twelve variants use the same placeholder instance (`lucide/circle-dashed`, `4063:4787`) with no color override. **Figma therefore has no per-variant icon color**, and the code inheriting the icon color from the badge's text color does not contradict it.

Borders bind both color and width to variables — color per Style (`border/muted`, `border/bolder`, `border/warning`, `border/success`) and width to the shared `stroke/1`. `default` and `destructive` have no border.
