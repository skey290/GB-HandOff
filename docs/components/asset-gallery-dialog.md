# AssetGalleryDialog

- Code: `components/app/asset-gallery-dialog/asset-gallery-dialog.tsx` (`asset-gallery-dialog.module.css`, `asset-gallery-dialog.stories.tsx`, `asset-gallery-dialog.test.tsx`, `index.ts`)
- Figma: [❄️ GB_Assets](https://www.figma.com/design/Wp6AZNGqC4qf2Sz5zQ2PzQ/%F0%9F%93%8C-GB_UXUI--261002-?node-id=9025-11979) — `Asset Gallery Dialog` component set, on the `Component` page next to `Part/Asset Gallery` (AssetGalleryCard). `Type` variant with 4 values covering the visually distinct looks: Self Portrait browse, Reference browse (My Reference empty), Reference browse (My Reference added — shows the delete-X card), Self Portrait style-select. Interactive-only states (delete-blocked warning, archived-Self dropdown, reference-create, picker mode) aren't duplicated here — Storybook is the source of truth for behavior; Figma covers what a given screen looks like.

## Overview

The asset management modal shared by the Self app (`app/self/page.tsx`) and Content Studio (`PostingModal`). One component, two modes:

| Mode                             | Trigger                | Tabs show                                                                       | Footer                                       |
| -------------------------------- | ---------------------- | ------------------------------------------------------------------------------- | -------------------------------------------- |
| Browse/manage (default)          | `isPickerMode` omitted | Self Portrait grid (with a "..." menu per image) / Reference grid (browse-only) | None                                         |
| Pick references (Content Studio) | `isPickerMode`         | Same tabs, but Reference images become checkboxes                               | "Select (n)" button → `onUseReferenceImages` |

Beyond browsing, the dialog has two in-place creation steps that replace the tab content (the dialog itself never resizes except for the reference-create step, which hugs its content):

- **Self Portrait style-select** — opened by uploading via the empty Self Portrait card, or by "Edit Profile Portrait" on an existing one. Shows the uploaded photo next to a 2×2 grid of style cards. A fresh upload uses independent checkboxes (can create several styles at once via `onGenerate` — the first style in the batch becomes the self's main portrait, see `isFirstOfBatch` below); editing an existing portrait switches the grid to a `radiogroup` (one replacement only, via `onReplacePortrait`).
- **Reference-create** — opened by uploading via the Reference tab's empty card. Shows the uploaded photo next to a preset grid; the raw upload is already added to "My Reference" immediately, independent of this step.

"My Reference" images are per-self data, same as `portraitImages` — the dialog holds no image state of its own. A raw upload calls `onUploadReferenceImage` immediately; picking preset(s) in the reference-create step and clicking "Create my reference" calls `onCreateReferenceImages`; the X button on a My Reference card calls `onDeleteReferenceImage`. The Self app keys all three by `galleryOpenForSelfId` so switching the "for" self shows that self's own references; `PostingModal` has no self to key by, so it just keeps this list in local state for the lifetime of that `ReferenceRow` instance.

Other behaviors:

- Deleting the only remaining Self Portrait is blocked — instead of removing it, a "Keep at least one Self Portrait" warning shakes into view on the card for 2 seconds. Otherwise, deleting calls `onDeletePortraitImage` (for a `portraitImages` entry) or `onDeleteArchivedImage` (for an image merged in from `getArchivedImages`) — the host must actually drop it from the data it passes back in, or it reappears the next time the dialog opens.
- "Set as main Portrait" calls `onSetMainPortrait` and closes the dialog. The Self Portrait grid shows which image is currently main via a "Main" badge (`AssetGalleryCard`'s `isMainPortrait`) — compare each image's `src` against whatever the host tracks as the self's main portrait and pass that in as `mainPortraitSrc`.
- The "for [Self]" header dropdown (`selves`) can include archived Selves alongside active ones — see `app/self/page.tsx` for how the host page tags archived entries with a muted label and a permanent-delete trailing icon (via `Select`'s `shouldFitContent` + `DropdownListOption`'s `muted`/`trailingIcon` props).
- **Closing never silently loses in-progress work.** Every close path (the built-in X, an outside click, Escape — all funnel through the same `DialogContent`, see `components/ui/dialog`'s "X-only" policy) is intercepted by one of two confirmations instead of calling the host's `onOpenChange` directly:
  - If a fresh upload + style pick is still pending (nothing is committed until Create), it asks **"Discard this Self Portrait?"** — confirming calls `handleCancelSelfPortraitUpload` internally, then the host's `onOpenChange(false)`.
  - If `isCreatingSelf` is set and the Self Portrait grid is still empty — i.e. this session is for a self still being created, before any portrait exists yet — it asks **"Cancel creating this self?"** instead (this takes priority over the discard warning above, since abandoning the self obviously also abandons any in-progress upload). Confirming calls `onCancelCreating` instead of `onOpenChange(false)`, so the host can roll the whole in-progress self back (see `app/self/page.tsx`'s `handleCancelCreatingSelf` — removes it from `selves`, its Goal override, and any portrait/reference images). Once the self has at least one portrait, it's "finished" and this dialog closes normally again.

## When to use

- Any entry point that lets a user browse/manage a Self's portrait and references (Self app), or pick reference images for a post (Content Studio).

## How to use

```tsx
// Self app — browse/manage, no picker footer
<AssetGalleryDialog
  open={galleryOpenForSelfId !== null}
  onOpenChange={(open) => !open && setGalleryOpenForSelfId(null)}
  selves={selves.map((self) => ({ value: self.id, label: self.label }))}
  selfId={galleryOpenForSelfId ?? ""}
  onSelfIdChange={setGalleryOpenForSelfId}
  portraitImages={portraitImagesBySelfId[galleryOpenForSelfId ?? ""] ?? []}
  onGenerate={handleGeneratePortrait}
  mainPortraitSrc={selves.find((self) => self.id === galleryOpenForSelfId)?.image}
  onSetMainPortrait={handleSetMainPortrait}
  onReplacePortrait={handleReplacePortrait}
  onDeletePortraitImage={handleDeletePortraitImage}
  onDeleteArchivedImage={handleDeleteArchivedImage}
  myReferenceImages={referenceImagesBySelfId[galleryOpenForSelfId ?? ""] ?? []}
  onUploadReferenceImage={handleUploadReferenceImage}
  onCreateReferenceImages={handleCreateReferenceImages}
  onDeleteReferenceImage={handleDeleteReferenceImage}
  onUseReferenceImages={handleUseReferenceImages}
  // Only set while this Asset Gallery session is for a self still being
  // created (see "Other behaviors" below) — not for browsing/editing an
  // existing self's portrait.
  isCreatingSelf={galleryOpenForSelfId === creatingSelfId}
  onCancelCreating={handleCancelCreatingSelf}
/>

// Content Studio (PostingModal) — picker mode, Reference tab pre-selected.
// No "self" to scope My Reference by, so ReferenceRow keeps it in local state.
<AssetGalleryDialog
  open={galleryOpen}
  onOpenChange={setGalleryOpen}
  selves={[{ value: "this-post", label: "This Post" }]}
  selfId="this-post"
  onSelfIdChange={() => {}}
  portraitImages={[]}
  onGenerate={noop}
  onSetMainPortrait={noop}
  onReplacePortrait={noop}
  onDeletePortraitImage={noop}
  onDeleteArchivedImage={noop}
  myReferenceImages={myReferenceImages}
  onUploadReferenceImage={handleUploadReferenceImage}
  onCreateReferenceImages={handleCreateReferenceImages}
  onDeleteReferenceImage={handleDeleteReferenceImage}
  onUseReferenceImages={handleUseReferenceImages}
  isPickerMode
  initialTabIndex={1}
/>
```

In Storybook, toggling `isPickerMode` in the Playground's Controls panel switches the canvas between these two looks and updates the "Show code" panel to the matching call site's real code (see the `source.transform` in `asset-gallery-dialog.stories.tsx`) — no need to read both files side by side.

Beyond the Playground, dedicated stories open each interactive state directly via a `play` function, so they're visible without reading `.test.tsx` or manually uploading a file: `StyleSelectFreshUpload`, `StyleSelectEditExisting`, `ReferenceCreateStep`, `UnsavedUploadDiscardWarning`, `CancelCreatingSelfWarning` (uses the seed-less "New Self" entry in the demo `SELVES` to start from an empty Self Portrait grid), `DeleteBlockedWarning` (its warning auto-hides after 2s, same as production — check the Interactions panel if the canvas already moved past it), `PickerModeSelection`.

`colorScheme` has no separate Control — the Playground canvas just follows Storybook's own dark/light toolbar toggle (`storybook-dark-mode`) directly, so there's one dark/light switch instead of two disconnected ones.

## Props

| Prop                        | Type                                                  | Notes                                                                                                                                                                                                                                                                                   |
| --------------------------- | ----------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `open` / `onOpenChange`     | `boolean` / `(open: boolean) => void`                 | Fully controlled — no built-in trigger.                                                                                                                                                                                                                                                 |
| `selves`                    | `SelectOption[]`                                      | Options for the header "for" dropdown.                                                                                                                                                                                                                                                  |
| `selfId` / `onSelfIdChange` | `string` / `(selfId: string) => void`                 | Which self's gallery is shown.                                                                                                                                                                                                                                                          |
| `selfLabel`                 | `string`                                              | Replaces the "for" dropdown with a static label. Always used (falling back to the matching `selves` label if omitted) when `isPickerMode` is set — picking references has no "self" to switch, so the dropdown never renders in that mode regardless of whether `selfLabel` was passed. |
| `portraitImages`            | `AssetGalleryPortraitImage[]`                         | That self's Self Portrait images (archived images for the same self are merged in internally via `getArchivedImages`).                                                                                                                                                                  |
| `onGenerate`                | `(imageSrc: string, isFirstOfBatch: boolean) => void` | Called once per selected style card after a fresh upload. `isFirstOfBatch` is `true` for the first image in a multi-style batch — the host uses it to decide which newly generated image becomes the self's main portrait.                                                              |
| `mainPortraitSrc`           | `string`                                              | Src of this self's current main portrait — shown with a "Main" badge in the Self Portrait grid.                                                                                                                                                                                         |
| `onSetMainPortrait`         | `(imageSrc: string) => void`                          | "Set as main Portrait" menu action.                                                                                                                                                                                                                                                     |
| `onReplacePortrait`         | `(imageId: string, newImageSrc: string) => void`      | "Edit Profile Portrait" → style pick, replaces in place.                                                                                                                                                                                                                                |
| `onDeletePortraitImage`     | `(imageId: string) => void`                           | "Delete Self Portrait" on a `portraitImages` entry — host must remove it from that array.                                                                                                                                                                                               |
| `onDeleteArchivedImage`     | `(imageSrc: string) => void`                          | "Delete Self Portrait" on an image merged in from `getArchivedImages` — host must remove it from the archive store.                                                                                                                                                                     |
| `myReferenceImages`         | `AssetGalleryPortraitImage[]`                         | That self's "My Reference" images (Reference tab). Scoped the same way as `portraitImages` — the dialog has no image state of its own.                                                                                                                                                  |
| `onUploadReferenceImage`    | `(imageSrc: string) => void`                          | A raw file upload on the Reference tab's empty card — lands in My Reference immediately.                                                                                                                                                                                                |
| `onCreateReferenceImages`   | `(images: { src: string; alt: string }[]) => void`    | "Create my reference" in the reference-create step, with the preset(s) picked.                                                                                                                                                                                                          |
| `onDeleteReferenceImage`    | `(imageId: string) => void`                           | The X button on a `myReferenceImages` card.                                                                                                                                                                                                                                             |
| `onUseReferenceImages`      | `(imageSrcs: string[]) => void`                       | Picker mode's "Select" confirm.                                                                                                                                                                                                                                                         |
| `initialTabIndex`           | `0 \| 1`                                              | Tab shown on open. Default `0` (Self Portrait).                                                                                                                                                                                                                                         |
| `colorScheme`               | `"dark" \| "light"`                                   | Default `"dark"`.                                                                                                                                                                                                                                                                       |
| `isPickerMode`              | `boolean`                                             | Adds checkboxes + the "Select" footer to the Reference tab, and forces the "for" field to plain text (see `selfLabel`). Default `false`.                                                                                                                                                |
| `isCreatingSelf`            | `boolean`                                             | This session is for a self still being created, not just browsing/editing an existing one — while the Self Portrait grid is still empty, closing (by any means) asks "Cancel creating this self?" via `onCancelCreating` instead of just closing. Default `false`.                      |
| `onCancelCreating`          | `() => void`                                          | Called instead of `onOpenChange(false)` when the user confirms canceling self creation (see `isCreatingSelf`) — the host rolls back the in-progress self.                                                                                                                               |
