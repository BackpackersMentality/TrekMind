// store/useFilterStore.ts
// Zustand store for filter state.
// Replaces: difficulty field removed (no data in treks.json)
// Added: terrain, popularity fields

import { create } from 'zustand';

interface FilterStore {
  tier:          string | null;
  region:        string | null;
  accommodation: string | null;
  terrain:       string | null;
  duration:      string | null;
  popularity:    string | null;

  setTier:          (tier: string | null) => void;
  setRegion:        (region: string | null) => void;
  setAccommodation: (accommodation: string | null) => void;
  setTerrain:       (terrain: string | null) => void;
  setDuration:      (duration: string | null) => void;
  setPopularity:    (popularity: string | null) => void;
  resetFilters:     () => void;
}

export const useFilterStore = create<FilterStore>((set) => ({
  tier:          null,
  region:        null,
  accommodation: null,
  terrain:       null,
  duration:      null,
  popularity:    null,

  setTier:          (tier)          => set({ tier }),
  setRegion:        (region)        => set({ region }),
  setAccommodation: (accommodation) => set({ accommodation }),
  setTerrain:       (terrain)       => set({ terrain }),
  setDuration:      (duration)      => set({ duration }),
  setPopularity:    (popularity)    => set({ popularity }),
  resetFilters:     ()              => set({
    tier: null, region: null, accommodation: null,
    terrain: null, duration: null, popularity: null,
  }),
}));
