# Chips

Figma: [📌 GB_Design-System — Atom](https://www.figma.com/design/G9YNa2vjdqDjnML9y5hXJ4/%F0%9F%93%8C-GB_Design-System--Atom-?node-id=3021-1615) · node-id `3021:1615`
Code: `components/ui/chips/chips.tsx`

## Overview

A clickable pill for filter or tag selection. It is `<button type="button">`-based with two extras: `selected` (the pressed state) and `showDeleteIcon` (a remove badge at the top right). The Figma "Chips" component set has three variant axes — `Type` (primary / secondary / outline / ghost / success / alarm), `Size` (md default / sm), and `Status` (default / active, with `disabled` added for primary only, and `active` not drawn for success/alarm) — plus a `Delete icon` boolean property.

`success`/`alarm` and `size="sm"` exist specifically so a status-badge-like chip can stay visually identical to `Badge`'s `success`/`alarm` at `size="20"` while being a real clickable button. Match the same completion-state color and compact size Badge uses elsewhere before reaching for a one-off style.

**How it actually differs from Badge** (by code structure, not by intuition):

|                | Badge (`components/ui/badge`)                                               | Chips (`components/ui/chips`)                                                    |
| -------------- | --------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| Root element   | `<span>`                                                                    | `<button type="button">`                                                         |
| Clickable      | Not inherently — a consumer can forward `onClick` to the span and improvise | A button from the start; `disabled` is the real HTML attribute and blocks clicks |
| Selected state | None — a consumer fakes it by toggling `variant`                            | Built-in `selected`, exposed as `aria-pressed`                                   |
| Removable      | No                                                                          | Built-in `showDeleteIcon` + `onDelete`, rendering a separate X badge             |
| Purpose        | Passive label, count, or status text                                        | Active interaction: filter chips, selectable tags                                |

Badge is a display label; Chips is a selectable, removable control. The design intent differs.

## When to use

- Filter or category UI where one or more options toggle on and off (live example: the attachment option chips in `Chatbox` — All / Image / Text).
- When selected items must be removable (`showDeleteIcon` + `onDelete`).
- When one of four emphasis levels (primary / secondary / outline / ghost) fits the screen hierarchy.

## When not to use

- **A plain display label with no click, selection, or removal** → use [Badge](./badge.md). The Figma description says so.

## How to use

```tsx
// Basic
<Chips variant="primary">Chip</Chips>

// Color variants
<Chips variant="secondary">Chip</Chips>
<Chips variant="outline">Chip</Chips>
<Chips variant="ghost">Chip</Chips>

// Selected (Figma Status=active)
<Chips variant="primary" selected>Chip</Chips>

// Disabled
<Chips variant="primary" disabled>Chip</Chips>

// Status chip (matches Badge's success/alarm at size="20")
<Chips size="sm" variant="success">Verified</Chips>
<Chips size="sm" variant="alarm">Needs review</Chips>

// Removable
<Chips variant="secondary" showDeleteIcon onDelete={() => {}}>
  Chip
</Chips>
```

Live usage (`chatbox-composer.tsx`):

```tsx
{
  CHIP_LABELS.map((label, index) => (
    <Chips
      key={label}
      variant="secondary"
      selected={currentChip === index}
      disabled={disabled}
      onClick={() => handleChipClick(index)}
    >
      {label}
    </Chips>
  ));
}
```

## Structure

- Root: `<button type="button">`, extending `React.ButtonHTMLAttributes<HTMLButtonElement>` with the rest spread through.
- `disabled` and `onClick` work as plain native button attributes with no custom logic.
- `aria-pressed` is always set from `selected ?? false`, telling assistive technology this is a toggle.
- The delete badge renders at the top right only when `showDeleteIcon` is true:
  - To avoid a nested `<button>` (invalid HTML), it is a `<span role="button">` with `tabIndex` and manual Enter/Space handlers.
  - `onMouseDown` and `onClick` call `event.stopPropagation()` so the chip's own click and focus logic stay separate.
  - It renders lucide's `X` at 16px, matching Figma's 16×16 `lucide/x` instance.

## Props

| Prop             | Type                                                                       | Required | Default     | Description                                                                                                |
| ---------------- | -------------------------------------------------------------------------- | -------- | ----------- | ---------------------------------------------------------------------------------------------------------- |
| `variant`        | `"primary" \| "secondary" \| "outline" \| "ghost" \| "success" \| "alarm"` | no       | `"primary"` | Color variant, matching the Figma `Type` property                                                          |
| `size`           | `"md" \| "sm"`                                                             | no       | `"md"`      | Height/padding/font scale, matching the Figma `Size` property. `sm` matches Badge's `size="20"`            |
| `selected`       | `boolean`                                                                  | no       | `false`     | Pressed/selected state. Reflected in `aria-pressed` and styled as Figma `Status=active`                    |
| `disabled`       | `boolean`                                                                  | no       | —           | Native button `disabled`. Applies the same disabled look to every variant                                  |
| `showDeleteIcon` | `boolean`                                                                  | no       | `false`     | Show the remove (X) badge at the top right. Matches the Figma `Delete icon` property                       |
| `onDelete`       | `(event: React.SyntheticEvent) => void`                                    | no       | —           | Called when the badge is clicked or activated by Enter/Space. Never propagates to the chip's own `onClick` |
| `children`       | `React.ReactNode`                                                          | yes      | —           | Chip label text                                                                                            |
| rest             | `React.ButtonHTMLAttributes<HTMLButtonElement>`                            | no       | —           | `onClick`, `className`, `type`, `data-*`, … forwarded                                                      |

## Variants

### Type × Status (color)

| Type                | Status            | Background                          | Text                     | Border                                     |
| ------------------- | ----------------- | ----------------------------------- | ------------------------ | ------------------------------------------ |
| `primary` (default) | default           | `--gb-background-bold`              | `--gb-text-invert`       | none                                       |
| `primary`           | active (selected) | `--gb-background-mute`              | `--gb-text-static-white` | none                                       |
| `secondary`         | default           | `--gb-background-surface-secondary` | `--gb-text-default`      | none                                       |
| `secondary`         | active            | `--gb-background-mute`              | `--gb-text-static-white` | none                                       |
| `outline`           | default           | transparent                         | `--gb-text-default`      | `--gb-border-mute`, inset box-shadow       |
| `outline`           | active            | `--gb-background-mute`              | `--gb-text-static-white` | none (the border disappears when selected) |
| `ghost`             | default           | transparent                         | `--gb-text-default`      | none                                       |
| `ghost`             | active            | `--gb-background-mute`              | `--gb-text-static-white` | none                                       |
| `success`           | default           | transparent                         | `--gb-text-success`      | `--gb-border-success`, inset box-shadow    |
| `alarm`             | default           | transparent                         | `--gb-text-warning`      | `--gb-border-warning`, inset box-shadow    |

The selected state is identical across the four original Types — `--gb-background-mute` + `--gb-text-static-white`, with the border gone (`outline` included). `success`/`alarm` have no Figma `active` frame (they exist only as a clickable status indicator, not a toggle) — the generic hover/selected rule still applies to them in code since it isn't scoped by variant, but there's no Figma reference for what that should look like.

**`outline`'s border is an inset box-shadow, not a real `border`**, because with `width: fit-content` and `border-box` a real border adds 2px to the outer width and breaks the Figma width (71px). The result is identical to Figma's inside stroke, and Badge uses the same technique for the same reason. `success`/`alarm` reuse the same technique, and the same colors/tokens as Badge's `success`/`alarm`.

### Size

| Size           | Height | Horizontal padding | Font                    |
| -------------- | ------ | ------------------ | ----------------------- |
| `md` (default) | 28px   | `--gb-spacing-4`   | `--gb-text-sm` / medium |
| `sm`           | 20px   | `--gb-spacing-1-5` | `--gb-text-xs` / medium |

`sm` only exists for `success`/`alarm` in Figma — it matches Badge's `size="20"` exactly (same height, padding, and font tokens) so a clickable status chip can sit where a Badge used to without changing its footprint.

### Hover

Figma defines no hover state (`Status` is only `default` / `active`, plus `disabled` for primary). The code previews the active look on hover for every variant, `success`/`alarm` included. No test pins this — `chips.test.tsx` has no hover coverage.

**An icon passed in as a child follows the label's color.** `.root` sets `color`, and an icon with no color of its own (e.g. a default lucide icon, which uses `stroke="currentColor"`) inherits it — so it changes together with the label on hover/selected without any extra styling. Give that icon its own explicit color only if it's meant to stay fixed regardless of hover/selected (like the delete badge's icon, see below); don't do that for a status-style icon, since it would stop following the label — this was the actual cause of a ProfileCard bug where the checklist icon stayed green/red on hover while the label turned white.

### Disabled

Figma draws `disabled` only for `type=primary` (node `3810:6910`: `background-bold` at 70% opacity with `text-subtle` text). The code applies that one look uniformly to all four variants rather than preserving each variant's own color.

### Deletable (the remove badge)

**A disabled chip has no badge.** Figma's `Status=disabled` frame has only the label as a child — the badge instance is not hidden but deleted from the file (querying the previous badge node returns "node ID was not found"; a hidden node would keep its id). The code matches with `showDeleteIcon && !disabled`.

All eight enabled frames (4 Types × default/active) carry the badge with identical specs:

| Property   | Value                                                      |
| ---------- | ---------------------------------------------------------- |
| Size       | 16×16, `--gb-radius-scale-lg`                              |
| Background | `--gb-background-default`                                  |
| Border     | `--gb-border-1` solid `--gb-border-default`                |
| Icon       | 16×16, `--gb-icon-default`                                 |
| Position   | 4px past the right edge, 5px past the top edge of the chip |

**The icon color must not be inherited from the chip body.** The badge background is the opposite color from the chip, so inheriting would make the X invisible against it in `primary` and in every selected state. It is fixed to `--gb-icon-default`.

The offsets come straight from Figma's absolute coordinates: `right: -4px`, `top: -5px`. (`outline`'s generated CSS reports a slightly different `top: -6.14px` only because that frame's 1px border shifts the padding-box origin — the design is not per-Type.)

The chip root needs `position: relative` for the badge to anchor to it.

## States and behaviors

- `selected` is a real toggle state, exposed through `aria-pressed` as well as the visual style. Badge has no such concept.
- `disabled` is the native attribute, so clicks are genuinely blocked (`pointer-events: none` is applied too).
- A disabled chip **does not render** the delete badge, matching Figma. The `disabled` guard inside the delete handler remains only as a defense against state changing mid-render.
- Clicking or keying the badge is fully separated from the chip's own `onClick` and selection state by `stopPropagation()`. `chips.test.tsx` verifies both that deleting does not trigger `onClick` and that `aria-pressed` does not change.
- The badge is keyboard-activatable (Enter/Space), not mouse-only.
- Both the chip root and the delete badge show `--gb-shadow-focus-ring` on `:focus-visible` (no Figma counterpart — a code-only a11y addition, same token used across the rest of the UI library).

## Composition with other components

Two consumers import Chips:

- **ChatboxComposer** (`components/app/chatbox-composer`): when `variant === "chips"`, renders the filter list as Chips inside the Chatbox slot. It maps `CHIP_LABELS = ["All", "Image", "Text"]`, fixes `variant="secondary"`, drives single selection with `selected={currentChip === index}`, forwards `disabled`, and calls `handleChipClick(index)` on click.
- **`app/self/page.tsx`**: a two-chip filter row (`Brand Kit` / `Content`), same `variant="secondary"` + `selected` pattern.

The first two consumers follow the same established pattern: "map a list of labels, toggle single selection through `selected`". No consumer uses `showDeleteIcon` yet; it is verified only by stories and tests.

- **ProfileCard** (`components/screens/content-studio/ui/ProfileCard`): the collapsed checklist row renders a default `size="md"` chip per goal (`variant="success"` when complete, `"alarm"` when not), each with a `CircleCheck`/`CircleX` child in front of the label — no explicit color on that icon, so it inherits `.root`'s color and follows the label on hover/selected (see Hover above). It locally overrides Chips' default horizontal padding (via an inline `style`, not a Chips prop) to fit three chips on one line — see docs/components/profile-card.md.

## The disabled look is one, regardless of Type

Figma draws only `Type=primary, Status=disabled`. The absence of disabled swatches for `secondary` / `outline` / `ghost` is not an omission but a consequence of the "one disabled look per component" rule. The code overrides all four variants to the same look in its base rules.

Because `outline` draws its border as an inset box-shadow rather than a real `border`, unifying also requires clearing that shadow when disabled — without it, only the disabled outline chip would keep a border. No test pins this — `chips.test.tsx` only checks that `disabled` blocks clicks (jsdom + CSS Modules cannot assert colors).

## Two deliberate differences in the delete badge

- **The icon cannot be swapped.** The Figma component property is a single `Delete icon` boolean with no instance-swap slot (unlike Badge's `Leading Icon` or Button's `Icon`), and the code hardcodes lucide `X` to match. The layer name still reading `lucide/circle-dashed` is a leftover slot name; the actual render is `lucide/x`.
- **Figma makes the badge a `Button` instance, but the code uses `<span role="button">`.** The chip itself is a `<button>`, and a nested `<button>` is invalid HTML — a deliberate exception to the "reuse existing components" rule.
