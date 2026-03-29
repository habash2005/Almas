import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import { useToast } from '../context/ToastContext'
import AccordBar from './AccordBar'
import ScentSilhouette from './ScentSilhouette'
import { useProductImage } from '../hooks/useProductImage'
import {
  getDominantGradient,
  getAccentColor,
  getBottleShadowColor,
  getCategoryDisplay,
  getScentFamilyStyles,
} from '../utils/scentTheme'

export default function ProductCard({ product }) {
  const [selectedSize, setSelectedSize] = useState('50ml')
  const { addToCart, setIsCartOpen } = useCart()
  const { toggleWishlist, isInWishlist } = useWishlist()
  const { addToast } = useToast()
  const { src, hasImage, handleError } = useProductImage(product)

  const wishlisted = isInWishlist(product.id)
  const price = product.prices[selectedSize]
  const sizes = Object.keys(product.prices)

  const category = getCategoryDisplay(product.category)
  const accentColor = getAccentColor(product)
  const scentStyles = getScentFamilyStyles(product)

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
      wishlisted
        ? `${product.name} removed from wishlist`
        : `${product.name} added to wishlist`,
      wishlisted ? 'info' : 'success'
    )
  }

  const handleSizeClick = (e, size) => {
    e.preventDefault()
    e.stopPropagation()
    setSelectedSize(size)
  }

  return (
    <Link to={`/product/${product.id}`} className="group cursor-pointer no-underline block">
      {/* Product display card */}
      <div
        className="product-card-hover bg-white relative overflow-hidden rounded-sm"
        style={{ background: getDominantGradient(product.accords) }}
      >
        {/* 2px accent line at top */}
        <div
          className="h-[2px] w-full"
          style={{ backgroundColor: accentColor }}
        />

        {/* Main content area */}
        <div className="flex items-start p-4 pb-2">
          {/* Left: Bottle image or silhouette */}
          <div className="w-[50%] relative">
            {hasImage ? (
              <img
                src={src}
                alt={product.name}
                onError={handleError}
                className="w-full h-auto object-contain transition-transform duration-500 group-hover:scale-105"
                style={{
                  filter: `drop-shadow(0 8px 20px ${getBottleShadowColor(product.accords)})`,
                }}
              />
            ) : (
              <div className="w-full aspect-[3/4]">
                <ScentSilhouette
                  accords={product.accords}
                  scentFamily={product.scentFamily}
                />
              </div>
            )}
          </div>

          {/* Right: Accords */}
          <div className="w-[50%] pt-4 pl-3">
            <AccordBar accords={product.accords || []} size="default" />
          </div>
        </div>

        {/* Badge */}
        {product.badge && (
          <span className="absolute top-5 left-3 font-sans text-[9px] tracking-[0.12em] uppercase bg-black text-white px-2.5 py-[5px] z-[5]">
            {product.badge}
          </span>
        )}

        {/* Wishlist heart */}
        <button
          onClick={handleWishlistToggle}
          className="absolute top-5 right-3 w-[30px] h-[30px] rounded-full bg-white/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-sm z-[5]"
          aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart
            size={13}
            strokeWidth={1.5}
            className={wishlisted ? 'fill-black text-black' : 'text-black'}
          />
        </button>

        {/* Quick Add bar — slides up on hover */}
        <button
          onClick={handleQuickAdd}
          className="absolute bottom-0 left-0 right-0 bg-black text-white text-center py-2.5 font-sans text-[10px] tracking-[0.12em] uppercase translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out z-[5]"
        >
          Quick Add
        </button>
      </div>

      {/* Product info below card */}
      <div className="pt-3 flex flex-col gap-1">
        {/* Category */}
        <span className="font-sans text-[10px] tracking-[0.12em] uppercase text-warm-gray">
          {category.icon} {category.label}
        </span>

        {/* Product name */}
        <span className="font-serif text-[15px] font-medium text-black line-clamp-1">
          {product.name}
        </span>

        {/* Inspired by */}
        <span className="font-sans text-[11px] text-warm-gray italic">
          Inspired by {product.inspiredBy}
        </span>

        {/* Scent family badge */}
        <div className="flex items-center gap-2 mt-0.5">
          <span
            className="px-2 py-0.5 text-[9px] tracking-[0.1em] uppercase rounded-sm border"
            style={scentStyles}
          >
            {product.scentFamily}
          </span>
        </div>

        {/* Price + size selector */}
        <div className="flex justify-between items-center mt-2">
          <span className="font-serif text-lg font-semibold text-black">
            ${price}
          </span>
          <div className="flex gap-1.5">
            {sizes.map((size) => (
              <button
                key={size}
                onClick={(e) => handleSizeClick(e, size)}
                className={`font-sans text-[10px] px-2.5 py-1 border tracking-[0.05em] transition-all duration-200
                  ${
                    selectedSize === size
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
