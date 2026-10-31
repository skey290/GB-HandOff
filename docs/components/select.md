# Select

- Code: `components/ui/select/select.tsx` (`select.module.css`, `select.stories.tsx`, `select.test.tsx`, `index.ts`)
- Figma: [📌 GB_Design-System (Atom)](https://www.figma.com/design/G9YNa2vjdqDjnML9y5hXJ4/%F0%9F%93%8C-GB_Design-System--Atom-?node-id=614-2466) — node-id `614:2466` (the "select" component set, 31 variants)

## Overview

`Select` is a value-picking dropdown: a custom combobox built on Radix `PopoverPrimitive` (Root / Trigger / Content) with a `role="combobox"` trigger and a `role="listbox"` / `role="option"` list.

Figma defines it as a **sparse matrix** across three axes — `Type` (default / side / icon) × `Style` (primary / reverse / mute / ghost) × `Status` (default / filled / hovered / pressed / disabled) — for 31 real combinations. The code folds only the **eight real shape combinations** into a single `variant` axis. Carrying three axes into the API would let the type system allow combinations Figma does not have, and would put several dropdowns in Storybook Controls where broken pairs could be selected (the same decision as `Button`).

The `Status` axis maps to runtime state rather than variants:

| Figma `Status` | Code                                          |
| -------------- | --------------------------------------------- |
| `default`      | the resting state                             |
| `filled`       | automatic when `value` exists (not a variant) |
| `hovered`      | `:hover`                                      |
| `pressed`      | `[data-state=open]` (dropdown open)           |
| `disabled`     | the `disabled` prop                           |

> **`hovered` and `pressed` are different here.** `hovered` fills the background and inverts the text; `pressed` keeps the background and only adds a border plus focus ring. (In `Button`, Figma's `active` equalled `:hover` — do not carry that assumption over.)

### The panel geometry and the list-item content come from different sources

The `Dropdown` inside the `Select` component set (node `614:2466`) is an **empty slot node** with no children. Only `stroke/1` and `Box Shadow/shadow-md` are bound to it, and the fixed Figma values are the panel geometry alone: 210px wide, 8px below the trigger (slot `top: 44` minus the 36px trigger). The `side` family opens sideways instead (`left: 120, top: -8`). The custom scrollbar has no counterpart in this slot and follows codebase convention.

The content structure of a single list row comes from `Dropdown slot` (node `8094:1187`, a six-Type showcase: menu / self / social media / timeframe / mbti / phone number) and the `Part/dropdown slot` reused inside it (node `8094:1231`, with `leadingIcon` / `textAdded` / `status` props), both placed beside `Select` in the same Atom file. They are reference component sets, not absorbed into the variant axes. Only the `menu` variant uses `leadingIcon`; the others use the label alone (or just a code column, as `phone number` does). `status=disabled` makes one option unselectable.

`Type=phone number` (node `8094:1222`) additionally shows an `InputSearch` instance ("Search country") stacked above the list with a 4px gap — this is the only one of the six Types with a search box. It maps to the `isSearchable` prop below; the other five Types are unaffected.

That empty-slot structure is mirrored in code: the dropdown content (option list plus scrollbar) is not written inside `Select` but extracted into [`DropdownList`](dropdown-list.md). `Select` imports it and places it inside `PopoverPrimitive.Content`, which corresponds to Figma's empty `Dropdown` slot — the same "shared slot plus the content that fills it" structure as `components/ui/chatbox` and `components/app/chatbox-composer`. `SelectOption` is an alias of `DropdownListOption`.

## When to use

Live usage in this codebase:

- **Country code selection**: `components/ui/input-phone` places a `variant="primary"` Select to the left of the number field. Passing `code` on the options makes the trigger show the code (`+82`) instead of the label. It also sets `isSearchable` so the 245-country list has a visible search box instead of relying on the hidden typeahead buffer alone.
- **Persona/profile filtering**: `compass-toolbar` places a `variant="mute"` Select below the sidebar segment toggle to pick from the "All 'Self'" list. Without `selectOptions` it is not rendered at all — now in the private GB-Review repo along with the rest of Compass, not part of this repo's handoff scope yet.

## When not to use

- **For a segmented control where both options stay visible**, the structure is different — it is not a dropdown that expands a list. Use `Toggle` (`type="text"` with `selectionMode="single"`). `compass-toolbar.tsx` is a real example of `Select` (dropdown below) and `Toggle` (segments above) sitting together.

## How to use

```tsx
// primary — the standard trigger (border + background)
<Select variant="primary" options={OPTIONS} placeholder="Select..." />

// With `code`, the trigger shows the code instead of the label and the dropdown gains a 50px code column
<Select variant="primary" options={COUNTRY_OPTIONS} value="kr" />

// reverse / mute / ghost — the same shape with different backgrounds
<Select variant="reverse" options={OPTIONS} value="a" />
<Select variant="mute" options={OPTIONS} value="a" />
<Select variant="ghost" options={OPTIONS} value="a" />

// icon — a 36px square "+" trigger with no label
<Select variant="icon" options={OPTIONS} />

// icon-ghost — same shape as icon, but radius-full and transparent at rest
<Select variant="icon-ghost" options={OPTIONS} />

// icon / icon-ghost — the trigger icon is swappable via `icon` (defaults to plus-icon)
<Select variant="icon" options={OPTIONS} icon="search-icon" />

// side / side-reverse — 24px tall, opening sideways
<Select variant="side" options={OPTIONS} value="a" />
<Select variant="side-reverse" options={OPTIONS} value="a" />

// disabled — Figma defines it only for primary, icon, and icon-ghost
<Select variant="primary" options={OPTIONS} disabled />
```

## Structure

- `PopoverPrimitive.Root` (controlled `open`) → `PopoverPrimitive.Trigger asChild` wrapping `<button role="combobox" aria-haspopup="listbox" aria-expanded aria-controls>` → `Portal` → `Content`.
- Inside the trigger: `icon`/`icon-ghost` render only the configurable `icon` prop (default `+`); every other variant renders a `<span>` (the selected label or `code`) plus a chevron.
- Inside the dropdown (`DropdownList`, see its [own document](dropdown-list.md)): a `<ul role="listbox">` of `<li role="option" aria-selected aria-disabled>` rows, with an icon column when any option has an `icon` and a two-column code + label layout when any option has a `code`.
- The custom scrollbar (inside `DropdownList`) hides the native bar and draws track and thumb as `<div>`s, computing `top` and `height` percentages from the scroll position. It renders only past six options. Because Radix `Popover` renders through Portal and Presence, the commit where `open` becomes `true` may differ from the commit where the `<ul>` actually mounts, so a callback ref times the measurement to the moment the node attaches. The list is always capped at six rows, and there is no "show more" chevron because Figma does not design one.
- Highlighting (`highlightedIndex`) and commit (`commitSelection`) are owned by `Select` and passed down as props; keyboard navigation (`ArrowUp` / `ArrowDown` / `Enter`) is handled by `Select` in `PopoverPrimitive.Content`'s `onKeyDown`.

## Props

| Prop                | Type                           | Default       | Description                                                                                                             |
| ------------------- | ------------------------------ | ------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `variant`           | `SelectVariant`                | `"primary"`   | Trigger shape — the eight real Figma `Type` × `Style` combinations                                                      |
| `options`           | `SelectOption[]`               | (required)    | `{ value, label, code? }[]`                                                                                             |
| `value`             | `string`                       | —             | `value` of the selected option                                                                                          |
| `defaultValue`      | `string`                       | —             | Initial selection when uncontrolled                                                                                     |
| `ref`               | `React.Ref<HTMLButtonElement>` | —             | Forwarded to the trigger `<button>`                                                                                     |
| `onValueChange`     | `(value: string) => void`      | —             | Called on option click or Enter                                                                                         |
| `placeholder`       | `string`                       | `"Select..."` | Trigger text while empty                                                                                                |
| `disabled`          | `boolean`                      | —             | Disabled. Figma defines it only for `primary`, `icon`, and `icon-ghost`                                                 |
| `icon`              | `IconId`                       | `"plus-icon"` | Trigger icon on `icon`/`icon-ghost` (Figma `icon` instance-swap property)                                               |
| `isSearchable`      | `boolean`                      | `false`       | Shows an `InputSearch` above the list (Figma `phone number` Type only) and filters `options` by label as the user types |
| `searchPlaceholder` | `string`                       | `"Search..."` | Placeholder for the search box. Only used when `isSearchable` is true                                                   |
| `className`         | `string`                       | —             | Merged onto the trigger                                                                                                 |

`SelectVariant`: `"primary" | "reverse" | "mute" | "ghost" | "icon" | "icon-ghost" | "side" | "side-reverse"`

`SelectOption`: `{ value: string; label: string; code?: string; icon?: LucideIcon; disabled?: boolean }`. `code` is a short code shown on the trigger instead of the label (a country code such as `"+82"`). `icon` here is the list row's leading icon (the `menu` variant of `Dropdown slot`) — distinct from the top-level `icon` prop above, which is the trigger icon on `icon`/`icon-ghost`. `disabled` makes that one option unselectable (`Part/dropdown slot`'s `status=disabled`), separate from the `disabled` prop that blocks the whole Select.

## Variants

| `variant`      | Figma combination | Dimensions          | Background / border                                     | Typography                            |
| -------------- | ----------------- | ------------------- | ------------------------------------------------------- | ------------------------------------- |
| `primary`      | default × primary | 36px tall           | `--gb-background-default` / `--gb-border-default`       | `text-sm-medium`                      |
| `reverse`      | default × reverse | 36px tall           | `--gb-background-bold` / none                           | `text-sm-medium`                      |
| `mute`         | default × mute    | 36px tall           | `--gb-background-surface-secondary` / none              | `text-sm-medium`                      |
| `ghost`        | default × ghost   | 36px tall           | transparent, `--gb-background-default` when open / none | `text-sm-medium`                      |
| `icon`         | icon × primary    | 36×36               | `--gb-background-default` / `--gb-border-default`       | none (configurable icon, default `+`) |
| `icon-ghost`   | icon × ghost      | 36×36               | transparent, `--gb-background-default` when open / none | none (configurable icon, default `+`) |
| `side`         | side × primary    | 24px tall           | transparent / none                                      | `text-xs-medium`                      |
| `side-reverse` | side × reverse    | 24px tall, mirrored | transparent / none                                      | `text-xs-medium`                      |

Shared by all variants except `icon-ghost`: `--gb-radius-scale-md` and a 16px chevron (`icon-ghost` uses `--gb-radius-scale-full` instead; the 16px icon size is shared by all).

Combinations Figma does **not** have are absent from the code too — `side` has no `filled` / `disabled` / `mute` / `ghost`, `icon`/`icon-ghost` have no `filled` / `reverse` / `mute`, and `disabled` exists only for `primary`, `icon`, and `icon-ghost`.

### How the `side` family differs

For `side`, `primary` vs `reverse` is **a layout mirror, not a color change** (unlike the `default` Type, where `reverse` inverts colors).

|                | Trigger layout              | Chevron (closed → open)          | Dropdown direction |
| -------------- | --------------------------- | -------------------------------- | ------------------ |
| `side`         | text → icon                 | `chevron-right` → `chevron-left` | right              |
| `side-reverse` | icon → text (right-aligned) | `chevron-left` → `chevron-right` | left               |

Hover also runs the **opposite way** from the default family: instead of filling the background it **dims** the text and icon to `--gb-text-static-gray`. There is no focus ring.

## States and behaviors

- **default / filled** — the text is `--gb-text-subtle` (placeholder) with no value and `--gb-text-default` once selected. Only `reverse` goes `--gb-text-selected` → `--gb-text-invert`. **The weight never changes** (both are Medium).
- **hover (default family)** — fills with `--gb-background-mute`, inverts the text and icon to `--gb-text-static-white`, and adds `--gb-shadow-focus-ring`. Identical across Styles.
- **hover (`side` family)** — no background change; the text and icon dim to `--gb-text-static-gray`.
- **open (pressed)** — background unchanged, border becomes `--gb-border-static-gray`, and `--gb-shadow-focus-ring` is added. The text is forced to a fixed color regardless of selection (`--gb-text-invert` for `reverse`, `--gb-text-default` otherwise), and the chevron flips. The `side` family has no focus ring (Figma spread 0).
- **disabled** — a single design regardless of variant (`--gb-background-disabled` / `--gb-border-overlay` / `--gb-text-static-gray`), but **the weight is preserved** (Medium, never dropped). Clicking does not open it.
- **selected / highlighted options** — both render as `--gb-background-mute` + `--gb-text-static-white`, whether from mouse hover or keyboard highlight.
- **per-option disabled** — only the text changes to `--gb-text-static-gray`, with no background change. It cannot be selected by click or Enter and never highlights on hover.
- **Keyboard navigation** — with the trigger focused, `ArrowDown` / `ArrowUp` opens it (`Enter` / `Space` already open it through the native button click, so they are not handled separately). While open, the arrows move the highlight and `Enter` selects. `Escape` and outside clicks close it through the Radix default.
- **Typeahead (code-only, no Figma counterpart — native `<select>` convention)** — while open, typing a printable character (no modifier key) appends to a buffer and moves the highlight to the first non-disabled option whose label starts with it, case-insensitively; typing `k` then `o` within 600ms of each keystroke narrows from the first "K…" option down to the first "Ko…" one. The buffer resets after 600ms of no typing, or on close. This lives in `Select` rather than `DropdownList` because `DropdownList` is a controlled, keyboard-agnostic presentation component — `Select` already owns `onKeyDown` on the popover content for arrow/Enter, so the buffer sits next to it. Disabled whenever `isSearchable` is true, since the visible search box takes over finding an option by typing — the two never run at the same time on one instance.
- **`isSearchable`** — renders a controlled `InputSearch` inside `PopoverPrimitive.Content`, above the list, wrapped together in a `210px`-wide flex column (`gap: var(--gb-spacing-1)`); the list itself moves into its own bordered/shadowed card (`styles.listCard`) since the outer `Content` no longer draws that chrome. `options` is filtered to those whose label includes the query (case-insensitive substring), `highlightedIndex` resets to `0` whenever the filtered set changes, and an empty result renders "No results found" instead of `DropdownList` (no Figma design for this state). The search box does not receive focus automatically on open — by default, Radix's `FocusScope` would auto-focus it as the first tabbable descendant, but the shared `Input` component hides its placeholder on `:focus` (`.root:focus::placeholder { opacity: 0 }` in `input.module.css`), so that would make "Search country" disappear the instant the dropdown opens, before the user ever reads it. `onOpenAutoFocus` is overridden to focus `PopoverPrimitive.Content` itself instead (the same target the non-searchable path already gets by default), so the placeholder stays visible until the user clicks or tabs into the box. The query resets on close. Arrow/Enter navigation works either way, since `onKeyDown` is bound on `Content` and keydown events bubble up to it from whichever element has focus. `InputPhone`'s country-code `Select` is the one instance that uses this (`docs/components/input-phone.md`).
- **Scrollability** — the custom scrollbar appears only when `options.length > 6`.

## Composition with other components

- **With `InputPhone`**: `components/ui/input-phone` reuses a `variant="primary"` Select as the country-code dropdown beside the number `Input`, laid out in a flex row. Adding `code` to the options turns on both the trigger display and the dropdown code column.
- **With `CompassToolbar`**: stacks a `variant="mute"` Select below its own segment toggle (which is not a Select). Without `selectOptions`, the Select is not rendered — now in the private GB-Review repo, not part of this repo's handoff scope yet.

## The focus ring exists on six variants, not the `side` family

`primary`, `reverse`, `mute`, `ghost`, `icon`, and `icon-ghost` all carry the focus ring (`Box Shadow/Focus ring`) in **both hover and open**. `side` / `side-reverse` dim their text instead of filling a background, so they have none. Figma agrees: six hovered plus six pressed.

## Disabled tokens and typography

The text is `text/static-gray`, the chevron is `icon/static-gray`, and the typography **stays at the enabled `Text-sm/Medium`** — the weight is never dropped. `select.test.tsx` pins all three.

Font size is not bound as a variable anywhere in the 31 variants — typography is managed purely through text **styles** (`Text-sm/Medium` and friends) in this file, so implementations only need the style name.

## The list and the scrollbar share one height constant

Inside `DropdownList`, the list's `max-height` and the scrollbar track's `height` must match, so a single `calc()` string constant is defined and referenced inline by both.

The custom scrollbar here is drawn by `DropdownList` (the dropdown content Select renders), not by `select.tsx`/`select.module.css` themselves, which contain no scrollbar markup. `DropdownList` composes the shared `Scrollbar` component (`components/ui/scrollbar`) as a track/thumb overlay next to the list, feeding it the scroll ratio it computes itself — see [`scrollbar.md`](./scrollbar.md) for how that pairing works.
