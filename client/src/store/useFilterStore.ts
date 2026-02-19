import { create } from 'zustand';

interface FilterState {
  tier: number | null;
  region: string | null;
  accommodation: string | null;
  duration: string | null;
  difficulty: string | null;
  
  setTier: (tier: number | null) => void;
  setRegion: (region: string | null) => void;
  setAccommodation: (accommodation: string | null) => void;
  setDuration: (duration: string | null) => void;
  setDifficulty: (difficulty: string | null) => void;
  resetFilters: () => void;
}

export const useFilterStore = create<FilterState>((set) => ({
  tier: null,
  region: null,
  accommodation: null,
  duration: null,
  difficulty: null,
  
  setTier: (tier) => set({ tier }),
  setRegion: (region) => set({ region }),
  setAccommodation: (accommodation) => set({ accommodation }),
  setDuration: (duration) => set({ duration }),
  setDifficulty: (difficulty) => set({ difficulty }),
  
  resetFilters: () => set({
    tier: null,
    region: null,
    accommodation: null,
    duration: null,
    difficulty: null,
  }),
}));
