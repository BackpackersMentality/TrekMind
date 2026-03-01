// types/filters.ts

export interface FilterState {
  tier:          "ALL" | "1" | "2" | "3";
  region:        "ALL" | "Europe" | "Asia" | "Africa" | 
                 "North America" | "South America" | "Central America" | "Middle East" | "Oceania";
  accommodation: "ALL" | "Camping" | "Huts/Refuges" | "Guesthouses" | "Teahouses";
  terrain:       "ALL" | "Alpine" | "High Alpine" | "Glacial/Arctic" | 
                 "Volcanic" | "Coastal" | "Desert" | "Jungle/Forest";
  duration:      "ALL" | "Short" | "Medium" | "Long" | "Epic";
  popularity:    "ALL" | "Iconic" | "Popular" | "Hidden Gem";
}

export interface FilterGroupProps {
  label:    string;
  name:     string;
  options:  { value: string; label: string }[];
  selected: string;
  onChange: (value: string) => void;
}
