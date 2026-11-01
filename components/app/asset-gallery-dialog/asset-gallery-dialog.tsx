"use client";

import * as React from "react";
import { Eraser, Replace, Trash2, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Icon } from "@/lib/sprite-icon";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Popover } from "@/components/ui/popover";
import { Select, type SelectOption } from "@/components/ui/select";
import { Tabs, type TabItem } from "@/components/ui/tabs";
import {
  AssetGalleryCard,
  type AssetGalleryCardMenuOption,
} from "@/components/app/asset-gallery-card";
import { getArchivedImages } from "@/lib/archived-asset-store";

import styles from "./asset-gallery-dialog.module.css";

const CARD_MENU_OPTIONS: AssetGalleryCardMenuOption[] = [
  {
    value: "set-as-main-portrait",
    label: "Set as main Portrait",
    icon: Replace,
  },
  {
    value: "edit-profile-portrait",
    label: "Edit Profile Portrait",
    icon: Eraser,
  },
  {
    value: "delete-self-portrait",
    label: "Delete Self Portrait",
    icon: Trash2,
  },
];

interface StyleCardOption {
  id: string;
  title: string;
  description: string;
  image: string;
}

const STYLE_CARDS: StyleCardOption[] = [
  {
    id: "deep-chroma",
    title: "Deep Chroma",
    description: "Baroque-inspired chiaroscuro",
    image: "/images/style-cards/deep-chroma.jpg",
  },
  {
    id: "natural-light",
    title: "Natural Light",
    description: "Expressionist color",
    image: "/images/style-cards/natural-light.jpg",
  },
  {
    id: "monochrome",
    title: "Monochrome",
    description: "Straight photography",
    image: "/images/style-cards/monochrome.jpg",
  },
  {
    id: "editorial",
    title: "Editorial",
    description: "Editorial portraiture",
    image: "/images/style-cards/editorial.jpg",
  },
];

const PRESETS = [
  {
    id: "preset-entrepreneur",
    src: "/images/personas/entrepreneur.jpg",
    alt: "Entrepreneur preset",
  },
  {
    id: "preset-fashion-editor",
    src: "/images/personas/fashion-editor.jpg",
    alt: "Fashion Editor preset",
  },
  {
    id: "preset-fashionista",
    src: "/images/personas/fashionista.jpg",
    alt: "Fashionista preset",
  },
  {
    id: "preset-novelist",
    src: "/images/personas/novelist.jpg",
    alt: "English Novelist preset",
  },
  {
    id: "preset-vegan-chef",
    src: "/images/personas/vegan-chef.jpg",
    alt: "Vegan Chef preset",
  },
  {
    id: "preset-yoga-meditator",
    src: "/images/personas/yoga-meditator.jpg",
    alt: "Yoga Meditator preset",
  },
  {
    id: "preset-self-default",
    src: "/images/personas/self-default.jpg",
    alt: "Data Scientist preset",
  },
  {
    id: "preset-team-leader",
    src: "/images/personas/team-leader.jpg",
    alt: "Office Worker preset",
  },
];

export interface AssetGalleryPortraitImage {
  id: string;
  src: string;
  alt: string;
  /** Shown in the Self Portrait grid's top-left corner (Figma `date` label). Omitted skips the label. */
  date?: string;
}

