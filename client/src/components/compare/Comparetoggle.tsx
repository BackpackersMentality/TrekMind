// components/compare/CompareToggle.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Small toggle button rendered inside each TrekCard.
// Adds / removes the trek from the comparison selection.
// Pass the full trek object (must match CompareTrek shape).
// ─────────────────────────────────────────────────────────────────────────────

import { memo } from "react";
import { GitCompareArrows } from "lucide-react";
import { useCompareStore, CompareTrek, MAX_COMPARE } from "@/store/compareStore";
import { cn } from "@/lib/utils";

interface CompareToggleProps {
  trek: CompareTrek;
  /** Optional: render as a compact icon-only button (default: icon + label) */
  compact?: boolean;
}

export const CompareToggle = memo(function CompareToggle({ trek, compact = false }: CompareToggleProps) {
  const { selectedTreks, addTrekToCompare, removeTrekFromCompare, limitReached } = useCompareStore();

  const isSelected  = selectedTreks.some(t => t.id === trek.id);
  const isFull      = selectedTreks.length >= MAX_COMPARE && !isSelected;

  const handleClick = (e: React.MouseEvent) => {
    // Prevent the click from bubbling up to the card (which may navigate to detail)
    e.preventDefault();
    e.stopPropagation();

    if (isSelected) {
      removeTrekFromCompare(trek.id);
    } else {
      addTrekToCompare(trek);
    }
  };

  return (
    <button
      onClick={handleClick}
      aria-label={isSelected ? `Remove ${trek.name} from comparison` : `Add ${trek.name} to comparison`}
      aria-pressed={isSelected}
      title={
        isFull && !isSelected
          ? `Max ${MAX_COMPARE} treks — remove one first`
          : isSelected
          ? "Remove from comparison"
          : "Compare this trek"
      }
      className={cn(
        // Base styles
        "group flex items-center gap-1.5 rounded-full border text-xs font-semibold",
        "transition-all duration-200 select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
        compact ? "p-1.5" : "px-2.5 py-1.5",

        // State: selected
        isSelected && [
          "bg-primary text-primary-foreground border-primary shadow-sm",
          "hover:bg-primary/90",
        ],

        // State: limit flash warning
        !isSelected && limitReached && [
          "bg-rose-50 border-rose-300 text-rose-500 animate-pulse",
        ],

        // State: default / unselected
        !isSelected && !limitReached && [
          "bg-white/90 border-border text-muted-foreground backdrop-blur-sm",
          "hover:border-primary hover:text-primary hover:bg-white",
          isFull && "opacity-40 cursor-not-allowed hover:border-border hover:text-muted-foreground",
        ],
      )}
    >
      <GitCompareArrows
        className={cn(
          "shrink-0 transition-transform duration-200",
          compact ? "w-3.5 h-3.5" : "w-3 h-3",
          isSelected && "scale-110",
        )}
      />
      {!compact && (
        <span className="leading-none">
          {isSelected ? "Added" : "Compare"}
        </span>
      )}
    </button>
  );
});
