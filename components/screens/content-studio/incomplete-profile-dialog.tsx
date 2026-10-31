"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import styles from "./incomplete-profile-dialog.module.css";

export interface IncompleteProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  missingItems: string[];
  onCompleteNow: () => void;
}

function formatMissingItems(items: string[]) {
  if (items.length <= 1) return items[0] ?? "";
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
}

/** "Complete your profile first" 생성 차단 안내 모달 — Self-Goal/Content Goal/Tone of Voice 중 미완료 항목을 나열한다. */
export function IncompleteProfileDialog({
  open,
  onOpenChange,
  missingItems,
  onCompleteNow,
}: IncompleteProfileDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton className={cn(styles.content, "light")}>
        <div className="flex flex-col items-center gap-[var(--gb-spacing-5)] py-[var(--gb-spacing-4)] text-center">
          <p className="text-lg-semi-bold text-[var(--gb-text-default)]">
            Complete your profile first
          </p>
          <p className="text-sm-regular text-[var(--gb-text-subtle)]">
            We need {formatMissingItems(missingItems)}
            <br />
            to generate content that fits your brand.
          </p>
          <Button variant="primary" className="w-full" onClick={onCompleteNow}>
            Complete now
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
