import * as React from "react";
import type { Meta, StoryObj } from "@storybook/nextjs";
import { fn } from "storybook/test";

import { SelfCluster, SELF_SLOTS, type ClusterSelf } from "./self-cluster";

const FIGMA_URL =
  "https://www.figma.com/design/Wp6AZNGqC4qf2Sz5zQ2PzQ/%F0%9F%93%8C-GB_UXUI--261002-?node-id=8004-7827";

const DEMO_SELVES: Omit<ClusterSelf, "slotId">[] = [
  {
    id: "data-scientist",
    label: "Data Scientist",
    image: "/images/personas/self-default.jpg",
  },
  {
    id: "entrepreneur",
    label: "Entrepreneur",
    image: "/images/personas/entrepreneur.jpg",
  },
  {
    id: "fashionista",
    label: "Fashionista",
    image: "/images/personas/fashionista.jpg",
  },
  {
    id: "fashion-editor",
    label: "Fashion Editor",
    image: "/images/personas/fashion-editor.jpg",
  },
  {
    id: "team-leader",
    label: "Team Leader",
    image: "/images/personas/team-leader.jpg",
  },
  {
    id: "vegan-chef",
    label: "Vegan Chef",
    image: "/images/personas/vegan-chef.jpg",
  },
  {
    id: "yoga-meditator",
    label: "Yoga Meditator",
    image: "/images/personas/yoga-meditator.jpg",
  },
  {
    id: "novelist",
    label: "English Novelist",
    image: "/images/personas/novelist.jpg",
  },
];

interface SelfClusterPlaygroundProps {
  /** Number of filled Selves (clockwise from north) — covers Figma's `selfNumber` 0/1/8 examples */
  filledCount: number;
  /** Index of the Self to show the corner bracket (status="selected") on. -1 means no selection */
  selectedIndex: number;
}

// Keeps selection state locally so Storybook can immediately show the
// selected bracket actually move when a thumbnail is clicked — reset via
// `key` when a control changes.
function SelfClusterDemo({
  filledCount,
  selectedIndex,
}: SelfClusterPlaygroundProps) {
  const selves: ClusterSelf[] = DEMO_SELVES.slice(0, filledCount).map(
    (self, index) => ({ ...self, slotId: SELF_SLOTS[index]!.id }),
  );
  const [selectedSelfId, setSelectedSelfId] = React.useState(
    selves[selectedIndex]?.id,
  );

  return (
    <SelfCluster
      selves={selves}
      selectedSelfId={selectedSelfId}
      onAddSelf={fn()}
      onSelectSelf={(self) => setSelectedSelfId(self.id)}
      getSelfMenuActions={() => [
        { label: "Create a Post", onSelect: fn() },
        { label: "Go to Asset Gallery", onSelect: fn() },
        { label: "Move to Archive", onSelect: fn() },
        { label: "Edit Goal", onSelect: fn() },
      ]}
    />
  );
}

function SelfClusterPlayground(props: SelfClusterPlaygroundProps) {
  return (
    <SelfClusterDemo
      key={`${props.filledCount}-${props.selectedIndex}`}
      {...props}
    />
  );
}

const meta = {
  title: "Self/UI/SelfCluster",
  component: SelfClusterPlayground,
  tags: ["autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: FIGMA_URL,
    },
  },
  decorators: [
    (Story) => (
      <div className="dark flex items-center justify-center bg-[var(--gb-background-default)] p-[var(--gb-spacing-10)]">
        <Story />
      </div>
    ),
  ],
  argTypes: {
    filledCount: {
      control: { type: "range", min: 0, max: 8, step: 1 },
    },
    selectedIndex: {
      control: { type: "range", min: -1, max: 7, step: 1 },
    },
  },
  args: {
    filledCount: 1,
    selectedIndex: 0,
  },
} satisfies Meta<typeof SelfClusterPlayground>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
