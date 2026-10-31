import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import type { Meta, StoryObj } from "@storybook/nextjs";
import { expect, fn, userEvent, within } from "storybook/test";

import {
  ScheduleSettingsPanel,
  type ScheduleSettingsPanelRepeatType,
  type ScheduleTimeSlotValue,
  type ScheduleTimeSlotsByRepeatType,
} from "@/components/screens/content-studio/ui/ScheduleSettingsPanel";
import {
  PostingModal,
  IMAGE_STYLE_OPTIONS,
} from "@/components/screens/content-studio/ui/PostingModal";

import {
  SchedulePanel,
  type SchedulePanelGroup,
  type SchedulePanelProps,
  type SchedulePanelSlot,
} from "./SchedulePanel";

const FIGMA_URL =
  "https://www.figma.com/design/Wp6AZNGqC4qf2Sz5zQ2PzQ/%F0%9F%93%8C-GB_UXUI--261002-?node-id=8127-86849";

const meta = {
  title: "ContentStudio/UI/SchedulePanel",
  component: SchedulePanel,
  tags: ["autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: FIGMA_URL,
    },
  },
  argTypes: {
    type: {
      control: "select",
      options: ["default", "in process", "no content", "archived"],
    },
    status: {
      control: "radio",
      options: ["default", "disabled"],
    },
    groups: { control: false },
    defaultGroups: { control: false },
    extendDays: { control: "number" },
    occurrencesPerDay: { control: "number" },
    startTime: { control: "text" },
    defaultSelectedRowId: { control: false },
  },
  args: {
    type: "default",
    status: "default",
    extendDays: 3,
    occurrencesPerDay: 3,
    startTime: "09:00 AM",
    onDateRangeChange: fn(),
    onOpenSettings: fn(),
    onCreatePosts: fn(),
    onScheduleAllDraft: fn(),
    onCreateBrandFitPost: fn(),
    onAddSchedule: fn(),
    onSlotClick: fn(),
    onSlotDelete: fn(),
  },
} satisfies Meta<typeof SchedulePanel>;

export default meta;

type Story = StoryObj<typeof meta>;

// Matches app/review/content-studio/page.tsx's DEFAULT_SCHEDULE_TIME_SLOTS —
// the ScheduleSettingsPanel default before the user has ever saved it.
const DEFAULT_SCHEDULE_TIME_SLOTS: ScheduleTimeSlotValue[] = [
  { time: "10:00", period: "AM" },
  { time: "02:25", period: "PM" },
  { time: "09:00", period: "PM" },
];

const DEFAULT_SCHEDULE_TIME_SLOTS_BY_TYPE: ScheduleTimeSlotsByRepeatType = {
  daily: DEFAULT_SCHEDULE_TIME_SLOTS,
  weekly: DEFAULT_SCHEDULE_TIME_SLOTS,
  monthly: DEFAULT_SCHEDULE_TIME_SLOTS,
  custom: DEFAULT_SCHEDULE_TIME_SLOTS,
};

function formatTimeSlots(slots: ScheduleTimeSlotValue[]): string[] {
  return slots
    .filter((slot) => slot.period)
    .map((slot) => `${slot.time || "11:00"} ${slot.period}`);
}

/** One flat row — mirrors the real page's `ScheduleSlot` (GB-Review repo's components/review/content-studio/data.ts),
 * just with `type` inlined instead of looked up from a separate `Post`. */
interface DemoSlot {
  id: number;
  dayLabel: string;
  date: string;
  time: string;
  type: SchedulePanelSlot["type"];
}

const DEFAULT_SLOTS: DemoSlot[] = [
  {
    id: 1,
    dayLabel: "Today",
    date: "Sep 01",
    time: "11:00 AM",
    type: "posted",
  },
  {
    id: 2,
    dayLabel: "Today",
    date: "Sep 01",
    time: "02:25 PM",
    type: "posted",
  },
  {
    id: 3,
    dayLabel: "Today",
    date: "Sep 01",
    time: "10:00 PM",
    type: "posted",
  },
  {
    id: 4,
    dayLabel: "Tomorrow",
    date: "Sep 02",
    time: "11:00 AM",
    type: "draft",
  },
  {
    id: 5,
    dayLabel: "Tomorrow",
    date: "Sep 02",
    time: "02:25 PM",
    type: "scheduled",
  },
  {
    id: 6,
    dayLabel: "Thursday",
    date: "Sep 03",
    time: "11:00 AM",
    type: "draft",
  },
  {
    id: 7,
    dayLabel: "Thursday",
    date: "Sep 03",
    time: "02:25 PM",
    type: "draft",
  },
  {
    id: 8,
    dayLabel: "Thursday",
    date: "Sep 03",
    time: "10:00 PM",
    type: "draft",
  },
];

