import * as React from "react";

import type {
  ContentPillar,
  ContentRatio,
  PostingFrequencyUnit,
} from "@/components/screens/content-studio/ui/ContentGoalForm";
import type { PersonalityTrait } from "@/components/screens/content-studio/ui/ToneOfVoiceForm";

export interface SelfOption {
  value: string;
  label: string;
  image: string;
}

export const SELF_OPTIONS: SelfOption[] = [
  {
    value: "data-scientist",
    label: "Data Scientist",
    image: "/images/personas/self-default.jpg",
  },
  {
    value: "team-leader",
    label: "Team Leader",
    image: "/images/personas/team-leader.jpg",
  },
  {
    value: "entrepreneur",
    label: "Entrepreneur",
    image: "/images/personas/entrepreneur.jpg",
  },
  {
    value: "fashion-editor",
    label: "Fashion Editor",
    image: "/images/personas/fashion-editor.jpg",
  },
  {
    value: "fashionista",
    label: "Fashionista",
    image: "/images/personas/fashionista.jpg",
  },
  {
    value: "novelist",
    label: "English Novelist",
    image: "/images/personas/novelist.jpg",
  },
  {
    value: "vegan-chef",
    label: "Vegan Chef",
    image: "/images/personas/vegan-chef.jpg",
  },
  {
    value: "yoga-meditator",
    label: "Yoga Meditator",
    image: "/images/personas/yoga-meditator.jpg",
  },
];

export interface SelfGoal {
  now: string;
  next: string;
}

let goalsBySelf: Record<string, SelfGoal> = {
  "data-scientist": {
    now: "4 years in finance, 3 in data science — forecasting Finance teams trust.",
    next: "I'm known for Finance-Fluent Modeling Partner for early-stage SaaS founders.",
  },
  "team-leader": {
    now: "6 years leading cross-functional teams — turning scattered priorities into shipped roadmaps.",
    next: "I'm known for the Project Lead who ships messy roadmaps on time.",
  },
  entrepreneur: {
    now: "2 exits, 1 ongoing raise — building in public with investors watching.",
    next: "I'm known for the Solo Founder scaling a seed-stage SaaS from zero.",
  },
  "fashion-editor": {
    now: "8 years at print and digital fashion desks — spotting trends before they trend.",
    next: "I'm known for the Editor curating runway-to-retail style stories.",
  },
  fashionista: {
    now: "Styling everyday outfits with a thrifted, high-low mix.",
    next: "I'm known for the Stylist making secondhand look designer.",
  },
  novelist: {
    now: "3 published novels — writing slow mornings and quiet character studies.",
    next: "I'm known for the Novelist behind quiet, character-driven fiction.",
  },
  "vegan-chef": {
    now: "Plant-based recipes tested in a tiny apartment kitchen.",
    next: "I'm known for the Chef turning pantry staples into weeknight vegan meals.",
  },
  "yoga-meditator": {
    now: "200-hour certified — guiding breathwork for beginners.",
    next: "I'm known for the Teacher making meditation feel approachable.",
  },
};

const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

function subscribe(onStoreChange: () => void) {
  listeners.add(onStoreChange);
  return () => listeners.delete(onStoreChange);
}

export function getSelfGoal(self: string): SelfGoal | undefined {
  return goalsBySelf[self];
}

export function setSelfGoal(self: string, goal: SelfGoal) {
  goalsBySelf = { ...goalsBySelf, [self]: goal };
  emit();
}

export function useSelfGoal(self: string): SelfGoal | undefined {
  return React.useSyncExternalStore(
    subscribe,
    () => goalsBySelf[self],
    () => goalsBySelf[self],
  );
}

export function getSelfLabel(self: string): string {
  return SELF_OPTIONS.find((option) => option.value === self)?.label ?? self;
}

export function getSelfImage(self: string): string | undefined {
  return SELF_OPTIONS.find((option) => option.value === self)?.image;
}

export interface ContentGoalData {
  contentGoal: string;
  pillars: ContentPillar[];
  ratio: ContentRatio;
  postingCount: number;
  postingFrequencyUnit: PostingFrequencyUnit;
}

let contentGoalsBySelf: Record<string, ContentGoalData> = {};

const contentGoalListeners = new Set<() => void>();

function emitContentGoal() {
  contentGoalListeners.forEach((listener) => listener());
}

function subscribeContentGoal(onStoreChange: () => void) {
  contentGoalListeners.add(onStoreChange);
  return () => contentGoalListeners.delete(onStoreChange);
}

export function getContentGoal(self: string): ContentGoalData | undefined {
  return contentGoalsBySelf[self];
}

export function setContentGoal(self: string, data: ContentGoalData) {
  contentGoalsBySelf = { ...contentGoalsBySelf, [self]: data };
  emitContentGoal();
}

export function useContentGoal(self: string): ContentGoalData | undefined {
  return React.useSyncExternalStore(
    subscribeContentGoal,
    () => contentGoalsBySelf[self],
    () => contentGoalsBySelf[self],
  );
}

export interface ToneOfVoiceData {
  traits: PersonalityTrait[];
  referenceLink: string;
  referenceText: string;
  referenceFileName: string;
}

let toneOfVoicesBySelf: Record<string, ToneOfVoiceData> = {};

const toneOfVoiceListeners = new Set<() => void>();

function emitToneOfVoice() {
  toneOfVoiceListeners.forEach((listener) => listener());
}

function subscribeToneOfVoice(onStoreChange: () => void) {
  toneOfVoiceListeners.add(onStoreChange);
  return () => toneOfVoiceListeners.delete(onStoreChange);
}

export function getToneOfVoice(self: string): ToneOfVoiceData | undefined {
  return toneOfVoicesBySelf[self];
}

export function setToneOfVoice(self: string, data: ToneOfVoiceData) {
  toneOfVoicesBySelf = { ...toneOfVoicesBySelf, [self]: data };
  emitToneOfVoice();
}

export function useToneOfVoice(self: string): ToneOfVoiceData | undefined {
  return React.useSyncExternalStore(
    subscribeToneOfVoice,
    () => toneOfVoicesBySelf[self],
    () => toneOfVoicesBySelf[self],
  );
}
