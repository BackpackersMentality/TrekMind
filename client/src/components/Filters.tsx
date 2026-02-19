import { useFilterStore } from '../store/useFilterStore';
import { X, ChevronDown, Mountain, Globe, Clock, BarChart, Home as HomeIcon } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';

const REGIONS = ['Africa', 'Asia', 'Central America', 'Europe', 'Middle East', 'North America', 'Oceania', 'South America'];
const ACCOMMODATIONS = ['Camping', 'Teahouses', 'Huts/Refugios', 'Hotels/Lodges', 'Mixed'];
const DURATIONS = ['Short', 'Medium', 'Long'];
const DIFFICULTIES = ['Easy', 'Moderate', 'Hard', 'Extreme'];

interface DropdownProps {
  label: string;
  icon: React.ReactNode;
  value: string | number | null;
  options: { label: string; value: any }[];
  onSelect: (value: any) => void;
  active?: boolean;
}

function FilterDropdown({ label, icon, value, options, onSelect, active }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all border ${
          active 
            ? 'bg-primary/10 border-primary text-primary' 
            : 'bg-background/50 border-border hover:border-primary/50 text-foreground'
        }`}
      >
        {icon}
        <span className="whitespace-nowrap">{selectedOption ? selectedOption.label : label}</span>
        <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-48 bg-background border border-border rounded-xl shadow-xl z-[110] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <div className="py-1">
            {options.map((opt) => (
              <button
                key={opt.label}
                onClick={() => {
                  onSelect(opt.value);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-muted transition-colors ${
                  value === opt.value ? 'text-primary font-semibold bg-primary/5' : 'text-foreground'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function Filters({ filteredCount }: { filteredCount: number }) {
  const {
    tier, region, accommodation, duration, difficulty,
    setTier, setRegion, setAccommodation, setDuration, setDifficulty, resetFilters,
  } = useFilterStore();

  const activePills = [
    tier !== null && { label: `Tier ${tier}`, onRemove: () => setTier(null) },
    region !== null && { label: region, onRemove: () => setRegion(null) },
    accommodation !== null && { label: accommodation, onRemove: () => setAccommodation(null) },
    duration !== null && { label: `${duration} Duration`, onRemove: () => setDuration(null) },
    difficulty !== null && { label: difficulty, onRemove: () => setDifficulty(null) },
  ].filter((p): p is { label: string; onRemove: () => void } => !!p);

  return (
    <div className="w-full flex flex-col gap-4 animate-in slide-in-from-bottom duration-500">
      {/* Dropdown Rows */}
      <div className="flex flex-col gap-3">
        {/* Row 1 */}
        <div className="flex flex-wrap items-center gap-2">
          <FilterDropdown
            label="Tier"
            icon={<Mountain className="w-4 h-4" />}
            value={tier}
            active={tier !== null}
            onSelect={setTier}
            options={[
              { label: 'All Tiers', value: null },
              { label: '★ Tier 1 (Iconic)', value: 1 },
              { label: '★★ Tier 2 (Classic)', value: 2 },
              { label: '★★★ Tier 3 (Hidden)', value: 3 },
            ]}
          />
          <FilterDropdown
            label="Region"
            icon={<Globe className="w-4 h-4" />}
            value={region}
            active={region !== null}
            onSelect={setRegion}
            options={[{ label: 'All Regions', value: null }, ...REGIONS.map(r => ({ label: r, value: r }))]}
          />
          <FilterDropdown
            label="Duration"
            icon={<Clock className="w-4 h-4" />}
            value={duration}
            active={duration !== null}
            onSelect={setDuration}
            options={[{ label: 'All Durations', value: null }, ...DURATIONS.map(d => ({ label: d, value: d }))]}
          />
          
          {activePills.length > 0 && (
            <button
              onClick={resetFilters}
              className="ml-auto text-xs font-semibold text-primary hover:underline px-2 py-1"
            >
              Clear All
            </button>
          )}
        </div>

        {/* Row 2 */}
        <div className="flex flex-wrap items-center gap-2">
          <FilterDropdown
            label="Difficulty"
            icon={<BarChart className="w-4 h-4" />}
            value={difficulty}
            active={difficulty !== null}
            onSelect={setDifficulty}
            options={[{ label: 'All Difficulties', value: null }, ...DIFFICULTIES.map(d => ({ label: d, value: d }))]}
          />
          <FilterDropdown
            label="Accommodation"
            icon={<HomeIcon className="w-4 h-4" />}
            value={accommodation}
            active={accommodation !== null}
            onSelect={setAccommodation}
            options={[{ label: 'All Types', value: null }, ...ACCOMMODATIONS.map(a => ({ label: a, value: a }))]}
          />
        </div>
      </div>

      {/* Compact Result Box */}
      <div className="bg-background/40 backdrop-blur-md border border-border rounded-xl p-3 flex flex-col gap-2 shadow-lg">
        <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
          <span>Showing {filteredCount} treks</span>
        </div>
        
        {activePills.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {activePills.map((pill) => (
              <button
                key={pill.label}
                onClick={pill.onRemove}
                className="flex items-center gap-1.5 px-2 py-1 bg-primary text-primary-foreground rounded-md text-[10px] font-bold uppercase tracking-wider hover:bg-primary/90 transition-colors shadow-sm group"
              >
                {pill.label}
                <X className="w-3 h-3 group-hover:scale-110 transition-transform" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
