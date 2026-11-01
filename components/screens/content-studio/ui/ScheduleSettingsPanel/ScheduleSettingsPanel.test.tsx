import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ScheduleSettingsPanel } from "./ScheduleSettingsPanel";

describe("ScheduleSettingsPanel", () => {
  it("defaults to the Daily tab with no secondary recurrence field", () => {
    render(<ScheduleSettingsPanel />);

    expect(screen.getByRole("tab", { name: "Daily" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(screen.queryByText("On Every")).not.toBeInTheDocument();
    expect(screen.queryByText("On this date")).not.toBeInTheDocument();
    expect(screen.queryByText("Every")).not.toBeInTheDocument();
  });

  it("renders the shared On Each Day section and Save button", () => {
    render(<ScheduleSettingsPanel />);

    expect(screen.getByText("On Each Day")).toBeInTheDocument();
    expect(
      screen.getByText("How often would you like to post?"),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText("When would you like to post?"),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
  });

  it("switches tabs and shows the Weekly weekday picker", async () => {
    const user = userEvent.setup();
    render(<ScheduleSettingsPanel />);

    await user.click(screen.getByRole("tab", { name: "Weekly" }));

    expect(screen.getByText("On Every")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "mon" })).toBeInTheDocument();
  });

  it("toggles a weekday pill's selected state", async () => {
    const user = userEvent.setup();
    const onSelectedWeekdaysChange = vi.fn();
    render(
      <ScheduleSettingsPanel
        defaultRepeatType="weekly"
        onSelectedWeekdaysChange={onSelectedWeekdaysChange}
      />,
    );

    const monday = screen.getByRole("button", { name: "mon" });
    expect(monday).toHaveAttribute("aria-pressed", "false");

    await user.click(monday);

    expect(monday).toHaveAttribute("aria-pressed", "true");
    expect(onSelectedWeekdaysChange).toHaveBeenCalledWith(["mon"]);
  });

  it("shows the Monthly day-of-month field", async () => {
    const user = userEvent.setup();
    render(<ScheduleSettingsPanel />);

    await user.click(screen.getByRole("tab", { name: "Monthly" }));

    expect(screen.getByText("On this date")).toBeInTheDocument();
    expect(screen.getByLabelText("Day of every month")).toBeInTheDocument();
  });

  it("shows the Custom interval count and unit select", async () => {
    const user = userEvent.setup();
    render(<ScheduleSettingsPanel />);

    await user.click(screen.getByRole("tab", { name: "Custom" }));

    expect(screen.getByLabelText("Repeat interval")).toBeInTheDocument();
    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });

  it("increments and decrements the occurrences-per-day stepper", async () => {
    const user = userEvent.setup();
    const onTimeSlotsByTypeChange = vi.fn();
    render(
      <ScheduleSettingsPanel
        onTimeSlotsByTypeChange={onTimeSlotsByTypeChange}
      />,
    );

    await user.click(
      screen.getByRole("button", { name: "Increase occurrences per day" }),
    );
    expect(onTimeSlotsByTypeChange).toHaveBeenLastCalledWith(
      expect.objectContaining({
        daily: [
          { time: "11:00", period: "AM" },
          { time: "11:00", period: "AM" },
        ],
      }),
    );

    await user.click(
      screen.getByRole("button", { name: "Decrease occurrences per day" }),
    );
    await user.click(
      screen.getByRole("button", { name: "Decrease occurrences per day" }),
    );
    expect(onTimeSlotsByTypeChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ daily: [] }),
    );
  });

  it("defaults a newly-added row's time and period to the previous row's", async () => {
    const user = userEvent.setup();
    const onTimeSlotsByTypeChange = vi.fn();
    render(
      <ScheduleSettingsPanel
        defaultTimeSlotsByType={{
          daily: [{ time: "06:30", period: "PM" }],
          weekly: [{}],
          monthly: [{}],
          custom: [{}],
        }}
        onTimeSlotsByTypeChange={onTimeSlotsByTypeChange}
      />,
    );

    await user.click(
      screen.getByRole("button", { name: "Increase occurrences per day" }),
    );

    expect(onTimeSlotsByTypeChange).toHaveBeenLastCalledWith(
      expect.objectContaining({
        daily: [
          { time: "06:30", period: "PM" },
          { time: "06:30", period: "PM" },
        ],
      }),
    );
  });

  it("adds and removes a time-slot row to match the stepper's count", async () => {
    const user = userEvent.setup();
    render(<ScheduleSettingsPanel />);

    expect(
      screen.queryByLabelText("When would you like to post? (slot 2)"),
    ).not.toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: "Increase occurrences per day" }),
    );
    expect(
      screen.getByLabelText("When would you like to post? (slot 2)"),
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: "Decrease occurrences per day" }),
    );
    expect(
      screen.queryByLabelText("When would you like to post? (slot 2)"),
    ).not.toBeInTheDocument();
  });

  it("typing a number directly resizes the time-slot rows to match", async () => {
    const user = userEvent.setup();
    render(<ScheduleSettingsPanel />);

    const occurrencesInput = screen.getByLabelText("Occurrences per day");
    await user.clear(occurrencesInput);
    await user.type(occurrencesInput, "3");

    expect(
      screen.getByLabelText("When would you like to post? (slot 2)"),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText("When would you like to post? (slot 3)"),
    ).toBeInTheDocument();
  });

  it("disables Save while any time slot is unfilled (resizing the stepper no longer leaves one empty)", async () => {
    const user = userEvent.setup();
    render(
      <ScheduleSettingsPanel
        defaultTimeSlotsByType={{
          daily: [{ time: "10:00", period: "AM" }, {}],
          weekly: [{}],
          monthly: [{}],
          custom: [{}],
        }}
      />,
    );

    expect(screen.getByRole("button", { name: "Save" })).toBeDisabled();

    await user.type(
      screen.getByLabelText("When would you like to post? (slot 2)"),
      "0100",
    );
    expect(screen.getByRole("button", { name: "Save" })).toBeEnabled();
  });

  it("auto-fills a newly-added time slot instead of leaving it empty, so Save stays enabled", async () => {
    const user = userEvent.setup();
    render(<ScheduleSettingsPanel />);

    expect(screen.getByRole("button", { name: "Save" })).toBeEnabled();

    await user.click(
      screen.getByRole("button", { name: "Increase occurrences per day" }),
    );
    expect(screen.getByRole("button", { name: "Save" })).toBeEnabled();
  });

  it("calls onBack when the back button is clicked", async () => {
    const user = userEvent.setup();
    const onBack = vi.fn();
    render(<ScheduleSettingsPanel onBack={onBack} />);

    await user.click(
      screen.getByRole("button", { name: "Back to schedule panel" }),
    );

    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it("calls onSave when the Save button is clicked", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(<ScheduleSettingsPanel onSave={onSave} />);

    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(onSave).toHaveBeenCalledTimes(1);
  });

  it("disables Save on Weekly until a weekday is checked", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(
      <ScheduleSettingsPanel defaultRepeatType="weekly" onSave={onSave} />,
    );

    expect(screen.getByRole("button", { name: "Save" })).toBeDisabled();

    await user.click(screen.getByRole("button", { name: "mon" }));

    expect(screen.getByRole("button", { name: "Save" })).toBeEnabled();
    await user.click(screen.getByRole("button", { name: "Save" }));
    expect(onSave).toHaveBeenCalledTimes(1);
  });

  it("disables Save on Monthly until a day of month is entered", async () => {
    const user = userEvent.setup();
    render(<ScheduleSettingsPanel defaultRepeatType="monthly" />);

    expect(screen.getByRole("button", { name: "Save" })).toBeDisabled();

    await user.type(screen.getByLabelText("Day of every month"), "15");

    expect(screen.getByRole("button", { name: "Save" })).toBeEnabled();
  });

  it("rejects a day-of-month value outside 1-31 and shows a warning", async () => {
    const user = userEvent.setup();
    const onDayOfMonthChange = vi.fn();
    render(
      <ScheduleSettingsPanel
        defaultRepeatType="monthly"
        onDayOfMonthChange={onDayOfMonthChange}
      />,
    );

    const dayInput = screen.getByLabelText("Day of every month");
    await user.type(dayInput, "99");

    expect(dayInput).toHaveValue("9");
    expect(onDayOfMonthChange).toHaveBeenLastCalledWith("9");
    expect(
      screen.getByText("Enter a day between 1 and 31."),
    ).toBeInTheDocument();
  });

  it("disables Save on Custom until an interval count is entered", async () => {
    const user = userEvent.setup();
    render(<ScheduleSettingsPanel defaultRepeatType="custom" />);

    expect(screen.getByRole("button", { name: "Save" })).toBeDisabled();

    await user.type(screen.getByLabelText("Repeat interval"), "2");

    expect(screen.getByRole("button", { name: "Save" })).toBeEnabled();
  });

  it("removes that row from timeSlots when a time row's delete button is clicked", async () => {
    const user = userEvent.setup();
    const onTimeSlotsByTypeChange = vi.fn();
    render(
      <ScheduleSettingsPanel
        onTimeSlotsByTypeChange={onTimeSlotsByTypeChange}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Delete" }));

    expect(onTimeSlotsByTypeChange).toHaveBeenCalledWith(
      expect.objectContaining({ daily: [] }),
    );
    expect(
      screen.queryByLabelText("When would you like to post?"),
    ).not.toBeInTheDocument();
  });

  it("supports a controlled repeatType", async () => {
    const user = userEvent.setup();
    const onRepeatTypeChange = vi.fn();
    render(
      <ScheduleSettingsPanel
        repeatType="daily"
        onRepeatTypeChange={onRepeatTypeChange}
      />,
    );

    await user.click(screen.getByRole("tab", { name: "Custom" }));

    expect(onRepeatTypeChange).toHaveBeenCalledWith("custom");
    // Controlled: stays on Daily until the parent passes repeatType="custom".
    expect(screen.getByRole("tab", { name: "Daily" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });
});
