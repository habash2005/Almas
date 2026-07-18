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
  const accords = [...(product.accords || [])]
    .sort((a, b) => (b.strength || 0) - (a.strength || 0))
    .slice(0, 5);

  // Liquid tint follows the STRONGEST accord (accords are sorted desc above)
  const dominantColor = accords[0]?.color ?? '#C4A882';


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

  return (
    <Link
      to={`/products/${product.handle}`}
      className="group no-underline block bg-white border border-black/[0.06] transition-shadow duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)]"
    >
      {/* ━━━ IMAGE: bottle + slim accord pills, vertically centered ━━━ */}
      <div className="relative overflow-hidden bg-[#FAF9F7]">
        <div className="aspect-[4/5] flex items-center">
          <div className="w-[66%] h-full flex items-center justify-center pl-1">
            <div className="relative h-full w-full scale-[1.12] transition-transform duration-700 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group-hover:scale-[1.16]">
              <img
                src="/images/bottle-transparent.png"
                alt={product.name}
                className="absolute inset-0 h-full w-full object-contain"
              />
              {/* Liquid tint: the strongest accord's actual color, masked to
                  the bottle silhouette and multiplied over the glass. */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  backgroundColor: dominantColor,
                  WebkitMaskImage: 'url(/images/bottle-transparent.png)',
                  WebkitMaskSize: 'contain',
                  WebkitMaskRepeat: 'no-repeat',
                  WebkitMaskPosition: 'center',
                  maskImage: 'url(/images/bottle-transparent.png)',
                  maskSize: 'contain',
                  maskRepeat: 'no-repeat',
                  maskPosition: 'center',
                  mixBlendMode: 'multiply',
                  opacity: 0.4,
                }}
              />
            </div>
          </div>
          <div className="w-[34%] flex flex-col gap-2 items-start pr-4 pl-1">
            {accords.map((a, i) => {
              // Rank-stepped widths: a clear staircase from strongest to
              // weakest (strengths are too close together to read visually).
              const pct = 100 - i * 11;
              return (
                <span
                  key={a.name}
                  className="flex h-[24px] items-center justify-center rounded-full font-sans text-[10px] lowercase tracking-[0.03em] truncate px-2"
                  style={{backgroundColor: a.color, color: textOn(a.color), width: `${pct}%`}}
                >
                  {a.name}
                </span>
              );
            })}
          </div>
        </div>

        {product.badge && (
          <span className="absolute top-4 left-4 text-[9px] tracking-[0.14em] uppercase bg-black text-white px-3 py-1 font-sans">
            {product.badge}
          </span>
        )}

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

      {/* ━━━ INFO ━━━ */}
      <div className="px-5 pt-4 pb-5">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[9px] tracking-[0.2em] uppercase text-[#9A948D] font-sans">
            {categoryLabel}
          </span>
          {product.scentFamily && (
            <span className="text-[9px] tracking-[0.2em] uppercase text-[#C4A882] font-sans">
              {product.scentFamily}
            </span>
          )}
        </div>

        <h3 className="font-serif text-[19px] font-normal text-[#0A0A0A] leading-snug line-clamp-1">
          {product.name}
        </h3>

        {product.inspiredBy && (
          <p className="text-[12px] text-[#9A948D] font-sans mt-0.5 line-clamp-1">
            Inspired by <span className="text-[#0A0A0A]">{product.inspiredBy}</span>
          </p>
        )}

        <div className="flex items-center justify-between mt-3.5 pt-3.5 border-t border-black/[0.06]">
          <span className="font-serif text-[19px] text-[#0A0A0A]">
            {price != null ? `$${price}` : ''}
          </span>
          <div className="flex gap-1">
            {sizes.map((size) => (
              <button
                key={size}
                onClick={(e) => handleSizeClick(e, size)}
                className={`text-[10px] px-2 py-1 font-sans tracking-[0.02em] transition-colors duration-200 ${
                  selectedSize === size
                    ? 'text-[#0A0A0A] font-medium underline underline-offset-4'
                    : 'text-[#9A948D] hover:text-[#0A0A0A]'
                }`}
              >
                {size.replace('ml', '')}
              </button>
            ))}
            <span className="text-[10px] text-[#9A948D] py-1 pl-0.5 font-sans">ml</span>
          </div>
        </div>

        <AddToCartButton
          lines={variant?.availableForSale ? [toCartLine(variant, product)] : []}
          disabled={!variant?.availableForSale}
          onClick={() => {
            addToast(`${product.name} added to bag`, 'success');
          }}
          className={`mt-3.5 w-full h-[42px] inline-flex items-center justify-center gap-2 text-[10px] tracking-[0.18em] uppercase font-sans transition-colors ${
            variant?.availableForSale
              ? 'bg-[#0A0A0A] text-white hover:bg-black/80'
              : 'bg-[#E5E1DC] text-[#9A948D] cursor-not-allowed'
          }`}
        >
          <ShoppingBag size={13} strokeWidth={1.5} />
          {variant?.availableForSale ? 'Add to Bag' : 'Sold Out'}
        </AddToCartButton>
      </div>
    </Link>
  );
}
