import {Link} from 'react-router';

// Monochrome brand icons (stroke/fill via currentColor so the hover invert
// works). TikTok isn't in lucide, so both are inline SVGs for consistency.
const InstagramIcon = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const TikTokIcon = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
  </svg>
);

export const SOCIALS = [
  {label: 'Instagram', href: 'https://instagram.com/almasscent', icon: InstagramIcon},
  {label: 'TikTok', href: 'https://www.tiktok.com/@almasscent', icon: TikTokIcon},
];

export default function Footer() {
  return (
    <footer className="px-6 md:px-12 pt-20 pb-10 border-t border-black/[0.08]">
      {/* Footer grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-6 md:gap-10 mb-14">
        {/* Brand column */}
        <div className="col-span-2 md:col-span-1">
          <Link to="/" className="no-underline">
            <div className="font-serif text-[24px] font-light text-black mb-1">ALMAS</div>
            <div className="text-[14px] mb-4" style={{fontFamily: 'serif'}}>الماس</div>
          </Link>
          <p className="text-[13px] text-warm-gray leading-[1.7] max-w-[280px]">
            Luxury-inspired fragrances, meticulously crafted to capture the essence of the world&apos;s most coveted scents.
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
          {['VISA', 'MC', 'AMEX', 'APPLE'].map((name) => (
            <span
              key={name}
              className="w-10 h-[26px] border border-stone-dark rounded-[3px] flex items-center justify-center text-[8px] text-warm-gray font-sans tracking-[0.05em]"
            >
              {name}
            </span>
          ))}
        </div>

        {/* Social links — monochrome brand icons, invert on hover */}
        <div className="flex gap-3.5 order-2 md:order-3">
          {SOCIALS.map((social) => (
            <a
              key={social.label}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={social.label}
              className="w-[34px] h-[34px] border border-stone-dark rounded-full flex items-center justify-center text-black no-underline transition-all duration-300 hover:bg-black hover:text-white hover:border-black"
            >
              {social.icon}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
