import type * as React from "react";
import type { Meta, StoryObj } from "@storybook/nextjs";
import { fn } from "storybook/test";

import { GoalSetting, type GoalSettingAction } from "./goal-setting";

/** Story-only: lets Controls switch between Figma's `Type=empty`/`Type=default` sample-text presets. Unrelated to the component's own `type` prop (Part/Goal's `editable`/`default`). */
interface PlaygroundProps extends React.ComponentProps<typeof GoalSetting> {
  preset?: "empty" | "default";
}

const FIGMA_URL =
  "https://www.figma.com/design/Wp6AZNGqC4qf2Sz5zQ2PzQ/%F0%9F%93%8C-GB_UXUI--261002-?node-id=8234-99895";

/** Mirrors Figma's two named instances (`Type=empty` / `Type=default`) */
const PRESETS = {
  empty: { defaultSelfName: "", defaultNow: "", defaultGoal: "" },
  default: {
    defaultSelfName: "Data Scientist",
    defaultNow:
      "I'm known for financial modeling and data analysis in early-stage startups.",
    defaultGoal:
      "I'm known for Finance-Fluent Modeling Partner for early-stage SaaS founders.",
  },
} as const;

const GOAL_ACTIONS: GoalSettingAction[] = [
  {
    id: "assets-pitch-deck",
    category: "Self",
    label: "Create a pitch deck in Self",
  },
  {
    id: "assets-1-pager",
    category: "Self",
    label: "Build your 1-pager site in Self",
  },
  {
    id: "content-studio-podcasts",
    category: "Content Studio",
    label: "Reach out to 2 fintech podcasts",
  },
  {
    id: "assets-extra-1",
    category: "Self",
    label: "Update your investor FAQ",
  },
  {
    id: "assets-extra-2",
    category: "Self",
    label: "Refresh your case study metrics",
  },
];

const meta = {
  title: "App/GoalSetting",
  component: GoalSetting as unknown as React.ComponentType<PlaygroundProps>,
  tags: ["autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: FIGMA_URL,
    },
    docs: {
      description: {
        component:
          'Implemented as GoalSetting in components/app/goal-setting/goal-setting.tsx. "My goal" card with a Self Name section above a Known-for-Now / Known-for-Next pair, each an always-open Input/Textarea (no per-section edit toggle), plus a collapsible "Gabrielle suggests N actions" accordion per section. Known for Next additionally carries a settings sentence whose Frequency/Followers/Timeframe chips expand an inline panel (stepper+toggle / slider / toggle list). A single Save button at the bottom of the card commits the whole card — disabled until Self Name (when shown), Known for Now, and Known for Next are all filled. See docs/components/goal-setting.md.',
      },
    },
  },
  argTypes: {
    preset: {
      control: "radio",
      options: ["empty", "default"],
      description:
        "Figma `Type` — switches Now/Next between empty and filled sample text",
    },
    type: {
      control: "radio",
      options: ["editable", "default"],
      description:
        'Figma `Type` on Part/Goal — "default" renders Known for Now/Next as read-only text and disables the settings chips (used by the Asset panel)',
    },
    showSelfName: {
      control: "boolean",
      description:
        "Hides the Self Name section entirely — set false when the self's name is already shown elsewhere right above this (e.g. the Asset panel's own title)",
    },
    defaultSelfName: { table: { disable: true } },
    defaultNow: { table: { disable: true } },
    defaultGoal: { table: { disable: true } },
    defaultPostingFrequency: {
      control: "radio",
      options: ["Day", "Week", "Month"],
    },
    defaultTimeframe: {
      control: "radio",
      options: ["1 month", "3 months", "6 months", "1 year"],
    },
    defaultTargetedFollowersIndex: {
      control: { type: "range", min: 0, max: 5, step: 1 },
    },
    defaultPostingCount: { control: { type: "number", min: 1 } },
  },
  args: {
    preset: "default",
    type: "editable",
    showSelfName: true,
    defaultPostingCount: 3,
    defaultPostingFrequency: "Day",
    defaultTargetedFollowersIndex: 1,
    defaultTimeframe: "1 year",
    goalActions: GOAL_ACTIONS,
    onClose: fn(),
    onSelfNameChange: fn(),
    onNowChange: fn(),
    onGoalChange: fn(),
    onPostingCountChange: fn(),
    onPostingFrequencyChange: fn(),
    onTargetedFollowersIndexChange: fn(),
    onTimeframeChange: fn(),
    onSave: fn(),
  },
  render: ({ preset = "default", ...args }) => (
    <GoalSetting key={preset} {...args} {...PRESETS[preset]} />
  ),
} satisfies Meta<React.ComponentType<PlaygroundProps>>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
