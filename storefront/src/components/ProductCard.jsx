import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import { useToast } from '../context/ToastContext'
import AccordBar from './AccordBar'

export default function ProductCard({ product }) {
  const [selectedSize, setSelectedSize] = useState('50ml')
  const { addToCart, setIsCartOpen } = useCart()
  const { toggleWishlist, isInWishlist } = useWishlist()
  const { addToast } = useToast()

  const wishlisted = isInWishlist(product.id)
  const price = product.prices[selectedSize]
  const sizes = Object.keys(product.prices)

  const categoryLabel =
    product.category === 'men' ? 'For Him'
    : product.category === 'women' ? 'For Her'
    : 'Unisex'

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
    <Link to={`/product/${product.id}`} className="group cursor-pointer no-underline block">
      {/* Product display card — matching brand imagery */}
      <div className="bg-white relative overflow-hidden border border-stone/30 rounded-sm">
        {/* Main content area */}
        <div className="flex items-start p-4 pb-2">
          {/* Left: Bottle with ingredients */}
          <div className="w-[50%] relative">
            <img
              src="/images/hero-bottle.png"
              alt={product.name}
              className="w-full h-auto object-contain transition-transform duration-500 group-hover:scale-105"
            />
          </div>

          {/* Right: Notes */}
          <div className="w-[50%] pt-4 pl-3">
            <AccordBar accords={(product.accords || []).slice(0, 6)} size="default" />
          </div>
        </div>

        {/* Inspired By bottom row */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-stone/20">
          <div className="flex items-baseline gap-1 min-w-0">
            <span className="text-[9px] italic text-warm-gray shrink-0">Inspired by:</span>
            <span className="text-[11px] font-bold text-black truncate">{product.inspiredBy}</span>
          </div>
          <div className="text-right shrink-0 ml-2">
            <div className="text-[9px] font-semibold text-black leading-tight">Designer Scent</div>
            <div className="text-[7px] text-warm-gray leading-tight">Similar vibe & DNA</div>
          </div>
        </div>

        {/* Badge */}
        {product.badge && (
          <span className="absolute top-3 left-3 font-sans text-[9px] tracking-[0.12em] uppercase bg-black text-white px-2.5 py-[5px] z-[5]">
            {product.badge}
          </span>
        )}

        {/* Wishlist heart */}
        <button
          onClick={handleWishlistToggle}
          className="absolute top-3 right-3 w-[30px] h-[30px] rounded-full bg-white/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-sm z-[5]"
          aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart size={13} strokeWidth={1.5} className={wishlisted ? 'fill-black text-black' : 'text-black'} />
        </button>

        {/* Quick Add bar */}
        <button
          onClick={handleQuickAdd}
          className="absolute bottom-[42px] left-0 right-0 bg-black text-white text-center py-2.5 font-sans text-[10px] tracking-[0.12em] uppercase translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out z-[5]"
        >
          Quick Add
        </button>
      </div>

      {/* Product info below card */}
      <div className="pt-3 flex flex-col gap-1">
        <span className="font-sans text-[10px] tracking-[0.12em] uppercase text-warm-gray">
          {categoryLabel}
        </span>
        <span className="font-serif text-[15px] font-medium text-black line-clamp-1">
          {product.name}
        </span>
        <span className="font-sans text-[11px] text-warm-gray italic">
          Inspired by {product.inspiredBy}
        </span>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="px-2 py-0.5 bg-light-gray text-[9px] tracking-[0.1em] uppercase text-warm-gray rounded-sm">
            {product.scentFamily}
          </span>
        </div>
        <div className="flex justify-between items-center mt-2">
          <span className="font-serif text-lg font-semibold text-black">${price}</span>
          <div className="flex gap-1.5">
            {sizes.map(size => (
              <button
                key={size}
                onClick={(e) => handleSizeClick(e, size)}
                className={`font-sans text-[10px] px-2.5 py-1 border tracking-[0.05em] transition-all duration-200
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
