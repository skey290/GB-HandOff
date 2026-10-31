"use client";

import * as React from "react";
import {
  Blocks,
  CircleArrowOutUpRight,
  Compass,
  Home,
  UserRoundSearch,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { createSpriteIcon } from "@/lib/sprite-icon";
import { Gnb, type GnbItem } from "@/components/app/gnb";
import { CompassToolbar } from "@/components/screens/compass/ui/compass-toolbar";
import { ButtonGroup } from "@/components/ui/button-group";
import { Toggle, type ToggleItem } from "@/components/ui/toggle";
import { CompassSphere } from "@/components/screens/compass/ui/compass-sphere";
import { CompassDetailView } from "@/components/screens/compass/ui/compass-detail-view";
import {
  CompassAnalysis,
  type CompassAnalysisSelf,
  type CompassAnalysisType,
} from "@/components/screens/compass/ui/compass-analysis";

// Figma "Toggle" (❄️ GB_Compass) — the Analysis submenu that always floats
// near the GNB (node `I8052:33420;8045:20717;5133:9483`). Uses the generic
// `components/ui/toggle` (`orientation="vertical"`) as-is, with only the 4
// labels/icons defined on this page — no separate
// Compass-specific wrapper component.
type AnalysisSubmenuValue =
  "growth-potential" | "reach" | "engagement" | "ranking";

const AnalysisReachIcon = createSpriteIcon("reach-icon");
const AnalysisEngagementIcon = createSpriteIcon("engagement-icon");
const AnalysisRankingIcon = createSpriteIcon("crown-icon");

const ANALYSIS_MENU_ITEMS: {
  value: AnalysisSubmenuValue;
  label: string;
  icon: React.ReactNode;
}[] = [
  {
    value: "growth-potential",
    label: "Growth Potential",
    icon: <CircleArrowOutUpRight aria-hidden="true" className="size-full" />,
  },
  {
    value: "reach",
    label: "Reach",
    icon: <AnalysisReachIcon aria-hidden="true" className="size-full" />,
  },
  {
    value: "engagement",
    label: "Engagement",
    icon: <AnalysisEngagementIcon aria-hidden="true" className="size-full" />,
  },
  {
    value: "ranking",
    label: "Ranking",
    icon: <AnalysisRankingIcon aria-hidden="true" className="size-full" />,
  },
];

// Matches the Figma GNB node (8163:93080) — Assets uses a custom sprite,
// the rest use standard lucide icons (same source as components/app/gnb/gnb.stories.tsx).
const AssetIcon = createSpriteIcon("asset-icon");

const GNB_ITEMS: GnbItem[] = [
  { id: "dashboard", icon: Home, label: "Dashboard" },
  { id: "assets", icon: AssetIcon, label: "Self" },
  { id: "compass", icon: Compass, label: "Compass" },
  { id: "contents-studio", icon: Blocks, label: "Content Studio" },
  { id: "know-thyself", icon: UserRoundSearch, label: "Know Thyself" },
];

// 8 self placeholders — matched the 8 persona names found in the Figma dial
// character variants to the existing /public/images/personas/*.jpg assets
// (all 8 already in use in the components/screens/compass/ui/compass-self-avatar
// story). "Data Scientist" is the default self name by project-wide
// convention, so it maps to self-default.jpg.
const SELF_OPTIONS = [
  { value: "self-default", label: "Data Scientist" },
  { value: "team-leader", label: "Office Worker" },
  { value: "entrepreneur", label: "Entrepreneur" },
  { value: "fashion-editor", label: "Fashion Editor" },
  { value: "fashionista", label: "Fashionista" },
  { value: "novelist", label: "English Novelist" },
  { value: "vegan-chef", label: "Vegan Chef" },
  { value: "yoga-meditator", label: "Yoga Meditator" },
];

const TOGGLE_OPTIONS = [
  { value: "home", label: "Home" },
  { value: "analysis", label: "Analysis" },
] as const;

/**
 * Ported the exact same figures (id/image/qualifiedReach/engagementIntensity/growth)
 * as `DEMO_SELVES` in
 * `components/screens/compass/ui/compass-analysis/compass-analysis.stories.tsx` —
 * reusing already-verified Figma mock data instead of inventing new values
 * (per user instruction). Array order (index 0 = north) is also kept
 * identical to that story, following the "north = Data Scientist (the
 * current user themselves)" convention.
 */
const ANALYSIS_SELVES: CompassAnalysisSelf[] = [
  {
    id: "data-scientist",
    image: "/images/personas/self-default.jpg",
    imageAlt: "Data Scientist",
    qualifiedReach: 8340,
    engagementIntensity: 14.3,
    growth: 55,
  },
  {
    id: "yoga-meditator",
    image: "/images/personas/yoga-meditator.jpg",
    imageAlt: "Yoga Meditator",
    qualifiedReach: 6453,
    engagementIntensity: 1.8,
    growth: 20,
  },
  {
    id: "novelist",
    image: "/images/personas/novelist.jpg",
    imageAlt: "Novelist",
    qualifiedReach: 4784,
    engagementIntensity: 0.4,
    growth: 30,
  },
  {
    id: "entrepreneur",
    image: "/images/personas/entrepreneur.jpg",
    imageAlt: "Entrepreneur",
    qualifiedReach: 978,
    engagementIntensity: 2.0,
    growth: 45,
  },
  {
    id: "fashionista",
    image: "/images/personas/fashionista.jpg",
    imageAlt: "Fashionista",
    qualifiedReach: 6782,
    engagementIntensity: 0.3,
    growth: 10,
  },
  {
    id: "fashion-editor",
    image: "/images/personas/fashion-editor.jpg",
    imageAlt: "Fashion Editor",
    qualifiedReach: 125,
    engagementIntensity: 3.7,
    growth: 65,
  },
  {
    id: "team-leader",
    image: "/images/personas/team-leader.jpg",
    imageAlt: "Team Leader",
    qualifiedReach: 8006,
    engagementIntensity: 0.5,
    growth: 15,
  },
  {
    id: "vegan-chef",
    image: "/images/personas/vegan-chef.jpg",
    imageAlt: "Vegan Chef",
    qualifiedReach: 5431,
    engagementIntensity: 1.9,
    growth: 25,
  },
];

/**
 * Mapping of the 4 Analysis submenu items → `CompassAnalysis` props. Ported
 * as-is from a table confirmed via a Figma measurement (in a prior session).
 */
const ANALYSIS_CONFIG: Record<
  AnalysisSubmenuValue,
  {
    type: CompassAnalysisType;
    label?: string;
  }
> = {
  "growth-potential": { type: "potential" },
  reach: { type: "reach", label: "Most Reached Post" },
  engagement: { type: "engagement", label: "Most Engaged Post" },
  ranking: { type: "reach-and-engagement", label: "Ranking" },
};

/**
 * `CompassDetailView` has no scroll/height control of its own (the component
 * keeps the Figma frame as-is; scrolling is the consumer's responsibility),
 * so this wraps it to add vertical scroll and a custom track/thumb scrollbar
 * (Figma node 4740:1311 — same pattern as `select`/`noti-dropdown`, native
 * scrollbar hidden). The same implementation already exists separately in
 * both of those components, so this is now duplicated further, but
 * extracting a shared hook/component for all three is out of scope for this
 * request and isn't done here.
 */
function ScrollableDetailView() {
  const [thumb, setThumb] = React.useState({ top: 0, height: 100 });
  const [scrollable, setScrollable] = React.useState(false);
  const listRef = React.useRef<HTMLDivElement>(null);

  const updateThumb = React.useCallback(() => {
    const el = listRef.current;
    if (!el) return;
    const { scrollTop, scrollHeight, clientHeight } = el;
    if (scrollHeight <= clientHeight) {
      setScrollable(false);
      setThumb({ top: 0, height: 100 });
      return;
    }
    setScrollable(true);
    const heightPercent = (clientHeight / scrollHeight) * 100;
    const topPercent =
      (scrollTop / (scrollHeight - clientHeight)) * (100 - heightPercent);
    setThumb({ top: topPercent, height: heightPercent });
  }, []);

  const listCallbackRef = React.useCallback(
    (node: HTMLDivElement | null) => {
      listRef.current = node;
      if (node) updateThumb();
    },
    [updateThumb],
  );

  React.useEffect(() => {
    window.addEventListener("resize", updateThumb);
    return () => window.removeEventListener("resize", updateThumb);
  }, [updateThumb]);

  return (
    <div className="flex h-full shrink-0">
      <div
        ref={listCallbackRef}
        onScroll={updateThumb}
        className="h-full overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <CompassDetailView type="default" />
      </div>
      {scrollable && (
        <div
          aria-hidden="true"
          className="shrink-0 py-[var(--spacing-1)] pr-[var(--spacing-1)]"
        >
          <div className="relative h-full w-[10px] rounded-[var(--radius-scale-full)] bg-[var(--background-subtler)]">
            <div
              className="absolute inset-x-0 rounded-[var(--radius-scale-full)] bg-[var(--background-subtle)]"
              style={{ top: `${thumb.top}%`, height: `${thumb.height}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default function CompassPage() {
  const [gnbExpanded, setGnbExpanded] = React.useState(true);
  const [floatingNavActiveId, setFloatingNavActiveId] =
    React.useState<string>("compass");
  const [toggleValue, setToggleValue] = React.useState<string>("home");
  const [selfValue, setSelfValue] = React.useState("self-default");
  const [analysisSubmenu, setAnalysisSubmenu] =
    React.useState<AnalysisSubmenuValue>("growth-potential");

  // Coachmark visibility is controlled purely by a boolean, without any
  // real "9 posts + 7 days elapsed" judgment logic (per user instruction) —
  // pressing the X button only turns off that submenu's coachmark. Ranking
  // has no coachmark in Figma.
  const [showGrowthCoachmark, setShowGrowthCoachmark] = React.useState(true);
  const [showReachCoachmark, setShowReachCoachmark] = React.useState(true);
  const [showEngagementCoachmark, setShowEngagementCoachmark] =
    React.useState(true);

  const coachmark = React.useMemo(() => {
    if (analysisSubmenu === "growth-potential" && showGrowthCoachmark) {
      return {
        title: "Growth Potential: 80%",
        description: "Start posting to turn this potential into real reach.",
        onDismiss: () => setShowGrowthCoachmark(false),
      };
    }
    if (analysisSubmenu === "reach" && showReachCoachmark) {
      return {
        title: "Most Reached: 8,340",
        onDismiss: () => setShowReachCoachmark(false),
      };
    }
    if (analysisSubmenu === "engagement" && showEngagementCoachmark) {
      return {
        title: "Most Engaged: 14.3%",
        onDismiss: () => setShowEngagementCoachmark(false),
      };
    }
    return undefined;
  }, [
    analysisSubmenu,
    showGrowthCoachmark,
    showReachCoachmark,
    showEngagementCoachmark,
  ]);

  const isAnalysis = toggleValue === "analysis";
  const analysisConfig = ANALYSIS_CONFIG[analysisSubmenu];
  // Only Reach/Ranking (reach-and-engagement) draw the outward ring, and
  // their north (slot 0) label — including where the coachmark attaches —
  // bleeds up to `OUTWARD_NORTH_LABEL_MAX_BLEED` (44px,
  // components/screens/compass/ui/compass-dial/compass-dial-utils.ts) above the top
  // of the canvas. Engagement (inward-only) doesn't have this issue. With
  // only the existing `pt` (the spacing-4 gap between the floating pill and
  // the top of the canvas), this bleeding label gets completely hidden
  // behind the floating pill, so extra `pt` is reserved by that amount only
  // when the outward ring is present.
  const hasOutwardRing =
    analysisConfig.type === "reach" ||
    analysisConfig.type === "reach-and-engagement";

  return (
    <div className="dark relative flex h-screen w-screen overflow-hidden bg-[var(--background-default)]">
      <Gnb
        expanded={gnbExpanded}
        onExpandedChange={setGnbExpanded}
        items={GNB_ITEMS}
        activeId="compass"
      />

      <div className="relative min-w-0 flex-1 overflow-hidden">
        {/* Figma measurement: the dotted background isn't specific to
            CompassSphere — it's a page-level layer shared across all 5
            states (Home/Growth Potential/Reach/Engagement/Ranking); every
            "Compass Page Component" under node 8052:39896 has the same
            dotted background at the same position/size. To avoid drawing it
            twice, it's drawn only here and CompassSphere's own background
            was removed. It's always laid down as a viewport-sized base
            layer, and the extra area revealed while scrolling Analysis is
            drawn with the same class once more inside the scroll wrapper
            below, so it continues seamlessly. */}
        <div
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute inset-0",
            "bg-[var(--color-neutral-950)]",
            // The dot color --border-mute-subtle (neutral-400, #a3a3a3)
            // contrasted too strongly against the neutral-950 (#0a0a0a)
            // background, making the dots stand out too much — since this
            // area, like CompassSphere, is a fixed dark background
            // regardless of theme, it was dialed down one step to the
            // darker neutral-700 primitive instead of a semantic token.
            "bg-[radial-gradient(circle,var(--color-neutral-700)_1px,transparent_1px)]",
            "bg-[length:var(--spacing-6)_var(--spacing-6)]",
          )}
        />

        {/* CompassSphere/CompassAnalysis are components that fill the
            container completely, so the toggle/self select must come after
            them (later in DOM order) to appear on top. When the Analysis
            toggle is on, the CompassAnalysis variant chosen by the submenu
            is drawn overlapping the same spot instead of the Home-only Sphere.

            Centering the dial (an 800px fixed canvas) with plain
            `items-center` alone causes the top of the canvas to rise into
            the floating menu above (`ButtonGroup type="menu"`, top
            spacing-4 + 53px tall) when the viewport height is short (around
            828px), overlapping it. The Figma mockup (1920×1218) is a fixed
            frame far larger than the canvas, so the margin there appeared
            naturally and isn't a measured spec value (this is purely
            defensive layout logic) — `[align-items:safe_center]` keeps the
            same dead-center alignment when there's enough room, and falls
            back to just below the minimum `pt` margin when there isn't.

            When `pt` grows to 129px in the outward-ring (Reach/Ranking)
            state, the bottom of the canvas was getting clipped outright by
            this container's `overflow-hidden` on narrow viewports
            (2560×929). The floating pill/toggle (the two blocks below) stay
            outside this scroll area (sibling elements, absolute relative to
            the outer container) so they stay fixed while scrolling, and only
            this layer — which holds just the canvas — gets its own
            `overflow-y-auto` so the whole thing can be scrolled into view
            instead of clipped. */}
        {isAnalysis ? (
          <div className="absolute inset-0 overflow-y-auto overscroll-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div
              className={cn(
                "flex min-h-full justify-center",
                "[align-items:safe_center]",
                "bg-[var(--color-neutral-950)]",
                "bg-[radial-gradient(circle,var(--color-neutral-700)_1px,transparent_1px)]",
                "bg-[length:var(--spacing-6)_var(--spacing-6)]",
                // Conditionally increases pt only, by the outward ring's
                // (Reach/Ranking) north label bleed (44px, see the
                // hasOutwardRing comment above). pb is unrelated to this
                // issue and left as-is.
                hasOutwardRing
                  ? "pt-[calc(var(--spacing-4)*2+53px+44px)]"
                  : "pt-[calc(var(--spacing-4)*2+53px)]",
                "pb-[calc(var(--spacing-4)*2+53px)]",
              )}
            >
              <CompassAnalysis
                type={analysisConfig.type}
                label={analysisConfig.label}
                selves={ANALYSIS_SELVES}
                coachmark={coachmark}
              />
            </div>
          </div>
        ) : (
          <CompassSphere className="absolute inset-0" />
        )}

        <div className="absolute top-[var(--spacing-4)] left-1/2 -translate-x-1/2">
          <ButtonGroup
            type="menu"
            activeId={floatingNavActiveId}
            onActiveChange={setFloatingNavActiveId}
            className="dark [&>button[data-selected]]:text-sm-semi-bold"
          />
        </div>

        <div className="absolute top-[var(--spacing-4)] left-[var(--spacing-4)] flex flex-col gap-[var(--spacing-3)]">
          <CompassToolbar
            toggleOptions={TOGGLE_OPTIONS}
            toggleValue={toggleValue}
            onToggleValueChange={setToggleValue}
            selectOptions={isAnalysis ? undefined : SELF_OPTIONS}
            selectValue={selfValue}
            onSelectValueChange={setSelfValue}
          />
          {isAnalysis && (
            <Toggle
              orientation="vertical"
              items={ANALYSIS_MENU_ITEMS.map((item): ToggleItem => ({
                icon: item.icon,
                label: item.label,
                "aria-label": item.label,
                pressed: item.value === analysisSubmenu,
                onPressedChange: () => setAnalysisSubmenu(item.value),
              }))}
            />
          )}
        </div>
      </div>

      <ScrollableDetailView />
    </div>
  );
}
