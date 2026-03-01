// components/FilterGroup.tsx — multi-select pill toggle, no emojis
import React from 'react';
import { FilterGroupProps } from '../types/filters';

export const FilterGroup = React.memo(({ label, name, options, selected, onChange }: FilterGroupProps) => {
  return (
    <fieldset className="mb-5">
      <legend className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2.5">
        {label}
      </legend>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const isActive = selected.includes(option.value);
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={`
                px-3.5 py-1.5 rounded-md text-sm font-medium transition-all duration-150 border
                ${isActive
                  ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400 hover:text-slate-900'}
              `}
              aria-pressed={isActive}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
});

FilterGroup.displayName = 'FilterGroup';
