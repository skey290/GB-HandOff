"use client";

import * as React from "react";
import { Check, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Icon } from "@/lib/sprite-icon";
import { Badge } from "@/components/ui/badge";
import { Select, type SelectOption } from "@/components/ui/select";

import styles from "./asset-gallery-card.module.css";

export type { SelectOption as AssetGalleryCardMenuOption };

const MENU_HOVER_CLOSE_DELAY = 150;

export interface AssetGalleryCardProps {
  /** Image URL. Present renders the filled card, absent renders the empty upload card. */
  image?: string;
  /** Alt text for the image. */
  alt?: string;
  /** Date label shown on the filled card. Omitted skips the label. Ignored on the style card. */
  date?: string;
  /** Shows a "Main" badge in the bottom-left corner, marking this as the self's current main portrait. Ignored on the style/empty/removable card types. */
  isMainPortrait?: boolean;
  /** Called with the selected file when uploading via the empty card. Ignored when `onEmptyClick` is given. */
  onUpload?: (file: File) => void;
  /** Label shown on the empty card. On the compact (`isCompact`) empty card it's icon-only — this becomes the `aria-label` instead of visible text. */
  emptyLabel?: string;
  /** Switches the empty card from a file-picker `<label>` to a plain button that calls this instead — for callers that open their own picker (e.g. a gallery dialog) rather than uploading a file directly. */
  onEmptyClick?: () => void;
  /** Filled card's "..." dropdown items. Omitted hides the trigger. Ignored when `isSelected` is given or on the style card. */
  menuOptions?: SelectOption[];
  /** Called with the selected option's value when a menu item is chosen. */
  onSelectMenuOption?: (value: string) => void;
  /** Card title. Given switches the filled card into the style card type (Figma `Style=style card`), which always shows the checkbox. */
  title?: string;
  /** Description shown below the title on the style card. Ignored when `isCompact` is set. */
  description?: string;
  /** Switches the style card into Figma's `Style=style card compact` look (104×124, no description, smaller checkbox) instead of the full-size style card. On the empty card, drops to a square icon-only look (Figma `Style=empty compact`, no `emptyLabel` text). Ignored on the removable/selectable/default filled looks. */
  isCompact?: boolean;
  /** Given (and no `title`/`isSelected`), switches the filled card into the removable type (Figma `Style=removable compact`) — a plain image with a remove (×) badge instead of a checkbox or "..." menu. */
  onRemove?: () => void;
  /** Checked state. Passing it (even `false`) switches the filled card into the selectable type (Figma `Style=selectable card`). Always treated as given on the style card. */
  isSelected?: boolean;
  /** Called with the next checked state when a selectable or style card is clicked or toggled via keyboard. */
  onSelectedChange?: (selected: boolean) => void;
  /** ARIA role for a selectable or style card — `"checkbox"` (default, independent toggle) or `"radio"` (mutually exclusive within a `role="radiogroup"` container). */
  selectionRole?: "checkbox" | "radio";
  className?: string;
  /** Inline style overrides on the root — CSS Modules outrank Tailwind utility classes here, so size overrides need this instead of `className`. */
  style?: React.CSSProperties;
  /** Forwarded to the "..." menu's `Select` — see `Select`'s `container` prop. */
  menuContainer?: HTMLElement | null;
}

