# PostingModal

- Code: `components/screens/content-studio/ui/PostingModal/PostingModal.tsx` (`PostingModal.module.css`, `PostingModal.stories.tsx`, `PostingModal.test.tsx`, `index.ts`, `ImageStyleCard.tsx`)
- Figma: [📌 GB_UXUI](https://www.figma.com/design/Wp6AZNGqC4qf2Sz5zQ2PzQ/%F0%9F%93%8C-GB_UXUI--261002-?node-id=8127-91305) `Posting modal` node `8127:91305`

## Overview

The Content Studio post-composer modal. Figma's `Style` axis splits it into two unrelated flows that happen to share a shell (rounded card, close button, date header):

- **`Style=empty`** — creation flow. Pick platforms, how many posts to generate, a post-type filter, and a generation instruction in a `Chatbox`, then `Auto-generate`. When the post-type filter is "All" or "Image", the same "Image style"/"Reference" rows used in `Style=default` also show here.
- **`Style=default`** — edit flow. A left column edits date/time/platforms, an optional "Image style" row, a "Reference" row, and holds an AI-rewrite `ChatboxComposer`; a right column shows `Tabs` (one per `post.platforms` entry) and a `PostCard` preview for whichever tab is active, plus a footer (Archive / Save Changes / Schedule Draft).

In code this is one component, `PostingModal`, whose `style` prop is a TypeScript discriminated union (`PostingModalEmptyProps` vs `PostingModalDefaultProps`) — each branch only accepts the props that flow actually uses.

## When to use

- Content Studio's "create a new post" and "edit an existing post" dialogs.

## When not to use

- For a single platform's read-only preview without the surrounding form — use `PostCard` directly.

## How to use

```tsx
// Creation flow
<PostingModal
  style="empty"
  platforms={platforms}
  onAddPlatform={(platform) => addPlatform(platform)}
  onRemovePlatform={(index) => removePlatform(index)}
  postCount={postCount}
  onPostCountChange={setPostCount}
  postTypeIndex={postTypeIndex}
  onPostTypeChange={setPostTypeIndex}
  instruction={instruction}
  onInstructionChange={setInstruction}
  onAutoGenerate={handleGenerate}
  onClose={handleClose}
/>

// Edit flow
<PostingModal
  style="default"
  post={post}
  activeTabIndex={activeTabIndex}
  onActiveTabIndexChange={setActiveTabIndex}
  onAddPlatform={(platform) => addPlatform(platform)}
  onRemovePlatform={(index) => removePlatform(index)}
  onSaveChanges={handleSaveChanges}
  onScheduleDraft={handleScheduleDraft}
  onArchive={handleArchive}
  onClose={handleClose}
/>
```

## Props

Shared (`PostingModalSharedProps`):

| Prop              | Type         | Default           | Description                             |
| ----------------- | ------------ | ----------------- | --------------------------------------- |
| `showCloseButton` | `boolean`    | `true`            | Figma `closeButton`                     |
| `onClose`         | `() => void` | —                 | Called when the close button is clicked |
| `dateLabel`       | `string`     | `"Today, Sep 01"` | Header date label                       |
| `className`       | `string`     | —                 | Merged onto the root `<div>`            |

`style="empty"` (`PostingModalEmptyProps`):

| Prop                          | Type                               | Description                                                                                                |
| ----------------------------- | ---------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `platforms`                   | `PostPlatform[]`                   | Platforms shown as deletable chips in "Where to post?"                                                     |
| `onAddPlatform`               | `(platform: PostPlatform) => void` | Called when a platform is picked from the "+" dropdown                                                     |
| `onRemovePlatform`            | `(index: number) => void`          | Called when a chip's delete (×) is clicked. Never called for the last remaining platform                   |
| `postCount`                   | `number`                           | "How many posts are you going to make?" stepper                                                            |
| `onPostCountChange`           | `(count: number) => void`          | —                                                                                                          |
| `postTypeIndex`               | `number`                           | 0=All / 1=Image / 2=Text                                                                                   |
| `onPostTypeChange`            | `(index: number) => void`          | —                                                                                                          |
| `instruction`                 | `string`                           | Generation instruction text in the `Chatbox`                                                               |
| `onInstructionChange`         | `(value: string) => void`          | —                                                                                                          |
| `onAutoGenerate`              | `() => void`                       | "Auto-generate" button                                                                                     |
| `selectedImageStyleId`        | `string`                           | Selected "Image style" card id when controlled. Shown with "Reference" only when `postTypeIndex` is 0 or 1 |
| `defaultSelectedImageStyleId` | `string`                           | Initial selected card id when uncontrolled                                                                 |
| `onImageStyleChange`          | `(id: string) => void`             | Called when a different image style card is clicked                                                        |
| `referenceImages`             | `string[]`                         | Reference image srcs already attached, when controlled                                                     |
| `defaultReferenceImages`      | `string[]`                         | Initial reference image srcs when uncontrolled                                                             |
| `onReferenceImagesChange`     | `(images: string[]) => void`       | Called with the full next list when images are picked from the Reference gallery dialog                    |

`style="default"` (`PostingModalDefaultProps`):

| Prop                          | Type                               | Description                                                                                                                                                                                                                                                            |
| ----------------------------- | ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `post`                        | `Post`                             | Drives the "Where to post?" chips and the right-side Tabs/preview                                                                                                                                                                                                      |
| `onAddPlatform`               | `(platform: PostPlatform) => void` | Called when a platform is picked from the "+" dropdown                                                                                                                                                                                                                 |
| `onRemovePlatform`            | `(index: number) => void`          | Called when a chip's delete (×) is clicked. Never called for the last remaining platform                                                                                                                                                                               |
| `avatarSrc`                   | `string`                           | Forwarded to `PostCard`                                                                                                                                                                                                                                                |
| `activeTabIndex`              | `number`                           | Index into `post.platforms` for the active tab/preview                                                                                                                                                                                                                 |
| `onActiveTabIndexChange`      | `(index: number) => void`          | —                                                                                                                                                                                                                                                                      |
| `onDateChange`                | `(date: Date) => void`             | Forwarded from `DateSelect`                                                                                                                                                                                                                                            |
| `onTimeChange`                | `(value: string) => void`          | Forwarded from `InputTime`                                                                                                                                                                                                                                             |
| `onTimePeriodChange`          | `(period: "AM" \| "PM") => void`   | Forwarded from `InputTime`                                                                                                                                                                                                                                             |
| `rewriteInstruction`          | `string`                           | AI rewrite instruction text in the `ChatboxComposer`                                                                                                                                                                                                                   |
| `onRewriteInstructionChange`  | `(value: string) => void`          | —                                                                                                                                                                                                                                                                      |
| `postTypeIndex`               | `number`                           | The rewrite `ChatboxComposer`'s Image/Text chip (0=Image/1=Text, no "All" — there's already a post to retype rather than generate from scratch) when controlled. "Text" hides the Image style/Reference rows below                                                     |
| `defaultPostTypeIndex`        | `number`                           | Initial chip index when uncontrolled                                                                                                                                                                                                                                   |
| `onPostTypeChange`            | `(index: number) => void`          | —                                                                                                                                                                                                                                                                      |
| `onApplyChanges`              | `() => void`                       | "Apply Changes" button                                                                                                                                                                                                                                                 |
| `onSaveChanges`               | `() => void`                       | Footer "Save Changes" — notification only, does not mutate `post`. The caller decides what "saved" means for its own data                                                                                                                                              |
| `onScheduleDraft`             | `() => void`                       | Footer "Schedule Draft" — notification only. To show the "Scheduled" badge (`PostCard`'s `STATUS_LABELS[post.status]`, colored via `STATUS_BADGE_VARIANT[post.status]`), the caller must update its own `post.status` to `"scheduled"` and pass the new `post` back in |
| `onArchive`                   | `() => void`                       | Footer "Move to Archive"                                                                                                                                                                                                                                               |
| `selectedImageStyleId`        | `string`                           | Selected "Image style" card id when controlled. The row (Figma's fixed 4 options, `IMAGE_STYLE_OPTIONS`) shows only when `post.contentType !== "text"`, `post.images.length > 0`, and `postTypeIndex` isn't 1 ("Text")                                                 |
| `defaultSelectedImageStyleId` | `string`                           | Initial selected card id when uncontrolled                                                                                                                                                                                                                             |
| `onImageStyleChange`          | `(id: string) => void`             | Called when a different image style card is clicked                                                                                                                                                                                                                    |
| `referenceImages`             | `string[]`                         | Reference image srcs already attached, when controlled                                                                                                                                                                                                                 |
| `defaultReferenceImages`      | `string[]`                         | Initial reference image srcs when uncontrolled                                                                                                                                                                                                                         |
| `onReferenceImagesChange`     | `(images: string[]) => void`       | Called with the full next list when images are picked from the Reference gallery dialog                                                                                                                                                                                |

## Structure

```
<div data-style="empty" | "default">     root (radius-2xl, border-subtler, padding-5)
  <column>                                left (empty: fields, default: form + rewrite chatbox)
  {style === "default" && <divider/>}
  <column>                                right (default only: Tabs + PostCard + footer)
  <CloseButton/>                          absolute, outside the top-right border
```

### Right side: Tabs/preview are driven by `post.platforms`, not a switch statement

```tsx
const tabItems = post.platforms.map((platform) => ({ label: PLATFORM_LABELS[platform] }));
const activePlatform = post.platforms[activeTabIndex] ?? post.platforms[0] ?? "linkedin";

<Tabs items={tabItems} selectedIndex={activeTabIndex} onSelectedIndexChange={onActiveTabIndexChange} />
<PostCard post={post} platform={activePlatform} ... />
```

Adding a platform to `post.platforms` grows both the tab row and the set of previews reachable through it — no new `if`/`switch` branch. This relies on a small addition to `PostCard` (`components/screens/content-studio/ui/PostCard/PostCard.tsx`): an optional `platform?: PostPlatform` prop that overrides which of its four internal layouts renders, defaulting to `post.platforms[0]` when omitted (so every existing `PostCard` call site is unaffected).

### "Where to post?"

Each selected platform (`platforms` for `style="empty"`, `post.platforms` for `style="default"`) renders as a `Chips` instance (`variant="secondary"`) with its delete (×) badge, followed by a trailing `Select` (`variant="icon"`, `plus-icon`) whose dropdown lists only the platforms not yet selected. Picking an option there calls `onAddPlatform(platform)`; clicking a chip's × calls `onRemovePlatform(index)`.

- **At least one platform is always kept.** `showDeleteIcon` on the chips is `false` whenever only one platform remains, so there's nothing to click to remove the last one — `onRemovePlatform` is simply never reachable in that state.
- **The add trigger disappears once every platform is selected.** With all 4 platforms already picked, there's nothing left to offer, so the `Select` isn't rendered at all rather than showing an empty dropdown.
- No Figma spec exists for this chip+dropdown interaction — the static mockup only ever shows one platform selected via a plain `Select` trigger with no add/remove shown. The pattern above is a functional addition built from existing `Chips`/`Select` primitives, not a design-to-code port.

### "Image style" / "Reference" rows

Both rows are shared between `style="empty"` and `style="default"` as two local components, `ImageStyleRow` and `ReferenceRow` (in `PostingModal.tsx`), each owning their own controlled/uncontrolled state independently — mirroring the rest of the file's `value`/`onValueChange` convention. Both rows render `AssetGalleryCard` directly (`components/app/asset-gallery-card`) rather than a local card component — see `asset-gallery-card.md` for the `isCompact`/`selectionRole`/`onRemove`/`onEmptyClick` props this reuse relies on.

**Visibility differs by flow**, since each flow has a different signal for "is there an image to style":

- `style="default"`: both rows show together only when its own `postTypeIndex` (the rewrite `ChatboxComposer`'s Image/Text chip — no "All", there's already a post to retype — controlled/uncontrolled like everything else here) isn't 1 ("Text"); `ImageStyleRow` additionally requires `post.contentType !== "text" && post.images.length > 0`.
- `style="empty"`: nothing has been generated yet, so there's no `post` to check — both rows show together only when `postTypeIndex` is 0 ("All") or 1 ("Image"); for "Text" (2), neither renders. No Figma spec exists for this in the empty flow either (see below) — the empty-flow condition and the "both together" grouping are both functional additions, not ports.
- When `style="empty"`'s rows are visible, `.emptyLeft` widens from 232px to 420px (`data-has-image-section="true"`) to match `style="default"`'s left column — the 104px cards need that room, and there's no Figma frame for this case to measure a narrower layout against.

**`ImageStyleRow`** — a `role="radiogroup"` of compact `AssetGalleryCard` style cards:

- **The 4 options are a closed, hardcoded list, not a prop.** Figma's `Part/Asset Gallery` → `image style option` (node `8828:17517`) fixes this at exactly 4 styles (Artistic Duotone, Monochrome, Editorial, Deep Chroma), so `IMAGE_STYLE_OPTIONS` is exported as a constant from `ImageStyleCard.tsx` (same pattern as `ContentGoalForm`'s `CONTENT_PILLARS`/`CONTENT_RATIOS`) instead of an open `imageStyleOptions` prop. Thumbnails live at `public/images/styles/*.jpg`.
- **Selection is controlled/uncontrolled like `Chatbox`'s `value`**: `selectedImageStyleId` (controlled) or `defaultSelectedImageStyleId` (uncontrolled, internal `useState`), both reported through `onImageStyleChange`.
- Each card is `AssetGalleryCard` with `title` + `isCompact` + `selectionRole="radio"` (Figma `Style=style card compact`) — `"radio"` matches the project's radiogroup convention for "choose one of many" (see `components/ui/toggle`) rather than `AssetGalleryCard`'s default independent-checkbox semantics.

**`ReferenceRow`** — already-picked reference images as removable compact thumbnails, plus a trailing compact empty card that opens `AssetGalleryDialog` on its Reference tab:

- **Both states are `AssetGalleryCard`, not a local component.** An already-picked image is `<AssetGalleryCard image={src} isCompact onRemove={...} />` (Figma `Style=removable compact` — a plain image + a remove (×) badge, no checkbox/menu/date); the trailing "+" is `<AssetGalleryCard isCompact emptyLabel="Add Reference" onEmptyClick={...} />` (Figma `Style=empty compact` — icon-only, `emptyLabel` only reaches screen readers via `aria-label`, no visible text).
- **Selection is controlled/uncontrolled like `selectedImageStyleId`**: `referenceImages` (controlled) or `defaultReferenceImages` (uncontrolled, internal `useState`), both reported through `onReferenceImagesChange` with the full next array.
- **The "+" card opens `AssetGalleryDialog`** (`components/app/asset-gallery-dialog`) via its `initialTabIndex?: number` prop (default `0`), passed `1` here so it lands on the Reference tab instead of Self Portrait — see `docs/components/asset-gallery-dialog.md` for the dialog's full prop reference.
- **The dialog's "for [self]" selector has no meaning here** — PostingModal has no "self" concept, so it's wired with a single fixed placeholder option (`REFERENCE_DIALOG_SELVES`, value `"post"`/label `"This Post"`) and no-op `onSelfIdChange`/`onGenerate` (the Self Portrait tab's own actions, unused from this entry point).
- Picking one or more images and clicking the dialog's own "Generate" button calls `onUseReferenceImages`, which `ReferenceRow` appends onto the existing reference list and reports via `onReferenceImagesChange`. Each flow owns its own `AssetGalleryDialog` instance (one inside each `ReferenceRow`), so `style="empty"`'s and `style="default"`'s reference state are fully independent.

## States and behaviors

- **Both Chatbox instances render with `showAiButton={false}` and `showAttachButton={false}`.** The surrounding `Auto-generate` (empty) / `Apply Changes` (default) button is the actual submit action, not the Chatbox's own send button — and this modal has its own dedicated "Reference" row (see above) for attaching images, so the Chatbox's own attach button is redundant here.
- **Both Chatbox instances render with `shouldForceDark={false}`.** Figma draws this modal light throughout (white panel, dark text) in both styles, unlike `Chatbox`'s own default Figma frame — see `chatbox.md`.
- **The two Chatbox instances represent opposite `Status`es, matching where each flow actually is.** `style="empty"`'s generation `Chatbox` has nothing typed yet at this point in the flow, so its real state is `default`/placeholder (not `filled`) — the `instruction` value passed in should start empty. `style="default"`'s rewrite `ChatboxComposer` sits on a post that's already been generated, so Figma draws it as `filled` — the `rewriteInstruction` value passed in there is expected to already hold text. Neither atom needed a code change for this: `Chatbox`'s placeholder-vs-value color swap is already driven purely by whether `value`/`defaultValue` has content (see `chatbox.md`'s `Status` table) — this is about which sample state each call site's story/Figma frame should show, not new component logic.
- **`style="default"`'s rewrite box is `ChatboxComposer` with `variant="chips"` and `chipLabels={["Image","Text"]}`** (`ChatboxComposer`'s `chipLabels` prop overrides its default `["All","Image","Text"]` set) — editing an existing post has no "All" case, only switching the post's own type between Image and Text. `style="empty"`'s own Post Type row keeps all 3, built from `Chips` directly since it sits outside any Chatbox.
- **Matches Figma's `buttons={false}` via `PostCard`'s `showButtons` prop.** Figma's embedded post preview (`Part/post`) is passed its own boolean `buttons` property set to `false` inside this modal, hiding its Archive/Schedule-Draft row since the modal supplies an equivalent footer. `PostCard` exposes that same Figma property as `showButtons` (default `true`); `PostingModal`'s `style="default"` preview passes `showButtons={false}` so the footer is the only place those actions appear, with no duplicate button-name collisions to worry about in tests or consumers.
- **The preview `PostCard`'s status badge color follows `ScheduleSlot`, not an independent Figma spec.** `PostCard` maps `post.status` to a `Badge` variant via `STATUS_BADGE_VARIANT` (`components/review/content-studio/data.ts`) so it matches `ScheduleSlot`'s own type→variant mapping exactly: `draft`→`reverse`, `scheduled`→`default`, `posted`→`outline`. Figma's `Part/post` only has a mockup for the `draft` case (badge always reads "Draft" in `reverse` colors) — there is no `scheduled`/`posted` badge-color mockup anywhere in `Part/post` to verify against, so this is a cross-component consistency decision, not a Figma-verified value for those two states.
- **Two genuine Figma mismatches preserved as-is** (not unified, per the project's "Figma 값을 추정으로 기각하지 말 것" rule): the "Where to post?" label is `text-xs-medium` in `style="empty"` but `text-sm-medium` in `style="default"`; the embedded post-type `Chips` are 24px tall in `style="empty"`'s standalone row but 28px (`Chips`' own default `md` size) in `style="default"`'s `Chatbox` slot — `Chips` only ships `md`/`sm` (28px/20px), so `md` was kept rather than introducing a one-off 24px override.
- **The post-count stepper is bespoke markup**, not a shared component — Figma fixes it at a 24px circular button, which doesn't match any existing `Button` variant's size (`icon`/`icon-rounded` are 36px), and no other component in the codebase needed a 24px stepper to justify extracting one.
- **Left/right column widths are approximate, not literal Figma values.** Figma's `style="default"` mockup only ever shows one platform at a time, with the left column's width changing per platform (`610px` for LinkedIn, `720px` for X/Instagram/Thread) as a side effect of that — since this component unifies all platforms into one multi-tab view, those per-mockup widths don't carry over directly; the left column uses a single fixed `420px`. The right column (`.defaultRight`) caps itself to match `PostCard`'s own per-platform width (700px LinkedIn / 500px the others, via `data-platform`) instead of stretching to fill leftover space — the whole modal has no fixed overall width, it hugs whichever platform's content is active.
- **Both columns (and anything flex-growing inside them) size to the TALLER column's true natural height, never further than that unless one column genuinely needs it — except for `style="empty"`'s own fixed floor (see below).** `.scrollArea` must itself be bounded (`align-self: stretch` to `.root`, capped by `.root`'s `max-height: 85vh`) so it can scroll at all — but `.scrollArea`'s children (`.emptyRow`/`.defaultRow`) use `align-items: flex-start`, not `stretch`, so they're free to be taller than that bound (e.g. `style="default"`'s tall `PostCard` preview) and let `.scrollArea`'s own `overflow-y: auto` scroll through the full height. `.chatbox`'s `flex: 1 1 auto` (see `chatbox.md`) grows past its own `min-height: 112px` whenever its row has leftover height to give it — from the OTHER column genuinely being taller, or from the floor below.
- **`.emptyRow`/`.defaultRow` both carry `min-height: 100%`, but it only does anything for `style="empty"`.** A percentage `min-height` resolves against the nearest ancestor with a _definite_ height — `.root[data-style="empty"]` sets `min-height: 600px`, which makes `.scrollArea`'s height definite too (via its own `align-self: stretch`), so `.emptyRow`'s `100%` resolves to that 600px and becomes a real floor: a short instruction with no Image style/Reference rows (`postTypeIndex` "Image"/"Text") still fills the modal instead of leaving dead space below the Auto-generate button, while content taller than 600px still grows past the floor and scrolls (a floor, not a cap). `.root[data-style="default"]` has no `min-height` at all, so `.scrollArea`'s height there is itself just content-sized (indefinite) — `.defaultRow`'s `100%` has nothing definite to resolve against and is a no-op; a short post still keeps both `style="default"` columns at their own natural minimum instead of ballooning. Confirmed live both ways: `style="empty"` with `postTypeIndex="Text"` and a one-line instruction measures `.emptyRow` at a full 558px (no gap); `style="default"` on a one-line text post measures `.defaultRow` at 410px, smaller than `.scrollArea`'s own 418px — not inflated.
- **Archive and Schedule Draft are gated by different conditions, not both by `isDraftStatus`.** Archive shows whenever the post is editable at all (`!isReadOnly`, i.e. `status !== "posted"`) — it stays visible after scheduling, since a scheduled post can still be pulled back to Archive. Schedule Draft only shows while `status === "draft"` — it disappears once scheduled, since the post is already scheduled at that point. `Save Changes` itself only disables on `isReadOnly` (`status === "posted"`).
- **The footer's two buttons split the capped right column via `flex: 1 1 0`, not `width: 100%` each.** `Button`'s own base style is `flex-shrink: 0`, so two `width: 100%` siblings in the same row never actually shrink to share it — they'd both render at the column's full width and overflow past the modal's edge. `.footer .fullWidthButton` overrides this (see `PostingModal.module.css`).
- **`onAddPlatform`/`onRemovePlatform`/`onPostTypeChange`/`onApplyChanges`/`onScheduleDraft`/`onSaveChanges`/`onArchive`/`onActiveTabIndexChange`/`onDateChange`/`onTimeChange`/`onTimePeriodChange` are all notify-only — none of them mutate `post`/`platforms` internally.** The component has no internal source of truth for anything derived from `post` (Tabs, the preview, the chips, the header date/time shown on `PostCard`) beyond `ImageStyleRow`/`ReferenceRow`'s own uncontrolled fallback state and `DateSelect`/`InputTime`'s own uncontrolled display — the caller owns `post`/`platforms` and must update it in response to these callbacks for the UI to actually change (e.g. set `post.status = "scheduled"` in `onScheduleDraft`, splice `post.platforms` in `onAddPlatform`/`onRemovePlatform`, update `post.date`/`post.time` in `onDateChange`/`onTimeChange`/`onTimePeriodChange` so the `PostCard` preview's date/time line reflects the edit). The Storybook Playground's `DefaultPlayground`/`EmptyPlayground` wrappers (`PostingModal.stories.tsx`) exist specifically to demonstrate this minimum wiring in one place.
- **`onApplyChanges` has no real rewrite logic behind it — there's no AI backend wired up yet.** `DefaultPlayground`'s handler is a demo-only mock: it reflects the typed `rewriteInstruction` straight into `post.caption` just so reviewers can see the left-column input affect the right-side preview. A real caller should call its own generation API in response to this callback and pass the actual result back in as the new `post`.

## Composition with other components

- `Chips` (`variant="secondary"`, `showDeleteIcon`) — "Where to post?" selected-platform chips, and "Select Post Type" (`style="empty"`)
- `Select` (`variant="icon"`) — "Where to post?" trailing add-platform dropdown
- `DateSelect` / `InputTime` — date/time fields (`style="default"` only)
- `Chatbox` / `ChatboxComposer` (`variant="chips"`, both `shouldForceDark={false}`, `showAttachButton={false}`) — generation/rewrite instruction input
- `AssetGalleryCard` (`isCompact`, `selectionRole="radio"` / `onRemove` / `onEmptyClick`) — "Image style" row cards and "Reference" row thumbnails/add button
- `AssetGalleryDialog` — opened by each `ReferenceRow`'s "+" button, forced to its Reference tab via `initialTabIndex={1}`
- `Tabs` — platform switcher (`style="default"`)
- `PostCard` — preview, via its `platform` override prop
- `Button` — all actions (`variant="primary"` for Auto-generate/Schedule Draft, `variant="outline"` for Apply Changes/Save Changes, `variant="icon"` for Archive/Close)
