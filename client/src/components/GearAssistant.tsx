import { useState } from "react";
import { 
  ShieldCheck, Footprints, Tent, Layers, Sun, Backpack, Flame, 
  Droplet, Activity, Link, BedDouble, ExternalLink, Mountain, Anchor
} from "lucide-react";
import { cn } from "@/lib/utils";

interface GearAssistantProps {
  trekName?: string;
  difficulty: string;
  maxAltitude: number;
  durationDays: number;
  accommodationType: string;
  campingRequired: boolean;
  tier?: number; // Pass trek tier so Tier 5 peaks get full alpinism kit
}

type Budget = "low" | "mid" | "high";

interface GearItem {
  category: string;
  icon: any;
  recommendation: string;
  description: string;
  reason: string;
  reviewUrl?: string;
  reviewLabel?: string;
}

const BM = "https://backpackersmentality.com";

export function GearAssistant({ 
  trekName = "",
  difficulty, 
  maxAltitude, 
  durationDays, 
  accommodationType, 
  campingRequired,
  tier,
}: GearAssistantProps) {
  const [budget, setBudget] = useState<Budget>("mid");

  const getGearRecommendations = (budget: Budget): GearItem[] => {
    // ── Defensive altitude parse ────────────────────────────────────────────
    // maxAltitude prop is typed as number, but in practice TrekDetail passes
    // the raw trek.maxAltitude string (e.g. "6189m", "5,895m") due to the
    // mixed data shape in treks.json. Strip non-numeric chars so comparisons
    // work correctly. Without this, "6189m" >= 5000 → false (NaN comparison).
    const altM: number = typeof maxAltitude === "number" && !isNaN(maxAltitude)
      ? maxAltitude
      : parseInt(String(maxAltitude).replace(/[^\d]/g, ""), 10) || 0;

    const isCamping      = campingRequired || accommodationType.toLowerCase().includes("camping");
    const isViaFerrata   = trekName.toLowerCase().includes("alta via") || difficulty.toLowerCase().includes("ferrata");
    // Tier 5 trekking peaks require full alpinism kit (crampons, ice axe, harness, helmet).
    // tier prop is the primary signal; altM >= 5000 is a safe secondary fallback.
    const isTrekkingPeak = tier === 5 || altM >= 5000;

    const items: GearItem[] = [];

    // --- 1. BACKPACK ---
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
    items.push({
      category: "Footwear",
      icon: Footprints,
      recommendation: isViaFerrata 
        ? (budget === "high" 
            ? "La Sportiva TX4 GTX (Approach)" 
            : budget === "mid" 
              ? "Scarpa Mescalito Planet / Terra GTX" 
              : "Merrell Moab 3 Mid")
        : isTrekkingPeak
          ? (budget === "high"
              ? "La Sportiva Nepal Cube GTX (mountaineering boot)"
              : budget === "mid"
                ? "Scarpa Mont Blanc GTX / Zamberlan Vioz GTX"
                : "Salomon Quest 4 GTX (stiff, crampon-compatible)")
          : (budget === "high" 
              ? "Arc'teryx Aerios FL 2 Mid GTX" 
              : budget === "mid" 
                ? "Salomon X Ultra 4 Mid GTX" 
                : "Merrell Moab 3 Mid"),
      description: isViaFerrata 
        ? "Stiff sole for rock scrambling and via ferrata rungs." 
        : isTrekkingPeak
          ? "Crampon-compatible mountaineering boot for glacier and high-altitude terrain."
          : "Comfortable, waterproof ankle support.",
      reason: isTrekkingPeak && budget === "high"
        ? "B3-rated mountaineering boot — the only choice for crampons on serious glacier terrain above 5000m."
        : isTrekkingPeak && budget === "mid"
          ? "Semi-stiff C2 crampon-compatible boots. Proven on Himalayan and Andean trekking peaks without full expedition cost."
          : isTrekkingPeak
            ? "Stiff enough for C1/C2 crampons. A hard toe rand and waterproof lining are non-negotiable on glaciated terrain."
            : isViaFerrata && budget === "high" 
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
    items.push({
      category: "Clothing (Shell)",
      icon: Layers,
      recommendation: budget === "high" 
        ? "Arc'teryx Beta AR Jacket" 
        : budget === "mid" 
          ? "Montane Minimus Lite Jacket" 
          : "Marmot PreCip Eco / Frogg Toggs",
      description: isTrekkingPeak 
        ? "Hard shell essential for high-altitude wind, spindrift, and summit conditions." 
        : "Hard shell for unpredictable mountain rain and wind.",
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
    items.push({
      category: "Clothing (Insulation)",
      icon: Sun,
      recommendation: budget === "high" 
        ? "Arc'teryx Proton LT Hoody" 
        : budget === "mid" 
          ? "Rab Microlight Alpine Down Jacket" 
          : "Decathlon Forclaz MT100 Down",
      description: altM > 3000 
        ? "Crucial for freezing temperatures at high altitude — summit nights can drop to −20°C." 
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

    // --- 5. TREKKING PEAK ALPINISM KIT (Tier 5 / altitude ≥ 5000m) ---
    if (isTrekkingPeak) {
      // 5a. Crampons
      items.push({
        category: "Crampons",
        icon: Mountain,
        recommendation: budget === "high"
          ? "Grivel G12 New-Matic (12-point, C2 step-in)"
          : budget === "mid"
            ? "Black Diamond Serac Clip (10-point, strap/hybrid)"
            : "Camp XLC 390 / Hillsound Trail Crampon Pro",
        description: "Essential for glacier travel, snow slopes, and icy summit terrain.",
        reason: budget === "high"
          ? "12-point step-in crampon — bomber on steep ice and packed snow. Compatible with B3 mountaineering boots."
          : budget === "mid"
            ? "Reliable 10-point crampon that works on most semi-stiff boots. Proven on Island Peak and standard Himalayan trekking peaks."
            : "Budget option that fits a range of boot stiffnesses. Adequate for moderate snow slopes on introductory peaks.",
      });

      // 5b. Ice Axe
      items.push({
        category: "Ice Axe",
        icon: Anchor,
        recommendation: budget === "high"
          ? "Black Diamond Raven Pro (60–65cm)"
          : budget === "mid"
            ? "Petzl Summit (60cm) / Grivel Nepal Classic"
            : "Camp Corsa Nanotech (60cm) / Simond Ice Axe",
        description: "Walking axe for self-arrest, balance on steep snow, and fixed-rope sections.",
        reason: budget === "high"
          ? "The benchmark walking axe. Chromoly steel spike, machined adze — preferred by Himalayan guides for its reliability."
          : budget === "mid"
            ? "Excellent weight-to-strength balance. The Petzl Summit is a favourite for trekking peak first-timers — intuitive and confidence-inspiring."
            : "Functional basic axe for non-technical snow slopes. Heavier but robust and well within budget.",
      });

      // 5c. Climbing Helmet
      items.push({
        category: "Climbing Helmet",
        icon: ShieldCheck,
        recommendation: budget === "high"
          ? "Petzl Sirocco (ultralight, foam)"
          : budget === "mid"
            ? "Black Diamond Half Dome / Petzl Boreo"
            : "Mammut Skywalker 3 / Camp Armour",
        description: "Mandatory on glaciated terrain — rockfall, ice fall, and fixed rope sections.",
        reason: budget === "high"
          ? "At 160g the Sirocco is the lightest UIAA-certified helmet. No compromise on protection, huge gain on weight."
          : budget === "mid"
            ? "The Half Dome has been the industry workhorse for a decade. Comfortable for all-day wear at altitude and CE/UIAA certified."
            : "Fully certified, highly adjustable to fit over balaclava and beanie. Heavier but perfectly safe and extremely affordable.",
      });

      // 5d. Harness
      items.push({
        category: "Climbing Harness",
        icon: Activity,
        recommendation: budget === "high"
          ? "Petzl Hirundos / Arc'teryx AR-395a"
          : budget === "mid"
            ? "Black Diamond Momentum / Petzl Corax"
            : "Petzl Corax / Singing Rock Sit Worker",
        description: "Required for glacier travel with a guide and fixed rope sections on summit day.",
        reason: budget === "high"
          ? "Ultralight harness with Wireframe buckles — barely noticed on the approach, secure when you need it most."
          : budget === "mid"
            ? "The Momentum is the go-to guide-recommended harness for trekking peaks — simple, bomber, fits over insulation layers."
            : "Highly adjustable waistbelt and leg loops — essential when wearing multiple base layers at altitude. Very affordable.",
      });
    }

    // --- 6. VIA FERRATA KIT (Conditional) ---
    if (isViaFerrata) {
      items.push({
        category: "Via Ferrata Lanyard",
        icon: Link,
        recommendation: budget === "high" 
          ? "Petzl Scorpio Eashook" 
          : budget === "mid" 
            ? "Black Diamond Iron Cruiser" 
            : "Camp Kinetic Rewind",
        description: "Energy-absorbing Y-shaped lanyard — not optional on via ferrata.",
        reason: budget === "high" 
          ? "Premium carabiners with smooth EasyLock gates prevent hand fatigue on long sections." 
          : budget === "mid" 
            ? "Rugged, easy-to-use sliding carabiners. The industry workhorse for Alta Via routes." 
            : "Affordable, fully certified energy-absorbing lanyard; slightly heavier but perfectly safe.",
      });
      items.push({
        category: "Via Ferrata Helmet",
        icon: ShieldCheck,
        recommendation: budget === "high"
          ? "Petzl Meteor"
          : budget === "mid"
            ? "Black Diamond Half Dome"
            : "Camp Armour Helmet",
        description: "Climbing helmet for rockfall and cable impact protection.",
        reason: budget === "high"
          ? "Ultralight foam construction — 240g, ventilated, and UIAA certified. Barely noticeable on the head."
          : budget === "mid"
            ? "The standard all-rounder; comfortable enough for a full Alta Via day in summer heat."
            : "Affordable, CE/UIAA certified, and adjustable to fit over a thin beanie in cooler conditions.",
      });
      items.push({
        category: "Harness",
        icon: Activity,
        recommendation: budget === "high" 
          ? "Arc'teryx AR-395a" 
          : budget === "mid" 
            ? "Black Diamond Momentum" 
            : "Petzl Corax",
        description: "Climbing harness for clipping into via ferrata cables.",
        reason: budget === "high" 
          ? "Extremely comfortable for long sections; packs completely flat into a daypack." 
          : budget === "mid" 
            ? "The standard all-rounder; comfortable enough for the Alta Via." 
            : "Highly adjustable (fits over bulky layers) and very affordable.",
      });
    }

    // --- 7. CAMPING (Conditional) ---
    if (isCamping) {
      items.push({
        category: "Tent",
        icon: Tent,
        recommendation: budget === "high" 
          ? "Zpacks Duplex" 
          : budget === "mid" 
            ? "Big Agnes Copper Spur HV UL2" 
            : "Naturehike Cloud-Up 2",
        description: isTrekkingPeak
          ? "4-season or 3+ season tent able to handle high-altitude wind and sub-zero nights."
          : "Lightweight shelter for backcountry sleeping.",
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
        description: isTrekkingPeak
          ? "Rated to at least −10°C / 14°F — base camp temperatures on high peaks can be brutal."
          : altM > 3000 
            ? "Rated for freezing mountain temperatures." 
            : "3-season warmth rating.",
        reason: budget === "high" 
          ? "4-season performance that handles serious alpine temperatures. Proven on the Annapurna Circuit and high-altitude camps." 
          : budget === "mid" 
            ? "Exceptional value for RDS-certified down; a perfect 3-season mountain bag." 
            : "The best entry-level down bag on the market. Bulkier, but keeps you warm to -6°C.",
        ...(budget === "high" && {
          reviewUrl: `${BM}/ultimate-trekking-kit-list-whats-in-the-pack/`,
          reviewLabel: "In our Trekking Kit List",
        }),
      });

      items.push({
        category: "Sleeping Pad",
        icon: Layers,
        recommendation: budget === "high" 
          ? "Therm-a-Rest NeoAir XTherm NXT" 
          : budget === "mid" 
            ? "Sea to Summit Ultralight Insulated Sleeping Pad" 
            : "Klymit Static V Insulated",
        description: "Insulation from cold ground — critical at altitude.",
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

    // --- 8. WATER & EMERGENCY ---
    items.push({
      category: "Water Filter",
      icon: Droplet,
      recommendation: budget === "high" 
        ? "Katadyn BeFree 1L" 
        : budget === "mid" 
          ? "Sawyer Squeeze" 
          : "Sawyer Mini / Aquamira Drops",
      description: "Essential for drinking from streams and glacial melt safely.",
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
      description: isTrekkingPeak
        ? "Satellite communication is non-negotiable above 5000m. Altitude sickness protocol included."
        : "Survival gear for worst-case scenarios.",
      reason: budget === "high" 
        ? "Satellite SOS and messaging is non-negotiable for remote, high-altitude treks — especially above 5000m." 
        : budget === "mid" 
          ? "Pre-packaged, waterproof medical kit paired with a lightweight emergency space bivy." 
          : "Ziploc bag with ibuprofen, leukotape, bandages, Diamox, and a basic Mylar blanket.",
    });

    return items;
  };

  const recommendations = getGearRecommendations(budget);
  const isTrekkingPeak  = tier === 5 || altM >= 5000;
  const isViaFerrata    = trekName.toLowerCase().includes("alta via") || difficulty.toLowerCase().includes("ferrata");

  return (
    <div className="flex flex-col gap-6">
      {/* Header + budget toggle */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-muted/30 p-4 rounded-xl border border-border/50">
        <div>
          <h3 className="font-bold text-lg text-foreground">Gear Recommendations</h3>
          <p className="text-sm text-muted-foreground">
            {isTrekkingPeak
              ? "Full alpinism kit for this trekking peak — crampons, ice axe, harness and helmet included."
              : isViaFerrata
                ? "Tailored for via ferrata — approach shoes, lanyard and helmet included."
                : "Tailored for this trek's altitude and terrain."}{" "}
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

      {/* Gear type badge */}
      {isTrekkingPeak && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#2E86C1]/10 border border-[#2E86C1]/25 text-[#2E86C1] text-xs font-semibold">
          <Mountain className="w-3.5 h-3.5 shrink-0" />
          Tier 5 Trekking Peak — alpinism kit (crampons, ice axe, harness, helmet) included below
        </div>
      )}
      {isViaFerrata && !isTrekkingPeak && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/25 text-amber-700 text-xs font-semibold">
          <Link className="w-3.5 h-3.5 shrink-0" />
          Via Ferrata route — lanyard, helmet and harness kit included below
        </div>
      )}

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

      {/* Footer */}
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
