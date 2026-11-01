"use client";

import * as React from "react";
import { X } from "lucide-react";

import { Chatbox, type ChatboxProps } from "@/components/ui/chatbox";
import { Chips } from "@/components/ui/chips";

import styles from "./chatbox-composer.module.css";

/**
 * Composition component that places content into Chatbox's
 * (`components/ui/chatbox`) `-> Slot`.
 *
 * The atom is only responsible for "picking a file" — what the picked file
 * looks like is decided here, as either a thumbnail row or filter chips.
 */
export interface ChatboxComposerImage {
  src: string;
  alt?: string;
}

export type ChatboxComposerVariant = "default" | "image" | "chips";

const CHIP_LABELS = ["All", "Image", "Text"] as const;

interface ChatboxComposerSharedProps extends Omit<
  ChatboxProps,
  "children" | "onAttachFiles" | "accept" | "multiple"
> {
  /** List of attached images when used as a controlled component */
  images?: ChatboxComposerImage[];
  /** Initial list of attached images when used as an uncontrolled component (images added via the attach button accumulate here) */
  defaultImages?: ChatboxComposerImage[];
  /** Called when the X button on the top-right of an image is clicked (passes the index) */
  onRemoveImage?: (index: number) => void;
  /** Called when the attach button is clicked */
  onAttach?: () => void;
}

export type ChatboxComposerProps = ChatboxComposerSharedProps &
  (
    | { variant?: "default" | "image" }
    | {
        variant: "chips";
        /** Selected chip index when used as a controlled component (0=All/1=Image/2=Text, or whatever order `chipLabels` gives) */
        selectedChip?: number;
        /** Initial selected index when used as an uncontrolled component */
        defaultSelectedChip?: number;
        /** Called when the chip selection changes */
        onChipChange?: (index: number) => void;
        /** Overrides the default ["All","Image","Text"] set — e.g. a consumer with no "All" case */
        chipLabels?: readonly string[];
      }
  );

/** Implementation-only flattened type — lets variant-specific props be destructured all at once. */
type ChatboxComposerInternalProps = ChatboxComposerSharedProps & {
  variant?: ChatboxComposerVariant;
  selectedChip?: number;
  defaultSelectedChip?: number;
  onChipChange?: (index: number) => void;
  chipLabels?: readonly string[];
};

export function ChatboxComposer(props: ChatboxComposerProps) {
  const {
    variant = "default",
    images,
    defaultImages = [],
    onRemoveImage,
    onAttach,
    selectedChip,
    defaultSelectedChip = 0,
    onChipChange,
    chipLabels = CHIP_LABELS,
    disabled = false,
    ...chatboxProps
  } = props as ChatboxComposerInternalProps;

  const isImagesControlled = images !== undefined;
  const [uncontrolledImages, setUncontrolledImages] =
    React.useState<ChatboxComposerImage[]>(defaultImages);
  const currentImages = isImagesControlled ? images : uncontrolledImages;

  const handleRemoveImage = (index: number) => {
    if (!isImagesControlled) {
      setUncontrolledImages((prev) => {
        const removed = prev[index];
        if (removed?.src.startsWith("blob:")) {
          URL.revokeObjectURL(removed.src);
        }
        return prev.filter((_, i) => i !== index);
      });
    }
    onRemoveImage?.(index);
  };

  const handleAttachFiles = (files: File[]) => {
    onAttach?.();
    if (!isImagesControlled) {
      setUncontrolledImages((prev) => [
        ...prev,
        ...files.map((file) => ({
          src: URL.createObjectURL(file),
          alt: file.name,
        })),
      ]);
    }
  };

  const isChipControlled = selectedChip !== undefined;
  const [uncontrolledChip, setUncontrolledChip] =
    React.useState(defaultSelectedChip);
  const currentChip = isChipControlled ? selectedChip : uncontrolledChip;

  const handleChipClick = (index: number) => {
    if (!isChipControlled) {
      setUncontrolledChip(index);
    }
    onChipChange?.(index);
  };

  const showImages = currentImages.length > 0;
  const showChips = variant === "chips";

  return (
    <Chatbox
      {...chatboxProps}
      disabled={disabled}
      accept="image/*"
      multiple
      onAttachFiles={handleAttachFiles}
    >
      {showImages ? (
        <div className={styles.imageRow}>
          {currentImages.map((image, index) => (
            <div key={index} className={styles.imageItem}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image.src}
                alt={image.alt ?? ""}
                className={styles.thumbnail}
              />
              <button
                type="button"
                onClick={() => handleRemoveImage(index)}
                aria-label="이미지 제거"
                className={styles.removeButton}
              >
                <X className={styles.removeIcon} aria-hidden="true" />
              </button>
            </div>
          ))}
        </div>
      ) : null}

      {showChips ? (
        <div className={styles.chipRow}>
          {chipLabels.map((label, index) => (
            <Chips
              key={label}
              type="button"
              variant="secondary"
              selected={currentChip === index}
              disabled={disabled}
              onClick={() => handleChipClick(index)}
            >
              {label}
            </Chips>
          ))}
        </div>
      ) : null}
    </Chatbox>
  );
}
