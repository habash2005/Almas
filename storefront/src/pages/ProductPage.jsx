import { useState, useEffect, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Droplets, Heart as HeartIcon, Wind, Clock, Sun } from 'lucide-react'
import products from '../data/products'
import ProductCard from '../components/ProductCard'
import AccordBar from '../components/AccordBar'
import ScentRadar from '../components/ScentRadar'
import ScentSilhouette from '../components/ScentSilhouette'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import { useToast } from '../context/ToastContext'
import { useProductImage } from '../hooks/useProductImage'
import { getDominantGradient, getAccentColor, getBottleShadowColor, getCategoryDisplay, getScentFamilyStyles, hexToRgba } from '../utils/scentTheme'

/* ── Helpers ── */
const STARS = [1, 2, 3, 4, 5]

function StarRating({ rating, size = 14, interactive = false, onChange }) {
  const [hovered, setHovered] = useState(0)

  return (
    <div className="flex gap-0.5">
      {STARS.map(star => (
        <button
          key={star}
          type={interactive ? 'button' : undefined}
          disabled={!interactive}
          onClick={() => interactive && onChange?.(star)}
          onMouseEnter={() => interactive && setHovered(star)}
          onMouseLeave={() => interactive && setHovered(0)}
          className={`${interactive ? 'cursor-pointer' : 'cursor-default'} disabled:cursor-default`}
        >
          <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill={(hovered || rating) >= star ? '#0A0A0A' : 'none'}
            stroke="#0A0A0A"
            strokeWidth="1.5"
          >
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        </button>
      ))}
    </div>
  )
}


