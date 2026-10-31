# Tooltip

Figma: [📌 GB_Design-System — Atom](https://www.figma.com/design/G9YNa2vjdqDjnML9y5hXJ4/%F0%9F%93%8C-GB_Design-System--Atom-?node-id=79-11350) — the "Tooltip" component page (node-id `79:11350`)
Code: `components/ui/tooltip/tooltip.tsx` (`tooltip.module.css`, `tooltip.stories.tsx`, `tooltip.test.tsx`, `index.ts`) — note `tooltip.module.css` carries every design value in this doc (colors, spacing, the arrow geometry) and is not a separate afterthought file.

> Note: the component set is `3042:539`; the `79:11350` used as the canonical link here is the page frame containing it, not the page itself (the actual page is `73:2904`). `tooltip.stories.tsx` points `parameters.design.url` at `79-11350` as well.

## Overview

A small floating hint that appears when its target is hovered or receives keyboard focus. It holds a short line of text and an arrow pointing at the target. The code uses `@radix-ui/react-tooltip` directly, so the trigger carries the hover and focus events, matching the design intent.

Inside page frame `79:11350`: (1) a description text frame, (2) the single-tone base component `Tool tip base` (node `3042:535`, five properties — the `Title` and `Description` text slots plus the `Show title` / `Show description` / `Close icon` toggles), (3) the `Arrow` symbol, and (4) a 24-variant `Arrow position × Style` matrix (component set `3042:539`, 12 positions × 2 styles).

### Tooltip vs Popover

The codebase also has `components/ui/popover/popover.tsx`, which is easy to confuse but serves an entirely different purpose:

|                   | **Tooltip**                                               | **Popover** (as actually implemented here)                                                                                                |
| ----------------- | --------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Primitive         | `@radix-ui/react-tooltip`                                 | `@radix-ui/react-alert-dialog` (!)                                                                                                        |
| Trigger           | hover / focus                                             | fully controlled by the parent through `open` / `onOpenChange`; it has no trigger element of its own                                      |
| Placement         | anchored to the trigger (`side` / `align`, with an arrow) | always centered on screen, with no anchor                                                                                                 |
| Identity in Figma | the "Tooltip" component (a hover info popup)              | the component set is named "Popover" (node `7269:451`) but **the content layer is named "Alert dialog"** — closer to a confirmation modal |

So the component called "Popover" in this project is really a click-driven confirmation modal, and the conventional hover-driven "popover" interaction does not exist in this codebase — `Tooltip` covers all of it.

## When to use

- To show brief supporting information (a title and/or description) when the trigger is hovered or focused.
- Usage (now in the private GB-Review repo): onboarding coachmarks on the compass dial, attached in a permanently open state to a tick label or a growth badge.

## When not to use

- **Content with controls, or longer than a sentence** → use [Popover](./popover.md). Tooltip is for one short hint.
- **Click-to-open with a confirm/cancel response** → also `Popover` (an alert dialog in practice).

## How to use

```tsx
import { Tooltip } from "./tooltip";

// Default (dark) — the 700ms delay is the default, pinned to 0 in stories and tests
<Tooltip title="Title" description="Tool tip text" delayDuration={0}>
  <button type="button">Hover me</button>
</Tooltip>

// Reversed (light) variant
<Tooltip variant="reversed" title="Title" description="Tool tip text">
  <button type="button">Hover me</button>
</Tooltip>

// Title only / description only
<Tooltip title="Title only">
  <button type="button">Hover me</button>
</Tooltip>
<Tooltip description="Description only">
  <button type="button">Hover me</button>
</Tooltip>

// With a close (X) button — rendered only when onClose is passed
<Tooltip title="Title" description="Tool tip text" onClose={() => {}}>
  <button type="button">Hover me</button>
</Tooltip>

// Explicit placement, held open
<Tooltip variant="default" side="bottom" align="start" open>
  <button type="button">Hover me</button>
</Tooltip>
```

## Structure

- `TooltipPrimitive.Provider` (receiving `delayDuration`) → `Root` (controlled or uncontrolled via `open` / `defaultOpen` / `onOpenChange`) → `Trigger` (`asChild`, so `children` becomes the trigger) → `Portal` → `Content`.
- Inside `Content`:
  - When either `title` or `description` exists, a wrapper stacks the title (`Text-sm/SemiBold`) above the description (`Text-sm/Regular`), each rendered only when present.
  - A close (X) `<button>` appears at the top right only when `onClose` is passed (`aria-label="Close tooltip"`).
  - `TooltipPrimitive.Arrow` is taken `asChild` and rendered as a 10px square rotated 45° into a diamond, with `arrowPadding={7}` on `Content` to match Figma's triangle sitting 7px inside the box corner (`(24 − 10) / 2`). Rotation makes the diagonal 14.14px, so it is pushed back toward the body by `calc(-50% - 2px)`, leaving only the **10px base × 5px tall triangle** Figma specifies (measured in-browser: 5.07px protrusion, 10.14px base). Radix rotates the wrapper per side so the arrow's local −Y always points into the body, which is why one value covers all four directions with no per-side branching. The arrow still does not quite reach the trigger — Radix's `Arrow` wrapper reserves the full `width={10} height={10}` box, but only the 5.07px-tall visible triangle inside it extends outward, leaving roughly 4.93px of empty space between the visible tip and the trigger. There is no Figma basis to say the tip "should" touch the trigger (Figma has no trigger of its own), but the 10px reservation vs. 5px visible protrusion is an internal inconsistency worth fixing if the gap looks wrong — either redraw the arrow as a 10×5 wrapper with the diamond clipped inside it to match Figma's own structure, or offset `sideOffset` to compensate.
- Horizontal padding is asymmetric — 16px left, 32px right. The right side always reserves the left padding (16px) plus the close icon width (16px) **whether or not the close button is present** — confirmed across all 24 Figma variants, though all 24 happen to have the close icon switched on, so "whether or not present" itself can't be directly confirmed from Figma; it is inferred from the layout math being independent of the icon's visibility toggle.

## Props

| Prop               | Type                                                                  | Required | Default               | Description                                                                                                                                                                                                                                        |
| ------------------ | --------------------------------------------------------------------- | -------- | --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `children`         | `React.ReactNode`                                                     | yes      | —                     | The element that triggers the tooltip. Applied through `asChild`                                                                                                                                                                                   |
| `title`            | `React.ReactNode`                                                     | no       | —                     | Tooltip title. Not rendered when falsy — matches the Figma `Show title` toggle                                                                                                                                                                     |
| `description`      | `React.ReactNode`                                                     | no       | —                     | Tooltip description. Not rendered when falsy — matches `Show description`                                                                                                                                                                          |
| `variant`          | `"default" \| "reversed"`                                             | no       | `"default"`           | Matches the Figma `Style` property                                                                                                                                                                                                                 |
| `side`             | `"top" \| "right" \| "bottom" \| "left"`                              | no       | `"top"`               | The primary axis of Figma's `Arrow position` (see Variants for the exact mapping)                                                                                                                                                                  |
| `align`            | `"start" \| "center" \| "end"`                                        | no       | `"center"`            | The secondary axis of Figma's `Arrow position`                                                                                                                                                                                                     |
| `sideOffset`       | `number`                                                              | no       | Radix default (0)     | Forwarded to Radix `Content`. The effective gap between content and trigger is `sideOffset` plus the arrow's own geometry — see the arrow note under Structure for why that currently leaves ~4.93px of unintended empty space even at the default |
| `alignOffset`      | `number`                                                              | no       | Radix default         | Forwarded to Radix `Content`                                                                                                                                                                                                                       |
| `collisionPadding` | `number \| Partial<Record<"top"\|"right"\|"bottom"\|"left", number>>` | no       | `12`                  | Viewport-collision margin. **Not a Figma value** — Figma is a static mockup with no screen-edge collisions, so this is a layout defense defaulting to the 12px spacing step                                                                        |
| `onClose`          | `() => void`                                                          | no       | —                     | Renders the close (X) button only when passed — matches the Figma `Close icon` toggle                                                                                                                                                              |
| `open`             | `boolean`                                                             | no       | —                     | Controlled open state                                                                                                                                                                                                                              |
| `defaultOpen`      | `boolean`                                                             | no       | —                     | Initial open state when uncontrolled                                                                                                                                                                                                               |
| `onOpenChange`     | `(open: boolean) => void`                                             | no       | —                     | Open-state change callback                                                                                                                                                                                                                         |
| `delayDuration`    | `number`                                                              | no       | Radix default (700ms) | Delay in ms before opening after the pointer enters                                                                                                                                                                                                |
| `className`        | `string`                                                              | no       | —                     | Merged onto `Content`                                                                                                                                                                                                                              |

## Variants

### Style (`variant`)

| variant    | Background                     | Text                 | Arrow                  |
| ---------- | ------------------------------ | -------------------- | ---------------------- |
| `default`  | `--gb-background-bold`         | `--gb-text-invert`   | same as the background |
| `reversed` | `--gb-background-mute-subtler` | `--gb-text-emphasis` | same as the background |

In Figma, `reversed` references **the same variables** as `default` but resolves them in the opposite mode. The two variants must therefore always be opposites in both light and dark:

|       | `default` background | `reversed` background |
| ----- | -------------------- | --------------------- |
| Light | `#171717`            | `#e5e5e5`             |
| Dark  | `#e5e5e5`            | `#171717`             |

The code achieves this inversion with **existing mode-aware tokens** — `--gb-background-mute-subtler` (light `#e5e5e5` / dark `#171717`) and `--gb-text-emphasis` (light `#171717` / dark `#fafafa`) match the required values exactly.

Never hardcode a literal hex for `reversed`: in dark mode the default background resolves to `#e5e5e5`, which would make the two variants identical.

### Arrow position (`side` + `align`)

Figma has a 24-variant matrix: `Arrow position` (12 values — BottomLeft / BottomCenter / BottomRight / TopLeft / TopCenter / TopRight / LeftTop / LeftCenter / LeftBottom / RightTop / RightCenter / RightBottom) × `Style` (2). None of these 24 variants exposes `Title` / `Description` / `Close icon` as its own controllable property — every one of them hardcodes an instance of `Tool tip base` with the close icon switched on, so the properties documented under Props below (and under "Figma property names" further down) come from `Tool tip base` itself, not from this 24-variant set.

Figma's primary direction word describes **which edge of the box the arrow is attached to**, which is the opposite of Radix's `side` (which side of the trigger the content appears on):

| Figma primary word          | Measured layout (box ↔ arrow)                                              | `side`   |
| --------------------------- | -------------------------------------------------------------------------- | -------- |
| `Bottom…` (e.g. BottomLeft) | box above, arrow on its bottom edge (pointing down → the trigger is below) | `top`    |
| `Top…`                      | box below, arrow on its top edge                                           | `bottom` |
| `Right…`                    | box on the left, arrow on its right edge                                   | `left`   |
| `Left…`                     | box on the right, arrow on its left edge                                   | `right`  |

The secondary word maps to `align`, confirmed across all 24 node coordinates:

| Figma secondary word | `align`  |
| -------------------- | -------- |
| `…Left` / `…Top`     | `start`  |
| `…Center`            | `center` |
| `…Right` / `…Bottom` | `end`    |

So the vertical family (`Bottom…` / `Top…`) uses Left/Center/Right for horizontal alignment, and the horizontal family (`Left…` / `Right…`) uses Top/Center/Bottom for vertical alignment. Unlike the primary axis, the secondary axis is not inverted.

## States and behaviors

- **Open/close** — opens after `delayDuration` on hover or focus. `open` / `defaultOpen` / `onOpenChange` allow both controlled and uncontrolled use; passing a fixed `open` turns it into an always-visible coachmark.
- **Title and description are independent** — either can be shown alone, and when neither is present the body is not rendered at all.
- **The close button** appears only when `onClose` is passed, and clicking it calls `onClose` only. It does not change `open` by itself, so a controlled consumer must manage that too.
- **collisionPadding** lets Radix flip and shift near the viewport edge — pure defense with no Figma counterpart.
- **There is no open/close animation.** `tooltip.module.css` has zero `transition` or `animation` declarations — the tooltip appears and disappears instantly. Figma is static and gives no basis to say this is wrong, but it's worth knowing this is simply absent, not a deliberate match to a Figma-specified instant transition.
- **The close button** shows `--gb-shadow-focus-ring` on `:focus-visible` — no Figma counterpart.

## Composition with other components

Compass's two consumers moved to the private GB-Review repo along with the rest of Compass — not part of this repo's handoff scope yet. They shared the same "onboarding coachmark" pattern: **CompassDialTick** wrapped its tick label (text or a `Badge` marker) in a `Tooltip` fixed to `variant="reversed"`, always `open`, `side="right"`, `align="start"`, with `coachmark.onDismiss` wired straight to `onClose`; **CompassSelfAvatar** wrapped the growth-percentage `Badge` in the same configuration. Both used Tooltip purely as a **wrapper** around another shared component, forcing `open` to true instead of using the hover trigger. Neither used `title` / `description` as hover-driven supporting text, which was the original intent.

## The shadow scope deliberately differs from Figma

Figma applies `Box Shadow/shadow-sm` to the root (body plus `Arrow`) so it follows the combined silhouette, whereas the code applies it to the content box only. Radix positions the arrow in a separate wrapper, so a `box-shadow` on the root would produce a doubled shadow around the arrow — a `filter: drop-shadow(...)` on the root instead of `box-shadow` on `.content` would get the combined-silhouette look Figma has without that doubling, since `drop-shadow` follows a shape's alpha rather than its box; not implemented, just a sharper option than "this is simply not reproduced."

## Figma property names

The boolean toggles on `Tool tip base` are `Show title` and `Show description`. They do not collide with the text slots (`Title` / `Description`), so codegen emits `showTitle` / `showDescription` rather than suffixed names.
