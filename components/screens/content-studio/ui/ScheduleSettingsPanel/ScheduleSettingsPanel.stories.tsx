import type { Meta, StoryObj } from "@storybook/nextjs";
import { expect, fn, userEvent, within } from "storybook/test";

import {
  ScheduleSettingsPanel,
  type ScheduleTimeSlotsByRepeatType,
} from "./ScheduleSettingsPanel";

// Matches app/review/content-studio/page.tsx's DEFAULT_SCHEDULE_TIME_SLOTS_BY_TYPE —
// every Repeat tab starts out with its own copy of the same 3-slot default.
const DEFAULT_TIME_SLOTS = [
  { time: "10:00", period: "AM" as const },
  { time: "02:25", period: "PM" as const },
  { time: "09:00", period: "PM" as const },
];
const DEFAULT_TIME_SLOTS_BY_TYPE: ScheduleTimeSlotsByRepeatType = {
  daily: DEFAULT_TIME_SLOTS,
  weekly: DEFAULT_TIME_SLOTS,
  monthly: DEFAULT_TIME_SLOTS,
  custom: DEFAULT_TIME_SLOTS,
};

const FIGMA_URL =
  "https://www.figma.com/design/Wp6AZNGqC4qf2Sz5zQ2PzQ/%F0%9F%93%8C-GB_UXUI--261002-?node-id=8757-7576";

const meta = {
  title: "ContentStudio/UI/ScheduleSettingsPanel",
  component: ScheduleSettingsPanel,
  tags: ["autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: FIGMA_URL,
    },
  },
  argTypes: {
    repeatType: {
      control: "select",
      options: ["daily", "weekly", "monthly", "custom"],
    },
    selectedWeekdays: { control: false },
  },
  args: {
    // Matches app/review/content-studio/page.tsx's default — Weekly,
    // Tue/Wed/Thu checked, so a new self's schedule is 3x/week out of the box.
    defaultRepeatType: "weekly",
    defaultSelectedWeekdays: ["tue", "wed", "thu"],
    defaultTimeSlotsByType: DEFAULT_TIME_SLOTS_BY_TYPE,
    onRepeatTypeChange: fn(),
    onDateRangeChange: fn(),
    onBack: fn(),
    onSelectedWeekdaysChange: fn(),
    onDayOfMonthChange: fn(),
    onEveryCountChange: fn(),
    onEveryUnitChange: fn(),
    onTimeSlotsByTypeChange: fn(),
    onSave: fn(),
  },
} satisfies Meta<typeof ScheduleSettingsPanel>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole("tab", { name: "Weekly" }));
    expect(args.onRepeatTypeChange).toHaveBeenCalledWith("weekly");

    // The stepper's count drives the time-slot rows below it directly, kept
    // per Repeat tab (Weekly's own list here, independent of Daily's). A
    // newly-added row's time and AM/PM both default to the row above's —
    // stepping up from the 3-slot default adds a 4th row that's already a
    // valid, editable value, not an empty one the user has to fill in first.
    await userEvent.click(
      canvas.getByRole("button", { name: "Increase occurrences per day" }),
    );
    expect(args.onTimeSlotsByTypeChange).toHaveBeenLastCalledWith(
      expect.objectContaining({
        weekly: [
          { time: "10:00", period: "AM" },
          { time: "02:25", period: "PM" },
          { time: "09:00", period: "PM" },
          { time: "09:00", period: "PM" },
        ],
      }),
    );
    expect(
      canvas.getByLabelText("When would you like to post? (slot 4)"),
    ).toBeInTheDocument();

    // The new row's time is still just the "11:00" placeholder — Save stays
    // disabled until the user types a real value into it.
    expect(canvas.getByRole("button", { name: "Save" })).toBeDisabled();

    await userEvent.click(
      canvas.getByRole("button", { name: "Decrease occurrences per day" }),
    );
    expect(
      canvas.queryByLabelText("When would you like to post? (slot 4)"),
    ).not.toBeInTheDocument();

    // Weekly starts with Tue/Wed/Thu pre-checked (the app's default 3x/week
    // cadence), so Save is already enabled — no weekday pick needed first.
    expect(canvas.getByRole("button", { name: "Save" })).toBeEnabled();

    await userEvent.click(canvas.getByRole("button", { name: "Save" }));
    expect(args.onSave).toHaveBeenCalledTimes(1);

    await userEvent.click(
      canvas.getByRole("button", { name: "Back to schedule panel" }),
    );
    expect(args.onBack).toHaveBeenCalledTimes(1);
  },
};
