"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  ToneOfVoiceForm,
  type ToneOfVoiceFormProps,
} from "@/components/screens/content-studio/ui/ToneOfVoiceForm";

export interface ToneOfVoiceDialogProps extends ToneOfVoiceFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** "Tone of Voice" 편집 모달 — `ToneOfVoiceForm`을 그대로 감싼다. */
export function ToneOfVoiceDialog({
  open,
  onOpenChange,
  onClose,
  ...formProps
}: ToneOfVoiceDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="light"
        style={{ padding: "var(--gb-spacing-8)" }}
      >
        <ToneOfVoiceForm
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
