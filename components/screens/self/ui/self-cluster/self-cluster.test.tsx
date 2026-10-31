import { afterEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";

import { SelfCluster, SELF_SLOTS, type ClusterSelf } from "./self-cluster";

const northSelf: ClusterSelf = {
  id: "data-scientist",
  slotId: "north",
  label: "Data Scientist",
  image: "/data-scientist.jpg",
};
const eastSelf: ClusterSelf = {
  id: "entrepreneur",
  slotId: "east",
  label: "Entrepreneur",
  image: "/entrepreneur.jpg",
};

const noopActions = () => [];

describe("SelfCluster", () => {
  it("shows the empty-state copy when no selves exist", () => {
    const { container } = render(
      <SelfCluster
        selves={[]}
        onAddSelf={vi.fn()}
        onSelectSelf={vi.fn()}
        getSelfMenuActions={noopActions}
      />,
    );

    expect(container.textContent).toContain("Self isNot Created Yet.");
    expect(screen.getAllByLabelText("Add a Self")).toHaveLength(8);
  });

  it("mirrors the north slot's label as the center text once a north self exists", () => {
    render(
      <SelfCluster
        selves={[northSelf]}
        onAddSelf={vi.fn()}
        onSelectSelf={vi.fn()}
        getSelfMenuActions={noopActions}
      />,
    );

    expect(screen.queryByText("Self is")).toBeNull();
    expect(screen.getAllByText("Data Scientist").length).toBeGreaterThan(0);
  });

  it("shows no center text when selves exist but the north slot is empty", () => {
    render(
      <SelfCluster
        selves={[eastSelf]}
        onAddSelf={vi.fn()}
        onSelectSelf={vi.fn()}
        getSelfMenuActions={noopActions}
      />,
    );

    expect(screen.queryByText("Self is")).toBeNull();
    expect(screen.queryByText("Entrepreneur")).not.toBeNull();
  });

  it("calls onAddSelf with the slot id when an empty slot's + is clicked", () => {
    const onAddSelf = vi.fn();
    render(
      <SelfCluster
        selves={[]}
        onAddSelf={onAddSelf}
        onSelectSelf={vi.fn()}
        getSelfMenuActions={noopActions}
      />,
    );

    fireEvent.click(screen.getAllByLabelText("Add a Self")[0]!);
    expect(onAddSelf).toHaveBeenCalledWith(SELF_SLOTS[0]!.id);
  });

  it("calls onSelectSelf when a filled self's image is clicked", () => {
    const onSelectSelf = vi.fn();
    render(
      <SelfCluster
        selves={[northSelf]}
        onAddSelf={vi.fn()}
        onSelectSelf={onSelectSelf}
        getSelfMenuActions={noopActions}
      />,
    );

    fireEvent.click(screen.getByAltText("Data Scientist"));
    expect(onSelectSelf).toHaveBeenCalledWith(northSelf);
  });

  it("opens a ProfilePrint preview popover when a filled self's image is clicked", () => {
    render(
      <SelfCluster
        selves={[northSelf]}
        onAddSelf={vi.fn()}
        onSelectSelf={vi.fn()}
        getSelfMenuActions={noopActions}
      />,
    );

    expect(screen.getAllByAltText("Data Scientist")).toHaveLength(1);

    fireEvent.click(screen.getByAltText("Data Scientist"));
    expect(screen.getAllByAltText("Data Scientist")).toHaveLength(2);
  });

  it("shows the hovered self's label as center text, reverting once the hover ends", () => {
    render(
      <SelfCluster
        selves={[northSelf, eastSelf]}
        onAddSelf={vi.fn()}
        onSelectSelf={vi.fn()}
        getSelfMenuActions={noopActions}
      />,
    );

    expect(screen.getAllByText("Entrepreneur")).toHaveLength(1);

    fireEvent.mouseEnter(screen.getByAltText("Entrepreneur"));
    expect(screen.getAllByText("Entrepreneur")).toHaveLength(2);

    fireEvent.mouseLeave(screen.getByAltText("Entrepreneur"));
    expect(screen.getAllByText("Entrepreneur")).toHaveLength(1);
    expect(screen.getAllByText("Data Scientist").length).toBeGreaterThan(0);
  });

  describe("dropdown open/close", () => {
    afterEach(() => {
      vi.useRealTimers();
    });

    const oneAction = () => [{ label: "Create a Post", onSelect: vi.fn() }];

    it("does not open just from hovering the trigger", () => {
      render(
        <SelfCluster
          selves={[northSelf]}
          onAddSelf={vi.fn()}
          onSelectSelf={vi.fn()}
          getSelfMenuActions={oneAction}
        />,
      );

      fireEvent.mouseEnter(screen.getByRole("combobox"));
      expect(screen.queryByText("Create a Post")).toBeNull();
    });

    it("opens on click and closes shortly after the mouse leaves the trigger", () => {
      vi.useFakeTimers();
      render(
        <SelfCluster
          selves={[northSelf]}
          onAddSelf={vi.fn()}
          onSelectSelf={vi.fn()}
          getSelfMenuActions={oneAction}
        />,
      );

      const trigger = screen.getByRole("combobox");
      fireEvent.click(trigger);
      expect(screen.getByText("Create a Post")).toBeInTheDocument();

      fireEvent.mouseLeave(trigger);
      act(() => {
        vi.advanceTimersByTime(200);
      });
      expect(screen.queryByText("Create a Post")).toBeNull();
    });
  });
});
