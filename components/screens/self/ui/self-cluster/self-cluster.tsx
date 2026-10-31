"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";

import { Icon } from "@/lib/sprite-icon";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { ProfilePrint } from "@/components/app/profile-print";

import styles from "./self-cluster.module.css";

export interface SelfMenuAction {
  label: string;
  onSelect: () => void;
}

/**
 * Slot centers relative to the 420×420 cluster center — Figma-measured,
 * radius not uniform (node `8004:7827` "Self profile"). `rotate` is the
 * final tilt the card actually shows on screen — Figma's `Part/self profile`
 * rotates the group ±90/135/180 degrees per position and then counter-rotates
 * it back inside the photo layer, so east/west/south always stay upright
 * (0 degrees) and the 4 diagonals show only ±45 degrees (a pattern baked
 * into the master component, e.g. node `8004:8032` — the raw position angle
 * itself isn't used). For east/west, that counter-rotation process also
 * fixes the cropping frame (mask) itself to landscape (106×84) instead of
 * portrait (84×106) — even though the apparent rotation is 0, the frame
 * dimensions are swapped.
 */
const RAW_SELF_SLOTS = [
  { id: "north", dx: 0, dy: -166, rotate: 0, width: 84, height: 106 },
  {
    id: "north-east",
    dx: 111.75,
    dy: -109.8,
    rotate: 45,
    width: 84,
    height: 106,
  },
  { id: "east", dx: 157, dy: 0, rotate: 0, width: 106, height: 84 },
  {
    id: "south-east",
    dx: 111.75,
    dy: 109.71,
    rotate: -45,
    width: 84,
    height: 106,
  },
  { id: "south", dx: 0, dy: 166, rotate: 0, width: 84, height: 106 },
  {
    id: "south-west",
    dx: -111.85,
    dy: 109.7,
    rotate: 45,
    width: 84,
    height: 106,
  },
  { id: "west", dx: -157, dy: 0, rotate: 0, width: 106, height: 84 },
  {
    id: "north-west",
    dx: -111.85,
    dy: -109.8,
    rotate: -45,
    width: 84,
    height: 106,
  },
] as const;

/** Target gap between the center of the card's near short edge and the center of the select's reference edge */
const LABEL_EDGE_OFFSET = 10;

/**
 * Correction value used only for the north/south slots. Because the card and
 * label line up vertically there, the reference is the text span's own long
 * edge (top/bottom, facing the card) rather than the select's left/right
 * short edge (width direction). The text span is vertically centered inside
 * the button, so span center = button center, and the extra offset needed —
 * equal to the span's rendered height (`--gb-leading-4`, 16px) — is what
 * converts "center of the span's long edge ↔ center of the card's short
 * edge = 10px" into an offset measured from the button center.
 */
const LABEL_TEXT_HALF_HEIGHT = 8;

/**
 * Label (Select) position = the center of the card's nearest short edge,
 * pushed outward by `LABEL_EDGE_OFFSET`. The card's long axis (106 of its
 * 84×106) always lines up with the radial direction from the cluster center
 * to the card center, so that short edge sits half the long axis (53px) away
 * from the card center along that radial direction — one formula computes
 * all 8 directions instead of separately measured, non-uniform gaps per
 * slot. North/south get the extra `LABEL_TEXT_HALF_HEIGHT` push so that the
 * text span's long edge — not the button center — ends up 10px from the
 * card's short edge.
 */
export const SELF_SLOTS = RAW_SELF_SLOTS.map((slot) => {
  const isVertical = slot.id === "north" || slot.id === "south";
  const radius = Math.hypot(slot.dx, slot.dy);
  const edgeDistance =
    Math.max(slot.width, slot.height) / 2 +
    LABEL_EDGE_OFFSET +
    (isVertical ? LABEL_TEXT_HALF_HEIGHT : 0);
  return {
    ...slot,
    labelDx: slot.dx + (slot.dx / radius) * edgeDistance,
    labelDy: slot.dy + (slot.dy / radius) * edgeDistance,
  };
});

/** Hover-close grace delay (ms) for the menu/dropdown — prevents flicker when moving between card ↔ label ↔ dropdown */
const HOVER_CLOSE_DELAY = 150;

