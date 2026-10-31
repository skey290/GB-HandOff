import type {
  Post,
  PostPlatform,
  PostContentType,
} from "@/components/screens/content-studio/ui/PostCard";
import type { PostingFrequencyUnit } from "@/components/screens/content-studio/ui/ContentGoalForm";
import {
  resizeScheduleTimeSlots,
  type ScheduleSettingsPanelRepeatType,
  type ScheduleTimeSlotsByRepeatType,
} from "@/components/screens/content-studio/ui/ScheduleSettingsPanel";

export type { Post, PostPlatform };

export interface ScheduleSlot {
  id: string;
  dayLabel: string;
  date: string;
  time: string;
  postId: string | null;
}

const CAPTION_POOL = [
  "Not just written. Already scheduled.\nHere's how I turned a scattered week into a clear direction.",
  "SCATTERED. BUT DIRECTION.\nThe signal was always there — we just needed the right lens.",
  "Something's shifting in how early-stage teams read their own data.",
  "REFLECTIONS — captured at the right angle.\nA short note on what the numbers don't say out loud.",
  "BEYOND THE SURFACE.\nThree weeks of forecasting taught me more about trust than about math.",
  'What founders actually mean when they say "show me the model."',
  "The best financial model is the one nobody has to explain twice.",
  "Consistency isn't a content calendar. It's a decision you stop having to make.",
  "Early-stage data work is 10% modeling, 90% translation.",
];

const HASHTAG_POOL = ["#DataStorytelling", "#StartupFinance", "#BrandVoice"];

const IMAGE_POOL = [
  "/images/personas/self-default.jpg",
  "/images/personas/team-leader.jpg",
  "/images/personas/entrepreneur.jpg",
  "/images/personas/fashion-editor.jpg",
  "/images/personas/novelist.jpg",
];

/** `postTypeIndex`: PostingModal's Post Type selection — 0 "All" (mixed, the
 * default), 1 "Image" (every post gets an image), 2 "Text" (no post gets
 * an image). */
export function createGeneratedPosts(
  count: number,
  startId: number,
  platforms: PostPlatform[] = ["linkedin"],
  postTypeIndex = 0,
): Post[] {
  return Array.from({ length: count }, (_, index) => {
    const contentType: PostContentType =
      postTypeIndex === 2
        ? "text"
        : postTypeIndex === 1
          ? "image"
          : index % 3 === 0
            ? "text"
            : "image";
    const imageCount = contentType === "text" ? 0 : (index % 3) + 1;
    const images = Array.from(
      { length: imageCount },
      (_, imageIndex) => IMAGE_POOL[(index + imageIndex) % IMAGE_POOL.length]!,
    );

    return {
      id: `post-${startId + index}`,
      status: "draft",
      contentType,
      images,
      caption: CAPTION_POOL[index % CAPTION_POOL.length]!,
      hashtags: HASHTAG_POOL,
      platforms,
      date: "09.01.2026",
      time: "10:00 PM",
    };
  });
}

export const INITIAL_SLOTS: Omit<ScheduleSlot, "postId">[] = [
  { id: "slot-1", dayLabel: "Today", date: "Sep 01", time: "10:00 AM" },
  { id: "slot-2", dayLabel: "Today", date: "Sep 01", time: "02:25 PM" },
  { id: "slot-3", dayLabel: "Today", date: "Sep 01", time: "10:00 PM" },
  { id: "slot-4", dayLabel: "Tomorrow", date: "Sep 02", time: "11:00 AM" },
  { id: "slot-5", dayLabel: "Tomorrow", date: "Sep 02", time: "02:25 PM" },
  { id: "slot-6", dayLabel: "Tomorrow", date: "Sep 02", time: "09:00 PM" },
  { id: "slot-7", dayLabel: "Thursday", date: "Sep 03", time: "09:00 AM" },
  { id: "slot-8", dayLabel: "Thursday", date: "Sep 03", time: "01:00 PM" },
  { id: "slot-9", dayLabel: "Thursday", date: "Sep 03", time: "08:00 PM" },
];

export const INITIAL_POSTS: Post[] = createGeneratedPosts(9, 1);

const MORE_SLOT_TIMES = ["10:00 AM", "02:25 PM", "09:00 PM"];
const SCHEDULE_YEAR = 2026;

