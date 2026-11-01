# Dialog

Figma: none — no Figma spec exists; follows the standard Shadcn Dialog composition pattern per the project's "Figma에 없으면 Shadcn 기본값" rule.
Code: `components/ui/dialog/dialog.tsx`

## Overview

General-purpose modal shell (`Dialog` / `DialogTrigger` / `DialogContent` / `DialogHeader` / `DialogTitle` / `DialogDescription` / `DialogFooter` / `DialogClose`) for arbitrary content — forms, multi-step flows, anything that doesn't fit `Popover`'s fixed title/description/footer confirmation shape.

**Closes only via an explicit control inside it — never by clicking outside or pressing Escape.** `DialogContent` sets `onPointerDownOutside` and `onEscapeKeyDown` to `preventDefault()` by default, so the only way out is whatever the consumer puts inside: the built-in Close (X) button (`showCloseButton`, default `true`), a Cancel/Save pair, or any other control that calls `onOpenChange(false)` itself. This is a standing product rule, not a one-off: every dialog built on this component — across the Self app, Content Studio, and any future app — inherits it automatically, with no per-call-site code needed.

## When to use

- Any modal that needs arbitrary content and its own explicit way to close, rather than `Popover`'s fixed "title + description + Cancel/Confirm" shape.

## When not to use

- A confirmation that just needs a title, description, and Cancel/Confirm → use [Popover](./popover.md) instead (also closes only via its own buttons, not Escape — same policy, different component).
- A genuinely anchored popup (dropdown, calendar, action menu) → use `@radix-ui/react-popover` directly, as `Select`/`DateSelect`/`RangeSelect` do.

## How to use

```tsx
<Dialog open={open} onOpenChange={setOpen}>
  <DialogTrigger asChild>
    <Button>Open dialog</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Create a 'Self'</DialogTitle>
      <DialogDescription>Describe the goal this Self should represent.</DialogDescription>
    </DialogHeader>
    <p>Arbitrary content goes here — forms, lists, previews, anything.</p>
    <DialogFooter>
      <DialogClose asChild>
        <Button variant="outline">Cancel</Button>
      </DialogClose>
      <DialogClose asChild>
        <Button>Continue</Button>
      </DialogClose>
    </DialogFooter>
  </DialogContent>
</Dialog>

// Fully controlled, no built-in trigger, no visible X (its own content
// supplies the only way to close — e.g. GoalEditDialog's own header X inside GoalSetting)
<Dialog open={open} onOpenChange={onOpenChange}>
  <DialogContent showCloseButton={false}>...</DialogContent>
</Dialog>
```

## Props

| Prop                                       | Type                                  | Default                      | Description                                                                                                                                                                                   |
| ------------------------------------------ | ------------------------------------- | ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `open` / `onOpenChange`                    | `boolean` / `(open: boolean) => void` | —                            | Fully controlled via `Dialog` (`DialogPrimitive.Root`).                                                                                                                                       |
| `showCloseButton`                          | `boolean`                             | `true`                       | `DialogContent`-only. Hides the built-in top-right X — set `false` when the content supplies its own close affordance (a header X, a Cancel button, etc.), never leave both off.              |
| `onPointerDownOutside` / `onEscapeKeyDown` | Radix event handlers                  | both call `preventDefault()` | Forwarded to the underlying `DialogPrimitive.Content` via `{...props}` spread — a caller can override either to opt back into Radix's default dismiss behavior, but no current consumer does. |

## Structure

- `DialogContent` wraps `DialogPrimitive.Content` inside a `Portal` + `.dark`-scoped `Overlay`. The X button, when shown, is `DialogPrimitive.Close asChild` around a `Button variant="icon-ghost"`.
- `DialogHeader` / `DialogTitle` / `DialogDescription` / `DialogFooter` are thin styled wrappers around the matching Radix primitives — no extra logic.

## States and behaviors

- **Outside click** — `onPointerDownOutside` is `preventDefault()`-ed in `DialogContent`, so clicking the overlay never closes the dialog.
- **Escape** — `onEscapeKeyDown` is `preventDefault()`-ed the same way.
- **Only path to close** — whatever explicit control the consumer renders inside (`DialogClose`, a Cancel/Save button, the built-in X). A dialog with `showCloseButton={false}` and no other close control inside is a dead end — always verify there's at least one way out before shipping.
- A caller can still pass its own `onPointerDownOutside`/`onEscapeKeyDown` to opt back into outside-click/Escape dismiss for a specific dialog — none currently do, since the X-only policy is intentional everywhere it's used.

## Composition with other components

- **AssetGalleryDialog** (`components/app/asset-gallery-dialog`) — on top of the base X-only policy, intercepts even X-button closes with its own `Popover` confirmations ("Discard this Self Portrait?" / "Cancel creating this self?") while work is in progress. See [asset-gallery-dialog.md](./asset-gallery-dialog.md).
- **GoalEditDialog** (`components/app/goal-setting`) — `showCloseButton={false}`, relying on the embedded `GoalSetting`'s own header X (`showHeader`) as the sole close affordance.
- **ProcessingModal** (`components/screens/content-studio`) — `showCloseButton={false}`, relying on its own "Cancel" button instead of an X — same "always have an explicit way out" requirement, just styled as a text button rather than an icon.
