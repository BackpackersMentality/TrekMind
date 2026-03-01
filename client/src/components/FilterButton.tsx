// components/FilterButton.tsx — clean, no emojis
import React from 'react';
import { SlidersHorizontal } from 'lucide-react';

interface FilterButtonProps {
  activeCount: number;
  onClick: () => void;
}

export function FilterButton({ activeCount, onClick }: FilterButtonProps) {
  return (
    <button
      onClick={onClick}
      className="w-11 h-11 bg-white rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105 flex items-center justify-center border border-slate-200"
      aria-label={`Filters${activeCount > 0 ? ` (${activeCount} active)` : ''}`}
    >
      <SlidersHorizontal className="w-4 h-4 text-slate-700" />
      {activeCount > 0 && (
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-slate-900 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
          {activeCount}
        </span>
      )}
    </button>
  );
}
