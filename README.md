# GB Data Vis

A collection of **custom data visualization components** used in the Gabrielle app (Dashboard).
Implemented without a charting library like D3, working directly with SVG path calculations.

![PersonaRadialChart](docs/assets/persona-radial-chart.png)

**PersonaRadialChart** — a radial comparison of self vs 8 personas across 3 metrics.

## Quick start

```bash
npm install
npm run storybook
```

This opens http://localhost:6006. Here are some stories worth checking out right away.

| App           | Story                                            | Highlights                                                    |
| ------------- | ------------------------------------------------ | ------------------------------------------------------------- |
| **Dashboard** | `Dashboard/UI/PersonaRadialChart` → `Playground` | Badges switch to values on ring hover, avatar hover highlight |
| **Dashboard** | `Dashboard/UI/SelfCuration` → `Playground`       | Orbital self layout                                           |

## Structure

```
components/screens/dashboard/ui/
  persona-radial-chart/                       Self × persona × 3-metric radial chart
  self-curation/                              Orbital self layout (Figma `Self curation`)
  self-slot/                                  The slot reused by SelfCuration (Figma `Part/self`)
components/foundation/                         7 design-token Storybook docs
lib/
  utils.ts                                    cn() — a custom clsx + tailwind-merge setup
  sprite-icon.tsx                              Helper for the /public/icons.svg sprite icons
src/tokens/*.css                              Design tokens (color/typography/spacing/effects)
app/globals.css                               Token imports + theme
public/icons.svg, public/images/personas/     Icon/persona images referenced by components
docs/                                         Spec documents
```

This repository contains **only what's been designated for public release.** The generic atomic
components (`Button`, `Select`, `Tabs`, etc.) these components depend on aren't here — they're in
[GB-HandOff](https://github.com/skey290/GB-HandOff) — you'll need that repo alongside this one to actually run it.

Compass (`compass-dial`, `compass-sphere`, `compass-analysis`, etc.) isn't in this repo yet — its
Figma file is still being reworked, so it lives in the private GB-Review repo until it's ready to
hand off.

## Read this first

**[docs/persona-radial-chart-spec.md](docs/persona-radial-chart-spec.md)** lays out PersonaRadialChart's design intent and the reasoning behind its decisions.

It covers things that are hard to reverse-engineer from the code alone. For example:

- Why coloring is by **rank** rather than value ratio (ratio-based would collapse 8,340 and 8,006 into the same tier)
- Why the highlight ring uses `outline` instead of `border` (border would shrink the avatar from 40px to 36px)
- Why the empty slot's dashed border is kept in both states (`border-style` is a value CSS can't interpolate)

Also check the **undecided items** at the end of the document. Some parts still differ from Figma's values.

## Commands

| Command             | Description                       |
| ------------------- | --------------------------------- |
| `npm run storybook` | Storybook (http://localhost:6006) |
| `npm test`          | Vitest                            |
| `npm run typecheck` | `tsc --noEmit`                    |
| `npm run lint`      | oxlint                            |
| `npm run build`     | Next.js production build          |
| `npm run dev`       | Next.js dev server                |

## Things to watch for

**Don't hardcode colors or sizes.** Every value should reference a CSS variable from `src/tokens/*.css`.

```tsx
// ❌
className = "bg-[#ffffff33] text-sm";

// ✅
fill = "var(--color-rdx-white-4)";
className = "text-xs-bold";
```

**If you add a new typography class, you must also register it in `TYPOGRAPHY_PRESET_CLASSES` in `lib/utils.ts`.** Without that registration, `cn()` (tailwind-merge) mistakes the class for a text _color_ utility and **silently drops it.** There's no error or warning, the build/typecheck/tests all still pass, and only the font size renders at its default.

**The radius/angle constants inside charts aren't design tokens.** They're geometric coordinate values inside the SVG `viewBox`, so they're kept as plain numbers. The component's outer dimensions (canvas size, avatar size), on the other hand, use tokens.

## Tech stack

Next.js 16 · React 19 · TypeScript 5.9 · Tailwind CSS v4 · three.js · Storybook 10 · Vitest 4

## Theme

Since the Figma originals are drawn against a dark background, many components are **dark-only.** The Storybook stories have the `.dark` class applied to pin them to dark mode.
