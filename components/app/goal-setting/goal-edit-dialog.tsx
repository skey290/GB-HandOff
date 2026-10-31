"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  GoalSetting,
  type GoalSettingProps,
} from "@/components/app/goal-setting";

export interface GoalEditDialogProps extends GoalSettingProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * "My goal" 편집 모달 — `GoalSetting`을 그대로 감싼다. Content Studio와
 * Know Thyself가 동일 Goal 데이터를 공유하므로 양쪽에서 이 공용 래퍼를 쓴다.
 */
export function GoalEditDialog({
  open,
  onOpenChange,
  onClose,
  colorScheme = "dark",
  ...goalSettingProps
}: GoalEditDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className={colorScheme}>
        <GoalSetting
          {...goalSettingProps}
          colorScheme={colorScheme}
          shouldFitContainer
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
