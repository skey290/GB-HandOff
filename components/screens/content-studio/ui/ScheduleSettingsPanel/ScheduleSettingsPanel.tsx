"use client";

import * as React from "react";
import { ArrowLeft, Minus, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { CalendarRangeValue } from "@/components/ui/calendar";
import { InputTime, type TimePeriod } from "@/components/ui/input-time";
import { RangeSelect } from "@/components/ui/range-select";
import { Select, type SelectOption } from "@/components/ui/select";
import { cn } from "@/lib/utils";

import styles from "./ScheduleSettingsPanel.module.css";

/** Figma `Type` (`settings-daily`/`settings-weekly`/`settings-monthly`/`settings-custom`), without the shared `settings-` prefix. */
export type ScheduleSettingsPanelRepeatType =
  "daily" | "weekly" | "monthly" | "custom";

const REPEAT_TABS: { id: ScheduleSettingsPanelRepeatType; label: string }[] = [
  { id: "daily", label: "Daily" },
  { id: "weekly", label: "Weekly" },
  { id: "monthly", label: "Monthly" },
  { id: "custom", label: "Custom" },
];

const WEEKDAYS: { id: string; label: string }[] = [
  { id: "mon", label: "M" },
  { id: "tue", label: "T" },
  { id: "wed", label: "W" },
  { id: "thu", label: "T" },
  { id: "fri", label: "F" },
  { id: "sat", label: "S" },
  { id: "sun", label: "S" },
];

const EVERY_UNIT_OPTIONS: SelectOption[] = [
  { value: "days", label: "Days" },
  { value: "weeks", label: "Weeks" },
  { value: "months", label: "Months" },
];

const NUMBER_MASK_MAX_DIGITS = 2;

function extractDigits(value: string, maxDigits: number): string {
  return value.replace(/\D/g, "").slice(0, maxDigits);
}

interface NumberMaskInputProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  maxDigits?: number;
  "aria-label": string;
  className?: string;
}

/** Borderless "_ _" placeholder digit field, shared by the occurrence stepper and "Every" interval inputs ("Day of every month" has its own `DayOfMonthInput` below, since it's range-validated). */
function NumberMaskInput({
  value,
  defaultValue = "",
  onValueChange,
  maxDigits = NUMBER_MASK_MAX_DIGITS,
  className,
  ...props
}: NumberMaskInputProps) {
  const isControlled = value !== undefined;
  const [uncontrolledDigits, setUncontrolledDigits] = React.useState(() =>
    extractDigits(defaultValue, maxDigits),
  );
  const digits = isControlled
    ? extractDigits(value, maxDigits)
    : uncontrolledDigits;

  const commit = (next: string) => {
    if (!isControlled) setUncontrolledDigits(next);
    onValueChange?.(next);
  };

  return (
    <input
      {...props}
      type="text"
      inputMode="numeric"
      value={digits}
      placeholder="_ _"
      onChange={(event) => commit(extractDigits(event.target.value, maxDigits))}
      className={cn(styles.numberMask, className)}
    />
  );
}

const DAY_OF_MONTH_MIN = 1;
const DAY_OF_MONTH_MAX = 31;
const DAY_OF_MONTH_ERROR_MESSAGE = "Enter a day between 1 and 31.";

/** Matches InputTime's shake-on-invalid timing (components/ui/input-time/input-time.tsx). */
const SHAKE_ANIMATION_MS = 400;
const VALIDATION_ERROR_AUTO_DISMISS_MS = 2000;
const SHAKE_ANIMATION_CLASS = "animate-[shake_0.4s_ease-in-out]";

interface DayOfMonthInputProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Called whenever the rejected-keystroke state changes. The error message
   * itself is rendered by the parent, full-width below the row — same split
   * as `InputTime`/`TimeMaskInput`. */
  onInvalidChange?: (invalid: boolean) => void;
  className?: string;
}

/** "Day of every month" field — same borderless digit look as `NumberMaskInput`,
 * but restricted to 1–31: a keystroke that would push the value out of range is
 * rejected and shown as a shaking red warning instead of being typed. */
