import { useState } from 'react'

/**
 * Smart image fallback chain for product images.
 * Tries: product.image → .png variant → gives up (renders ScentSilhouette)
 */
export function useProductImage(product) {
  const slug = product.name.toLowerCase().replace(/\s+/g, '-').replace(/[''é]/g, '')
  const pngPath = `/products/${slug}.png`

  const [src, setSrc] = useState(product.image || pngPath)
  const [hasImage, setHasImage] = useState(true)
  const [attempts, setAttempts] = useState(0)

  const handleError = () => {
    if (attempts === 0) {
      setSrc(pngPath)
      setAttempts(1)
    } else if (attempts === 1) {
      setSrc('/images/hero-bottle.png')
      setAttempts(2)
    } else {
      setHasImage(false)
    }
  }

  return { src, hasImage, handleError }
}
