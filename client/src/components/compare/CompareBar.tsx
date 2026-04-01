// components/compare/CompareBar.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Sticky bottom bar that appears when 2+ treks are selected.
// Shows trek avatars, count, and the "Compare" CTA button.
// Rendered via a portal so it always sits above other content.
// ─────────────────────────────────────────────────────────────────────────────

import { createPortal } from "react-dom";
import { GitCompareArrows, X, Trash2 } from "lucide-react";
import { useCompareStore, MAX_COMPARE } from "@/store/compareStore";
import { getTrekImageUrl } from "@/lib/images";
import { cn } from "@/lib/utils";

// Tiny avatar showing a trek's image (or fallback initial)
function TrekAvatar({ trek, onRemove }: { trek: any; onRemove: () => void }) {
  return (
    <div className="relative group shrink-0">
      <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-md bg-muted">
        <img
          src={getTrekImageUrl(trek.imageFilename)}
          alt={trek.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
        {/* Fallback initial */}
        <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white bg-primary/80">
          {trek.name.charAt(0)}
        </div>
      </div>

      {/* Remove button on hover */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        aria-label={`Remove ${trek.name}`}
        className={cn(
          "absolute -top-1 -right-1 w-4.5 h-4.5 rounded-full",
          "bg-gray-900 text-white flex items-center justify-center",
          "opacity-0 group-hover:opacity-100 transition-opacity duration-150 shadow-md",
        )}
      >
        <X className="w-2.5 h-2.5" />
      </button>

      {/* Trek name tooltip */}
      <div className={cn(
        "absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1",
        "bg-gray-900 text-white text-[10px] font-medium rounded whitespace-nowrap",
        "opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none",
        "shadow-lg",
      )}>
        {trek.name}
      </div>
    </div>
  );
}

// Empty slot — shown for unfilled compare slots (up to MAX_COMPARE)
function EmptySlot() {
  return (
    <div className="w-10 h-10 rounded-full border-2 border-dashed border-white/40 bg-white/10 shrink-0" />
  );
}

export function CompareBar() {
  const { selectedTreks, removeTrekFromCompare, clearCompare, openCompare, limitReached } = useCompareStore();
  const count = selectedTreks.length;

  // Only render when at least 1 trek is selected
  if (count === 0) return null;

  const canCompare = count >= 2;
  const slots = Array.from({ length: MAX_COMPARE });

  return createPortal(
    <div
      role="region"
      aria-label="Trek comparison bar"
      className={cn(
        // Position & layout
        "fixed bottom-0 left-0 right-0 z-50",
        "flex items-center justify-between gap-3 px-4 py-3 sm:px-6",
        // Background
        "bg-gray-950/95 backdrop-blur-md border-t border-white/10",
        // Entry animation
        "animate-in slide-in-from-bottom-4 duration-300",
      )}
    >
      {/* Left: avatar slots */}
      <div className="flex items-center gap-2">
        {slots.map((_, i) => {
          const trek = selectedTreks[i];
          return trek ? (
            <TrekAvatar
              key={trek.id}
              trek={trek}
              onRemove={() => removeTrekFromCompare(trek.id)}
            />
          ) : (
            <EmptySlot key={i} />
          );
        })}

        {/* Count label */}
        <div className="ml-1 hidden sm:block">
          <p className="text-white text-sm font-semibold leading-none">
            {count} trek{count !== 1 ? "s" : ""} selected
          </p>
          <p className="text-white/40 text-xs mt-0.5">
            {canCompare
              ? count < MAX_COMPARE ? `Add up to ${MAX_COMPARE - count} more` : "Ready to compare"
              : "Select 1 more to compare"}
          </p>
        </div>
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Limit warning flash */}
        {limitReached && (
          <span className="text-rose-400 text-xs font-semibold animate-in fade-in duration-200">
            Max {MAX_COMPARE} treks
          </span>
        )}

        {/* Clear button */}
        <button
          onClick={clearCompare}
          aria-label="Clear all selected treks"
          className={cn(
            "flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold",
            "text-white/50 hover:text-white border border-white/20 hover:border-white/40",
            "transition-all duration-200",
          )}
        >
          <Trash2 className="w-3 h-3" />
          <span className="hidden sm:inline">Clear</span>
        </button>

        {/* Main CTA */}
        <button
          onClick={openCompare}
          disabled={!canCompare}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold",
            "transition-all duration-200 shadow-lg",
            canCompare
              ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-primary/30"
              : "bg-white/10 text-white/30 cursor-not-allowed",
          )}
        >
          <GitCompareArrows className="w-4 h-4" />
          Compare
          {canCompare && (
            <span className="w-5 h-5 rounded-full bg-white/20 text-xs flex items-center justify-center font-bold leading-none">
              {count}
            </span>
          )}
        </button>
      </div>
    </div>,
    document.body,
  );
}
