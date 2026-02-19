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
      className="absolute top-4 right-4 z-20 w-12 h-12 bg-white rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105 flex items-center justify-center border border-slate-100"
      aria-label={`Filters${activeCount > 0 ? ` (${activeCount} active)` : ''}`}
    >
      <SlidersHorizontal className="w-5 h-5 text-slate-700" />
      
      {/* Badge */}
      {activeCount > 0 && (
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm">
          {activeCount}
        </span>
      )}
    </button>
  );
}