// The "Add Schedule" date math below is a demo-local re-implementation of
// GB-Review repo's components/review/content-studio/data.ts's createNextDaySlots/
// createNextWeekSlots/createNextMonthSlot/createCustomIntervalSlot, kept
// local since components/screens/content-studio/ui/* (generic UI) shouldn't import
// from the GB-Review repo's components/review/* (app-specific).
const WEEKDAY_IDS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

function parseSlotDate(date: string): Date {
  return new Date(`${date}, 2026`);
}

function formatSlotDate(date: Date): string {
  const month = date.toLocaleDateString("en-US", { month: "short" });
  const day = String(date.getDate()).padStart(2, "0");
  return `${month} ${day}`;
}

function buildDaySlots(
  date: Date,
  nextId: number,
  times: string[],
): Omit<DemoSlot, "type">[] {
  const dayLabel = date.toLocaleDateString("en-US", { weekday: "long" });
  const formattedDate = formatSlotDate(date);
  return times.map((time, index) => ({
    id: nextId + index,
    dayLabel,
    date: formattedDate,
    time,
  }));
}

function startOfWeek(date: Date): Date {
  const result = new Date(date);
  const diff = (result.getDay() + 6) % 7; // Mon=0 ... Sun=6
  result.setDate(result.getDate() - diff);
  return result;
}

function createNextDaySlots(lastDate: Date, nextId: number, times: string[]) {
  const next = new Date(lastDate);
  next.setDate(next.getDate() + 1);
  return buildDaySlots(next, nextId, times);
}

function createNextWeekSlots(
  lastDate: Date,
  weekdayIds: string[],
  nextId: number,
  times: string[],
) {
  const nextWeekStart = startOfWeek(lastDate);
  nextWeekStart.setDate(nextWeekStart.getDate() + 7);
  const offsets = weekdayIds
    .map((id) => WEEKDAY_IDS.indexOf(id))
    .filter((offset) => offset >= 0)
    .sort((a, b) => a - b);

  let runningId = nextId;
  return offsets.flatMap((offset) => {
    const date = new Date(nextWeekStart);
    date.setDate(date.getDate() + offset);
    const created = buildDaySlots(date, runningId, times);
    runningId += created.length;
    return created;
  });
}

function createNextMonthSlot(
  lastDate: Date,
  dayOfMonth: string,
  nextId: number,
  times: string[],
) {
  const day = Math.min(Math.max(Number(dayOfMonth) || 1, 1), 28);
  let candidate = new Date(lastDate.getFullYear(), lastDate.getMonth(), day);
  if (candidate <= lastDate) {
    candidate = new Date(lastDate.getFullYear(), lastDate.getMonth() + 1, day);
  }
  return buildDaySlots(candidate, nextId, times);
}

function createCustomIntervalSlot(
  lastDate: Date,
  everyCount: string,
  everyUnit: string,
  nextId: number,
  times: string[],
) {
  const count = Math.max(Number(everyCount) || 1, 1);
  const next = new Date(lastDate);
  if (everyUnit === "weeks") {
    next.setDate(next.getDate() + count * 7);
  } else if (everyUnit === "months") {
    next.setMonth(next.getMonth() + count);
  } else {
    next.setDate(next.getDate() + count);
  }
  return buildDaySlots(next, nextId, times);
}

/**
 * 실제 페이지(app/review/content-studio/page.tsx)의 SchedulePanel 조합을
 * 한 캔버스에 전부 모은 데모 — 설정 패널 전환(Repeat 탭에 따라 Add Schedule의
 * 간격이 달라지는 것까지), Schedule All Draft, 행 삭제, Create Posts →
 * PostingModal까지 전부 이 안에서 확인한다. Controls의 Type/Status는 그대로
 * 내부 SchedulePanel에 전달된다.
 */
