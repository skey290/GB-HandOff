import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { Post } from "@/components/screens/content-studio/ui/PostCard";

import { PostingModal } from "./PostingModal";

const BASE_POST: Post = {
  id: "post-1",
  status: "draft",
  contentType: "image",
  images: ["/images/personas/team-leader.jpg"],
  caption: "Hi, I'm Cloe. Three years into data science at a SaaS startup.",
  hashtags: ["#DataScience", "#SaaS"],
  platforms: ["linkedin", "x"],
  date: "09.01.2026",
  time: "10:00 PM",
};

describe("PostingModal", () => {
  describe("style=empty", () => {
    function renderEmpty(extra: Record<string, unknown> = {}) {
      const onAddPlatform = vi.fn();
      const onRemovePlatform = vi.fn();
      const onPostCountChange = vi.fn();
      const onPostTypeChange = vi.fn();
      const onInstructionChange = vi.fn();
      const onAutoGenerate = vi.fn();
      const onClose = vi.fn();

      render(
        <PostingModal
          style="empty"
          platforms={["linkedin"]}
          postCount={9}
          postTypeIndex={0}
          instruction=""
          onAddPlatform={onAddPlatform}
          onRemovePlatform={onRemovePlatform}
          onPostCountChange={onPostCountChange}
          onPostTypeChange={onPostTypeChange}
          onInstructionChange={onInstructionChange}
          onAutoGenerate={onAutoGenerate}
          onClose={onClose}
          {...extra}
        />,
      );

      return {
        onAddPlatform,
        onRemovePlatform,
        onPostCountChange,
        onPostTypeChange,
        onInstructionChange,
        onAutoGenerate,
        onClose,
      };
    }

    it("renders the creation-flow fields", () => {
      renderEmpty();

      expect(screen.getByText("Today, Sep 01")).toBeInTheDocument();
      expect(screen.getByText("Where to post?")).toBeInTheDocument();
      expect(
        screen.getByText("How many posts are you going to make?"),
      ).toBeInTheDocument();
      expect(screen.getByText("Select Post Type")).toBeInTheDocument();
      expect(screen.getByText("9")).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Auto-generate" }),
      ).toBeInTheDocument();
    });

    describe("Where to post", () => {
      it("shows the selected platform as a chip, not a select", () => {
        renderEmpty();

        expect(
          screen.getByRole("button", { name: "LinkedIn" }),
        ).toBeInTheDocument();
        expect(screen.getAllByRole("combobox")).toHaveLength(1);
      });

      it("blocks deletion when only one platform remains", () => {
        renderEmpty();

        expect(
          screen.queryByRole("button", { name: "Remove" }),
        ).not.toBeInTheDocument();
      });

      it("allows deletion once more than one platform is selected", async () => {
        const user = userEvent.setup();
        const { onRemovePlatform } = renderEmpty({
          platforms: ["linkedin", "x"],
        });

        await user.click(screen.getAllByRole("button", { name: "Remove" })[0]!);
        expect(onRemovePlatform).toHaveBeenCalledWith(0);
      });

      it("offers only the not-yet-selected platforms in the add dropdown", async () => {
        const user = userEvent.setup();
        renderEmpty();

        await user.click(screen.getByRole("combobox"));

        expect(
          screen.getByRole("option", { name: "X (Twitter)" }),
        ).toBeInTheDocument();
        expect(
          screen.getByRole("option", { name: "Instagram" }),
        ).toBeInTheDocument();
        expect(
          screen.getByRole("option", { name: "Threads" }),
        ).toBeInTheDocument();
        expect(
          screen.queryByRole("option", { name: "LinkedIn" }),
        ).not.toBeInTheDocument();
      });

      it("calls onAddPlatform with the picked platform", async () => {
        const user = userEvent.setup();
        const { onAddPlatform } = renderEmpty();

        await user.click(screen.getByRole("combobox"));
        await user.click(screen.getByRole("option", { name: "Instagram" }));

        expect(onAddPlatform).toHaveBeenCalledWith("instagram");
      });

      it("hides the add dropdown once every platform is already selected", () => {
        renderEmpty({
          platforms: ["linkedin", "x", "instagram", "threads"],
        });

        expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
      });
    });

    describe("Image style / Reference section", () => {
      it("shows both sections when Post Type is All (the default)", () => {
        renderEmpty();

        expect(screen.getByText("Image style")).toBeInTheDocument();
        expect(screen.getByText("Reference")).toBeInTheDocument();
      });

      it("shows both sections when Post Type is Image", () => {
        renderEmpty({ postTypeIndex: 1 });

        expect(screen.getByText("Image style")).toBeInTheDocument();
        expect(screen.getByText("Reference")).toBeInTheDocument();
      });

      it("hides both sections when Post Type is Text", () => {
        renderEmpty({ postTypeIndex: 2 });

        expect(screen.queryByText("Image style")).not.toBeInTheDocument();
        expect(screen.queryByText("Reference")).not.toBeInTheDocument();
      });
    });

    it("increments and decrements the post-count stepper", async () => {
      const user = userEvent.setup();
      const { onPostCountChange } = renderEmpty();

      await user.click(
        screen.getByRole("button", { name: "Increase post count" }),
      );
      expect(onPostCountChange).toHaveBeenCalledWith(10);

      await user.click(
        screen.getByRole("button", { name: "Decrease post count" }),
      );
      expect(onPostCountChange).toHaveBeenCalledWith(8);
    });

    it("never decrements the stepper below 1", async () => {
      const user = userEvent.setup();
      const { onPostCountChange } = renderEmpty({ postCount: 1 });

      await user.click(
        screen.getByRole("button", { name: "Decrease post count" }),
      );
      expect(onPostCountChange).toHaveBeenCalledWith(1);
    });

    it("calls onPostTypeChange when a post-type chip is clicked", async () => {
      const user = userEvent.setup();
      const { onPostTypeChange } = renderEmpty();

      await user.click(screen.getByRole("button", { name: "Image" }));
      expect(onPostTypeChange).toHaveBeenCalledWith(1);
    });

    it("calls onAutoGenerate when the Auto-generate button is clicked", async () => {
      const user = userEvent.setup();
      const { onAutoGenerate } = renderEmpty();

      await user.click(screen.getByRole("button", { name: "Auto-generate" }));
      expect(onAutoGenerate).toHaveBeenCalledTimes(1);
    });

    it("calls onClose when the close button is clicked", async () => {
      const user = userEvent.setup();
      const { onClose } = renderEmpty();

      await user.click(screen.getByRole("button", { name: "Close" }));
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("hides the close button when showCloseButton is false", () => {
      renderEmpty({ showCloseButton: false });

      expect(
        screen.queryByRole("button", { name: "Close" }),
      ).not.toBeInTheDocument();
    });
  });

  describe("style=default", () => {
    function renderDefault(
      post: Post = BASE_POST,
      extra: Record<string, unknown> = {},
    ) {
      const onAddPlatform = vi.fn();
      const onRemovePlatform = vi.fn();
      const onActiveTabIndexChange = vi.fn();
      const onApplyChanges = vi.fn();
      const onSaveChanges = vi.fn();
      const onScheduleDraft = vi.fn();
      const onArchive = vi.fn();
      const onClose = vi.fn();

      render(
        <PostingModal
          style="default"
          post={post}
          activeTabIndex={0}
          onAddPlatform={onAddPlatform}
          onRemovePlatform={onRemovePlatform}
          onActiveTabIndexChange={onActiveTabIndexChange}
          onApplyChanges={onApplyChanges}
          onSaveChanges={onSaveChanges}
          onScheduleDraft={onScheduleDraft}
          onArchive={onArchive}
          onClose={onClose}
          {...extra}
        />,
      );

      return {
        onAddPlatform,
        onRemovePlatform,
        onActiveTabIndexChange,
        onApplyChanges,
        onSaveChanges,
        onScheduleDraft,
        onArchive,
        onClose,
      };
    }

    it("renders exactly as many tabs as post.platforms", () => {
      renderDefault();

      expect(screen.getByRole("tab", { name: "LinkedIn" })).toBeInTheDocument();
      expect(
        screen.getByRole("tab", { name: "X (Twitter)" }),
      ).toBeInTheDocument();
      expect(screen.getAllByRole("tab")).toHaveLength(2);
    });

    it("grows the tab row when post.platforms grows, with no code changes", () => {
      renderDefault({
        ...BASE_POST,
        platforms: ["linkedin", "x", "instagram", "threads"],
      });

      expect(screen.getAllByRole("tab")).toHaveLength(4);
      expect(
        screen.getByRole("tab", { name: "Instagram" }),
      ).toBeInTheDocument();
      expect(screen.getByRole("tab", { name: "Threads" })).toBeInTheDocument();
    });

    it("shows the LinkedIn preview by default (first platform)", () => {
      renderDefault();

      expect(screen.getByText("Data Storyteller")).toBeInTheDocument();
    });

    it("switches the preview when a different tab is selected", async () => {
      const user = userEvent.setup();
      const { onActiveTabIndexChange } = renderDefault();

      await user.click(screen.getByRole("tab", { name: "X (Twitter)" }));
      expect(onActiveTabIndexChange).toHaveBeenCalledWith(1);
    });

    it("renders the X preview when activeTabIndex points at it", () => {
      renderDefault(BASE_POST, { activeTabIndex: 1 });

      expect(screen.getByText("Cloe Mitchell")).toBeInTheDocument();
      expect(screen.getByText("@Cloe_Mitchell")).toBeInTheDocument();
    });

    describe("Where to post", () => {
      it("renders one deletable chip per post.platforms entry", () => {
        renderDefault();

        expect(
          screen.getByRole("button", { name: "LinkedIn" }),
        ).toBeInTheDocument();
        expect(
          screen.getByRole("button", { name: "X (Twitter)" }),
        ).toBeInTheDocument();
        expect(screen.getAllByRole("button", { name: "Remove" })).toHaveLength(
          2,
        );
      });

      it("calls onRemovePlatform with the chip's index", async () => {
        const user = userEvent.setup();
        const { onRemovePlatform } = renderDefault();

        await user.click(screen.getAllByRole("button", { name: "Remove" })[1]!);
        expect(onRemovePlatform).toHaveBeenCalledWith(1);
      });

      it("calls onAddPlatform with the picked platform", async () => {
        const user = userEvent.setup();
        const { onAddPlatform } = renderDefault();

        await user.click(screen.getByRole("combobox"));
        await user.click(screen.getByRole("option", { name: "Instagram" }));

        expect(onAddPlatform).toHaveBeenCalledWith("instagram");
      });

      it("blocks deletion when only one platform remains", () => {
        renderDefault({ ...BASE_POST, platforms: ["linkedin"] });

        expect(
          screen.queryByRole("button", { name: "Remove" }),
        ).not.toBeInTheDocument();
      });
    });

    it("calls onApplyChanges when Apply Changes is clicked", async () => {
      const user = userEvent.setup();
      const { onApplyChanges } = renderDefault();

      await user.click(screen.getByRole("button", { name: "Apply Changes" }));
      expect(onApplyChanges).toHaveBeenCalledTimes(1);
    });

    it("offers only Image/Text post-type chips (no All — there's already a post to retype, not generate from scratch)", () => {
      renderDefault();

      expect(screen.getByRole("button", { name: "Image" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Text" })).toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: "All" }),
      ).not.toBeInTheDocument();
    });

    it("calls the footer handlers (the preview's own PostCard actions are hidden via showButtons={false})", async () => {
      const user = userEvent.setup();
      const { onSaveChanges, onScheduleDraft, onArchive } = renderDefault();

      await user.click(screen.getByRole("button", { name: "Save Changes" }));
      expect(onSaveChanges).toHaveBeenCalledTimes(1);

      await user.click(screen.getByRole("button", { name: "Schedule Draft" }));
      expect(onScheduleDraft).toHaveBeenCalledTimes(1);

      await user.click(screen.getByRole("button", { name: "Move to Archive" }));
      expect(onArchive).toHaveBeenCalledTimes(1);
    });

    it("does not render PostCard's own Archive/Schedule-Draft row in the preview (only the footer's)", () => {
      renderDefault();

      expect(
        screen.getAllByRole("button", { name: "Move to Archive" }),
      ).toHaveLength(1);
      expect(
        screen.getAllByRole("button", { name: "Schedule Draft" }),
      ).toHaveLength(1);
    });

    it("keeps Archive after scheduling but hides Schedule Draft (already scheduled)", () => {
      renderDefault({ ...BASE_POST, status: "scheduled" });

      expect(
        screen.getByRole("button", { name: "Move to Archive" }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Save Changes" }),
      ).toBeEnabled();
      expect(
        screen.queryByRole("button", { name: "Schedule Draft" }),
      ).not.toBeInTheDocument();
    });

    it("hides both Archive and Schedule Draft, and disables Save Changes, once posted", () => {
      renderDefault({ ...BASE_POST, status: "posted" });

      expect(
        screen.queryByRole("button", { name: "Move to Archive" }),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: "Schedule Draft" }),
      ).not.toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Save Changes" }),
      ).toBeDisabled();
    });

    it("calls onClose when the close button is clicked", async () => {
      const user = userEvent.setup();
      const { onClose } = renderDefault();

      await user.click(screen.getByRole("button", { name: "Close" }));
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    describe("image style row", () => {
      it("shows the Image style section with Figma's 4 fixed options when the post has images", () => {
        renderDefault();

        expect(screen.getByText("Image style")).toBeInTheDocument();
        expect(
          screen.getByRole("radio", { name: "Artistic Duotone" }),
        ).toBeInTheDocument();
        expect(
          screen.getByRole("radio", { name: "Monochrome" }),
        ).toBeInTheDocument();
        expect(
          screen.getByRole("radio", { name: "Editorial" }),
        ).toBeInTheDocument();
        expect(
          screen.getByRole("radio", { name: "Deep Chroma" }),
        ).toBeInTheDocument();
      });

      it("shows the Image style section for a text-only post when Post Type is Image (the default)", () => {
        renderDefault({ ...BASE_POST, contentType: "text", images: [] });

        expect(screen.getByText("Image style")).toBeInTheDocument();
      });

      it("hides the Image style section when Post Type is Text", () => {
        renderDefault(BASE_POST, { postTypeIndex: 1 });

        expect(screen.queryByText("Image style")).not.toBeInTheDocument();
      });

      it("calls onImageStyleChange when a card is clicked", async () => {
        const user = userEvent.setup();
        const onImageStyleChange = vi.fn();
        renderDefault(BASE_POST, { onImageStyleChange });

        await user.click(screen.getByRole("radio", { name: "Monochrome" }));

        expect(onImageStyleChange).toHaveBeenCalledWith("monochrome");
      });

      it("marks the selected card via aria-checked (uncontrolled)", async () => {
        const user = userEvent.setup();
        renderDefault(BASE_POST, {
          defaultSelectedImageStyleId: "deep-chroma",
        });

        expect(
          screen.getByRole("radio", { name: "Deep Chroma" }),
        ).toHaveAttribute("aria-checked", "true");

        await user.click(screen.getByRole("radio", { name: "Monochrome" }));

        expect(
          screen.getByRole("radio", { name: "Monochrome" }),
        ).toHaveAttribute("aria-checked", "true");
        expect(
          screen.getByRole("radio", { name: "Deep Chroma" }),
        ).toHaveAttribute("aria-checked", "false");
      });

      it("respects a controlled selectedImageStyleId prop", async () => {
        const user = userEvent.setup();
        const onImageStyleChange = vi.fn();
        renderDefault(BASE_POST, {
          selectedImageStyleId: "deep-chroma",
          onImageStyleChange,
        });

        await user.click(screen.getByRole("radio", { name: "Monochrome" }));

        expect(onImageStyleChange).toHaveBeenCalledWith("monochrome");
        expect(
          screen.getByRole("radio", { name: "Deep Chroma" }),
        ).toHaveAttribute("aria-checked", "true");
      });
    });

    describe("Reference row", () => {
      it("shows the Reference section for a text-only post when Post Type is Image (the default)", () => {
        renderDefault({ ...BASE_POST, contentType: "text", images: [] });

        expect(screen.getByText("Reference")).toBeInTheDocument();
      });

      it("hides the Reference section when Post Type is Text", () => {
        renderDefault(BASE_POST, { postTypeIndex: 1 });

        expect(screen.queryByText("Reference")).not.toBeInTheDocument();
      });

      it("renders a thumbnail for each defaultReferenceImages entry", () => {
        renderDefault(BASE_POST, {
          defaultReferenceImages: ["/images/personas/entrepreneur.jpg"],
        });

        expect(
          document.querySelector(
            'img[src="/images/personas/entrepreneur.jpg"]',
          ),
        ).not.toBeNull();
      });

      it("opens the Asset Gallery dialog on the Reference tab when the add-reference button is clicked", async () => {
        const user = userEvent.setup();
        renderDefault();

        await user.click(screen.getByRole("button", { name: "Add Reference" }));

        expect(screen.getByRole("dialog")).toBeInTheDocument();
        expect(screen.getByText("Asset Gallery")).toBeInTheDocument();
        expect(
          screen.getByText(
            "Pick one or more reference images to generate on-brand content in Content Studio, or upload one of your own.",
          ),
        ).toBeInTheDocument();
      });

      it("adds the picked image as a thumbnail and closes the dialog (uncontrolled)", async () => {
        const user = userEvent.setup();
        renderDefault();

        await user.click(screen.getByRole("button", { name: "Add Reference" }));
        await user.click(
          screen.getByRole("checkbox", { name: "Entrepreneur preset" }),
        );
        await user.click(screen.getByRole("button", { name: "Select (1)" }));

        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
        expect(
          document.querySelector(
            'img[src="/images/personas/entrepreneur.jpg"]',
          ),
        ).not.toBeNull();
      });

      it("calls onReferenceImagesChange with the appended image when controlled", async () => {
        const user = userEvent.setup();
        const onReferenceImagesChange = vi.fn();
        renderDefault(BASE_POST, {
          referenceImages: [],
          onReferenceImagesChange,
        });

        await user.click(screen.getByRole("button", { name: "Add Reference" }));
        await user.click(
          screen.getByRole("checkbox", { name: "Entrepreneur preset" }),
        );
        await user.click(screen.getByRole("button", { name: "Select (1)" }));

        expect(onReferenceImagesChange).toHaveBeenCalledWith([
          "/images/personas/entrepreneur.jpg",
        ]);
      });
    });
  });
});
