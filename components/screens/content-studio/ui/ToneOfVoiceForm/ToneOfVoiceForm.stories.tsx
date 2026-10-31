import type * as React from "react";
import type { Meta, StoryObj } from "@storybook/nextjs";
import { fn } from "storybook/test";

import {
  type PersonalityTrait,
  ToneOfVoiceForm,
  type ToneOfVoiceFormProps,
} from "./ToneOfVoiceForm";

/** Story-only: lets Controls switch between Figma's `Type=empty`/`Type=default` sample presets. */
interface PlaygroundProps extends ToneOfVoiceFormProps {
  preset?: "empty" | "default";
}

const FIGMA_URL =
  "https://www.figma.com/design/Wp6AZNGqC4qf2Sz5zQ2PzQ/%F0%9F%93%8C-GB_UXUI--261002-?node-id=8832-7608";

/** Mirrors Figma's two named instances (`Type=empty` 8832:7609 / `Type=default` 8832:7617) */
const PRESETS = {
  empty: {
    defaultReferenceLink: "",
    defaultReferenceText: "",
    defaultTraits: [] as PersonalityTrait[],
  },
  default: {
    defaultReferenceLink: "https://twitter.com/janedoe/status/1234567890",
    defaultReferenceText:
      'Pasted from LinkedIn: "5 financial models every pre-seed founder needs."',
    defaultTraits: ["Soft", "Warm"] as PersonalityTrait[],
  },
} as const;

const meta = {
  title: "ContentStudio/UI/ToneOfVoiceForm",
  component: ToneOfVoiceForm as unknown as React.ComponentType<PlaygroundProps>,
  tags: ["autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: FIGMA_URL,
    },
    docs: {
      description: {
        component:
          "Tone of Voice 편집 폼 — 모달 틀이 아니라 내용만 담은 패널. 실제 모달로 쓸 때는 GB-Review 레포의 components/review/shared/tone-of-voice-dialog.tsx가 Dialog로 감싼다.",
      },
    },
  },
  argTypes: {
    preset: {
      control: "radio",
      options: ["empty", "default"],
      description:
        "Figma `Type` — switches reference materials/personality traits between the empty and default sample states",
    },
    referenceFile: { table: { disable: true } },
    referenceLink: { table: { disable: true } },
    referenceText: { table: { disable: true } },
    traits: { table: { disable: true } },
    defaultReferenceLink: { table: { disable: true } },
    defaultReferenceText: { table: { disable: true } },
    defaultTraits: { table: { disable: true } },
  },
  args: {
    preset: "default",
    onClose: fn(),
    onReferenceFileChange: fn(),
    onReferenceLinkChange: fn(),
    onReferenceTextChange: fn(),
    onTraitsChange: fn(),
    onSave: fn(),
  },
  render: ({ preset = "default", ...args }) => (
    <ToneOfVoiceForm key={preset} {...args} {...PRESETS[preset]} />
  ),
} satisfies Meta<React.ComponentType<PlaygroundProps>>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
