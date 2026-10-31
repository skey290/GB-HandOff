# Handoff guide

This repo ([GB-HandOff](https://github.com/skey290/GB-HandOff)) is self-contained — clone it,
`npm install`, and both the real app routes and the component library run locally. No second repo
is needed.

## What's actually done here

Only two screens are QA-complete and meant to be built on. Everything else in this repo is either
a reusable component library (not a full screen) or not production-ready yet.

| Route             | Status                                                                                                                                                                                                         |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/self`           | **Done.** The full Self app — self cluster canvas, asset panel, Create Self, Edit Goal, Archive, the works.                                                                                                    |
| `/content-studio` | **Done, partial.** Only the "Content" tab (schedule panel, post cards, posting modal, profile card, goal editing). The Analysis tab and Archive sub-page are **not** included — out of scope for this handoff. |
| `/`               | Empty placeholder (`<main></main>`). Not a real landing page.                                                                                                                                                  |

Nothing else has a route. Dashboard and Know Thyself have reusable components
(`components/screens/dashboard/`) but no assembled page — the GNB items for them in both screens
above are inert (`GNB_PATHS` only maps `assets` and `contents-studio`, so clicking the other icons
does nothing). Compass isn't in this repo at all — its Figma file is still being reworked, so it
lives in a separate private repo until it's ready.

## Quick start

```bash
npm install
npm run dev          # http://localhost:3000/self or /content-studio
npm run storybook    # http://localhost:6006 — every components/ui/* and components/app/* piece in isolation
```

Other commands: `npm test` (Vitest), `npm run typecheck`, `npm run lint` (oxlint), `npm run build`.

## There is no backend. Everything is dummy data in memory

Firebase (user/app data) and Supabase (DB connection pointer only) are planned but **not wired up**
anywhere in this repo. Every "self", post, schedule, and goal you see is seeded from in-memory
mock data and reset on reload. The two files that matter most if you're replacing this with real
data:

- `components/app/goal-setting/self-goal-data.ts` — the list of selves (`SELF_OPTIONS`), their
  goal/tone-of-voice data, all as module-level `let` variables with a hand-rolled
  pub/sub (`useSelfGoal`, `useContentGoal`, `useToneOfVoice`). Swap the store, keep the hook shape
  and callers don't need to change.
- `components/screens/content-studio/data.ts` — post/schedule types and the slot-generation math
  (`createNextDaySlots`, `deriveScheduleFromFrequency`, etc.). The scheduling _logic_ here is real;
  only the seed data (`INITIAL_SLOTS`, `createGeneratedPosts`) is fake.
- `app/self/page.tsx`'s `PERSONA_POOL` — the 8 seeded personas shown in the Self canvas, plus
  per-self goal overrides kept in local component state (not persisted anywhere).

Replacing dummy data with a real backend means swapping what's inside these stores/constants, not
rewriting the components that consume them.

## Where things live

```
components/ui/           Generic design-system atoms (Button, Select, Dialog, Toggle, ...) — Shadcn-based, Figma-driven
components/app/          Cross-app shared compositions (Gnb, GoalSetting dialogs, AssetGalleryDialog, ChatboxComposer, ...)
components/screens/
  self/ui/                SelfCluster, AssetPanel — consumed by app/self/page.tsx
  content-studio/         PostCard, SchedulePanel, PostingModal, and the dialog/data glue consumed by app/content-studio/page.tsx
  dashboard/ui/           PersonaRadialChart, SelfCuration — no assembled page yet, Storybook-only for now
components/foundation/   Design-token documentation stories (not product UI)
src/tokens/*.css          Token source of truth — colors/typography/spacing/radius/border/effects/opacity, all `--gb-*` prefixed
app/globals.css           Token imports + Tailwind v4 `@theme inline` + Shadcn bridge variables
lib/utils.ts               cn() — clsx + tailwind-merge, with a typography-class registry (see "Watch out for" below)
lib/sprite-icon.tsx         /public/icons.svg sprite → React icon helper
docs/                       Everything below
```

## Docs worth reading before you touch anything

- **[design-tokens.md](design-tokens.md)** — the token reference. Read this before writing any
  color/spacing value. Hardcoded hex or raw px is the one thing reviewed hardest in this codebase.
- **[components/\*.md](components)** — one file per `components/ui/` and `components/app/`
  component, documenting real composition patterns, deliberate deviations from Figma, and
  Figma-vs-code discrepancies that were investigated and resolved. Worth checking before you touch
  a component you think you understand — there's usually a non-obvious reason something is built
  the way it is.
- **[GB_Self.md](GB_Self.md)** / **[GB_Content_Studio.md](GB_Content_Studio.md)** /
  **[GB_Know_Thyself.md](GB_Know_Thyself.md)** / **[GB_Dashboard.md](GB_Dashboard.md)** — per-app
  screen/flow specs, reverse-engineered from Figma since no spec doc existed originally. These
  describe intended behavior, including things not yet built (clearly marked as such) and open
  questions still pending designer confirmation (see each doc's "Open Items" section).
- **[GB_all.md](GB_all.md)** — the master doc: product principles, terminology (`self`/`identity`,
  never `persona`, in user-facing copy), and the 4-module structure.

## Things to watch out for

- **No hardcoded colors or spacing.** Always `var(--gb-color-*)` / `var(--gb-spacing-*)`. Component
  own-size (not spacing) is the one exception — those are literal px (e.g. `h-[36px]`) per Figma.
- **If you add a new typography class, register it in `TYPOGRAPHY_PRESET_CLASSES` in
  `lib/utils.ts`.** Otherwise `cn()` (tailwind-merge) mistakes it for a color utility and silently
  drops it — no error, build/typecheck/tests all still pass, only the font size is wrong.
- **Storybook stories are documentation, not the real usage code** for components with a
  click-to-demo wrapper (`render:` + local `useState`). Those pin `docs.source.code` to the actual
  production snippet — don't copy what the canvas demo wrapper looks like.
- A few lines in the `GB_*.md` spec docs quote Figma UI copy verbatim (e.g. `"Edit Assets"`,
  `"Created in: Assets / Content Studio"`) for features that aren't implemented yet. Those are
  left as literal Figma text, not a naming inconsistency — don't "fix" them to match the renamed
  GNB label without checking Figma first.

## Tech stack

Next.js · React 19 · TypeScript · Tailwind CSS v4 · Storybook · Vitest
