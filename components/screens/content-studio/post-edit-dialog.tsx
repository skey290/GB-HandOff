"use client";

import * as React from "react";

import { PostingModalDialog } from "./posting-modal-dialog";
import {
  formatPostDate,
  type Post,
  type PostPlatform,
} from "@/components/screens/content-studio/ui/PostCard";

export interface PostEditDialogProps {
  post: Post | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaveChanges: (updated: Post) => void;
  onScheduleDraft: (updated: Post) => void;
  onArchive: () => void;
  /** Current Self's display name, shown in the Reference gallery dialog's "for" field */
  selfLabel?: string;
  /** Current Self's avatar, shown in the post preview's header */
  avatarSrc?: string;
}

/**
 * 개별 포스트 수정 모달. 디자인 시스템의 PostingModal(`style="default"`)을
 * 그대로 띄운다 — 상태별 편집 권한(Posted=읽기전용, Draft만 Archive/Schedule
 * Draft 노출)은 PostingModal 내부에서 `post.status` 기준으로 처리된다.
 */
export function PostEditDialog({
  post,
  open,
  onOpenChange,
  onSaveChanges,
  onScheduleDraft,
  onArchive,
  selfLabel,
  avatarSrc,
}: PostEditDialogProps) {
  const [draft, setDraft] = React.useState<Post | null>(post);
  const [activeTabIndex, setActiveTabIndex] = React.useState(0);
  const [rewriteInstruction, setRewriteInstruction] = React.useState("");

  React.useEffect(() => {
    if (open && post) {
      setDraft(post);
      setActiveTabIndex(0);
      setRewriteInstruction("");
    }
  }, [open, post]);

  if (!draft) return null;

  const handleAddPlatform = (platform: PostPlatform) => {
    setDraft((prev) =>
      prev ? { ...prev, platforms: [...prev.platforms, platform] } : prev,
    );
  };

  const handleRemovePlatform = (index: number) => {
    setDraft((prev) =>
      prev
        ? { ...prev, platforms: prev.platforms.filter((_, i) => i !== index) }
        : prev,
    );
  };

  const handleApplyChanges = () => {
    if (!rewriteInstruction.trim()) return;
    setDraft((prev) =>
      prev ? { ...prev, caption: rewriteInstruction } : prev,
    );
    setRewriteInstruction("");
  };

  return (
    <PostingModalDialog
      style="default"
      open={open}
      onOpenChange={onOpenChange}
      post={draft}
      activeTabIndex={activeTabIndex}
      onActiveTabIndexChange={setActiveTabIndex}
      onAddPlatform={handleAddPlatform}
      onRemovePlatform={handleRemovePlatform}
      onDateChange={(date) =>
        setDraft((prev) =>
          prev ? { ...prev, date: formatPostDate(date) } : prev,
        )
      }
      onTimeChange={(value) =>
        setDraft((prev) => {
          if (!prev) return prev;
          const period = prev.time.includes("PM") ? "PM" : "AM";
          return { ...prev, time: `${value} ${period}` };
        })
      }
      onTimePeriodChange={(period) =>
        setDraft((prev) => {
          if (!prev) return prev;
          const value = prev.time.slice(0, 5);
          return { ...prev, time: `${value} ${period}` };
        })
      }
      rewriteInstruction={rewriteInstruction}
      onRewriteInstructionChange={setRewriteInstruction}
      onApplyChanges={handleApplyChanges}
      onSaveChanges={() => onSaveChanges(draft)}
      onScheduleDraft={() => onScheduleDraft(draft)}
      onArchive={onArchive}
      selfLabel={selfLabel}
      avatarSrc={avatarSrc}
      onClose={() => onOpenChange(false)}
    />
  );
}