export interface AssetGalleryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selves: SelectOption[];
  selfId: string;
  onSelfIdChange: (selfId: string) => void;
  /** Images the user has uploaded/created for this self's portrait. Empty until they add one. */
  portraitImages: AssetGalleryPortraitImage[];
  /** Called with the chosen style card's image when Generate is clicked after an upload. The
   * second argument is `true` for the first image of a multi-style batch — the host uses it to
   * decide which of the newly generated images becomes the self's main portrait. */
  onGenerate: (imageSrc: string, isFirstOfBatch: boolean) => void;
  /** Src of this self's current main portrait — shown with a "Main" badge in the Self Portrait grid. */
  mainPortraitSrc?: string;
  /** Called with the selected reference image(s) when Generate is clicked on the Reference tab. */
  onUseReferenceImages: (imageSrcs: string[]) => void;
  /** Called with a Self Portrait's image when "Set as main Portrait" is chosen from its menu. */
  onSetMainPortrait: (imageSrc: string) => void;
  /** Called when "Edit Profile Portrait"'s style pick replaces an existing Self Portrait in place, instead of adding a new one. */
  onReplacePortrait: (imageId: string, newImageSrc: string) => void;
  /** Called with a `portraitImages` entry's id when "Delete Self Portrait" removes it — the host must drop it from the array it passes back in, or it reappears next time the dialog opens. */
  onDeletePortraitImage: (imageId: string) => void;
  /** Called with an archived image's src when "Delete Self Portrait" removes one of the images merged in from `getArchivedImages`. */
  onDeleteArchivedImage: (imageSrc: string) => void;
  /** This self's "My Reference" images (Reference tab) — kept separate per self, same as `portraitImages`. */
  myReferenceImages: AssetGalleryPortraitImage[];
  /** Called with the object URL right after a raw file is uploaded via the Reference tab's empty card — lands in "My Reference" immediately, independent of the create step that follows. */
  onUploadReferenceImage: (imageSrc: string) => void;
  /** Called with the preset(s) picked in the reference-create step when "Create my reference" is clicked. */
  onCreateReferenceImages: (images: { src: string; alt: string }[]) => void;
  /** Called with a `myReferenceImages` entry's id when its delete (X) button is clicked. */
  onDeleteReferenceImage: (imageId: string) => void;
  /** Tab shown when the dialog opens (0=Self Portrait, 1=Reference). Defaults to 0. */
  initialTabIndex?: number;
  /** Forces light/dark semantic tokens regardless of the opening page's own theme. Default "dark" */
  colorScheme?: "dark" | "light";
  /** Shows this as plain text instead of the "for" Select. Always shown (even if omitted, falling back to the matching `selves` label) when `isPickerMode` is set, since picking references has no "self" to switch. */
  selfLabel?: string;
  /**
   * Content Studio opens this dialog to pick reference images for a post, so its
   * Reference tab needs multi-select + a confirm button — the plain Self/Asset
   * Panel entry point (default) is just browsing/managing, nothing to pick. Also
   * forces the "for" field to plain text (see `selfLabel`), since there's no self
   * to switch to in that context. Default false.
   */
  isPickerMode?: boolean;
  /**
   * This session is for a self still being created, not just browsing/editing
   * an existing one — while its Self Portrait grid is still empty, closing
   * (by any means) asks to cancel creating the self instead of just closing,
   * via `onCancelCreating`. Once it has at least one portrait, the self is
   * considered finished and this dialog closes normally. Default false.
   */
  isCreatingSelf?: boolean;
  /** Called instead of `onOpenChange(false)` when the user confirms canceling self creation (see `isCreatingSelf`) — the host rolls back the in-progress self. */
  onCancelCreating?: () => void;
}