function Accordion({ title, defaultOpen = false, children }) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className="border-b border-stone-dark/30">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center py-5 text-left"
      >
        <span className="font-sans text-[11px] tracking-[0.15em] uppercase font-medium">
          {title}
        </span>
        <svg
          className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${
          isOpen ? 'max-h-[800px] opacity-100 pb-6' : 'max-h-0 opacity-0'
        }`}
      >
        {children}
      </div>
    </div>
  )
}

/* ── Performance Metric Components ── */
function LongevityBar({ longevity }) {
  const match = longevity.match(/(\d+)/)
  const hours = match ? parseInt(match[1]) : 6
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 12 }, (_, i) => (
        <div key={i} className={`w-2 h-4 rounded-[1px] ${i < hours ? 'bg-black' : 'bg-stone/30'}`} />
      ))}
    </div>
  )
}

function SillageBar({ sillage }) {
  const levels = { 'Soft': 1, 'Moderate': 2, 'Moderate-Strong': 3, 'Strong': 4 }
  const level = levels[sillage] || 2
  return (
    <div className="flex items-end gap-0.5">
      {[1,2,3,4].map(i => (
        <div key={i} className={`w-2 rounded-[1px] ${i <= level ? 'bg-black' : 'bg-stone/30'}`} style={{ height: `${8 + i * 4}px` }} />
      ))}
    </div>
  )
}

/* ── Review Helpers ── */
function getStoredReviews(productId) {
  try {
    const data = localStorage.getItem(`almas-reviews-${productId}`)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

function storeReviews(productId, reviews) {
  localStorage.setItem(`almas-reviews-${productId}`, JSON.stringify(reviews))
}

const DEFAULT_REVIEWS = [
  {
    id: 'default-1',
    name: 'Sarah M.',
    rating: 5,
    text: 'Absolutely stunning fragrance. The longevity is incredible and I receive compliments every time I wear it. Worth every penny.',
    date: '2026-03-15',
  },
  {
    id: 'default-2',
    name: 'Ahmed K.',
    rating: 4,
    text: 'Very close to the original designer fragrance at a fraction of the price. Great projection and the scent evolves beautifully throughout the day.',
    date: '2026-03-10',
  },
  {
    id: 'default-3',
    name: 'Jessica L.',
    rating: 5,
    text: 'This has become my signature scent. The quality is outstanding and the subscription service makes it so convenient.',
    date: '2026-02-28',
  },
]

/* ── Main Component ── */
export default function ProductPage() {
  const { id } = useParams()
  const { addToCart } = useCart()
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist()
  const { showToast } = useToast()

  const product = products.find(p => String(p.id) === String(id))

  const [selectedSize, setSelectedSize] = useState('50ml')
  const [isSubscription, setIsSubscription] = useState(false)
  const [reviewSort, setReviewSort] = useState('newest')
  const [reviews, setReviews] = useState([])
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [reviewName, setReviewName] = useState('')
  const [reviewRating, setReviewRating] = useState(0)
  const [reviewText, setReviewText] = useState('')

  useEffect(() => {
    if (product) {
      const stored = getStoredReviews(product.id)
      setReviews(stored.length > 0 ? stored : DEFAULT_REVIEWS)
    }
  }, [product?.id])

  const wishlisted = product ? isInWishlist(product.id) : false

  const relatedProducts = useMemo(() => {
    if (!product) return []
    return products
      .filter(p => p.category === product.category && p.id !== product.id)
      .slice(0, 4)
  }, [product])

  if (!product) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-serif text-3xl font-light mb-4">Product Not Found</h1>
          <p className="text-warm-gray text-sm mb-8">
            The fragrance you are looking for does not exist.
          </p>
          <Link
            to="/shop"
            className="inline-block px-8 py-3 bg-black text-white text-[11px] tracking-[0.15em] uppercase font-sans hover:bg-black/80 transition-colors"
          >
            Back to Shop
          </Link>
        </div>
      </div>
    )
  }

  const currentPrice = product.prices[selectedSize] || product.prices['50ml']
  const subscriptionPrice = Math.round(currentPrice * 0.85 * 100) / 100
  const displayPrice = isSubscription ? subscriptionPrice : currentPrice

  // Themed values
  const accentColor = getAccentColor(product)
  const categoryInfo = getCategoryDisplay(product.category)
  const scentBadgeStyles = getScentFamilyStyles(product)
  const bottleShadow = getBottleShadowColor(product.accords)

  // Ratings calculation
  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '0.0'

  const ratingDistribution = STARS.map(star => ({
    star,
    count: reviews.filter(r => r.rating === star).length,
    pct: reviews.length > 0
      ? Math.round((reviews.filter(r => r.rating === star).length / reviews.length) * 100)
      : 0,
  })).reverse()

  const sortedReviews = useMemo(() => {
    const sorted = [...reviews]
    switch (reviewSort) {
      case 'highest':
        sorted.sort((a, b) => b.rating - a.rating)
        break
      case 'lowest':
        sorted.sort((a, b) => a.rating - b.rating)
        break
      default: // newest
        sorted.sort((a, b) => new Date(b.date) - new Date(a.date))
        break
    }
    return sorted
  }, [reviews, reviewSort])

  const handleAddToCart = () => {
    addToCart(product, selectedSize, isSubscription)
    showToast(`${product.name} added to bag`, 'success')
  }

  const handleWishlist = () => {
    if (wishlisted) {
      removeFromWishlist(product.id)
      showToast('Removed from wishlist', 'info')
    } else {
      addToWishlist(product)
      showToast('Added to wishlist', 'success')
    }
  }

  const handleSubmitReview = (e) => {
    e.preventDefault()
    if (!reviewName.trim() || !reviewText.trim() || reviewRating === 0) {
      showToast('Please fill in all fields and select a rating', 'error')
      return
    }

    const newReview = {
      id: `user-${Date.now()}`,
      name: reviewName.trim(),
      rating: reviewRating,
      text: reviewText.trim(),
      date: new Date().toISOString().split('T')[0],
    }

    const updatedReviews = [newReview, ...reviews]
    setReviews(updatedReviews)
    storeReviews(product.id, updatedReviews)
    setReviewName('')
    setReviewRating(0)
    setReviewText('')
    setShowReviewForm(false)
    showToast('Review submitted successfully', 'success')
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="px-6 md:px-12 py-4 border-b border-stone-dark/20">
        <div className="max-w-7xl mx-auto flex items-center gap-2 text-[11px] tracking-[0.1em] uppercase font-sans text-warm-gray">
          <Link to="/" className="hover:text-black transition-colors">Home</Link>
          <span>/</span>
          <Link to="/shop" className="hover:text-black transition-colors">Shop</Link>
          <span>/</span>
          <Link to={`/shop/${product.category}`} className="hover:text-black transition-colors">
            {categoryInfo.label}
          </Link>
          <span>/</span>
          <span className="text-black">{product.name}</span>
        </div>
      </div>

      {/* Product Hero: Two-Column Layout — themed background */}
      <section
        className="px-6 md:px-12 py-12 md:py-16"
        style={{ background: `linear-gradient(180deg, ${hexToRgba(getAccentColor(product), 0.06)} 0%, transparent 50%)` }}
      >
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          {/* Left: Product Display */}
          <div className="sticky top-24">
            {/* Main product card */}
            <div className="bg-white rounded-sm border border-stone/20 overflow-hidden">
              {/* Top area: Bottle left, Notes right */}
              <div className="flex items-start p-8">
                {/* Bottle with themed shadow */}
                <div className="w-[50%] relative pr-4">
                  <ProductBottleImage product={product} bottleShadow={bottleShadow} />
                </div>

                {/* Notes pills — right side */}
                <div className="w-[50%] pt-6 pl-4">
                  <AccordBar accords={product.accords || []} size="large" />
                </div>
              </div>

              {/* Inspired By row — bottom */}
              <div className="flex items-center gap-6 px-8 py-5 border-t border-stone/20">
                <div className="flex items-baseline gap-1.5">
                  <span className="font-serif text-[16px] italic text-warm-gray">Inspired by:</span>
                  <span className="font-serif text-[20px] font-bold text-black">{product.inspiredBy}</span>
                </div>
                <div className="ml-auto text-right">
                  <div className="text-[13px] font-bold text-black">Designer Scent</div>
                  <div className="text-[11px] text-warm-gray">Similar vibe & DNA</div>
                </div>
              </div>

              {/* Badge */}
              {product.badge && (
                <span className="absolute top-6 left-6 bg-black text-white font-sans text-[10px] tracking-[0.12em] uppercase px-3 py-1.5 z-[5]">
                  {product.badge}
                </span>
              )}
            </div>

            {/* Fragrance Pyramid */}
            <div className="bg-light-gray rounded-sm p-6 mt-4">
              <h3 className="text-[11px] tracking-[0.2em] uppercase text-warm-gray font-medium mb-6">
                Fragrance Pyramid
              </h3>

              {/* Top Notes - narrowest */}
              <div className="max-w-[65%] mx-auto mb-4">
                <div className="flex items-center gap-2 mb-2" style={{ borderLeft: `3px solid ${accentColor}30`, paddingLeft: '12px' }}>
                  <Droplets size={14} className="text-warm-gray" />
                  <span className="text-[10px] tracking-[0.1em] uppercase text-warm-gray font-medium">Top Notes</span>
                </div>
                <div className="flex flex-wrap gap-1.5 pl-7">
                  {product.notes?.top?.map((note, i) => (
                    <span key={i} className="px-2.5 py-1 text-[12px] bg-white border border-stone/30 rounded-sm">{note}</span>
                  ))}
                </div>
              </div>

              {/* Heart Notes - medium width */}
              <div className="max-w-[82%] mx-auto mb-4">
                <div className="flex items-center gap-2 mb-2" style={{ borderLeft: `3px solid ${accentColor}45`, paddingLeft: '12px' }}>
                  <HeartIcon size={14} className="text-warm-gray" />
                  <span className="text-[10px] tracking-[0.1em] uppercase text-warm-gray font-medium">Heart Notes</span>
                </div>
                <div className="flex flex-wrap gap-1.5 pl-7">
                  {product.notes?.heart?.map((note, i) => (
                    <span key={i} className="px-2.5 py-1 text-[12px] bg-white border border-stone/30 rounded-sm">{note}</span>
                  ))}
                </div>
              </div>

              {/* Base Notes - full width */}
              <div className="max-w-full mb-4">
                <div className="flex items-center gap-2 mb-2" style={{ borderLeft: `3px solid ${accentColor}65`, paddingLeft: '12px' }}>
                  <Wind size={14} className="text-warm-gray" />
                  <span className="text-[10px] tracking-[0.1em] uppercase text-warm-gray font-medium">Base Notes</span>
                </div>
                <div className="flex flex-wrap gap-1.5 pl-7">
                  {product.notes?.base?.map((note, i) => (
                    <span key={i} className="px-2.5 py-1 text-[12px] bg-white border border-stone/30 rounded-sm">{note}</span>
                  ))}
                </div>
              </div>

              <div className="h-px bg-stone-dark/30 my-5" />

              {/* Performance with visual gauges */}
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center">
                  <Clock size={18} className="mx-auto mb-1.5 text-warm-gray" />
                  <div className="text-[9px] tracking-[0.1em] uppercase text-warm-gray mb-1.5">Longevity</div>
                  <div className="flex justify-center mb-1">
                    <LongevityBar longevity={product.longevity || '6 hours'} />
                  </div>
                  <div className="text-[11px] text-warm-gray">{product.longevity}</div>
                </div>
                <div className="text-center">
                  <Wind size={18} className="mx-auto mb-1.5 text-warm-gray" />
                  <div className="text-[9px] tracking-[0.1em] uppercase text-warm-gray mb-1.5">Sillage</div>
                  <div className="flex justify-center mb-1">
                    <SillageBar sillage={product.sillage || 'Moderate'} />
                  </div>
                  <div className="text-[11px] text-warm-gray">{product.sillage}</div>
                </div>
                <div className="text-center">
                  <Sun size={18} className="mx-auto mb-1.5 text-warm-gray" />
                  <div className="text-[9px] tracking-[0.1em] uppercase text-warm-gray mb-0.5">Best For</div>
                  <div className="text-[13px] font-medium text-black">{product.bestFor?.slice(0, 2).join(', ')}</div>
                </div>
                <div className="text-center">
                  <Droplets size={18} className="mx-auto mb-1.5 text-warm-gray" />
                  <div className="text-[9px] tracking-[0.1em] uppercase text-warm-gray mb-0.5">Family</div>
                  <div className="text-[13px] font-medium text-black">{product.scentFamily}</div>
                </div>
              </div>
            </div>

            {/* Scent Radar Chart */}
            <div className="bg-light-gray rounded-sm p-6 mt-4">
              <h3 className="text-[11px] tracking-[0.2em] uppercase text-warm-gray font-medium mb-4">
                Scent Profile
              </h3>
              <ScentRadar accords={product.accords} product={product} />
            </div>
          </div>

          {/* Right: Product Info */}
          <div>
            {/* Category with icon */}
            <p className="font-sans text-[11px] tracking-[0.2em] uppercase text-warm-gray mb-3">
              <span className="mr-1.5">{categoryInfo.icon}</span>
              {categoryInfo.label}
            </p>

            {/* Name */}
            <h1 className="font-serif text-[clamp(28px,3.5vw,44px)] font-light leading-tight mb-2">
              {product.name}
            </h1>

            {/* Inspired By */}
            <p className="font-sans text-sm text-warm-gray italic mb-4">
              Inspired by {product.inspiredBy}
            </p>

            {/* Rating */}
            <div className="flex items-center gap-3 mb-6">
              <StarRating rating={Math.round(parseFloat(avgRating))} />
              <span className="font-sans text-sm text-warm-gray">
                {avgRating} ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
              </span>
            </div>

            {/* Description */}
            <p className="font-sans text-sm text-warm-gray leading-relaxed mb-8">
              {product.description}
            </p>

            {/* Size Selector */}
            <div className="mb-6">
              <p className="font-sans text-[11px] tracking-[0.15em] uppercase mb-3">Size</p>
              <div className="flex gap-3">
                {Object.keys(product.prices).map(size => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-6 py-2.5 text-[12px] tracking-[0.05em] font-sans transition-all duration-200 ${
                      selectedSize === size
                        ? 'border-2 border-black text-black'
                        : 'border border-stone-dark text-warm-gray hover:border-black'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Price */}
            <div className="mb-6">
              <div className="flex items-baseline gap-3">
                <span className="font-sans text-2xl font-light">${displayPrice}</span>
                {isSubscription && (
                  <span className="font-sans text-sm text-warm-gray line-through">
                    ${currentPrice}
                  </span>
                )}
              </div>
            </div>

            {/* Subscribe & Save Toggle */}
            <div className="mb-8 border border-stone-dark/50 divide-y divide-stone-dark/30">
              {/* One-time */}
              <label className={`flex items-center gap-3 px-5 py-4 cursor-pointer transition-colors ${!isSubscription ? 'bg-light-gray' : ''}`}>
                <input
                  type="radio"
                  name="purchase-type"
                  checked={!isSubscription}
                  onChange={() => setIsSubscription(false)}
                  className="accent-black w-4 h-4"
                />
                <div>
                  <span className="font-sans text-sm font-medium">One-time purchase</span>
                  <span className="font-sans text-xs text-warm-gray ml-2">${currentPrice}</span>
                </div>
              </label>
              {/* Subscription */}
              <label className={`flex items-center gap-3 px-5 py-4 cursor-pointer transition-colors ${isSubscription ? 'bg-light-gray' : ''}`}>
                <input
                  type="radio"
                  name="purchase-type"
                  checked={isSubscription}
                  onChange={() => setIsSubscription(true)}
                  className="accent-black w-4 h-4"
                />
                <div>
                  <span className="font-sans text-sm font-medium">Subscribe & Save 15%</span>
                  <span className="font-sans text-xs text-warm-gray ml-2">${subscriptionPrice}</span>
                  <p className="font-sans text-[11px] text-warm-gray mt-0.5">
                    Auto-refill every 3 months. Cancel anytime.
                  </p>
                </div>
              </label>
            </div>

            {/* Add to Bag */}
            <button
              onClick={handleAddToCart}
              className="w-full bg-black text-white font-sans text-[11px] tracking-[0.15em] uppercase py-4 hover:bg-black/85 transition-colors mb-3"
            >
              Add to Bag — ${displayPrice}
            </button>

            {/* Wishlist */}
            <button
              onClick={handleWishlist}
              className="w-full border border-stone-dark text-black font-sans text-[11px] tracking-[0.15em] uppercase py-3.5 hover:border-black transition-colors flex items-center justify-center gap-2"
            >
              <svg
                width="16" height="16" viewBox="0 0 24 24"
                fill={wishlisted ? '#0A0A0A' : 'none'}
                stroke="#0A0A0A" strokeWidth="1.5"
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              {wishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
            </button>

            {/* Scent Family Badge — themed */}
            <div className="mt-6 flex items-center gap-2">
              <span
                className="px-3 py-1.5 text-[10px] tracking-[0.1em] uppercase rounded-sm border"
                style={{
                  borderColor: scentBadgeStyles.borderColor,
                  color: scentBadgeStyles.color,
                  backgroundColor: scentBadgeStyles.backgroundColor,
                }}
              >
                {product.scentFamily}
              </span>
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
              <span className="text-xs text-green-600">In Stock</span>
            </div>

            {/* Accordion Sections */}
            <div className="mt-8">
              {/* Shipping */}
              <Accordion title="Shipping & Returns" defaultOpen>
                <div className="font-sans text-sm text-warm-gray leading-relaxed space-y-3">
                  <p>Free standard shipping on all orders over $100. Orders typically ship within 1-2 business days.</p>
                  <p>Standard shipping: 5-7 business days ($5.95)</p>
                  <p>Express shipping: 2-3 business days ($12.95)</p>
                  <p>We accept returns within 30 days of purchase for unopened products.</p>
                </div>
              </Accordion>

              {/* Subscription Info */}
              <Accordion title="About Subscriptions">
                <div className="font-sans text-sm text-warm-gray leading-relaxed space-y-3">
                  <p>Subscribe and receive a fresh bottle every 3 months at 15% off the retail price.</p>
                  <p>Free shipping on all subscription orders, regardless of total.</p>
                  <p>Skip, swap your fragrance, or cancel anytime from your account page.</p>
                  <p>Subscribers get exclusive early access to all new releases.</p>
                </div>
              </Accordion>
            </div>
          </div>
        </div>
      </section>

      {/* Scent Journey Section */}
      <section className="px-6 md:px-12 py-16 border-t border-stone/20">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-serif text-[clamp(24px,3vw,36px)] font-light text-center mb-12">The Scent Journey</h2>

          <div className="space-y-10">
            {/* Opens With */}
            <div className="flex gap-6">
              <div className="flex flex-col items-center">
                <span className="text-xl" style={{ color: accentColor }}>&#9650;</span>
                <div className="w-px flex-1 bg-stone/30 mt-2" />
              </div>
              <div>
                <p className="text-[11px] tracking-[0.15em] uppercase text-warm-gray mb-2">Opens With</p>
                <p className="font-serif text-lg">{product.notes?.top?.join(' & ')}</p>
                <p className="text-sm text-warm-gray mt-1">The first 15 minutes on skin.</p>
              </div>
            </div>

            {/* Evolves Into */}
            <div className="flex gap-6">
              <div className="flex flex-col items-center">
                <span className="text-xl" style={{ color: accentColor }}>&#9670;</span>
                <div className="w-px flex-1 bg-stone/30 mt-2" />
              </div>
              <div>
                <p className="text-[11px] tracking-[0.15em] uppercase text-warm-gray mb-2">Evolves Into</p>
                <p className="font-serif text-lg">{product.notes?.heart?.join(' & ')}</p>
                <p className="text-sm text-warm-gray mt-1">The heart reveals itself after 30 minutes.</p>
              </div>
            </div>

            {/* Settles Into */}
            <div className="flex gap-6">
              <div className="flex flex-col items-center">
                <span className="text-xl" style={{ color: accentColor }}>&#9679;</span>
              </div>
              <div>
                <p className="text-[11px] tracking-[0.15em] uppercase text-warm-gray mb-2">Settles Into</p>
                <p className="font-serif text-lg">{product.notes?.base?.join(' & ')}</p>
                <p className="text-sm text-warm-gray mt-1">The lasting signature, 2+ hours on skin.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="px-6 md:px-12 py-16 bg-light-gray">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-12">
            <div>
              <p className="font-sans text-[11px] tracking-[0.2em] uppercase text-warm-gray mb-3">
                Customer Reviews
              </p>
              <h2 className="font-serif text-[clamp(28px,3vw,40px)] font-light">
                What Others Say
              </h2>
            </div>
            <button
              onClick={() => setShowReviewForm(!showReviewForm)}
              className="mt-4 md:mt-0 px-8 py-3 border border-black text-black text-[11px] tracking-[0.15em] uppercase font-sans hover:bg-black hover:text-white transition-colors"
            >
              Write a Review
            </button>
          </div>

          {/* Rating Summary */}
          <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-12 mb-12">
            {/* Average */}
            <div className="text-center md:text-left">
              <p className="font-serif text-6xl font-light mb-2">{avgRating}</p>
              <StarRating rating={Math.round(parseFloat(avgRating))} size={16} />
              <p className="font-sans text-sm text-warm-gray mt-2">
                Based on {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
              </p>
            </div>

            {/* Distribution */}
            <div className="space-y-2">
              {ratingDistribution.map(({ star, count, pct }) => (
                <div key={star} className="flex items-center gap-3">
                  <span className="font-sans text-xs text-warm-gray w-12">{star} star{star !== 1 ? 's' : ''}</span>
                  <div className="flex-1 h-2 bg-stone rounded-full overflow-hidden">
                    <div
                      className="h-full bg-black rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="font-sans text-xs text-warm-gray w-8 text-right">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Write Review Form */}
          {showReviewForm && (
            <form
              onSubmit={handleSubmitReview}
              className="bg-white p-8 mb-12 border border-stone-dark/30"
            >
              <h3 className="font-sans text-[11px] tracking-[0.15em] uppercase font-medium mb-6">
                Write Your Review
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block font-sans text-[11px] tracking-[0.1em] uppercase text-warm-gray mb-2">
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={reviewName}
                    onChange={(e) => setReviewName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full border border-stone-dark px-4 py-3 font-sans text-sm focus:outline-none focus:border-black transition-colors bg-transparent"
                  />
                </div>
                <div>
                  <label className="block font-sans text-[11px] tracking-[0.1em] uppercase text-warm-gray mb-2">
                    Rating
                  </label>
                  <StarRating rating={reviewRating} size={20} interactive onChange={setReviewRating} />
                </div>
              </div>
              <div className="mb-6">
                <label className="block font-sans text-[11px] tracking-[0.1em] uppercase text-warm-gray mb-2">
                  Your Review
                </label>
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  rows={4}
                  placeholder="Share your experience with this fragrance..."
                  className="w-full border border-stone-dark px-4 py-3 font-sans text-sm focus:outline-none focus:border-black transition-colors bg-transparent resize-none"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="px-8 py-3 bg-black text-white text-[11px] tracking-[0.15em] uppercase font-sans hover:bg-black/85 transition-colors"
                >
                  Submit Review
                </button>
                <button
                  type="button"
                  onClick={() => setShowReviewForm(false)}
                  className="px-8 py-3 border border-stone-dark text-[11px] tracking-[0.15em] uppercase font-sans hover:border-black transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Sort Reviews */}
          <div className="flex justify-end mb-6">
            <div className="relative">
              <select
                value={reviewSort}
                onChange={(e) => setReviewSort(e.target.value)}
                className="appearance-none bg-transparent border border-stone-dark px-4 py-2.5 pr-8 text-[11px] tracking-[0.1em] uppercase font-sans cursor-pointer hover:border-black transition-colors focus:outline-none focus:border-black"
              >
                <option value="newest">Newest</option>
                <option value="highest">Highest Rated</option>
                <option value="lowest">Lowest Rated</option>
              </select>
              <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
          </div>

          {/* Review Cards */}
          <div className="space-y-4">
            {sortedReviews.map(review => (
              <div key={review.id} className="bg-white p-6 md:p-8 border border-stone-dark/20">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <StarRating rating={review.rating} size={13} />
                    <p className="font-sans text-[11px] tracking-[0.1em] uppercase text-warm-gray mt-2">
                      {review.name}
                    </p>
                  </div>
                  <span className="font-sans text-xs text-warm-gray">
                    {new Date(review.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>
                <p className="font-sans text-sm leading-relaxed text-black/80">
                  {review.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="px-6 md:px-12 py-16">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-end mb-12">
              <div>
                <p className="font-sans text-[11px] tracking-[0.2em] uppercase text-warm-gray mb-3">
                  You May Also Like
                </p>
                <h2 className="font-serif text-[clamp(28px,3vw,40px)] font-light">
                  Related Fragrances
                </h2>
              </div>
              <Link
                to={`/shop/${product.category}`}
                className="font-sans text-[11px] tracking-[0.15em] uppercase border-b border-black pb-1 hover:opacity-50 transition-opacity hidden md:block"
              >
                View All
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {relatedProducts.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}

/* ── Product Bottle Image sub-component ── */
function ProductBottleImage({ product, bottleShadow }) {
  const accords = product.accords || []
  const dominantColor = accords.length > 0
    ? accords.reduce((a, b) => a.strength > b.strength ? a : b).color
    : '#C4A882'

  const h = dominantColor.replace('#', '')
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

  return (
    <img
      src="/images/bottle-transparent.png"
      alt={product.name}
      className="w-full h-auto object-contain"
      style={{ filter: `drop-shadow(0 12px 30px ${bottleShadow}) sepia(0.4) hue-rotate(${Math.round(hue)}deg) saturate(0.8)` }}
    />
  )
}
