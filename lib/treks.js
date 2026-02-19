import treksData from '../data/treks.json';
import itinerariesData from '../data/itineraries.json';
import editorialData from '../data/editorial.json';

export function getAllTreks() {
  return treksData;
}

export function getTrekById(id) {
  const trek = treksData.find(t => t.id === id);
  if (!trek) return null;
  
  // Merge in editorial content if available
  const editorial = editorialData[id];
  if (editorial) {
    return {
      ...trek,
      whySpecial: editorial.whySpecial,
      highlights: editorial.highlights
    };
  }
  
  return trek;
}

export function getTreksByTier(tier) {
  return treksData.filter(t => t.tier === tier);
}

export function getItinerary(trekId) {
  const data = itinerariesData[trekId];
  if (!data) return null;
  
  // Return just the itinerary array, not the wrapper object
  return data.itinerary || null;
}

export function getTreksByRegion(region) {
  return treksData.filter(t => t.region === region);
}

export function getEditorialContent(trekId) {
  // Use slug or id to match
  const editorial = editorialData[trekId];
  if (editorial) return editorial;

  // Fallback: search by name normalization or other slugs
  const trek = treksData.find(t => t.id === trekId);
  if (!trek) return null;

  // Try to find by name normalization
  const normalizedName = trek.name.toLowerCase().replace(/\s+/g, '-').replace(/[()]/g, '');
  const entry = Object.entries(editorialData).find(([key, val]) => 
    key === normalizedName || val.name === trek.name
  );

  if (entry) return entry[1];

  console.warn(`No editorial content found for trek: ${trekId} (${trek.name})`);
  return null;
}
