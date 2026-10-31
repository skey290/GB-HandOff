"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Blocks, Compass, Home, UserRoundSearch } from "lucide-react";

import { cn } from "@/lib/utils";
import { createSpriteIcon } from "@/lib/sprite-icon";
import { Gnb, type GnbItem } from "@/components/app/gnb";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import type { CalendarRangeValue } from "@/components/ui/calendar";
import { Toggle } from "@/components/ui/toggle";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PostingModalDialog } from "@/components/screens/content-studio/posting-modal-dialog";
import { ProcessingModal } from "@/components/screens/content-studio/processing-modal";
import { PostCard } from "@/components/screens/content-studio/ui/PostCard";
import { PostEditDialog } from "@/components/screens/content-studio/post-edit-dialog";
import { IMAGE_STYLE_OPTIONS } from "@/components/screens/content-studio/ui/PostingModal";
import {
  SchedulePanel,
  type SchedulePanelGroup,
  type SchedulePanelSlot,
} from "@/components/screens/content-studio/ui/SchedulePanel";
import { ProfileCard } from "@/components/screens/content-studio/ui/ProfileCard";
import {
  ScheduleSettingsPanel,
  type ScheduleSettingsPanelRepeatType,
  type ScheduleTimeSlotValue,
  type ScheduleTimeSlotsByRepeatType,
} from "@/components/screens/content-studio/ui/ScheduleSettingsPanel";
import { IncompleteProfileDialog } from "@/components/screens/content-studio/incomplete-profile-dialog";
import {
  GoalEditDialog,
  ContentGoalDialog,
  ToneOfVoiceDialog,
  SELF_OPTIONS,
  getSelfImage,
  getSelfLabel,
  setContentGoal,
  setSelfGoal,
  setToneOfVoice,
  useContentGoal,
  useSelfGoal,
  useToneOfVoice,
  type ContentGoalData,
  type ToneOfVoiceData,
} from "@/components/app/goal-setting";
import {
  createCustomIntervalSlot,
  createGeneratedPosts,
  createNextDaySlots,
  createNextMonthSlot,
  createNextWeekSlots,
  deriveFrequencyFromSchedule,
  deriveScheduleFromFrequency,
  INITIAL_SLOTS,
  type Post,
  type PostPlatform,
  type ScheduleSlot,
} from "@/components/screens/content-studio/data";

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
  assets: "/assets",
  "contents-studio": "/content-studio",
};

// gabrielle-ai.com/content-studio 라이브 사이트 카피본의 "Content" 탭.
// Analysis 탭/Archive는 핸드오프 범위 밖이라 포함하지 않는다.

// 좌측 패널/우측 콘텐츠 영역을 각자 색이 다른 패널로 나누지 않고, 스크롤
// 가능한 캔버스 전체가 하나로 이어진 배경처럼 보이도록 하는 레이어.
function DottedBackground() {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 z-0",
        "bg-[var(--gb-background-subtlest)]",
        "bg-[radial-gradient(circle,var(--gb-color-neutral-300)_1px,transparent_1px)]",
        "bg-[length:var(--gb-spacing-6)_var(--gb-spacing-6)]",
      )}
    />
  );
}

type GenerationTarget = {
  defaultCount: number;
};

// "Create More Post"가 새 슬롯에 쓰는 기본 시간 — ScheduleSettingsPanel을 한
// 번도 저장하지 않은 상태의 시작값과 동일하다.
const DEFAULT_SCHEDULE_TIME_SLOTS: ScheduleTimeSlotValue[] = [
  { time: "10:00", period: "AM" },
  { time: "02:25", period: "PM" },
  { time: "09:00", period: "PM" },
];

// Repeat 탭(Daily/Weekly/Monthly/Custom)마다 "On Each Day" 설정을 독립적으로
// 갖는다 — 한 번도 커스터마이즈 안 한 탭은 전부 같은 기본 3개로 시작한다.
const DEFAULT_SCHEDULE_TIME_SLOTS_BY_TYPE: ScheduleTimeSlotsByRepeatType = {
  daily: DEFAULT_SCHEDULE_TIME_SLOTS,
  weekly: DEFAULT_SCHEDULE_TIME_SLOTS,
  monthly: DEFAULT_SCHEDULE_TIME_SLOTS,
  custom: DEFAULT_SCHEDULE_TIME_SLOTS,
};

/** `ScheduleTimeSlotValue` → `ScheduleSlot.time` 형식("hh:mm AM/PM") 문자열.
 * `time`을 직접 입력하지 않은 슬롯은 `InputTime`이 보여주는 "11:00" placeholder
 * 값을 그대로 써서 개수를 맞춘다 — `period`가 없는(한 번도 설정 안 된) 슬롯만
 * 건너뛴다. */
function formatScheduleTimeSlots(slots: ScheduleTimeSlotValue[]): string[] {
  return slots
    .filter((slot) => slot.period)
    .map((slot) => `${slot.time || "11:00"} ${slot.period}`);
}

