# SchedulePanel

- Code: `components/screens/content-studio/ui/SchedulePanel/SchedulePanel.tsx` (`SchedulePanel.module.css`, `SchedulePanel.stories.tsx`, `SchedulePanel.test.tsx`, `index.ts`)
- Figma: [📌 GB_UXUI](https://www.figma.com/design/Wp6AZNGqC4qf2Sz5zQ2PzQ/%F0%9F%93%8C-GB_UXUI--261002-?node-id=8757-7576) `Schedule Panel` node `8127:86849`

## Overview

A 380px-wide card in Content Studio's sidebar that groups `ScheduleSlot` rows by date, with a date-range filter and bulk-action buttons in the header/footer. `type` switches between four distinct panel contents: a normal mixed list (`default`), an AI-generation-in-progress state (`in process`), an empty state (`no content`), and a trash view (`archived`).

Figma also defines four `settings-*` types (`settings-daily`/`settings-weekly`/`settings-monthly`/`settings-custom`), reached by the header's gear button. These are a completely different recurrence-rule form (Repeat tabs + day/month/custom-interval inputs + `Input time`), not another layout of this same panel, so they're implemented separately as `ScheduleSettingsPanel` — `SchedulePanel` only exposes `onOpenSettings` and leaves the actual panel swap to the parent.

## When to use

- The sidebar card listing a date range's scheduled posts in Content Studio.

## How to use

```tsx
{/* controlled: the panel never mutates this list itself */}
<SchedulePanel
  groups={[
    {
      date: "Today, Sep 01",
      slots: [
        { rowId: 1, type: "posted", time: "11:00 AM" },
        { rowId: 2, type: "draft", time: "02:25 PM" },
      ],
    },
  ]}
  onOpenSettings={() => setView("settings")}
  onCreatePosts={handleCreatePosts}
  onScheduleAllDraft={handleScheduleAllDraft}
  onAddSchedule={handleAddSchedule}
  onSlotDelete={(slot) => handleDeleteSlot(slot)}
/>

{/* uncontrolled: clicking "Add Schedule" appends a cadence-based bundle itself */}
<SchedulePanel
  defaultGroups={initialGroups}
  extendDays={3}
  occurrencesPerDay={3}
  startTime="09:00 AM"
  onAddSchedule={trackAddSchedule}
/>

<SchedulePanel type="no content" onCreateBrandFitPost={handleCreatePost} />
<SchedulePanel type="in process" groups={pendingGroups} />
<SchedulePanel type="archived" groups={archivedGroups} onAddSchedule={handleAddSchedule} />
```

## Props

| Prop                                                   | Type                                                      | Default      | Description                                                                                                                                                                                                                                            |
| ------------------------------------------------------ | --------------------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `type`                                                 | `"default" \| "in process" \| "no content" \| "archived"` | `"default"`  | Figma `Type`                                                                                                                                                                                                                                           |
| `status`                                               | `"default" \| "disabled"`                                 | `"default"`  | Figma `Status`. Only changes rendering for `type="default"` — `in process`/`archived` bake their own look into `type`, and `no content` is never disabled                                                                                              |
| `groups`                                               | `SchedulePanelGroup[]`                                    | —            | Date-grouped rows, controlled. When passed, the panel never mutates it — the parent must update it itself (e.g. inside `onCreateMorePost`). Ignored for `type="no content"`                                                                            |
| `defaultGroups`                                        | `SchedulePanelGroup[]`                                    | `[]`         | Initial date-grouped rows, uncontrolled. Ignored when `groups` is passed. Used when the panel should own its own list                                                                                                                                  |
| `extendDays`                                           | `number`                                                  | `3`          | How many new date groups "Add Schedule" appends per click, uncontrolled only                                                                                                                                                                           |
| `occurrencesPerDay`                                    | `number`                                                  | `3`          | How many empty slots each newly-appended day gets                                                                                                                                                                                                      |
| `startTime`                                            | `string`                                                  | `"09:00 AM"` | Anchor time for the first new slot each appended day; later ones spread automatically 6 hours apart                                                                                                                                                    |
| `dateRange` / `defaultDateRange` / `onDateRangeChange` | —                                                         | —            | Forwarded to the header `RangeSelect`. `dateRange`/`defaultDateRange`'s `to` date also anchors where uncontrolled "Add Schedule" extension starts (falls back to the real current date if neither is set)                                              |
| `onOpenSettings`                                       | `() => void`                                              | —            | Gear button click handler. The button itself is hidden for `type="archived"`                                                                                                                                                                           |
| `onCreatePosts`                                        | `() => void`                                              | —            | Header CTA click handler for `type="default"`/`"in process"` ("Create Posts") — the parent typically opens its own generation modal sized to however many `type="no content"` slots currently exist                                                    |
| `onScheduleAllDraft`                                   | `() => void`                                              | —            | "Schedule All Draft" chip click handler, shown next to the "Schedule created" title above the date list (`type="default"`/`"in process"` only, disabled when no row is currently `type="draft"`). Always called regardless of controlled/uncontrolled  |
| `onCreateBrandFitPost`                                 | `() => void`                                              | —            | Header CTA click handler for `type="no content"` ("Create Your Brand-fit Post")                                                                                                                                                                        |
| `onAddSchedule`                                        | `() => void`                                              | —            | Footer button click handler ("Add Schedule"), shown only for `type="default"`/`"archived"`. Always called regardless of controlled/uncontrolled                                                                                                        |
| `selectedRowId`                                        | `string \| number \| null`                                | —            | Which row is highlighted, controlled. Every row — including `type="archive"` — is clickable                                                                                                                                                            |
| `defaultSelectedRowId`                                 | `string \| number \| null`                                | `null`       | Initial highlighted row, uncontrolled                                                                                                                                                                                                                  |
| `onSlotClick`                                          | `(slot: SchedulePanelSlot) => void`                       | —            | Called with the full clicked slot (including `rowId`), regardless of controlled/uncontrolled                                                                                                                                                           |
| `onSlotDelete`                                         | `(slot: SchedulePanelSlot) => void`                       | —            | Called with the full slot when its hover-revealed delete (X) trigger is clicked — `type="no content"`/`"draft"`/`"scheduled"` rows only. Always called regardless of controlled/uncontrolled; when uncontrolled, the panel also removes the row itself |

`SchedulePanelGroup` is `{ date: string; slots: SchedulePanelSlot[] }`, and `SchedulePanelSlot` is `ScheduleSlotProps & { rowId: string | number }` — each slot is spread directly onto a `ScheduleSlot`.

## Structure

- Header: `RangeSelect` (flex-basis overridden to 0 so it shrinks inside the 380px card rather than keeping its own 488px default width) + a 36px gear `Button variant="icon"`, then a full-width `Button variant="primary"` CTA ("Create Posts") below. `type="archived"` skips this whole header block — it only renders a full-width `RangeSelect`, no gear button and no CTA.
- "Schedule created" section title + "Schedule All Draft" `Chips` sit directly above the date-grouped list (hidden for `type="archived"`) — not part of Figma yet, see "Design status" below.
- Body: date groups (semibold date heading + `ScheduleSlot` rows), auto-scrolling when a parent constrains the panel's height. The scroll thumb position reuses the same measure-on-scroll pattern as `DropdownList`/`NotiDropdown`, paired with the shared `Scrollbar` component, `--gb-spacing-2` apart from the scrollable list (`.body`'s own `gap`). `type="no content"` replaces the whole body with a centered "No Post Created" message instead.
- Footer: a full-width `Button variant="outline"` "Add Schedule" with a trailing plus icon, shown only for `type="default"`/`"archived"`.

