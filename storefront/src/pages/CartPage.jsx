import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useToast } from '../context/ToastContext'
import { X, Minus, Plus, ShoppingBag, ArrowRight, Tag } from 'lucide-react'
import { products } from '../data/products'
import ProductCard from '../components/ProductCard'

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, clearCart, getCartTotal, getCartCount } = useCart()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [promoCode, setPromoCode] = useState('')
  const [promoApplied, setPromoApplied] = useState(false)
  const [promoDiscount, setPromoDiscount] = useState(0)

  const subtotal = getCartTotal()
  const shippingThreshold = 100
  const shippingCost = subtotal >= shippingThreshold ? 0 : 8.95
  const subscriptionSavings = cart
    .filter(item => item.isSubscription)
    .reduce((sum, item) => {
      const price = item.product.prices?.[item.size] || 0
      return sum + price * item.quantity * 0.15
    }, 0)
  const total = subtotal - promoDiscount + shippingCost
  const shippingProgress = Math.min((subtotal / shippingThreshold) * 100, 100)
  const amountToFreeShipping = Math.max(shippingThreshold - subtotal, 0)

  const upsellProducts = products
    .filter(p => !cart.some(item => item.product.id === p.id))
    .slice(0, 4)

  const handleApplyPromo = () => {
    if (promoCode.toLowerCase() === 'almas10') {
      setPromoApplied(true)
      setPromoDiscount(subtotal * 0.1)
      showToast('Promo code applied! 10% off your order.', 'success')
    } else {
      showToast('Invalid promo code. Please try again.', 'error')
    }
  }

  const handleRemovePromo = () => {
    setPromoCode('')
    setPromoApplied(false)
    setPromoDiscount(0)
    showToast('Promo code removed.', 'info')
  }

  if (cart.length === 0) {
    return (
      <section className="py-24 px-6 md:px-12">
        <div className="max-w-7xl mx-auto text-center py-20">
          <div className="w-20 h-20 mx-auto mb-8 rounded-full border border-stone-dark flex items-center justify-center">
            <ShoppingBag className="w-8 h-8 text-warm-gray" strokeWidth={1.2} />
          </div>
          <h1 className="font-serif text-4xl md:text-5xl font-light mb-4">Your Bag is Empty</h1>
          <p className="text-warm-gray text-sm max-w-md mx-auto mb-10 leading-relaxed">
            Discover our collection of luxury-inspired fragrances and find your signature scent.
          </p>
          <Link
            to="/shop"
            className="inline-flex items-center gap-3 bg-black text-white px-10 py-4 text-xs tracking-[0.15em] uppercase hover:bg-black/85 transition-all"
          >
            Continue Shopping
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 md:py-24 px-6 md:px-12">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-12">
          <h1 className="font-serif text-4xl md:text-5xl font-light mb-2">Your Bag</h1>
          <p className="text-warm-gray text-sm">
            {getCartCount()} {getCartCount() === 1 ? 'item' : 'items'}
          </p>
        </div>

        <div className="lg:grid lg:grid-cols-3 lg:gap-16">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            {/* Column Headers (Desktop) */}
            <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_auto] gap-4 pb-4 border-b border-stone-dark/40 mb-0">
              <span className="text-[11px] tracking-[0.15em] uppercase text-warm-gray">Product</span>
              <span className="text-[11px] tracking-[0.15em] uppercase text-warm-gray text-center">Quantity</span>
              <span className="text-[11px] tracking-[0.15em] uppercase text-warm-gray text-right">Total</span>
              <span className="w-8" />
            </div>

            {cart.map((item, index) => {
              const price = item.product.prices?.[item.size] || 0
              const lineTotal = item.isSubscription
                ? price * item.quantity * 0.85
                : price * item.quantity

              return (
                <div
                  key={`${item.product.id}-${item.size}-${item.isSubscription}`}
                  className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_auto] gap-4 md:gap-4 py-6 border-b border-stone-dark/30 items-center"
                >
                  {/* Product Info */}
                  <div className="flex gap-5">
                    <Link to={`/product/${item.product.id}`} className="shrink-0">
                      <div className="w-24 h-28 bg-light-gray flex items-center justify-center">
                        {item.product.image ? (
                          <img
                            src={item.product.image}
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="font-serif text-stone-dark text-sm">ALMAS</span>
                        )}
                      </div>
                    </Link>
                    <div className="flex flex-col justify-center gap-1">
                      <Link
                        to={`/product/${item.product.id}`}
                        className="font-serif text-lg hover:opacity-70 transition-opacity"
                      >
                        {item.product.name}
                      </Link>
                      {item.product.inspiredBy && (
                        <p className="text-xs text-warm-gray italic">
                          Inspired by {item.product.inspiredBy}
                        </p>
                      )}
                      <p className="text-xs text-warm-gray mt-0.5">{item.size}</p>
                      {item.isSubscription && (
                        <span className="inline-flex items-center gap-1.5 mt-1 text-[10px] tracking-[0.1em] uppercase bg-light-gray text-black px-2.5 py-1 w-fit">
                          <Tag className="w-3 h-3" />
                          Refill every 3 months — Save 15%
                        </span>
                      )}
                      <p className="text-sm mt-1 md:hidden">
                        ${price.toFixed(2)}
                        {item.isSubscription && (
                          <span className="text-warm-gray line-through ml-2 text-xs">
                            ${(price / 0.85).toFixed(2)}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center justify-start md:justify-center">
                    <div className="flex items-center border border-stone-dark/50">
                      <button
                        onClick={() =>
                          item.quantity > 1
                            ? updateQuantity(item.product.id, item.size, item.isSubscription, item.quantity - 1)
                            : null
                        }
                        className="w-9 h-9 flex items-center justify-center hover:bg-light-gray transition-colors disabled:opacity-30"
                        disabled={item.quantity <= 1}
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-10 text-center text-sm">{item.quantity}</span>
                      <button
                        onClick={() =>
                          updateQuantity(item.product.id, item.size, item.isSubscription, item.quantity + 1)
                        }
                        className="w-9 h-9 flex items-center justify-center hover:bg-light-gray transition-colors"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Line Total */}
                  <div className="hidden md:flex items-center justify-end">
                    <div className="text-right">
                      <p className="text-sm font-normal">${lineTotal.toFixed(2)}</p>
                      {item.isSubscription && (
                        <p className="text-xs text-warm-gray line-through">
                          ${(price * item.quantity).toFixed(2)}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Remove */}
                  <div className="hidden md:flex items-center justify-end">
                    <button
                      onClick={() => {
                        removeFromCart(item.product.id, item.size, item.isSubscription)
                        showToast(`${item.product.name} removed from bag.`, 'info')
                      }}
                      className="w-8 h-8 flex items-center justify-center hover:bg-light-gray rounded-full transition-colors"
                      aria-label={`Remove ${item.product.name}`}
                    >
                      <X className="w-4 h-4 text-warm-gray" />
                    </button>
                  </div>

                  {/* Mobile remove */}
                  <div className="flex md:hidden justify-between items-center">
                    <p className="text-sm font-normal">${lineTotal.toFixed(2)}</p>
                    <button
                      onClick={() => {
                        removeFromCart(item.product.id, item.size, item.isSubscription)
                        showToast(`${item.product.name} removed from bag.`, 'info')
                      }}
                      className="text-xs text-warm-gray underline hover:text-black transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )
            })}

            {/* Clear Cart */}
            <div className="mt-6 flex justify-between items-center">
              <Link
                to="/shop"
                className="text-xs tracking-[0.12em] uppercase text-black border-b border-black pb-0.5 hover:opacity-60 transition-opacity"
              >
                Continue Shopping
              </Link>
              <button
                onClick={() => {
                  clearCart()
                  showToast('Your bag has been cleared.', 'info')
                }}
                className="text-xs tracking-[0.12em] uppercase text-warm-gray hover:text-black transition-colors"
              >
                Clear Bag
              </button>
            </div>
          </div>

          {/* Cart Summary Sidebar */}
          <div className="mt-12 lg:mt-0">
            <div className="bg-light-gray p-8 sticky top-32">
              <h2 className="text-[11px] tracking-[0.15em] uppercase font-medium mb-8">
                Order Summary
              </h2>

              {/* Free Shipping Progress */}
              {subtotal < shippingThreshold && (
                <div className="mb-8 pb-8 border-b border-stone-dark/30">
                  <p className="text-xs text-warm-gray mb-3">
                    You're <span className="text-black font-medium">${amountToFreeShipping.toFixed(2)}</span> away from free shipping
                  </p>
                  <div className="w-full h-1 bg-stone-dark/30 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-black rounded-full transition-all duration-500"
                      style={{ width: `${shippingProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Summary Lines */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-warm-gray">Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>

                {subscriptionSavings > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-warm-gray">Subscription Savings</span>
                    <span className="text-green-700">-${subscriptionSavings.toFixed(2)}</span>
                  </div>
                )}

                {promoApplied && (
                  <div className="flex justify-between text-sm">
                    <span className="text-warm-gray">Promo Discount</span>
                    <span className="text-green-700">-${promoDiscount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between text-sm">
                  <span className="text-warm-gray">Shipping</span>
                  <span>{shippingCost === 0 ? 'Free' : `$${shippingCost.toFixed(2)}`}</span>
                </div>
              </div>

              {/* Promo Code */}
              <div className="mb-6 pb-6 border-t border-stone-dark/30 pt-6">
                {promoApplied ? (
                  <div className="flex items-center justify-between bg-white px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Tag className="w-3.5 h-3.5 text-warm-gray" />
                      <span className="text-sm">{promoCode.toUpperCase()}</span>
                    </div>
                    <button
                      onClick={handleRemovePromo}
                      className="text-xs text-warm-gray hover:text-black transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="flex border border-stone-dark/50">
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      placeholder="Promo code"
                      className="flex-1 px-4 py-3 bg-transparent text-sm outline-none placeholder:text-warm-gray/60"
                      onKeyDown={(e) => e.key === 'Enter' && handleApplyPromo()}
                    />
                    <button
                      onClick={handleApplyPromo}
                      disabled={!promoCode.trim()}
                      className="px-5 py-3 bg-black text-white text-[10px] tracking-[0.12em] uppercase hover:bg-black/85 transition-colors disabled:opacity-40"
                    >
                      Apply
                    </button>
                  </div>
                )}
              </div>

              {/* Total */}
              <div className="flex justify-between items-center pt-4 border-t border-black/10 mb-8">
                <span className="text-sm font-medium">Total</span>
                <span className="font-serif text-2xl">${total.toFixed(2)}</span>
              </div>

              {/* Checkout Button */}
              <button
                onClick={() => navigate('/checkout')}
                className="w-full bg-black text-white py-4 text-[11px] tracking-[0.15em] uppercase hover:bg-black/85 transition-all flex items-center justify-center gap-3"
              >
                Proceed to Checkout
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Trust signals */}
              <div className="mt-6 space-y-2 text-center">
                <p className="text-[10px] text-warm-gray tracking-wide uppercase">
                  Secure checkout &middot; Free returns &middot; Authentic fragrances
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Upsell Section */}
        {upsellProducts.length > 0 && (
          <div className="mt-24 pt-16 border-t border-stone-dark/30">
            <div className="flex justify-between items-end mb-12">
              <div>
                <h2 className="font-serif text-3xl md:text-4xl font-light">You Might Also Like</h2>
                <p className="text-sm text-warm-gray mt-2">Complete your collection</p>
              </div>
              <Link
                to="/shop"
                className="text-[11px] tracking-[0.15em] uppercase text-black border-b border-black pb-1 hover:opacity-60 transition-opacity hidden md:inline-block"
              >
                View All
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              {upsellProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
