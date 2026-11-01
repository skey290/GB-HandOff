# ScheduleSettingsPanel

- Code: `components/screens/content-studio/ui/ScheduleSettingsPanel/ScheduleSettingsPanel.tsx` (`ScheduleSettingsPanel.module.css`, `ScheduleSettingsPanel.stories.tsx`, `ScheduleSettingsPanel.test.tsx`, `index.ts`)
- Figma: [📌 GB_UXUI](https://www.figma.com/design/Wp6AZNGqC4qf2Sz5zQ2PzQ/%F0%9F%93%8C-GB_UXUI--261002-?node-id=8757-7576) `Schedule Panel` → `Type=settings-daily`/`settings-weekly`/`settings-monthly`/`settings-custom`, node `8127:87596`

## Overview

A 380px-wide recurrence-rule form in Content Studio's sidebar, reached from `SchedulePanel`'s gear button. `repeatType` switches the Repeat tab between `daily`/`weekly`/`monthly`/`custom`, each adding a different middle section below the tabs, while the header (date range + back button) and the "On Each Day" section stay the same shape across all four.

"On Each Day" holds a **list** of time slots, not a single time — one per tab, kept independently (switching Daily → Weekly doesn't carry over however many times/day Daily had). The occurrence stepper's number is always exactly `currentTimeSlots.length`; stepping, typing a number directly into the stepper's field, or deleting a row all resize that same array, so the digits shown and the actual `InputTime` rows below can never drift out of sync.

## When to use

- The recurrence-settings screen shown when a user taps the gear icon on `SchedulePanel`'s header.

## How to use

```tsx
<ScheduleSettingsPanel
  defaultRepeatType="weekly"
  onBack={() => setView("list")}
  onSave={handleSaveSchedule}
/>
```

## Props

| Prop                                                                        | Type                                                                                             | Default                                           | Description                                                                                                                                                                                 |
| --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `repeatType` / `defaultRepeatType` / `onRepeatTypeChange`                   | `"daily" \| "weekly" \| "monthly" \| "custom"`                                                   | `"daily"` (uncontrolled)                          | Figma `Type`, minus the shared `settings-` prefix. Controls which Repeat tab is active                                                                                                      |
| `dateRange` / `defaultDateRange` / `onDateRangeChange`                      | —                                                                                                | —                                                 | Forwarded to the header `RangeSelect`                                                                                                                                                       |
| `onBack`                                                                    | `() => void`                                                                                     | —                                                 | Back-arrow button click handler, returning to `SchedulePanel`                                                                                                                               |
| `selectedWeekdays` / `defaultSelectedWeekdays` / `onSelectedWeekdaysChange` | `string[]`                                                                                       | `[]`                                              | Weekday ids toggled under "On Every" (`repeatType="weekly"` only)                                                                                                                           |
| `dayOfMonth` / `defaultDayOfMonth` / `onDayOfMonthChange`                   | `string`                                                                                         | `""`                                              | Digits for "Day \_\_ of every month" (`repeatType="monthly"` only)                                                                                                                          |
| `everyCount` / `defaultEveryCount` / `onEveryCountChange`                   | `string`                                                                                         | `""`                                              | Digits for "Every \_\_" (`repeatType="custom"` only)                                                                                                                                        |
| `everyUnit` / `defaultEveryUnit` / `onEveryUnitChange`                      | `string`                                                                                         | `"days"`                                          | Unit select next to `everyCount` (`repeatType="custom"` only)                                                                                                                               |
| `timeSlotsByType` / `defaultTimeSlotsByType` / `onTimeSlotsByTypeChange`    | `ScheduleTimeSlotsByRepeatType` (`Record<RepeatType, { time?: string; period?: TimePeriod }[]>`) | one `{ time: "11:00", period: "AM" }` row per tab | The "On Each Day" time-slot list, keyed by Repeat tab. The occurrence stepper reads/writes `timeSlotsByType[currentRepeatType].length` directly — there's no separate occurrence-count prop |
| `onSave`                                                                    | `() => void`                                                                                     | —                                                 | Save button click handler                                                                                                                                                                   |

All `value`/`defaultValue`/`onChange`-style groups follow the controlled/uncontrolled convention — pass the plain value to drive it externally, or just the `default*` to let the component manage its own state.

## Structure

Same three-way split as `SchedulePanel`: a fixed header, a scrollable middle, and a fixed footer — neither the header nor the Save button ever move as the middle scrolls.

- Header (fixed): `RangeSelect` (flex-basis overridden to 0, same trick as `SchedulePanel`) + a 36px `Button variant="icon"` with a back arrow.
- Scrollable middle (`.scrollColumn`, paired with the shared `Scrollbar` component exactly like `SchedulePanel`'s `.groupsList` — native scrollbar hidden, `--gb-spacing-2` gap between the list and the decorative track):
  - Repeat section: a bold "Repeat" title, a 4-way tab row (Daily/Weekly/Monthly/Custom, each `flex: 1`), and a conditional middle block:
    - `daily`: no middle block.
    - `weekly`: "On Every" + 7 weekday toggle pills (M T W T F S S).
    - `monthly`: "On this date" + "Day `NumberMaskInput` of every month".
    - `custom`: "Every" + `NumberMaskInput` + a `Select variant="primary"` for the unit (Days/Weeks/Months).
  - A 1px divider, then the "On Each Day" section shared by all four types: a stepper (circular minus/plus buttons + `NumberMaskInput` + "time(s) a day"), then one `InputTime` row per slot in the active tab's list (`showDelete` and `shouldFitContainer` on every row). The first row's label is "When would you like to post?"; row 2+ are numbered "When would you like to post? (slot N)".
- Footer (fixed): a full-width `Button variant="primary"` "Save" — a root-level sibling of the scroll area, not inside it, same placement as `SchedulePanel`'s "Add Schedule" footer.

## States and behaviors

- The Repeat tab row and weekday pills are local `<button>`s, not the shared `Button`/`Tabs` components — their selected fill (`--gb-background-mute-subtle`) is a different token than `Button`'s built-in selected look (`--gb-background-mute`), so reusing `Button` would shift the color.
- `NumberMaskInput` is a small shared local field (used by the occurrence stepper, "Day of every month", and "Every") that shows a borderless `_ _` placeholder when empty and accepts digit-only typing, up to 2 digits.
- The weekday pills' selected color is assumed to match the Repeat tabs' selected color — Figma's mockup never shows a selected weekday example to confirm against.
- The Custom unit dropdown's option list (Days/Weeks/Months) isn't shown in Figma (the mockup only shows the closed trigger) — it's a placeholder set of standard recurrence units.
- **Growing the stepper (or typing a bigger number directly) never leaves a new row empty.** `resizeScheduleTimeSlots` (exported alongside the component) fills every new row by carrying the row above it's `time`/`period` forward — or `"11:00"`/`"AM"` for a first row with nothing above it — so a user can step from 1 to 4 occurrences and Save stays usable without having to type into each new row first. Shrinking the stepper (or deleting a row via `InputTime`'s delete button) just truncates the array; it never touches the remaining rows' values.
- Save is disabled while any slot's `time` is empty (a user can still clear a row by hand), or while the active tab's own required field is empty (weekday for Weekly, day-of-month for Monthly, interval count for Custom).
- `resizeScheduleTimeSlots` is also the function Self Goal/Content Goal's posting-frequency stepper calls (via `deriveScheduleFromFrequency` in `components/screens/content-studio/data.ts`) when posting frequency changes outside this panel — so a frequency bump from the Self Goal card and a stepper bump here fill new rows the exact same way.
- **The header and Save button never shift position as content scrolls or the scrollbar appears/disappears.** An earlier version scrolled the whole panel as one block (`overflow-y: auto` on the root), which both moved the back button out of view while scrolling and let the native scrollbar's reserved width nudge the header/Save width whenever it toggled on or off — switching between `SchedulePanel` (no visible native scrollbar at all) and this panel made the gear/back icon visibly jump. Matching `SchedulePanel`'s structure (fixed header, fixed footer, only the middle `.scrollColumn` scrolls, native scrollbar hidden in favor of the shared `Scrollbar` component) fixed both.
