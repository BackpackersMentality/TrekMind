export interface FilterState {
  tier: "1" | "2" | "3" | "ALL";
  region: "Europe" | "Asia" | "Africa" | "Americas" | "Oceania" | "ALL";
  accommodation: "Camping" | "Rifugios" | "Teahouses" | "Huts" | "ALL";
  duration: "Short" | "Medium" | "Long" | "ALL";
  difficulty: "Easy" | "Moderate" | "Hard" | "ALL";
}

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterGroupProps {
  label: string;
  name: keyof FilterState;
  options: FilterOption[];
  selected: string;
  onChange: (value: string) => void;
}
