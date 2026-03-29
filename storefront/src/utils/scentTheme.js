/**
 * Scent Theme Utility
 * Derives visual identity from product data — scent family colors,
 * accord-based gradients, and accent colors.
 */

// Muted accent colors per scent family — designed to tint without breaking
// the black/white/stone editorial palette
const SCENT_FAMILY_COLORS = {
  Woody:    '#7A5C3E',
  Oriental: '#8B4513',
  Floral:   '#C47A8F',
  Fresh:    '#5B8A72',
  Spicy:    '#A0522D',
  Amber:    '#B8860B',
  Oud:      '#3E2723',
  Citrus:   '#CC8400',
  Aromatic: '#4A6741',
  Gourmand: '#8B6550',
}

/**
 * Get the accent color for a product's scent family
 */
export function getAccentColor(product) {
  return SCENT_FAMILY_COLORS[product.scentFamily] || '#7A5C3E'
}

/**
 * Convert hex to rgba string
 */
function hexToRgba(hex, alpha) {
  const h = hex.replace('#', '')
  const r = parseInt(h.substring(0, 2), 16)
  const g = parseInt(h.substring(2, 4), 16)
  const b = parseInt(h.substring(4, 6), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

/**
 * Build a subtle CSS gradient from the top 2 accord colors.
 * Each product gets a unique background tint.
 */
export function getDominantGradient(accords) {
  if (!accords || accords.length < 2) {
    return 'linear-gradient(135deg, rgba(245,243,240,1) 0%, rgba(255,255,255,1) 100%)'
  }

  const sorted = [...accords].sort((a, b) => b.strength - a.strength)
  const c1 = hexToRgba(sorted[0].color, 0.07)
  const c2 = hexToRgba(sorted[1].color, 0.04)

  return `linear-gradient(135deg, ${c1} 0%, ${c2} 50%, rgba(255,255,255,1) 100%)`
}

/**
 * Get a colored drop-shadow from the dominant accord
 */
export function getBottleShadowColor(accords) {
  if (!accords || accords.length === 0) return 'rgba(0,0,0,0.1)'
  const sorted = [...accords].sort((a, b) => b.strength - a.strength)
  return hexToRgba(sorted[0].color, 0.18)
}

/**
 * Get category display info with icon
 */
export function getCategoryDisplay(category) {
  switch (category) {
    case 'men':    return { label: 'For Him', icon: '♦' }
    case 'women':  return { label: 'For Her', icon: '◇' }
    default:       return { label: 'Unisex', icon: '○' }
  }
}

/**
 * Get scent family badge styles
 */
export function getScentFamilyStyles(product) {
  const accent = getAccentColor(product)
  return {
    borderColor: hexToRgba(accent.replace('#', ''), 0.35).replace('rgba', 'rgba'),
    color: accent,
    backgroundColor: hexToRgba(accent.replace('#', ''), 0.06).replace('rgba', 'rgba'),
  }
}

// Re-export for convenience
export { SCENT_FAMILY_COLORS, hexToRgba }
