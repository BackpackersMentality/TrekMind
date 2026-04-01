// store/compareStore.ts
// ─────────────────────────────────────────────────────────────────────────────
// Global state for the TrekH2H (Head-to-Head) comparison feature.
// Max 3 treks can be selected at any time.
// ─────────────────────────────────────────────────────────────────────────────

import { create } from "zustand";

export interface CompareTrek {
  id:            string;
  name:          string;
  region:        string;
  country:       string;
  terrain:       string;
  accommodation: string;
  distance:      string;
  totalDays:     string;
  maxAltitude:   string;
  season:        string;
  permits:       string;
  popularityScore: number;
  tier:          number;
  durationBucket: string;
  budget?:       "Low" | "Medium" | "High";
  costNotes?:    string;
  costIndependent?: { usd: [number, number]; local: { amount: [number, number]; currency: string; code: string } };
  keyFeatures?:  string;
  imageFilename?: string;
}

export const MAX_COMPARE = 3;

interface CompareStore {
  selectedTreks:       CompareTrek[];
  isCompareOpen:       boolean;
  limitReached:        boolean; // transient flag — set true briefly when user hits max

  addTrekToCompare:    (trek: CompareTrek) => void;
  removeTrekFromCompare: (id: string) => void;
  clearCompare:        () => void;
  openCompare:         () => void;
  closeCompare:        () => void;
  setLimitReached:     (v: boolean) => void;
}

export const useCompareStore = create<CompareStore>((set, get) => ({
  selectedTreks:  [],
  isCompareOpen:  false,
  limitReached:   false,

  addTrekToCompare: (trek) => {
    const { selectedTreks } = get();
    if (selectedTreks.length >= MAX_COMPARE) {
      // Flash the limit warning for 2 seconds then clear
      set({ limitReached: true });
      setTimeout(() => set({ limitReached: false }), 2000);
      return;
    }
    if (selectedTreks.find(t => t.id === trek.id)) return; // already added
    set({ selectedTreks: [...selectedTreks, trek] });
  },

  removeTrekFromCompare: (id) =>
    set(state => ({
      selectedTreks: state.selectedTreks.filter(t => t.id !== id),
      // Auto-close comparison view if fewer than 2 remain
      isCompareOpen: state.selectedTreks.filter(t => t.id !== id).length >= 2
        ? state.isCompareOpen
        : false,
    })),

  clearCompare: () => set({ selectedTreks: [], isCompareOpen: false }),

  openCompare:  () => set({ isCompareOpen: true }),
  closeCompare: () => set({ isCompareOpen: false }),
  setLimitReached: (v) => set({ limitReached: v }),
}));
