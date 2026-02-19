import { useState } from "react";
import { ShieldCheck, Snowflake, Footprints, Tent, Layers, Hammer, Sun, Backpack, Flame, Home } from "lucide-react";
import { cn } from "@/lib/utils";

interface GearAssistantProps {
  difficulty: string;
  maxAltitude: number;
  durationDays: number;
  accommodationType: string;
  campingRequired: boolean;
}

type Budget = "low" | "mid" | "high";

interface GearItem {
  category: string;
  icon: any;
  recommendation: string;
  description: string;
  reason: string;
}

export function GearAssistant({ 
  difficulty, 
  maxAltitude, 
  durationDays, 
  accommodationType, 
  campingRequired 
}: GearAssistantProps) {
  const [budget, setBudget] = useState<Budget>("mid");

  const getGearRecommendations = (budget: Budget): GearItem[] => {
    const isExtremeAltitude = maxAltitude > 5000;
    const isHighAltitude = maxAltitude >= 3000;
    const isCamping = campingRequired || accommodationType === "Camping";
    const isMixed = accommodationType === "Mixed";
    
    const items: GearItem[] = [];

    // 1. Clothing
    items.push({
      category: "Clothing",
      icon: Layers,
      recommendation: budget === "high" ? "Arc'teryx Rho AR / Merino 250" : (budget === "mid" ? "Patagonia Capilene Midweight" : "Decathlon Forclaz MT500"),
      description: "Moisture-wicking base layer set.",
      reason: "Foundation for moisture management and temperature regulation."
    });

    if (isHighAltitude) {
      items.push({
        category: "Clothing",
        icon: Snowflake,
        recommendation: isExtremeAltitude 
          ? (budget === "high" ? "Feathered Friends Khumbu Parka" : (budget === "mid" ? "Rab Expedition 8000" : "Mountain Equipment Redline"))
          : (budget === "high" ? "Arc'teryx Cerium SV" : (budget === "mid" ? "Patagonia Fitz Roy" : "REI 850 Down Jacket")),
        description: isExtremeAltitude ? "8000m-scale expedition down parka." : "High-loft down insulation.",
        reason: `Essential for survival in ${isExtremeAltitude ? 'extreme' : 'high'} altitude sub-zero conditions.`
      });
    }

    items.push({
      category: "Clothing",
      icon: ShieldCheck,
      recommendation: budget === "high" ? "Arc'teryx Alpha SV (Gore-Tex Pro)" : (budget === "mid" ? "Patagonia Triolet" : "REI Xerodry GTX"),
      description: "Hard shell waterproof jacket.",
      reason: "Shield against high-alpine wind, snow, and driving rain."
    });

    // 2. Sleep System
    const sleepRec = () => {
      if (isExtremeAltitude) {
        return budget === "high" ? "Western Mountaineering Bison (-40°C)" : (budget === "mid" ? "Rab Expedition 1200" : "Mountain Hardwear Phantom -40");
      }
      if (isHighAltitude) {
        return budget === "high" ? "Western Mountaineering Kodiak (-18°C)" : (budget === "mid" ? "Patagonia Fitz Roy 20°F" : "REI Magma 15");
      }
      return budget === "high" ? "Therm-a-Rest Questar 0°C" : (budget === "mid" ? "REI Magma 30" : "Kelty Cosmic 20");
    };

    items.push({
      category: "Sleep System",
      icon: Tent,
      recommendation: sleepRec(),
      description: "Temperature-rated sleeping bag.",
      reason: `Rated for ${isHighAltitude ? 'sub-zero' : 'alpine'} nights at ${maxAltitude}m.`
    });

    if (isCamping || isMixed) {
      items.push({
        category: "Sleep System",
        icon: Layers,
        recommendation: budget === "high" ? "Therm-a-Rest NeoAir XTherm" : (budget === "mid" ? "Nemo Tensor Insulated" : "REI Helix Insulated"),
        description: "High-R value sleeping pad.",
        reason: "Critical insulation from frozen or cold ground."
      });
    }

    // 3. Shelter
    if (isCamping || (isMixed && campingRequired)) {
      items.push({
        category: "Shelter",
        icon: Home,
        recommendation: budget === "high" ? "Hilleberg Soulo / Akto" : (budget === "mid" ? "MSR Hubba Hubba NX" : "REI Half Dome SL 2+"),
        description: "4-season or reinforced 3-season tent.",
        reason: "Primary protection where no permanent structures exist."
      });
    } else if (isMixed) {
      items.push({
        category: "Shelter",
        icon: Home,
        recommendation: budget === "high" ? "Hyperlite UltaMid 2 (Tarp)" : (budget === "mid" ? "MSR E-Wing" : "Outdoor Research Helium Bivy"),
        description: "Emergency bivy or lightweight tarp.",
        reason: "Backup protection for mixed segments where huts may be full or unavailable."
      });
    }

    // 4. Cooking
    if (isCamping || isMixed) {
      items.push({
        category: "Cooking",
        icon: Flame,
        recommendation: budget === "high" ? "MSR Reactor (Fast Boiling)" : (budget === "mid" ? "Jetboil Flash" : "MSR PocketRocket 2"),
        description: "High-efficiency stove system.",
        reason: "Essential for melting snow or cooking meals in remote areas."
      });
    }

    // 5. Essentials
    items.push({
      category: "Essentials",
      icon: Backpack,
      recommendation: budget === "high" ? "Hyperlite Southwest 3400 (Dyneema)" : (budget === "mid" ? "Osprey Atmos AG 65" : "REI Flash 55"),
      description: "Technical multi-day backpack.",
      reason: `Sized for a ${durationDays}-day expedition load.`
    });

    if (maxAltitude > 3500) {
      items.push({
        category: "Essentials",
        icon: Sun,
        recommendation: budget === "high" ? "Julbo Explorer 2.0 (Cameleon)" : (budget === "mid" ? "Smith Embark" : "Cat 4 Glacier Glasses"),
        description: "Category 4 glacier glasses.",
        reason: "Protect against intense high-altitude UV and snow blindness."
      });
    }

    return items;
  };

  const recommendations = getGearRecommendations(budget);

  return (
    <div className="bg-secondary/30 rounded-2xl p-6 md:p-8 border border-border">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h3 className="text-xl font-display font-bold text-foreground">Gear Assistant v2</h3>
          <p className="text-muted-foreground text-sm mt-1">
            Adapting for {difficulty} terrain, {maxAltitude}m altitude, and {accommodationType} stay.
          </p>
        </div>
        
        <div className="flex bg-background rounded-lg p-1 border border-border shadow-sm overflow-x-auto">
          {(["low", "mid", "high"] as Budget[]).map((b) => (
            <button
              key={b}
              onClick={() => setBudget(b)}
              className={cn(
                "px-4 py-1.5 rounded-md text-sm font-medium capitalize transition-all whitespace-nowrap",
                budget === b 
                  ? "bg-primary text-primary-foreground shadow-sm" 
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              {b}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {recommendations.map((item, index) => (
          <div key={`${item.category}-${index}`} className="bg-background rounded-xl p-4 border border-border/50 shadow-sm flex flex-col gap-3">
            <div className="flex items-center gap-3 text-primary">
              <div className="p-2 bg-primary/10 rounded-lg">
                <item.icon className="w-5 h-5" />
              </div>
              <span className="font-semibold text-[10px] uppercase tracking-wider">{item.category}</span>
            </div>
            <div>
              <div className="font-bold text-sm text-foreground mb-1 leading-tight">{item.recommendation}</div>
              <div className="text-[11px] text-muted-foreground leading-relaxed italic mb-2">{item.description}</div>
              <div className="bg-secondary/50 rounded-md p-2 text-[10px] text-foreground/80 border border-border/30">
                <strong>Why:</strong> {item.reason}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
