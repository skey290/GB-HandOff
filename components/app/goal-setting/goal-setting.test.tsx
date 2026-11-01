import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { GoalSetting } from "./goal-setting";

describe("GoalSetting", () => {
  it("renders the card title and calls onClose when the close button is clicked", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<GoalSetting onClose={onClose} />);

    expect(screen.getByText("My goal")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "닫기" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("renders both statements as always-open textareas, with no pencil/Cancel buttons", () => {
    render(<GoalSetting defaultNow="Old now value" defaultGoal="Old goal" />);

    expect(
      screen.getByRole("textbox", { name: "Known for Now" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("textbox", { name: "Known for Next" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /편집/ }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Cancel" }),
    ).not.toBeInTheDocument();
  });

  it("shows the placeholder guidance text when now/goal are empty", () => {
    render(<GoalSetting />);

    expect(
      screen.getByPlaceholderText(/What are you known for today/),
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/What do you want to be known for next/),
    ).toBeInTheDocument();
  });

  it("does not show the settings sentence when the goal is empty", () => {
    render(<GoalSetting />);

    expect(screen.queryByText("I post")).not.toBeInTheDocument();
  });

  it("shows the settings sentence once a goal value exists", () => {
    render(<GoalSetting defaultGoal="I'm known for a modeling partner." />);

    expect(screen.getByText("I post")).toBeInTheDocument();
    expect(screen.getByText("3 times a day")).toBeInTheDocument();
    expect(screen.getByText("5,000")).toBeInTheDocument();
    expect(screen.getByText("1 year")).toBeInTheDocument();
  });

  it("calls onNowChange immediately as the Known for Now textarea is typed into, with no Save step", async () => {
    const user = userEvent.setup();
    const onNowChange = vi.fn();
    render(
      <GoalSetting defaultNow="Old now value" onNowChange={onNowChange} />,
    );

    const textarea = screen.getByRole("textbox", { name: "Known for Now" });
    await user.type(textarea, "!");

    expect(onNowChange).toHaveBeenCalledWith("Old now value!");
  });

  it("renders a single bottom Save button that calls onSave when clicked", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(
      <GoalSetting
        defaultSelfName="Entrepreneur"
        defaultNow="now"
        defaultGoal="Goal text"
        onSave={onSave}
      />,
    );

    const saveButtons = screen.getAllByRole("button", { name: "Save" });
    expect(saveButtons).toHaveLength(1);
    await user.click(saveButtons[0]);

    expect(onSave).toHaveBeenCalledTimes(1);
  });

  it("disables Save unless both Known for Now and Known for Next are filled", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(<GoalSetting onSave={onSave} />);

    const saveButton = screen.getByRole("button", { name: "Save" });
    const selfNameInput = screen.getByRole("textbox", { name: "Self Name" });
    const nowTextarea = screen.getByRole("textbox", { name: "Known for Now" });
    const goalTextarea = screen.getByRole("textbox", {
      name: "Known for Next",
    });

    expect(saveButton).toBeDisabled();

    await user.type(selfNameInput, "Entrepreneur");
    expect(saveButton).toBeDisabled();

    await user.type(nowTextarea, "Now value");
    expect(saveButton).toBeDisabled();

    await user.type(goalTextarea, "Goal value");
    expect(saveButton).toBeEnabled();

    await user.clear(nowTextarea);
    expect(saveButton).toBeDisabled();

    await user.click(saveButton);
    expect(onSave).not.toHaveBeenCalled();
  });

  it("opens the Posting Frequency panel from the chip and commits the stepper value immediately", async () => {
    const user = userEvent.setup();
    const onPostingCountChange = vi.fn();
    render(
      <GoalSetting
        defaultGoal="Goal text"
        defaultPostingCount={3}
        onPostingCountChange={onPostingCountChange}
      />,
    );

    await user.click(screen.getByRole("button", { name: "3 times a day" }));
    expect(screen.getByText("Posting Frequency")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "증가" }));

    expect(onPostingCountChange).toHaveBeenCalledWith(4);
  });

  it("switches Posting Frequency selection inside the panel immediately", async () => {
    const user = userEvent.setup();
    const onPostingFrequencyChange = vi.fn();
    render(
      <GoalSetting
        defaultGoal="Goal text"
        defaultPostingFrequency="Day"
        onPostingFrequencyChange={onPostingFrequencyChange}
      />,
    );

    await user.click(screen.getByRole("button", { name: "3 times a day" }));
    await user.click(screen.getByRole("radio", { name: "a Week" }));

    expect(onPostingFrequencyChange).toHaveBeenCalledWith("Week");
  });

  it("opens the Targeted Followers panel and commits the slider value immediately", async () => {
    const user = userEvent.setup();
    const onTargetedFollowersIndexChange = vi.fn();
    render(
      <GoalSetting
        defaultGoal="Goal text"
        defaultTargetedFollowersIndex={1}
        onTargetedFollowersIndexChange={onTargetedFollowersIndexChange}
      />,
    );

    await user.click(screen.getByRole("button", { name: "5,000" }));
    const slider = screen.getByRole("slider", { name: "Targeted Followers" });
    slider.focus();
    await user.keyboard("{ArrowRight}");

    expect(onTargetedFollowersIndexChange).toHaveBeenCalledWith(2);
  });

  it("opens the Timeframe panel and commits the selected option immediately", async () => {
    const user = userEvent.setup();
    const onTimeframeChange = vi.fn();
    render(
      <GoalSetting
        defaultGoal="Goal text"
        defaultTimeframe="1 year"
        onTimeframeChange={onTimeframeChange}
      />,
    );

    await user.click(screen.getByRole("button", { name: "1 year" }));
    await user.click(screen.getByRole("radio", { name: "3 months" }));

    expect(onTimeframeChange).toHaveBeenCalledWith("3 months");
  });

  it("highlights only the chip whose panel is currently open", async () => {
    const user = userEvent.setup();
    render(<GoalSetting defaultGoal="Goal text" />);

    const frequencyChip = screen.getByRole("button", {
      name: "3 times a day",
    });
    const followersChip = screen.getByRole("button", { name: "5,000" });

    expect(frequencyChip).toHaveAttribute("aria-pressed", "false");
    await user.click(frequencyChip);
    expect(frequencyChip).toHaveAttribute("aria-pressed", "true");
    expect(followersChip).toHaveAttribute("aria-pressed", "false");

    await user.click(followersChip);
    expect(frequencyChip).toHaveAttribute("aria-pressed", "false");
    expect(followersChip).toHaveAttribute("aria-pressed", "true");
  });

  it("toggles the same settings panel closed when its chip is clicked again", async () => {
    const user = userEvent.setup();
    render(<GoalSetting defaultGoal="Goal text" />);

    await user.click(screen.getByRole("button", { name: "3 times a day" }));
    expect(screen.getByText("Posting Frequency")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "3 times a day" }));
    expect(screen.queryByText("Posting Frequency")).not.toBeInTheDocument();
  });

  it('type="default" renders Now/Next as read-only text instead of textareas', () => {
    render(
      <GoalSetting
        type="default"
        defaultNow="Old now value"
        defaultGoal="Old goal"
      />,
    );

    expect(screen.getByText("Old now value")).toBeInTheDocument();
    expect(screen.getByText("Old goal")).toBeInTheDocument();
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  });

  it('type="default" renders the settings sentence chips as static, non-clickable pills', async () => {
    const user = userEvent.setup();
    render(<GoalSetting type="default" defaultGoal="Goal text" />);

    const chip = screen.getByText("3 times a day");
    expect(chip.tagName).toBe("SPAN");
    expect(
      screen.queryByRole("button", { name: "3 times a day" }),
    ).not.toBeInTheDocument();

    await user.click(chip);

    expect(screen.queryByText("Posting Frequency")).not.toBeInTheDocument();
  });
});
