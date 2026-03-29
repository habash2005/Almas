import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import { useToast } from '../context/ToastContext'
import {
  getAccentColor,
  getCategoryDisplay,
  getScentFamilyStyles,
} from '../utils/scentTheme'

function strengthLabel(s) {
  if (s >= 85) return 'Strong'
  if (s >= 65) return 'Medium'
  return 'Light'
}

export default function ProductCard({ product }) {
  const [selectedSize, setSelectedSize] = useState('50ml')
  const { addToCart, setIsCartOpen } = useCart()
  const { toggleWishlist, isInWishlist } = useWishlist()
  const { addToast } = useToast()

  const wishlisted = isInWishlist(product.id)
  const price = product.prices[selectedSize]
  const sizes = Object.keys(product.prices)
  const category = getCategoryDisplay(product.category)
  const scentStyles = getScentFamilyStyles(product)
  const accords = (product.accords || []).slice(0, 5)

  const handleQuickAdd = (e) => {
    e.preventDefault()
    e.stopPropagation()
    addToCart(product, selectedSize)
    setIsCartOpen(true)
    addToast(`${product.name} (${selectedSize}) added to bag`, 'success')
  }

  const handleWishlistToggle = (e) => {
    e.preventDefault()
    e.stopPropagation()
    toggleWishlist(product)
    addToast(
      wishlisted ? `${product.name} removed from wishlist` : `${product.name} added to wishlist`,
      wishlisted ? 'info' : 'success'
    )
  }

  const handleSizeClick = (e, size) => {
    e.preventDefault()
    e.stopPropagation()
    setSelectedSize(size)
  }

  return (
    <Link to={`/product/${product.id}`} className="group cursor-pointer no-underline block product-card-hover">
      {/* ─── CARD ─── */}
      <div className="bg-white rounded overflow-hidden">

        {/* ─── TOP: Bottle + Notes side by side ─── */}
        <div className="flex">

          {/* Bottle — left ~50% */}
          <div className="w-[50%] bg-[#f7f6f4] flex items-center justify-center p-5 relative">
            <img
              src="/images/bottle.png"
              alt={product.name}
              className="w-full h-auto object-contain max-h-[260px] transition-transform duration-500 group-hover:scale-105"
            />
            {/* Badge */}
            {product.badge && (
              <span className="absolute top-3 left-3 font-sans text-[8px] tracking-[0.12em] uppercase bg-black text-white px-2 py-1 z-[2]">
                {product.badge}
              </span>
            )}
            {/* Wishlist */}
            <button
              onClick={handleWishlistToggle}
              className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-sm z-[2]"
            >
              <Heart size={12} strokeWidth={1.5} className={wishlisted ? 'fill-black text-black' : 'text-black'} />
            </button>
          </div>

          {/* Notes — right ~50% */}
          <div className="w-[50%] p-5 flex flex-col justify-center">
            {/* Header */}
            <p className="text-[10px] tracking-[0.15em] uppercase text-warm-gray mb-4">
              <span className="border-b border-warm-gray/30 pb-0.5">Notes</span>
            </p>

            {/* Accord rows */}
            <div className="flex flex-col gap-3.5">
              {accords.map((accord) => (
                <div key={accord.name} className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-[12px] font-medium text-black leading-tight">{accord.name}</div>
                    <div className="text-[9px] text-warm-gray leading-tight">{strengthLabel(accord.strength)}</div>
                  </div>
                  <div
                    className="w-[52px] h-[16px] rounded-full shrink-0"
                    style={{ backgroundColor: accord.color }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ─── BOTTOM: Inspired By ─── */}
        <div className="border-t border-[#eee] px-5 py-3 flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <span className="text-[9px] italic text-warm-gray">Inspired by: </span>
            <span className="text-[12px] font-bold text-black">{product.inspiredBy}</span>
          </div>
          <div className="text-right shrink-0">
            <div className="text-[9px] font-semibold text-black leading-tight">Designer Scent</div>
            <div className="text-[7px] text-warm-gray leading-tight">Similar vibe & DNA</div>
          </div>
        </div>

        {/* Quick Add — slides up on hover */}
        <div className="relative">
          <button
            onClick={handleQuickAdd}
            className="w-full bg-black text-white text-center py-2.5 font-sans text-[10px] tracking-[0.12em] uppercase max-h-0 overflow-hidden group-hover:max-h-[40px] transition-all duration-300 ease-out"
          >
            Quick Add — ${price}
          </button>
        </div>
      </div>

      {/* ─── INFO BELOW CARD ─── */}
      <div className="pt-3 flex flex-col gap-0.5">
        <span className="font-sans text-[10px] tracking-[0.12em] uppercase text-warm-gray">
          {category.icon} {category.label}
        </span>
        <span className="font-serif text-[15px] font-medium text-black line-clamp-1">
          {product.name}
        </span>
        <div className="flex items-center justify-between mt-1.5">
          <span className="font-serif text-[17px] font-semibold text-black">${price}</span>
          <div className="flex gap-1">
            {sizes.map((size) => (
              <button
                key={size}
                onClick={(e) => handleSizeClick(e, size)}
                className={`font-sans text-[9px] px-2 py-0.5 border tracking-[0.05em] transition-all duration-200
                  ${selectedSize === size
                    ? 'border-black bg-black text-white'
                    : 'border-stone-dark text-warm-gray hover:border-black'
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
