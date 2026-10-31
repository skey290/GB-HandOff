"use client";

import * as React from "react";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Chips } from "@/components/ui/chips";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import styles from "./ToneOfVoiceForm.module.css";

export type PersonalityTrait =
  | "Soft"
  | "Bold"
  | "Playful"
  | "Professional"
  | "Warm"
  | "Direct"
  | "Analytical"
  | "Witty";

export const PERSONALITY_TRAITS: readonly PersonalityTrait[] = [
  "Soft",
  "Bold",
  "Playful",
  "Professional",
  "Warm",
  "Direct",
  "Analytical",
  "Witty",
];

export interface ToneOfVoiceFormProps {
  /** Called when the header close (X) button is clicked. Hidden when omitted */
  onClose?: () => void;

  /** A post, doc, or AI-chat export uploaded as reference material */
  referenceFile?: File | null;
  onReferenceFileChange?: (file: File | null) => void;

  /** A link to an existing post, doc, or shared AI chat */
  referenceLink?: string;
  defaultReferenceLink?: string;
  onReferenceLinkChange?: (value: string) => void;

  /** Fallback free-text paste when there's nothing to link or upload */
  referenceText?: string;
  defaultReferenceText?: string;
  onReferenceTextChange?: (value: string) => void;

  /** Selected personality traits when used as a controlled component */
  traits?: PersonalityTrait[];
  defaultTraits?: PersonalityTrait[];
  onTraitsChange?: (value: PersonalityTrait[]) => void;

  /** Called when the bottom Save button is clicked */
  onSave?: () => void;
  /** Removes border/background/shadow/padding and embeds flush with the parent container. Used when placing inside Dialog, which supplies its own chrome. Default false */
  isEmbedded?: boolean;
}

const REFERENCE_DESCRIPTION =
  "Existing posts, other writing, or AI chat/meeting notes — link, upload, or paste below.";
const REFERENCE_TEXT_PLACEHOLDER =
  "Or paste your post, writing, or AI chat text here.";
const PERSONALITY_DESCRIPTION = "Not MBTI — e.g. Soft, Playful, Warm.";

/** `docs/components/tone-of-voice-form.md`에서 전체 스펙 확인. Figma: Tone of voice setting (node-id 8832:7608). 모달 틀은 GB-Review 레포의 `components/review/shared/tone-of-voice-dialog.tsx`가 이 컴포넌트를 감싼다 */
export function ToneOfVoiceForm({
  onClose,
  referenceFile,
  onReferenceFileChange,
  referenceLink,
  defaultReferenceLink = "",
  onReferenceLinkChange,
  referenceText,
  defaultReferenceText = "",
  onReferenceTextChange,
  traits,
  defaultTraits = [],
  onTraitsChange,
  onSave,
  isEmbedded = false,
}: ToneOfVoiceFormProps) {
  const [uncontrolledReferenceFile, setUncontrolledReferenceFile] =
    React.useState<File | null>(null);
  const currentReferenceFile = referenceFile ?? uncontrolledReferenceFile;
  const handleReferenceFileChange = (file: File | null) => {
    if (referenceFile === undefined) setUncontrolledReferenceFile(file);
    onReferenceFileChange?.(file);
  };

  const [uncontrolledReferenceLink, setUncontrolledReferenceLink] =
    React.useState(defaultReferenceLink);
  const currentReferenceLink = referenceLink ?? uncontrolledReferenceLink;
  const handleReferenceLinkChange = (value: string) => {
    if (referenceLink === undefined) setUncontrolledReferenceLink(value);
    onReferenceLinkChange?.(value);
  };

  const [uncontrolledReferenceText, setUncontrolledReferenceText] =
    React.useState(defaultReferenceText);
  const currentReferenceText = referenceText ?? uncontrolledReferenceText;
  const handleReferenceTextChange = (value: string) => {
    if (referenceText === undefined) setUncontrolledReferenceText(value);
    onReferenceTextChange?.(value);
  };

  const [uncontrolledTraits, setUncontrolledTraits] =
    React.useState(defaultTraits);
  const currentTraits = traits ?? uncontrolledTraits;
  const toggleTrait = (trait: PersonalityTrait) => {
    const next = currentTraits.includes(trait)
      ? currentTraits.filter((item) => item !== trait)
      : [...currentTraits, trait];
    if (traits === undefined) setUncontrolledTraits(next);
    onTraitsChange?.(next);
  };

  return (
    <div className={styles.root} data-embedded={isEmbedded || undefined}>
      <div className={styles.headerRow}>
        <p className={styles.headerTitle}>Tone of Voice</p>
        <Button
          variant="icon-ghost"
          aria-label="Close"
          icon={<X aria-hidden="true" className="size-full" />}
          onClick={onClose}
        />
      </div>

      <div className={styles.field}>
        <p className={styles.fieldTitle}>Reference materials</p>
        <p className={styles.fieldDescription}>{REFERENCE_DESCRIPTION}</p>

        <div className={styles.referenceRow}>
          <Input
            type="upload"
            placeholder="Upload a post, doc, or file"
            file={currentReferenceFile}
            onFileChange={handleReferenceFileChange}
            aria-label="Upload reference file"
          />
          <Input
            type="link"
            placeholder="Paste a post or chat link"
            value={currentReferenceLink}
            onValueChange={handleReferenceLinkChange}
            aria-label="Reference link"
          />
        </div>

        <p className={styles.orDivider}>or</p>

        <Textarea
          aria-label="Reference text"
          placeholder={REFERENCE_TEXT_PLACEHOLDER}
          value={currentReferenceText}
          onValueChange={handleReferenceTextChange}
          shouldFitContainer
        />
      </div>

      <div className={styles.field}>
        <p className={styles.fieldTitle}>Personality type</p>
        <p className={styles.fieldDescription}>{PERSONALITY_DESCRIPTION}</p>

        <div className={styles.chipsRow}>
          {PERSONALITY_TRAITS.map((trait) => (
            <Chips
              key={trait}
              variant="outline"
              selected={currentTraits.includes(trait)}
              onClick={() => toggleTrait(trait)}
            >
              {trait}
            </Chips>
          ))}
        </div>
      </div>

      <Button
        variant="primary"
        className={styles.saveButton}
        disabled={
          (currentReferenceFile === null &&
            currentReferenceLink.trim().length === 0 &&
            currentReferenceText.trim().length === 0) ||
          currentTraits.length === 0
        }
        onClick={onSave}
      >
        Save
      </Button>
    </div>
  );
}
