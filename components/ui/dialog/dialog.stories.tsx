import type { Meta, StoryObj } from "@storybook/nextjs";
import { userEvent, within } from "storybook/test";

import { Button } from "@/components/ui/button";

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

function DialogDemo({
  title,
  description,
  body,
}: {
  title: string;
  description: string;
  body: string;
}) {
  return (
    <Dialog defaultOpen>
      <DialogTrigger asChild>
        <Button>Open dialog</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <p className="text-sm-regular text-[var(--gb-text-default)]">{body}</p>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button>Continue</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const meta = {
  title: "UI/Dialog",
  component: DialogDemo,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "General-purpose modal shell composed of Trigger/Content/Header/Footer parts, for arbitrary content (forms, multi-step flows) — unlike Popover, which is a fixed confirmation dialog. No Figma spec; follows the standard Shadcn Dialog pattern. Closes only via an explicit control inside it (its own Close button, a Cancel/Save, etc.) — an outside click or Escape never dismisses it, across every app using this component.",
      },
    },
  },
  argTypes: {
    title: { control: "text" },
    description: { control: "text" },
    body: { control: "text" },
  },
  args: {
    title: "Create a 'Self'",
    description: "Describe the goal this Self should represent.",
    body: "Arbitrary content goes here — forms, lists, previews, anything.",
  },
  render: (args) => <DialogDemo {...args} />,
} satisfies Meta<typeof DialogDemo>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const DoesNotCloseOnOutsideClickOrEscape: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Clicking outside or pressing Escape leaves the dialog open — only its own Cancel/Continue (or a Close button) can dismiss it.",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.ownerDocument.body);
    await canvas.findByRole("dialog");

    await userEvent.keyboard("{Escape}");
    await canvas.findByRole("dialog");

    // Radix sets `pointer-events: none` on <body> while the dialog is open, so
    // the click target has to be the overlay itself, not body.
    const overlay = canvasElement.ownerDocument.querySelector(
      '[class*="overlay"]',
    ) as HTMLElement;
    await userEvent.click(overlay);
    await canvas.findByRole("dialog");
  },
};
