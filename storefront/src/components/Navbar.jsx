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
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          {/* Panel */}
          <div
            className="absolute top-0 left-0 w-[min(340px,85vw)] h-full bg-white flex flex-col overflow-y-auto"
            style={{ animation: 'slideInLeft 0.3s ease forwards' }}
          >
            {/* Header — Logo + Close */}
            <div className="flex items-center justify-between px-8 py-6 border-b border-[#ECEAE7]">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="font-serif text-[24px] font-light tracking-[0.08em] text-black no-underline flex flex-col items-start leading-none"
              >
                ALMAS
                <span className="text-[14px] mt-0.5" style={{ fontFamily: 'serif' }}>الماس</span>
              </Link>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="text-black w-10 h-10 flex items-center justify-center"
                aria-label="Close menu"
              >
                <X size={20} strokeWidth={1.5} />
              </button>
            </div>

            {/* Primary nav — large serif links */}
            <div className="flex flex-col gap-5 px-8 py-8">
              {[
                { to: '/shop', label: 'Shop' },
                { to: '/shop/men', label: 'For Him' },
                { to: '/shop/women', label: 'For Her' },
                { to: '/shop/unisex', label: 'Unisex' },
              ].map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className="font-serif text-[28px] font-light text-[#0A0A0A] no-underline transition-opacity hover:opacity-60"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Divider */}
            <div className="h-px bg-[#ECEAE7] mx-8" />

            {/* Secondary nav */}
            <div className="flex flex-col gap-4 px-8 py-6">
              {[
                { to: '/our-story', label: 'Our Story' },
                { to: '/subscribe', label: 'Subscribe' },
                { to: '/scent-finder', label: 'Scent Finder' },
                { to: '/contact', label: 'Contact' },
              ].map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className="font-sans text-[13px] tracking-[0.1em] uppercase text-[#9A948D] no-underline transition-colors hover:text-[#0A0A0A]"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Divider */}
            <div className="h-px bg-[#ECEAE7] mx-8" />

            {/* Utility links */}
            <div className="flex flex-col gap-4 px-8 py-6">
              <Link
                to="/account"
                onClick={() => setMobileMenuOpen(false)}
                className="font-sans text-[13px] text-[#0A0A0A] no-underline flex items-center gap-3"
              >
                <User size={16} strokeWidth={1.5} />
                Account
              </Link>
              <Link
                to="/wishlist"
                onClick={() => setMobileMenuOpen(false)}
                className="font-sans text-[13px] text-[#0A0A0A] no-underline flex items-center gap-3"
              >
                <Heart size={16} strokeWidth={1.5} />
                Wishlist
                {wishlistCount > 0 && (
                  <span className="ml-auto text-[11px] text-[#9A948D]">{wishlistCount}</span>
                )}
              </Link>
            </div>

            {/* Bottom — socials + copyright */}
            <div className="mt-auto px-8 py-6 border-t border-[#ECEAE7]">
              <div className="flex gap-6 mb-4">
                <span className="text-[11px] tracking-[0.1em] uppercase text-[#9A948D]">Instagram</span>
                <span className="text-[11px] tracking-[0.1em] uppercase text-[#9A948D]">TikTok</span>
              </div>
              <p className="text-[10px] text-[#D4CFC8]">&copy; 2026 ALMAS. All rights reserved.</p>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
