"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

import styles from "./dialog.module.css";

/**
 * General-purpose modal shell (trigger + portal + overlay + content), unlike
 * `Popover` which is a fixed title/description/footer confirmation dialog.
 * No Figma spec exists for this primitive — it follows the standard Shadcn
 * Dialog composition pattern per the project's "Figma에 없으면 Shadcn 기본값" rule.
 */
export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;

export interface DialogContentProps extends React.ComponentPropsWithoutRef<
  typeof DialogPrimitive.Content
> {
  /** Hides the built-in top-right close button. Default true */
  showCloseButton?: boolean;
}

export const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  DialogContentProps
>(({ className, children, showCloseButton = true, ...props }, ref) => (
  <DialogPrimitive.Portal>
    <div className="dark">
      <DialogPrimitive.Overlay className={styles.overlay} />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(styles.content, className)}
        // Every dialog closes only via an explicit action (its close button,
        // or a Cancel/Save inside) — an outside click or Escape never dismisses it.
        onPointerDownOutside={(event) => event.preventDefault()}
        onEscapeKeyDown={(event) => event.preventDefault()}
        {...props}
      >
        {children}
        {showCloseButton && (
          <DialogPrimitive.Close asChild className={styles.closeButton}>
            <Button
              variant="icon-ghost"
              aria-label="Close"
              icon={<X aria-hidden="true" className="size-full" />}
            />
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </div>
  </DialogPrimitive.Portal>
));
DialogContent.displayName = "DialogContent";

export function DialogHeader({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return <div className={cn(styles.header, className)} {...props} />;
}

export const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(styles.title, className)}
    {...props}
  />
));
DialogTitle.displayName = "DialogTitle";

export const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn(styles.description, className)}
    {...props}
  />
));
DialogDescription.displayName = "DialogDescription";

export function DialogFooter({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return <div className={cn(styles.footer, className)} {...props} />;
}