## States and behaviors

- `status="disabled"` (only meaningful for `type="default"`) grays out the range select, gear button, header CTA, "Schedule All Draft" chip, and footer button — the already-rendered `ScheduleSlot` rows are unaffected, since each row's own look is controlled by its own `status`, independent of the panel.
- `type="in process"` always renders the range select, gear button, "Create Posts" CTA, and "Schedule All Draft" chip in the disabled look, with no footer button — representing content still being generated.
- `type="archived"` always renders its footer "Add Schedule" button in the disabled look (can't add new posts to a past date), while the range select itself stays fully interactive. The "Schedule created" title and chip don't render at all for this type.
- The "Schedule All Draft" chip is also disabled whenever no row across any group is currently `type="draft"`, regardless of `status` — there's nothing to bulk-schedule.
- The scrollbar only appears once the groups list actually overflows its container — there's no manual boolean for it, unlike the Figma mockup's demo-only `scrollBar` toggle.
- Clicking "Add Schedule" always calls `onAddSchedule`. When the panel is uncontrolled (`groups` not passed), it additionally appends `extendDays` new date groups to the end of the list, each with `occurrencesPerDay` empty `type="no content"` slots — times start at `startTime` and spread 6 hours apart per occurrence (e.g. `"09:00 AM"` → `"09:00 AM"`/`"03:00 PM"`/`"09:00 PM"` for 3 occurrences). Repeated clicks keep extending forward from the same anchor date rather than overlapping. When controlled (`groups` passed), the list never changes on its own; the parent must update `groups` to reflect the new posts.
- The extension's date labels (e.g. "Friday, Sep 04") are computed from real calendar dates, anchored to `dateRange`/`defaultDateRange`'s `to` date if provided, or the actual current date otherwise — not parsed from the existing groups' `date` strings, since those are free-form labels.
- Every `ScheduleSlot` row is clickable (`SchedulePanel` always passes `onClick` down), regardless of `type` — `archive` rows included. Clicking always calls `onSlotClick` with the full slot. When uncontrolled (`selectedRowId` not passed), the panel also highlights the clicked row itself (`status="active"`) unless that slot already sets its own `status` explicitly, in which case the explicit value wins. When controlled (`selectedRowId` passed), the panel never changes the highlight on its own — the parent must update `selectedRowId`.
- Clicking the "Schedule All Draft" chip always calls `onScheduleAllDraft`. When uncontrolled (`groups` not passed), it additionally turns every `type="draft"` slot across all groups into `type="scheduled"` itself. When controlled (`groups` passed), the list never changes on its own; the parent must update `groups`.
- Clicking a row's hover-revealed delete (X) trigger always calls `onSlotDelete` with that slot. When uncontrolled, the panel also removes the row itself (and the whole date group if it becomes empty). When controlled, the parent must update `groups`. The trigger only renders for `type="no content"`/`"draft"`/`"scheduled"` and `status !== "disabled"`.

## Design status

- `onCreatePosts` (the header CTA, "Create Posts"), the "Schedule created" title + "Schedule All Draft" chip row, and `onSlotDelete`'s hover-revealed X trigger (on `ScheduleSlot`) are **not yet in Figma** — see `ScheduleSlot`'s doc for the same caveat. Their visuals were designed directly in code against existing tokens/components (`Chips`, a scaled-down `Button variant="icon"` look) and should be treated as provisional until Figma is updated to match.
- The real page (`app/review/content-studio/page.tsx`) splits what used to be a single "create more content" action into two: "Add Schedule" only adds empty time slots, and "Create Posts" opens a generation modal sized to the current total of `type="no content"` slots.
