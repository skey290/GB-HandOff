import * as React from "react";
import type { Meta, StoryObj } from "@storybook/nextjs";
import { fn } from "storybook/test";
import { Eraser, Replace, Trash2 } from "lucide-react";
import { useDarkMode } from "storybook-dark-mode";

import {
  AssetGalleryCard,
  type AssetGalleryCardMenuOption,
} from "./asset-gallery-card";

const FIGMA_URL =
  "https://www.figma.com/design/Wp6AZNGqC4qf2Sz5zQ2PzQ/%F0%9F%93%8C-GB_UXUI--261002-?node-id=8012-10389";

const MENU_OPTIONS: AssetGalleryCardMenuOption[] = [
  {
    value: "set-as-main-portrait",
    label: "Set as main Portrait",
    icon: Replace,
  },
  {
    value: "edit-profile-portrait",
    label: "Edit Profile Portrait",
    icon: Eraser,
  },
  {
    value: "delete-self-portrait",
    label: "Delete Self Portrait",
    icon: Trash2,
  },
];

interface AssetGalleryCardPlaygroundProps {
  type:
    | "default"
    | "selectable"
    | "style card"
    | "style card compact"
    | "empty"
    | "empty (open dialog)"
    | "empty (compact)"
    | "removable"
    | "removable (compact)";
  image: string;
  alt: string;
  date: string;
  isMainPortrait: boolean;
  title: string;
  description: string;
  emptyLabel: string;
  isSelected: boolean;
  onUpload: (file: File) => void;
  onEmptyClick: () => void;
  onRemove: () => void;
  onSelectMenuOption: (value: string) => void;
  onSelectedChange: (selected: boolean) => void;
}

function ThemedCanvas({ children }: { children: React.ReactNode }) {
  const isDark = useDarkMode();
  return (
    <div
      className={`${isDark ? "dark" : "light"} flex items-start justify-center bg-[var(--gb-background-default)] p-[var(--gb-spacing-4)]`}
    >
      {children}
    </div>
  );
}

function AssetGalleryCardPlayground({
  type,
  image,
  alt,
  date,
  isMainPortrait,
  title,
  description,
  emptyLabel,
  isSelected,
  onUpload,
  onEmptyClick,
  onRemove,
  onSelectMenuOption,
  onSelectedChange,
}: AssetGalleryCardPlaygroundProps) {
  const [selected, setSelected] = React.useState(isSelected);
  const isStyleCard = type === "style card" || type === "style card compact";
  const isEmpty =
    type === "empty" ||
    type === "empty (open dialog)" ||
    type === "empty (compact)";
  const isRemovable = type === "removable" || type === "removable (compact)";
  const isCompact =
    type === "style card compact" ||
    type === "empty (compact)" ||
    type === "removable (compact)";

  return (
    <AssetGalleryCard
      image={isEmpty ? undefined : image}
      alt={alt}
      date={type === "default" ? date : undefined}
      isMainPortrait={type === "default" ? isMainPortrait : undefined}
      onUpload={onUpload}
      emptyLabel={emptyLabel}
      onEmptyClick={type === "empty (open dialog)" ? onEmptyClick : undefined}
      onRemove={isRemovable ? onRemove : undefined}
      menuOptions={type === "default" ? MENU_OPTIONS : undefined}
      onSelectMenuOption={onSelectMenuOption}
      title={isStyleCard ? title : undefined}
      description={type === "style card" ? description : undefined}
      isCompact={isCompact}
      isSelected={type === "selectable" || isStyleCard ? selected : undefined}
      onSelectedChange={(next) => {
        setSelected(next);
        onSelectedChange(next);
      }}
    />
  );
}

const meta = {
  title: "App/AssetGalleryCard",
  component: AssetGalleryCardPlayground,
  tags: ["autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: FIGMA_URL,
    },
    docs: {
      description: {
        component:
          "AssetGalleryCard has no `type` prop — which look (empty/default/selectable/style card/style card compact/removable) renders is derived from which props are given. See docs/components/asset-gallery-card.md for the full prop reference.",
        story:
          "Canvas uses a demo-only local-state wrapper (plus a story-only `type` arg that doesn't exist on the component) so the checkbox toggles in isolation. The code below is what a real page writes for each look.",
      },
      source: {
        type: "code",
        code: `// Default filled card with a date and a "..." menu
<AssetGalleryCard
  image={asset.url}
  alt={asset.alt}
  date={asset.date}
  menuOptions={MENU_OPTIONS}
  onSelectMenuOption={(value) => handleMenuAction(value)}
/>

// Self Portrait grid — "Main" badge marks the self's current main portrait
<AssetGalleryCard
  image={asset.url}
  alt={asset.alt}
  date={asset.date}
  isMainPortrait={asset.src === mainPortraitSrc}
  menuOptions={MENU_OPTIONS}
  onSelectMenuOption={(value) => handleMenuAction(value)}
/>

// Selectable card
<AssetGalleryCard
  image={asset.url}
  alt={asset.alt}
  isSelected={selected}
  onSelectedChange={setSelected}
/>

// Style card compact — a radiogroup of mutually exclusive options
<div role="radiogroup" aria-label="Image style">
  {options.map((option) => (
    <AssetGalleryCard
      key={option.id}
      image={option.thumbnailSrc}
      title={option.label}
      isCompact
      selectionRole="radio"
      isSelected={selectedId === option.id}
      onSelectedChange={() => setSelectedId(option.id)}
    />
  ))}
</div>

// Empty card that opens a picker dialog instead of a native file input
<AssetGalleryCard
  emptyLabel="Add Reference"
  onEmptyClick={() => setDialogOpen(true)}
/>

// Compact icon-only empty card (no emptyLabel text) + compact removable thumbnails
<div style={{ display: "flex", gap: "var(--gb-spacing-2)" }}>
  {images.map((src, index) => (
    <AssetGalleryCard
      key={src}
      image={src}
      isCompact
      onRemove={() => removeImage(index)}
    />
  ))}
  <AssetGalleryCard isCompact onEmptyClick={() => setDialogOpen(true)} />
</div>`,
      },
    },
  },
  decorators: [
    (Story) => (
      <ThemedCanvas>
        <Story />
      </ThemedCanvas>
    ),
  ],
  // isSelected seeds local toggle state on mount, so remount when the control changes it.
  render: (args) => (
    <AssetGalleryCardPlayground key={String(args.isSelected)} {...args} />
  ),
  argTypes: {
    type: {
      control: "select",
      options: [
        "default",
        "selectable",
        "style card",
        "style card compact",
        "empty",
        "empty (open dialog)",
        "empty (compact)",
        "removable",
        "removable (compact)",
      ],
    },
    image: { control: "text" },
    alt: { control: "text" },
    date: { control: "text" },
    isMainPortrait: { control: "boolean" },
    title: { control: "text" },
    description: { control: "text" },
    emptyLabel: { control: "text" },
    isSelected: { control: "boolean" },
  },
  args: {
    type: "default",
    image: "/images/personas/self-default.jpg",
    alt: "Uploaded reference",
    date: "2025.05.17",
    isMainPortrait: false,
    title: "Deep Chroma",
    description: "Baroque-inspired chiaroscuro",
    emptyLabel: "Upload Your Image",
    isSelected: false,
    onUpload: fn(),
    onEmptyClick: fn(),
    onRemove: fn(),
    onSelectMenuOption: fn(),
    onSelectedChange: fn(),
  },
} satisfies Meta<typeof AssetGalleryCardPlayground>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
