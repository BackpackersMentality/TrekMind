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

const FILTER_OPTIONS = {
  tier: [
    { value: "ALL", label: "All Tiers" },
    { value: "1", label: "Tier 1" },
    { value: "2", label: "Tier 2" },
    { value: "3", label: "Tier 3" }
  ],
  region: [
    { value: "ALL", label: "All Regions" },
    { value: "Europe", label: "Europe" },
    { value: "Asia", label: "Asia" },
    { value: "Africa", label: "Africa" },
    { value: "Americas", label: "Americas" },
    { value: "Oceania", label: "Oceania" }
  ],
  accommodation: [
    { value: "ALL", label: "All Types" },
    { value: "Camping", label: "Camping" },
    { value: "Rifugios", label: "Rifugios" },
    { value: "Teahouses", label: "Teahouses" },
    { value: "Huts", label: "Huts" }
  ],
  duration: [
    { value: "ALL", label: "All Durations" },
    { value: "Short", label: "Short (1-4 days)" },
    { value: "Medium", label: "Medium (5-9 days)" },
    { value: "Long", label: "Long (10+ days)" }
  ],
  difficulty: [
    { value: "ALL", label: "All Levels" },
    { value: "Easy", label: "Easy" },
    { value: "Moderate", label: "Moderate" },
    { value: "Hard", label: "Hard" }
  ]
};

const INITIAL_FILTERS: FilterState = {
  tier: "ALL",
  region: "ALL",
  accommodation: "ALL",
  duration: "ALL",
  difficulty: "ALL"
};

export function FilterPopup({ isOpen, onClose, currentFilters, onApply }: FilterPopupProps) {
  const [draftFilters, setDraftFilters] = useState<FilterState>(currentFilters);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setDraftFilters(currentFilters);
      const previousFocus = document.activeElement;
      setTimeout(() => {
        panelRef.current?.querySelector('input')?.focus();
      }, 100);
      return () => {
        (previousFocus as HTMLElement)?.focus();
      };
    }
  }, [isOpen, currentFilters]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleUpdate = (name: keyof FilterState, value: string) => {
    setDraftFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleClearAll = () => {
    setDraftFilters(INITIAL_FILTERS);
  };

  const handleApply = () => {
    onApply(draftFilters);
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200" 
        onClick={onClose}
      />
      
      {/* Panel */}
      <div 
        ref={panelRef}
        id="filter-popup"
        role="dialog"
        aria-modal="true"
        aria-labelledby="filter-title"
        className={`
          relative w-full bg-white shadow-2xl overflow-y-auto
          md:max-w-lg md:rounded-xl md:mx-auto md:my-20 md:max-h-[80vh]
          max-md:fixed max-md:inset-0 max-md:max-w-full max-md:rounded-none
          animate-in zoom-in-95 slide-in-from-bottom-10 md:fade-in duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
        `}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 id="filter-title" className="text-xl font-bold text-slate-900">Filters</h2>
            <button 
              onClick={onClose}
              className="p-2 rounded-full hover:bg-slate-100 transition-colors"
              aria-label="Close filters"
            >
              <X className="w-6 h-6 text-slate-500" />
            </button>
          </div>

          <div className="space-y-2">
            <FilterGroup
              label="Tier"
              name="tier"
              options={FILTER_OPTIONS.tier}
              selected={draftFilters.tier}
              onChange={(val) => handleUpdate('tier', val)}
            />
            <FilterGroup
              label="Region"
              name="region"
              options={FILTER_OPTIONS.region}
              selected={draftFilters.region}
              onChange={(val) => handleUpdate('region', val)}
            />
            <FilterGroup
              label="Duration"
              name="duration"
              options={FILTER_OPTIONS.duration}
              selected={draftFilters.duration}
              onChange={(val) => handleUpdate('duration', val)}
            />
            <FilterGroup
              label="Difficulty"
              name="difficulty"
              options={FILTER_OPTIONS.difficulty}
              selected={draftFilters.difficulty}
              onChange={(val) => handleUpdate('difficulty', val)}
            />
            <FilterGroup
              label="Accommodation"
              name="accommodation"
              options={FILTER_OPTIONS.accommodation}
              selected={draftFilters.accommodation}
              onChange={(val) => handleUpdate('accommodation', val)}
            />
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col gap-4">
            <button
              onClick={handleApply}
              className="w-full px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-all shadow-md active:scale-[0.98]"
            >
              Apply Filters
            </button>
            <button
              onClick={handleClearAll}
              className="text-slate-600 hover:text-slate-900 underline text-sm font-medium transition-colors"
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
