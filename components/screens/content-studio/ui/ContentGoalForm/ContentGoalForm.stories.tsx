import type * as React from "react";
import type { Meta, StoryObj } from "@storybook/nextjs";
import { fn } from "storybook/test";

import {
  ContentGoalForm,
  type ContentGoalFormProps,
  type ContentPillar,
  type ContentRatio,
} from "./ContentGoalForm";

/** Story-only: lets Controls switch between Figma's `Type=empty`/`Type=default` sample presets. */
interface PlaygroundProps extends ContentGoalFormProps {
  preset?: "empty" | "default";
}

const FIGMA_URL =
  "https://www.figma.com/design/Wp6AZNGqC4qf2Sz5zQ2PzQ/%F0%9F%93%8C-GB_UXUI--261002-?node-id=8832-7591";

/** Mirrors Figma's two named instances (`Type=empty` 8832:7592 / `Type=default` 8832:7600) */
const PRESETS = {
  empty: {
    defaultContentGoal: "",
    defaultPillars: [] as ContentPillar[],
    defaultRatio: undefined as ContentRatio | undefined,
    defaultPostingCount: 3,
    defaultPostingFrequencyUnit: "Week",
  },
  default: {
    defaultContentGoal: "",
    defaultPillars: ["Thought Leadership", "Case Study"] as ContentPillar[],
    defaultRatio: "Balanced" as ContentRatio,
    defaultPostingCount: 3,
    defaultPostingFrequencyUnit: "Week",
  },
} as const;

const meta = {
  title: "ContentStudio/UI/ContentGoalForm",
  component: ContentGoalForm as unknown as React.ComponentType<PlaygroundProps>,
  tags: ["autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: FIGMA_URL,
    },
    docs: {
      description: {
        component:
          "Content Goal/Strategy 편집 폼 — 모달 틀이 아니라 내용만 담은 패널. 실제 모달로 쓸 때는 GB-Review 레포의 components/review/shared/content-goal-dialog.tsx가 Dialog로 감싼다.",
      },
    },
  },
  argTypes: {
    preset: {
      control: "radio",
      options: ["empty", "default"],
      description:
        "Figma `Type` — switches Content pillars/ratio between the empty and default sample states",
    },
    contentGoal: { table: { disable: true } },
    pillars: { table: { disable: true } },
    ratio: { table: { disable: true } },
    postingCount: { table: { disable: true } },
    postingFrequencyUnit: { table: { disable: true } },
    defaultContentGoal: { table: { disable: true } },
    defaultPillars: { table: { disable: true } },
    defaultRatio: { table: { disable: true } },
    defaultPostingCount: { control: { type: "number", min: 1 } },
    defaultPostingFrequencyUnit: {
      control: "radio",
      options: ["Day", "Week", "Month"],
    },
  },
  args: {
    preset: "default",
    onClose: fn(),
    onContentGoalChange: fn(),
    onPillarsChange: fn(),
    onRatioChange: fn(),
    onPostingCountChange: fn(),
    onPostingFrequencyUnitChange: fn(),
    onSave: fn(),
  },
  render: ({ preset = "default", ...args }) => (
    <ContentGoalForm key={preset} {...args} {...PRESETS[preset]} />
  ),
} satisfies Meta<React.ComponentType<PlaygroundProps>>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
