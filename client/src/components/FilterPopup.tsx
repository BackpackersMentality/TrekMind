// components/FilterPopup.tsx — multi-select, no emojis, clean professional look
import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { FilterGroup } from './FilterGroup';
import { FilterState, EMPTY_FILTERS, countActiveFilters } from '../types/filters';

interface FilterPopupProps {
  isOpen:         boolean;
  onClose:        () => void;
  currentFilters: FilterState;
  onApply:        (filters: FilterState) => void;
}

const FILTER_OPTIONS = {
  tier: [
    { value: "1", label: "Tier 1 — Legendary" },
    { value: "2", label: "Tier 2 — Classic"   },
    { value: "3", label: "Tier 3 — Hidden"    },
  ],
  region: [
    { value: "Europe",          label: "Europe"          },
    { value: "Asia",            label: "Asia"            },
    { value: "Africa",          label: "Africa"          },
    { value: "North America",   label: "North America"   },
    { value: "South America",   label: "South America"   },
    { value: "Central America", label: "Central America" },
    { value: "Middle East",     label: "Middle East"     },
    { value: "Oceania",         label: "Oceania"         },
  ],
  duration: [
    { value: "Short",  label: "Short (1–5 days)"  },
    { value: "Medium", label: "Medium (6–10 days)" },
    { value: "Long",   label: "Long (11–16 days)"  },
    { value: "Epic",   label: "Epic (17+ days)"    },
  ],
  terrain: [
    { value: "Alpine",         label: "Alpine"         },
    { value: "High Alpine",    label: "High Alpine"    },
    { value: "Glacial/Arctic", label: "Glacial/Arctic" },
    { value: "Volcanic",       label: "Volcanic"       },
    { value: "Coastal",        label: "Coastal"        },
    { value: "Desert",         label: "Desert/Canyon"  },
    { value: "Jungle/Forest",  label: "Jungle/Forest"  },
  ],
  accommodation: [
    { value: "Camping",      label: "Camping"       },
    { value: "Huts/Refuges", label: "Huts & Refuges"},
    { value: "Guesthouses",  label: "Guesthouses"   },
    { value: "Teahouses",    label: "Teahouses"     },
  ],
  popularity: [
    { value: "Iconic",      label: "Iconic (8–10)"   },
    { value: "Popular",     label: "Popular (5–7)"   },
    { value: "Hidden Gem",  label: "Hidden Gem (1–4)" },
  ],
};

export function FilterPopup({ isOpen, onClose, currentFilters, onApply }: FilterPopupProps) {
  const [draft, setDraft] = useState<FilterState>(currentFilters);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => { if (isOpen) setDraft(currentFilters); }, [isOpen, currentFilters]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && isOpen) onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Toggle a value in/out of the selected array for a given filter
  const toggle = (name: keyof FilterState, value: string) => {
    setDraft(prev => {
      const current = prev[name];
      const next = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value];
      return { ...prev, [name]: next };
    });
  };

  const activeCount = countActiveFilters(draft);

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="filter-title"
        className="relative w-full bg-white shadow-2xl overflow-y-auto
          md:max-w-xl md:rounded-2xl md:mx-auto md:my-8 md:max-h-[85vh]
          max-md:rounded-t-2xl max-md:max-h-[90vh]
          animate-in slide-in-from-bottom-4 duration-300"
      >
        {/* Sticky header */}
        <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 id="filter-title" className="text-base font-semibold text-slate-900">
              Filter Treks
            </h2>
            {activeCount > 0 && (
              <p className="text-xs text-slate-400 mt-0.5">
                {activeCount} filter{activeCount !== 1 ? 's' : ''} active
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-600"
            aria-label="Close filters"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter groups */}
        <div className="px-6 py-5 space-y-1">
          <FilterGroup label="Tier"          name="tier"          options={FILTER_OPTIONS.tier}          selected={draft.tier}          onChange={v => toggle('tier', v)} />
          <FilterGroup label="Region"        name="region"        options={FILTER_OPTIONS.region}        selected={draft.region}        onChange={v => toggle('region', v)} />
          <FilterGroup label="Duration"      name="duration"      options={FILTER_OPTIONS.duration}      selected={draft.duration}      onChange={v => toggle('duration', v)} />
          <FilterGroup label="Terrain"       name="terrain"       options={FILTER_OPTIONS.terrain}       selected={draft.terrain}       onChange={v => toggle('terrain', v)} />
          <FilterGroup label="Accommodation" name="accommodation" options={FILTER_OPTIONS.accommodation} selected={draft.accommodation} onChange={v => toggle('accommodation', v)} />
          <FilterGroup label="Popularity"    name="popularity"    options={FILTER_OPTIONS.popularity}    selected={draft.popularity}    onChange={v => toggle('popularity', v)} />
        </div>

        {/* Sticky footer */}
        <div className="sticky bottom-0 bg-white border-t border-slate-100 px-6 py-4 flex items-center gap-3">
          <button
            onClick={() => { setDraft(EMPTY_FILTERS); onApply(EMPTY_FILTERS); }}
            className="text-sm text-slate-500 hover:text-slate-800 font-medium transition-colors px-4 py-2.5 rounded-lg hover:bg-slate-50"
          >
            Clear all
          </button>
          <button
            onClick={() => onApply(draft)}
            className="flex-1 py-2.5 bg-slate-900 text-white rounded-lg text-sm font-semibold hover:bg-black transition-colors shadow-sm"
          >
            {activeCount > 0 ? `Show results · ${activeCount} active` : 'Apply'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
