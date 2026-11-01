import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./dialog";

function renderDialog(
  props: Partial<React.ComponentProps<typeof Dialog>> = {},
) {
  return render(
    <Dialog {...props}>
      <DialogTrigger>Open</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a 'Self'</DialogTitle>
          <DialogDescription>Describe your goal.</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose>Cancel</DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>,
  );
}

describe("Dialog", () => {
  it("does not render content before the trigger is clicked", () => {
    renderDialog();

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("opens and shows title/description when the trigger is clicked", async () => {
    const user = userEvent.setup();
    renderDialog();

    await user.click(screen.getByRole("button", { name: "Open" }));

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Create a 'Self'")).toBeInTheDocument();
    expect(screen.getByText("Describe your goal.")).toBeInTheDocument();
  });

  it("renders open content immediately when controlled open is true", () => {
    renderDialog({ open: true, onOpenChange: vi.fn() });

    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("closes when the built-in close button is clicked", async () => {
    const user = userEvent.setup();
    renderDialog();

    await user.click(screen.getByRole("button", { name: "Open" }));
    await user.click(screen.getByRole("button", { name: "Close" }));

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  it("closes when a DialogClose element inside is clicked", async () => {
    const user = userEvent.setup();
    renderDialog();

    await user.click(screen.getByRole("button", { name: "Open" }));
    await user.click(screen.getByRole("button", { name: "Cancel" }));

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  it("does not close on Escape key press — only its own close control does", async () => {
    const user = userEvent.setup();
    renderDialog();

    await user.click(screen.getByRole("button", { name: "Open" }));
    await user.keyboard("{Escape}");

    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("hides the built-in close button when showCloseButton is false", async () => {
    const user = userEvent.setup();
    render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent showCloseButton={false}>
          <DialogTitle>No close button</DialogTitle>
        </DialogContent>
      </Dialog>,
    );

    await user.click(screen.getByRole("button", { name: "Open" }));

    expect(
      screen.queryByRole("button", { name: "Close" }),
    ).not.toBeInTheDocument();
  });
});
