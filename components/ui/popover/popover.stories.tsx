import * as React from "react";
import type { Meta, StoryObj } from "@storybook/nextjs";
import { fn, userEvent, within } from "storybook/test";

import { Popover, type PopoverProps } from "./popover";

const FIGMA_URL =
  "https://www.figma.com/design/G9YNa2vjdqDjnML9y5hXJ4/%F0%9F%93%8C-GB_Design-System--Atom-?node-id=7269-451";

// A fully controlled component with no trigger in Figma, so wrap it in a demo
// wrapper with an open button + local state so it can be opened directly from Controls.
function PopoverDemo({ open: openProp, onOpenChange, ...rest }: PopoverProps) {
  const [open, setOpen] = React.useState(openProp);

  React.useEffect(() => setOpen(openProp), [openProp]);

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    onOpenChange(next);
  };

  // `checkbox` is a controlled prop, so the demo also needs its own state for it to actually toggle.
  const checkboxProp = rest.type === "notification" ? rest.checkbox : undefined;
  const [checked, setChecked] = React.useState(checkboxProp);

  React.useEffect(() => setChecked(checkboxProp), [checkboxProp]);

  return (
    <div className="flex min-h-[240px] items-center justify-center">
      <button type="button" onClick={() => setOpen(true)}>
        Open dialog
      </button>
      {rest.type === "notification" ? (
        <Popover
          {...rest}
          open={open}
          onOpenChange={handleOpenChange}
          checkbox={checked}
          onCheckedChange={(next) => {
            setChecked(next);
            rest.onCheckedChange?.(next);
          }}
        />
      ) : (
        <Popover {...rest} open={open} onOpenChange={handleOpenChange} />
      )}
    </div>
  );
}

const meta = {
  title: "UI/Popover",
  component: Popover,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        // Verbatim text from the Figma component's description field
        component:
          "A centred modal panel that interrupts the user with a notification or a warning and waits for a response. Type selects which of the two it is. It has no trigger of its own and is not anchored to one — the parent decides when it is open. Use Tooltip for a short hint attached to a trigger. Escape does not dismiss it — only Cancel/Confirm can, since it's asking the user to explicitly decide.",
        story:
          "Canvas uses a demo-only local-state wrapper so the trigger button works in isolation. The code below is what a real page writes — see docs/components/popover.md.",
      },
      source: {
        type: "code",
        code: `<Popover
  type="notification"
  open={open}
  onOpenChange={setOpen}
  title="Heading to 'Content Studio' to create your post?"
  description="Exit this page and start creating a post in 'Content Studio'."
  onCancel={() => {}}
  onConfirm={() => {}}
/>`,
      },
    },
    design: {
      type: "figma",
      url: FIGMA_URL,
    },
  },
  argTypes: {
    type: {
      control: "radio",
      options: ["notification", "warning"],
    },
    title: { control: "text" },
    description: { control: "text" },
    checkboxLabel: { control: "text" },
    showButton: { control: "boolean" },
    cancelLabel: { control: "text" },
    confirmLabel: { control: "text" },
  },
  args: {
    type: "notification",
    title: "Heading to 'Content Studio' to create your post?",
    description:
      "Exit this page and start creating a post in 'Content Studio'.",
    checkbox: false,
    checkboxLabel: "Do not ask again.",
    showButton: true,
    open: true,
    onOpenChange: fn(),
    onCancel: fn(),
    onConfirm: fn(),
    onCheckedChange: fn(),
  },
  render: (args) => <PopoverDemo {...args} />,
} satisfies Meta<typeof Popover>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const DoesNotCloseOnEscape: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Pressing Escape leaves it open — only Cancel or Confirm dismisses it.",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.ownerDocument.body);
    await canvas.findByRole("alertdialog");

    await userEvent.keyboard("{Escape}");
    await canvas.findByRole("alertdialog");
  },
};
