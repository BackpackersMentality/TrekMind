import { useState } from "react";
import { 
  ShieldCheck, Footprints, Tent, Layers, Sun, Backpack, Flame, 
  Droplet, Activity, Link, BedDouble, ExternalLink
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
  reviewUrl?: string;   // BM review link — only set when a real review exists
  reviewLabel?: string; // Short label e.g. "Osprey Atmos Review"
}

const BM = "https://backpackersmentality.com";

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
    const isCamping = campingRequired || accommodationType.toLowerCase().includes("camping");
    const isViaFerrata = trekName.toLowerCase().includes("alta via") || difficulty.toLowerCase().includes("ferrata");
    
    const items: GearItem[] = [];

    // --- 1. BACKPACK ---
    // Mid: swapped from Osprey Exos 58 → Osprey Atmos AG 50 / Aura AG 50 (BM reviewed, 8.5/10)
    items.push({
      category: "Backpack",
      icon: Backpack,
      recommendation: budget === "high" 
        ? "Hyperlite Mountain Gear Southwest (55L)" 
        : budget === "mid" 
          ? "Osprey Atmos AG 50 (M) / Aura AG 50 (W)" 
          : "Decathlon Forclaz MT500 (50L)",
      description: durationDays > 5 ? "High capacity for multi-day trekking." : "Lightweight day/weekend capacity.",
      reason: budget === "high" 
        ? "Dyneema fabric is waterproof and virtually indestructible while remaining ultralight." 
        : budget === "mid" 
          ? "The Anti-Gravity suspension system genuinely distributes load better than anything else at the price. Tested on the Annapurna Circuit." 
          : "Unbeatable price for a pack that includes proper load lifters and hip belts.",
      ...(budget === "mid" && {
        reviewUrl: `${BM}/osprey-atmos-ag-50-the-best-trekking-backpack/`,
        reviewLabel: "Osprey Atmos AG 50 Review",
      }),
    });

    // --- 2. FOOTWEAR ---
    // Via Ferrata High: La Sportiva TX4 GTX — BM reviewed 9.0/10 ✅ keep
    // Standard Mid: swapped to Scarpa Terra GTX where relevant (BM reviewed 8.4)
    items.push({
      category: "Footwear",
      icon: Footprints,
      recommendation: isViaFerrata 
        ? (budget === "high" 
            ? "La Sportiva TX4 GTX (Approach)" 
            : budget === "mid" 
              ? "Scarpa Mescalito Planet / Terra GTX" 
              : "Merrell Moab 3 Mid")
        : (budget === "high" 
            ? "Arc'teryx Aerios FL 2 Mid GTX" 
            : budget === "mid" 
              ? "Salomon X Ultra 4 Mid GTX" 
              : "Merrell Moab 3 Mid"),
      description: isViaFerrata 
        ? "Stiff sole for rock scrambling and via ferrata rungs." 
        : "Comfortable, waterproof ankle support.",
      reason: isViaFerrata && budget === "high" 
        ? "Unmatched grip on Dolomites limestone; stiff enough for Via Ferrata rungs — 9.0/10 in our full test." 
        : isViaFerrata && budget === "mid"
          ? "Two brilliant options: Mescalito (scored 9.0) for pure approach work, Terra GTX (8.4) for longer trail days."
          : budget === "mid" 
            ? "Excellent ankle support for long days; versatile enough for rock and mud." 
            : "Famous out-of-the-box comfort; affordable and incredibly durable.",
      ...(isViaFerrata && budget === "high" && {
        reviewUrl: `${BM}/la-sportiva-tx4-gtx-review-the-best-engineered-shoes/`,
        reviewLabel: "La Sportiva TX4 GTX Review",
      }),
      ...(isViaFerrata && budget === "mid" && {
        reviewUrl: `${BM}/scarpa-mescalito-planet-the-best-approach-shoe/`,
        reviewLabel: "Scarpa Mescalito Review",
      }),
    });

    // --- 3. CLOTHING (SHELL) ---
    // High: Arc'teryx Beta AR — BM reviewed 8.0/10 ✅ keep
    // Mid: swapped Patagonia Torrentshell → Montane Minimus Lite (BM reviewed 8.1/10)
    // Note: Patagonia Torrentshell NOT swapped at Low — no BM review at that tier
    items.push({
      category: "Clothing (Shell)",
      icon: Layers,
      recommendation: budget === "high" 
        ? "Arc'teryx Beta AR Jacket" 
        : budget === "mid" 
          ? "Montane Minimus Lite Jacket" 
          : "Marmot PreCip Eco / Frogg Toggs",
      description: "Hard shell for unpredictable mountain rain and wind.",
      reason: budget === "high" 
        ? "Gore-Tex Pro offers the best breathability and storm protection at altitude — 8.0/10 in our full test." 
        : budget === "mid" 
          ? "Impressively packable and genuinely breathable trail shell; holds up well in sustained rain without the premium price tag." 
          : "Basic but effective rain protection; packs down small when not needed.",
      ...(budget === "high" && {
        reviewUrl: `${BM}/arcteryx-beta-ar-the-best-waterproof-jacket/`,
        reviewLabel: "Arc'teryx Beta AR Review",
      }),
      ...(budget === "mid" && {
        reviewUrl: `${BM}/5-reasons-why-the-montane-minimus-lite-is-the-best-trail-running-jacket/`,
        reviewLabel: "Montane Minimus Lite Review",
      }),
    });

    // --- 4. CLOTHING (INSULATION) ---
    // High: Arc'teryx Proton LT — BM reviewed 8.4/10
    // Mid: swapped Patagonia Nano Puff → Rab Microlight Alpine (BM reviewed 8.7/10 — higher score)
    // Low: Decathlon — no BM review, keep as-is
    items.push({
      category: "Clothing (Insulation)",
      icon: Sun,
      recommendation: budget === "high" 
        ? "Arc'teryx Proton LT Hoody" 
        : budget === "mid" 
          ? "Rab Microlight Alpine Down Jacket" 
          : "Decathlon Forclaz MT100 Down",
      description: maxAltitude > 3000 
        ? "Crucial for freezing evening temperatures at high altitude." 
        : "Lightweight warmth for rest stops and evenings.",
      reason: budget === "high" 
        ? "Coreloft Compact synthetic insulation works wet or dry; perfect active layer under a shell at altitude — 8.4/10 in our test." 
        : budget === "mid" 
          ? "Our highest-rated insulation layer at 8.7/10. Hydrophobic down, bomber build quality, and packs smaller than many synthetics." 
          : "RDS-certified down that rivals jackets triple its price for basic camp warmth.",
      ...(budget === "high" && {
        reviewUrl: `${BM}/top-benefits-of-the-arcteryx-proton-lt-hoody-reviews/`,
        reviewLabel: "Arc'teryx Proton LT Review",
      }),
      ...(budget === "mid" && {
        reviewUrl: `${BM}/why-is-the-rab-microlight-alpine-jacket-popular-among-hikers/`,
        reviewLabel: "Rab Microlight Alpine Review",
      }),
    });

    // --- 5. VIA FERRATA (Conditional) ---
    if (isViaFerrata) {
      items.push({
        category: "Via Ferrata Kit",
        icon: Link,
        recommendation: budget === "high" 
          ? "Petzl Scorpio Eashook & Meteor Helmet" 
          : budget === "mid" 
            ? "Black Diamond Iron Cruiser & Half Dome" 
            : "Camp Kinetic Rewind & Camp Armour Helmet",
        description: "Energy-absorbing lanyard and climbing helmet.",
        reason: budget === "high" 
          ? "Premium carabiners prevent hand fatigue; helmet is ultralight and ventilated." 
          : budget === "mid" 
            ? "Rugged, easy-to-use sliding carabiners and an absolute workhorse of a helmet." 
            : "Affordable, fully certified safety gear; slightly heavier but perfectly safe.",
      });
      items.push({
        category: "Harness",
        icon: Activity,
        recommendation: budget === "high" 
          ? "Arc'teryx AR-395a" 
          : budget === "mid" 
            ? "Black Diamond Momentum" 
            : "Petzl Corax",
        description: "Climbing harness for clipping into cables.",
        reason: budget === "high" 
          ? "Extremely comfortable for long hanging belays but packs completely flat." 
          : budget === "mid" 
            ? "The standard all-rounder harness; comfortable enough for the Alta Via." 
            : "Highly adjustable (fits over bulky layers) and very affordable.",
      });
    }

    // --- 6. CAMPING (Conditional) ---
    if (isCamping) {
      // Mid: Big Agnes Copper Spur HV UL2 — BM reviewed 8.0/10 ✅ keep
      items.push({
        category: "Tent",
        icon: Tent,
        recommendation: budget === "high" 
          ? "Zpacks Duplex" 
          : budget === "mid" 
            ? "Big Agnes Copper Spur HV UL2" 
            : "Naturehike Cloud-Up 2",
        description: "Lightweight shelter for backcountry sleeping.",
        reason: budget === "high" 
          ? "The holy grail of ultralight trekking tents; uses trekking poles to pitch, weighing under 600g." 
          : budget === "mid" 
            ? "Freestanding, spacious for its weight, and holds up excellently in mountain wind — 8.0/10 in our full review." 
            : "A highly-rated budget tent; reliable protection for the price.",
        ...(budget === "mid" && {
          reviewUrl: `${BM}/big-agnes-copper-spur-ul2-the-best-trekking-tent/`,
          reviewLabel: "Big Agnes Copper Spur Review",
        }),
      });

      items.push({
        category: "Sleeping Bag",
        icon: BedDouble,
        recommendation: budget === "high" 
          ? "Rab Alpine 800 Sleeping Bag" 
          : budget === "mid" 
            ? "Mountain Hardwear Bishop Pass 15°F" 
            : "Kelty Cosmic Down 20",
        description: maxAltitude > 3000 
          ? "Rated for freezing mountain temperatures." 
          : "3-season warmth rating.",
        reason: budget === "high" 
          ? "4-season performance that handles serious alpine temperatures. Proven on the Annapurna Circuit and high-altitude camps." 
          : budget === "mid" 
            ? "Exceptional value for RDS-certified down; a perfect 3-season mountain bag." 
            : "The best entry-level down bag on the market. Bulkier, but keeps you warm to -6°C.",
        // Rab Alpine 800 is used personally — link to kit list as supporting context
        ...(budget === "high" && {
          reviewUrl: `${BM}/ultimate-trekking-kit-list-whats-in-the-pack/`,
          reviewLabel: "In our Trekking Kit List",
        }),
      });

      // Mid: swapped NEMO Tensor → Sea to Summit Ultralight Insulated (BM reviewed 8.3/10)
      items.push({
        category: "Sleeping Pad",
        icon: Layers,
        recommendation: budget === "high" 
          ? "Therm-a-Rest NeoAir XTherm NXT" 
          : budget === "mid" 
            ? "Sea to Summit Ultralight Insulated Sleeping Pad" 
            : "Klymit Static V Insulated",
        description: "Insulation from the cold ground.",
        reason: budget === "high" 
          ? "The best warmth-to-weight ratio for sleeping on frozen or rocky alpine ground." 
          : budget === "mid" 
            ? "Thick, quiet, and well-insulated — 8.3/10 in our full review. Packs down impressively for an insulated pad." 
            : "A rugged, highly affordable pad with unique V-chambers to limit air movement.",
        ...(budget === "mid" && {
          reviewUrl: `${BM}/sea-to-summit-ultralight-insulated-sleeping-pad-reasons-to-love-it/`,
          reviewLabel: "Sea to Summit Pad Review",
        }),
      });

      items.push({
        category: "Cooking",
        icon: Flame,
        recommendation: budget === "high" 
          ? "Jetboil Stash" 
          : budget === "mid" 
            ? "MSR PocketRocket 2 + Toaks Titanium Pot" 
            : "BRS-3000T Stove + Stanley Adventure Pot",
        description: "Stove and pot system for boiling water and freeze-dried meals.",
        reason: budget === "high" 
          ? "Extremely lightweight, boils water in under 3 minutes, and packs into its own pot." 
          : budget === "mid" 
            ? "The industry standard ultralight stove paired with an affordable, durable titanium pot." 
            : "A $15 titanium stove that weighs 25g, paired with a bombproof stainless steel pot.",
      });
    }

    // --- 7. WATER & EMERGENCY ---
    items.push({
      category: "Water Filter",
      icon: Droplet,
      recommendation: budget === "high" 
        ? "Katadyn BeFree 1L" 
        : budget === "mid" 
          ? "Sawyer Squeeze" 
          : "Sawyer Mini / Aquamira Drops",
      description: "Essential for drinking from streams and lakes safely.",
      reason: budget === "high" 
        ? "Fastest flow rate on the market; soft flask rolls up into your pocket when empty." 
        : budget === "mid" 
          ? "The legendary thru-hiker standard. Screws onto standard smart-water bottles." 
          : "Very affordable options, though flow rate is slightly slower.",
    });

    items.push({
      category: "Emergency",
      icon: ShieldCheck,
      recommendation: budget === "high" 
        ? "Garmin inReach Mini 2 + Premium Med Kit" 
        : budget === "mid" 
          ? "Adventure Medical Kits UL + Bivy" 
          : "DIY Pharmacy Kit + Mylar Blanket",
      description: "Survival gear for worst-case scenarios.",
      reason: budget === "high" 
        ? "Satellite SOS and messaging is non-negotiable for remote, high-altitude treks." 
        : budget === "mid" 
          ? "Pre-packaged, waterproof medical kit paired with a lightweight emergency space bivy." 
          : "Ziploc bag with ibuprofen, leukotape, bandages, and a basic Mylar blanket.",
    });

    return items;
  };

  const recommendations = getGearRecommendations(budget);

  return (
    <div className="flex flex-col gap-6">
      {/* Header + budget toggle */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-muted/30 p-4 rounded-xl border border-border/50">
        <div>
          <h3 className="font-bold text-lg text-foreground">Gear Recommendations</h3>
          <p className="text-sm text-muted-foreground">
            Tailored for this trek's altitude and terrain.{" "}
            <a
              href="https://backpackersmentality.com/ultimate-trekking-kit-list-whats-in-the-pack/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline underline-offset-2 hover:opacity-80 transition-opacity text-xs"
            >
              Full kit list ↗
            </a>
          </p>
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

      {/* Gear cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {recommendations.map((item, index) => (
          <div
            key={`${item.category}-${index}`}
            className="bg-background rounded-xl p-4 border border-border/50 shadow-sm flex flex-col gap-3"
          >
            <div className="flex items-center gap-3 text-primary">
              <div className="p-2 bg-primary/10 rounded-lg">
                <item.icon className="w-5 h-5" />
              </div>
              <span className="font-semibold text-[10px] uppercase tracking-wider">{item.category}</span>
            </div>

            <div>
              <div className="font-bold text-sm text-foreground mb-1 leading-tight">
                {item.recommendation}
              </div>
              <div className="text-[11px] text-muted-foreground leading-relaxed italic mb-2">
                {item.description}
              </div>
              <div className="bg-secondary/50 rounded-md p-2 text-[10px] text-foreground/80 border border-border/30">
                <strong>Why:</strong> {item.reason}
              </div>
            </div>

            {/* BM review link — only renders when a real review exists */}
            {item.reviewUrl && (
              <a
                href={item.reviewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-auto flex items-center gap-1.5 text-[11px] text-primary font-medium hover:underline underline-offset-2 transition-opacity hover:opacity-80 group"
              >
                <ExternalLink className="w-3 h-3 shrink-0 opacity-60 group-hover:opacity-100" />
                {item.reviewLabel ?? "Read full review"}
                <span className="ml-auto text-[9px] text-muted-foreground font-normal">backpackersmentality.com</span>
              </a>
            )}
          </div>
        ))}
      </div>

      {/* Footer — link to full kit room */}
      <div className="flex items-center justify-between px-1 text-xs text-muted-foreground">
        <span>Items marked with ↗ are independently reviewed on Backpacker's Mentality.</span>
        <a
          href="https://backpackersmentality.com/kit-room/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary underline-offset-2 underline hover:opacity-70 transition-opacity whitespace-nowrap ml-3"
        >
          Browse Kit Room →
        </a>
      </div>
    </div>
  );
}
