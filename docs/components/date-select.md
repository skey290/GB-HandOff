# Date select

Figma: [📌 GB_Design-System — Atom](https://www.figma.com/design/G9YNa2vjdqDjnML9y5hXJ4/%F0%9F%93%8C-GB_Design-System--Atom-?node-id=7219-10905) · node-id `7219:10905`
Code: `components/ui/date-select/date-select.tsx`

## Overview

A complete widget stacking a label over a date trigger; pressing the trigger opens a [Calendar](./calendar.md) below it. The trigger shows the placeholder while empty and the chosen date formatted as `MM.DD.YYYY` once set.

## When to use

- When the user picks **one** date.
- Where the calendar does not need to stay open — only on demand.

## When not to use

- **A start-and-end pair** → [Range select](./range-select.md).
- **The calendar must always be visible** → use [Calendar](./calendar.md) directly.
- **A time of day** → [Input time](./input-time.md).

## How to use

```tsx
// Basic
<DateSelect label="Date to post" value={date} onValueChange={setDate} />

// Restrict the selectable range
<DateSelect
  value={date}
  onValueChange={setDate}
  minDate={new Date(2026, 0, 1)}
  maxDate={new Date(2026, 11, 31)}
/>

// Pass per-date event markers through to the calendar
<DateSelect events={{ "2026-09-17": "draft" }} onValueChange={setDate} />

// Opt into the fixed 192px instead of the 100%-fill default
<DateSelect label="Date of Birth" shouldFitContainer={false} onValueChange={setDate} />

// Disabled
<DateSelect disabled />

// Opt out of the forced-dark popover where the surrounding UI is light (e.g. PostingModal)
<DateSelect shouldForceDark={false} onValueChange={setDate} />

// Keep the popover inside a themed ancestor instead of document.body (see "Composition" below)
<DateSelect shouldForceDark={false} container={rootNode} onValueChange={setDate} />
```

## Structure

Five files per the project component rule: `date-select.tsx` / `date-select.module.css` / `date-select.stories.tsx` / `date-select.test.tsx` / `index.ts`.

```
<div>                              root. flex-col, items-start, gap 12, width 192
  <label htmlFor>                  label
  <Popover.Root>
    <Popover.Trigger asChild>
      <button>                     height 36, radius 8, padding 12/8, border 1
    <Popover.Content className={shouldForceDark ? "dark" : undefined} sideOffset={8} align="start">
      <Calendar mode="single" />
```

- **The root renders at a fixed 192px in Figma**, and the code matches it as a literal — but 192 looks like a forced value rather than a confirmed spec: the root's two children (the title text and the trigger `Input` frame) are both `Fill`, so the root cannot `HUG`, and no other component or app screen independently reproduces 192 the way e.g. `ButtonGroup`'s 344px is reproduced elsewhere. Given that uncertainty, `shouldFitContainer` defaults to `true` — the 192px is opt-in (`shouldFitContainer={false}`), not the default.
- The radius is `--gb-radius-scale-md` (8px) — note this differs from `RangeSelect` (10px).
- The popover forces dark regardless of the site theme by default (the same rule as Popover, Chatbox, RangeSelect, and NotiDropdown), via `shouldForceDark` (default `true`) — the same escape hatch as `Chatbox`, for contexts where Figma draws the surrounding UI light instead (e.g. `PostingModal`).
- The popover's `PopoverPrimitive.Portal` defaults to `document.body`, like every Radix-portaled component here. That's fine while `shouldForceDark` is left at its default — the popover carries its own `dark` class regardless of where it portals to. But `shouldForceDark={false}` only removes that class from the popover's own wrapper; it does nothing about whatever ambient (OS-driven) theme `document.body` happens to be in. A `shouldForceDark={false}` caller whose surrounding UI is explicitly light (not just "not forced dark") needs the popover to inherit that light context directly — pass `container` pointing at the themed ancestor instead of letting it portal to `body`.

## Props

| Prop                 | Type                                | Default          | Description                                                                                                                                                                                           |
| -------------------- | ----------------------------------- | ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `label`              | `string`                            | `"Date to post"` | Label above the field. Hidden when empty                                                                                                                                                              |
| `value`              | `Date`                              | —                | Selected date                                                                                                                                                                                         |
| `defaultValue`       | `Date`                              | —                | Initial date when uncontrolled                                                                                                                                                                        |
| `ref`                | `React.Ref<HTMLButtonElement>`      | —                | Forwarded to the trigger `<button>`                                                                                                                                                                   |
| `onValueChange`      | `(date: Date) => void`              | —                | Called on selection. The popover stays open — the user closes it themselves                                                                                                                           |
| `placeholder`        | `string`                            | `"MM.DD.YYYY"`   | Trigger text while empty                                                                                                                                                                              |
| `disabled`           | `boolean`                           | `false`          | Disables the trigger; the popover will not open                                                                                                                                                       |
| `minDate`            | `Date`                              | —                | Passed to the calendar                                                                                                                                                                                |
| `maxDate`            | `Date`                              | —                | Passed to the calendar                                                                                                                                                                                |
| `disabledDates`      | `Date[]`                            | —                | Passed to the calendar                                                                                                                                                                                |
| `events`             | `Record<string, CalendarEventType>` | —                | Passed to the calendar                                                                                                                                                                                |
| `shouldFitContainer` | `boolean`                           | `true`           | Stretch to the parent width instead of the fixed 192px. Pass `false` to use the fixed width                                                                                                           |
| `className`          | `string`                            | —                | Merged onto the root `<div>`                                                                                                                                                                          |
| `container`          | `HTMLElement \| null`               | —                | Portal target for the popover. Default (`undefined`) portals to `document.body` via Radix. Pass the surrounding themed root (see States and behaviors above) so the popover renders inside it instead |

## Variants

There is no `variant` prop. Figma has one axis, `Status`, with five values — `default` / `hovered` / `pressed` / `filled` / `disabled` — none of which is a prop; they follow from whether a value exists and from CSS state. Figma also carries two `TEXT` properties this axis doesn't capture: `title` (default `"Date to post"`, maps to `label`) and `date` (default `"09.01.2026"`, the filled-state example value).

| Figma `Status` | Trigger condition   | Background                 | Border                                 | Text                     |
| -------------- | ------------------- | -------------------------- | -------------------------------------- | ------------------------ |
| `default`      | no value            | `--gb-background-default`  | `--gb-border-default`                  | `--gb-text-subtle`       |
| `filled`       | has a value         | `--gb-background-default`  | `--gb-border-default`                  | `--gb-text-default`      |
| `hovered`      | `:hover`            | `--gb-background-mute`     | `--gb-border-static-gray` + focus ring | `--gb-text-static-white` |
| `pressed`      | `data-[state=open]` | `--gb-background-default`  | `--gb-border-static-gray` + focus ring | `--gb-text-default`      |
| `disabled`     | `disabled`          | `--gb-background-disabled` | `--gb-border-overlay`                  | `--gb-text-static-gray`  |

**Only `disabled` changes the font weight** — the other four are Medium in Figma while `disabled` is Regular, and the code splits on that.

## States and behaviors

| Property          | Value                                                                                                                                                                                                 |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Root gap          | `--gb-spacing-3` (12px)                                                                                                                                                                               |
| Trigger height    | 36px                                                                                                                                                                                                  |
| Trigger radius    | `--gb-radius-scale-md` (8px)                                                                                                                                                                          |
| Trigger padding   | `--gb-spacing-3` horizontal, `--gb-spacing-2` vertical                                                                                                                                                |
| Label             | `Text-sm/Medium`, `--gb-text-default`                                                                                                                                                                 |
| Focus ring        | `--gb-shadow-focus-ring` on `hovered`/`pressed` only — there is no `:focus-visible` rule in `date-select.module.css`; a keyboard user who Tabs to the closed trigger gets no visible indicator at all |
| Popover offset    | 8px below the trigger (`sideOffset`)                                                                                                                                                                  |
| Popover alignment | left (`align="start"`)                                                                                                                                                                                |

- **Picking a date keeps the popover open.** Closing it (outside click / Escape, Radix Popover's own default) is left to the user, so they can review or change the pick before dismissing it. An earlier version auto-closed on pick; that made it impossible to correct a mis-click.
- When `disabled`, `onOpenChange` is intercepted so the popover never opens.
- The date format is fixed to `MM.DD.YYYY` (the Figma example is `09.01.2026`).

## Composition with other components

- **Calendar** (`components/ui/calendar`): the popover body, rendered with `mode="single"`, reporting the selection straight back up. This reuse has a Figma basis beyond visual similarity — Figma's `pressed` state (`7219:10914`) embeds a genuine instance of `Part/Calendar modal` (master `7219:10799`, `Type=default`), confirmed via the instance-id chain, and that instance itself embeds a `Button` instance — so the code's `Calendar` → `Button` nesting mirrors Figma's own structure transitively.
- The trigger does **not** use the shared `Button` or `Input`. The Figma trigger uses input-field colors (`border-default` + `background-default`), which no Button variant matches, and — unlike every other component in the input family — it has no trailing icon slot at all. It is also not a Figma instance of `Input` (no instance-id chain back to that component), so it is independently drawn rather than reused from either.
- **`PostingModal`** passes both `shouldForceDark={false}` and `container={rootNode}` (`rootNode` is that modal's own root element, already used identically for its platform `Select`'s `container`) — Figma draws `PostingModal` light throughout, so its "Date to post" field needs the popover to inherit that light context rather than falling back to `document.body`'s ambient theme.