/**
 * Corner bracket for Figma `status="selected"` — not a continuous border
 * wrapping the photo's edges, but 4 separate quarter-circle arcs at the 4
 * corners (camera-viewfinder style). Each corner arc is computed
 * independently with the same offset (3px) and the same radius (16px,
 * Figma's original) relative to the card corner, so all four corners show
 * the identical gap — copying the raw export coordinates as-is only got the
 * origin (top-left) corner right, while the opposite (right/bottom) corners
 * kept coordinates based on the old box size and looked pulled inward. The
 * arcs' endpoints touch the viewBox boundary exactly, so without
 * `overflow-visible` the 3px stroke's tip gets slightly clipped. Always used
 * only on a dark background, so it uses `--gb-border-bolder`'s dark-mode
 * value as-is (identical to the original asset's fixed hex). East/west
 * (landscape cards) reuse this same portrait-oriented bracket rotated 90
 * degrees in Figma's own structure, so the same SVG is reused here via `rotate`.
 */
function SelfProfileFrame({ rotate }: { rotate?: boolean }) {
  return (
    <svg
      viewBox="0 0 90 112"
      fill="none"
      aria-hidden="true"
      className={styles.frame}
      data-rotated={rotate || undefined}
    >
      <path
        d="M16 0C7.16344 0 0 7.16344 0 16"
        stroke="var(--gb-border-bolder)"
        strokeWidth={3}
        strokeLinecap="round"
      />
      <path
        d="M74 0C82.83656 0 90 7.16344 90 16"
        stroke="var(--gb-border-bolder)"
        strokeWidth={3}
        strokeLinecap="round"
      />
      <path
        d="M0 96C0 104.83656 7.16344 112 16 112"
        stroke="var(--gb-border-bolder)"
        strokeWidth={3}
        strokeLinecap="round"
      />
      <path
        d="M74 112C82.83656 112 90 104.83656 90 96"
        stroke="var(--gb-border-bolder)"
        strokeWidth={3}
        strokeLinecap="round"
      />
    </svg>
  );
}

export interface ClusterSelf {
  id: string;
  slotId: (typeof SELF_SLOTS)[number]["id"];
  label: string;
  image: string;
}

export interface SelfClusterProps {
  selves: ClusterSelf[];
  /**
   * Figma `status="selected"` — shown via the corner bracket. Hidden while
   * the menu is open (with-name's menu-selected has no bracket). The same
   * bracket also appears on whichever Self is currently hovered, signaling
   * "this is the Self you're looking at now" (it shares the same state as
   * the center text switching to the hovered Self's name).
   */
  selectedSelfId?: string;
  onAddSelf: (slotId: string) => void;
  onSelectSelf: (self: ClusterSelf) => void;
  getSelfMenuActions: (self: ClusterSelf) => SelfMenuAction[];
  /** Click callback for "Edit Profile Portrait" inside the enlarged preview (ProfilePrint) shown on image click */
  onEditSelfImage?: (self: ClusterSelf) => void;
  /**
   * DOM container to show the enlarged preview in. When given, it's centered
   * inside that container (relative to that container's `position`); when
   * omitted, it's centered relative to the whole screen — pass the DOM node
   * of a canvas area (one that excludes always-visible chrome like
   * AssetPanel) when the preview should only appear within that area.
   */
  previewPortalContainer?: Element | null;
}