function DayOfMonthInput({
  value,
  defaultValue = "",
  onValueChange,
  onInvalidChange,
  className,
}: DayOfMonthInputProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [isInvalid, setIsInvalid] = React.useState(false);
  const shakeTimeoutRef = React.useRef<number | undefined>(undefined);
  const dismissTimeoutRef = React.useRef<number | undefined>(undefined);
  const isControlled = value !== undefined;
  const [uncontrolledDigits, setUncontrolledDigits] = React.useState(() =>
    extractDigits(defaultValue, 2),
  );
  const digits = isControlled ? extractDigits(value, 2) : uncontrolledDigits;

  const commit = (next: string) => {
    if (!isControlled) setUncontrolledDigits(next);
    onValueChange?.(next);
  };

  const clearError = () => {
    if (dismissTimeoutRef.current !== undefined) {
      window.clearTimeout(dismissTimeoutRef.current);
      dismissTimeoutRef.current = undefined;
    }
    setIsInvalid(false);
    onInvalidChange?.(false);
  };

  const triggerShake = () => {
    const input = inputRef.current;
    if (!input) return;
    if (shakeTimeoutRef.current !== undefined) {
      window.clearTimeout(shakeTimeoutRef.current);
    }
    input.classList.remove(SHAKE_ANIMATION_CLASS);
    void input.offsetWidth;
    input.classList.add(SHAKE_ANIMATION_CLASS);
    shakeTimeoutRef.current = window.setTimeout(() => {
      input.classList.remove(SHAKE_ANIMATION_CLASS);
    }, SHAKE_ANIMATION_MS);
  };

  React.useEffect(() => {
    return () => {
      if (shakeTimeoutRef.current !== undefined) {
        window.clearTimeout(shakeTimeoutRef.current);
      }
      if (dismissTimeoutRef.current !== undefined) {
        window.clearTimeout(dismissTimeoutRef.current);
      }
    };
  }, []);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextDigits = extractDigits(event.target.value, 2);

    if (nextDigits === "" || nextDigits.length < digits.length) {
      commit(nextDigits);
      clearError();
      return;
    }

    const numeric = Number(nextDigits);
    if (numeric < DAY_OF_MONTH_MIN || numeric > DAY_OF_MONTH_MAX) {
      setIsInvalid(true);
      onInvalidChange?.(true);
      triggerShake();
      if (dismissTimeoutRef.current !== undefined) {
        window.clearTimeout(dismissTimeoutRef.current);
      }
      dismissTimeoutRef.current = window.setTimeout(
        clearError,
        VALIDATION_ERROR_AUTO_DISMISS_MS,
      );
      return;
    }

    commit(nextDigits);
    if (isInvalid) clearError();
  };

  return (
    <input
      ref={inputRef}
      type="text"
      inputMode="numeric"
      aria-label="Day of every month"
      value={digits}
      placeholder="_ _"
      onChange={handleChange}
      style={isInvalid ? { color: "var(--gb-text-warning)" } : undefined}
      className={cn(styles.numberMask, className)}
    />
  );
}

/** One row under "On Each Day". The stepper's count always equals `timeSlots.length` — stepping or typing a number resizes this array directly, so the two can never drift out of sync. */
export interface ScheduleTimeSlotValue {
  time?: string;
  period?: TimePeriod;
}

/** "On Each Day" is kept per Repeat tab — switching from Daily to Weekly
 * shouldn't carry over however many times/day Daily was set to. */
export type ScheduleTimeSlotsByRepeatType = Record<
  ScheduleSettingsPanelRepeatType,
  ScheduleTimeSlotValue[]
>;

/** Resizes a time-slot list to `nextCount` rows, keeping each existing row's
 * `time`/`period` by index. New rows beyond the existing count are filled in
 * (not left empty) — `time` carries the previous row's `time` forward (or
 * "11:00" for the very first row), and `period` does the same, so growing
 * the count via the stepper never produces a row the user has to type into
 * before it's valid. Shared with `app/review/content-studio/page.tsx` so
 * Content Goal's Posting frequency and this panel's "On Each Day" stay in
 * sync using the same resize rule. */
export function resizeScheduleTimeSlots(
  current: ScheduleTimeSlotValue[],
  nextCount: number,
): ScheduleTimeSlotValue[] {
  const count = Math.max(0, nextCount);
  const next: ScheduleTimeSlotValue[] = [];
  for (let i = 0; i < count; i++) {
    const existing = current[i];
    const period: TimePeriod = existing?.period ?? next[i - 1]?.period ?? "AM";
    const time = existing?.time ?? next[i - 1]?.time ?? "11:00";
    next.push({ time, period });
  }
  return next;
}

