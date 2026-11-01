import * as React from "react";

import type {
  ContentPillar,
  ContentRatio,
  PostingFrequencyUnit,
} from "@/components/screens/content-studio/ui/ContentGoalForm";
import type { PersonalityTrait } from "@/components/screens/content-studio/ui/ToneOfVoiceForm";
import type {
  ScheduleSettingsPanelRepeatType,
  ScheduleTimeSlotsByRepeatType,
} from "@/components/screens/content-studio/ui/ScheduleSettingsPanel";

export interface SelfOption {
  value: string;
  label: string;
  image: string;
}

/** A Self's shared identity — id/label/image, kept in sync wherever a Self
 * is shown (Self app's cluster, Content Studio's profile switcher, …). Self
 * app's `ClusterSelf` adds its own `slotId` (cluster placement) on top of
 * this; nothing else needs it. */
export interface SelfIdentity {
  id: string;
  label: string;
  image: string;
}

// Seeded from Self app's actually-created selves (`INITIAL_SELVES` in
// app/self/page.tsx) — the other demo personas (entrepreneur, fashion-editor,
// …) aren't real selves yet, they're just the template pool Self app's "+"
// consumes to create one. Label "Office Worker" (not "Team Leader") matches
// Self app's real value for id "team-leader".
let selfIdentities: SelfIdentity[] = [
  {
    id: "self-default",
    label: "Data Scientist",
    image: "/images/personas/self-default.jpg",
  },
  {
    id: "team-leader",
    label: "Office Worker",
    image: "/images/personas/team-leader.jpg",
  },
];

const selfIdentityListeners = new Set<() => void>();

function emitSelfIdentities() {
  selfIdentityListeners.forEach((listener) => listener());
}

function subscribeSelfIdentities(onStoreChange: () => void) {
  selfIdentityListeners.add(onStoreChange);
  return () => selfIdentityListeners.delete(onStoreChange);
}

export function getSelfIdentities(): SelfIdentity[] {
  return selfIdentities;
}

export function setSelfIdentities(next: SelfIdentity[]) {
  selfIdentities = next;
  emitSelfIdentities();
}

export function useSelfIdentities(): SelfIdentity[] {
  return React.useSyncExternalStore(
    subscribeSelfIdentities,
    () => selfIdentities,
    () => selfIdentities,
  );
}

// Which self is currently selected — shared so picking a self in one app
// (Self app's canvas, Content Studio's ProfileCard) carries over as the
// other app's default selection too, instead of each page defaulting back
// to "self-default" independently.
let activeSelfId = "self-default";

const activeSelfIdListeners = new Set<() => void>();

function emitActiveSelfId() {
  activeSelfIdListeners.forEach((listener) => listener());
}

function subscribeActiveSelfId(onStoreChange: () => void) {
  activeSelfIdListeners.add(onStoreChange);
  return () => activeSelfIdListeners.delete(onStoreChange);
}

export function getActiveSelfId(): string {
  return activeSelfId;
}

export function setActiveSelfId(next: string) {
  activeSelfId = next;
  emitActiveSelfId();
}

export function useActiveSelfId(): string {
  return React.useSyncExternalStore(
    subscribeActiveSelfId,
    () => activeSelfId,
    () => activeSelfId,
  );
}

export interface SelfGoal {
  now: string;
  next: string;
}

let goalsBySelf: Record<string, SelfGoal> = {
  "self-default": {
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

/** Removes a Self's goal entirely (vs. setting empty strings) — so a later
 * self reusing the same id falls back to its own fresh defaults instead of
 * inheriting stale "" text. Used when rolling back a cancelled/archived self. */
export function clearSelfGoal(self: string) {
  const { [self]: _removed, ...rest } = goalsBySelf;
  goalsBySelf = rest;
  emit();
}

export function useSelfGoal(self: string): SelfGoal | undefined {
  return React.useSyncExternalStore(
    subscribe,
    () => goalsBySelf[self],
    () => goalsBySelf[self],
  );
}

/** Subscribes to every Self's goal at once — for a consumer (like Self app)
 * that reads whichever self id a user picks at render time, rather than one
 * fixed id like `useSelfGoal` expects. */
export function useAllSelfGoals(): Record<string, SelfGoal> {
  return React.useSyncExternalStore(
    subscribe,
    () => goalsBySelf,
    () => goalsBySelf,
  );
}

export function getSelfLabel(self: string): string {
  return selfIdentities.find((identity) => identity.id === self)?.label ?? self;
}

export function getSelfImage(self: string): string | undefined {
  return selfIdentities.find((identity) => identity.id === self)?.image;
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

/** Same reasoning as `useAllSelfGoals` — subscribes to every Self's Content
 * Goal at once for a consumer that reads whichever self id is picked at
 * render time. */
export function useAllContentGoals(): Record<string, ContentGoalData> {
  return React.useSyncExternalStore(
    subscribeContentGoal,
    () => contentGoalsBySelf,
    () => contentGoalsBySelf,
  );
}

/** Mirrors `clearSelfGoal` — removes the entry entirely so a later self
 * reusing the same id doesn't inherit stale posting frequency. */
export function clearContentGoal(self: string) {
  const { [self]: _removed, ...rest } = contentGoalsBySelf;
  contentGoalsBySelf = rest;
  emitContentGoal();
}

/** Content Studio's Schedule Settings panel (repeat type/weekdays/day-of-month/
 * every-N/time slots) — shared so Self app's posting-frequency edits can derive
 * and push a schedule here too, the same way Content Studio's own Self Goal/
 * Content Goal saves already do (see `deriveScheduleFromFrequency`). */
export interface ScheduleSettingsData {
  repeatType: ScheduleSettingsPanelRepeatType;
  selectedWeekdays: string[];
  dayOfMonth: string;
  everyCount: string;
  everyUnit: string;
  timeSlotsByType: ScheduleTimeSlotsByRepeatType;
}

let scheduleSettingsBySelf: Record<string, ScheduleSettingsData> = {};

const scheduleSettingsListeners = new Set<() => void>();

function emitScheduleSettings() {
  scheduleSettingsListeners.forEach((listener) => listener());
}

function subscribeScheduleSettings(onStoreChange: () => void) {
  scheduleSettingsListeners.add(onStoreChange);
  return () => scheduleSettingsListeners.delete(onStoreChange);
}

export function getScheduleSettings(
  self: string,
): ScheduleSettingsData | undefined {
  return scheduleSettingsBySelf[self];
}

export function setScheduleSettings(
  self: string,
  update:
    | ScheduleSettingsData
    | ((prev: ScheduleSettingsData | undefined) => ScheduleSettingsData),
) {
  const next =
    typeof update === "function"
      ? update(scheduleSettingsBySelf[self])
      : update;
  scheduleSettingsBySelf = { ...scheduleSettingsBySelf, [self]: next };
  emitScheduleSettings();
}

export function useScheduleSettings(
  self: string,
): ScheduleSettingsData | undefined {
  return React.useSyncExternalStore(
    subscribeScheduleSettings,
    () => scheduleSettingsBySelf[self],
    () => scheduleSettingsBySelf[self],
  );
}

export function useAllScheduleSettings(): Record<string, ScheduleSettingsData> {
  return React.useSyncExternalStore(
    subscribeScheduleSettings,
    () => scheduleSettingsBySelf,
    () => scheduleSettingsBySelf,
  );
}

export function clearScheduleSettings(self: string) {
  const { [self]: _removed, ...rest } = scheduleSettingsBySelf;
  scheduleSettingsBySelf = rest;
  emitScheduleSettings();
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
