# Popover

Figma: [📌 GB_Design-System — Atom](https://www.figma.com/design/G9YNa2vjdqDjnML9y5hXJ4/%F0%9F%93%8C-GB_Design-System--Atom-?node-id=7269-451) — the "Popover" component set (node-id `7269:451`)
Code: `components/ui/popover/popover.tsx`

## Overview

Despite the name, this is not the usual "small popup near a trigger".

- **Code**: the first import in `popover.tsx` is `import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";`. It uses the **alert-dialog** primitive, not `@radix-ui/react-popover`.
- **Figma**: the component set (`7269:451`) is named `Popover`, but the behavior its description defines is a modal that interrupts the user at the center of the screen and waits for a response — an alert dialog, not an anchored popover. The code accordingly uses `role="alertdialog"`. The page, section, and description title housing this component set are all literally named "Dialog" — that's the strongest signal of intent, not a layer name inside the component itself (every layer inside the instance is generically named "Wrapper").
- **Behavior**: it takes no trigger as `children` and is fully controlled by the parent through `open` / `onOpenChange`. It renders pinned to the center of the viewport, with no arrow and no positioning logic.

So the name says "Popover" while the Figma page/section naming and the implementation agree on **an unanchored centered modal**.

### Popover vs Tooltip

|                   | **Popover** (this document)                                                                                               | **Tooltip**                                               |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| Primitive         | `@radix-ui/react-alert-dialog`                                                                                            | `@radix-ui/react-tooltip`                                 |
| Trigger           | none of its own — fully controlled by the parent through `open` / `onOpenChange`                                          | hover / focus                                             |
| Placement         | always centered, unanchored                                                                                               | anchored to the trigger (`side` / `align`, with an arrow) |
| Identity in Figma | the set is named "Popover" (node `7269:451`), but the page/section/description title it sits under are all named "Dialog" | the "Tooltip" component, layer name matching              |

The conventional hover-driven "popover" interaction is handled by `Tooltip`, not by this component.

The genuinely anchored popover pattern does exist in this project, but not as a shared wrapper: each component imports `@radix-ui/react-popover` directly. Consumers: `components/ui/select`, `components/ui/date-select`, `components/ui/range-select`, and `components/app/gnb` (the notification dropdown, at `gnb.tsx:417` via raw `PopoverPrimitive`). `components/app/noti-dropdown` is **not** one of these — it has no `@radix-ui/react-popover` import; its anchoring comes from GNB's own `PopoverPrimitive.Content` wrapping it. Using the Radix primitive per component is the established convention for anchored popovers.

## When to use

- When a confirm/cancel response must be collected at the center of the screen (confirming navigation away from a page, warning before a destructive action).
- Live example from the stories: a "heading to Content Studio?" page-exit confirmation.

## When not to use

- **A short hint attached to a trigger** → use [Tooltip](./tooltip.md).
- **An anchored dropdown or calendar** → follow the existing convention of using `@radix-ui/react-popover` directly (select / date-select / range-select). This component does not anchor.

## How to use

It is fully controlled, so even the stories wrap it in a local-state demo:

```tsx
import { Popover } from "./popover";

// Notification (the baseline)
<Popover
  type="notification"
  open={open}
  onOpenChange={setOpen}
  title="Heading to 'Content Studio' to create your post?"
  description="Exit this page and start creating a post in 'Content Studio'."
  onCancel={() => {}}
  onConfirm={() => {}}
/>

// Warning
<Popover type="warning" open={open} onOpenChange={setOpen} title="..." description="..." />

// With the "Do not ask again." checkbox (notification only)
<Popover
  type="notification"
  open={open}
  onOpenChange={setOpen}
  title="..."
  description="..."
  checkbox={false}
  checkboxLabel="Do not ask again."
  onCheckedChange={(checked) => {}}
/>

// Custom button labels
<Popover type="notification" open={open} onOpenChange={setOpen} title="..." description="..."
  cancelLabel="Not now" confirmLabel="Yes, continue" />
```

## Structure

- `AlertDialogPrimitive.Root` (fully controlled by `open` / `onOpenChange`) → `Portal` → a `.dark` wrapper → `Overlay` + `Content`.
- **The forced `.dark` scope** means every semantic token this component references resolves to its dark value regardless of the site theme — the same pattern as Chatbox, GNB, DateSelect, RangeSelect, and NotiDropdown.
- `Overlay` blurs the background with `--gb-background-backdrop` plus a medium backdrop blur — a code-only convention, not a reproduction of a Figma layer: Figma has neither an overlay layer nor a blur effect behind this component at all.
- `Content` is pinned to the center, 500px wide by default (Figma spec; overridable per instance via the `width` prop), with `--gb-radius-scale-lg`, `--gb-spacing-6` padding, and `--gb-shadow-lg`. It stacks two sections:
  1. **Header** — the `leadingIcon` slot beside the title (`Text-lg/SemiBold`), with the description below (`Text-sm/Regular`, `--gb-text-subtle`). The slot is fixed to 24px in CSS now, matching Figma's `Leading Icon` instance size.
  2. **Actions** — a `Checkbox` row (`type="mute"`, notification only, and only when `checkbox` is passed), then a `ButtonGroup type="confirm"` reproducing Figma's embedded `ButtonGroup` instance exactly — see "Cancel/Confirm reuses ButtonGroup" below.
- Existing components are reused rather than rebuilt: `ButtonGroup` and `Checkbox`, with no hand-rolled `<button>` element anywhere in this component.

## Props

| Prop              | Type                          | Required | Default               | Description                                                                                                                                                                                                                                                                                                                                                                                                                  |
| ----------------- | ----------------------------- | -------- | --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `type`            | `"notification" \| "warning"` | yes      | —                     | Matches the Figma `Type` variant                                                                                                                                                                                                                                                                                                                                                                                             |
| `open`            | `boolean`                     | yes      | —                     | Whether the dialog is open (fully controlled)                                                                                                                                                                                                                                                                                                                                                                                |
| `onOpenChange`    | `(open: boolean) => void`     | yes      | —                     | Open-state change callback                                                                                                                                                                                                                                                                                                                                                                                                   |
| `title`           | `string`                      | yes      | —                     | Dialog title (`Text-lg/SemiBold`)                                                                                                                                                                                                                                                                                                                                                                                            |
| `description`     | `string`                      | no       | —                     | Dialog description. Omitting it renders no description line and attaches no `aria-describedby` (Figma `Description=false`)                                                                                                                                                                                                                                                                                                   |
| `width`           | `number`                      | no       | `500`                 | Content width in px. The Figma spec is 500px for both variants; override per instance when a specific screen needs a different width                                                                                                                                                                                                                                                                                         |
| `leadingIcon`     | `React.ReactNode`             | no       | —                     | Header icon slot (24px, Figma `Leading Icon`, a `BOOLEAN` that **defaults to `true`** on Figma's side). Figma's `circle-dashed` is an instance-swap placeholder and is not used as a code default — without this prop the slot is not rendered. This is a deliberate deviation from Figma's own default, following the same precedent `Badge`'s `icon` sets, not a match to Figma (see "`leadingIcon` has no default" below) |
| `checkbox`        | `boolean`                     | no       | —                     | "Do not ask again." state. Figma has a real `Checkbox` `BOOLEAN` property (default `false`) on `notification`, not just a hidden instance. The row renders only for `type="notification"` **and** only when this prop is not `undefined`. Figma has no such row for `warning`, so a value there is ignored                                                                                                                   |
| `checkboxLabel`   | `string`                      | no       | `"Do not ask again."` | Checkbox label                                                                                                                                                                                                                                                                                                                                                                                                               |
| `onCheckedChange` | `(checked: boolean) => void`  | no       | —                     | Checkbox toggle callback                                                                                                                                                                                                                                                                                                                                                                                                     |
| `showButton`      | `boolean`                     | no       | `true`                | Whether to show the bottom section (Figma `Button`). Figma groups the checkbox and button rows under one wrapper, so `false` hides the checkbox too                                                                                                                                                                                                                                                                          |
| `cancelLabel`     | `string`                      | no       | `"Cancel"`            | Cancel button label                                                                                                                                                                                                                                                                                                                                                                                                          |
| `onCancel`        | `() => void`                  | no       | —                     | Cancel click callback                                                                                                                                                                                                                                                                                                                                                                                                        |
| `confirmLabel`    | `string`                      | no       | `"Confirm"`           | Confirm button label                                                                                                                                                                                                                                                                                                                                                                                                         |
| `onConfirm`       | `() => void`                  | no       | —                     | Confirm click callback                                                                                                                                                                                                                                                                                                                                                                                                       |

## Variants

Figma's `Type` property has two values (`Type=notification` node `7269:377`, `Type=warning` node `7269:452`):

| type           | Icon color          | Title color         | Border color          | Checkbox row                                                                                                                                                                                                            |
| -------------- | ------------------- | ------------------- | --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `notification` | `--gb-icon-default` | `--gb-text-default` | `--gb-border-subtle`  | A real `Checkbox` `BOOLEAN` property exists on this variant, defaulting to `false`; shown in code only when `checkbox` is passed                                                                                        |
| `warning`      | `--gb-icon-error`   | `--gb-text-error`   | `--gb-border-warning` | No `Checkbox` layer or property exists at all — `warning` has no footer `Wrapper` layer either, with the `Button` pair sitting directly at the root. The code likewise renders the checkbox row only for `notification` |

The description color and the Cancel/Confirm button colors do not differ between the two variants.

## States and behaviors

- **Open/close** — fully controlled; it renders only when `open` is true, and the trigger lives outside the component.
- **Cancel** — `AlertDialogPrimitive.Cancel` closes the dialog automatically and then calls `onCancel`.
- **Confirm** — `AlertDialogPrimitive.Action` behaves the same way and then calls `onConfirm`.
- **Escape does not close it** — `onEscapeKeyDown` calls `preventDefault()`, so only Cancel/Confirm can dismiss it (global "modals close only via an explicit control" policy, same as `components/ui/dialog`).
- **Checkbox row condition** — rendered only when `type === "notification" && checkbox !== undefined`. Passing `checkbox={false}` explicitly renders the row unchecked; omitting the prop hides it entirely. The design distinguishes "the value is false" from "do not show the row".
- **No collision or positioning logic** — unlike Tooltip, it is pinned to the center, so there is no viewport-collision concept at all.

## Composition with other components

`gnb.tsx` imports and uses this component — `:26` imports it, `:189` renders it with `type="warning"` as the confirmation dialog for deleting Work History / Self Archive items. It is not stories-and-tests-only. Internally it does compose other shared components:

- **ButtonGroup** — `type="confirm"`, wrapped through its `renderSecondary`/`renderPrimary` render props so Radix's `AlertDialogPrimitive.Cancel`/`Action` can still own the actual `Button` via `asChild` (see "Cancel/Confirm reuses ButtonGroup" below).
- **Checkbox** — for `type="notification"` with `checkbox` passed, a `type="mute"` Checkbox sits between the description and the action buttons. It renders inside the forced `.dark` scope, so it always reads dark.
- **When designing a new screen**: do not reuse this `Popover` for a genuinely anchored popover (dropdown, calendar, action menu). Follow the existing convention of using `@radix-ui/react-popover` directly, as `Select`, `DateSelect`, `RangeSelect`, and GNB's notification dropdown do — or use `Tooltip` for hover-driven supporting information.

## Cancel/Confirm reuses ButtonGroup

Figma's Cancel/Confirm pair is not independently drawn — both `notification` (`7269:382`) and `warning` (`7269:457`) embed a genuine instance of `ButtonGroup`'s `Type=confirm, Status=default` variant (`3622:8049`), confirmed via the instance-id chain. The code now imports `ButtonGroup` directly (`type="confirm"`, `shouldFitContainer` to stretch across the dialog's content width instead of the 344px default) rather than hand-reproducing its `.pair`/`.pairButton` layout.

`ButtonGroup`'s `onSecondaryClick`/`onPrimaryClick` alone aren't enough here — this component needs Radix's automatic dialog close plus initial focus on Cancel, which only `AlertDialogPrimitive.Cancel`/`Action` with `asChild` can provide. `ButtonGroup` exposes `renderSecondary`/`renderPrimary` render props for exactly this: each receives the actual `Button` element `ButtonGroup` is about to render, and the caller wraps it before placement — `renderSecondary={(button) => <AlertDialogPrimitive.Cancel asChild>{button}</AlertDialogPrimitive.Cancel>}` (and the equivalent `Action`/`renderPrimary` pair). `ButtonGroup` keeps owning layout, spacing, and the default `Cancel`/`Confirm` labels; Radix still clones the exact same single `Button` element it always has.

## `leadingIcon` has no default

Figma's `Leading Icon` instance-swap default is `4063:4787` (`lucide/circle-dashed`), **the same shared placeholder Badge's `Leading Icon` and Button's `Icon` point at**. It marks "an icon goes here" rather than expressing design intent. Note that Figma's `Leading Icon` `BOOLEAN` itself defaults to `true` — so "without `leadingIcon`, the slot is not rendered" is a deliberate code-side deviation from that default, not a match to it.

The code therefore does not ship the placeholder as a runtime default — without `leadingIcon`, the slot is not rendered at all. This follows the same precedent Badge sets by giving `icon` no default either, even though Badge's own `Leading Icon` boolean also defaults to `true` in Figma.

## `warning` cannot take a checkbox

Figma's `Type=warning` has **no checkbox layer at all** (`notification` has one, hidden). That is a structural impossibility rather than a missing mockup, so `PopoverProps` is a discriminated union keyed on `type` that blocks `warning` + `checkbox` **at the type level**. `popover.test.tsx` pins the runtime defense for anyone who casts around the type.
