// types/filters.ts — multi-select: each filter is an array of selected values

export interface FilterState {
  tier:          string[];   // e.g. ["1","2"] or [] for all
  region:        string[];
  accommodation: string[];
  terrain:       string[];
  duration:      string[];
  popularity:    string[];
}

export const EMPTY_FILTERS: FilterState = {
  tier: [], region: [], accommodation: [],
  terrain: [], duration: [], popularity: [],
};

export function isFilterEmpty(filters: FilterState): boolean {
  return Object.values(filters).every(arr => arr.length === 0);
}

export function countActiveFilters(filters: FilterState): number {
  return Object.values(filters).reduce((sum, arr) => sum + arr.length, 0);
}

export interface FilterGroupProps {
  label:    string;
  name:     string;
  options:  { value: string; label: string }[];
  selected: string[];
  onChange: (value: string) => void;  // toggles individual item
}
