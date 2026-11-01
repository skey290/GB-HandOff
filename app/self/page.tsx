"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Blocks, Compass, Home, Trash2, UserRoundSearch } from "lucide-react";

import { cn } from "@/lib/utils";
import { createSpriteIcon } from "@/lib/sprite-icon";
import { Gnb, type GnbItem } from "@/components/app/gnb";
import { ButtonGroup } from "@/components/ui/button-group";
import {
  SelfCluster,
  type ClusterSelf,
  type SelfMenuAction,
} from "@/components/screens/self/ui/self-cluster";
import { Popover } from "@/components/ui/popover";
import { Icon } from "@/lib/sprite-icon";
import {
  GoalEditDialog,
  useSelfIdentities,
  setSelfIdentities,
  useActiveSelfId,
  setActiveSelfId,
  getSelfGoal,
  setSelfGoal,
  clearSelfGoal,
  useAllSelfGoals,
  getContentGoal,
  setContentGoal,
  clearContentGoal,
  useAllContentGoals,
  getScheduleSettings,
  setScheduleSettings,
  clearScheduleSettings,
  useAllScheduleSettings,
} from "@/components/app/goal-setting";
import { deriveScheduleFromFrequency } from "@/components/screens/content-studio/data";
import type {
  ScheduleTimeSlotValue,
  ScheduleTimeSlotsByRepeatType,
} from "@/components/screens/content-studio/ui/ScheduleSettingsPanel";
import {
  AssetGalleryDialog,
  type AssetGalleryPortraitImage,
} from "@/components/app/asset-gallery-dialog";
import {
  addArchivedImage,
  clearArchivedImages,
  removeArchivedImage,
} from "@/lib/archived-asset-store";
import {
  AssetPanel,
  type AssetPanelSelfProfile,
} from "@/components/screens/self/ui/asset-panel";
import type {
  ContentGoalData,
  GoalPostingFrequency,
  GoalSettingAction,
  GoalTimeframe,
} from "@/components/app/goal-setting";

const AssetIcon = createSpriteIcon("asset-icon");

const GNB_ITEMS: GnbItem[] = [
  { id: "dashboard", icon: Home, label: "Dashboard" },
  { id: "assets", icon: AssetIcon, label: "Self" },
  { id: "compass", icon: Compass, label: "Compass" },
  { id: "contents-studio", icon: Blocks, label: "Content Studio" },
  { id: "know-thyself", icon: UserRoundSearch, label: "Know Thyself" },
];

// Dashboard/Know Thyself have no production route yet — only navigate where
// a real page exists.
const GNB_PATHS: Record<string, string> = {
  assets: "/self",
  "contents-studio": "/content-studio",
};

interface PersonaDefinition extends Omit<ClusterSelf, "slotId"> {
  description: string;
  knownForNow: string;
  knownForNext: string;
  postingCount: number;
  postingFrequency: GoalPostingFrequency;
  targetedFollowersIndex: number;
  timeframe: GoalTimeframe;
  goalActions: GoalSettingAction[];
}

/** User-edited Goal fields for a Self, layered on top of its PERSONA_POOL defaults
 * (Create Self / Edit Goal both write here). Known for Now/Next live in the shared
 * `goalsBySelf` store, and posting count/frequency live in the shared
 * `contentGoalsBySelf` store (both self-goal-data.ts) — those are the single
 * sources Content Studio also reads/writes, so editing either field in either
 * app shows up in both. */
interface GoalOverride {
  targetedFollowersIndex: number;
  timeframe: GoalTimeframe;
}

