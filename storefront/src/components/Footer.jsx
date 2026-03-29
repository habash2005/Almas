import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="px-6 md:px-12 pt-20 pb-10 border-t border-black/[0.08]">
      {/* Footer grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-14">
        {/* Brand column */}
        <div className="col-span-2 md:col-span-1">
          <Link to="/" className="no-underline">
            <div className="font-serif text-[24px] font-light text-black mb-1">ALMAS</div>
            <div className="text-[14px] mb-4" style={{ fontFamily: 'serif' }}>الماس</div>
          </Link>
          <p className="text-[13px] text-warm-gray leading-[1.7] max-w-[280px]">
            Luxury-inspired fragrances, meticulously crafted to capture the essence of the world's most coveted scents.
          </p>
        </div>

        {/* Shop column */}
        <div>
          <h4 className="font-sans text-[11px] tracking-[0.15em] uppercase font-medium mb-[18px] text-black">
            Shop
          </h4>
          <ul className="flex flex-col gap-2.5">
            <li>
              <Link to="/shop" className="text-[13px] text-warm-gray no-underline transition-colors duration-300 hover:text-black">
                All Fragrances
              </Link>
            </li>
            <li>
              <Link to="/shop/men" className="text-[13px] text-warm-gray no-underline transition-colors duration-300 hover:text-black">
                For Him
              </Link>
            </li>
            <li>
              <Link to="/shop/women" className="text-[13px] text-warm-gray no-underline transition-colors duration-300 hover:text-black">
                For Her
              </Link>
            </li>
            <li>
              <Link to="/shop/unisex" className="text-[13px] text-warm-gray no-underline transition-colors duration-300 hover:text-black">
                Unisex
              </Link>
            </li>
            <li>
              <Link to="/shop?badge=Best+Seller" className="text-[13px] text-warm-gray no-underline transition-colors duration-300 hover:text-black">
                Best Sellers
              </Link>
            </li>
            <li>
              <Link to="/shop?badge=New" className="text-[13px] text-warm-gray no-underline transition-colors duration-300 hover:text-black">
                New Arrivals
              </Link>
            </li>
          </ul>
        </div>

        {/* Subscribe column */}
        <div>
          <h4 className="font-sans text-[11px] tracking-[0.15em] uppercase font-medium mb-[18px] text-black">
            Subscribe
          </h4>
          <ul className="flex flex-col gap-2.5">
            <li>
              <Link to="/subscribe" className="text-[13px] text-warm-gray no-underline transition-colors duration-300 hover:text-black">
                How It Works
              </Link>
            </li>
            <li>
              <Link to="/account" className="text-[13px] text-warm-gray no-underline transition-colors duration-300 hover:text-black">
                Manage Subscription
              </Link>
            </li>
            <li>
              <Link to="/subscribe" className="text-[13px] text-warm-gray no-underline transition-colors duration-300 hover:text-black">
                Gift a Subscription
              </Link>
            </li>
          </ul>
        </div>

        {/* Help column */}
        <div>
          <h4 className="font-sans text-[11px] tracking-[0.15em] uppercase font-medium mb-[18px] text-black">
            Help
          </h4>
          <ul className="flex flex-col gap-2.5">
            <li>
              <Link to="/faq" className="text-[13px] text-warm-gray no-underline transition-colors duration-300 hover:text-black">
                FAQ
              </Link>
            </li>
            <li>
              <Link to="/shipping" className="text-[13px] text-warm-gray no-underline transition-colors duration-300 hover:text-black">
                Shipping
              </Link>
            </li>
            <li>
              <Link to="/faq" className="text-[13px] text-warm-gray no-underline transition-colors duration-300 hover:text-black">
                Returns
              </Link>
            </li>
            <li>
              <Link to="/contact" className="text-[13px] text-warm-gray no-underline transition-colors duration-300 hover:text-black">
                Contact Us
              </Link>
            </li>
            <li>
              <Link to="/faq" className="text-[13px] text-warm-gray no-underline transition-colors duration-300 hover:text-black">
                Size Guide
              </Link>
            </li>
          </ul>
        </div>

        {/* Company column */}
        <div>
          <h4 className="font-sans text-[11px] tracking-[0.15em] uppercase font-medium mb-[18px] text-black">
            Company
          </h4>
          <ul className="flex flex-col gap-2.5">
            <li>
              <Link to="/our-story" className="text-[13px] text-warm-gray no-underline transition-colors duration-300 hover:text-black">
                Our Story
              </Link>
            </li>
            <li>
              <Link to="/privacy" className="text-[13px] text-warm-gray no-underline transition-colors duration-300 hover:text-black">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link to="/terms" className="text-[13px] text-warm-gray no-underline transition-colors duration-300 hover:text-black">
                Terms & Conditions
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* Footer bottom */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-7 border-t border-black/[0.06]">
        <span className="text-[12px] text-warm-gray order-3 md:order-1">
          &copy; 2026 ALMAS. All rights reserved.
        </span>

        {/* Payment icons */}
        <div className="flex gap-2 items-center order-1 md:order-2">
          {['VISA', 'MC', 'AMEX', 'APPLE'].map(name => (
            <span
              key={name}
              className="w-10 h-[26px] border border-stone-dark rounded-[3px] flex items-center justify-center text-[8px] text-warm-gray font-sans tracking-[0.05em]"
            >
              {name}
            </span>
          ))}
        </div>

        {/* Social links */}
        <div className="flex gap-3.5 order-2 md:order-3">
          {[
            { label: 'IG', href: 'https://instagram.com' },
            { label: 'TK', href: 'https://tiktok.com' },
            { label: 'FB', href: 'https://facebook.com' },
          ].map(social => (
            <a
              key={social.label}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              className="w-[34px] h-[34px] border border-stone-dark rounded-full flex items-center justify-center text-[12px] text-black font-sans no-underline transition-all duration-300 hover:bg-black hover:text-white hover:border-black"
            >
              {social.label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