/** Asset management modal shared by the Self app (browse/manage a Self's portrait + references) and Content Studio (pick reference images for a post). */
export function AssetGalleryDialog({
  open,
  onOpenChange,
  selves,
  selfId,
  onSelfIdChange,
  portraitImages,
  onGenerate,
  mainPortraitSrc,
  onUseReferenceImages,
  onSetMainPortrait,
  onReplacePortrait,
  onDeletePortraitImage,
  onDeleteArchivedImage,
  myReferenceImages,
  onUploadReferenceImage,
  onCreateReferenceImages,
  onDeleteReferenceImage,
  initialTabIndex = 0,
  colorScheme = "dark",
  isPickerMode = false,
  selfLabel,
  isCreatingSelf = false,
  onCancelCreating,
}: AssetGalleryDialogProps) {
  const [deletedImageIds, setDeletedImageIds] = React.useState<Set<string>>(
    () => new Set(),
  );
  // Only meaningful in picker mode — tracks which My Reference/Preset images are
  // checked for the bottom "Select" button to hand back via onUseReferenceImages.
  const [selectedPresetIds, setSelectedPresetIds] = React.useState<Set<string>>(
    () => new Set(),
  );
  // Set right after an upload (Self Portrait's empty card, or Reference's) — swaps the
  // grid for the style-select step until Generate is clicked. `pendingUploadTarget` tracks
  // which gallery the generated result should land in.
  const [pendingUploadSrc, setPendingUploadSrc] = React.useState<string | null>(
    null,
  );
  const [pendingUploadTarget, setPendingUploadTarget] = React.useState<
    "self-portrait" | "reference" | null
  >(null);
  // Set when the style-select step was opened via an existing Self Portrait's
  // "Edit" menu item rather than a fresh upload — tells handleGenerate to
  // replace that image instead of adding a new one.
  const [editingPortraitImageId, setEditingPortraitImageId] = React.useState<
    string | null
  >(null);
  // Shows a shake + warning on the card when deleting it is blocked because
  // it's the only Self Portrait left. The key increments on every trigger so
  // clicking Delete again on the same (still only) image replays the shake.
  const [deleteBlockedImageId, setDeleteBlockedImageId] = React.useState<
    string | null
  >(null);
  const [deleteBlockedKey, setDeleteBlockedKey] = React.useState(0);
  const deleteBlockedTimeoutRef = React.useRef<number | undefined>(undefined);

  React.useEffect(
    () => () => window.clearTimeout(deleteBlockedTimeoutRef.current),
    [],
  );
  const [selectedStyleIds, setSelectedStyleIds] = React.useState<Set<string>>(
    () => new Set(),
  );
  // Separate from `selectedPresetIds` (the main Reference tab's "pick images to use"
  // selection) so checking a preset here to create a new reference doesn't leak into,
  // or get cleared by, that unrelated selection.
  const [selectedCreatePresetIds, setSelectedCreatePresetIds] = React.useState<
    Set<string>
  >(() => new Set());
  const [selectedTabIndex, setSelectedTabIndex] =
    React.useState(initialTabIndex);
  // Shown instead of closing outright when the dialog is asked to close (X,
  // overlay click, Escape) while an uploaded photo + style pick is still
  // pending — nothing is committed until Create, so closing here would
  // silently discard it.
  const [showDiscardConfirm, setShowDiscardConfirm] = React.useState(false);
  // Shown instead when `isCreatingSelf` and no Self Portrait exists yet — any
  // close attempt means abandoning the self itself, not just an in-progress
  // upload, so this takes priority over `showDiscardConfirm` above.
  const [showCancelCreatingConfirm, setShowCancelCreatingConfirm] =
    React.useState(false);

  React.useEffect(() => {
    if (open) {
      setDeletedImageIds(new Set());
      setPendingUploadSrc(null);
      setPendingUploadTarget(null);
      setEditingPortraitImageId(null);
      setSelectedStyleIds(new Set());
      setSelectedCreatePresetIds(new Set());
      setSelectedPresetIds(new Set());
      setSelectedTabIndex(initialTabIndex);
    }
  }, [open, selfId, initialTabIndex]);

  const archivedImages: AssetGalleryPortraitImage[] = getArchivedImages(
    selfId,
  ).map((src, index) => ({
    id: `archived-${index}`,
    src,
    alt: "Archived profile image",
  }));
  const yourImages = [...portraitImages, ...archivedImages].filter(
    (image) => !deletedImageIds.has(image.id),
  );

  const handleEmptyCardUpload = (file: File) => {
    setPendingUploadSrc(URL.createObjectURL(file));
    setPendingUploadTarget("self-portrait");
  };

  const handleGenerate = () => {
    if (pendingUploadTarget === "reference") {
      const selected = PRESETS.filter((preset) =>
        selectedCreatePresetIds.has(preset.id),
      );
      if (selected.length === 0) return;
      onCreateReferenceImages(
        selected.map((preset) => ({ src: preset.src, alt: preset.alt })),
      );
      setPendingUploadSrc(null);
      setPendingUploadTarget(null);
      setSelectedCreatePresetIds(new Set());
      return;
    }

    const selected = STYLE_CARDS.filter((item) =>
      selectedStyleIds.has(item.id),
    );
    if (selected.length === 0) return;
    if (editingPortraitImageId) {
      // Editing replaces the one image being edited, so only its first pick applies.
      onReplacePortrait(editingPortraitImageId, selected[0]!.image);
    } else {
      // The first style in the batch becomes the self's main portrait.
      selected.forEach((style, index) => onGenerate(style.image, index === 0));
    }
    setPendingUploadSrc(null);
    setPendingUploadTarget(null);
    setEditingPortraitImageId(null);
    setSelectedStyleIds(new Set());
  };

  // The raw upload already landed in "My Reference" on upload, so backing out of the
  // create step just discards the in-progress preset selection, not the upload itself.
  const handleCancelReferenceUpload = () => {
    setPendingUploadSrc(null);
    setPendingUploadTarget(null);
    setSelectedCreatePresetIds(new Set());
  };

  // Unlike the reference upload, nothing is committed until Create is
  // clicked, so backing out here discards the pending upload entirely.
  const handleCancelSelfPortraitUpload = () => {
    setPendingUploadSrc(null);
    setPendingUploadTarget(null);
    setEditingPortraitImageId(null);
    setSelectedStyleIds(new Set());
  };

  const referenceImages = [...myReferenceImages, ...PRESETS];

  // The raw upload becomes a reference immediately; it's also offered as the
  // pending-upload preview so the user can additionally create a styled
  // version of it via Generate (which adds alongside, not instead of, it).
  const handleReferenceUpload = (file: File) => {
    const src = URL.createObjectURL(file);
    onUploadReferenceImage(src);
    setPendingUploadSrc(src);
    setPendingUploadTarget("reference");
  };

  const handleSelectReferences = () => {
    const selected = referenceImages
      .filter((image) => selectedPresetIds.has(image.id))
      .map((image) => image.src);
    if (selected.length === 0) return;
    onUseReferenceImages(selected);
    onOpenChange(false);
  };

  const toggleSelectedPresetId = (imageId: string, selected: boolean) => {
    setSelectedPresetIds((prev) => {
      const next = new Set(prev);
      if (selected) next.add(imageId);
      else next.delete(imageId);
      return next;
    });
  };

  const tabItems: TabItem[] = [
    { label: "Self Portrait", count: yourImages.length },
    { label: "Reference", count: referenceImages.length },
  ];

  const handleSelectMenuOption = (value: string, imageId: string) => {
    if (value === "delete-self-portrait") {
      if (yourImages.length <= 1) {
        window.clearTimeout(deleteBlockedTimeoutRef.current);
        setDeleteBlockedImageId(imageId);
        setDeleteBlockedKey((prev) => prev + 1);
        deleteBlockedTimeoutRef.current = window.setTimeout(() => {
          setDeleteBlockedImageId(null);
        }, 2000);
        return;
      }
      const image = yourImages.find((item) => item.id === imageId);
      if (image) {
        if (imageId.startsWith("archived-")) {
          onDeleteArchivedImage(image.src);
        } else {
          onDeletePortraitImage(imageId);
        }
      }
      setDeletedImageIds((prev) => new Set(prev).add(imageId));
      return;
    }
    const image = yourImages.find((item) => item.id === imageId);
    if (!image) return;
    if (value === "set-as-main-portrait") {
      onSetMainPortrait(image.src);
      onOpenChange(false);
    } else if (value === "edit-profile-portrait") {
      setPendingUploadSrc(image.src);
      setPendingUploadTarget("self-portrait");
      setEditingPortraitImageId(imageId);
    }
  };

  const isReferenceUploadStep =
    pendingUploadSrc !== null && pendingUploadTarget === "reference";

  // Select's dropdown portals to document.body by default, which escapes this
  // dialog's colorScheme class and falls back to :root tokens — pass this node
  // down as the portal container so the dropdown always matches the dialog's
  // actual mode instead of whatever the ambient page happens to be in.
  const [contentNode, setContentNode] = React.useState<HTMLDivElement | null>(
    null,
  );

  const handleOpenChange = (next: boolean) => {
    if (!next && isCreatingSelf && yourImages.length === 0) {
      setShowCancelCreatingConfirm(true);
      return;
    }
    if (
      !next &&
      pendingUploadSrc !== null &&
      pendingUploadTarget === "self-portrait"
    ) {
      setShowDiscardConfirm(true);
      return;
    }
    onOpenChange(next);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent
          ref={setContentNode}
          className={cn(colorScheme, styles.content)}
          data-step={isReferenceUploadStep ? "reference-upload" : undefined}
        >
          <DialogHeader className={styles.headerSizing}>
            <div className={styles.headerRow}>
              <DialogTitle>
                {isReferenceUploadStep
                  ? "Create My Reference"
                  : pendingUploadSrc
                    ? "Create Self"
                    : "Asset Gallery"}
              </DialogTitle>
              <div className={styles.forGroup}>
                <span className={styles.forLabel}>for</span>
                {isPickerMode || selfLabel ? (
                  <span className={styles.selfLabelStatic}>
                    {selfLabel ??
                      selves.find((self) => self.value === selfId)?.label ??
                      selfId}
                  </span>
                ) : (
                  <Select
                    variant="ghost"
                    options={selves}
                    value={selfId}
                    onValueChange={onSelfIdChange}
                    shouldFitContent
                    container={contentNode}
                  />
                )}
              </div>
            </div>
            {isReferenceUploadStep ? (
              <DialogDescription>
                Pick a preset below to create your own reference image from the
                photo you uploaded.
              </DialogDescription>
            ) : pendingUploadSrc ? (
              <DialogDescription>
                Pick a style below to create your Self Portrait from the photo
                you uploaded.
              </DialogDescription>
            ) : selectedTabIndex === 1 ? (
              <DialogDescription>
                {isPickerMode
                  ? "Pick one or more reference images to generate on-brand content in Content Studio, or upload one of your own."
                  : "Browse your reference images, or create your own using a preset."}
              </DialogDescription>
            ) : (
              <DialogDescription>
                Manage your Self Portrait here. It also includes reference
                images you can use to create a Self Portrait
                <br />— create one of your own, upload an image you like, or
                generate a new one from a reference image.
              </DialogDescription>
            )}
          </DialogHeader>

          {pendingUploadSrc ? (
            isReferenceUploadStep ? (
              <>
                <div className={styles.referenceUploadLayout}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={pendingUploadSrc}
                    alt="Uploaded photo"
                    className={styles.uploadedPhoto}
                  />
                  <span aria-hidden="true" className={styles.plusDivider}>
                    <Icon id="plus-icon" className={styles.plusDividerIcon} />
                  </span>
                  <div className={styles.referencePresetGrid}>
                    {PRESETS.map((preset) => (
                      <AssetGalleryCard
                        key={preset.id}
                        image={preset.src}
                        alt={preset.alt}
                        isSelected={selectedCreatePresetIds.has(preset.id)}
                        onSelectedChange={(selected) =>
                          setSelectedCreatePresetIds((prev) => {
                            const next = new Set(prev);
                            if (selected) next.add(preset.id);
                            else next.delete(preset.id);
                            return next;
                          })
                        }
                        className={styles.fillWidth}
                      />
                    ))}
                  </div>
                </div>
                <div className={styles.stepFooter}>
                  <Button
                    variant="icon-ghost"
                    aria-label="Back"
                    icon={
                      <Icon id="arrow-left-icon" className={styles.icon16} />
                    }
                    onClick={handleCancelReferenceUpload}
                  />
                  <Button
                    variant="primary"
                    disabled={selectedCreatePresetIds.size === 0}
                    onClick={handleGenerate}
                  >
                    Create my reference
                  </Button>
                </div>
              </>
            ) : (
              <div className={styles.selfPortraitCreateLayout}>
                <div className={styles.selfPortraitCreateRow}>
                  <div
                    role={editingPortraitImageId ? "radiogroup" : undefined}
                    className={styles.styleCardGrid}
                  >
                    {STYLE_CARDS.map((style) => (
                      <AssetGalleryCard
                        key={style.id}
                        image={style.image}
                        alt={style.title}
                        title={style.title}
                        isCompact
                        // Editing replaces one existing image, so only one
                        // style can apply — picking a style here swaps the
                        // selection instead of adding to it.
                        selectionRole={
                          editingPortraitImageId ? "radio" : "checkbox"
                        }
                        className={styles.compactStyleCard}
                        isSelected={selectedStyleIds.has(style.id)}
                        onSelectedChange={(selected) =>
                          setSelectedStyleIds((prev) => {
                            if (editingPortraitImageId) {
                              return selected ? new Set([style.id]) : new Set();
                            }
                            const next = new Set(prev);
                            if (selected) next.add(style.id);
                            else next.delete(style.id);
                            return next;
                          })
                        }
                      />
                    ))}
                  </div>
                  <span
                    aria-hidden="true"
                    className={cn(
                      styles.plusDivider,
                      styles.plusDividerGridCentered,
                    )}
                  >
                    <Icon id="plus-icon" className={styles.plusDividerIcon} />
                  </span>
                  <div className={styles.uploadedImageColumn}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={pendingUploadSrc}
                      alt="Uploaded photo"
                      className={styles.uploadedPhoto}
                    />
                    <p className={styles.uploadedImageCaption}>
                      Uploaded image
                    </p>
                    <div className={styles.uploadedImageActions}>
                      <Button
                        variant="icon-ghost"
                        aria-label="Back"
                        icon={
                          <Icon
                            id="arrow-left-icon"
                            className={styles.icon16}
                          />
                        }
                        onClick={handleCancelSelfPortraitUpload}
                      />
                      <Button
                        variant="primary"
                        disabled={selectedStyleIds.size === 0}
                        onClick={handleGenerate}
                        className={styles.createButton}
                      >
                        Create
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )
          ) : (
            <>
              <Tabs
                items={tabItems}
                selectedIndex={selectedTabIndex}
                onSelectedIndexChange={setSelectedTabIndex}
              />

              <div className={styles.tabPanel}>
                {selectedTabIndex === 0 ? (
                  <div className={styles.section}>
                    <span className={styles.sectionLabel}>Self Portrait</span>
                    <div className={styles.cardGrid}>
                      {yourImages.map((image) => (
                        <div key={image.id} className={styles.cardSlot}>
                          <AssetGalleryCard
                            image={image.src}
                            alt={image.alt}
                            date={image.date}
                            menuOptions={CARD_MENU_OPTIONS}
                            onSelectMenuOption={(value) =>
                              handleSelectMenuOption(value, image.id)
                            }
                            menuContainer={contentNode}
                            isMainPortrait={image.src === mainPortraitSrc}
                          />
                          {deleteBlockedImageId === image.id && (
                            <div
                              key={deleteBlockedKey}
                              className={styles.deleteBlockedBubble}
                            >
                              <p className={styles.deleteBlockedText}>
                                Keep at least one Self Portrait
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                      <AssetGalleryCard onUpload={handleEmptyCardUpload} />
                    </div>
                  </div>
                ) : (
                  <div className={styles.referenceSections}>
                    <div className={styles.section}>
                      <span className={styles.sectionLabel}>My Reference</span>
                      <div className={styles.cardGrid}>
                        {myReferenceImages.map((image) => (
                          <div key={image.id} className={styles.cardSlot}>
                            <AssetGalleryCard
                              image={image.src}
                              alt={image.alt}
                              isSelected={
                                isPickerMode
                                  ? selectedPresetIds.has(image.id)
                                  : undefined
                              }
                              onSelectedChange={
                                isPickerMode
                                  ? (selected) =>
                                      toggleSelectedPresetId(image.id, selected)
                                  : undefined
                              }
                            />
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                onDeleteReferenceImage(image.id);
                              }}
                              aria-label="Delete reference image"
                              data-picker-mode={isPickerMode || undefined}
                              className={styles.referenceDeleteButton}
                            >
                              <X
                                aria-hidden="true"
                                className={styles.referenceDeleteIcon}
                              />
                            </button>
                          </div>
                        ))}
                        <AssetGalleryCard onUpload={handleReferenceUpload} />
                      </div>
                    </div>
                    <div className={styles.section}>
                      <span className={styles.sectionLabel}>Presets</span>
                      <div className={styles.cardGrid}>
                        {PRESETS.map((image) => (
                          <AssetGalleryCard
                            key={image.id}
                            image={image.src}
                            alt={image.alt}
                            isSelected={
                              isPickerMode
                                ? selectedPresetIds.has(image.id)
                                : undefined
                            }
                            onSelectedChange={
                              isPickerMode
                                ? (selected) =>
                                    toggleSelectedPresetId(image.id, selected)
                                : undefined
                            }
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {isPickerMode && selectedTabIndex === 1 && (
                <div className={styles.selectFooter}>
                  <Button
                    variant="primary"
                    disabled={selectedPresetIds.size === 0}
                    onClick={handleSelectReferences}
                  >
                    {selectedPresetIds.size > 0
                      ? `Select (${selectedPresetIds.size})`
                      : "Select"}
                  </Button>
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
      <Popover
        type="warning"
        open={showDiscardConfirm}
        onOpenChange={setShowDiscardConfirm}
        title="Discard this Self Portrait?"
        description="Your uploaded photo and style selection won't be saved if you leave now."
        leadingIcon={<Icon id="triangle-alert-icon" />}
        cancelLabel="Keep editing"
        confirmLabel="Discard"
        onCancel={() => setShowDiscardConfirm(false)}
        onConfirm={() => {
          setShowDiscardConfirm(false);
          handleCancelSelfPortraitUpload();
          onOpenChange(false);
        }}
      />
      <Popover
        type="warning"
        open={showCancelCreatingConfirm}
        onOpenChange={setShowCancelCreatingConfirm}
        title="Cancel creating this self?"
        description="This self and anything you've added for it won't be saved."
        leadingIcon={<Icon id="triangle-alert-icon" />}
        cancelLabel="Keep editing"
        confirmLabel="Cancel creating"
        onCancel={() => setShowCancelCreatingConfirm(false)}
        onConfirm={() => {
          setShowCancelCreatingConfirm(false);
          onCancelCreating?.();
        }}
      />
    </>
  );
}
