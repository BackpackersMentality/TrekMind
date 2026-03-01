import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { FilterGroup } from './FilterGroup';
import type { FilterState } from '../types/filters';

interface FilterPopupProps {
  isOpen: boolean;
  onClose: () => void;
  currentFilters: FilterState;
  onApply: (filters: FilterState) => void;
}

// All values map to real treks.json fields via filterTreks.ts category helpers.
// Region values match trek.region exactly. 
// Accommodation/terrain/duration/popularity use bucketed matching.
const FILTER_OPTIONS = {
  tier: [
    { value: "ALL", label: "All Tiers" },
    { value: "1",   label: "⭐ Tier 1 — Legendary" },
    { value: "2",   label: "🥈 Tier 2 — Classic" },
    { value: "3",   label: "🥉 Tier 3 — Hidden" },
  ],
  region: [
    { value: "ALL",             label: "All Regions" },
    { value: "Europe",          label: "🌍 Europe" },
    { value: "Asia",            label: "🌏 Asia" },
    { value: "Africa",          label: "🌍 Africa" },
    { value: "North America",   label: "🌎 North America" },
    { value: "South America",   label: "🌎 South America" },
    { value: "Central America", label: "🌎 Central America" },
    { value: "Middle East",     label: "🕌 Middle East" },
    { value: "Oceania",         label: "🌊 Oceania" },
  ],
  duration: [
    { value: "ALL",    label: "Any Length" },
    { value: "Short",  label: "⚡ Short (1–5 days)" },
    { value: "Medium", label: "🥾 Medium (6–10 days)" },
    { value: "Long",   label: "🏕 Long (11–16 days)" },
    { value: "Epic",   label: "🌍 Epic (17+ days)" },
  ],
  terrain: [
    { value: "ALL",           label: "All Terrain" },
    { value: "Alpine",        label: "🏔 Alpine" },
    { value: "High Alpine",   label: "⛰ High Alpine" },
    { value: "Glacial/Arctic",label: "🧊 Glacial / Arctic" },
    { value: "Volcanic",      label: "🌋 Volcanic" },
    { value: "Coastal",       label: "🌊 Coastal" },
    { value: "Desert",        label: "🏜 Desert / Canyon" },
    { value: "Jungle/Forest", label: "🌿 Jungle / Forest" },
  ],
  accommodation: [
    { value: "ALL",          label: "All Types" },
    { value: "Camping",      label: "⛺ Camping" },
    { value: "Huts/Refuges", label: "🏠 Huts & Refuges" },
    { value: "Guesthouses",  label: "🏨 Guesthouses" },
    { value: "Teahouses",    label: "🍵 Teahouses" },
  ],
  popularity: [
    { value: "ALL",        label: "All Treks" },
    { value: "Iconic",     label: "🔥 Iconic (score 8–10)" },
    { value: "Popular",    label: "👍 Popular (score 5–7)" },
    { value: "Hidden Gem", label: "💎 Hidden Gem (score 1–4)" },
  ],
};

const INITIAL_FILTERS: FilterState = {
  tier: "ALL", region: "ALL", accommodation: "ALL",
  terrain: "ALL", duration: "ALL", popularity: "ALL",
};

export function FilterPopup({ isOpen, onClose, currentFilters, onApply }: FilterPopupProps) {
  const [draftFilters, setDraftFilters] = useState<FilterState>(currentFilters);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setDraftFilters(currentFilters);
      const previousFocus = document.activeElement;
      setTimeout(() => panelRef.current?.querySelector('input')?.focus(), 100);
      return () => { (previousFocus as HTMLElement)?.focus(); };
    }
  }, [isOpen, currentFilters]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => { if (e.key === 'Escape' && isOpen) onClose(); };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleUpdate = (name: keyof FilterState, value: string) =>
    setDraftFilters(prev => ({ ...prev, [name]: value }));

  const activeCount = Object.values(draftFilters).filter(v => v !== "ALL").length;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="filter-title"
        className="relative w-full bg-white shadow-2xl overflow-y-auto
          md:max-w-lg md:rounded-xl md:mx-auto md:my-20 md:max-h-[80vh]
          max-md:fixed max-md:inset-0 max-md:max-w-full max-md:rounded-none
          animate-in zoom-in-95 slide-in-from-bottom-10 md:fade-in duration-300"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 id="filter-title" className="text-xl font-bold text-slate-900">
              Filter Treks
              {activeCount > 0 && (
                <span className="ml-2 text-sm font-normal text-primary">
                  ({activeCount} active)
                </span>
              )}
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-slate-100 transition-colors"
              aria-label="Close filters"
            >
              <X className="w-6 h-6 text-slate-500" />
            </button>
          </div>

          <div className="space-y-2">
            <FilterGroup label="Tier"          name="tier"          options={FILTER_OPTIONS.tier}          selected={draftFilters.tier}          onChange={v => handleUpdate('tier', v)} />
            <FilterGroup label="Region"        name="region"        options={FILTER_OPTIONS.region}        selected={draftFilters.region}        onChange={v => handleUpdate('region', v)} />
            <FilterGroup label="Duration"      name="duration"      options={FILTER_OPTIONS.duration}      selected={draftFilters.duration}      onChange={v => handleUpdate('duration', v)} />
            <FilterGroup label="Terrain"       name="terrain"       options={FILTER_OPTIONS.terrain}       selected={draftFilters.terrain}       onChange={v => handleUpdate('terrain', v)} />
            <FilterGroup label="Accommodation" name="accommodation" options={FILTER_OPTIONS.accommodation} selected={draftFilters.accommodation} onChange={v => handleUpdate('accommodation', v)} />
            <FilterGroup label="Popularity"    name="popularity"    options={FILTER_OPTIONS.popularity}    selected={draftFilters.popularity}    onChange={v => handleUpdate('popularity', v)} />
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col gap-4">
            <button
              onClick={() => onApply(draftFilters)}
              className="w-full px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-all shadow-md active:scale-[0.98]"
            >
              Apply Filters
            </button>
            <button
              onClick={() => { setDraftFilters(INITIAL_FILTERS); onApply(INITIAL_FILTERS); }}
              className="text-slate-600 hover:text-slate-900 underline text-sm font-medium transition-colors text-center"
            >
              Clear All
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
