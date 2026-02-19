/**
 * Trek Image CDN Utilities
 * Images are served from GitHub: BackpackersMentality/TrekMind-Images
 */

const GITHUB_CDN_BASE =
  'https://raw.githubusercontent.com/BackpackersMentality/TrekMind-Images/main/treks';

/**
 * Returns the full CDN URL for a trek image.
 * @param imageFilename - The filename field from treks.json (e.g. "annapurna")
 */
export function getTrekImageUrl(imageFilename: string): string {
  return `${GITHUB_CDN_BASE}/${imageFilename}.jpg`;
}

/**
 * Returns CDN URL or a fallback placeholder if filename is missing.
 */
export function getTrekImageUrlSafe(imageFilename?: string): string {
  if (!imageFilename) return '/images/placeholder-trek.jpg';
  return getTrekImageUrl(imageFilename);
}
