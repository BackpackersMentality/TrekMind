import { cn } from "@/lib/utils";
import { CloudRain, TriangleAlert, Compass, FileText } from "lucide-react";

type RiskType = "altitude" | "weather" | "remoteness" | "permits";

interface RiskTagProps {
  type: RiskType;
  className?: string;
}

export function RiskTag({ type, className }: RiskTagProps) {
  const config = {
    altitude: {
      label: "High Altitude",
      icon: TriangleAlert,
      styles: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800",
    },
    weather: {
      label: "Severe Weather",
      icon: CloudRain,
      styles: "bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
    },
    remoteness: {
      label: "Remote Area",
      icon: Compass,
      styles: "bg-stone-100 text-stone-800 border-stone-200 dark:bg-stone-800 dark:text-stone-300 dark:border-stone-700",
    },
    permits: {
      label: "Permit Required",
      icon: FileText,
      styles: "bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800",
    },
  };

  const { label, icon: Icon, styles } = config[type];

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold border uppercase tracking-wider",
        styles,
        className
      )}
    >
      <Icon className="w-3.5 h-3.5" />
      {label}
    </div>
  );
}
