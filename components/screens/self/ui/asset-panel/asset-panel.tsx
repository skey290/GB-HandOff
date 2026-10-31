"use client";

import * as React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";

import { cn } from "@/lib/utils";
import { Icon, type IconId } from "@/lib/sprite-icon";
import { Button } from "@/components/ui/button";
import {
  GoalSetting,
  Divider,
  type GoalPostingFrequency,
  type GoalSettingAction,
  type GoalTimeframe,
} from "@/components/app/goal-setting";

import styles from "./asset-panel.module.css";

export interface AssetPanelSelfProfile {
  id: string;
  role: string;
  image: string;
  description: string;
  knownForNow: string;
  knownForNext: string;
  postingCount: number;
  postingFrequency: GoalPostingFrequency;
  targetedFollowersIndex: number;
  timeframe: GoalTimeframe;
  goalActions: GoalSettingAction[];
}

export interface AssetPanelProps {
  self: AssetPanelSelfProfile;
  onCreateContents: () => void;
  /** Called when "Edit Self Portrait" is selected from the header "..." menu */
  onEditSelfPortrait: () => void;
  /** Called when "Go to Asset Gallery" is selected from the header "..." menu */
  onGoToAssetGallery: () => void;
  /** Called when "Edit Goal" is selected from the header "..." menu */
  onEditGoal: () => void;
  className?: string;
}

const PANEL_MENU_ITEMS: { label: string; icon: IconId }[] = [
  { label: "Edit Self Portrait", icon: "eraser-icon" },
  { label: "Go to Asset Gallery", icon: "images-icon" },
  { label: "Edit Goal", icon: "goal-icon" },
];

/** Top-right "..." menu in the header (Figma `Detail view` component, node 8612:89563) */
function AssetPanelMenu({
  onEditSelfPortrait,
  onGoToAssetGallery,
  onEditGoal,
}: {
  onEditSelfPortrait: () => void;
  onGoToAssetGallery: () => void;
  onEditGoal: () => void;
}) {
  const [open, setOpen] = React.useState(false);

  const handleSelect = (action: () => void) => {
    action();
    setOpen(false);
  };

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
      <PopoverPrimitive.Trigger asChild>
        <button
          type="button"
          aria-label="More options"
          className={styles.triggerButton}
          data-open={open || undefined}
        >
          <Icon id="ellipsis-icon" className={styles.triggerIcon} />
        </button>
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          side="bottom"
          align="end"
          sideOffset={8}
          onMouseLeave={() => setOpen(false)}
          className={cn("dark", styles.menuContent)}
        >
          {PANEL_MENU_ITEMS.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() =>
                handleSelect(
                  item.label === "Edit Self Portrait"
                    ? onEditSelfPortrait
                    : item.label === "Go to Asset Gallery"
                      ? onGoToAssetGallery
                      : onEditGoal,
                )
              }
              className={styles.menuItem}
            >
              <Icon id={item.icon} className={styles.menuItemIcon} />
              {item.label}
            </button>
          ))}
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}

/**
 * Fixed panel on the right of the live site — the selected Self's profile
 * header (image/role/description/"..." menu) + Known for Now/Next (reusing
 * `GoalSetting` embedded, without its header or Save button) + the Create
 * contents button.
 */
export function AssetPanel({
  self,
  onCreateContents,
  onEditSelfPortrait,
  onGoToAssetGallery,
  onEditGoal,
  className,
}: AssetPanelProps) {
  return (
    <div className={cn("dark", styles.root, className)}>
      <div className={styles.headerRow}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={self.image} alt={self.role} className={styles.avatarImg} />
        <div className={styles.headerText}>
          <p className={styles.roleText}>{self.role}</p>
          <p className={styles.descriptionText}>{self.description}</p>
        </div>
        <AssetPanelMenu
          onEditSelfPortrait={onEditSelfPortrait}
          onGoToAssetGallery={onGoToAssetGallery}
          onEditGoal={onEditGoal}
        />
      </div>

      <Divider />

      <GoalSetting
        key={self.id}
        showHeader={false}
        showSaveButton={false}
        shouldFitContainer
        isEmbedded
        type="default"
        now={self.knownForNow}
        goal={self.knownForNext}
        goalActions={self.goalActions}
        postingCount={self.postingCount}
        postingFrequency={self.postingFrequency}
        targetedFollowersIndex={self.targetedFollowersIndex}
        timeframe={self.timeframe}
      />

      <Button
        type="button"
        variant="primary"
        onClick={onCreateContents}
        className={styles.createButton}
      >
        Create contents
      </Button>
    </div>
  );
}
