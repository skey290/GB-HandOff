"use client";

import * as React from "react";
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";

import { ButtonGroup } from "@/components/ui/button-group";
import { Checkbox } from "@/components/ui/checkbox";

import styles from "./popover.module.css";

/**
 * A fully controlled confirmation dialog centered on screen.
 * See `docs/components/popover.md` for the spec.
 */
interface PopoverBaseProps {
  /** Whether the dialog is open (fully controlled) */
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Dialog title (text-lg-semi-bold) */
  title: string;
  /** Content width in px. Defaults to the Figma spec (500px) */
  width?: number;
  /** Dialog description (text-sm-regular, --text-subtle). If omitted, the
   * description line is not rendered (Figma `Description=false`) */
  description?: string;
  /** Header icon (24px slot, Figma `Leading Icon`). The slot isn't rendered if not passed */
  leadingIcon?: React.ReactNode;
  /** Whether to show the bottom area (checkbox + button row). Figma's `Button`
   * toggles a wrapper around both, so `false` also hides the checkbox */
  showButton?: boolean;
  cancelLabel?: string;
  onCancel?: () => void;
  confirmLabel?: string;
  onConfirm?: () => void;
}

export type PopoverProps = PopoverBaseProps &
  (
    | {
        type: "notification";
        /** Checked state of the "Do not ask again." row. The row itself isn't rendered if not passed */
        checkbox?: boolean;
        checkboxLabel?: string;
        onCheckedChange?: (checked: boolean) => void;
      }
    | {
        type: "warning";
        checkbox?: never;
        checkboxLabel?: never;
        onCheckedChange?: never;
      }
  );

export function Popover({
  type,
  open,
  onOpenChange,
  title,
  description,
  leadingIcon,
  width,
  showButton = true,
  checkbox,
  checkboxLabel = "Do not ask again.",
  onCheckedChange,
  cancelLabel = "Cancel",
  onCancel,
  confirmLabel = "Confirm",
  onConfirm,
}: PopoverProps) {
  const isWarning = type === "warning";
  const showCheckboxRow = type === "notification" && checkbox !== undefined;

  return (
    <AlertDialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <AlertDialogPrimitive.Portal>
        <div className="dark">
          <AlertDialogPrimitive.Overlay className={styles.overlay} />
          <AlertDialogPrimitive.Content
            className={styles.content}
            // Cancel/Confirm are the only way out — Escape doesn't silently
            // dismiss a confirmation the user needs to explicitly decide on.
            onEscapeKeyDown={(event) => event.preventDefault()}
            style={
              width !== undefined
                ? ({ "--popover-width": `${width}px` } as React.CSSProperties)
                : undefined
            }
            data-warning={isWarning || undefined}
            // Without a description line, break the describedby reference Radix sets up
            {...(description ? {} : { "aria-describedby": undefined })}
          >
            <div className={styles.header}>
              <div className={styles.headerRow}>
                {leadingIcon ? (
                  <span
                    className={styles.icon}
                    data-warning={isWarning || undefined}
                  >
                    {leadingIcon}
                  </span>
                ) : null}
                <AlertDialogPrimitive.Title
                  className={styles.title}
                  data-warning={isWarning || undefined}
                >
                  {title}
                </AlertDialogPrimitive.Title>
              </div>
              {description ? (
                <AlertDialogPrimitive.Description
                  className={styles.description}
                >
                  {description}
                </AlertDialogPrimitive.Description>
              ) : null}
            </div>
            {showButton && (
              <div className={styles.footer}>
                {showCheckboxRow && (
                  <Checkbox
                    type="mute"
                    label={checkboxLabel}
                    checked={checkbox}
                    onCheckedChange={onCheckedChange}
                  />
                )}
                <ButtonGroup
                  type="confirm"
                  shouldFitContainer
                  secondaryLabel={cancelLabel}
                  primaryLabel={confirmLabel}
                  onSecondaryClick={onCancel}
                  onPrimaryClick={onConfirm}
                  renderSecondary={(button) => (
                    <AlertDialogPrimitive.Cancel asChild>
                      {button}
                    </AlertDialogPrimitive.Cancel>
                  )}
                  renderPrimary={(button) => (
                    <AlertDialogPrimitive.Action asChild>
                      {button}
                    </AlertDialogPrimitive.Action>
                  )}
                />
              </div>
            )}
          </AlertDialogPrimitive.Content>
        </div>
      </AlertDialogPrimitive.Portal>
    </AlertDialogPrimitive.Root>
  );
}