function PlaygroundDemo(args: SchedulePanelProps) {
  const [view, setView] = React.useState<"list" | "settings">("list");
  const [slots, setSlots] = React.useState<DemoSlot[]>(DEFAULT_SLOTS);
  const [timeSlotsByType, setTimeSlotsByType] =
    React.useState<ScheduleTimeSlotsByRepeatType>(
      DEFAULT_SCHEDULE_TIME_SLOTS_BY_TYPE,
    );
  const draftTimeSlotsByTypeRef = React.useRef(timeSlotsByType);
  // Matches app/review/content-studio/page.tsx's default — Weekly,
  // Tue/Wed/Thu checked (3x/week out of the box).
  const [repeatType, setRepeatType] =
    React.useState<ScheduleSettingsPanelRepeatType>("weekly");
  const draftRepeatTypeRef = React.useRef(repeatType);
  const [selectedWeekdays, setSelectedWeekdays] = React.useState<string[]>([
    "tue",
    "wed",
    "thu",
  ]);
  const draftSelectedWeekdaysRef = React.useRef(selectedWeekdays);
  const [dayOfMonth, setDayOfMonth] = React.useState("");
  const draftDayOfMonthRef = React.useRef(dayOfMonth);
  const [everyCount, setEveryCount] = React.useState("");
  const draftEveryCountRef = React.useRef(everyCount);
  const [everyUnit, setEveryUnit] = React.useState("days");
  const draftEveryUnitRef = React.useRef(everyUnit);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [generatePostCount, setGeneratePostCount] = React.useState(1);

  const groups = React.useMemo<SchedulePanelGroup[]>(() => {
    const order: string[] = [];
    const byKey = new Map<string, SchedulePanelGroup>();
    for (const slot of slots) {
      const key = `${slot.dayLabel}|${slot.date}`;
      const panelSlot: SchedulePanelSlot = {
        rowId: slot.id,
        type: slot.type,
        time: slot.time,
      };
      const group = byKey.get(key);
      if (group) {
        group.slots.push(panelSlot);
      } else {
        order.push(key);
        byKey.set(key, {
          date: `${slot.dayLabel}, ${slot.date}`,
          slots: [panelSlot],
        });
      }
    }
    return order.map((key) => byKey.get(key)!);
  }, [slots]);

  const computeNextScheduleSlots = () => {
    const times = formatTimeSlots(timeSlotsByType[repeatType]);
    const lastDate = parseSlotDate(slots[slots.length - 1]!.date);
    const nextId = Math.max(...slots.map((slot) => slot.id)) + 1;
    return repeatType === "weekly"
      ? createNextWeekSlots(lastDate, selectedWeekdays, nextId, times)
      : repeatType === "monthly"
        ? createNextMonthSlot(lastDate, dayOfMonth, nextId, times)
        : repeatType === "custom"
          ? createCustomIntervalSlot(
              lastDate,
              everyCount,
              everyUnit,
              nextId,
              times,
            )
          : createNextDaySlots(lastDate, nextId, times);
  };

  const handleAddSchedule = () => {
    const added = computeNextScheduleSlots();
    setSlots((prev) => [
      ...prev,
      ...added.map((slot) => ({ ...slot, type: "no content" as const })),
    ]);
    args.onAddSchedule?.();
  };

  const handleScheduleAllDraft = () => {
    setSlots((prev) =>
      prev.map((slot) =>
        slot.type === "draft" ? { ...slot, type: "scheduled" } : slot,
      ),
    );
    args.onScheduleAllDraft?.();
  };

  const handleSlotDelete = (slot: SchedulePanelSlot) => {
    setSlots((prev) => prev.filter((s) => s.id !== slot.rowId));
    args.onSlotDelete?.(slot);
  };

  if (view === "settings") {
    return (
      <ScheduleSettingsPanel
        className="h-[600px]"
        defaultRepeatType={repeatType}
        onRepeatTypeChange={(type) => {
          draftRepeatTypeRef.current = type;
        }}
        defaultSelectedWeekdays={selectedWeekdays}
        onSelectedWeekdaysChange={(ids) => {
          draftSelectedWeekdaysRef.current = ids;
        }}
        defaultDayOfMonth={dayOfMonth}
        onDayOfMonthChange={(value) => {
          draftDayOfMonthRef.current = value;
        }}
        defaultEveryCount={everyCount}
        onEveryCountChange={(value) => {
          draftEveryCountRef.current = value;
        }}
        defaultEveryUnit={everyUnit}
        onEveryUnitChange={(value) => {
          draftEveryUnitRef.current = value;
        }}
        defaultTimeSlotsByType={timeSlotsByType}
        onTimeSlotsByTypeChange={(slotsByType) => {
          draftTimeSlotsByTypeRef.current = slotsByType;
        }}
        onBack={() => setView("list")}
        onSave={() => {
          setTimeSlotsByType(draftTimeSlotsByTypeRef.current);
          setRepeatType(draftRepeatTypeRef.current);
          setSelectedWeekdays(draftSelectedWeekdaysRef.current);
          setDayOfMonth(draftDayOfMonthRef.current);
          setEveryCount(draftEveryCountRef.current);
          setEveryUnit(draftEveryUnitRef.current);
          setView("list");
        }}
      />
    );
  }

  return (
    <>
      <SchedulePanel
        {...args}
        className="h-[600px]"
        groups={groups}
        onOpenSettings={() => {
          draftTimeSlotsByTypeRef.current = timeSlotsByType;
          draftRepeatTypeRef.current = repeatType;
          draftSelectedWeekdaysRef.current = selectedWeekdays;
          draftDayOfMonthRef.current = dayOfMonth;
          draftEveryCountRef.current = everyCount;
          draftEveryUnitRef.current = everyUnit;
          setView("settings");
          args.onOpenSettings?.();
        }}
        onAddSchedule={handleAddSchedule}
        onScheduleAllDraft={handleScheduleAllDraft}
        onSlotDelete={handleSlotDelete}
        onCreatePosts={() => {
          const emptyCount = slots.filter(
            (slot) => slot.type === "no content",
          ).length;
          // No "no content" slots to fill — add the next schedule (per the
          // schedule settings) first, then open the modal targeting those
          // freshly-added slots.
          if (emptyCount === 0) {
            const added = computeNextScheduleSlots();
            setSlots((prev) => [
              ...prev,
              ...added.map((slot) => ({
                ...slot,
                type: "no content" as const,
              })),
            ]);
            setGeneratePostCount(added.length);
            setIsGenerating(true);
            args.onCreatePosts?.();
            return;
          }
          setGeneratePostCount(emptyCount);
          setIsGenerating(true);
          args.onCreatePosts?.();
        }}
      />
      <DialogPrimitive.Root open={isGenerating} onOpenChange={setIsGenerating}>
        <DialogPrimitive.Portal>
          <div className="dark">
            <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-[var(--gb-background-backdrop)] backdrop-blur-md" />
            <DialogPrimitive.Content className="fixed top-1/2 left-1/2 z-50 -translate-x-1/2 -translate-y-1/2">
              <PostingModal
                colorScheme="light"
                style="empty"
                platforms={["linkedin"]}
                postCount={generatePostCount}
                postTypeIndex={0}
                defaultSelectedImageStyleId={IMAGE_STYLE_OPTIONS[0]!.id}
                onAutoGenerate={() => {
                  // Mirrors the real page: generated posts fill the existing
                  // "no content" slots in place rather than creating new ones.
                  let remaining = generatePostCount;
                  setSlots((prev) =>
                    prev.map((slot) => {
                      if (remaining > 0 && slot.type === "no content") {
                        remaining -= 1;
                        return { ...slot, type: "draft" };
                      }
                      return slot;
                    }),
                  );
                  setIsGenerating(false);
                }}
                onClose={() => setIsGenerating(false)}
              />
            </DialogPrimitive.Content>
          </div>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    </>
  );
}

