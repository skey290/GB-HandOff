# GoalSetting

- Code: `components/app/goal-setting/goal-setting.tsx` (`goal-setting.stories.tsx`, `goal-setting.test.tsx`, `index.ts`)
- Figma: [📌 GB_UXUI](https://www.figma.com/design/Wp6AZNGqC4qf2Sz5zQ2PzQ/%F0%9F%93%8C-GB_UXUI--261002-?node-id=8234-99895) `Goal setting` node `8234:99895` (`Type=empty` `8127:91766`, `Type=default` `8127:91771`)
- Each statement section is Figma's `Part/Goal` component (showcase node [`8490:94637`](https://www.figma.com/design/Wp6AZNGqC4qf2Sz5zQ2PzQ/%F0%9F%93%8C-GB_UXUI--261002-?node-id=8490-94637)), whose own `Type` property (`editable` `8490:94638` / `default` `8769:15805`) drives this component's `type` prop below — not to be confused with the card-level `Type=empty`/`Type=default` above.

## Overview

The "My goal" card shared by the Self app's "Create Self" + "Edit Goal" and Content Studio's "My goal". It has three sections, all always open for editing (no read/edit toggle):

- **Self Name** (`showSelfName`, default shown) — a single-line `Input`, above Known for Now. Hidden only where the self's name is already shown elsewhere right above this (`AssetPanel` passes `showSelfName={false}` — its own title already is the name; Content Studio's `GoalEditDialog` usage does the same — `ProfileCard` above it already shows the active self's name/avatar).
- **Known for Now** — a single statement `Textarea`.
- **Known for Next** — a statement `Textarea` plus, once it has a value, a settings sentence ("I post `{frequency}`, aiming for `{followers}` followers, within `{timeframe}`.") whose three values are editable through inline chip panels, plus a collapsible "Gabrielle suggests N actions" accordion listing suggested actions with a `Run` button, shown only when actions are provided. The Gabrielle accordion exists only on Known for Next — Known for Now has no accordion.

A single `Save` button at the bottom of the card commits the whole card — disabled until Self Name (when `showSelfName`), Known for Now, and Known for Next are all non-empty.

This component always renders in the dark theme (the root carries a `dark` class) — the Figma frame itself is bound to dark-theme token values, regardless of where `GoalSetting` is embedded (`GoalEditDialog`, `AssetPanel`, etc.).

`type="default"` (used by `AssetPanel`) swaps both statements from `Textarea` to plain read-only text and disables the settings chips — the box styling (border/background/radius/padding/font) is identical to `editable`, only interactivity changes. The Gabrielle accordion is unaffected; editing still happens, just elsewhere (`AssetPanel`'s own "Edit Goal" action opens a separate `GoalEditDialog` with `type="editable"`).

## When to use

- In Know Thyself's "Edit Goal" modal and Content Studio's "My goal" modal — same `GoalEditDialog` wrapper, same shared goal data. They differ only in `showSelfName`: Know Thyself's Edit Goal leaves it on (no self-identity shown elsewhere in that dialog), Content Studio passes `showSelfName={false}` since its `ProfileCard` already shows the active self's name/avatar above the trigger.

## How to use

```tsx
<GoalSetting
  defaultSelfName="Entrepreneur"
  defaultNow="I'm known for financial modeling and data analysis in early-stage startups."
  defaultGoal="I'm known for Finance-Fluent Modeling Partner for early-stage SaaS founders."
  defaultPostingCount={3}
  defaultPostingFrequency="Day"
  defaultTargetedFollowersIndex={1}
  defaultTimeframe="1 year"
  goalActions={[
    {
      id: "a2",
      category: "Self",
      label: "Create a pitch deck in Self",
      onRun: runDeck,
    },
  ]}
  onClose={close}
  onSave={persist}
/>

// AssetPanel's embedded read-only view — the self's name is already the big
// title right above this card, so the section is suppressed entirely.
<GoalSetting
  showHeader={false}
  showSaveButton={false}
  type="default"
  showSelfName={false}
  now={self.knownForNow}
  goal={self.knownForNext}
  isEmbedded
/>
```

## Props

Controlled/uncontrolled pairs are listed as `value` / `defaultValue`. Passing nothing is uncontrolled; passing only `defaultX` sets the initial uncontrolled value; passing `x` makes it fully controlled.

| Prop                                                       | Type                                                | Default      | Description                                                                                                                                                                          |
| ---------------------------------------------------------- | --------------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `showSelfName`                                             | `boolean`                                           | `true`       | Shows the Self Name section above Known for Now. `false` where the self's name is already shown elsewhere right above this (`AssetPanel`, Content Studio's `GoalEditDialog`)         |
| `selfName` / `defaultSelfName`                             | `string`                                            | `""`         | Self Name value. Shown as read-only text under `type="default"`, an `Input` under `"editable"`                                                                                       |
| `onSelfNameChange`                                         | `(value: string) => void`                           | —            | Called immediately on every keystroke in the Self Name input                                                                                                                         |
| `now` / `defaultNow`                                       | `string`                                            | `""`         | "Known for Now" statement. Empty shows the Textarea's placeholder guidance sentence                                                                                                  |
| `onNowChange`                                              | `(value: string) => void`                           | —            | Called immediately on every keystroke in the Now textarea                                                                                                                            |
| `goal` / `defaultGoal`                                     | `string`                                            | `""`         | "Known for Next" statement                                                                                                                                                           |
| `onGoalChange`                                             | `(value: string) => void`                           | —            | Called immediately on every keystroke in the Next textarea                                                                                                                           |
| `goalActions`                                              | `GoalSettingAction[]`                               | `[]`         | Suggested actions for Goal's Gabrielle accordion                                                                                                                                     |
| `postingCount` / `defaultPostingCount`                     | `number`                                            | `3`          | Posting Frequency stepper value                                                                                                                                                      |
| `postingFrequency` / `defaultPostingFrequency`             | `"Day" \| "Week" \| "Month"`                        | `"Day"`      | Posting Frequency toggle                                                                                                                                                             |
| `targetedFollowersIndex` / `defaultTargetedFollowersIndex` | `number` (0–5)                                      | `1`          | Index into `TARGETED_FOLLOWERS_LABELS`                                                                                                                                               |
| `timeframe` / `defaultTimeframe`                           | `"1 month" \| "3 months" \| "6 months" \| "1 year"` | `"1 year"`   |                                                                                                                                                                                      |
| `onClose`                                                  | `() => void`                                        | —            | Card's close (X) button, only rendered when `showHeader` is true                                                                                                                     |
| `showHeader`                                               | `boolean`                                           | `true`       | Shows the "My goal" title + close button row. `false` to embed headerless                                                                                                            |
| `type`                                                     | `"editable" \| "default"`                           | `"editable"` | `"default"` renders Now/Next as read-only text (no `Textarea`) and disables the settings chips — used by `AssetPanel`, where editing only happens through its own "Edit Goal" dialog |
| `onSave`                                                   | `() => void`                                        | —            | Card's single bottom Save button                                                                                                                                                     |

`GoalSettingAction`: `{ id: string; category: string; label: string; onRun?: () => void }`. `category` is the text shown in the leading Badge (e.g. `"Self"`, `"Content Studio"`).

## Structure

- No read/edit toggle, no pencil button, no draft buffering. Both statement `Textarea`s are always mounted; `onNowChange`/`onGoalChange` fire on every keystroke (controlled/uncontrolled). There is one `Save` button for the whole card (`Button variant="primary"`, full width) — it only calls `onSave`, it does not hold back any value.
- The settings sentence (`I post {chip}, aiming for {chip} followers, within {chip}.`) only renders once `goal` is non-empty — matches Figma, which has no divider/sentence at all in the empty-goal mockup. Its three chips are always `Chips variant="outline"`. The chip matching whichever settings panel is currently open (`frequency`/`followers`/`timeframe`) gets `selected`; the other two stay unselected.
- Clicking a settings chip opens the matching inline panel (`Posting Frequency` stepper + Day/Week/Month toggle, `Targeted Followers` `Slider`, or `Timeframe` toggle list) below the sentence, dashed-border/`radius-3xl`/`shadow-lg`. Clicking the same chip again closes it; clicking a different chip switches panels. Panel edits call `onPostingCountChange`/`onPostingFrequencyChange`/`onTargetedFollowersIndexChange`/`onTimeframeChange` immediately — there is no separate commit step for them either, `openPanel` is purely which panel is currently expanded.
- `Button`, `Badge`, `Chips`, `Slider`, `Textarea`, and `Input` (Self Name) are reused unmodified — no new CSS or new general-purpose components were added. The Gabrielle accordion header has no badge, just the sparkles icon, label, and chevron. `Badge variant="outline"` is the action row's category badge; the `Run` button is `Button variant="outline"`; the Posting-Frequency-toggle and Timeframe-toggle buttons are both `Button variant="mute"` (solid `background-subtler` fill, no border — `isSelected` turns it `background-mute` + `opacity-90`); `Save` is `Button variant="primary"`.
- Inside the `Posting Frequency` panel, the stepper (−/count/+/"time(s)") and the Day/Week/Month toggle row are two separate stacked rows (`gap-3`), not one row — the stepper sits left-aligned at its own content width, the toggle row spans the panel's full width.
- Targeted Followers' bottom scale labels use the same percent-of-thumb-range formula as the `Slider` thumb rather than Figma's static evenly-spaced layout — a working slider's labels should track the thumb's value range. Flag if literal Figma spacing is preferred instead.
- The "Gabrielle suggests N actions" accordion renders at most 3 action rows plus a "+ N more" line when there are more; it sits below Known for Next's Textarea and settings sentence/panel. Known for Now has no accordion.

## States and behaviors

- `now`/`goal` empty render the Textarea's native `placeholder` (muted text color comes from `Textarea`'s own styling, not manual conditional coloring). This only applies to `type="editable"` — `type="default"` has no placeholder state, it just renders whatever string it's given (possibly empty).
- Self Name is gated purely by `showSelfName`, independent of `type` — it renders editable under `"editable"` and read-only under `"default"`, same split as Now/Next, just hidden entirely when `showSelfName={false}`. The component itself holds no opinion on where that name is persisted; the Self app stores it directly on the self (same place as its `image`) rather than in the per-self Goal override that backs Now/Next/the settings sentence, since the name is also shown on the canvas node and the "for" dropdown, not just inside this card.
- Both sections are always editable simultaneously under `type="editable"` — there is no mutual-exclusion between Now and Next, and no unsaved-draft discard behavior.
- `goalActions`, `postingCount`, `postingFrequency`, `targetedFollowersIndex`, and `timeframe` all support the controlled/uncontrolled pair, so the component works immediately in Storybook Controls or a minimally wired consumer.
