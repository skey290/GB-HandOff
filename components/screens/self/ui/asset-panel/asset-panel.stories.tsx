import type { Meta, StoryObj } from "@storybook/nextjs";
import { fn } from "storybook/test";

import { AssetPanel, type AssetPanelSelfProfile } from "./asset-panel";

const FIGMA_URL =
  "https://www.figma.com/design/Wp6AZNGqC4qf2Sz5zQ2PzQ/%F0%9F%93%8C-GB_UXUI--261002-?node-id=8612-89563";

const DEMO_SELF: AssetPanelSelfProfile = {
  id: "self-default",
  role: "Data Scientist",
  image: "/images/personas/self-default.jpg",
  description:
    "4 years in finance, 3 in data science — forecasting Finance teams trust.",
  knownForNow:
    "I'm known for Finance-Fluent Modeling Partner for early-stage SaaS founders.",
  knownForNext:
    "I'm known for Finance-Fluent Modeling Partner for early-stage SaaS founders.",
  postingCount: 3,
  postingFrequency: "Day",
  targetedFollowersIndex: 1,
  timeframe: "1 year",
  goalActions: [
    {
      id: "goal-1",
      category: "Content Studio",
      label: "Plan a content series for your next goal",
    },
    {
      id: "goal-2",
      category: "Self",
      label: "Create assets for your target persona",
    },
    {
      id: "goal-3",
      category: "Compass",
      label: "Set a growth milestone",
    },
  ],
};

interface AssetPanelPlaygroundProps {
  role: string;
  description: string;
}

function AssetPanelPlayground({
  role,
  description,
}: AssetPanelPlaygroundProps) {
  return (
    <AssetPanel
      self={{ ...DEMO_SELF, role, description }}
      onCreateContents={fn()}
      onEditSelfPortrait={fn()}
      onGoToAssetGallery={fn()}
      onEditGoal={fn()}
    />
  );
}

const meta = {
  title: "Self/UI/AssetPanel",
  component: AssetPanelPlayground,
  tags: ["autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: FIGMA_URL,
    },
  },
  decorators: [
    (Story) => (
      <div className="dark flex h-[961px] items-start justify-center bg-[var(--gb-background-default)]">
        <Story />
      </div>
    ),
  ],
  argTypes: {
    role: { control: "text" },
    description: { control: "text" },
  },
  args: {
    role: DEMO_SELF.role,
    description: DEMO_SELF.description,
  },
} satisfies Meta<typeof AssetPanelPlayground>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