export const Playground: Story = {
  render: (args) => <PlaygroundDemo {...args} />,
  parameters: {
    docs: {
      description: {
        story:
          "캔버스는 SchedulePanel 자체 + 설정 패널 전환(Repeat 탭별 Add Schedule 간격 포함) + PostingModal 생성 플로우를 한데 모은 데모 전용이다. 실사용 코드는 app/review/content-studio/page.tsx 참고.",
      },
      source: {
        code: `const computeNextScheduleSlots = () => {
  const times = formatScheduleTimeSlots(
    scheduleTimeSlotsByType[scheduleRepeatType],
  );
  const nextIndex = slots.length + 1;
  return scheduleRepeatType === "weekly"
    ? createNextWeekSlots(slots, scheduleSelectedWeekdays, nextIndex, times)
    : scheduleRepeatType === "monthly"
      ? createNextMonthSlot(slots, scheduleDayOfMonth, nextIndex, times)
      : scheduleRepeatType === "custom"
        ? createCustomIntervalSlot(
            slots,
            scheduleEveryCount,
            scheduleEveryUnit,
            nextIndex,
            times,
          )
        : createNextDaySlots(slots, nextIndex, times);
};

const handleAddSchedule = () => {
  const added = computeNextScheduleSlots();
  setSlots((prev) => [
    ...prev,
    ...added.map((slot) => ({ ...slot, postId: null })),
  ]);
};

const handleCreatePosts = () => {
  const emptyCount = slots.filter((slot) => slot.postId === null).length;
  // No "no content" slots to fill — add the next schedule (per the schedule
  // settings) first, then open the modal targeting those freshly-added slots.
  if (emptyCount === 0) {
    const added = computeNextScheduleSlots();
    setSlots((prev) => [
      ...prev,
      ...added.map((slot) => ({ ...slot, postId: null })),
    ]);
    requestGeneration({ defaultCount: added.length });
    return;
  }
  requestGeneration({ defaultCount: emptyCount });
};

<SchedulePanel
  groups={scheduleGroups}
  onScheduleAllDraft={handleScheduleAllDraft}
  onCreatePosts={handleCreatePosts}
  onAddSchedule={handleAddSchedule}
  onSlotDelete={(slot) => handleRequestDeleteSlot(slot)}
  onOpenSettings={() => setScheduleView("settings")}
  ...
/>
<PostingModalDialog
  open={generationTarget !== null && missingProfileItems.length === 0}
  onOpenChange={(open) => !open && setGenerationTarget(null)}
  postCount={postingCount}
  onAutoGenerate={() => handleGenerate(postingCount)}
  ...
/>`,
      },
    },
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    // Settings round-trip.
    await userEvent.click(
      canvas.getByRole("button", { name: "Open schedule settings" }),
    );
    expect(args.onOpenSettings).toHaveBeenCalledTimes(1);

    // InputTime is a digit-by-digit HH:MM mask — it doesn't accept typing
    // over an already-filled value, so the existing digits are erased with
    // Backspace first (see components/ui/input-time/input-time.tsx).
    const timeInput = canvas.getByLabelText("When would you like to post?");
    await userEvent.click(timeInput);
    await userEvent.keyboard("{Backspace}{Backspace}{Backspace}{Backspace}");
    await userEvent.type(timeInput, "0630");
    // Scoped to this row, since the default schedule has 3 time slots (each
    // with its own AM/PM radio pair).
    const firstRow = timeInput.closest('[class*="input-time_root"]')!;
    await userEvent.click(
      within(firstRow as HTMLElement).getByRole("radio", { name: "PM" }),
    );
    await userEvent.click(canvas.getByRole("button", { name: "Save" }));

    // Add Schedule uses the time just saved — repeat type is "weekly" with
    // Tue/Wed/Thu checked (the default), so it adds 3 new day groups (next
    // week's Tue/Wed/Thu), each carrying the edited 06:30 PM slot.
    await userEvent.click(canvas.getByRole("button", { name: "Add Schedule" }));
    expect(args.onAddSchedule).toHaveBeenCalledTimes(1);
    expect(canvas.getAllByText("06:30 PM")).toHaveLength(3);

    // Schedule All Draft chip turns every draft row into scheduled.
    await userEvent.click(
      canvas.getByRole("button", { name: "Schedule All Draft" }),
    );
    expect(args.onScheduleAllDraft).toHaveBeenCalledTimes(1);
    expect(canvas.queryByText("Draft")).not.toBeInTheDocument();

    // Hover-delete removes a row.
    await userEvent.click(
      canvas.getAllByRole("button", { name: "Delete schedule slot" })[0]!,
    );
    expect(args.onSlotDelete).toHaveBeenCalledTimes(1);

    // Create Posts opens the generation modal.
    await userEvent.click(canvas.getByRole("button", { name: "Create Posts" }));
    expect(args.onCreatePosts).toHaveBeenCalledTimes(1);

    const body = within(canvasElement.ownerDocument.body);
    await expect(
      body.getByRole("button", { name: "Auto-generate" }),
    ).toBeInTheDocument();
    await userEvent.click(body.getByRole("button", { name: "Auto-generate" }));
    // Generated posts fill the existing "no content" slots in place.
    expect(canvas.queryByText("No content")).not.toBeInTheDocument();
  },
};