function parseSlotDate(date: string): Date {
  return new Date(`${date}, ${SCHEDULE_YEAR}`);
}

function formatSlotDate(date: Date): string {
  const month = date.toLocaleDateString("en-US", { month: "short" });
  const day = String(date.getDate()).padStart(2, "0");
  return `${month} ${day}`;
}

const WEEKDAY_IDS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

function buildDaySlots(
  date: Date,
  nextIndex: number,
  times: string[],
): Omit<ScheduleSlot, "postId">[] {
  const dayLabel = date.toLocaleDateString("en-US", { weekday: "long" });
  const formattedDate = formatSlotDate(date);
  return times.map((time, index) => ({
    id: `slot-${nextIndex + index}`,
    dayLabel,
    date: formattedDate,
    time,
  }));
}

/** Monday-based start of the week containing `date`. */
function startOfWeek(date: Date): Date {
  const result = new Date(date);
  const diff = (result.getDay() + 6) % 7; // Mon=0 ... Sun=6
  result.setDate(result.getDate() - diff);
  return result;
}

/** "Add Schedule" 1회 클릭 = 마지막 슬롯 다음날 하루치 슬롯. `times`의 개수가
 * 그 날의 occurrence 수가 되어 Schedule Settings의 설정값과 항상 일치한다. */
export function createNextDaySlots(
  existingSlots: Pick<ScheduleSlot, "date">[],
  nextIndex: number,
  times: string[] = MORE_SLOT_TIMES,
): Omit<ScheduleSlot, "postId">[] {
  const lastDate = parseSlotDate(existingSlots[existingSlots.length - 1]!.date);
  const nextDate = new Date(lastDate);
  nextDate.setDate(nextDate.getDate() + 1);
  return buildDaySlots(nextDate, nextIndex, times);
}

/** Weekly repeat — "On Every"에서 체크된 요일마다 그룹을 하나씩 만들고,
 * 항상 마지막 슬롯이 속한 주의 "다음 주"에 배치한다. 그래서 다시 누르면
 * 그 다음 주로 넘어간다. */
export function createNextWeekSlots(
  existingSlots: Pick<ScheduleSlot, "date">[],
  selectedWeekdayIds: string[],
  nextIndex: number,
  times: string[] = MORE_SLOT_TIMES,
): Omit<ScheduleSlot, "postId">[] {
  const lastDate = parseSlotDate(existingSlots[existingSlots.length - 1]!.date);
  const nextWeekStart = startOfWeek(lastDate);
  nextWeekStart.setDate(nextWeekStart.getDate() + 7);

  const offsets = selectedWeekdayIds
    .map((id) => WEEKDAY_IDS.indexOf(id))
    .filter((offset) => offset >= 0)
    .sort((a, b) => a - b);

  let runningIndex = nextIndex;
  return offsets.flatMap((offset) => {
    const date = new Date(nextWeekStart);
    date.setDate(date.getDate() + offset);
    const slots = buildDaySlots(date, runningIndex, times);
    runningIndex += slots.length;
    return slots;
  });
}

/** Monthly repeat — "On this date"(dayOfMonth) 값으로, 마지막 슬롯 이후
 * 가장 가까운 그 날짜에 그룹 하나를 만든다. */
export function createNextMonthSlot(
  existingSlots: Pick<ScheduleSlot, "date">[],
  dayOfMonth: string,
  nextIndex: number,
  times: string[] = MORE_SLOT_TIMES,
): Omit<ScheduleSlot, "postId">[] {
  const lastDate = parseSlotDate(existingSlots[existingSlots.length - 1]!.date);
  const day = Math.min(Math.max(Number(dayOfMonth) || 1, 1), 28);

  let candidate = new Date(lastDate.getFullYear(), lastDate.getMonth(), day);
  if (candidate <= lastDate) {
    candidate = new Date(lastDate.getFullYear(), lastDate.getMonth() + 1, day);
  }

  return buildDaySlots(candidate, nextIndex, times);
}

/** Custom repeat — "Every" 값(count + days/weeks/months)만큼 마지막 슬롯에서
 * 더한 위치에 그룹 하나를 만든다. */
