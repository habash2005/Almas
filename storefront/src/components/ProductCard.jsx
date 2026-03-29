import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart, ShoppingBag } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import { useToast } from '../context/ToastContext'

export default function ProductCard({ product }) {
  const [selectedSize, setSelectedSize] = useState('50ml')
  const { addToCart, setIsCartOpen } = useCart()
  const { toggleWishlist, isInWishlist } = useWishlist()
  const { addToast } = useToast()

  const wishlisted = isInWishlist(product.id)
  const price = product.prices[selectedSize]
  const sizes = Object.keys(product.prices)
  const accords = (product.accords || []).slice(0, 5)

  // Derive hue rotation from dominant accord for liquid tint
  const dominantColor = accords.length > 0
    ? accords.reduce((a, b) => a.strength > b.strength ? a : b).color
    : '#C4A882'

  // Convert hex to hue angle for CSS hue-rotate
  const hexToHue = (hex) => {
    const h = hex.replace('#', '')
    const r = parseInt(h.substring(0, 2), 16) / 255
    const g = parseInt(h.substring(2, 4), 16) / 255
    const b = parseInt(h.substring(4, 6), 16) / 255
    const max = Math.max(r, g, b), min = Math.min(r, g, b)
    let hue = 0
    if (max !== min) {
      const d = max - min
      if (max === r) hue = ((g - b) / d + (g < b ? 6 : 0)) * 60
      else if (max === g) hue = ((b - r) / d + 2) * 60
      else hue = ((r - g) / d + 4) * 60
    }
    return Math.round(hue)
  }
  const hueRotation = hexToHue(dominantColor)

  const categoryLabel =
    product.category === 'men' ? 'For Him'
    : product.category === 'women' ? 'For Her'
    : 'Unisex'

  const handleQuickAdd = (e) => {
    e.preventDefault()
    e.stopPropagation()
    addToCart(product, selectedSize)
    setIsCartOpen(true)
    addToast(`${product.name} added to bag`, 'success')
  }

  const handleWishlistToggle = (e) => {
    e.preventDefault()
    e.stopPropagation()
    toggleWishlist(product)
    addToast(
      wishlisted ? 'Removed from wishlist' : 'Added to wishlist',
      wishlisted ? 'info' : 'success'
    )
  }

  const handleSizeClick = (e, size) => {
    e.preventDefault()
    e.stopPropagation()
    setSelectedSize(size)
  }

  return (
    <Link to={`/product/${product.id}`} className="group no-underline block">

      {/* ━━━ IMAGE AREA ━━━ */}
      <div className="relative overflow-hidden mb-4">

        {/* Bottle left + Notes right */}
        <div className="aspect-[3/4] flex">
          {/* Bottle — left, takes up most of the space */}
          <div className="w-[65%] flex items-center justify-center p-4 pl-3">
            <img
              src="/images/bottle-transparent.png"
              alt={product.name}
              className="h-full w-auto object-contain transition-transform duration-700 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group-hover:scale-[1.06]"
              style={{ filter: `sepia(0.4) hue-rotate(${hueRotation}deg) saturate(0.8)` }}
            />
          </div>
          {/* Notes — compact on the right */}
          <div className="w-[35%] flex flex-col justify-center pr-3 py-6">
            <p className="text-[8px] tracking-[0.12em] uppercase text-[#9A948D] mb-2.5">
              <span className="border-b border-[#9A948D]/30 pb-0.5">Notes</span>
            </p>
            <div className="flex flex-col gap-2">
              {accords.map((a) => (
                <div key={a.name} className="flex items-center gap-1.5">
                  <span className="text-[9px] text-[#0A0A0A] leading-tight flex-1 truncate">{a.name}</span>
                  <div className="w-[28px] h-[10px] rounded-full shrink-0" style={{ backgroundColor: a.color }} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Accord color strip — thin bar of product's signature colors at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-[3px] flex">
          {accords.map((a) => (
            <div key={a.name} className="flex-1" style={{ backgroundColor: a.color }} />
          ))}
        </div>

        {/* Badge */}
        {product.badge && (
          <span className="absolute top-4 left-4 text-[9px] tracking-[0.14em] uppercase bg-black text-white px-3 py-1 font-sans">
            {product.badge}
          </span>
        )}

        {/* Wishlist — top right, appears on hover */}
        <button
          onClick={handleWishlistToggle}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-[0_2px_12px_rgba(0,0,0,0.08)] z-[2]"
        >
          <Heart
            size={14}
            strokeWidth={1.5}
            className={`transition-colors duration-200 ${wishlisted ? 'fill-black text-black' : 'text-[#0A0A0A]'}`}
          />
        </button>

        {/* Quick Add — slides up from bottom on hover */}
        <button
          onClick={handleQuickAdd}
          className="absolute bottom-[3px] left-0 right-0 bg-[#0A0A0A] text-white py-3 flex items-center justify-center gap-2 text-[10px] tracking-[0.14em] uppercase font-sans translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out z-[2]"
        >
          <ShoppingBag size={13} strokeWidth={1.5} />
          Add to Bag — ${price}
        </button>
      </div>

      {/* ━━━ PRODUCT INFO ━━━ */}
      <div className="space-y-2">

        {/* Category */}
        <p className="text-[9px] tracking-[0.2em] uppercase text-[#9A948D] font-sans">
          {categoryLabel}
        </p>

        {/* Name */}
        <h3 className="font-serif text-[17px] font-normal text-[#0A0A0A] leading-snug line-clamp-1">
          {product.name}
        </h3>

        {/* Inspired by */}
        <p className="text-[11px] text-[#9A948D] font-sans">
          Inspired by <span className="text-[#0A0A0A] font-medium">{product.inspiredBy}</span>
        </p>

        {/* Accords — compact row of colored dots with names */}
        <div className="flex flex-wrap gap-x-3 gap-y-1 pt-1">
          {accords.map((a) => (
            <span key={a.name} className="flex items-center gap-1.5">
              <span className="w-[8px] h-[8px] rounded-full shrink-0" style={{ backgroundColor: a.color }} />
              <span className="text-[10px] text-[#9A948D] font-sans">{a.name}</span>
            </span>
          ))}
        </div>

        {/* Fragrance Notes — Top / Heart / Base */}
        {product.notes && (
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#ECEAE7]">
            <div>
              <p className="text-[8px] tracking-[0.12em] uppercase text-[#9A948D] mb-1">Top</p>
              <p className="text-[10px] text-[#0A0A0A] leading-[1.4]">
                {product.notes.top?.slice(0, 2).join(', ')}
              </p>
            </div>
            <div>
              <p className="text-[8px] tracking-[0.12em] uppercase text-[#9A948D] mb-1">Heart</p>
              <p className="text-[10px] text-[#0A0A0A] leading-[1.4]">
                {product.notes.heart?.slice(0, 2).join(', ')}
              </p>
            </div>
            <div>
              <p className="text-[8px] tracking-[0.12em] uppercase text-[#9A948D] mb-1">Base</p>
              <p className="text-[10px] text-[#0A0A0A] leading-[1.4]">
                {product.notes.base?.slice(0, 2).join(', ')}
              </p>
            </div>
          </div>
        )}

        {/* Price + Sizes */}
        <div className="flex items-center justify-between pt-2 border-t border-[#ECEAE7]">
          <span className="font-serif text-[18px] text-[#0A0A0A]">${price}</span>
          <div className="flex gap-1">
            {sizes.map((size) => (
              <button
                key={size}
                onClick={(e) => handleSizeClick(e, size)}
                className={`text-[9px] px-2.5 py-[3px] font-sans tracking-[0.04em] transition-all duration-200 border ${
                  selectedSize === size
                    ? 'border-[#0A0A0A] bg-[#0A0A0A] text-white'
                    : 'border-[#D4CFC8] text-[#9A948D] hover:border-[#0A0A0A]'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      </div>
    </Link>
  )
}
