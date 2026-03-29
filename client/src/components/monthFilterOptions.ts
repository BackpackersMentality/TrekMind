// monthFilterOptions.ts
// Drop this into your filter options config alongside tier, region, duration etc.
// Value is a numeric string (1–12) matching the parseSeasonMonths output in Filters.ts.

export const MONTH_OPTIONS = [
  { value: "1",  label: "Jan" },
  { value: "2",  label: "Feb" },
  { value: "3",  label: "Mar" },
  { value: "4",  label: "Apr" },
  { value: "5",  label: "May" },
  { value: "6",  label: "Jun" },
  { value: "7",  label: "Jul" },
  { value: "8",  label: "Aug" },
  { value: "9",  label: "Sep" },
  { value: "10", label: "Oct" },
  { value: "11", label: "Nov" },
  { value: "12", label: "Dec" },
];

// Usage in your filter panel (FilterGroup component):
//
//   <FilterGroup
//     label="When to Trek"
//     name="month"
//     options={MONTH_OPTIONS}
//     selected={activeFilters.month ? [activeFilters.month] : []}
//     onChange={(val) => setFilter("month", val)}
//   />
//
// In your Filters state type, add:
//   month?: string | null;
//
// The filterTreks() function in Filters.ts already handles this field.
