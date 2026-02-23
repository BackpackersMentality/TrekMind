import { useState } from "react";
import { 
  ShieldCheck, Footprints, Tent, Layers, Sun, Backpack, Flame, 
  Droplet, Activity, Link, BedDouble 
} from "lucide-react";
import { cn } from "@/lib/utils";

interface GearAssistantProps {
  trekName?: string;
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
  trekName = "",
  difficulty, 
  maxAltitude, 
  durationDays, 
  accommodationType, 
  campingRequired 
}: GearAssistantProps) {
  const [budget, setBudget] = useState<Budget>("mid");

  const getGearRecommendations = (budget: Budget): GearItem[] => {
    // Logic flags
    const isCamping = campingRequired || accommodationType.toLowerCase().includes("camping");
    const isViaFerrata = trekName.toLowerCase().includes("alta via") || difficulty.toLowerCase().includes("ferrata");
    
    const items: GearItem[] = [];

    // --- 1. BACKPACK ---
    items.push({
      category: "Backpack",
      icon: Backpack,
      recommendation: budget === "high" 
        ? "Hyperlite Mountain Gear Southwest (55L)" 
        : budget === "mid" ? "Osprey Exos 58 / Aura 50" : "Decathlon Forclaz MT500 (50L)",
      description: durationDays > 5 ? "High capacity for multi-day trekking." : "Lightweight day/weekend capacity.",
      reason: budget === "high" ? "Dyneema fabric is waterproof and virtually indestructible while remaining ultralight." : budget === "mid" ? "The gold standard for suspension and comfort; incredible lifetime warranty." : "Unbeatable price for a pack that includes proper load lifters and hip belts."
    });

    // --- 2. FOOTWEAR ---
    items.push({
      category: "Footwear",
      icon: Footprints,
      recommendation: isViaFerrata 
        ? (budget === "high" ? "La Sportiva TX4 GTX (Approach)" : budget === "mid" ? "Salomon X Ultra 4 Mid GTX" : "Merrell Moab 3 Mid")
        : (budget === "high" ? "Arc'teryx Aerios FL 2 Mid GTX" : budget === "mid" ? "Salomon X Ultra 4 Mid GTX" : "Merrell Moab 3 Mid"),
      description: isViaFerrata ? "Stiff sole for rock scrambling and via ferrata rungs." : "Comfortable, waterproof ankle support.",
      reason: isViaFerrata && budget === "high" ? "Unmatched grip for Dolomites rock; stiff enough for Via Ferrata rungs." : budget === "mid" ? "Excellent ankle support for long days; versatile enough for rock and mud." : "Famous out-of-the-box comfort; affordable and incredibly durable."
    });

    // --- 3. CLOTHING (SHELL) ---
    items.push({
      category: "Clothing (Shell)",
      icon: Layers,
      recommendation: budget === "high" ? "Arc'teryx Beta AR Jacket" : budget === "mid" ? "Patagonia Torrentshell 3L" : "Marmot PreCip Eco / Frogg Toggs",
      description: "Hard shell for unpredictable mountain rain and wind.",
      reason: budget === "high" ? "Gore-Tex Pro offers the best breathability and storm protection at altitude." : budget === "mid" ? "3-layer waterproof construction that performs like a premium jacket at half the price." : "Basic but effective rain protection; packs down small when not needed."
    });

    // --- 4. CLOTHING (INSULATION) ---
    items.push({
      category: "Clothing (Insulation)",
      icon: Sun,
      recommendation: budget === "high" ? "Mountain Hardwear Ghost Whisperer/2" : budget === "mid" ? "Patagonia Nano Puff" : "Decathlon Forclaz MT100 Down",
      description: maxAltitude > 3000 ? "Crucial for freezing evening temperatures at high altitude." : "Lightweight warmth for rest stops and evenings.",
      reason: budget === "high" ? "Insanely high warmth-to-weight ratio; packs down to the size of an apple." : budget === "mid" ? "Synthetic insulation stays warm even if it gets wet in unpredictable alpine storms." : "RDS-certified down that rivals jackets triple its price for basic camp warmth."
    });

    // --- 5. VIA FERRATA (Conditional) ---
    if (isViaFerrata) {
      items.push({
        category: "Via Ferrata Kit",
        icon: Link,
        recommendation: budget === "high" ? "Petzl Scorpio Eashook & Meteor Helmet" : budget === "mid" ? "Black Diamond Iron Cruiser & Half Dome" : "Camp Kinetic Rewind & Camp Armour Helmet",
        description: "Energy-absorbing lanyard and climbing helmet.",
        reason: budget === "high" ? "Premium carabiners prevent hand fatigue; helmet is ultralight and ventilated." : budget === "mid" ? "Rugged, easy-to-use sliding carabiners and an absolute workhorse of a helmet." : "Affordable, fully certified safety gear; slightly heavier but perfectly safe."
      });
      items.push({
        category: "Harness",
        icon: Activity,
        recommendation: budget === "high" ? "Arc'teryx AR-395a" : budget === "mid" ? "Black Diamond Momentum" : "Petzl Corax",
        description: "Climbing harness for clipping into cables.",
        reason: budget === "high" ? "Extremely comfortable for long hanging belays but packs completely flat." : budget === "mid" ? "The standard all-rounder harness; comfortable enough for the Alta Via 2." : "Highly adjustable (fits over bulky layers) and very affordable."
      });
    }

    // --- 6. CAMPING (Conditional) ---
    if (isCamping) {
      items.push({
        category: "Tent",
        icon: Tent,
        recommendation: budget === "high" ? "Zpacks Duplex" : budget === "mid" ? "Big Agnes Copper Spur HV UL2" : "Naturehike Cloud-Up 2",
        description: "Lightweight shelter for backcountry sleeping.",
        reason: budget === "high" ? "The holy grail of ultralight trekking tents; uses trekking poles to pitch, weighing under 600g." : budget === "mid" ? "Freestanding, incredibly spacious for its weight, and holds up excellently in wind." : "An excellent, highly-rated budget clone of premium tents; reliable protection."
      });
      items.push({
        category: "Sleeping Bag",
        icon: BedDouble,
        recommendation: budget === "high" ? "Western Mountaineering UltraLite" : budget === "mid" ? "Mountain Hardwear Bishop Pass 15F" : "Kelty Cosmic Down 20",
        description: maxAltitude > 3000 ? "Rated for freezing mountain temperatures." : "3-season warmth rating.",
        reason: budget === "high" ? "The highest quality down available. Rated to -7°C (20°F) but weighs under 1kg." : budget === "mid" ? "Exceptional value for RDS-certified down; a perfect 3-season mountain bag." : "The best entry-level down bag on the market. Bulkier, but keeps you warm to -6°C."
      });
      items.push({
        category: "Sleeping Pad",
        icon: Layers,
        recommendation: budget === "high" ? "Therm-a-Rest NeoAir XTherm NXT" : budget === "mid" ? "NEMO Tensor All-Season" : "Klymit Static V Insulated",
        description: "Insulation from the cold ground.",
        reason: budget === "high" ? "The absolute best warmth-to-weight ratio for sleeping on frozen or rocky alpine ground." : budget === "mid" ? "Thick, quiet, and insulated enough for cold nights without the premium price tag." : "A rugged, highly affordable pad with unique V-chambers to limit air movement."
      });
      items.push({
        category: "Cooking",
        icon: Flame,
        recommendation: budget === "high" ? "Jetboil Stash" : budget === "mid" ? "MSR PocketRocket 2 + Toaks Titanium Pot" : "BRS-3000T Stove + Stanley Adventure Pot",
        description: "Stove and pot system for boiling water and freeze-dried meals.",
        reason: budget === "high" ? "Extremely lightweight, boils water in under 3 minutes, and packs into its own pot." : budget === "mid" ? "The industry standard ultralight stove paired with an affordable, durable titanium pot." : "A $15 titanium stove that weighs 25g, paired with a bombproof stainless steel pot."
      });
    }

    // --- 7. WATER & EMERGENCY ---
    items.push({
      category: "Water Filter",
      icon: Droplet,
      recommendation: budget === "high" ? "Katadyn BeFree 1L" : budget === "mid" ? "Sawyer Squeeze" : "Sawyer Mini / Aquamira Drops",
      description: "Essential for drinking from streams/lakes safely.",
      reason: budget === "high" ? "Fastest flow rate on the market; soft flask rolls up into your pocket when empty." : budget === "mid" ? "The legendary thru-hiker standard. Screws onto standard smart-water bottles." : "Very affordable options, though flow rate is slightly slower."
    });
    items.push({
      category: "Emergency",
      icon: ShieldCheck,
      recommendation: budget === "high" ? "Garmin inReach Mini 2 + Premium Med Kit" : budget === "mid" ? "Adventure Medical Kits UL + Bivy" : "DIY Pharmacy Kit + Emergency Mylar Blanket",
      description: "Survival gear for worst-case scenarios.",
      reason: budget === "high" ? "Satellite SOS and messaging is a non-negotiable for remote, high-altitude treks." : budget === "mid" ? "Pre-packaged, waterproof medical kit paired with a lightweight emergency space bivy." : "Ziploc bag with ibuprofen, leukotape, bandages, and a basic Mylar blanket."
    });

    return items;
  };

  const recommendations = getGearRecommendations(budget);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-muted/30 p-4 rounded-xl border border-border/50">
        <div>
          <h3 className="font-bold text-lg text-foreground">Gear Recommendations</h3>
          <p className="text-sm text-muted-foreground">Tailored for this trek's altitude and terrain.</p>
        </div>
        
        <div className="flex bg-background rounded-lg p-1 border border-border shadow-sm w-full sm:w-auto">
          {(["low", "mid", "high"] as Budget[]).map((b) => (
            <button
              key={b}
              onClick={() => setBudget(b)}
              className={cn(
                "flex-1 sm:flex-none px-4 py-1.5 rounded-md text-sm font-medium capitalize transition-all whitespace-nowrap",
                budget === b 
                  ? "bg-primary text-primary-foreground shadow-sm" 
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              {b} Budget
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
