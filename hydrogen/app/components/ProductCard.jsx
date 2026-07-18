import {useState} from 'react';
import {Link} from 'react-router';
import {Heart, ShoppingBag} from 'lucide-react';
import {AddToCartButton} from '~/components/AddToCartButton';
import {useToast} from '~/components/ToastContext';
import {useWishlist} from '~/lib/wishlist';
import {toCartLine} from '~/lib/cart';

export default function ProductCard({product}) {
  const sizes = Object.keys(product.prices || {});
  const [selectedSize, setSelectedSize] = useState(sizes[0]);
  const {addToast} = useToast();
  const {toggleWishlist, isInWishlist} = useWishlist();

  const wishlisted = isInWishlist(product.id);
  const price = product.prices?.[selectedSize];
  const variant = product.variantBySize?.[selectedSize];
  const accords = (product.accords || []).slice(0, 5);

  // Derive hue rotation from dominant accord for liquid tint
  const dominantColor =
    accords.length > 0
      ? accords.reduce((a, b) => (a.strength > b.strength ? a : b)).color
      : '#C4A882';

  // Convert hex to hue angle for CSS hue-rotate
  const hexToHue = (hex) => {
    const h = hex.replace('#', '');
    const r = parseInt(h.substring(0, 2), 16) / 255;
    const g = parseInt(h.substring(2, 4), 16) / 255;
    const b = parseInt(h.substring(4, 6), 16) / 255;
    const max = Math.max(r, g, b),
      min = Math.min(r, g, b);
    let hue = 0;
    if (max !== min) {
      const d = max - min;
      if (max === r) hue = ((g - b) / d + (g < b ? 6 : 0)) * 60;
      else if (max === g) hue = ((b - r) / d + 2) * 60;
      else hue = ((r - g) / d + 4) * 60;
    }
    return Math.round(hue);
  };
  const hueRotation = hexToHue(dominantColor);

  // Accord bars need readable text: white on dark colors, near-black on light.
  const textOn = (hex) => {
    const h = hex.replace('#', '');
    const r = parseInt(h.substring(0, 2), 16);
    const g = parseInt(h.substring(2, 4), 16);
    const b = parseInt(h.substring(4, 6), 16);
    return 0.299 * r + 0.587 * g + 0.114 * b > 150 ? '#0A0A0A' : '#FFFFFF';
  };

  const categoryLabel =
    product.category === 'men'
      ? 'For Him'
      : product.category === 'women'
        ? 'For Her'
        : 'Unisex';

  const handleWishlistToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
    addToast(
      wishlisted ? 'Removed from wishlist' : 'Added to wishlist',
      wishlisted ? 'info' : 'success',
    );
  };

  const handleSizeClick = (e, size) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedSize(size);
  };

  const maxStrength = accords.length
    ? Math.max(...accords.map((a) => a.strength || 60))
    : 100;

  return (
    <Link
      to={`/products/${product.handle}`}
      className="group no-underline block bg-white border border-black/[0.05] shadow-[0_1px_10px_rgba(0,0,0,0.03)]"
    >
      {/* ━━━ IMAGE AREA: bottle left, accord bars right ━━━ */}
      <div className="relative overflow-hidden">
        <div className="aspect-[3/4] flex items-center">
          {/* Bottle */}
          <div className="w-[55%] h-full flex items-center justify-center p-5">
            <img
              src="/images/bottle-transparent.png"
              alt={product.name}
              className="h-[85%] w-auto object-contain transition-transform duration-700 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group-hover:scale-[1.06]"
              style={{filter: `sepia(0.4) hue-rotate(${hueRotation}deg) saturate(0.8)`}}
            />
          </div>

          {/* Accord bars — colored, name inside, width by strength */}
          <div className="w-[45%] flex flex-col gap-1.5 pr-4 items-end">
            {accords.map((a) => {
              const pct = 62 + Math.round(((a.strength || 60) / maxStrength) * 38);
              return (
                <div
                  key={a.name}
                  className="h-[30px] rounded-l-md rounded-br-md flex items-center justify-center"
                  style={{backgroundColor: a.color, width: `${pct}%`}}
                >
                  <span
                    className="font-sans text-[11px] font-medium lowercase tracking-[0.02em] px-2 truncate"
                    style={{color: textOn(a.color)}}
                  >
                    {a.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Badge */}
        {product.badge && (
          <span className="absolute top-4 left-4 text-[9px] tracking-[0.14em] uppercase bg-black text-white px-3 py-1 font-sans">
            {product.badge}
          </span>
        )}

        {/* Wishlist — top right, appears on hover */}
        <button
          onClick={handleWishlistToggle}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white flex items-center justify-center opacity-0 group-hover:opacity-100 [@media(hover:none)]:opacity-100 transition-all duration-300 shadow-[0_2px_12px_rgba(0,0,0,0.08)] z-[2]"
        >
          <Heart
            size={14}
            strokeWidth={1.5}
            className={`transition-colors duration-200 ${wishlisted ? 'fill-black text-black' : 'text-[#0A0A0A]'}`}
          />
        </button>
      </div>

      {/* ━━━ INSPIRED BY callout ━━━ */}
      {product.inspiredBy && (
        <div className="border-t border-b border-black/[0.06] px-5 py-3 flex items-center gap-3">
          <span className="w-[3px] self-stretch bg-[#C4A882] shrink-0" />
          <div className="min-w-0">
            <p className="text-[9px] tracking-[0.2em] uppercase text-[#C4A882] font-sans mb-0.5">
              Inspired By
            </p>
            <p className="text-[13px] font-semibold uppercase tracking-[0.02em] text-[#0A0A0A] font-sans truncate">
              {product.inspiredBy}
            </p>
          </div>
        </div>
      )}

      {/* ━━━ PRODUCT INFO ━━━ */}
      <div className="px-5 pt-4 pb-5">
        <p className="text-[10px] tracking-[0.2em] uppercase text-[#C4A882] font-sans mb-1.5">
          {categoryLabel}
        </p>

        <h3 className="font-serif text-[20px] font-normal text-[#0A0A0A] leading-snug line-clamp-1 mb-1">
          {product.name}
        </h3>

        {product.inspiredBy && (
          <p className="text-[13px] text-[#9A948D] font-sans mb-3 line-clamp-1">
            Inspired by {product.inspiredBy}
          </p>
        )}

        {/* Scent family chip + sizes */}
        <div className="flex items-center justify-between mb-4">
          {product.scentFamily ? (
            <span className="text-[10px] tracking-[0.12em] uppercase bg-[#F5F3F0] text-[#0A0A0A] px-2.5 py-1.5 font-sans">
              {product.scentFamily}
            </span>
          ) : (
            <span />
          )}
          <div className="flex gap-1">
            {sizes.map((size) => (
              <button
                key={size}
                onClick={(e) => handleSizeClick(e, size)}
                className={`text-[9px] px-2 py-[3px] font-sans tracking-[0.04em] transition-all duration-200 border ${
                  selectedSize === size
                    ? 'border-[#0A0A0A] bg-[#0A0A0A] text-white'
                    : 'border-[#D4CFC8] text-[#9A948D] hover:border-[#0A0A0A]'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* Price + Add to Bag */}
        <div className="flex items-center justify-between">
          <span className="font-serif text-[24px] text-[#0A0A0A]">
            {price != null ? `$${price}` : ''}
          </span>
          <AddToCartButton
            lines={variant?.availableForSale ? [toCartLine(variant, product)] : []}
            disabled={!variant?.availableForSale}
            onClick={() => {
              addToast(`${product.name} added to bag`, 'success');
            }}
            className={`inline-flex items-center gap-2 px-5 py-3 text-[10px] tracking-[0.14em] uppercase font-sans transition-colors ${
              variant?.availableForSale
                ? 'bg-[#0A0A0A] text-white hover:bg-black/85'
                : 'bg-[#9A948D] text-white cursor-not-allowed'
            }`}
          >
            <ShoppingBag size={13} strokeWidth={1.5} />
            {variant?.availableForSale ? 'Add to Bag' : 'Sold Out'}
          </AddToCartButton>
        </div>
      </div>
    </Link>
  );
}