// A real value (not `{}`) — Save requires every row to have a typed-in
// `time`, so a component used standalone with no `defaultTimeSlotsByType`
// needs its single starting row to already be valid.
const DEFAULT_TIME_SLOTS_BY_TYPE: ScheduleTimeSlotsByRepeatType = {
  daily: [{ time: "11:00", period: "AM" }],
  weekly: [{ time: "11:00", period: "AM" }],
  monthly: [{ time: "11:00", period: "AM" }],
  custom: [{ time: "11:00", period: "AM" }],
};

function useUncontrolled<T>(
  value: T | undefined,
  defaultValue: T,
  onChange?: (value: T) => void,
): [T, (next: T) => void] {
  const isControlled = value !== undefined;
  const [uncontrolledValue, setUncontrolledValue] =
    React.useState(defaultValue);
  const current = isControlled ? value : uncontrolledValue;

  const commit = (next: T) => {
    if (!isControlled) setUncontrolledValue(next);
    onChange?.(next);
  };

  return [current, commit];
}

export interface ScheduleSettingsPanelProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "children" | "defaultValue"
> {
  /** Which Repeat tab is active, when used as a controlled component. */
  repeatType?: ScheduleSettingsPanelRepeatType;
  /** Initial Repeat tab when used as an uncontrolled component. */
  defaultRepeatType?: ScheduleSettingsPanelRepeatType;
  /** Called when a Repeat tab is clicked. */
  onRepeatTypeChange?: (type: ScheduleSettingsPanelRepeatType) => void;

  /** Range select value when controlled. */
  dateRange?: CalendarRangeValue;
  /** Range select initial value when uncontrolled. */
  defaultDateRange?: CalendarRangeValue;
  /** Called when the selected date range changes. */
  onDateRangeChange?: (range: CalendarRangeValue) => void;

  /** Back-arrow button click handler, returning to the main schedule panel. */
  onBack?: () => void;

  /** Selected weekday ids for `repeatType="weekly"` ("On Every"). */
  selectedWeekdays?: string[];
  /** Initial selected weekday ids when uncontrolled. */
  defaultSelectedWeekdays?: string[];
  /** Called when a weekday pill is toggled. */
  onSelectedWeekdaysChange?: (ids: string[]) => void;

  /** Day-of-month digits for `repeatType="monthly"` ("On this date"). */
  dayOfMonth?: string;
  defaultDayOfMonth?: string;
  onDayOfMonthChange?: (value: string) => void;

  /** Interval count for `repeatType="custom"` ("Every"). */
  everyCount?: string;
  defaultEveryCount?: string;
  onEveryCountChange?: (value: string) => void;
  /** Interval unit for `repeatType="custom"`. */
  everyUnit?: string;
  defaultEveryUnit?: string;
  onEveryUnitChange?: (value: string) => void;

  /** Time slots under "On Each Day", kept separately per Repeat tab — one `InputTime` row per entry in the active tab's list. The stepper above them shows and controls the active tab's `length` directly. */
  timeSlotsByType?: ScheduleTimeSlotsByRepeatType;
  defaultTimeSlotsByType?: ScheduleTimeSlotsByRepeatType;
  onTimeSlotsByTypeChange?: (slots: ScheduleTimeSlotsByRepeatType) => void;

  /** Save button click handler. */
  onSave?: () => void;
}