/** Figma `Part/self profile` + `Self profile` (node `8622:90018`, the "Self portrait" section). An 8-slot circular Self layout. */
export function SelfCluster({
  selves,
  selectedSelfId,
  onAddSelf,
  onSelectSelf,
  getSelfMenuActions,
  onEditSelfImage,
  previewPortalContainer,
}: SelfClusterProps) {
  const selfBySlot = new Map(selves.map((self) => [self.slotId, self]));
  const northSelf = selfBySlot.get("north");

  // Clicking an image shows the enlarged preview (ProfilePrint) popover anchored to that image — a state separate from selection (onSelectSelf).
  const [previewSlotId, setPreviewSlotId] = React.useState<string | null>(null);

  // The dropdown opens on click and closes once the mouse leaves the trigger/dropdown (doesn't open on hover) — confirmed by the user.
  const [openSlotId, setOpenSlotId] = React.useState<string | null>(null);
  const closeTimeoutRef =
    React.useRef<ReturnType<typeof setTimeout>>(undefined);

  const openSlotMenu = (slotId: string) => {
    clearTimeout(closeTimeoutRef.current);
    setOpenSlotId(slotId);
  };
  const scheduleCloseSlotMenu = (slotId: string) => {
    clearTimeout(closeTimeoutRef.current);
    closeTimeoutRef.current = setTimeout(() => {
      setOpenSlotId((current) => (current === slotId ? null : current));
    }, HOVER_CLOSE_DELAY);
  };

  // The center text switches to that Self's name on every thumbnail hover — a separate state unrelated to the menu being open.
  const [hoveredSelfId, setHoveredSelfId] = React.useState<string | null>(null);
  const hoveredSelf = selves.find((self) => self.id === hoveredSelfId);
  const centerSelf = hoveredSelf ?? northSelf;

  // The selected corner bracket for an empty slot (Figma `Profile type=empty,
  // Status=selected`) has no concept of permanent selection unlike a filled
  // slot, so it's only shown on hover/focus.
  const [focusedEmptySlotId, setFocusedEmptySlotId] = React.useState<
    string | null
  >(null);

  return (
    <div className={styles.root}>
      {SELF_SLOTS.map((slot) => {
        const self = selfBySlot.get(slot.id);

        return (
          <div
            key={slot.id}
            style={{
              width: slot.width,
              height: slot.height,
              transform: `translate(-50%, -50%) translate(${slot.dx}px, ${slot.dy}px) rotate(${slot.rotate}deg)`,
            }}
            className={styles.slotWrap}
          >
            {self ? (
              <>
                <DialogPrimitive.Root
                  open={previewSlotId === slot.id}
                  onOpenChange={(open) =>
                    setPreviewSlotId(open ? slot.id : null)
                  }
                >
                  <DialogPrimitive.Trigger asChild>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={self.image}
                      alt={self.label}
                      role="button"
                      tabIndex={0}
                      onClick={() => onSelectSelf(self)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          onSelectSelf(self);
                        }
                      }}
                      onMouseEnter={() => setHoveredSelfId(self.id)}
                      onMouseLeave={() =>
                        setHoveredSelfId((current) =>
                          current === self.id ? null : current,
                        )
                      }
                      className={styles.avatarImg}
                    />
                  </DialogPrimitive.Trigger>
                  <DialogPrimitive.Portal
                    container={previewPortalContainer ?? undefined}
                  >
                    <div className="dark">
                      {/* The enlarged preview shows ProfilePrint (the
                          completed type) as-is, inside previewPortalContainer
                          (when given) or centered on screen — if autofocus
                          moved focus to ProfilePrint's "Edit Profile Portrait"
                          button right as it opens, the hover overlay would
                          immediately appear via :focus-within, so
                          onOpenAutoFocus is blocked to only respond to a real
                          mouse hover. */}
                      <DialogPrimitive.Content
                        onOpenAutoFocus={(event) => event.preventDefault()}
                        className={styles.dialogContent}
                        data-portal={
                          previewPortalContainer ? "contained" : undefined
                        }
                      >
                        <DialogPrimitive.Title className="sr-only">
                          {`${self.label} 이미지 확대 미리보기`}
                        </DialogPrimitive.Title>
                        <div className={styles.previewWrap}>
                          <ProfilePrint
                            type="completed"
                            portraitSrc={self.image}
                            portraitAlt={self.label}
                            timestamp=""
                            onEditImage={() => onEditSelfImage?.(self)}
                          />
                          <DialogPrimitive.Close asChild>
                            <Button
                              variant="icon-ghost"
                              aria-label="Close"
                              icon={
                                <X
                                  aria-hidden="true"
                                  className={styles.closeIcon}
                                />
                              }
                              className={styles.closeButton}
                            />
                          </DialogPrimitive.Close>
                        </div>
                      </DialogPrimitive.Content>
                    </div>
                  </DialogPrimitive.Portal>
                </DialogPrimitive.Root>
                {(self.id === selectedSelfId || self.id === hoveredSelfId) &&
                  openSlotId !== slot.id && (
                    <SelfProfileFrame rotate={slot.width > slot.height} />
                  )}
              </>
            ) : (
              <div
                className={styles.emptySlot}
                onMouseEnter={() => setFocusedEmptySlotId(slot.id)}
                onMouseLeave={() =>
                  setFocusedEmptySlotId((current) =>
                    current === slot.id ? null : current,
                  )
                }
                onFocus={() => setFocusedEmptySlotId(slot.id)}
                onBlur={() =>
                  setFocusedEmptySlotId((current) =>
                    current === slot.id ? null : current,
                  )
                }
              >
                <div style={{ transform: `rotate(${-slot.rotate}deg)` }}>
                  <Button
                    variant="icon"
                    icon={<Icon id="plus-icon" />}
                    aria-label="Add a Self"
                    onClick={() => onAddSelf(slot.id)}
                    className={styles.addButton}
                    data-focused={focusedEmptySlotId === slot.id || undefined}
                  />
                </div>
                {focusedEmptySlotId === slot.id && (
                  <SelfProfileFrame rotate={slot.width > slot.height} />
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* The label is kept as a sibling separate from the card — not inside
          the card's rotated local coordinate system — and positioned via
          each slot's labelDx/labelDy (relative to the 420×420 frame center,
          computed by a formula in SELF_SLOTS). For the 6 directions other
          than north/south, where the select lines up horizontally with the
          card, it's anchored not at the box center but at the short edge on
          the "text side" (the edge facing the card) — so the card-select
          gap stays fixed at 10px even as the box width changes with text
          length. North/south have a vertical card-label direction that
          doesn't line up with the select's left/right short edges, so the
          box center is anchored as before. */}
      {SELF_SLOTS.map((slot) => {
        const self = selfBySlot.get(slot.id);
        if (!self) return null;

        const actions = getSelfMenuActions(self);
        // West-side ones (dx<0) read "< label", the rest "label >" — confirmed by Figma (node `8004:7989`).
        const isReversed = slot.dx < 0;
        const isVertical = slot.id === "north" || slot.id === "south";
        const horizontalAnchor = isVertical
          ? "-50%"
          : isReversed
            ? "-100%"
            : "0%";

        return (
          <div
            key={`${slot.id}-label`}
            style={{
              transform: `translate(${horizontalAnchor}, -50%) translate(${slot.labelDx}px, ${slot.labelDy}px)`,
            }}
            className={styles.labelWrap}
          >
            {/* value is a sentinel that never matches an option, so the
                trigger always shows only `placeholder` (the Self's name) —
                this control isn't a stateful selection but a way to open an
                action menu (Create a Post, etc). The dropdown opens on click
                and closes once the mouse leaves the trigger/dropdown
                (doesn't open on hover — confirmed by the user). */}
            <Select
              variant={isReversed ? "side-reverse" : "side"}
              value=""
              placeholder={self.label}
              options={actions.map((action) => ({
                value: action.label,
                label: action.label,
              }))}
              onValueChange={(value) =>
                actions.find((action) => action.label === value)?.onSelect()
              }
              open={openSlotId === slot.id}
              onOpenChange={(next) =>
                next ? openSlotMenu(slot.id) : scheduleCloseSlotMenu(slot.id)
              }
              onTriggerMouseLeave={() => scheduleCloseSlotMenu(slot.id)}
              onContentMouseEnter={() => openSlotMenu(slot.id)}
              onContentMouseLeave={() => scheduleCloseSlotMenu(slot.id)}
            />
          </div>
        );
      })}

      {focusedEmptySlotId ? (
        <p className={styles.centerText}>Create a Self</p>
      ) : selves.length === 0 ? (
        <p className={styles.centerText} data-two-line="">
          Self is
          <br />
          Not Created Yet.
        </p>
      ) : (
        centerSelf && <p className={styles.centerText}>{centerSelf.label}</p>
      )}
    </div>
  );
}
