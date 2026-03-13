import { cn } from "@/lib/utils";
import {
  CloudRain, TriangleAlert, Compass, FileText,
  Droplets, Route, WifiOff, Mountain,
} from "lucide-react";

// ── Risk type definitions ─────────────────────────────────────────────────────
export type RiskType =
  | "altitude"
  | "weather"
  | "remoteness"
  | "permits"
  | "water"
  | "thru_hike"
  | "no_infrastructure"
  | "technical";

interface RiskConfig {
  label: string;
  icon: React.ElementType;
  styles: string;
}

const RISK_CONFIG: Record<RiskType, RiskConfig> = {
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
  water: {
    label: "Water Sourcing",
    icon: Droplets,
    styles: "bg-cyan-100 text-cyan-800 border-cyan-200 dark:bg-cyan-900/30 dark:text-cyan-300 dark:border-cyan-800",
  },
  thru_hike: {
    label: "Thru-Hike",
    icon: Route,
    styles: "bg-violet-100 text-violet-800 border-violet-200 dark:bg-violet-900/30 dark:text-violet-300 dark:border-violet-800",
  },
  no_infrastructure: {
    label: "No Roads / Signal",
    icon: WifiOff,
    styles: "bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-800",
  },
  technical: {
    label: "Technical Terrain",
    icon: Mountain,
    styles: "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800",
  },
};

// ── Inference function — derives risk tags from trek data fields ──────────────
export function getRiskTags(trek: any): RiskType[] {
  const tags: RiskType[] = [];
  if (!trek) return tags;

  const alt     = parseFloat(String(trek.maxAltitude ?? trek.maxAltM ?? "0").replace(/[^\d.]/g, "")) || 0;
  const terrain = (trek.terrain ?? "").toLowerCase();
  const accom   = (trek.accommodation ?? "").toLowerCase();
  const features = (trek.keyFeatures ?? "").toLowerCase();
  const permits = (trek.permits ?? "").toLowerCase();
  const days    = parseInt(String(trek.totalDays ?? "0").replace(/[^\d]/g, "")) || 0;
  const tier    = trek.tier ?? 0;

  // ── Altitude ────────────────────────────────────────────────────────────────
  // 3500m+ is where AMS risk becomes significant for most trekkers
  if (alt >= 3500) tags.push("altitude");

  // ── Severe Weather ──────────────────────────────────────────────────────────
  const weatherTriggers = [
    "arctic", "glaciat", "glacier", "volcanic", "coastal", "exposed",
    "monsoon", "desert", "polar", "fjord", "tundra", "patagoni",
  ];
  if (weatherTriggers.some(w => terrain.includes(w) || features.includes(w))) {
    tags.push("weather");
  }

  // ── Remoteness ─────────────────────────────────────────────────────────────
  // Wild/wilderness camping, caves, backcountry signal no nearby support
  const remoteTriggers = ["wild camping", "wilderness camp", "caves", "backcountry", "bivouac"];
  if (remoteTriggers.some(r => accom.includes(r))) tags.push("remoteness");

  // ── Permits ─────────────────────────────────────────────────────────────────
  if (permits !== "not required" && permits !== "" && permits !== "none") {
    tags.push("permits");
  }

  // ── Water Sourcing ──────────────────────────────────────────────────────────
  // Desert, arid, or very long wilderness days means water planning is critical
  const waterTriggers = ["desert", "arid", "canyon", "semi-arid"];
  if (
    waterTriggers.some(w => terrain.includes(w) || features.includes(w)) ||
    (accom.includes("camping") && alt < 2000 && days >= 4)
  ) {
    tags.push("water");
  }

  // ── Thru-Hike ───────────────────────────────────────────────────────────────
  // Tier 4 = designated thru-hikes, or any trek 20+ days
  if (tier === 4 || days >= 20) tags.push("thru_hike");

  // ── No Infrastructure ───────────────────────────────────────────────────────
  // Very remote with no roads / no connectivity
  const noInfraTriggers = [
    "wild camping", "wilderness camp", "caves", "backcountry hut",
    "huts (basic)", "shelters",
  ];
  const noInfraFeatures = ["no road", "roadless", "no vehicle", "fly-in", "helicopter", "boat access"];
  if (
    noInfraTriggers.some(t => accom.includes(t)) ||
    noInfraFeatures.some(f => features.includes(f))
  ) {
    tags.push("no_infrastructure");
  }

  // ── Technical Terrain ───────────────────────────────────────────────────────
  const technicalTriggers = [
    "via ferrata", "scramble", "glacier travel", "fixed rope",
    "technical", "ice", "crampon", "exposed ridge",
  ];
  if (technicalTriggers.some(t => terrain.includes(t) || features.includes(t))) {
    tags.push("technical");
  }

  // De-duplicate (shouldn't be needed but safe)
  return [...new Set(tags)];
}

// ── Component ─────────────────────────────────────────────────────────────────
interface RiskTagProps {
  type: RiskType;
  className?: string;
}

export function RiskTag({ type, className }: RiskTagProps) {
  const config = RISK_CONFIG[type];
  if (!config) return null;
  const { label, icon: Icon, styles } = config;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold border uppercase tracking-wider",
        styles,
        className
      )}
    >
      <Icon className="w-3.5 h-3.5 shrink-0" />
      {label}
    </div>
  );
}