# AssetPanel

Figma: [❄️ GB_UXUI (261002)](https://www.figma.com/design/Wp6AZNGqC4qf2Sz5zQ2PzQ/%F0%9F%93%8C-GB_UXUI--261002-?node-id=8612-89563) — `Detail view` (node-id `8612:89563`)
Code: `components/screens/self/ui/asset-panel/asset-panel.tsx`

## Overview

The live `/assets` site's right-side fixed panel for the currently selected Self: an avatar/role/description header with an overflow menu, the "Known for Now/Next" goal section (embedding `GoalSetting`), and a "Create contents" button.

## When to use

- The right-rail detail panel on a Self screen that shows the selected Self's profile and goal.

## When not to use

- The circular 8-slot Self picker itself → `SelfCluster` (`components/screens/self/ui/self-cluster`), which this panel is paired with but does not replace.

## How to use

```tsx
<AssetPanel
  self={activeSelfProfile}
  onCreateContents={() => router.push("/content-studio")}
  onEditSelfPortrait={() => setSelfPortraitOpen(true)}
  onGoToAssetGallery={() =>
    router.push(`/assets/asset-gallery?self=${self.id}`)
  }
/>
```

## Structure

Four files per the project component rule: `asset-panel.tsx` / `asset-panel.stories.tsx` / `asset-panel.test.tsx` / `index.ts`.

```
<div dark>                         root, 500px wide, full height, scrolls
  <div relative>                   header row
    <img>                          120×120 avatar
    <div>                          role (title) + description
    <button absolute>              "..." trigger, overlaid top-right (not in flow)
      <Popover.Content>            210px menu — Edit Self Portrait / Go to Asset Gallery / Edit Goal
  <Divider />
  <GoalSetting showHeader={false} showSaveButton={false} showSelfName={false} />
  <Button variant="primary">       "Create contents"
```

- The root is forced `dark` regardless of OS theme — Figma's `Detail view` is dark-only, and the embedded `GoalSetting` already forces `dark` internally, so the header must match or the panel splits into two colors.
- The "..." trigger is **not** a flex sibling of the header row — Figma draws it as an absolute overlay (`top: 18px` from the frame, `right: 36px`, i.e. flush with the content inset) that does not take up header width. The code mirrors that with `absolute top-[-6px] right-0` inside a `relative` header wrapper, so the role/description column isn't narrowed by the button's width.
- The trigger is a plain `<button>`, not the shared `Button` component — its Figma "menu open" look (`background-default` + `border-static-gray` + `shadow-focus-ring`) is a state combination `Button`'s `icon-ghost` variant doesn't have, and a consumer `className` can't override `button.module.css` (CSS Modules beat Tailwind utility specificity here). The dropdown items reuse the same plain-`<button>` pattern for the same reason.

## Props

| Prop                 | Type                    | Description                                         |
| -------------------- | ----------------------- | --------------------------------------------------- |
| `self`               | `AssetPanelSelfProfile` | The selected Self's profile + goal data (see below) |
| `onCreateContents`   | `() => void`            | "Create contents" button                            |
| `onEditSelfPortrait` | `() => void`            | "..." menu → "Edit Self Portrait"                   |
| `onGoToAssetGallery` | `() => void`            | "..." menu → "Go to Asset Gallery"                  |
| `className`          | `string`                | Merged onto the root `<div>`                        |

`AssetPanelSelfProfile`: `id`, `role`, `image`, `description`, plus the `GoalSetting` fields it forwards unchanged — `knownForNow`, `knownForNext`, `postingCount`, `postingFrequency`, `targetedFollowersIndex`, `timeframe`, `goalActions`.

The menu's third item, "Edit Goal", has no dedicated prop — it scrolls the panel back to top (where the goal section sits) rather than calling back to the consumer, since "editing" the goal already happens inline in the embedded `GoalSetting`.

## Variants

No `variant` prop. Figma's `Detail view` has one axis, `Status` (`default` / `menu open`) — not a prop, it's the Popover's own open state. The two variants are otherwise pixel-identical; only the trigger's open look and the extra dropdown content differ.

## States and behaviors

| Property               | Value                                                                                                                                 |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Root width             | 500px, fixed                                                                                                                          |
| Root padding           | `--gb-spacing-9` (36px) on all four sides                                                                                             |
| Root gap               | `--gb-spacing-7`                                                                                                                      |
| Avatar                 | 120×120, `--gb-radius-scale-2xl`                                                                                                      |
| Title                  | `text-base-bold`, `--gb-text-default`                                                                                                 |
| Description            | `text-sm-medium`, `--gb-text-default` (not `text-subtle`)                                                                             |
| "..." trigger (closed) | transparent, rounds to `--gb-radius-scale-full`; hover → `--gb-background-mute` + `--gb-radius-scale-lg`                              |
| "..." trigger (open)   | `--gb-background-default` + `--gb-border-static-gray` border + `--gb-shadow-focus-ring`                                               |
| Dropdown panel         | 210px wide, `--gb-background-surface`, `--gb-radius-scale-md`, `--gb-border-default`, `--gb-shadow-md`, `sideOffset=8`, `align="end"` |
| Dropdown item          | `text-sm-regular`, icon 16px, hover `--gb-background-mute`                                                                            |

`align="end"` keeps the dropdown inside the panel's own right edge. Figma's mock instead left-aligns the menu to the trigger, which pushes it ~138px past the panel's right edge — judged to be a mockup artifact rather than an intentional cross-panel overlay, so the code keeps the dropdown contained.

## Composition with other components

- **`GoalSetting`** (`components/app/goal-setting`): embedded with `showHeader={false} showSaveButton={false} showSelfName={false}` for the "Known for Now/Next" section — `showSelfName` is off here specifically because this panel's own header row above it already shows the self's name (`role`); the Create Self/Edit Goal dialogs that use `GoalSetting` elsewhere leave it on. Without a Save button, `GoalSetting`'s internal `hasSavedGoal` never updates past its `defaultGoal` — goal edits made elsewhere in the app, not inside this panel.
- **`Divider`** (`components/app/goal-setting`): the rule between the header and the goal section.
- **`Button`** (`components/ui/button`, `variant="primary"`): the "Create contents" action only — the "..." trigger and dropdown items are plain `<button>`s (see Structure).

Used by `app/review/assets/page.tsx`.
