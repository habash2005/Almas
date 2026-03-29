import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X, Plus, Minus, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';

const FREE_SHIPPING_THRESHOLD = 100;

export default function CartDrawer() {
  const {
    cartItems,
    cartTotal,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateQuantity,
  } = useCart();

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isCartOpen]);

  // Close on Escape
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') setIsCartOpen(false);
    };
    if (isCartOpen) {
      document.addEventListener('keydown', handleEsc);
    }
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isCartOpen, setIsCartOpen]);

  if (!isCartOpen) return null;

  const shippingProgress = Math.min((cartTotal / FREE_SHIPPING_THRESHOLD) * 100, 100);
  const amountToFreeShipping = FREE_SHIPPING_THRESHOLD - cartTotal;

  return (
    <div className="fixed inset-0 z-[150]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30 transition-opacity duration-300"
        onClick={() => setIsCartOpen(false)}
      />

      {/* Drawer */}
      <div
        className="absolute top-0 right-0 h-full w-full sm:max-w-md bg-white flex flex-col shadow-2xl"
        style={{ animation: 'slideInRight 0.35s ease forwards' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-black/[0.06]">
          <h2 className="font-sans text-[11px] tracking-[0.15em] uppercase font-medium">
            Your Bag ({cartItems.length})
          </h2>
          <button
            onClick={() => setIsCartOpen(false)}
            className="text-black hover:opacity-50 transition-opacity"
            aria-label="Close cart"
          >
            <X size={18} strokeWidth={1.5} />
          </button>
        </div>

        {/* Shipping progress */}
        <div className="px-6 py-4 bg-light-gray">
          {cartTotal >= FREE_SHIPPING_THRESHOLD ? (
            <p className="text-[12px] text-black font-sans text-center">
              You've unlocked <span className="font-medium">free shipping!</span>
            </p>
          ) : (
            <p className="text-[12px] text-warm-gray font-sans text-center">
              Add <span className="text-black font-medium">${amountToFreeShipping.toFixed(2)}</span> more for free shipping
            </p>
          )}
          <div className="mt-2 h-[3px] bg-stone-dark/40 rounded-full overflow-hidden">
            <div
              className="h-full bg-black rounded-full transition-all duration-500 ease-out"
              style={{ width: `${shippingProgress}%` }}
            />
          </div>
        </div>

        {/* Cart items */}
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full px-6 text-center">
              <ShoppingBag size={40} strokeWidth={1} className="text-stone-dark mb-4" />
              <p className="font-serif text-[20px] text-black mb-2">Your bag is empty</p>
              <p className="text-[13px] text-warm-gray mb-6">
                Discover our collection of luxury-inspired fragrances.
              </p>
              <Link
                to="/shop"
                onClick={() => setIsCartOpen(false)}
                className="font-sans text-[11px] tracking-[0.15em] uppercase text-white bg-black px-8 py-3.5 no-underline transition-opacity hover:opacity-80"
              >
                Shop Now
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-black/[0.06]">
              {cartItems.map(item => (
                <div key={`${item.id}-${item.size}`} className="flex gap-4 px-6 py-5">
                  {/* Product thumbnail */}
                  <div className="w-20 h-24 bg-light-gray flex items-center justify-center flex-shrink-0">
                    <span className="font-serif text-[11px] text-stone-dark text-center leading-tight">
                      ALMAS<br />الماس
                    </span>
                  </div>

                  {/* Product details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <p className="font-serif text-[15px] text-black">{item.name}</p>
                        <p className="text-[11px] text-warm-gray italic font-sans mt-0.5">
                          {item.inspiredBy && `Inspired by ${item.inspiredBy}`}
                        </p>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id, item.size)}
                        className="text-warm-gray hover:text-black transition-colors flex-shrink-0 mt-0.5"
                        aria-label="Remove item"
                      >
                        <X size={14} strokeWidth={1.5} />
                      </button>
                    </div>

                    <p className="text-[10px] tracking-[0.1em] uppercase text-warm-gray font-sans mt-2">
                      {item.size}
                    </p>

                    <div className="flex items-center justify-between mt-3">
                      {/* Quantity controls */}
                      <div className="flex items-center border border-black/[0.12]">
                        <button
                          onClick={() => updateQuantity(item.id, item.size, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center text-black hover:bg-light-gray transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus size={12} strokeWidth={1.5} />
                        </button>
                        <span className="w-8 h-8 flex items-center justify-center text-[12px] font-sans text-black border-x border-black/[0.12]">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.size, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center text-black hover:bg-light-gray transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus size={12} strokeWidth={1.5} />
                        </button>
                      </div>

                      <span className="font-sans text-[14px] text-black">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer with subtotal + checkout */}
        {cartItems.length > 0 && (
          <div className="border-t border-black/[0.06] px-6 py-5">
            <div className="flex items-center justify-between mb-4">
              <span className="font-sans text-[11px] tracking-[0.15em] uppercase text-warm-gray">
                Subtotal
              </span>
              <span className="font-sans text-[16px] text-black">
                ${cartTotal.toFixed(2)}
              </span>
            </div>
            <p className="text-[11px] text-warm-gray font-sans mb-4">
              Shipping & taxes calculated at checkout
            </p>
            <Link
              to="/checkout"
              onClick={() => setIsCartOpen(false)}
              className="block w-full bg-black text-white text-center py-4 font-sans text-[11px] tracking-[0.15em] uppercase no-underline transition-opacity hover:opacity-80"
            >
              Checkout
            </Link>
            <div className="text-center mt-3">
              <Link
                to="/cart"
                onClick={() => setIsCartOpen(false)}
                className="inline-block font-sans text-[11px] tracking-[0.15em] uppercase text-black no-underline border-b border-black pb-1 transition-opacity hover:opacity-50"
              >
                View Full Cart
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