function formatAssetDate(date: Date) {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}.${pad(date.getMonth() + 1)}.${pad(date.getDate())}`;
}

function buildGoalActions(id: string): GoalSettingAction[] {
  return [
    {
      id: `${id}-goal-1`,
      category: "Content Studio",
      label: "Plan a content series for your next goal",
    },
    {
      id: `${id}-goal-2`,
      category: "Self",
      label: "Create assets for your target persona",
    },
    {
      id: `${id}-goal-3`,
      category: "Compass",
      label: "Set a growth milestone",
    },
    {
      id: `${id}-goal-4`,
      category: "Content Studio",
      label: "A/B test two captions",
    },
    {
      id: `${id}-goal-5`,
      category: "Self",
      label: "Build a reference moodboard",
    },
  ];
}

const PERSONA_POOL: PersonaDefinition[] = [
  {
    id: "self-default",
    label: "Data Scientist",
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
    goalActions: buildGoalActions("self-default"),
  },
  {
    id: "team-leader",
    label: "Office Worker",
    image: "/images/personas/team-leader.jpg",
    description:
      "6 years leading cross-functional teams — turning scattered priorities into shipped roadmaps.",
    knownForNow:
      "I'm known for the Project Lead who ships messy roadmaps on time.",
    knownForNext:
      "I'm known for the Project Lead who ships messy roadmaps on time.",
    postingCount: 2,
    postingFrequency: "Week",
    targetedFollowersIndex: 0,
    timeframe: "6 months",
    goalActions: buildGoalActions("team-leader"),
  },
  {
    id: "entrepreneur",
    label: "Entrepreneur",
    image: "/images/personas/entrepreneur.jpg",
    description:
      "2 exits, 1 ongoing raise — building in public with investors watching.",
    knownForNow:
      "I'm known for the Solo Founder scaling a seed-stage SaaS from zero.",
    knownForNext:
      "I'm known for the Solo Founder scaling a seed-stage SaaS from zero.",
    postingCount: 5,
    postingFrequency: "Day",
    targetedFollowersIndex: 2,
    timeframe: "3 months",
    goalActions: buildGoalActions("entrepreneur"),
  },
  {
    id: "fashion-editor",
    label: "Fashion Editor",
    image: "/images/personas/fashion-editor.jpg",
    description:
      "8 years at print and digital fashion desks — spotting trends before they trend.",
    knownForNow:
      "I'm known for the Editor curating runway-to-retail style stories.",
    knownForNext:
      "I'm known for the Editor curating runway-to-retail style stories.",
    postingCount: 4,
    postingFrequency: "Day",
    targetedFollowersIndex: 3,
    timeframe: "1 year",
    goalActions: buildGoalActions("fashion-editor"),
  },
  {
    id: "fashionista",
    label: "Fashionista",
    image: "/images/personas/fashionista.jpg",
    description: "Styling everyday outfits with a thrifted, high-low mix.",
    knownForNow: "I'm known for the Stylist making secondhand look designer.",
    knownForNext: "I'm known for the Stylist making secondhand look designer.",
    postingCount: 1,
    postingFrequency: "Day",
    targetedFollowersIndex: 1,
    timeframe: "6 months",
    goalActions: buildGoalActions("fashionista"),
  },
  {
    id: "novelist",
    label: "English Novelist",
    image: "/images/personas/novelist.jpg",
    description:
      "3 published novels — writing slow mornings and quiet character studies.",
    knownForNow:
      "I'm known for the Novelist behind quiet, character-driven fiction.",
    knownForNext:
      "I'm known for the Novelist behind quiet, character-driven fiction.",
    postingCount: 3,
    postingFrequency: "Week",
    targetedFollowersIndex: 0,
    timeframe: "1 year",
    goalActions: buildGoalActions("novelist"),
  },
  {
    id: "vegan-chef",
    label: "Vegan Chef",
    image: "/images/personas/vegan-chef.jpg",
    description: "Plant-based recipes tested in a tiny apartment kitchen.",
    knownForNow:
      "I'm known for the Chef turning pantry staples into weeknight vegan meals.",
    knownForNext:
      "I'm known for the Chef turning pantry staples into weeknight vegan meals.",
    postingCount: 5,
    postingFrequency: "Week",
    targetedFollowersIndex: 2,
    timeframe: "3 months",
    goalActions: buildGoalActions("vegan-chef"),
  },
  {
    id: "yoga-meditator",
    label: "Yoga Meditator",
    image: "/images/personas/yoga-meditator.jpg",
    description: "200-hour certified — guiding breathwork for beginners.",
    knownForNow:
      "I'm known for the Teacher making meditation feel approachable.",
    knownForNext:
      "I'm known for the Teacher making meditation feel approachable.",
    postingCount: 3,
    postingFrequency: "Day",
    targetedFollowersIndex: 1,
    timeframe: "1 year",
    goalActions: buildGoalActions("yoga-meditator"),
  },
];

const INITIAL_SELVES: ClusterSelf[] = [
  { ...PERSONA_POOL[0]!, slotId: "north" },
  { ...PERSONA_POOL[1]!, slotId: "north-east" },
];

// Cluster placement (slotId) has no meaning outside this page, so it isn't in
// the shared self-goal-data.ts store — but it still needs to survive this
// page's own remounts (Next.js remounts a route's page component on every
// navigation away and back). A plain useState would reset to this page's
// initial 2 selves each time, silently colliding a newly-created self back
// onto "north" — module-scope state (outside the component) persists across
// those remounts for as long as the tab stays open, same as the rest of
// self-goal-data.ts's stores.
let slotIdBySelfIdModuleState: Record<string, string> = Object.fromEntries(
  INITIAL_SELVES.map((self) => [self.id, self.slotId]),
);

// Mirrors Content Studio's own DEFAULT_SCHEDULE_* (app/content-studio/page.tsx)
// — the starting point `deriveScheduleFromFrequency` fills in around when this
// Self has no schedule of its own yet.
const DEFAULT_SCHEDULE_SELECTED_WEEKDAYS = ["tue", "wed", "thu"];
const DEFAULT_SCHEDULE_DAY_OF_MONTH = "";
const DEFAULT_SCHEDULE_EVERY_COUNT = "";
const DEFAULT_SCHEDULE_EVERY_UNIT = "days";
const DEFAULT_SCHEDULE_TIME_SLOTS: ScheduleTimeSlotValue[] = [
  { time: "10:00", period: "AM" },
  { time: "02:25", period: "PM" },
  { time: "09:00", period: "PM" },
];
const DEFAULT_SCHEDULE_TIME_SLOTS_BY_TYPE: ScheduleTimeSlotsByRepeatType = {
  daily: DEFAULT_SCHEDULE_TIME_SLOTS,
  weekly: DEFAULT_SCHEDULE_TIME_SLOTS,
  monthly: DEFAULT_SCHEDULE_TIME_SLOTS,
  custom: DEFAULT_SCHEDULE_TIME_SLOTS,
};

function DottedBackground() {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 z-0 opacity-[var(--gb-opacity-50)]",
        "bg-[var(--gb-color-neutral-950)]",
        "bg-[radial-gradient(circle,var(--gb-color-neutral-700)_1px,transparent_1px)]",
        "bg-[length:var(--gb-spacing-6)_var(--gb-spacing-6)]",
      )}
    />
  );
}

export default function AssetsPage() {
  const router = useRouter();
  const [gnbExpanded, setGnbExpanded] = React.useState(false);
  // Identity (id/label/image) lives in the shared store — synced with
  // Content Studio's profile switcher. `slotId` (cluster placement) has no
  // meaning outside this page, so it stays local, keyed by self id.
  const selfIdentities = useSelfIdentities();
  // Subscribes this page to every Self's shared goal — Content Studio writes
  // here too (self-goal-data.ts's `goalsBySelf`), so a plain `getSelfGoal()`
  // read below only ever shows fresh data because this hook forces a
  // re-render whenever that shared store changes.
  useAllSelfGoals();
  // Same reasoning, for posting count/frequency (self-goal-data.ts's
  // `contentGoalsBySelf` — the same store Content Studio's Content Goal uses).
  useAllContentGoals();
  const [slotIdBySelfId, setSlotIdBySelfIdState] = React.useState(
    () => slotIdBySelfIdModuleState,
  );
  const setSlotIdBySelfId = (
    update: React.SetStateAction<Record<string, string>>,
  ) => {
    setSlotIdBySelfIdState((prev) => {
      const next =
        typeof update === "function"
          ? (
              update as (prev: Record<string, string>) => Record<string, string>
            )(prev)
          : update;
      slotIdBySelfIdModuleState = next;
      return next;
    });
  };
  const selves: ClusterSelf[] = selfIdentities.map((identity) => ({
    ...identity,
    slotId: (slotIdBySelfId[identity.id] ?? "north") as ClusterSelf["slotId"],
  }));
  // Shared with Content Studio's ProfileCard selection — picking a self here
  // carries over as Content Studio's default selection, and vice versa.
  const activeSelfId = useActiveSelfId();
  const [pendingSlotId, setPendingSlotId] = React.useState<string | null>(null);
  // Known for Now/Next typed into the Create Self dialog, before that self exists yet —
  // reset whenever the dialog closes (saved or cancelled).
  const [pendingSelfName, setPendingSelfName] = React.useState("");
  const [pendingGoalNow, setPendingGoalNow] = React.useState("");
  const [pendingGoalGoal, setPendingGoalGoal] = React.useState("");
  // Per-self Goal edits layered over PERSONA_POOL's defaults — written by both the
  // Create Self and Edit Goal dialogs, since neither self's Goal data otherwise persists.
  const [goalOverridesBySelfId, setGoalOverridesBySelfId] = React.useState<
    Record<string, GoalOverride>
  >({});
  // "Move to Archive" 확인 팝업 대상 Self — Confirm 전까지는 실제 아카이브 처리를 하지 않는다.
  const [archivingSelf, setArchivingSelf] = React.useState<ClusterSelf | null>(
    null,
  );
  // 보관된 Self — 클러스터/활성 목록에선 빠지지만, Asset Gallery의 "for" 드롭다운에서는
  // 계속 선택해 자신의 보관 이미지를 볼 수 있도록 별도로 유지한다.
  const [archivedSelves, setArchivedSelves] = React.useState<ClusterSelf[]>([]);
  // 영구 삭제 확인 팝업 대상 — 보관된 Self 드롭다운 항목의 휴지통 아이콘을 눌렀을 때 설정된다.
  const [deletingArchivedSelfId, setDeletingArchivedSelfId] = React.useState<
    string | null
  >(null);
  // 이미지 확대 미리보기가 AssetPanel을 가리지 않고 캔버스 영역 안에서만 뜨도록, 그 컨테이너를 상태로 들고 있는다.
  const [canvasEl, setCanvasEl] = React.useState<HTMLDivElement | null>(null);
  // Edit Goal로 편집 중인 Self — GoalEditDialog(type=default)를 그 Self의 기존 입력값으로 채워서 연다.
  const [editingGoalSelfId, setEditingGoalSelfId] = React.useState<
    string | null
  >(null);
  // Asset Gallery 팝업 대상 Self — 더 이상 별도 라우트로 이동하지 않고 모달로 띄운다.
  const [galleryOpenForSelfId, setGalleryOpenForSelfId] = React.useState<
    string | null
  >(null);
  // Set by handleCreateContinue right after a new self is added — marks that
  // the Asset Gallery currently open is this self's creation flow, not just
  // an edit. Consumed (and the detail panel switched) once that dialog closes.
  const [creatingSelfId, setCreatingSelfId] = React.useState<string | null>(
    null,
  );
  // Shown when the Goal step of Create Self (not Edit Goal) is closed — the
  // Asset Gallery step's equivalent confirm lives inside AssetGalleryDialog
  // itself (see `isCreatingSelf`/`onCancelCreating`).
  const [cancelCreateConfirmOpen, setCancelCreateConfirmOpen] =
    React.useState(false);
  // Self Portrait로 직접 업로드/생성해 추가한 이미지 — selfId별로 쌓인다. 기존
  // 두 Self(Data Scientist/Office Worker)는 이미 완료된 데모 데이터라 자기
  // 이미지로 시드하고, 새로 만든 Self는 사용자가 업로드하기 전까지 빈 상태다.
  const [portraitImagesBySelfId, setPortraitImagesBySelfId] = React.useState<
    Record<string, AssetGalleryPortraitImage[]>
  >(() => ({
    [INITIAL_SELVES[0]!.id]: [
      {
        id: "seed",
        src: INITIAL_SELVES[0]!.image,
        alt: INITIAL_SELVES[0]!.label,
      },
    ],
    [INITIAL_SELVES[1]!.id]: [
      {
        id: "seed",
        src: INITIAL_SELVES[1]!.image,
        alt: INITIAL_SELVES[1]!.label,
      },
    ],
  }));
  // "My Reference" 이미지 — Self Portrait와 같은 이유로 selfId별로 분리 저장한다.
  const [referenceImagesBySelfId, setReferenceImagesBySelfId] = React.useState<
    Record<string, AssetGalleryPortraitImage[]>
  >({});

  const handleUploadReferenceImage = (src: string) => {
    if (!galleryOpenForSelfId) return;
    setReferenceImagesBySelfId((prev) => ({
      ...prev,
      [galleryOpenForSelfId]: [
        {
          id: `reference-upload-${prev[galleryOpenForSelfId]?.length ?? 0}`,
          src,
          alt: "Uploaded reference image",
        },
        ...(prev[galleryOpenForSelfId] ?? []),
      ],
    }));
  };

  const handleCreateReferenceImages = (
    images: { src: string; alt: string }[],
  ) => {
    if (!galleryOpenForSelfId) return;
    setReferenceImagesBySelfId((prev) => {
      const existing = prev[galleryOpenForSelfId] ?? [];
      return {
        ...prev,
        [galleryOpenForSelfId]: [
          ...images.map((image, index) => ({
            id: `reference-style-${existing.length + index}`,
            ...image,
          })),
          ...existing,
        ],
      };
    });
  };

  const handleDeleteReferenceImage = (imageId: string) => {
    if (!galleryOpenForSelfId) return;
    setReferenceImagesBySelfId((prev) => ({
      ...prev,
      [galleryOpenForSelfId]: (prev[galleryOpenForSelfId] ?? []).filter(
        (image) => image.id !== imageId,
      ),
    }));
  };

  const handleGeneratePortrait = (src: string, isFirstOfBatch: boolean) => {
    if (!galleryOpenForSelfId) return;
    setPortraitImagesBySelfId((prev) => ({
      ...prev,
      [galleryOpenForSelfId]: [
        ...(prev[galleryOpenForSelfId] ?? []),
        {
          id: `generated-${prev[galleryOpenForSelfId]?.length ?? 0}`,
          src,
          alt: "Generated self portrait",
          date: formatAssetDate(new Date()),
        },
      ],
    }));
    // The first portrait of a batch becomes this self's main image everywhere it's shown.
    if (isFirstOfBatch) {
      updateSelfIdentity(galleryOpenForSelfId, { image: src });
    }
  };

  const handleSetMainPortrait = (src: string) => {
    if (!galleryOpenForSelfId) return;
    updateSelfIdentity(galleryOpenForSelfId, { image: src });
  };

  const handleReplacePortrait = (imageId: string, newSrc: string) => {
    if (!galleryOpenForSelfId) return;
    const replacedImage = portraitImagesBySelfId[galleryOpenForSelfId]?.find(
      (image) => image.id === imageId,
    );
    setPortraitImagesBySelfId((prev) => ({
      ...prev,
      [galleryOpenForSelfId]: (prev[galleryOpenForSelfId] ?? []).map((image) =>
        image.id === imageId ? { ...image, src: newSrc } : image,
      ),
    }));
    // Keep the main image in sync if the edited portrait was the main one.
    if (
      replacedImage &&
      selves.find((self) => self.id === galleryOpenForSelfId)?.image ===
        replacedImage.src
    ) {
      updateSelfIdentity(galleryOpenForSelfId, { image: newSrc });
    }
  };

  const handleDeletePortraitImage = (imageId: string) => {
    if (!galleryOpenForSelfId) return;
    setPortraitImagesBySelfId((prev) => ({
      ...prev,
      [galleryOpenForSelfId]: (prev[galleryOpenForSelfId] ?? []).filter(
        (image) => image.id !== imageId,
      ),
    }));
  };

  const handleDeleteArchivedImage = (imageSrc: string) => {
    if (!galleryOpenForSelfId) return;
    removeArchivedImage(galleryOpenForSelfId, imageSrc);
  };

  const handleUseReferenceImages = (imageSrcs: string[]) => {
    // Key read by app/content-studio/page.tsx on mount.
    sessionStorage.setItem("gb-reference-images", JSON.stringify(imageSrcs));
    router.push("/content-studio");
  };

  const usedPersonaIds = new Set(selves.map((self) => self.id));
  const nextPersona = PERSONA_POOL.find(
    (persona) => !usedPersonaIds.has(persona.id),
  );

  // Merges a Self's saved Goal edits (if any) over its PERSONA_POOL demo
  // defaults. Known for Now/Next come from the shared `goalsBySelf` store
  // (so Content Studio sees the same values) — everything else still comes
  // from the local `goalOverridesBySelfId`.
  const getEffectivePersona = (personaId: string): PersonaDefinition => {
    const base =
      PERSONA_POOL.find((persona) => persona.id === personaId) ??
      PERSONA_POOL[0]!;
    const override = goalOverridesBySelfId[personaId];
    const sharedGoal = getSelfGoal(personaId);
    const sharedContentGoal = getContentGoal(personaId);
    return {
      ...base,
      ...(override ?? {}),
      knownForNow: sharedGoal?.now ?? base.knownForNow,
      knownForNext: sharedGoal?.next ?? base.knownForNext,
      postingCount: sharedContentGoal?.postingCount ?? base.postingCount,
      postingFrequency:
        sharedContentGoal?.postingFrequencyUnit ?? base.postingFrequency,
    };
  };

  const updateGoalOverride = (selfId: string, patch: Partial<GoalOverride>) => {
    setGoalOverridesBySelfId((prev) => {
      const current = prev[selfId] ?? getEffectivePersona(selfId);
      return { ...prev, [selfId]: { ...current, ...patch } };
    });
  };

  // Self Name lives on the self itself (like `image`), not in `goalOverridesBySelfId` —
  // it's shown on the canvas node/dropdowns too, not just inside Goal Setting.
  const updateSelfIdentity = (
    selfId: string,
    patch: Partial<Omit<ClusterSelf, "id" | "slotId">>,
  ) => {
    setSelfIdentities(
      selfIdentities.map((identity) =>
        identity.id === selfId ? { ...identity, ...patch } : identity,
      ),
    );
  };

  const updateSelfLabel = (selfId: string, label: string) =>
    updateSelfIdentity(selfId, { label });

  // Posting count/frequency live in the shared `contentGoalsBySelf` store
  // (Content Studio's Content Goal) — merge onto whatever's already there
  // (or a fresh/empty Content Goal) the same way Content Studio's own Goal
  // Setting save does.
  const updateContentGoalFrequency = (
    selfId: string,
    patch: Partial<
      Pick<ContentGoalData, "postingCount" | "postingFrequencyUnit">
    >,
  ) => {
    const current = getContentGoal(selfId) ?? {
      contentGoal: "",
      pillars: [],
      ratio: "Balanced" as const,
      postingCount: getEffectivePersona(selfId).postingCount,
      postingFrequencyUnit: getEffectivePersona(selfId).postingFrequency,
    };
    const next = { ...current, ...patch };
    setContentGoal(selfId, next);

    // Also push a derived schedule — same as Content Studio's own Self
    // Goal/Content Goal save — so its Schedule Settings panel picks up the
    // new cadence too, whichever app the edit came from.
    const currentSchedule = getScheduleSettings(selfId);
    const derived = deriveScheduleFromFrequency(
      next.postingCount,
      next.postingFrequencyUnit,
      {
        selectedWeekdays:
          currentSchedule?.selectedWeekdays ??
          DEFAULT_SCHEDULE_SELECTED_WEEKDAYS,
        dayOfMonth:
          currentSchedule?.dayOfMonth ?? DEFAULT_SCHEDULE_DAY_OF_MONTH,
        timeSlotsByType:
          currentSchedule?.timeSlotsByType ??
          DEFAULT_SCHEDULE_TIME_SLOTS_BY_TYPE,
      },
    );
    setScheduleSettings(selfId, {
      repeatType: derived.repeatType,
      selectedWeekdays: derived.selectedWeekdays,
      dayOfMonth: derived.dayOfMonth,
      everyCount: currentSchedule?.everyCount ?? DEFAULT_SCHEDULE_EVERY_COUNT,
      everyUnit: currentSchedule?.everyUnit ?? DEFAULT_SCHEDULE_EVERY_UNIT,
      timeSlotsByType: derived.timeSlotsByType,
    });
  };

  const handleAddSelf = (slotId: string) => setPendingSlotId(slotId);

  const handleCreateContinue = () => {
    if (!pendingSlotId || !nextPersona) {
      setPendingSlotId(null);
      return;
    }
    // Known for Now/Next and posting count/frequency go to the shared
    // goalsBySelf/contentGoalsBySelf stores (Content Studio reads/writes the
    // same ones) — the rest of the Goal (follower target, timeframe) carries
    // over from the demo persona as a rough starting point, same as the rest
    // of its profile data.
    setSelfGoal(nextPersona.id, { now: pendingGoalNow, next: pendingGoalGoal });
    setContentGoal(nextPersona.id, {
      contentGoal: "",
      pillars: [],
      ratio: "Balanced",
      postingCount: nextPersona.postingCount,
      postingFrequencyUnit: nextPersona.postingFrequency,
    });
    setGoalOverridesBySelfId((prev) => ({
      ...prev,
      [nextPersona.id]: {
        targetedFollowersIndex: nextPersona.targetedFollowersIndex,
        timeframe: nextPersona.timeframe,
      },
    }));
    setSelfIdentities([
      ...selfIdentities,
      {
        id: nextPersona.id,
        label: pendingSelfName.trim(),
        image: nextPersona.image,
      },
    ]);
    setSlotIdBySelfId((prev) => ({
      ...prev,
      [nextPersona.id]: pendingSlotId,
    }));
    // Only becomes the selected self once Asset Gallery closes — see
    // `creatingSelfId` below. Switching the detail panel mid-creation (while
    // the Goal step or the portrait step is still open) would be jarring.
    setCreatingSelfId(nextPersona.id);
    setPendingSlotId(null);
    setPendingSelfName("");
    setPendingGoalNow("");
    setPendingGoalGoal("");
    goToAssetGallery(nextPersona.id);
  };

  const goToAssetGallery = (selfId: string) => setGalleryOpenForSelfId(selfId);

  /** Rolls back a self whose creation was confirmed-cancelled mid-flow — undoes everything `handleCreateContinue` committed, plus any reference images uploaded in Asset Gallery along the way. */
  const handleCancelCreatingSelf = () => {
    const id = creatingSelfId;
    if (id) {
      setSelfIdentities(
        selfIdentities.filter((identity) => identity.id !== id),
      );
      setSlotIdBySelfId((prev) => {
        const { [id]: _removed, ...rest } = prev;
        return rest;
      });
      clearSelfGoal(id);
      clearContentGoal(id);
      clearScheduleSettings(id);
      setGoalOverridesBySelfId((prev) => {
        const { [id]: _removed, ...rest } = prev;
        return rest;
      });
      setPortraitImagesBySelfId((prev) => {
        const { [id]: _removed, ...rest } = prev;
        return rest;
      });
      setReferenceImagesBySelfId((prev) => {
        const { [id]: _removed, ...rest } = prev;
        return rest;
      });
    }
    setCreatingSelfId(null);
    setGalleryOpenForSelfId(null);
  };

  const handleConfirmArchive = () => {
    const self = archivingSelf;
    // The last remaining Self can't be archived (the "Move to Archive" action
    // is already hidden for it in getSelfMenuActions) — guarded again here too.
    if (!self || selves.length <= 1) return;
    // self.image already lives in portraitImagesBySelfId whenever this Self has
    // any Self Portrait saved, so only snapshot it into the archive store when
    // it doesn't — otherwise the Asset Gallery shows the same image twice.
    const existingPortraits = portraitImagesBySelfId[self.id] ?? [];
    const alreadyHasMainImage = existingPortraits.some(
      (image) => image.src === self.image,
    );
    if (!alreadyHasMainImage) {
      addArchivedImage(self.id, self.image);
    }
    const remaining = selves.filter((s) => s.id !== self.id);
    setSelfIdentities(
      selfIdentities.filter((identity) => identity.id !== self.id),
    );
    setSlotIdBySelfId((prev) => {
      const { [self.id]: _removed, ...rest } = prev;
      return rest;
    });
    setArchivedSelves((prev) => [...prev, self]);
    if (activeSelfId === self.id) {
      setActiveSelfId(remaining[0]!.id);
    }
    // Clears this Self's Goal edits so a later "+" that reuses the same
    // PERSONA_POOL id (once it's unused again) doesn't inherit stale text.
    clearSelfGoal(self.id);
    clearContentGoal(self.id);
    clearScheduleSettings(self.id);
    setGoalOverridesBySelfId((prev) => {
      const next = { ...prev };
      delete next[self.id];
      return next;
    });
    setArchivingSelf(null);
  };

  const handleConfirmDeleteArchivedSelf = () => {
    const selfId = deletingArchivedSelfId;
    if (!selfId) return;
    setArchivedSelves((prev) => prev.filter((self) => self.id !== selfId));
    clearArchivedImages(selfId);
    setPortraitImagesBySelfId((prev) => {
      const next = { ...prev };
      delete next[selfId];
      return next;
    });
    setReferenceImagesBySelfId((prev) => {
      const next = { ...prev };
      delete next[selfId];
      return next;
    });
    if (galleryOpenForSelfId === selfId) {
      setGalleryOpenForSelfId(null);
    }
    setDeletingArchivedSelfId(null);
  };

  const getSelfMenuActions = (self: ClusterSelf): SelfMenuAction[] => {
    const actions: SelfMenuAction[] = [
      {
        label: "Create a Post",
        onSelect: () => router.push("/content-studio"),
      },
      {
        label: "Go to Asset Gallery",
        onSelect: () => goToAssetGallery(self.id),
      },
    ];
    // Keep at least one Self — same rule as "Delete Self Portrait" in Asset Gallery.
    if (selves.length > 1) {
      actions.push({
        label: "Move to Archive",
        onSelect: () => setArchivingSelf(self),
      });
    }
    actions.push({
      label: "Edit Goal",
      onSelect: () => {
        setActiveSelfId(self.id);
        setEditingGoalSelfId(self.id);
      },
    });
    return actions;
  };

  const activePersona = getEffectivePersona(activeSelfId);
  const activeSelf = selves.find((self) => self.id === activeSelfId);
  const activeSelfProfile: AssetPanelSelfProfile = {
    ...activePersona,
    image: activeSelf?.image ?? activePersona.image,
    role: activeSelf?.label ?? activePersona.label,
  };
  const editingGoalPersona = editingGoalSelfId
    ? getEffectivePersona(editingGoalSelfId)
    : undefined;

  // Asset Gallery의 "for" 드롭다운 — 활성 Self 뒤에 보관된 Self를 이어 붙이고,
  // 보관된 항목에만 흐린 라벨 + 영구삭제(휴지통) 아이콘을 추가한다.
  const assetGallerySelfOptions = [
    ...selves.map((self) => ({ value: self.id, label: self.label })),
    ...archivedSelves.map((self) => ({
      value: self.id,
      label: `${self.label} (Archived)`,
      muted: true,
      trailingIcon: Trash2,
      trailingIconLabel: `Permanently delete ${self.label}`,
      onTrailingIconClick: () => setDeletingArchivedSelfId(self.id),
    })),
  ];

  return (
    <div className="dark relative flex h-screen w-screen overflow-hidden bg-[var(--gb-background-default)]">
      <DottedBackground />

      <Gnb
        expanded={gnbExpanded}
        onExpandedChange={setGnbExpanded}
        items={GNB_ITEMS}
        activeId="assets"
        onItemSelect={(id) => {
          const path = GNB_PATHS[id];
          if (path) router.push(path);
        }}
        className="z-4"
      />

      {/* Gnb와 AssetPanel(500px) 둘 다 제외한 영역을 캔버스로 쓴다 — 전체
          뷰포트 기준으로 중앙 정렬하면 우측 다이아몬드 슬롯이 AssetPanel에
          가려지므로, 캔버스 경계를 AssetPanel 폭만큼 명시적으로 인셋한다. */}
      <div className="relative min-w-0 flex-1 overflow-hidden">
        <div ref={setCanvasEl} className="absolute inset-0 right-[500px] z-1">
          <div className="absolute top-[9px] left-1/2 z-3 -translate-x-1/2">
            <ButtonGroup
              type="menu"
              activeId="assets"
              onActiveChange={(id) => {
                const path = GNB_PATHS[id];
                if (path) router.push(path);
              }}
              className="dark [&>button[data-selected]]:text-sm-semi-bold"
            />
          </div>

          <div className="flex h-full items-center justify-center">
            <SelfCluster
              selves={selves}
              selectedSelfId={activeSelfId}
              onAddSelf={handleAddSelf}
              onSelectSelf={(self) => setActiveSelfId(self.id)}
              getSelfMenuActions={getSelfMenuActions}
              onEditSelfImage={(self) => goToAssetGallery(self.id)}
              previewPortalContainer={canvasEl}
            />
          </div>
        </div>

        <div className="absolute top-0 right-0 z-2 h-full">
          <AssetPanel
            self={activeSelfProfile}
            onCreateContents={() => router.push("/content-studio")}
            onEditSelfPortrait={() => goToAssetGallery(activeSelfProfile.id)}
            onGoToAssetGallery={() => goToAssetGallery(activeSelfProfile.id)}
            onEditGoal={() => setEditingGoalSelfId(activeSelfProfile.id)}
          />
        </div>
      </div>

      <GoalEditDialog
        key={`create-self-${pendingSlotId ?? "closed"}`}
        open={pendingSlotId !== null}
        onOpenChange={(open) => {
          if (!open) setCancelCreateConfirmOpen(true);
        }}
        selfName={pendingSelfName}
        onSelfNameChange={setPendingSelfName}
        now={pendingGoalNow}
        onNowChange={setPendingGoalNow}
        goal={pendingGoalGoal}
        onGoalChange={setPendingGoalGoal}
        onSave={handleCreateContinue}
      />

      {/* Edit Goal — 그 Self의 현재 값(저장된 오버라이드 또는 기본값)으로 채워서 연다 */}
      <GoalEditDialog
        key={`edit-goal-${editingGoalSelfId ?? "closed"}`}
        open={editingGoalSelfId !== null}
        onOpenChange={(open) => !open && setEditingGoalSelfId(null)}
        selfName={selves.find((self) => self.id === editingGoalSelfId)?.label}
        onSelfNameChange={(value) =>
          editingGoalSelfId && updateSelfLabel(editingGoalSelfId, value)
        }
        now={editingGoalPersona?.knownForNow}
        onNowChange={(value) =>
          editingGoalSelfId &&
          setSelfGoal(editingGoalSelfId, {
            now: value,
            next: editingGoalPersona?.knownForNext ?? "",
          })
        }
        goal={editingGoalPersona?.knownForNext}
        onGoalChange={(value) =>
          editingGoalSelfId &&
          setSelfGoal(editingGoalSelfId, {
            now: editingGoalPersona?.knownForNow ?? "",
            next: value,
          })
        }
        postingCount={editingGoalPersona?.postingCount}
        onPostingCountChange={(value) =>
          editingGoalSelfId &&
          updateContentGoalFrequency(editingGoalSelfId, { postingCount: value })
        }
        postingFrequency={editingGoalPersona?.postingFrequency}
        onPostingFrequencyChange={(value) =>
          editingGoalSelfId &&
          updateContentGoalFrequency(editingGoalSelfId, {
            postingFrequencyUnit: value,
          })
        }
        targetedFollowersIndex={editingGoalPersona?.targetedFollowersIndex}
        onTargetedFollowersIndexChange={(index) =>
          editingGoalSelfId &&
          updateGoalOverride(editingGoalSelfId, {
            targetedFollowersIndex: index,
          })
        }
        timeframe={editingGoalPersona?.timeframe}
        onTimeframeChange={(value) =>
          editingGoalSelfId &&
          updateGoalOverride(editingGoalSelfId, { timeframe: value })
        }
        goalActions={editingGoalPersona?.goalActions}
        onSave={() => setEditingGoalSelfId(null)}
      />

      <Popover
        type="warning"
        open={archivingSelf !== null}
        onOpenChange={(open) => !open && setArchivingSelf(null)}
        title="Move to Archive?"
        description="This will be moved to your archive and take effect immediately."
        leadingIcon={<Icon id="archive-icon" />}
        onCancel={() => setArchivingSelf(null)}
        onConfirm={handleConfirmArchive}
      />

      <Popover
        type="warning"
        open={deletingArchivedSelfId !== null}
        onOpenChange={(open) => !open && setDeletingArchivedSelfId(null)}
        title="Permanently delete this Self?"
        description="This Self and all of its archived images will be permanently deleted. This can't be undone."
        leadingIcon={<Trash2 />}
        onCancel={() => setDeletingArchivedSelfId(null)}
        onConfirm={handleConfirmDeleteArchivedSelf}
      />

      <Popover
        type="warning"
        open={cancelCreateConfirmOpen}
        onOpenChange={setCancelCreateConfirmOpen}
        title="Cancel creating this self?"
        description="What you've entered so far won't be saved."
        leadingIcon={<Icon id="triangle-alert-icon" />}
        cancelLabel="Keep editing"
        confirmLabel="Cancel creating"
        onCancel={() => setCancelCreateConfirmOpen(false)}
        onConfirm={() => {
          setCancelCreateConfirmOpen(false);
          setPendingSlotId(null);
          setPendingSelfName("");
          setPendingGoalNow("");
          setPendingGoalGoal("");
        }}
      />

      <AssetGalleryDialog
        open={galleryOpenForSelfId !== null}
        onOpenChange={(open) => {
          if (open) return;
          // Closing out of a just-created self's Asset Gallery is what
          // "finishes" making it — only then does it become the selected self.
          // (The zero-portrait "still creating" case never reaches here — see
          // `isCreatingSelf`/`onCancelCreating` below.)
          if (galleryOpenForSelfId && galleryOpenForSelfId === creatingSelfId) {
            setActiveSelfId(galleryOpenForSelfId);
            setCreatingSelfId(null);
          }
          setGalleryOpenForSelfId(null);
        }}
        isCreatingSelf={
          galleryOpenForSelfId !== null &&
          galleryOpenForSelfId === creatingSelfId
        }
        onCancelCreating={handleCancelCreatingSelf}
        selves={assetGallerySelfOptions}
        selfId={galleryOpenForSelfId ?? ""}
        onSelfIdChange={setGalleryOpenForSelfId}
        portraitImages={
          portraitImagesBySelfId[galleryOpenForSelfId ?? ""] ?? []
        }
        onGenerate={handleGeneratePortrait}
        mainPortraitSrc={
          selves.find((self) => self.id === galleryOpenForSelfId)?.image
        }
        onSetMainPortrait={handleSetMainPortrait}
        onReplacePortrait={handleReplacePortrait}
        onDeletePortraitImage={handleDeletePortraitImage}
        onDeleteArchivedImage={handleDeleteArchivedImage}
        myReferenceImages={
          referenceImagesBySelfId[galleryOpenForSelfId ?? ""] ?? []
        }
        onUploadReferenceImage={handleUploadReferenceImage}
        onCreateReferenceImages={handleCreateReferenceImages}
        onDeleteReferenceImage={handleDeleteReferenceImage}
        onUseReferenceImages={handleUseReferenceImages}
      />
    </div>
  );
}
