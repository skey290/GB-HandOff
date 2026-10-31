"use client";

import * as React from "react";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Chips } from "@/components/ui/chips";
import { Textarea } from "@/components/ui/textarea";
import { Icon } from "@/lib/sprite-icon";

import styles from "./ContentGoalForm.module.css";

export type ContentPillar =
  | "Thought Leadership"
  | "Case Study"
  | "Personal Story"
  | "Tips & Tricks"
  | "Industry News"
  | "Behind the Scenes";

export type ContentRatio = "Text-heavy" | "Balanced" | "Image-heavy";

export type PostingFrequencyUnit = "Day" | "Week" | "Month";

export const CONTENT_PILLARS: readonly ContentPillar[] = [
  "Thought Leadership",
  "Case Study",
  "Personal Story",
  "Tips & Tricks",
  "Industry News",
  "Behind the Scenes",
];

export const CONTENT_RATIOS: readonly ContentRatio[] = [
  "Text-heavy",
  "Balanced",
  "Image-heavy",
];

const POSTING_FREQUENCY_UNITS: readonly PostingFrequencyUnit[] = [
  "Day",
  "Week",
  "Month",
];

export interface ContentGoalFormProps {
  /** Called when the header close (X) button is clicked. Hidden when omitted */
  onClose?: () => void;

  /** Content Goal textarea value when used as a controlled component */
  contentGoal?: string;
  defaultContentGoal?: string;
  onContentGoalChange?: (value: string) => void;

  /** Selected content pillars when used as a controlled component */
  pillars?: ContentPillar[];
  defaultPillars?: ContentPillar[];
  onPillarsChange?: (value: ContentPillar[]) => void;

  /** Selected content ratio when used as a controlled component. No chip is selected until set — Figma's empty state has no default */
  ratio?: ContentRatio;
  defaultRatio?: ContentRatio;
  onRatioChange?: (value: ContentRatio) => void;

  postingCount?: number;
  defaultPostingCount?: number;
  onPostingCountChange?: (value: number) => void;

  postingFrequencyUnit?: PostingFrequencyUnit;
  defaultPostingFrequencyUnit?: PostingFrequencyUnit;
  onPostingFrequencyUnitChange?: (value: PostingFrequencyUnit) => void;

  /** Called when the bottom Save button is clicked */
  onSave?: () => void;
  /** Removes border/background/shadow/padding and embeds flush with the parent container. Used when placing inside Dialog, which supplies its own chrome. Default false */
  isEmbedded?: boolean;
}

const CONTENT_GOAL_PLACEHOLDER = "What's the main goal of your content?";

function FrequencyControl({
  count,
  unit,
  onCountChange,
  onUnitChange,
}: {
  count: number;
  unit: PostingFrequencyUnit;
  onCountChange: (value: number) => void;
  onUnitChange: (value: PostingFrequencyUnit) => void;
}) {
  return (
    <div className={styles.frequencyPanel}>
      <div className={styles.frequencyCounterRow}>
        <Button
          type="button"
          variant="icon-ghost"
          icon={<Icon id="minus-icon" />}
          aria-label="감소"
          onClick={() => onCountChange(Math.max(1, count - 1))}
        />
        <span className={styles.frequencyCount}>{count}</span>
        <Button
          type="button"
          variant="icon-ghost"
          icon={<Icon id="plus-icon" />}
          aria-label="증가"
          onClick={() => onCountChange(count + 1)}
        />
        <span className={styles.frequencyUnit}>time(s)</span>
      </div>
      <div
        role="radiogroup"
        aria-label="Posting frequency unit"
        className={styles.radioGroup}
      >
        {POSTING_FREQUENCY_UNITS.map((option) => {
          const isSelected = option === unit;
          return (
            <Button
              key={option}
              type="button"
              variant="mute"
              role="radio"
              aria-checked={isSelected}
              isSelected={isSelected}
              onClick={() => onUnitChange(option)}
              className={styles.radioButton}
            >
              {`a ${option}`}
            </Button>
          );
        })}
      </div>
    </div>
  );
}

