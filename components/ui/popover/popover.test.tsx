import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Popover } from "./popover";

const baseProps = {
  type: "notification" as const,
  title: "Heading to 'Content Studio' to create your post?",
  description: "Exit this page and start creating a post in 'Content Studio'.",
};

describe("Popover", () => {
  it("does not render when open is false", () => {
    render(<Popover {...baseProps} open={false} onOpenChange={vi.fn()} />);

    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
  });

  it("renders title and description when open", () => {
    render(<Popover {...baseProps} open onOpenChange={vi.fn()} />);

    const dialog = screen.getByRole("alertdialog");
    expect(dialog).toBeInTheDocument();
    expect(screen.getByText(baseProps.title)).toBeInTheDocument();
    expect(screen.getByText(baseProps.description)).toBeInTheDocument();
  });

  it("applies default (non-warning) text color for notification title", () => {
    render(
      <Popover
        {...baseProps}
        type="notification"
        open
        onOpenChange={vi.fn()}
      />,
    );

    expect(screen.getByText(baseProps.title)).not.toHaveAttribute(
      "data-warning",
    );
  });

  it("applies error text color for warning title", () => {
    render(
      <Popover {...baseProps} type="warning" open onOpenChange={vi.fn()} />,
    );

    expect(screen.getByText(baseProps.title)).toHaveAttribute(
      "data-warning",
      "true",
    );
  });

  it("calls onCancel and closes when Cancel is clicked", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    const onCancel = vi.fn();
    render(
      <Popover
        {...baseProps}
        open
        onOpenChange={onOpenChange}
        onCancel={onCancel}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Cancel" }));

    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("calls onConfirm and closes when Confirm is clicked", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    const onConfirm = vi.fn();
    render(
      <Popover
        {...baseProps}
        open
        onOpenChange={onOpenChange}
        onConfirm={onConfirm}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Confirm" }));

    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("uses custom cancel/confirm labels when provided", () => {
    render(
      <Popover
        {...baseProps}
        open
        onOpenChange={vi.fn()}
        cancelLabel="Not now"
        confirmLabel="Yes, continue"
      />,
    );

    expect(screen.getByRole("button", { name: "Not now" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Yes, continue" }),
    ).toBeInTheDocument();
  });

  it("does not render the checkbox row when checkbox prop is omitted", () => {
    render(<Popover {...baseProps} open onOpenChange={vi.fn()} />);

    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
  });

  it("renders the 'Do not ask again' checkbox for notification when checkbox is provided", () => {
    render(
      <Popover
        {...baseProps}
        type="notification"
        checkbox={false}
        open
        onOpenChange={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("checkbox", { name: "Do not ask again." }),
    ).toBeInTheDocument();
  });

  // Figma `Type=warning` has no checkbox layer — the type forbids the combination,
  // and even bypassing the type, it isn't rendered at runtime.
  it("never renders the checkbox row for warning, even if checkbox is forced in", () => {
    // The type rejects this combination — bypass it with a cast to verify the runtime guard too.
    const forced = {
      ...baseProps,
      type: "warning",
      checkbox: false,
      open: true,
      onOpenChange: vi.fn(),
    } as unknown as React.ComponentProps<typeof Popover>;

    render(<Popover {...forced} />);

    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
  });

  it("toggles the checkbox and calls onCheckedChange", async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    render(
      <Popover
        {...baseProps}
        checkbox={false}
        onCheckedChange={onCheckedChange}
        open
        onOpenChange={vi.fn()}
      />,
    );

    await user.click(
      screen.getByRole("checkbox", { name: "Do not ask again." }),
    );

    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });

  it("does not close on Escape key press — only Cancel/Confirm do", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(<Popover {...baseProps} open onOpenChange={onOpenChange} />);

    await user.keyboard("{Escape}");

    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it("hides the description row when description is omitted", () => {
    render(
      <Popover
        type="notification"
        open
        onOpenChange={() => {}}
        title="Title only"
      />,
    );

    expect(screen.getByText("Title only")).toBeInTheDocument();
    expect(
      screen.getByRole("alertdialog").getAttribute("aria-describedby"),
    ).toBeNull();
  });

  it("hides the checkbox and button row when showButton is false", () => {
    render(
      <Popover
        type="notification"
        open
        onOpenChange={() => {}}
        title="No actions"
        description="Body"
        checkbox={false}
        showButton={false}
      />,
    );

    expect(screen.queryByRole("button", { name: "Cancel" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Confirm" })).toBeNull();
    expect(screen.queryByText("Do not ask again.")).toBeNull();
  });
});