// 아직 포스트를 생성한 적 없는 self를 위한 기본값 — 매 렌더마다 새 배열을
// 만들면 참조가 바뀌어 useMemo/의존성 배열이 불필요하게 매번 재계산된다.
const EMPTY_POSTS: Post[] = [];
const DEFAULT_SLOTS: ScheduleSlot[] = INITIAL_SLOTS.map((slot) => ({
  ...slot,
  postId: null,
}));

// 기본 스케줄은 매주 화/수/목 3회 × 3타임슬롯(주 9개) — INITIAL_SLOTS의
// Today(화)/Tomorrow(수)/Thursday(목) 3일 패턴을 그대로 매주 반복한다. 한 번도
// Repeat 설정을 저장한 적 없는 self는 이 기본값에서 시작한다.
const DEFAULT_SCHEDULE_REPEAT_TYPE: ScheduleSettingsPanelRepeatType = "weekly";
const DEFAULT_SCHEDULE_SELECTED_WEEKDAYS = ["tue", "wed", "thu"];
const DEFAULT_SCHEDULE_DAY_OF_MONTH = "";
const DEFAULT_SCHEDULE_EVERY_COUNT = "";
const DEFAULT_SCHEDULE_EVERY_UNIT = "days";

export default function ContentStudioPage() {
  const router = useRouter();
  const [gnbExpanded, setGnbExpanded] = React.useState(false);
  const [selfValue, setSelfValue] = React.useState("data-scientist");
  // Analysis 탭 콘텐츠(AnalysisView)와 Archive 서브페이지는 핸드오프 범위
  // 밖이라 탭/아이콘만 그대로 두고 실제 연동은 하지 않는다.
  const [activeTab, setActiveTab] = React.useState(1);

  // Self마다 독립된 포스트/스케줄을 갖는다 — 한 번도 생성한 적 없는 self는
  // 빈 배열/기본 슬롯으로 시작해 오른쪽 패널에 아무 포스트도 안 보인다.
  const [postsBySelf, setPostsBySelf] = React.useState<Record<string, Post[]>>(
    {},
  );
  const [slotsBySelf, setSlotsBySelf] = React.useState<
    Record<string, ScheduleSlot[]>
  >({});
  const posts = postsBySelf[selfValue] ?? EMPTY_POSTS;
  const slots = slotsBySelf[selfValue] ?? DEFAULT_SLOTS;
  const setPosts = (update: React.SetStateAction<Post[]>) => {
    setPostsBySelf((prev) => {
      const current = prev[selfValue] ?? EMPTY_POSTS;
      const next =
        typeof update === "function"
          ? (update as (value: Post[]) => Post[])(current)
          : update;
      return { ...prev, [selfValue]: next };
    });
  };
  const setSlots = (update: React.SetStateAction<ScheduleSlot[]>) => {
    setSlotsBySelf((prev) => {
      const current = prev[selfValue] ?? DEFAULT_SLOTS;
      const next =
        typeof update === "function"
          ? (update as (value: ScheduleSlot[]) => ScheduleSlot[])(current)
          : update;
      return { ...prev, [selfValue]: next };
    });
  };
  const [activeSlotId, setActiveSlotId] = React.useState<string | null>(null);

  const [generationTarget, setGenerationTarget] =
    React.useState<GenerationTarget | null>(null);
  // "Create Posts" with no empty slots left computes the next schedule
  // (per the Repeat settings) and holds it here instead of committing it
  // right away — it's only added to `slots` once generation actually
  // completes, so cancelling the modal (the X button) leaves the schedule
  // panel untouched.
  const pendingScheduleRef = React.useRef<
    Omit<ScheduleSlot, "postId">[] | null
  >(null);
  const [postingPlatforms, setPostingPlatforms] = React.useState<
    PostPlatform[]
  >(["linkedin"]);
  const [postingTypeIndex, setPostingTypeIndex] = React.useState(0);
  const [postingCount, setPostingCount] = React.useState(1);
  const [postingInstruction, setPostingInstruction] = React.useState("");
  const [processingCount, setProcessingCount] = React.useState<number | null>(
    null,
  );

  const [editingPostId, setEditingPostId] = React.useState<string | null>(null);
  const [archiveConfirmPostId, setArchiveConfirmPostId] = React.useState<
    string | null
  >(null);
  const [deleteSlotId, setDeleteSlotId] = React.useState<string | null>(null);

  const [scheduleView, setScheduleView] = React.useState<"list" | "settings">(
    "list",
  );
  // Repeat 설정도 posts/slots와 마찬가지로 self별 독립 — 한 번도 커스터마이즈
  // 안 한 self는 DEFAULT_SCHEDULE_*로 시작한다.
  const [scheduleTimeSlotsByTypeBySelf, setScheduleTimeSlotsByTypeBySelf] =
    React.useState<Record<string, ScheduleTimeSlotsByRepeatType>>({});
  const [scheduleRepeatTypeBySelf, setScheduleRepeatTypeBySelf] =
    React.useState<Record<string, ScheduleSettingsPanelRepeatType>>({});
  const [scheduleSelectedWeekdaysBySelf, setScheduleSelectedWeekdaysBySelf] =
    React.useState<Record<string, string[]>>({});
  const [scheduleDayOfMonthBySelf, setScheduleDayOfMonthBySelf] =
    React.useState<Record<string, string>>({});
  const [scheduleEveryCountBySelf, setScheduleEveryCountBySelf] =
    React.useState<Record<string, string>>({});
  const [scheduleEveryUnitBySelf, setScheduleEveryUnitBySelf] = React.useState<
    Record<string, string>
  >({});

  const scheduleTimeSlotsByType =
    scheduleTimeSlotsByTypeBySelf[selfValue] ??
    DEFAULT_SCHEDULE_TIME_SLOTS_BY_TYPE;
  const scheduleRepeatType =
    scheduleRepeatTypeBySelf[selfValue] ?? DEFAULT_SCHEDULE_REPEAT_TYPE;
  const scheduleSelectedWeekdays =
    scheduleSelectedWeekdaysBySelf[selfValue] ??
    DEFAULT_SCHEDULE_SELECTED_WEEKDAYS;
  const scheduleDayOfMonth =
    scheduleDayOfMonthBySelf[selfValue] ?? DEFAULT_SCHEDULE_DAY_OF_MONTH;
  const scheduleEveryCount =
    scheduleEveryCountBySelf[selfValue] ?? DEFAULT_SCHEDULE_EVERY_COUNT;
  const scheduleEveryUnit =
    scheduleEveryUnitBySelf[selfValue] ?? DEFAULT_SCHEDULE_EVERY_UNIT;

  const setScheduleTimeSlotsByType = (value: ScheduleTimeSlotsByRepeatType) =>
    setScheduleTimeSlotsByTypeBySelf((prev) => ({
      ...prev,
      [selfValue]: value,
    }));
  const setScheduleRepeatType = (value: ScheduleSettingsPanelRepeatType) =>
    setScheduleRepeatTypeBySelf((prev) => ({ ...prev, [selfValue]: value }));
  const setScheduleSelectedWeekdays = (value: string[]) =>
    setScheduleSelectedWeekdaysBySelf((prev) => ({
      ...prev,
      [selfValue]: value,
    }));
  const setScheduleDayOfMonth = (value: string) =>
    setScheduleDayOfMonthBySelf((prev) => ({ ...prev, [selfValue]: value }));
  const setScheduleEveryCount = (value: string) =>
    setScheduleEveryCountBySelf((prev) => ({ ...prev, [selfValue]: value }));
  const setScheduleEveryUnit = (value: string) =>
    setScheduleEveryUnitBySelf((prev) => ({ ...prev, [selfValue]: value }));

  const draftScheduleTimeSlotsByTypeRef = React.useRef(scheduleTimeSlotsByType);
  const draftScheduleRepeatTypeRef = React.useRef(scheduleRepeatType);
  const draftScheduleSelectedWeekdaysRef = React.useRef(
    scheduleSelectedWeekdays,
  );
  const draftScheduleDayOfMonthRef = React.useRef(scheduleDayOfMonth);
  const draftScheduleEveryCountRef = React.useRef(scheduleEveryCount);
  const draftScheduleEveryUnitRef = React.useRef(scheduleEveryUnit);
  // ScheduleSettingsPanel is remounted (key={selfValue}) on self switch, but
  // these drafts live here in the parent and don't reset on their own — if
  // Save fires before the user touches the freshly-mounted panel, it would
  // otherwise commit the previous self's stale draft into the new self.
  React.useEffect(() => {
    draftScheduleTimeSlotsByTypeRef.current = scheduleTimeSlotsByType;
    draftScheduleRepeatTypeRef.current = scheduleRepeatType;
    draftScheduleSelectedWeekdaysRef.current = scheduleSelectedWeekdays;
    draftScheduleDayOfMonthRef.current = scheduleDayOfMonth;
    draftScheduleEveryCountRef.current = scheduleEveryCount;
    draftScheduleEveryUnitRef.current = scheduleEveryUnit;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selfValue]);
  const [goalOpen, setGoalOpen] = React.useState(false);
  const [contentGoalOpen, setContentGoalOpen] = React.useState(false);
  const [toneOfVoiceOpen, setToneOfVoiceOpen] = React.useState(false);
  const selfGoal = useSelfGoal(selfValue);
  const contentGoal = useContentGoal(selfValue);
  const toneOfVoice = useToneOfVoice(selfValue);
  const draftGoalRef = React.useRef({ now: "", next: "" });
  const draftContentGoalRef = React.useRef<ContentGoalData>({
    contentGoal: "",
    pillars: [],
    ratio: "Balanced",
    postingCount: 3,
    postingFrequencyUnit: "Week",
  });
  const draftToneOfVoiceRef = React.useRef<ToneOfVoiceData>({
    traits: [],
    referenceLink: "",
    referenceText: "",
    referenceFileName: "",
  });
  // Self의 Reference 탭 Generate에서 넘어온 이미지 — 1회성이라 읽은 뒤 바로 비운다.
  const [referenceImages, setReferenceImages] = React.useState<string[]>([]);
  React.useEffect(() => {
    const stored = sessionStorage.getItem("gb-reference-images");
    if (!stored) return;
    sessionStorage.removeItem("gb-reference-images");
    setReferenceImages(JSON.parse(stored));
  }, []);
  const [profileOpen, setProfileOpen] = React.useState(false);
  const [incompleteProfileOpen, setIncompleteProfileOpen] =
    React.useState(false);
  const [completionQueue, setCompletionQueue] = React.useState<
    Array<"self" | "content" | "tone">
  >([]);
  const [dateRange, setDateRange] = React.useState<CalendarRangeValue>({
    from: new Date(2026, 8, 1),
    to: new Date(2026, 8, 30),
  });

  const editingPost = posts.find((post) => post.id === editingPostId) ?? null;
  const hasAnyPost = posts.length > 0;

  const scheduleGroups = React.useMemo<SchedulePanelGroup[]>(() => {
    const postById = new Map(posts.map((post) => [post.id, post]));
    const groupOrder: string[] = [];
    const groupsByKey = new Map<string, SchedulePanelGroup>();
    for (const slot of slots) {
      const key = `${slot.dayLabel}|${slot.date}`;
      const post = slot.postId ? postById.get(slot.postId) : null;
      const type: SchedulePanelSlot["type"] =
        post?.status === "no-content" || !post ? "no content" : post.status;
      const panelSlot: SchedulePanelSlot = {
        rowId: slot.id,
        type,
        time: slot.time,
      };
      const group = groupsByKey.get(key);
      if (group) {
        group.slots.push(panelSlot);
      } else {
        groupOrder.push(key);
        groupsByKey.set(key, {
          date: `${slot.dayLabel}, ${slot.date}`,
          slots: [panelSlot],
        });
      }
    }
    return groupOrder.map((key) => groupsByKey.get(key)!);
  }, [slots, posts]);

  const missingProfileItems = [
    selfGoal === undefined && "Self-Goal",
    contentGoal === undefined && "Content Goal",
    toneOfVoice === undefined && "Tone of Voice",
  ].filter((item): item is string => Boolean(item));

  const requestGeneration = (target: GenerationTarget) => {
    setGenerationTarget(target);
    setPostingPlatforms(["linkedin"]);
    setPostingTypeIndex(0);
    setPostingCount(target.defaultCount);
    setPostingInstruction("");
    if (missingProfileItems.length > 0) {
      setIncompleteProfileOpen(true);
    }
  };

  const handleGenerate = (count: number) => {
    setGenerationTarget(null);
    setProcessingCount(count);
  };

  const handleProcessingComplete = () => {
    if (processingCount === null) return;
    const startId = posts.length + 1;
    const generated = createGeneratedPosts(
      processingCount,
      startId,
      postingPlatforms,
      postingTypeIndex,
    );
    setPosts((prev) => [...prev, ...generated]);
    const pendingSchedule = pendingScheduleRef.current;
    pendingScheduleRef.current = null;
    setSlots((prev) => {
      const base = pendingSchedule
        ? [
            ...prev,
            ...pendingSchedule.map((slot) => ({ ...slot, postId: null })),
          ]
        : prev;
      const emptySlotIds = base
        .filter((slot) => slot.postId === null)
        .map((slot) => slot.id);
      const assignments = new Map(
        generated.map((post, index) => [emptySlotIds[index], post.id]),
      );
      return base.map((slot) =>
        assignments.has(slot.id)
          ? { ...slot, postId: assignments.get(slot.id)! }
          : slot,
      );
    });
    setProcessingCount(null);
  };

  const computeNextScheduleSlots = (): Omit<ScheduleSlot, "postId">[] => {
    const times = formatScheduleTimeSlots(
      scheduleTimeSlotsByType[scheduleRepeatType],
    );
    const nextIndex = slots.length + 1;
    return scheduleRepeatType === "weekly"
      ? createNextWeekSlots(slots, scheduleSelectedWeekdays, nextIndex, times)
      : scheduleRepeatType === "monthly"
        ? createNextMonthSlot(slots, scheduleDayOfMonth, nextIndex, times)
        : scheduleRepeatType === "custom"
          ? createCustomIntervalSlot(
              slots,
              scheduleEveryCount,
              scheduleEveryUnit,
              nextIndex,
              times,
            )
          : createNextDaySlots(slots, nextIndex, times);
  };

  const handleAddSchedule = () => {
    const added = computeNextScheduleSlots();
    setSlots((prev) => [
      ...prev,
      ...added.map((slot) => ({ ...slot, postId: null })),
    ]);
  };

  const handleCreatePosts = () => {
    const emptyCount = slots.filter((slot) => slot.postId === null).length;
    // No "no content" slots to fill — compute the next schedule (per the
    // schedule settings) and hold it until generation actually completes
    // (see `pendingScheduleRef`), then open the modal targeting those slots.
    if (emptyCount === 0) {
      const added = computeNextScheduleSlots();
      pendingScheduleRef.current = added;
      requestGeneration({ defaultCount: added.length });
      return;
    }
    pendingScheduleRef.current = null;
    requestGeneration({ defaultCount: emptyCount });
  };

  const handleRequestDeleteSlot = (slot: ScheduleSlot) => {
    if (slot.postId) {
      setDeleteSlotId(slot.id);
      return;
    }
    setSlots((prev) => prev.filter((s) => s.id !== slot.id));
    if (activeSlotId === slot.id) setActiveSlotId(null);
  };

  const handleConfirmDeleteSlot = () => {
    if (!deleteSlotId) return;
    const slot = slots.find((s) => s.id === deleteSlotId);
    if (slot?.postId) {
      setPosts((prev) => prev.filter((post) => post.id !== slot.postId));
    }
    setSlots((prev) => prev.filter((s) => s.id !== deleteSlotId));
    if (activeSlotId === deleteSlotId) setActiveSlotId(null);
    setDeleteSlotId(null);
  };

  const handleRangeChange = (range: CalendarRangeValue) => {
    setDateRange(range);
    setPosts(EMPTY_POSTS);
    setSlots(DEFAULT_SLOTS);
  };

  const handleScheduleDraft = (postId: string) =>
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId ? { ...post, status: "scheduled" } : post,
      ),
    );

  const handleScheduleAllDraft = () =>
    setPosts((prev) =>
      prev.map((post) =>
        post.status === "draft" ? { ...post, status: "scheduled" } : post,
      ),
    );

  const handleArchivePost = (postId: string) => {
    setPosts((prev) => prev.filter((post) => post.id !== postId));
    setSlots((prev) =>
      prev.map((slot) =>
        slot.postId === postId ? { ...slot, postId: null } : slot,
      ),
    );
    setArchiveConfirmPostId(null);
    setEditingPostId(null);
  };

  const handleOpenGoalEditor = () => {
    draftGoalRef.current = {
      now: selfGoal?.now ?? "",
      next: selfGoal?.next ?? "",
    };
    setGoalOpen(true);
  };

  const handleOpenContentGoalEditor = () => {
    // ratio is a placeholder only — ContentGoalForm's Save stays disabled until
    // the user actually picks one, which overwrites it via onRatioChange first.
    draftContentGoalRef.current = contentGoal ?? {
      contentGoal: "",
      pillars: [],
      ratio: "Balanced",
      postingCount: 3,
      postingFrequencyUnit: "Week",
    };
    setContentGoalOpen(true);
  };

  const handleOpenToneOfVoiceEditor = () => {
    draftToneOfVoiceRef.current = toneOfVoice ?? {
      traits: [],
      referenceLink: "",
      referenceText: "",
      referenceFileName: "",
    };
    setToneOfVoiceOpen(true);
  };

  // "Complete now" walks through whichever of Self-Goal/Content Goal/Tone of
  // Voice are still missing, one edit dialog at a time — advanceCompletionQueue
  // pops the front and this effect opens whatever is now at the front.
  React.useEffect(() => {
    if (completionQueue.length === 0) return;
    const next = completionQueue[0];
    if (next === "self") handleOpenGoalEditor();
    else if (next === "content") handleOpenContentGoalEditor();
    else if (next === "tone") handleOpenToneOfVoiceEditor();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [completionQueue]);

  const advanceCompletionQueue = () =>
    setCompletionQueue((queue) => queue.slice(1));

  const handleCompleteProfileNow = () => {
    setIncompleteProfileOpen(false);
    setCompletionQueue(
      [
        selfGoal === undefined && "self",
        contentGoal === undefined && "content",
        toneOfVoice === undefined && "tone",
      ].filter((item): item is "self" | "content" | "tone" => Boolean(item)),
    );
  };

  const handleSlotClick = (slot: ScheduleSlot) => {
    setActiveSlotId(slot.id);
    if (slot.postId) {
      setEditingPostId(slot.postId);
    } else {
      requestGeneration({ defaultCount: 1 });
    }
  };

  return (
    <div className="light relative flex h-screen w-screen overflow-hidden bg-[var(--gb-background-default)]">
      <DottedBackground />

      <Gnb
        expanded={gnbExpanded}
        onExpandedChange={setGnbExpanded}
        items={GNB_ITEMS}
        activeId="contents-studio"
        onItemSelect={(id) => {
          const path = GNB_PATHS[id];
          if (path) router.push(path);
        }}
        colorScheme="light"
        className="z-4"
      />

      <div className="relative z-4 flex min-w-0 flex-1 flex-col">
        <div className="flex min-h-0 flex-1 overflow-hidden">
          <div className="flex h-full w-[380px] shrink-0 flex-col">
            <div className="flex items-center px-[var(--gb-spacing-5)] py-[var(--gb-spacing-5)]">
              <Toggle
                type="text"
                items={[
                  {
                    text: "Content",
                    pressed: activeTab === 1,
                    onPressedChange: () => setActiveTab(1),
                  },
                  {
                    text: "Analysis",
                    pressed: activeTab === 0,
                    onPressedChange: () => setActiveTab(0),
                  },
                ]}
                trailingAction={{
                  icon: "archive-icon",
                  "aria-label": "Archive",
                }}
              />
            </div>

            <div className="flex min-h-0 flex-1 flex-col gap-[var(--gb-spacing-5)] py-[var(--gb-spacing-5)]">
              <ProfileCard
                className="shrink-0"
                open={profileOpen}
                avatarSrc={getSelfImage(selfValue)}
                options={SELF_OPTIONS}
                value={selfValue}
                onValueChange={setSelfValue}
                onToggleOpen={() => setProfileOpen((prev) => !prev)}
                isSelfGoalComplete={selfGoal !== undefined}
                knownForNowText={selfGoal?.now}
                knownForNextText={selfGoal?.next}
                isContentGoalComplete={contentGoal !== undefined}
                contentGoalText={
                  contentGoal
                    ? [
                        contentGoal.contentGoal,
                        contentGoal.pillars.join(", "),
                        contentGoal.ratio,
                        `${contentGoal.postingCount}x/${contentGoal.postingFrequencyUnit.toLowerCase()}`,
                      ]
                        .filter(Boolean)
                        .join(" · ")
                    : undefined
                }
                isToneOfVoiceComplete={toneOfVoice !== undefined}
                toneOfVoiceText={
                  toneOfVoice
                    ? [
                        toneOfVoice.traits.join(", "),
                        toneOfVoice.referenceFileName ||
                          toneOfVoice.referenceLink ||
                          toneOfVoice.referenceText,
                      ]
                        .filter(Boolean)
                        .join(" · ")
                    : undefined
                }
                onEditSelfGoal={handleOpenGoalEditor}
                onEditContentGoal={handleOpenContentGoalEditor}
                onEditToneOfVoice={handleOpenToneOfVoiceEditor}
              />
              {scheduleView === "settings" ? (
                <ScheduleSettingsPanel
                  key={selfValue}
                  className="min-h-0 flex-1"
                  defaultRepeatType={scheduleRepeatType}
                  onRepeatTypeChange={(type) => {
                    draftScheduleRepeatTypeRef.current = type;
                  }}
                  defaultSelectedWeekdays={scheduleSelectedWeekdays}
                  onSelectedWeekdaysChange={(ids) => {
                    draftScheduleSelectedWeekdaysRef.current = ids;
                  }}
                  defaultDayOfMonth={scheduleDayOfMonth}
                  onDayOfMonthChange={(value) => {
                    draftScheduleDayOfMonthRef.current = value;
                  }}
                  defaultEveryCount={scheduleEveryCount}
                  onEveryCountChange={(value) => {
                    draftScheduleEveryCountRef.current = value;
                  }}
                  defaultEveryUnit={scheduleEveryUnit}
                  onEveryUnitChange={(value) => {
                    draftScheduleEveryUnitRef.current = value;
                  }}
                  defaultTimeSlotsByType={scheduleTimeSlotsByType}
                  onTimeSlotsByTypeChange={(slotsByType) => {
                    draftScheduleTimeSlotsByTypeRef.current = slotsByType;
                  }}
                  onBack={() => setScheduleView("list")}
                  onSave={() => {
                    setScheduleTimeSlotsByType(
                      draftScheduleTimeSlotsByTypeRef.current,
                    );
                    setScheduleRepeatType(draftScheduleRepeatTypeRef.current);
                    setScheduleSelectedWeekdays(
                      draftScheduleSelectedWeekdaysRef.current,
                    );
                    setScheduleDayOfMonth(draftScheduleDayOfMonthRef.current);
                    setScheduleEveryCount(draftScheduleEveryCountRef.current);
                    setScheduleEveryUnit(draftScheduleEveryUnitRef.current);
                    if (contentGoal) {
                      const derivedFrequency = deriveFrequencyFromSchedule(
                        draftScheduleRepeatTypeRef.current,
                        draftScheduleSelectedWeekdaysRef.current,
                        draftScheduleEveryUnitRef.current,
                        draftScheduleTimeSlotsByTypeRef.current,
                      );
                      setContentGoal(selfValue, {
                        ...contentGoal,
                        postingCount: derivedFrequency.count,
                        postingFrequencyUnit: derivedFrequency.unit,
                      });
                    }
                    setScheduleView("list");
                  }}
                />
              ) : (
                <SchedulePanel
                  className="min-h-[300px] flex-1"
                  groups={scheduleGroups}
                  dateRange={dateRange}
                  onDateRangeChange={handleRangeChange}
                  selectedRowId={activeSlotId}
                  onSlotClick={(panelSlot) => {
                    const slot = slots.find((s) => s.id === panelSlot.rowId);
                    if (slot) handleSlotClick(slot);
                  }}
                  onScheduleAllDraft={handleScheduleAllDraft}
                  onCreatePosts={handleCreatePosts}
                  onAddSchedule={handleAddSchedule}
                  onSlotDelete={(panelSlot) => {
                    const slot = slots.find((s) => s.id === panelSlot.rowId);
                    if (slot) handleRequestDeleteSlot(slot);
                  }}
                  onOpenSettings={() => {
                    draftScheduleTimeSlotsByTypeRef.current =
                      scheduleTimeSlotsByType;
                    draftScheduleRepeatTypeRef.current = scheduleRepeatType;
                    draftScheduleSelectedWeekdaysRef.current =
                      scheduleSelectedWeekdays;
                    draftScheduleDayOfMonthRef.current = scheduleDayOfMonth;
                    draftScheduleEveryCountRef.current = scheduleEveryCount;
                    draftScheduleEveryUnitRef.current = scheduleEveryUnit;
                    setScheduleView("settings");
                  }}
                />
              )}
            </div>
          </div>

          <div className="flex w-full min-w-0 flex-col overflow-hidden">
            <div className="flex items-center justify-center gap-[var(--gb-spacing-4)] border-b-[length:var(--gb-border-1)] border-[var(--gb-border-subtler)] px-[var(--gb-spacing-8)] py-[var(--gb-spacing-4)]">
              <ButtonGroup
                type="menu"
                activeId="contents-studio"
                onActiveChange={(id) => {
                  const path = GNB_PATHS[id === "home" ? "dashboard" : id];
                  if (path) router.push(path);
                }}
              />
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto">
              {!hasAnyPost ? (
                <div className="flex h-full w-full flex-col items-center justify-center gap-[var(--gb-spacing-4)]">
                  <p className="text-lg-semi-bold text-[var(--gb-text-default)]">
                    Ready to create your posts?
                  </p>
                  <p className="text-sm-regular text-[var(--gb-text-subtle)]">
                    We&rsquo;ll help you shape it to fit your brand.
                  </p>
                  <Button
                    variant="primary"
                    onClick={() => requestGeneration({ defaultCount: 9 })}
                  >
                    Get started
                  </Button>
                </div>
              ) : (
                <div className="flex-1 columns-[360px] gap-[var(--gb-spacing-3)] overflow-y-auto px-[var(--gb-spacing-8)] pt-[var(--gb-spacing-2-5)] pb-[var(--gb-spacing-8)]">
                  {posts.map((post) => (
                    <div
                      key={post.id}
                      className="mb-[var(--gb-spacing-3)] break-inside-avoid"
                    >
                      <PostCard
                        post={post}
                        avatarSrc={getSelfImage(selfValue)}
                        isHighlighted={
                          slots.find((slot) => slot.postId === post.id)?.id ===
                          activeSlotId
                        }
                        onOpenEdit={() => setEditingPostId(post.id)}
                        onScheduleDraft={() => handleScheduleDraft(post.id)}
                        onArchive={() => setArchiveConfirmPostId(post.id)}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Dialog
        open={archiveConfirmPostId !== null}
        onOpenChange={(open) => !open && setArchiveConfirmPostId(null)}
      >
        <DialogContent
          className="light"
          onInteractOutside={(event) => event.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>Move to Archive?</DialogTitle>
            <DialogDescription>
              This will be moved to your archive and take effect immediately.
            </DialogDescription>
          </DialogHeader>
          <ButtonGroup
            type="confirm"
            shouldFitContainer
            primaryLabel="Confirm"
            onSecondaryClick={() => setArchiveConfirmPostId(null)}
            onPrimaryClick={() => {
              if (archiveConfirmPostId) handleArchivePost(archiveConfirmPostId);
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={deleteSlotId !== null}
        onOpenChange={(open) => !open && setDeleteSlotId(null)}
      >
        <DialogContent
          className="light"
          onInteractOutside={(event) => event.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>Delete this schedule?</DialogTitle>
            <DialogDescription>
              The post in this slot will be moved to your archive and the
              schedule removed immediately.
            </DialogDescription>
          </DialogHeader>
          <ButtonGroup
            type="confirm"
            shouldFitContainer
            primaryLabel="Confirm"
            onSecondaryClick={() => setDeleteSlotId(null)}
            onPrimaryClick={handleConfirmDeleteSlot}
          />
        </DialogContent>
      </Dialog>

      <PostingModalDialog
        open={generationTarget !== null && missingProfileItems.length === 0}
        onOpenChange={(open) => {
          if (open) return;
          pendingScheduleRef.current = null;
          setGenerationTarget(null);
        }}
        platforms={postingPlatforms}
        onAddPlatform={(platform) =>
          setPostingPlatforms((prev) => [...prev, platform])
        }
        onRemovePlatform={(index) =>
          setPostingPlatforms((prev) => prev.filter((_, i) => i !== index))
        }
        postCount={postingCount}
        onPostCountChange={setPostingCount}
        postTypeIndex={postingTypeIndex}
        onPostTypeChange={setPostingTypeIndex}
        instruction={postingInstruction}
        onInstructionChange={setPostingInstruction}
        onAutoGenerate={() => handleGenerate(postingCount)}
        defaultSelectedImageStyleId={IMAGE_STYLE_OPTIONS[0]!.id}
        defaultReferenceImages={referenceImages}
        selfLabel={getSelfLabel(selfValue)}
        onClose={() => setGenerationTarget(null)}
      />

      <ProcessingModal
        open={processingCount !== null}
        onCancel={() => setProcessingCount(null)}
        onComplete={handleProcessingComplete}
      />

      <IncompleteProfileDialog
        open={incompleteProfileOpen}
        onOpenChange={(open) => {
          setIncompleteProfileOpen(open);
          if (!open) {
            pendingScheduleRef.current = null;
            setGenerationTarget(null);
          }
        }}
        missingItems={missingProfileItems}
        onCompleteNow={handleCompleteProfileNow}
      />

      <PostEditDialog
        post={editingPost}
        open={editingPostId !== null}
        onOpenChange={(open) => !open && setEditingPostId(null)}
        onSaveChanges={(updated) => {
          setPosts((prev) =>
            prev.map((post) => (post.id === updated.id ? updated : post)),
          );
          setEditingPostId(null);
        }}
        onScheduleDraft={(updated) => {
          setPosts((prev) =>
            prev.map((post) =>
              post.id === updated.id
                ? { ...updated, status: "scheduled" }
                : post,
            ),
          );
          setEditingPostId(null);
        }}
        onArchive={() => editingPostId && handleArchivePost(editingPostId)}
        selfLabel={getSelfLabel(selfValue)}
        avatarSrc={getSelfImage(selfValue)}
      />

      <GoalEditDialog
        open={goalOpen}
        onOpenChange={(open) => {
          setGoalOpen(open);
          if (!open) advanceCompletionQueue();
        }}
        colorScheme="light"
        defaultNow={selfGoal?.now ?? ""}
        defaultGoal={selfGoal?.next ?? ""}
        onNowChange={(value) => {
          draftGoalRef.current.now = value;
        }}
        onGoalChange={(value) => {
          draftGoalRef.current.next = value;
        }}
        onSave={() => {
          setSelfGoal(selfValue, {
            now: draftGoalRef.current.now,
            next: draftGoalRef.current.next,
          });
          setGoalOpen(false);
          advanceCompletionQueue();
        }}
        defaultPostingCount={3}
        defaultPostingFrequency="Day"
        defaultTargetedFollowersIndex={1}
        defaultTimeframe="1 year"
      />

      <ContentGoalDialog
        open={contentGoalOpen}
        onOpenChange={(open) => {
          setContentGoalOpen(open);
          if (!open) advanceCompletionQueue();
        }}
        defaultContentGoal={contentGoal?.contentGoal ?? ""}
        defaultPillars={contentGoal?.pillars ?? []}
        defaultRatio={contentGoal?.ratio}
        defaultPostingCount={contentGoal?.postingCount ?? 3}
        defaultPostingFrequencyUnit={
          contentGoal?.postingFrequencyUnit ?? "Week"
        }
        onContentGoalChange={(value) => {
          draftContentGoalRef.current.contentGoal = value;
        }}
        onPillarsChange={(value) => {
          draftContentGoalRef.current.pillars = value;
        }}
        onRatioChange={(value) => {
          draftContentGoalRef.current.ratio = value;
        }}
        onPostingCountChange={(value) => {
          draftContentGoalRef.current.postingCount = value;
        }}
        onPostingFrequencyUnitChange={(value) => {
          draftContentGoalRef.current.postingFrequencyUnit = value;
        }}
        onSave={() => {
          setContentGoal(selfValue, { ...draftContentGoalRef.current });
          const derivedSchedule = deriveScheduleFromFrequency(
            draftContentGoalRef.current.postingCount,
            draftContentGoalRef.current.postingFrequencyUnit,
            {
              selectedWeekdays: scheduleSelectedWeekdays,
              dayOfMonth: scheduleDayOfMonth,
              timeSlotsByType: scheduleTimeSlotsByType,
            },
          );
          setScheduleRepeatType(derivedSchedule.repeatType);
          setScheduleSelectedWeekdays(derivedSchedule.selectedWeekdays);
          setScheduleDayOfMonth(derivedSchedule.dayOfMonth);
          setScheduleTimeSlotsByType(derivedSchedule.timeSlotsByType);
          setContentGoalOpen(false);
          advanceCompletionQueue();
        }}
      />

      <ToneOfVoiceDialog
        open={toneOfVoiceOpen}
        onOpenChange={(open) => {
          setToneOfVoiceOpen(open);
          if (!open) advanceCompletionQueue();
        }}
        defaultReferenceLink={toneOfVoice?.referenceLink ?? ""}
        defaultReferenceText={toneOfVoice?.referenceText ?? ""}
        defaultTraits={toneOfVoice?.traits ?? []}
        onReferenceFileChange={(file) => {
          draftToneOfVoiceRef.current.referenceFileName = file?.name ?? "";
        }}
        onReferenceLinkChange={(value) => {
          draftToneOfVoiceRef.current.referenceLink = value;
        }}
        onReferenceTextChange={(value) => {
          draftToneOfVoiceRef.current.referenceText = value;
        }}
        onTraitsChange={(value) => {
          draftToneOfVoiceRef.current.traits = value;
        }}
        onSave={() => {
          setToneOfVoice(selfValue, { ...draftToneOfVoiceRef.current });
          setToneOfVoiceOpen(false);
          advanceCompletionQueue();
        }}
      />
    </div>
  );
}