export function createCustomIntervalSlot(
  existingSlots: Pick<ScheduleSlot, "date">[],
  everyCount: string,
  everyUnit: string,
  nextIndex: number,
  times: string[] = MORE_SLOT_TIMES,
): Omit<ScheduleSlot, "postId">[] {
  const lastDate = parseSlotDate(existingSlots[existingSlots.length - 1]!.date);
  const count = Math.max(Number(everyCount) || 1, 1);
  const nextDate = new Date(lastDate);
  if (everyUnit === "weeks") {
    nextDate.setDate(nextDate.getDate() + count * 7);
  } else if (everyUnit === "months") {
    nextDate.setMonth(nextDate.getMonth() + count);
  } else {
    nextDate.setDate(nextDate.getDate() + count);
  }
  return buildDaySlots(nextDate, nextIndex, times);
}

export interface DerivedScheduleSettings {
  repeatType: ScheduleSettingsPanelRepeatType;
  selectedWeekdays: string[];
  dayOfMonth: string;
  timeSlotsByType: ScheduleTimeSlotsByRepeatType;
}

/** Content Goal의 Posting frequency(count+unit) → Schedule 패널 설정. 요일/날짜
 * 세부는 임의로 정해 넣는다 — 두 설정 중 나중에 저장된 쪽이 항상 기준이 되므로
 * (Content Goal 저장 → 이 함수, Schedule 저장 → `deriveFrequencyFromSchedule`),
 * 정확히 일치하지 않아도 된다. */
export function deriveScheduleFromFrequency(
  count: number,
  unit: PostingFrequencyUnit,
  current: Pick<
    DerivedScheduleSettings,
    "selectedWeekdays" | "dayOfMonth" | "timeSlotsByType"
  >,
): DerivedScheduleSettings {
  if (unit === "Day") {
    return {
      repeatType: "daily",
      selectedWeekdays: current.selectedWeekdays,
      dayOfMonth: current.dayOfMonth,
      timeSlotsByType: {
        ...current.timeSlotsByType,
        daily: resizeScheduleTimeSlots(current.timeSlotsByType.daily, count),
      },
    };
  }

  if (unit === "Week") {
    const weekdayCount = Math.min(Math.max(count, 1), WEEKDAY_IDS.length);
    const selectedWeekdays = WEEKDAY_IDS.slice(0, weekdayCount);
    const occurrencesPerDay = Math.max(1, Math.ceil(count / weekdayCount));
    return {
      repeatType: "weekly",
      selectedWeekdays,
      dayOfMonth: current.dayOfMonth,
      timeSlotsByType: {
        ...current.timeSlotsByType,
        weekly: resizeScheduleTimeSlots(
          current.timeSlotsByType.weekly,
          occurrencesPerDay,
        ),
      },
    };
  }

  return {
    repeatType: "monthly",
    selectedWeekdays: current.selectedWeekdays,
    dayOfMonth: current.dayOfMonth.trim() === "" ? "1" : current.dayOfMonth,
    timeSlotsByType: {
      ...current.timeSlotsByType,
      monthly: resizeScheduleTimeSlots(current.timeSlotsByType.monthly, count),
    },
  };
}

/** `deriveScheduleFromFrequency`의 역방향 — Schedule 패널 설정 → Content Goal의
 * Posting frequency(count+unit). Custom 탭은 ContentGoalForm에 대응하는 단위가
 * 없어 everyUnit을 가장 가까운 Day/Week/Month로 근사한다. */
export function deriveFrequencyFromSchedule(
  repeatType: ScheduleSettingsPanelRepeatType,
  selectedWeekdays: string[],
  everyUnit: string,
  timeSlotsByType: ScheduleTimeSlotsByRepeatType,
): { count: number; unit: PostingFrequencyUnit } {
  if (repeatType === "daily") {
    return { count: timeSlotsByType.daily.length, unit: "Day" };
  }
  if (repeatType === "weekly") {
    return {
      count:
        timeSlotsByType.weekly.length * Math.max(selectedWeekdays.length, 1),
      unit: "Week",
    };
  }
  if (repeatType === "monthly") {
    return { count: timeSlotsByType.monthly.length, unit: "Month" };
  }
  const unit: PostingFrequencyUnit =
    everyUnit === "weeks" ? "Week" : everyUnit === "months" ? "Month" : "Day";
  return { count: timeSlotsByType.custom.length, unit };
}

export function parsePostDate(date: string): Date {
  const [month, day, year] = date.split(".").map(Number);
  return new Date(year ?? 2026, (month ?? 1) - 1, day ?? 1);
}