export function ScheduleSettingsPanel({
  className,
  repeatType,
  defaultRepeatType = "daily",
  onRepeatTypeChange,
  dateRange,
  defaultDateRange,
  onDateRangeChange,
  onBack,
  selectedWeekdays,
  defaultSelectedWeekdays = [],
  onSelectedWeekdaysChange,
  dayOfMonth,
  defaultDayOfMonth = "",
  onDayOfMonthChange,
  everyCount,
  defaultEveryCount = "",
  onEveryCountChange,
  everyUnit,
  defaultEveryUnit = "days",
  onEveryUnitChange,
  timeSlotsByType: timeSlotsByTypeProp,
  defaultTimeSlotsByType = DEFAULT_TIME_SLOTS_BY_TYPE,
  onTimeSlotsByTypeChange,
  onSave,
  ...props
}: ScheduleSettingsPanelProps) {
  const [currentRepeatType, setRepeatType] = useUncontrolled(
    repeatType,
    defaultRepeatType,
    onRepeatTypeChange,
  );
  const [currentWeekdays, setWeekdays] = useUncontrolled(
    selectedWeekdays,
    defaultSelectedWeekdays,
    onSelectedWeekdaysChange,
  );
  const [currentDayOfMonth, setDayOfMonth] = useUncontrolled(
    dayOfMonth,
    defaultDayOfMonth,
    onDayOfMonthChange,
  );
  const [currentEveryCount, setEveryCount] = useUncontrolled(
    everyCount,
    defaultEveryCount,
    onEveryCountChange,
  );
  const [currentEveryUnit, setEveryUnit] = useUncontrolled(
    everyUnit,
    defaultEveryUnit,
    onEveryUnitChange,
  );
  const [timeSlotsByType, setTimeSlotsByType] = useUncontrolled(
    timeSlotsByTypeProp,
    defaultTimeSlotsByType,
    onTimeSlotsByTypeChange,
  );
  const currentTimeSlots = timeSlotsByType[currentRepeatType];
  const setTimeSlots = (next: ScheduleTimeSlotValue[]) => {
    setTimeSlotsByType({ ...timeSlotsByType, [currentRepeatType]: next });
  };
  const occurrencesCount = currentTimeSlots.length;
  const [isDayOfMonthInvalid, setIsDayOfMonthInvalid] = React.useState(false);

  // Repeat 탭마다 실제로 입력해야 하는 값이 비어있으면 Save를 막는다 —
  // Weekly는 요일 하나도 안 고르면, Monthly는 날짜를 안 쓰면, Custom은
  // 간격 숫자를 안 쓰면 저장할 스케줄이 없는 것과 같다. "On Each Day"는
  // 스테퍼로 늘어난 줄도 `resizeScheduleTimeSlots`가 실제 값을 채워주지만,
  // 사용자가 직접 시간을 지워 빈칸으로 만든 경우까지 그대로 저장되지 않도록
  // 막는다.
  const hasUnfilledTimeSlot = currentTimeSlots.some((slot) => !slot.time);
  const isSaveDisabled =
    hasUnfilledTimeSlot ||
    (currentRepeatType === "weekly" && currentWeekdays.length === 0) ||
    (currentRepeatType === "monthly" && currentDayOfMonth.trim() === "") ||
    (currentRepeatType === "custom" && currentEveryCount.trim() === "");

  const toggleWeekday = (id: string) => {
    setWeekdays(
      currentWeekdays.includes(id)
        ? currentWeekdays.filter((day) => day !== id)
        : [...currentWeekdays, id],
    );
  };

  // The stepper's number IS `currentTimeSlots.length` — resizing the array
  // (not a separately-tracked count) is what keeps the digits and the actual
  // time rows below from ever drifting out of sync. A new row's `time`
  // stays unset so `InputTime` shows its normal "11:00" placeholder — but
  // `period` always gets a real value (copied from the row above, or "AM"
  // for the first row), since the AM/PM toggle has no valid "unset" state
  // and a slot the save/export path silently drops because `period` was
  // never touched would make the stepper's count lie about how many slots
  // actually get used.
  const resizeTimeSlots = (nextCount: number) => {
    setTimeSlots(resizeScheduleTimeSlots(currentTimeSlots, nextCount));
  };

  const stepOccurrences = (delta: 1 | -1) =>
    resizeTimeSlots(occurrencesCount + delta);

  const updateTimeSlot = (
    index: number,
    patch: Partial<ScheduleTimeSlotValue>,
  ) => {
    setTimeSlots(
      currentTimeSlots.map((slot, i) =>
        i === index ? { ...slot, ...patch } : slot,
      ),
    );
  };

  const removeTimeSlot = (index: number) => {
    setTimeSlots(currentTimeSlots.filter((_, i) => i !== index));
  };

  return (
    <div className={cn(styles.root, className)} {...props}>
      <div className={styles.headerRow}>
        <RangeSelect
          className={styles.rangeSelect}
          value={dateRange}
          defaultValue={defaultDateRange}
          onValueChange={onDateRangeChange}
        />
        <Button
          variant="icon"
          aria-label="Back to schedule panel"
          icon={<ArrowLeft />}
          onClick={onBack}
        />
      </div>

      <div className={styles.body}>
        <div className={styles.repeatSection}>
          <p className={styles.sectionTitle}>Repeat</p>
          <div className={styles.repeatTabs} role="tablist">
            {REPEAT_TABS.map((tab) => {
              const selected = tab.id === currentRepeatType;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  data-selected={selected || undefined}
                  onClick={() => setRepeatType(tab.id)}
                  className={styles.repeatTab}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {currentRepeatType === "weekly" && (
            <div className={styles.fieldGroup}>
              <p className={styles.fieldLabel}>On Every</p>
              <div className={styles.weekdayRow}>
                {WEEKDAYS.map((day, index) => {
                  const selected = currentWeekdays.includes(day.id);
                  return (
                    <button
                      key={`${day.id}-${index}`}
                      type="button"
                      aria-pressed={selected}
                      aria-label={day.id}
                      data-selected={selected || undefined}
                      onClick={() => toggleWeekday(day.id)}
                      className={styles.weekdayPill}
                    >
                      {day.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {currentRepeatType === "monthly" && (
            <div className={styles.fieldGroup}>
              <p className={styles.fieldLabel}>On this date</p>
              <div className={styles.inlineRow}>
                <span className={styles.inlineLabel}>Day</span>
                <DayOfMonthInput
                  value={currentDayOfMonth}
                  onValueChange={setDayOfMonth}
                  onInvalidChange={setIsDayOfMonthInvalid}
                  className={styles.numberMaskSemibold}
                />
                <span className={styles.inlineLabel}>of every month</span>
              </div>
              {isDayOfMonthInvalid && (
                <p className={styles.error}>{DAY_OF_MONTH_ERROR_MESSAGE}</p>
              )}
            </div>
          )}

          {currentRepeatType === "custom" && (
            <div className={styles.fieldGroup}>
              <p className={styles.fieldLabel}>Every</p>
              <div className={styles.inlineRow}>
                <NumberMaskInput
                  aria-label="Repeat interval"
                  value={currentEveryCount}
                  onValueChange={setEveryCount}
                  className={styles.numberMaskSemibold}
                />
                <Select
                  options={EVERY_UNIT_OPTIONS}
                  value={currentEveryUnit}
                  onValueChange={setEveryUnit}
                  className={styles.everyUnitSelect}
                />
              </div>
            </div>
          )}
        </div>

        <div className={styles.divider} />

        <div className={styles.onEachDaySection}>
          <p className={styles.sectionTitle}>On Each Day</p>

          <div className={styles.fieldGroup}>
            <p className={styles.fieldLabel}>
              How often would you like to post?
            </p>
            <div className={styles.stepperRow}>
              <button
                type="button"
                aria-label="Decrease occurrences per day"
                onClick={() => stepOccurrences(-1)}
                className={styles.stepperButton}
              >
                <Minus aria-hidden="true" className={styles.stepperIcon} />
              </button>
              <NumberMaskInput
                aria-label="Occurrences per day"
                value={String(occurrencesCount)}
                onValueChange={(value) => resizeTimeSlots(Number(value || 0))}
                className={styles.numberMaskSemibold}
              />
              <button
                type="button"
                aria-label="Increase occurrences per day"
                onClick={() => stepOccurrences(1)}
                className={styles.stepperButton}
              >
                <Plus aria-hidden="true" className={styles.stepperIcon} />
              </button>
              <span className={styles.inlineLabel}>time(s) a day</span>
            </div>
          </div>

          {currentTimeSlots.map((slot, index) => (
            <InputTime
              key={index}
              label={
                index === 0
                  ? "When would you like to post?"
                  : `When would you like to post? (slot ${index + 1})`
              }
              showTitle={index === 0}
              value={slot.time}
              onValueChange={(value) => updateTimeSlot(index, { time: value })}
              period={slot.period}
              onPeriodChange={(period) => updateTimeSlot(index, { period })}
              showDelete
              onDelete={() => removeTimeSlot(index)}
              shouldFitContainer
            />
          ))}
        </div>

        <Button
          variant="primary"
          className={styles.saveButton}
          onClick={onSave}
          disabled={isSaveDisabled}
        >
          Save
        </Button>
      </div>
    </div>
  );
}
