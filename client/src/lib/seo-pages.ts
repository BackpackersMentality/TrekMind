// lib/seo-pages.ts
// Derives all programmatic SEO page data from treks.json at runtime.
// No manual maintenance required — adding a trek to treks.json
// automatically creates new region/country/category pages.

import { getAllTreks } from './treks';

// ── Continent mapping ─────────────────────────────────────────────────────────
const COUNTRY_TO_CONTINENT: Record<string, string> = {
  // Asia
  Nepal: 'Asia', India: 'Asia', Bhutan: 'Asia', Pakistan: 'Asia',
  China: 'Asia', Japan: 'Asia', Kyrgyzstan: 'Asia', Georgia: 'Asia',
  Russia: 'Asia', 'Hong Kong': 'Asia',
  // Middle East
  Jordan: 'Middle East', Turkey: 'Middle East', Israel: 'Middle East',
  // Europe
  France: 'Europe', Italy: 'Europe', Switzerland: 'Europe', Spain: 'Europe',
  Austria: 'Europe', Slovenia: 'Europe', Scotland: 'Europe', Portugal: 'Europe',
  Sweden: 'Europe', Norway: 'Europe', Iceland: 'Europe', Albania: 'Europe',
  Montenegro: 'Europe', Corsica: 'Europe', UK: 'Europe',
  // South America
  Peru: 'South America', Chile: 'South America', Argentina: 'South America',
  Bolivia: 'South America', Colombia: 'South America', Ecuador: 'South America',
  Venezuela: 'South America', Brazil: 'South America',
  // North America
  USA: 'North America', Canada: 'North America', Mexico: 'North America',
  // Africa
  Tanzania: 'Africa', Kenya: 'Africa', Ethiopia: 'Africa',
  'South Africa': 'Africa', Namibia: 'Africa', Uganda: 'Africa', Morocco: 'Africa',
  // Oceania
  'New Zealand': 'Oceania', Australia: 'Oceania',
};

