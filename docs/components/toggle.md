# Toggle

- Code: `components/ui/toggle/toggle.tsx` (`toggle.module.css`, `toggle.stories.tsx`, `toggle.test.tsx`, `index.ts`)
- Figma: [📌 GB_Design-System (Atom)](https://www.figma.com/design/G9YNa2vjdqDjnML9y5hXJ4/%F0%9F%93%8C-GB_Design-System--Atom-?node-id=7214-444) — node-id `7214:444` (the "Toggle" set, 20 variants) / `7214:437` ("Part/Toggle", 6 variants)

## Overview

`Toggle` groups several pressable buttons into one segmented, mutually-exclusive control (`role="radiogroup"`). Each button carries `role="radio"` and expresses its selected state through `aria-checked`, and the count comes from the `items` array (`ToggleItem[]`).

It is **a different component from `Switch`**, which expresses a single on/off. `Switch` is a `role="switch"` track-and-thumb slider for one boolean; `Toggle` is a segmented control placing several `role="radio"` buttons side by side inside a `role="radiogroup"` — clicking an item selects it, and a re-click on the already-selected item is ignored. The names are similar but the structures and purposes do not overlap.

**Always single-selection.** Figma's `Toggle` description says "each button can be pressed on or off independently" (an icon toolbar where several can be on at once), but every real usage in this app (`CompassToolbar`'s Home/Analysis tabs, the Analysis submenu's four icons) is actually a mutually-exclusive segmented control. The component used to support both via a `selectionMode` prop (`"multiple"` default / `"single"`), but since `"multiple"` had zero real consumers, it was removed and the component now always behaves as `"single"` — this is a deliberate, confirmed deviation from that one line of the Figma description, not an oversight.

The Figma description for `Part/Toggle` ends with "Not meant to be placed on its own", and the `Toggle` description notes that **hover, press, and selected all share the same active appearance**. That sentence decides the state design here — it is why the `Status` variant has only `default` and `disabled`, and it is the documented basis for giving hover the pressed appearance.

Figma has four axes with a sparse combination matrix (20 `Toggle` variants):

| `Type` (content) | `Style` (layout) | `Number` | Notes                                                                      |
| ---------------- | ---------------- | -------- | -------------------------------------------------------------------------- |
| `icon`           | `horizontal`     | 1–5      | bordered box with dividers                                                 |
| `icon`           | `grid`           | 4        | 2×2 only                                                                   |
| `text`           | `horizontal`     | 2        | pill (segment) track — the AM/PM shape                                     |
| `text + icon`    | `horizontal`     | 3        | pill toggle (2) plus a **separate `Button`** (1)                           |
| `text + icon`    | `vertical`       | 3, 4     | vertical stack of icon chips with the supporting label **outside** the box |

**`Type=text + icon` means something completely different depending on `Style`** — in `vertical` it is "icon plus an external label", in `horizontal` it is "text toggle plus an icon Button beside it". The axes are not orthogonal.

The code maps those four axes onto three props:

| Figma                             | Code                                       |
| --------------------------------- | ------------------------------------------ |
| `Type=icon`                       | `type="icon"`                              |
| `Type=text`                       | `type="text"`                              |
| `Type=text + icon` × `vertical`   | `type="icon"` + `item.label`               |
| `Type=text + icon` × `horizontal` | `type="text"` + `trailingAction`           |
| `Style`                           | `orientation`                              |
| `Number`                          | `items.length` (no runtime limit)          |
| `Status`                          | `disabled` (group) / `item.pressed` (item) |

`Part/Toggle`'s `Status=active` is an item-level state (`item.pressed`), while the `Toggle` container's `Status=disabled` is a group-level state (`disabled`) — different axis levels.

## When to use

- When a segmented, mutually-exclusive control is needed — exactly one item selected at a time. Three layouts are supported: a horizontal row, a vertical column (which can show a supporting label beside each icon), and a 2×2 grid.
- Live example: `app/compass/page.tsx` renders the floating Analysis submenu directly as an `orientation="vertical"` Toggle — no separate wrapper component — mapping each item's `pressed` from one `value` in page state.

## When not to use

- **For a single boolean** → use [Switch](./switch.md). Toggle is a segmented group of several buttons.

## How to use

```tsx
// Horizontal pair (Figma Type=icon, Number=2)
<Toggle
  orientation="horizontal"
  items={[
    { icon: <BookmarkIcon />, "aria-label": "Bookmark 1" },
    { icon: <BookmarkIcon />, "aria-label": "Bookmark 2" },
  ]}
/>

// Vertical four with supporting labels (Figma Type=text + icon, Style=vertical, Number=4)
<Toggle
  orientation="vertical"
  items={[
    { icon: <BookmarkIcon />, "aria-label": "Bookmark 1", label: "Growth Potential" },
    { icon: <BookmarkIcon />, "aria-label": "Bookmark 2", label: "Reach" },
    { icon: <BookmarkIcon />, "aria-label": "Bookmark 3", label: "Engagement" },
    { icon: <BookmarkIcon />, "aria-label": "Bookmark 4", label: "Ranking" },
  ]}
/>

// 2×2 grid (Figma Type=icon, Style=grid, Number=4)
<Toggle orientation="grid" items={fourItems} />

// Pill segments (Figma Type=text, Number=2) — always exactly one selected, like AM/PM
<Toggle
  type="text"
  items={[
    { text: "AM", pressed: true, onPressedChange: () => setPeriod("AM") },
    { text: "PM", onPressedChange: () => setPeriod("PM") },
  ]}
/>

// Pill plus a trailing icon Button (Figma Type="text + icon", Style=horizontal, Number=3)
<Toggle
  type="text"
  items={amPmItems}
  trailingAction={{ icon: "calendar-icon", "aria-label": "Pick a date", onClick: openCalendar }}
/>

// Disable the whole group
<Toggle orientation="horizontal" items={threeItems} disabled />
```

The component always behaves as a radio group — it handles the ARIA roles (`radiogroup` / `radio`) and ignores re-clicks on the already-selected item. The parent only keeps the selected value in state and maps each item's `pressed`.

## Structure

Five files per the project component rule: `toggle.tsx` / `toggle.module.css` / `toggle.stories.tsx` / `toggle.test.tsx` / `index.ts` (exporting `Toggle`, `ToggleProps`, `ToggleItem`).

The DOM branches by orientation:

```
<div role="radiogroup">                  container (border / radius / shadow)
  horizontal: flex-row, overflow clipped
    <button role="radio" aria-checked>…</button>   vertical divider between items (2px, --gb-border-default)
  vertical: flex-col, width fit-content
    <div>                                per-row wrapper (width decided by the button alone)
      <button role="radio" aria-checked>…</button>
      <span data-slot="toggle-label">    only when label exists, absolutely placed outside the button
    </div>                               horizontal divider between rows
  grid: flex-col, overflow clipped
    <div>                                rows of two
      <button role="radio" aria-checked>…</button>   vertical dividers between items, horizontal between rows
```

- Icons are fixed at 16px inside `<span data-slot="toggle-icon" aria-hidden="true">`.
- Dividers are `<span data-slot="toggle-divider" aria-hidden="true">` colored `--gb-border-default`.
- The vertical label sits `position: absolute; left: 100%`, outside the button box. In the Figma original the bordered box stays at the 34px icon-chip width regardless of label length, and this reproduces that. `width: fit-content` on the container is essential — inside a `align-items: stretch` flex column the container would grow to its siblings and push the labels out of place.
- The first and last vertical rows apply the container's rounding (`--gb-radius-scale-lg`) directly to the button background, matching the measured Figma values.

## Props

### `ToggleProps`

| Prop             | Type                                                     | Required | Default        | Description                                                                                 |
| ---------------- | -------------------------------------------------------- | -------- | -------------- | ------------------------------------------------------------------------------------------- |
| `items`          | `ToggleItem[]`                                           | yes      | —              | The items in the group                                                                      |
| `type`           | `"icon" \| "text"`                                       | no       | `"icon"`       | Item content. `icon` is a bordered box with dividers; `text` is pills on a track background |
| `orientation`    | `"horizontal" \| "vertical" \| "grid"`                   | no       | `"horizontal"` | Layout (Figma `Style`). Figma defines `type="text"` only as `horizontal`                    |
| `trailingAction` | `{ icon: IconId; "aria-label": string; onClick? }`       | no       | —              | An icon `Button` set apart to the right of the pill (Figma `Type="text + icon"` horizontal) |
| `disabled`       | `boolean`                                                | no       | `false`        | Disables the whole group. **Per-item disabling is not supported**                           |
| rest             | `Omit<React.HTMLAttributes<HTMLDivElement>, "children">` | no       | —              | Forwarded to the root `<div role="radiogroup">`                                             |

### `ToggleItem`

A **discriminated union** of icon items and text items — `icon` and `text` cannot both be passed.

Shared:

| Prop              | Type                         | Required | Description                                                                              |
| ----------------- | ---------------------------- | -------- | ---------------------------------------------------------------------------------------- |
| `pressed`         | `boolean`                    | no       | Pressed state (Figma `Part/Toggle Status=active`). Defaults to `false`                   |
| `onPressedChange` | `(pressed: boolean) => void` | no       | Called with `true` when an unpressed item is clicked; ignored on an already-pressed item |
| `label`           | `string`                     | no       | Supporting label rendered **outside** the button, only in `orientation="vertical"`       |

`ToggleIconItem`:

| Prop           | Type              | Required | Description                               |
| -------------- | ----------------- | -------- | ----------------------------------------- |
| `icon`         | `React.ReactNode` | yes      | Icon rendered in the 16×16 slot           |
| `"aria-label"` | `string`          | yes      | Required — the button has no visible text |

`ToggleTextItem`:

| Prop           | Type     | Required | Description                                  |
| -------------- | -------- | -------- | -------------------------------------------- |
| `text`         | `string` | yes      | Text rendered inside the button              |
| `"aria-label"` | `string` | no       | Omitting it makes `text` the accessible name |

## Variants

### Orientation

| orientation            | Container layout               | Divider                                         | Figma `Number` values     |
| ---------------------- | ------------------------------ | ----------------------------------------------- | ------------------------- |
| `horizontal` (default) | flex row, overflow clipped     | vertical line between items                     | 1, 2, 3, 4, 5             |
| `vertical`             | flex column, width fit-content | horizontal line between rows                    | 3, 4 (always with labels) |
| `grid`                 | flex column of two-item rows   | vertical between items, horizontal between rows | 4 (2×2 only)              |

### Status

`type="icon"` items:

| Status                         | Background                    | Icon                     |
| ------------------------------ | ----------------------------- | ------------------------ |
| Default (unpressed, enabled)   | `--gb-background-default`     | `--gb-icon-default`      |
| **hover** (unpressed, enabled) | `--gb-background-mute-subtle` | `--gb-icon-static-white` |
| `pressed`                      | `--gb-background-mute-subtle` | `--gb-icon-static-white` |
| `disabled`                     | `--gb-background-disabled`    | `--gb-icon-static-gray`  |

`type="text"` items:

| Status                         | Background                    | Text                     |
| ------------------------------ | ----------------------------- | ------------------------ |
| Default (unpressed, enabled)   | transparent                   | `--gb-text-default`      |
| **hover** (unpressed, enabled) | `--gb-background-mute-subtle` | `--gb-text-static-white` |
| `pressed`                      | `--gb-background-mute-subtle` | `--gb-text-static-white` |
| `disabled`                     | transparent                   | `--gb-text-static-gray`  |

The active background is `background/mute-subtle` for both `icon` and `text`, with a static-white foreground in both.

Hover is scoped so it **never applies to a disabled button**, matching the project rule that disabled must not change on hover or selection.

When an item is both `pressed` and `disabled`, **the disabled look wins**. `toggle.test.tsx` pins this with "gives the disabled look priority when an item is both pressed and disabled", verifying that only the disabled colors survive in the rendered output.

`type="icon"` container: `--gb-border-default`, `--gb-radius-scale-lg`, `--gb-shadow-xs`, no background of its own (the items fill it), and 2px dividers (`--gb-border-2`). Items are 36px tall and 34px wide — both component dimensions, so both are literal Figma values.

The `type="text"` container (the pill track) is entirely different — **it has a track background and no dividers**:

|               | enabled                    | disabled                   |
| ------------- | -------------------------- | -------------------------- |
| Background    | `--gb-background-selected` | `--gb-background-disabled` |
| Border        | `--gb-border-default`      | `--gb-border-overlay`      |
| Radius        | `--gb-radius-scale-lg`     | same                       |
| Padding / gap | `--gb-spacing-0-5` (2px)   | same                       |
| Height        | 36px                       | same                       |

Unlike the icon family, **the track's own background and border change when disabled.** The item chips are 32px tall with `--gb-spacing-2` / `--gb-spacing-1` padding and `--gb-radius-scale-md`. `--gb-shadow-sm` is **not** a resting-state property — Figma only applies it on hover/press/selected (see States and behaviors below); an earlier version of this CSS applied it unconditionally.

Passing `trailingAction` adds one more transparent wrapper with a `--gb-spacing-1-5` (6px) gap between the pill and the icon `Button`.

## States and behaviors

- **hover = the active appearance**, following the Figma description. It is scoped to enabled buttons only, and an already-pressed item sees no change since the values are the same.
- **disabled** applies at the group level only; individual items have no disabled prop. Clicks are blocked at the browser level by the native attribute, verified by "does not call onPressedChange when disabled".
- **disabled + vertical labels** — only the buttons take the disabled tone; the label color is unchanged, always `--gb-text-subtle` regardless of state.
- **focus** — `:focus-visible` raises the stacking order and applies `--gb-shadow-focus-ring`, regardless of pressed or disabled.
- **Fully controlled** — `pressed` must always come from the parent (there is no internal state); clicking an unpressed item only calls `onPressedChange(true)`, and a click on an already-pressed item is ignored. Changing the visual state requires the parent to pass a new `pressed`.
- **Divider rules** — drawn only between items, never before the first ("renders a divider between items but not before the first item"). **Dividers are dropped entirely when the group is disabled** — all eight Figma disabled variants have none, dimming as one block ("drops the dividers when the group is disabled").
- **Dividers take no layout space** — the 2px thickness is cancelled by 1px negative margins on each side (`2 − 1 − 1 = 0`), overlapping the cell boundary by 1px either way. Figma does the same with a zero-width vector carrying a 2px center-aligned stroke, so a four-icon horizontal group measures exactly `34 × 4 = 136px` (it would be 142px if the dividers consumed width).
- **Keyboard** — native `<button>` semantics (with `role="radio"` overlaid): Tab focuses and both Enter and Space activate the focused item. A disabled group drops out of the tab order.

## Composition with other components

Compass's two consumers (`app/compass/page.tsx`'s inline Analysis submenu, `CompassToolbar`'s Home/Analysis segment toggle) moved to the private GB-Review repo along with the rest of Compass — not part of this repo's handoff scope yet.

The shared pattern: map each item's `pressed` from one `value` in a `value` / `onValueChange` adapter the parent owns. Since Toggle is always a radio group, the adapter only needs to track which value is selected — the ARIA roles and the ignored re-click are handled by Toggle itself.

## The grid is fixed at four

Figma has only `grid, Number=4`, so `orientation="grid"` takes `items` as a **four-item tuple** (`ToggleGridItems`). Grids of three or five cannot be constructed at the type level.

## The hardcoded 34px

The icon chip's **width** of 34px has no match in the token scale (32px / 36px) and is a fixed Figma value, so it stays a literal. The height is 36px, the same as every other control.

## `pressed` + `disabled`

These are two independent axes, and when both are true the disabled styling wins — `aria-checked` stays `true` while the colors become disabled. `toggle.test.tsx` pins this against the actual render, alongside the Enter/Space toggle and the blocked focus when disabled.
