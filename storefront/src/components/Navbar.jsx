import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, User, Heart, ShoppingBag, Menu, X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import SearchDropdown from './SearchDropdown';

export default function Navbar() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { cartCount, setIsCartOpen } = useCart();
  const { wishlistCount } = useWishlist();

  const navLinkClass =
    'font-sans text-[11px] font-normal tracking-[0.15em] uppercase text-black relative transition-opacity duration-300 hover:opacity-70 group';
  const navLinkUnderline =
    'absolute bottom-[-4px] left-0 w-0 h-px bg-black transition-all duration-300 group-hover:w-full';

  return (
    <nav className="glass-nav sticky top-0 z-[100] border-b border-black/[0.04] transition-all duration-400">
      <div className="flex items-center justify-between px-6 md:px-12 py-5">
        {/* Left nav links (desktop) */}
        <div className="hidden md:flex items-center gap-8">
          <Link to="/shop" className={navLinkClass}>
            Shop
            <span className={navLinkUnderline} />
          </Link>
          <Link to="/shop/men" className={navLinkClass}>
            For Him
            <span className={navLinkUnderline} />
          </Link>
          <Link to="/shop/women" className={navLinkClass}>
            For Her
            <span className={navLinkUnderline} />
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden text-black"
          onClick={() => setMobileMenuOpen(true)}
          aria-label="Open menu"
        >
          <Menu size={22} strokeWidth={1.5} />
        </button>

        {/* Center logo */}
        <Link
          to="/"
          className="font-serif text-[22px] sm:text-[28px] font-light tracking-[0.08em] text-black flex flex-col items-center leading-none no-underline"
        >
          ALMAS
          <span className="text-[16px] mt-0.5" style={{ fontFamily: 'serif' }}>
            الماس
          </span>
        </Link>

        {/* Right nav links + icons (desktop) */}
        <div className="hidden md:flex items-center gap-8">
          <Link to="/our-story" className={navLinkClass}>
            Our Story
            <span className={navLinkUnderline} />
          </Link>
          <Link to="/subscribe" className={navLinkClass}>
            Subscribe
            <span className={navLinkUnderline} />
          </Link>
          <div className="flex items-center gap-5">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="text-black transition-opacity duration-300 hover:opacity-50"
              aria-label="Search"
            >
              <Search size={18} strokeWidth={1.5} />
            </button>
            <Link
              to="/account"
              className="text-black transition-opacity duration-300 hover:opacity-50"
              aria-label="Account"
            >
              <User size={18} strokeWidth={1.5} />
            </Link>
            <Link
              to="/wishlist"
              className="relative text-black transition-opacity duration-300 hover:opacity-50"
              aria-label="Wishlist"
            >
              <Heart size={18} strokeWidth={1.5} />
              {wishlistCount > 0 && (
                <span className="absolute -top-1.5 -right-2 w-4 h-4 bg-black text-white rounded-full text-[9px] font-sans flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative text-black transition-opacity duration-300 hover:opacity-50"
              aria-label="Cart"
            >
              <ShoppingBag size={18} strokeWidth={1.5} />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-2 w-4 h-4 bg-black text-white rounded-full text-[9px] font-sans flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile icons (just cart + search) */}
        <div className="flex md:hidden items-center gap-4">
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="text-black transition-opacity duration-300 hover:opacity-50"
            aria-label="Search"
          >
            <Search size={18} strokeWidth={1.5} />
          </button>
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative text-black transition-opacity duration-300 hover:opacity-50"
            aria-label="Cart"
          >
            <ShoppingBag size={18} strokeWidth={1.5} />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-2 w-4 h-4 bg-black text-white rounded-full text-[9px] font-sans flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Search dropdown */}
      <SearchDropdown isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[150] md:hidden">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div
            className="absolute top-0 left-0 w-[min(288px,90vw)] h-full bg-white p-8 flex flex-col gap-8"
            style={{ animation: 'slideInLeft 0.3s ease forwards' }}
          >
            <div className="flex items-center justify-between">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="font-serif text-[22px] font-light tracking-[0.08em] text-black no-underline"
              >
                ALMAS
              </Link>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="text-black"
                aria-label="Close menu"
              >
                <X size={20} strokeWidth={1.5} />
              </button>
            </div>
            <div className="flex flex-col gap-5">
              <Link
                to="/shop"
                onClick={() => setMobileMenuOpen(false)}
                className={navLinkClass}
              >
                Shop
              </Link>
              <Link
                to="/shop/men"
                onClick={() => setMobileMenuOpen(false)}
                className={navLinkClass}
              >
                For Him
              </Link>
              <Link
                to="/shop/women"
                onClick={() => setMobileMenuOpen(false)}
                className={navLinkClass}
              >
                For Her
              </Link>
              <Link
                to="/our-story"
                onClick={() => setMobileMenuOpen(false)}
                className={navLinkClass}
              >
                Our Story
              </Link>
              <Link
                to="/subscribe"
                onClick={() => setMobileMenuOpen(false)}
                className={navLinkClass}
              >
                Subscribe
              </Link>
              <Link
                to="/wishlist"
                onClick={() => setMobileMenuOpen(false)}
                className={navLinkClass}
              >
                Wishlist
                {wishlistCount > 0 && (
                  <span className="ml-2 text-[10px] text-warm-gray">({wishlistCount})</span>
                )}
              </Link>
              <Link
                to="/account"
                onClick={() => setMobileMenuOpen(false)}
                className={navLinkClass}
              >
                Account
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