export function AssetGalleryCard({
  image,
  alt = "",
  date,
  isMainPortrait = false,
  onUpload,
  emptyLabel = "Upload Your Image",
  onEmptyClick,
  menuOptions,
  onSelectMenuOption,
  title,
  description,
  isCompact = false,
  onRemove,
  isSelected,
  onSelectedChange,
  selectionRole = "checkbox",
  className,
  style,
  menuContainer,
}: AssetGalleryCardProps) {
  const isStyleCard = title !== undefined;
  const isSelectable = isStyleCard || isSelected !== undefined;
  const checked = isSelected ?? false;

  const toggleSelected = () => onSelectedChange?.(!checked);

  const [menuOpen, setMenuOpen] = React.useState(false);
  const menuCloseTimeoutRef =
    React.useRef<ReturnType<typeof setTimeout>>(undefined);
  React.useEffect(() => () => clearTimeout(menuCloseTimeoutRef.current), []);
  const openMenu = () => {
    clearTimeout(menuCloseTimeoutRef.current);
    setMenuOpen(true);
  };
  const scheduleCloseMenu = () => {
    clearTimeout(menuCloseTimeoutRef.current);
    menuCloseTimeoutRef.current = setTimeout(
      () => setMenuOpen(false),
      MENU_HOVER_CLOSE_DELAY,
    );
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onUpload?.(file);
    }
    event.target.value = "";
  };

  if (!image) {
    const emptyClassName = cn(
      styles.root,
      styles.empty,
      isCompact && styles.compactEmpty,
      className,
    );
    const emptyContent = (
      <>
        <span className={styles.plusCircle}>
          <Icon id="plus-icon" className={styles.plusIcon} />
        </span>
        {!isCompact ? (
          <span className={styles.uploadText}>{emptyLabel}</span>
        ) : null}
      </>
    );

    if (onEmptyClick) {
      return (
        <div
          data-slot="asset-gallery-card"
          role="button"
          aria-label={isCompact ? emptyLabel : undefined}
          tabIndex={0}
          onClick={onEmptyClick}
          onKeyDown={(event) => {
            if (event.key === " " || event.key === "Enter") {
              event.preventDefault();
              onEmptyClick();
            }
          }}
          className={emptyClassName}
          style={style}
        >
          {emptyContent}
        </div>
      );
    }

    return (
      <label
        data-slot="asset-gallery-card"
        aria-label={isCompact ? emptyLabel : undefined}
        className={emptyClassName}
        style={style}
      >
        {emptyContent}
        <input
          type="file"
          accept="image/*"
          className={styles.fileInput}
          onChange={handleFileChange}
        />
      </label>
    );
  }

  const isCompactStyleCard = isStyleCard && isCompact;
  const isRemovable = !isStyleCard && onRemove !== undefined;

  return (
    <div
      data-slot="asset-gallery-card"
      className={cn(
        styles.root,
        isCompactStyleCard
          ? styles.compactCard
          : isStyleCard
            ? styles.styleCard
            : isRemovable
              ? isCompact
                ? styles.compactRemovable
                : styles.removable
              : styles.filled,
        isSelectable && !isCompactStyleCard && styles.selectable,
        className,
      )}
      style={style}
      role={isSelectable ? selectionRole : undefined}
      aria-checked={isSelectable ? checked : undefined}
      tabIndex={isSelectable ? 0 : undefined}
      onClick={isSelectable ? toggleSelected : undefined}
      onKeyDown={
        isSelectable
          ? (event) => {
              if (event.key === " " || event.key === "Enter") {
                event.preventDefault();
                toggleSelected();
              }
            }
          : undefined
      }
    >
      {isCompactStyleCard ? (
        <>
          <div className={styles.compactImageBox}>
            <div className={styles.compactImageClip}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image} alt={alt} className={styles.compactImg} />
            </div>
            <span aria-hidden="true" className={styles.compactRing} />
            <span aria-hidden="true" className={styles.compactCheckbox}>
              <Check aria-hidden="true" className={styles.compactCheckIcon} />
            </span>
          </div>
          {title ? <p className={styles.compactTitle}>{title}</p> : null}
        </>
      ) : isStyleCard ? (
        <>
          <div className={styles.styleCardImage}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={image} alt={alt} className={styles.styleCardImg} />
          </div>
          {title || description ? (
            <div className={styles.styleCardTextPanel}>
              {title ? <p className={styles.styleCardTitle}>{title}</p> : null}
              {description ? (
                <p className={styles.styleCardDescription}>{description}</p>
              ) : null}
            </div>
          ) : null}
        </>
      ) : isRemovable && isCompact ? (
        <div className={styles.compactImageClip}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={image} alt={alt} className={styles.compactImg} />
        </div>
      ) : (
        <div className={styles.imageClip}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={image} alt={alt} className={styles.image} />
        </div>
      )}
      {!isCompactStyleCard && !isRemovable ? (
        <span aria-hidden="true" className={styles.hoverRing} />
      ) : null}
      {!isStyleCard && !isRemovable && date ? (
        <span className={styles.dateLabel}>{date}</span>
      ) : null}
      {!isStyleCard && !isRemovable && isMainPortrait ? (
        <Badge variant="default" className={styles.mainBadge}>
          Main
        </Badge>
      ) : null}
      {isCompactStyleCard ? null : isRemovable ? (
        <button
          type="button"
          onClick={onRemove}
          aria-label="Remove image"
          className={styles.removeButton}
        >
          <X aria-hidden="true" className={styles.removeIcon} />
        </button>
      ) : isSelectable ? (
        <span aria-hidden="true" className={styles.checkboxIndicator}>
          <Check aria-hidden="true" className={styles.checkIcon} />
        </span>
      ) : !isStyleCard && menuOptions && menuOptions.length > 0 ? (
        <Select
          variant="icon-ghost"
          icon="ellipsis-icon"
          options={menuOptions}
          onValueChange={onSelectMenuOption}
          className={styles.menuTrigger}
          open={menuOpen}
          onOpenChange={(next) => (next ? openMenu() : scheduleCloseMenu())}
          onTriggerMouseLeave={scheduleCloseMenu}
          onContentMouseEnter={openMenu}
          onContentMouseLeave={scheduleCloseMenu}
          container={menuContainer}
        />
      ) : null}
    </div>
  );
}
