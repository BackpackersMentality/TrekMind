// store/useFilterStore.ts — multi-select: each filter is an array
import { create } from 'zustand';
import { FilterState, EMPTY_FILTERS } from '../types/filters';

interface FilterStore extends FilterState {
  setTier:          (tier: string[]) => void;
  setRegion:        (region: string[]) => void;
  setAccommodation: (accommodation: string[]) => void;
  setTerrain:       (terrain: string[]) => void;
  setDuration:      (duration: string[]) => void;
  setPopularity:    (popularity: string[]) => void;
  resetFilters:     () => void;
}

export const useFilterStore = create<FilterStore>((set) => ({
  ...EMPTY_FILTERS,
  setTier:          (tier)          => set({ tier }),
  setRegion:        (region)        => set({ region }),
  setAccommodation: (accommodation) => set({ accommodation }),
  setTerrain:       (terrain)       => set({ terrain }),
  setDuration:      (duration)      => set({ duration }),
  setPopularity:    (popularity)    => set({ popularity }),
  resetFilters:     ()              => set(EMPTY_FILTERS),
}));
