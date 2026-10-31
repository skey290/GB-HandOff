"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  ContentGoalForm,
  type ContentGoalFormProps,
} from "@/components/screens/content-studio/ui/ContentGoalForm";

export interface ContentGoalDialogProps extends ContentGoalFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** "Contents goal & strategy" 편집 모달 — `ContentGoalForm`을 그대로 감싼다. */
export function ContentGoalDialog({
  open,
  onOpenChange,
  onClose,
  ...formProps
}: ContentGoalDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="light"
        style={{ padding: "var(--gb-spacing-8)" }}
      >
        <ContentGoalForm
          {...formProps}
          isEmbedded
          onClose={() => {
            onClose?.();
            onOpenChange(false);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
