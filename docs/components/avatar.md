# Avatar

Figma: [📌 GB_Design-System — Atom](https://www.figma.com/design/G9YNa2vjdqDjnML9y5hXJ4/%F0%9F%93%8C-GB_Design-System--Atom-?node-id=3073-4051) · node-id `3073:4051`
Code: `components/ui/avatar/avatar.tsx`

## Overview

A fixed 32px avatar representing a user. It is `<div>`-based, and the Figma "Avatar" component set is two axes — `Type` (Image / Initial / Icon) × `Style` (rounded / rectangle / circle) — for nine variants, each 32×32.

The code maps Figma `Type` to the `variant` prop (`image` / `initial` / `icon`) and `Style` to the `shape` prop (`rounded` / `rectangle` / `circle`). "Style" was renamed to `shape` because it collides with React's `style` prop. All 3×3 = 9 combinations are a fixed 32px, matching the Figma spec exactly.

There is one code-only extension with no Figma counterpart: when `variant="image"` has no `src` or the image fails to load, it falls back to `initials`, and without those to `icon`. `variant="initial"` with no `initials` also falls back to `icon`. No new variant is introduced — every path resolves to one of the three existing Types.

## When to use

- To show a user or persona as an image, initials, or a default icon (live example: the inside of the 40px slot in `SelfSlot`).
- When a profile image URL may be missing (a new user with only `initials`) or may fail to load — the built-in fallback chain (image → initial → icon) means the consumer needs no error handling of its own.

## When not to use

- **When a click or selected state is needed.** Avatar is a stateless display element. To make it clickable, the consumer wraps it in a `<button>` — see `FloatingProfile` below.

## How to use

```tsx
// Default — variant="image" / shape="rounded"; falls back to the icon without a src
<Avatar />

// Icon — the placeholder, explicitly
<Avatar variant="icon" shape="circle" />

// Initial — initials text
<Avatar variant="initial" shape="circle" initials="S" />

// Image
<Avatar
  variant="image"
  shape="circle"
  src="/images/personas/self-default.jpg"
  alt="User profile photo"
/>

// Image load failure → automatic fallback to initials (code-only extension)
<Avatar variant="image" src="https://broken.invalid/x.png" initials="S" alt="..." />

// No src → automatic fallback to the icon
<Avatar variant="image" />
```

## Structure

- Root: `<div>`, extending `Omit<React.HTMLAttributes<HTMLDivElement>, "children">`. `children` is not accepted; the internal render logic replaces it.
- `variant="image"` renders a single `<img>` filling the container (`.image` in `avatar.module.css`: `width`/`height: 100%`, `object-fit: cover`), with `onError` setting the `imageFailed` state to trigger the fallback.
- `variant="initial"` renders the `initials` text in a `<span aria-hidden="true">`.
- `variant="icon"` renders `<svg aria-hidden="true">` with `<use href="/icons.svg#user-filled-icon" />` at a fixed 18px.
- Accessibility: the two non-image variants put `role="img"` and an `aria-label` on the root `<div>` (falling back alt → initials → `"avatar"`). The `image` variant sets neither and delegates to `<img alt>`.

## Props

| Prop       | Type                                                    | Required | Default     | Description                                                                                                              |
| ---------- | ------------------------------------------------------- | -------- | ----------- | ------------------------------------------------------------------------------------------------------------------------ |
| `variant`  | `"image" \| "initial" \| "icon"`                        | no       | `"image"`   | Maps the Figma `Type` variant. At render time it may be recomputed by the fallback chain (internally, `resolvedVariant`) |
| `shape`    | `"rounded" \| "rectangle" \| "circle"`                  | no       | `"rounded"` | Maps the Figma `Style` variant. Renamed to avoid colliding with React's `style` prop                                     |
| `src`      | `string`                                                | no       | —           | Image URL for `variant="image"`                                                                                          |
| `alt`      | `string`                                                | no       | `""`        | Alternative text for the image, reused as the `aria-label` in the fallback states                                        |
| `initials` | `string`                                                | no       | —           | Initials text for `variant="initial"` (Figma example: `"S"`)                                                             |
| rest       | `React.HTMLAttributes<HTMLDivElement>` (minus children) | no       | —           | `className`, `data-*`, `onClick`, … forwarded to the div                                                                 |

## Variants

### Type (`variant`)

| variant                            | Background                | Border                                   | Content                                                                               |
| ---------------------------------- | ------------------------- | ---------------------------------------- | ------------------------------------------------------------------------------------- |
| `image`                            | none                      | none                                     | `<img>` fills the container (`size-full object-cover`)                                |
| `initial`                          | `--gb-background-default` | `--gb-border-1` of `--gb-border-subtler` | Initials text, 20px / `--gb-font-weight-black` + `--gb-text-default` (see note below) |
| `icon` (end of the fallback chain) | `--gb-background-default` | `--gb-border-1` of `--gb-border-subtler` | `user-filled-icon` SVG at 18px, `--gb-icon-default`                                   |

**Initials typography is derived, not Figma-bound.** Figma's "S" example is an outline vector, not a text layer, so there is no font variable to read. `initials` is meant to hold exactly one character — the first letter of the name the user signed up with, not something this component or its caller composes — and the 20px / `font-weight-black` values above are sized to fit that one letter inside the 32px circle; two letters overflow it.

### Style (`shape`)

| shape               | Token                    |
| ------------------- | ------------------------ |
| `rounded` (default) | `--gb-radius-scale-md`   |
| `rectangle`         | `--gb-radius-scale-none` |
| `circle`            | `--gb-radius-scale-full` |

Figma names these `radius-md` (8) / `radius-none` (0) / `radius-full` (9999) — the prefix differs from the code's `radius-scale-*` while the meaning corresponds exactly. The same naming gap appears throughout these documents.

### Size

- Root: 32px, the fixed Figma spec. Identical across all nine combinations, regardless of the Style axis.
- Icon content: 18px, matching Figma's icon container. Both are component dimensions, so they are literal px.

## States and behaviors

- **Image load failure** — `<img>`'s `onError` sets `imageFailed`, and `resolvedVariant` recomputes to `initial` when `initials` exist, otherwise `icon`. Not in Figma.
- **Missing `src`** — `variant="image"` without a `src` resolves the same way.
- **Missing `initials`** — `variant="initial"` without `initials` resolves to `icon`.
- All three fallbacks land on one of the three existing Types, so nothing steps outside the Figma variant structure.
- No hover, focus, or active state is defined on Avatar itself — making it clickable is the consumer's job.
- The `icon` and `initial` content always carries `aria-hidden="true"` (treated as decorative); the root `div`'s `aria-label` is the accessible name.

## Composition with other components

Only one place imports Avatar. `compass-self-avatar` and `compass-self-cluster` have similar names but are separate components that do not import `ui/avatar` — both now live in the private GB-Review repo along with the rest of Compass, not part of this repo's handoff scope yet. There is no `compass-growth-avatar` in this codebase.

- **SelfSlot** (`components/screens/dashboard/ui/self-slot`): placed inside a 40×40 round slot with `variant="image"`, forwarding `imageSrc` / `initials` / `name` (as alt) so the image → initial → icon chain is delegated. The outer wrapper owns the 40px size, the highlight ring (`outline` in the active state), and the blur/dim effects, while Avatar fills it as content only.

SelfSlot uses Avatar purely as a **content fallback engine**, handling size overrides (`size-full`) and highlight rings in the surrounding wrapper.