/** `docs/components/content-goal-form.md`에서 전체 스펙 확인. Figma: Content goal setting (node-id 8832:7591). 모달 틀은 GB-Review 레포의 `components/review/shared/content-goal-dialog.tsx`가 이 컴포넌트를 감싼다 */
export function ContentGoalForm({
  onClose,
  contentGoal,
  defaultContentGoal = "",
  onContentGoalChange,
  pillars,
  defaultPillars = [],
  onPillarsChange,
  ratio,
  defaultRatio,
  onRatioChange,
  postingCount,
  defaultPostingCount = 3,
  onPostingCountChange,
  postingFrequencyUnit,
  defaultPostingFrequencyUnit = "Week",
  onPostingFrequencyUnitChange,
  onSave,
  isEmbedded = false,
}: ContentGoalFormProps) {
  const [uncontrolledContentGoal, setUncontrolledContentGoal] =
    React.useState(defaultContentGoal);
  const currentContentGoal = contentGoal ?? uncontrolledContentGoal;
  const handleContentGoalChange = (value: string) => {
    if (contentGoal === undefined) setUncontrolledContentGoal(value);
    onContentGoalChange?.(value);
  };

  const [uncontrolledPillars, setUncontrolledPillars] =
    React.useState(defaultPillars);
  const currentPillars = pillars ?? uncontrolledPillars;
  const togglePillar = (pillar: ContentPillar) => {
    const next = currentPillars.includes(pillar)
      ? currentPillars.filter((item) => item !== pillar)
      : [...currentPillars, pillar];
    if (pillars === undefined) setUncontrolledPillars(next);
    onPillarsChange?.(next);
  };

  const [uncontrolledRatio, setUncontrolledRatio] = React.useState<
    ContentRatio | undefined
  >(defaultRatio);
  const currentRatio = ratio ?? uncontrolledRatio;
  const handleRatioChange = (value: ContentRatio) => {
    if (ratio === undefined) setUncontrolledRatio(value);
    onRatioChange?.(value);
  };

  const [uncontrolledPostingCount, setUncontrolledPostingCount] =
    React.useState(defaultPostingCount);
  const currentPostingCount = postingCount ?? uncontrolledPostingCount;
  const handlePostingCountChange = (value: number) => {
    if (postingCount === undefined) setUncontrolledPostingCount(value);
    onPostingCountChange?.(value);
  };

  const [
    uncontrolledPostingFrequencyUnit,
    setUncontrolledPostingFrequencyUnit,
  ] = React.useState(defaultPostingFrequencyUnit);
  const currentPostingFrequencyUnit =
    postingFrequencyUnit ?? uncontrolledPostingFrequencyUnit;
  const handlePostingFrequencyUnitChange = (value: PostingFrequencyUnit) => {
    if (postingFrequencyUnit === undefined)
      setUncontrolledPostingFrequencyUnit(value);
    onPostingFrequencyUnitChange?.(value);
  };

  return (
    <div className={styles.root} data-embedded={isEmbedded || undefined}>
      <div className={styles.headerRow}>
        <p className={styles.headerTitle}>Contents goal & strategy</p>
        <Button
          variant="icon-ghost"
          aria-label="Close"
          icon={<X aria-hidden="true" className="size-full" />}
          onClick={onClose}
        />
      </div>

      <div className={styles.field}>
        <p className={styles.fieldTitle}>Content goal</p>
        <Textarea
          aria-label="Content goal"
          placeholder={CONTENT_GOAL_PLACEHOLDER}
          value={currentContentGoal}
          onValueChange={handleContentGoalChange}
          shouldFitContainer
        />
      </div>

      <div className={styles.field}>
        <p className={styles.fieldTitle}>Content strategy</p>

        <div className={styles.subField}>
          <p className={styles.subFieldLabel}>Content pillars</p>
          <div className={styles.chipsRow}>
            {CONTENT_PILLARS.map((pillar) => (
              <Chips
                key={pillar}
                variant="outline"
                selected={currentPillars.includes(pillar)}
                onClick={() => togglePillar(pillar)}
              >
                {pillar}
              </Chips>
            ))}
          </div>
        </div>

        <div className={styles.subField}>
          <p className={styles.subFieldLabel}>Content ratio</p>
          <div className={styles.chipsRow}>
            {CONTENT_RATIOS.map((option) => (
              <Chips
                key={option}
                variant="outline"
                selected={currentRatio === option}
                onClick={() => handleRatioChange(option)}
              >
                {option}
              </Chips>
            ))}
          </div>
        </div>

        <div className={styles.subField}>
          <p className={styles.subFieldLabel}>Posting frequency</p>
          <FrequencyControl
            count={currentPostingCount}
            unit={currentPostingFrequencyUnit}
            onCountChange={handlePostingCountChange}
            onUnitChange={handlePostingFrequencyUnitChange}
          />
        </div>
      </div>

      <Button
        variant="primary"
        className={styles.saveButton}
        disabled={
          currentContentGoal.trim().length === 0 ||
          currentPillars.length === 0 ||
          currentRatio === undefined
        }
        onClick={onSave}
      >
        Save
      </Button>
    </div>
  );
}
