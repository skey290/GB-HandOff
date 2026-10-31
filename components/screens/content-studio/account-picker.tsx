"use client";

import * as PopoverPrimitive from "@radix-ui/react-popover";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Icon } from "@/lib/sprite-icon";
import {
  PLATFORM_ICONS,
  PLATFORM_LABELS,
  type PostPlatform,
} from "@/components/screens/content-studio/ui/PostCard";

import styles from "./popover-menu.module.css";

export interface AccountPickerProps {
  connectedPlatforms: PostPlatform[];
  onAddPlatform: (platform: PostPlatform) => void;
}

const ALL_PLATFORMS: PostPlatform[] = ["linkedin", "x", "instagram", "threads"];

/**
 * "Where to post?"의 "+" 계정 추가 드롭다운. `docs/GB_Content_Studio.md`
 * 2부④ — 아직 연결 안 된 플랫폼만 노출한다.
 */
export function AccountPicker({
  connectedPlatforms,
  onAddPlatform,
}: AccountPickerProps) {
  const options = ALL_PLATFORMS.filter(
    (platform) => !connectedPlatforms.includes(platform),
  );

  if (options.length === 0) return null;

  return (
    <PopoverPrimitive.Root>
      <PopoverPrimitive.Trigger asChild>
        <Button
          variant="icon"
          icon={<Icon id="plus-icon" />}
          aria-label="계정 추가"
        />
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          side="bottom"
          align="start"
          sideOffset={8}
          className={cn("light", styles.content)}
        >
          {options.map((platform) => (
            <PopoverPrimitive.Close
              key={platform}
              className={cn(
                styles.option,
                "flex items-center gap-[var(--gb-spacing-2)]",
              )}
              onClick={() => onAddPlatform(platform)}
            >
              <Icon id={PLATFORM_ICONS[platform]} className="size-[16px]" />
              {PLATFORM_LABELS[platform]}
            </PopoverPrimitive.Close>
          ))}
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}
