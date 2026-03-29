import { Link } from 'react-router-dom'
import { useWishlist } from '../context/WishlistContext'
import { Heart, ArrowRight } from 'lucide-react'
import ProductCard from '../components/ProductCard'

export default function WishlistPage() {
  const { wishlist } = useWishlist()

  return (
    <section className="py-16 md:py-24 px-6 md:px-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-end mb-12">
          <div>
            <h1 className="font-serif text-4xl md:text-5xl font-light mb-2">Wishlist</h1>
            <p className="text-warm-gray text-sm">
              {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'} saved
            </p>
          </div>
          {wishlist.length > 0 && (
            <Link
              to="/shop"
              className="text-[11px] tracking-[0.15em] uppercase text-black border-b border-black pb-1 hover:opacity-60 transition-opacity hidden md:inline-block"
            >
              Continue Shopping
            </Link>
          )}
        </div>

        {wishlist.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-20 h-20 mx-auto mb-8 rounded-full border border-stone-dark flex items-center justify-center">
              <Heart className="w-8 h-8 text-warm-gray" strokeWidth={1.2} />
            </div>
            <h2 className="font-serif text-3xl font-light mb-3">Your Wishlist is Empty</h2>
            <p className="text-warm-gray text-sm max-w-md mx-auto mb-10 leading-relaxed">
              Save your favorite fragrances to revisit them later. Click the heart icon on any product to add it here.
            </p>
            <Link
              to="/shop"
              className="inline-flex items-center gap-3 bg-black text-white px-10 py-4 text-xs tracking-[0.15em] uppercase hover:bg-black/85 transition-all"
            >
              Explore Collection
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {wishlist.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
