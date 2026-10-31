import { beforeAll, describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { AssetPanel, type AssetPanelSelfProfile } from "./asset-panel";

beforeAll(() => {
  if (!("ResizeObserver" in window)) {
    (window as unknown as { ResizeObserver: unknown }).ResizeObserver = vi
      .fn()
      .mockImplementation(function ResizeObserverMock() {
        return {
          observe: vi.fn(),
          unobserve: vi.fn(),
          disconnect: vi.fn(),
        };
      });
  }
});

const SELF: AssetPanelSelfProfile = {
  id: "self-default",
  role: "Data Scientist",
  image: "/images/personas/self-default.jpg",
  description: "Forecasting Finance teams trust.",
  knownForNow: "I'm known for building forecasting models.",
  knownForNext: "I'm known for building forecasting models.",
  postingCount: 3,
  postingFrequency: "Day",
  targetedFollowersIndex: 1,
  timeframe: "1 year",
  goalActions: [],
};

describe("AssetPanel", () => {
  it("renders the self's role and description", () => {
    render(
      <AssetPanel
        self={SELF}
        onCreateContents={vi.fn()}
        onEditSelfPortrait={vi.fn()}
        onGoToAssetGallery={vi.fn()}
        onEditGoal={vi.fn()}
      />,
    );

    expect(screen.getByText("Data Scientist")).toBeInTheDocument();
    expect(
      screen.getByText("Forecasting Finance teams trust."),
    ).toBeInTheDocument();
  });

  it("calls onCreateContents when the Create contents button is clicked", async () => {
    const user = userEvent.setup();
    const onCreateContents = vi.fn();
    render(
      <AssetPanel
        self={SELF}
        onCreateContents={onCreateContents}
        onEditSelfPortrait={vi.fn()}
        onGoToAssetGallery={vi.fn()}
        onEditGoal={vi.fn()}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Create contents" }));

    expect(onCreateContents).toHaveBeenCalledTimes(1);
  });

  it("opens the menu and calls onEditSelfPortrait when selected", async () => {
    const user = userEvent.setup();
    const onEditSelfPortrait = vi.fn();
    render(
      <AssetPanel
        self={SELF}
        onCreateContents={vi.fn()}
        onEditSelfPortrait={onEditSelfPortrait}
        onGoToAssetGallery={vi.fn()}
        onEditGoal={vi.fn()}
      />,
    );

    await user.click(screen.getByRole("button", { name: "More options" }));
    const item = await within(document.body).findByText("Edit Self Portrait");
    await user.click(item);

    expect(onEditSelfPortrait).toHaveBeenCalledTimes(1);
  });

  it("calls onGoToAssetGallery when that menu item is selected", async () => {
    const user = userEvent.setup();
    const onGoToAssetGallery = vi.fn();
    render(
      <AssetPanel
        self={SELF}
        onCreateContents={vi.fn()}
        onEditSelfPortrait={vi.fn()}
        onGoToAssetGallery={onGoToAssetGallery}
        onEditGoal={vi.fn()}
      />,
    );

    await user.click(screen.getByRole("button", { name: "More options" }));
    const item = await within(document.body).findByText("Go to Asset Gallery");
    await user.click(item);

    expect(onGoToAssetGallery).toHaveBeenCalledTimes(1);
  });

  it("calls onEditGoal when that menu item is selected", async () => {
    const user = userEvent.setup();
    const onEditGoal = vi.fn();
    render(
      <AssetPanel
        self={SELF}
        onCreateContents={vi.fn()}
        onEditSelfPortrait={vi.fn()}
        onGoToAssetGallery={vi.fn()}
        onEditGoal={onEditGoal}
      />,
    );

    await user.click(screen.getByRole("button", { name: "More options" }));
    const item = await within(document.body).findByText("Edit Goal");
    await user.click(item);

    expect(onEditGoal).toHaveBeenCalledTimes(1);
  });
});
