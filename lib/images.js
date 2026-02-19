/**
 * Trek image utilities
 * Handles loading trek hero images from GitHub CDN
 */

const GITHUB_CDN_BASE = 'https://cdn.jsdelivr.net/gh/BackpackersMentality/trekmind-images@main/treks';
const PLACEHOLDER_IMAGE = 'https://via.placeholder.com/800x600/1a1a1a/666666?text=Trek+Image';

/**
 * Get the hero image URL for a trek
 * @param {string} filename - The image filename (without extension)
 * @returns {string} Full URL to the trek image
 */
export function getTrekHeroImage(filename) {
  if (!filename) {
    return PLACEHOLDER_IMAGE;
  }

  // Clean the filename (remove .jpg if included)
  const cleanFilename = filename.replace(/\.jpg$/i, '');

  return `${GITHUB_CDN_BASE}/${cleanFilename}.jpg`;
}

/**
 * Get image URL with error handling
 * @param {string} filename - The image filename
 * @param {function} onError - Error callback
 * @returns {string} Image URL
 */
export function getTrekImageWithFallback(filename, onError) {
  const imageUrl = getTrekHeroImage(filename);

  // Return an object that can be used with img onError
  return {
    src: imageUrl,
    onError: (e) => {
      e.target.src = PLACEHOLDER_IMAGE;
      if (onError) onError(e);
    }
  };
}

/**
 * Preload a trek image
 * @param {string} filename - The image filename
 * @returns {Promise<string>} Resolves with image URL when loaded
 */
export function preloadTrekImage(filename) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const imageUrl = getTrekHeroImage(filename);

    img.onload = () => resolve(imageUrl);
    img.onerror = () => reject(new Error(`Failed to load image: ${filename}`));
    img.src = imageUrl;
  });
}

/**
 * Get thumbnail URL (for future use if we add thumbnails)
 * @param {string} filename - The image filename
 * @returns {string} Thumbnail URL (currently same as full image)
 */
export function getTrekThumbnail(filename) {
  // For now, returns same as hero image
  // In future, could point to /thumbnails/ folder
  return getTrekHeroImage(filename);
}

/**
 * Check if image exists
 * @param {string} filename - The image filename
 * @returns {Promise<boolean>} True if image exists and loads
 */
export async function checkImageExists(filename) {
  try {
    await preloadTrekImage(filename);
    return true;
  } catch {
    return false;
  }
}

// Export constants for use elsewhere
export const IMAGE_CDN_BASE = GITHUB_CDN_BASE;
export const DEFAULT_PLACEHOLDER = PLACEHOLDER_IMAGE;
