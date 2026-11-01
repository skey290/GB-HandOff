# AssetGalleryCard

- Code: `components/app/asset-gallery-card/asset-gallery-card.tsx` (`asset-gallery-card.module.css`, `asset-gallery-card.stories.tsx`, `asset-gallery-card.test.tsx`, `index.ts`)
- Figma: [📌 GB_UXUI](https://www.figma.com/design/Wp6AZNGqC4qf2Sz5zQ2PzQ/%F0%9F%93%8C-GB_UXUI--261002-?node-id=8012-10389) `Asset gallery card` node `8012:10389`

## Overview

A single tile in Self's image gallery grid. Which look it renders is derived entirely from which props are given — there is no `type`/`variant` prop:

| Look               | Trigger                                           | Shows                                                                                                      |
| ------------------ | ------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Empty (upload)     | `image` omitted                                   | A dashed upload tile with a file input (or a plain button, see `onEmptyClick`)                             |
| Empty compact      | `image` omitted, `isCompact` given                | 104×104 square version of the above, icon-only — `emptyLabel` becomes `aria-label` instead of visible text |
| Default (filled)   | `image` given, no `title`/`isSelected`/`onRemove` | Image + optional `date` label + optional `...` menu + optional "Main" badge (`isMainPortrait`)             |
| Selectable         | `image` given, `isSelected` given (even `false`)  | Image + a checkbox indicator, clickable/keyboard-toggleable                                                |
| Removable          | `image` + `onRemove` given                        | Plain image + a remove (×) badge, no checkbox/menu/date — `isCompact` for the 104×104 square version       |
| Style card         | `image` + `title` given                           | Image + a text panel (`title`/`description`) + always a checkbox indicator                                 |
| Style card compact | `image` + `title` + `isCompact` given             | 104×124 square image + single-line title below it, no description                                          |

## When to use

- The image tiles in Self's gallery grid — reference photos, style boards, or uploaded portraits.

## How to use

```tsx
// Empty upload tile
<AssetGalleryCard onUpload={(file) => handleUpload(file)} />

// Default filled card with a date and a "..." menu
<AssetGalleryCard
  image={asset.url}
  alt={asset.alt}
  date={asset.date}
  menuOptions={MENU_OPTIONS}
  onSelectMenuOption={(value) => handleMenuAction(value)}
/>

// Self Portrait grid — "Main" badge marks the self's current main portrait
<AssetGalleryCard
  image={asset.url}
  alt={asset.alt}
  date={asset.date}
  isMainPortrait={asset.src === mainPortraitSrc}
  menuOptions={MENU_OPTIONS}
  onSelectMenuOption={(value) => handleMenuAction(value)}
/>

// Selectable card
<AssetGalleryCard
  image={asset.url}
  alt={asset.alt}
  isSelected={selected}
  onSelectedChange={setSelected}
/>

// Style card
<AssetGalleryCard
  image={asset.url}
  alt={asset.alt}
  title={asset.title}
  description={asset.description}
  isSelected={selected}
  onSelectedChange={setSelected}
/>

// Style card compact — a radiogroup of mutually exclusive options
<div role="radiogroup" aria-label="Image style">
  {options.map((option) => (
    <AssetGalleryCard
      key={option.id}
      image={option.thumbnailSrc}
      title={option.label}
      isCompact
      selectionRole="radio"
      isSelected={selectedId === option.id}
      onSelectedChange={() => setSelectedId(option.id)}
    />
  ))}
</div>

// Empty card that opens a picker dialog instead of a native file input
<AssetGalleryCard
  emptyLabel="Add Reference"
  onEmptyClick={() => setDialogOpen(true)}
/>

// Compact icon-only empty card + compact removable thumbnails (PostingModal's Reference row)
<div style={{ display: "flex", gap: "var(--gb-spacing-2)" }}>
  {images.map((src, index) => (
    <AssetGalleryCard
      key={src}
      image={src}
      isCompact
      onRemove={() => removeImage(index)}
    />
  ))}
  <AssetGalleryCard
    isCompact
    emptyLabel="Add Reference"
    onEmptyClick={() => setDialogOpen(true)}
  />
</div>
```

## Props

| Prop                 | Type                          | Default               | Description                                                                                                                                                                                                                                                     |
| -------------------- | ----------------------------- | --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `image`              | `string`                      | —                     | Image URL. Omitted renders the empty upload card                                                                                                                                                                                                                |
| `alt`                | `string`                      | `""`                  | Alt text for the image                                                                                                                                                                                                                                          |
| `date`               | `string`                      | —                     | Date label on the filled card. Ignored on the style card                                                                                                                                                                                                        |
| `isMainPortrait`     | `boolean`                     | `false`               | Shows a "Main" badge in the bottom-left corner — marks this as the self's current main portrait. Ignored on the style/empty/removable looks                                                                                                                     |
| `onUpload`           | `(file: File) => void`        | —                     | Called with the selected file when uploading via the empty card. Ignored when `onEmptyClick` is given                                                                                                                                                           |
| `emptyLabel`         | `string`                      | `"Upload Your Image"` | Label shown on the empty card. On the compact empty card it's hidden visually but still exposed as `aria-label`                                                                                                                                                 |
| `onEmptyClick`       | `() => void`                  | —                     | Given, the empty card becomes a plain button that calls this instead of rendering a file input — for callers (e.g. a gallery dialog) that open their own picker rather than uploading a file directly                                                           |
| `menuOptions`        | `SelectOption[]`              | —                     | Filled card's `...` dropdown items. Omitted hides the trigger. Ignored when `isSelected` is given or on the style card                                                                                                                                          |
| `onSelectMenuOption` | `(value: string) => void`     | —                     | Called with the selected option's value                                                                                                                                                                                                                         |
| `title`              | `string`                      | —                     | Card title. Given switches the card into the style card look (always selectable)                                                                                                                                                                                |
| `description`        | `string`                      | —                     | Description below the title on the style card. Ignored when `isCompact` is set                                                                                                                                                                                  |
| `isCompact`          | `boolean`                     | `false`               | On the style card, Figma's `Style=style card compact` look (104×124, no description, smaller checkbox). On the empty/removable card, the 104×104 square look (icon-only empty, or a square removable thumbnail). Ignored on the default/selectable filled looks |
| `onRemove`           | `() => void`                  | —                     | Given (and no `title`/`isSelected`), switches the filled card into the removable look — a plain image with a remove (×) badge instead of a checkbox or `...` menu                                                                                               |
| `isSelected`         | `boolean`                     | —                     | Checked state. Passing it (even `false`) switches the card into the selectable look. Always treated as given on the style card                                                                                                                                  |
| `onSelectedChange`   | `(selected: boolean) => void` | —                     | Called with the next checked state on click or Space/Enter                                                                                                                                                                                                      |
| `selectionRole`      | `"checkbox" \| "radio"`       | `"checkbox"`          | ARIA role for a selectable or style card. Use `"radio"` inside a `role="radiogroup"` wrapper for mutually-exclusive options                                                                                                                                     |
| `className`          | `string`                      | —                     | Merged onto the root                                                                                                                                                                                                                                            |

## Structure

- Empty: `onEmptyClick` omitted → `<label>` wrapping a hidden `<input type="file" accept="image/*">`; given → a plain `<div role="button">`, no file input. Both show a plus-circle icon; `isCompact` drops the visible `emptyLabel` text (kept as `aria-label`) and fixes the root to a 104×104 square (`.compactEmpty`).
- Filled: `<div>`, `role={selectionRole}` (`"checkbox"` by default) + `aria-checked` + `tabIndex={0}` only when selectable (selectable or style card).
- Style card branches to its own image/text-panel layout; `isCompact` swaps that for a square image + single-line title below it with its own smaller ring/checkbox (`.compactImageBox`/`.compactRing`/`.compactCheckbox`, not the full card's `.hoverRing`/`.checkboxIndicator`).
- Removable (`onRemove` given, no `title`/`isSelected`) branches to a plain image (`.imageClip`/`.image`, or `.compactImageClip`/`.compactImg` when `isCompact`) plus a `.removeButton` (×) badge — no `.hoverRing`, no checkbox, no `...` menu. Default/selectable share the plain image + hover-ring + date/menu layout.
- The `...` menu reuses `components/ui/select` (`variant="icon-ghost"`, `icon="ellipsis-icon"`) with a hover-intent open/close (150ms close delay via `onTriggerMouseLeave`/`onContentMouseEnter`/`onContentMouseLeave`), not a raw dropdown.
- The checkbox indicator is a decorative `<span aria-hidden="true">` with a `Check` icon — the real checked semantics live on the root's `role`/`aria-checked`, not on the indicator itself.

## States and behaviors

- Hover ring (selectable/style card) and the empty card's hover border + plus icon use `--gb-border-invert`/`--gb-icon-default` — dark in light mode, light in dark mode. Not `--gb-border-static-white`/`--gb-icon-static-white`, which stay the same color in both modes.
- Selectable and style cards toggle on click anywhere on the card, or Space/Enter when focused — there is no separate checkbox hit target.
- The `...` menu and the checkbox indicator are mutually exclusive: `menuOptions` is ignored once the card becomes selectable (`isSelected` given) or is a style card.
- `isSelected`/`isStyleCard` are derived, not stored — the component holds no internal selected state; the parent (or, in Storybook, a demo wrapper) owns it via `onSelectedChange`.
- `selectionRole="radio"` only swaps the ARIA role/semantics — the visuals (ring + checkbox) are identical to the checkbox look. The caller is responsible for wrapping the group in a `role="radiogroup"` container; the component doesn't manage mutual exclusivity itself, that's still the parent's `onSelectedChange` logic (e.g. PostingModal's `ImageStyleRow`).
- The compact style card's title (`.compactTitle`) truncates with ellipsis rather than wrapping — the general-purpose component can't assume every caller's titles fit on one line the way `ImageStyleRow`'s fixed 4 options did.
- The compact title binds to Figma's `Text-xs/Semi Bold` text style and the `text/default` color variable — the same `--gb-text-xs`/`--gb-font-weight-semibold`/`--gb-text-default` tokens this component already uses elsewhere, just applied as a named style in Figma.
- `onRemove` takes priority over the default filled look whenever it's given on a non-style-card image — there's no way to combine a removable badge with a checkbox or `...` menu, matching Figma's `Style=removable compact` (no such combined variant exists).
- The remove button (`.removeButton`, 20×20, `×` icon) is the same size/position at both card sizes — only the image area switches between the full `.imageClip` and the compact `.compactImageClip`.
- `isMainPortrait` renders a `Badge` (`variant="default"`) at `.mainBadge`, bottom-left — the host decides which image is "main" by comparing its `src` against whatever it tracks as the self's main portrait (e.g. `image.src === mainPortraitSrc`); the card itself holds no notion of "main".
