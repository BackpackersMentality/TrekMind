import React from 'react';
import { FilterGroupProps } from '../types/filters';

export const FilterGroup = React.memo(({ label, name, options, selected, onChange }: FilterGroupProps) => {
  return (
    <fieldset className="mb-6">
      <legend className="text-sm font-semibold text-slate-900 mb-3" id={`${name}-label`}>
        {label}
      </legend>
      <div 
        className="flex flex-wrap gap-2" 
        role="radiogroup" 
        aria-labelledby={`${name}-label`}
      >
        {options.map((option) => (
          <label
            key={option.value}
            className={`
              px-4 py-2 rounded-lg border-2 cursor-pointer text-sm font-medium transition-all
              ${selected === option.value 
                ? 'border-primary bg-primary text-white shadow-sm' 
                : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'}
            `}
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={selected === option.value}
              onChange={() => onChange(option.value)}
              className="sr-only"
            />
            {option.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
});

FilterGroup.displayName = 'FilterGroup';