// ── Slug helpers ──────────────────────────────────────────────────────────────
export function toSlug(str: string): string {
  return str
    .toLowerCase()
    .replace(/['']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function fromSlug(slug: string): string {
  return slug
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

// ── Duration brackets ─────────────────────────────────────────────────────────
export interface DurationBracket {
  slug: string;
  label: string;
  min: number;
  max: number;
  searchLabel: string;
}

export const DURATION_BRACKETS: DurationBracket[] = [
  { slug: '1-3-day-treks',  label: '1–3 Day Treks',  min: 1,  max: 3,   searchLabel: 'weekend treks' },
  { slug: '4-5-day-treks',  label: '4–5 Day Treks',  min: 4,  max: 5,   searchLabel: '4 day trekking routes' },
  { slug: '6-7-day-treks',  label: '6–7 Day Treks',  min: 6,  max: 7,   searchLabel: 'week-long treks' },
  { slug: '8-10-day-treks', label: '8–10 Day Treks', min: 8,  max: 10,  searchLabel: '10 day trekking routes' },
  { slug: '11-14-day-treks',label: '11–14 Day Treks',min: 11, max: 14,  searchLabel: '2 week treks' },
  { slug: '15-plus-day-treks', label: '15+ Day Treks', min: 15, max: 999, searchLabel: 'long distance treks' },
];

function getTrekDays(trek: any): number {
  const raw = trek.totalDays ?? trek.durationDays ?? '';
  const match = String(raw).match(/\d+/);
  return match ? parseInt(match[0]) : 0;
}

// ── Page data types ───────────────────────────────────────────────────────────
export interface SEOPageData {
  slug: string;
  title: string;
  description: string;
  h1: string;
  intro: string;
  treks: any[];
  breadcrumb: { label: string; href: string }[];
  relatedPages: { label: string; href: string }[];
}

// ── Region pages ──────────────────────────────────────────────────────────────
export function getAllRegions(): { slug: string; name: string; count: number }[] {
  const treks = getAllTreks();
  const map: Record<string, number> = {};
  for (const t of treks) {
    const r = t.region?.trim();
    if (r) map[r] = (map[r] || 0) + 1;
  }
  return Object.entries(map)
    .map(([name, count]) => ({ slug: toSlug(name), name, count }))
    .sort((a, b) => b.count - a.count);
}

export function getRegionPageData(slug: string): SEOPageData | null {
  const treks = getAllTreks();
  const regionTreks = treks.filter(t => toSlug(t.region ?? '') === slug);
  if (regionTreks.length === 0) return null;

  const name = regionTreks[0].region;
  const continent = COUNTRY_TO_CONTINENT[regionTreks[0].country] ?? 'the World';

  return {
    slug,
    title: `Best Treks in ${name} | TrekMind`,
    description: `Explore the ${regionTreks.length} best multi-day trekking routes in ${name}. Detailed itineraries, interactive maps, and gear guides for every trek.`,
    h1: `Best Treks in ${name}`,
    intro: `${name} is home to ${regionTreks.length} of the world's greatest multi-day trekking routes. From iconic classics to remote wilderness circuits, here is the complete guide to trekking in ${name}.`,
    treks: regionTreks,
    breadcrumb: [
      { label: 'Home', href: '/' },
      { label: continent, href: `/treks/continent/${toSlug(continent)}` },
      { label: name, href: `/treks/region/${slug}` },
    ],
    relatedPages: getAllRegions()
      .filter(r => r.slug !== slug)
      .slice(0, 6)
      .map(r => ({ label: r.name, href: `/treks/region/${r.slug}` })),
  };
}

// ── Country pages ─────────────────────────────────────────────────────────────
export function getAllCountries(): { slug: string; name: string; count: number }[] {
  const treks = getAllTreks();
  const map: Record<string, number> = {};
  for (const t of treks) {
    const c = t.country?.trim();
    if (c) map[c] = (map[c] || 0) + 1;
  }
  return Object.entries(map)
    .map(([name, count]) => ({ slug: toSlug(name), name, count }))
    .sort((a, b) => b.count - a.count);
}

export function getCountryPageData(slug: string): SEOPageData | null {
  const treks = getAllTreks();
  const countryTreks = treks.filter(t => toSlug(t.country ?? '') === slug);
  if (countryTreks.length === 0) return null;

  const name = countryTreks[0].country;
  const continent = COUNTRY_TO_CONTINENT[name] ?? 'the World';

  return {
    slug,
    title: `Best Treks in ${name} | TrekMind`,
    description: `The ${countryTreks.length} greatest multi-day trekking routes in ${name}. Complete itineraries, route maps, and planning guides for every trek.`,
    h1: `Best Treks in ${name}`,
    intro: `${name} is one of the world's premier trekking destinations. These are the ${countryTreks.length} routes that define multi-day walking in ${name} — ranked, mapped, and ready to plan.`,
    treks: countryTreks,
    breadcrumb: [
      { label: 'Home', href: '/' },
      { label: continent, href: `/treks/continent/${toSlug(continent)}` },
      { label: name, href: `/treks/country/${slug}` },
    ],
    relatedPages: getAllCountries()
      .filter(c => c.slug !== slug)
      .slice(0, 6)
      .map(c => ({ label: c.name, href: `/treks/country/${c.slug}` })),
  };
}

// ── Continent pages ───────────────────────────────────────────────────────────
export function getAllContinents(): { slug: string; name: string; count: number }[] {
  const treks = getAllTreks();
  const map: Record<string, number> = {};
  for (const t of treks) {
    const cont = COUNTRY_TO_CONTINENT[t.country?.trim() ?? ''];
    if (cont) map[cont] = (map[cont] || 0) + 1;
  }
  return Object.entries(map)
    .map(([name, count]) => ({ slug: toSlug(name), name, count }))
    .sort((a, b) => b.count - a.count);
}

export function getContinentPageData(slug: string): SEOPageData | null {
  const treks = getAllTreks();
  const contTreks = treks.filter(t => {
    const cont = COUNTRY_TO_CONTINENT[t.country?.trim() ?? ''];
    return toSlug(cont ?? '') === slug;
  });
  if (contTreks.length === 0) return null;

  const name = fromSlug(slug);
  const countries = [...new Set(contTreks.map(t => t.country))];

  return {
    slug,
    title: `Best Treks in ${name} | TrekMind`,
    description: `The ${contTreks.length} greatest multi-day trekking routes across ${name} — spanning ${countries.length} countries. Full itineraries, maps, and planning guides.`,
    h1: `Best Treks in ${name}`,
    intro: `${name} contains some of the world's most celebrated and remote multi-day trekking routes, spanning ${countries.length} countries. These are the ${contTreks.length} routes that define great trekking across the continent.`,
    treks: contTreks,
    breadcrumb: [
      { label: 'Home', href: '/' },
      { label: name, href: `/treks/continent/${slug}` },
    ],
    relatedPages: getAllContinents()
      .filter(c => c.slug !== slug)
      .map(c => ({ label: c.name, href: `/treks/continent/${c.slug}` })),
  };
}

// ── Duration pages ────────────────────────────────────────────────────────────
export function getDurationPageData(slug: string): SEOPageData | null {
  const bracket = DURATION_BRACKETS.find(b => b.slug === slug);
  if (!bracket) return null;

  const treks = getAllTreks().filter(t => {
    const d = getTrekDays(t);
    return d >= bracket.min && d <= bracket.max;
  });

  return {
    slug,
    title: `${bracket.label} | TrekMind`,
    description: `${treks.length} of the world's best ${bracket.label.toLowerCase()} — ${bracket.searchLabel} with full itineraries, route maps, and planning guides.`,
    h1: bracket.label,
    intro: `Looking for ${bracket.searchLabel}? These ${treks.length} routes fit your timeframe — each with complete day-by-day itineraries, interactive route maps, and difficulty ratings.`,
    treks,
    breadcrumb: [
      { label: 'Home', href: '/' },
      { label: 'Treks by Duration', href: '/treks/duration' },
      { label: bracket.label, href: `/treks/duration/${slug}` },
    ],
    relatedPages: DURATION_BRACKETS
      .filter(b => b.slug !== slug)
      .map(b => ({ label: b.label, href: `/treks/duration/${b.slug}` })),
  };
}

// ── Tier/difficulty pages ─────────────────────────────────────────────────────
export interface TierInfo {
  tier: number;
  slug: string;
  label: string;
  description: string;
  searchLabel: string;
}

export const TIER_INFO: TierInfo[] = [
  {
    tier: 1, slug: 'iconic', label: 'Tier 1 — Iconic Treks',
    description: 'The most celebrated multi-day trekking routes in the world — globally recognised classics with excellent infrastructure.',
    searchLabel: 'iconic trekking routes'
  },
  {
    tier: 2, slug: 'legendary', label: 'Tier 2 — Legendary Treks',
    description: 'Demanding, remote, or technically challenging routes known to serious trekkers worldwide.',
    searchLabel: 'legendary trekking routes'
  },
  {
    tier: 3, slug: 'remote', label: 'Tier 3 — Remote & Specialist Treks',
    description: 'Expedition-level routes requiring serious experience, self-sufficiency, and remote wilderness skills.',
    searchLabel: 'remote wilderness treks'
  },
  {
    tier: 4, slug: 'thru-hikes', label: 'Tier 4 — Thru-Hikes',
    description: 'Long-distance routes designed for continuous thru-hiking — weeks to months of sustained walking.',
    searchLabel: 'thru-hiking trails'
  },
];

export function getTierPageData(slug: string): SEOPageData | null {
  const tierInfo = TIER_INFO.find(t => t.slug === slug);
  if (!tierInfo) return null;

  const treks = getAllTreks().filter(t => t.tier === tierInfo.tier);

  return {
    slug,
    title: `${tierInfo.label} | TrekMind`,
    description: `${treks.length} ${tierInfo.searchLabel} with complete itineraries, route maps, and gear guides. ${tierInfo.description}`,
    h1: tierInfo.label,
    intro: tierInfo.description,
    treks,
    breadcrumb: [
      { label: 'Home', href: '/' },
      { label: 'Treks by Tier', href: '/treks/tier' },
      { label: tierInfo.label, href: `/treks/tier/${slug}` },
    ],
    relatedPages: TIER_INFO
      .filter(t => t.slug !== slug)
      .map(t => ({ label: t.label, href: `/treks/tier/${t.slug}` })),
  };
}
