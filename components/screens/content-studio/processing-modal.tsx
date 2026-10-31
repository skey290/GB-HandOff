"use client";

import * as React from "react";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress-bar";

export interface ProcessingModalProps {
  open: boolean;
  onCancel: () => void;
  onComplete: () => void;
}

/**
 * "We're creating your brand-fit posts now" 진행률 모달.
 * (`docs/GB_Content_Studio.md` 1부④, Cancel 리액션 0건 — 중단 후 직전
 * 화면 복귀로 구현)
 */
export function ProcessingModal({
  open,
  onCancel,
  onComplete,
}: ProcessingModalProps) {
  const [progress, setProgress] = React.useState(0);
  const completedRef = React.useRef(false);

  React.useEffect(() => {
    if (!open) {
      setProgress(0);
      completedRef.current = false;
      return;
    }
    const interval = setInterval(() => {
      setProgress((prev) => Math.min(100, prev + 10));
    }, 150);
    return () => clearInterval(interval);
  }, [open]);

  React.useEffect(() => {
    if (!open || progress < 100 || completedRef.current) return;
    completedRef.current = true;
    const timeout = window.setTimeout(onComplete, 200);
    return () => window.clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, progress]);

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onCancel()}>
      <DialogContent showCloseButton={false} className="light">
        <div className="flex flex-col items-center gap-[var(--gb-spacing-5)] py-[var(--gb-spacing-4)] text-center">
          <p className="text-lg-semi-bold text-[var(--gb-text-default)]">
            We&rsquo;re creating your brand-fit posts now
          </p>
          <ProgressBar
            value={progress}
            aria-label="생성 진행률"
            className="w-full"
          />
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
