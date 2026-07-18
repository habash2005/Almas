import {useState, useEffect, useMemo} from 'react';
import {useLoaderData, useFetcher, Link} from 'react-router';
import {Analytics} from '@shopify/hydrogen';
import {Droplets, Heart as HeartIcon, Wind, Clock, Sun, Minus, Plus} from 'lucide-react';
import {toAlmasProduct, PRODUCT_FULL_FRAGMENT, PRODUCT_CARD_FRAGMENT} from '~/lib/almas';
import {pageMeta, productJsonLd, breadcrumbJsonLd, JsonLd} from '~/lib/seo';
import {adminGql} from '~/lib/adminApi';
import ProductCard from '~/components/ProductCard';
import AccordBar from '~/components/AccordBar';
import ScentRadar from '~/components/ScentRadar';
import {AddToCartButton} from '~/components/AddToCartButton';
import {useToast} from '~/components/ToastContext';
import {useWishlist} from '~/lib/wishlist';
import {toCartLine} from '~/lib/cart';
import {
  getAccentColor,
  getBottleShadowColor,
  getCategoryDisplay,
  getScentFamilyStyles,
  hexToRgba,
} from '~/lib/scentTheme';

/**
 * @type {Route.MetaFunction}
 */
export const meta = ({data}) => {
  const p = data?.product;
  if (!p) return pageMeta({title: 'Fragrance', path: '/shop'});
  const blurb = (p.description ?? '').trim();
  return pageMeta({
    title: p.inspiredBy ? `${p.name} — Inspired by ${p.inspiredBy}` : p.name,
    description:
      blurb.length > 155 ? `${blurb.slice(0, 152).trimEnd()}…` : blurb || undefined,
    path: `/products/${p.handle}`,
    image: p.image?.startsWith('http') ? p.image : undefined,
    type: 'product',
  });
};

/**
 * @param {Route.LoaderArgs}
 */
export async function loader({params, context}) {
  const [{product}, {products: related}] = await Promise.all([
    context.storefront.query(PRODUCT_QUERY, {
      variables: {handle: params.handle},
    }),
    context.storefront.query(RELATED_QUERY),
  ]);
  if (!product) throw new Response('Not found', {status: 404});
  return {
    product: toAlmasProduct(product),
    sellingPlanGroups: product.sellingPlanGroups?.nodes ?? [],
    related: related.nodes
      .map(toAlmasProduct)
      .filter((p) => p.handle !== params.handle)
      .slice(0, 4),
  };
}

/* ── Helpers ── */
const STARS = [1, 2, 3, 4, 5];

function StarRating({rating, size = 14, interactive = false, onChange}) {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="flex gap-0.5">
      {STARS.map((star) => (
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
  );
}

function Accordion({title, defaultOpen = false, children}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

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
  );
}

/* ── Performance Metric Components ── */
function LongevityBar({longevity}) {
  const match = longevity.match(/(\d+)/);
  const hours = match ? parseInt(match[1]) : 6;
  return (
    <div className="flex gap-0.5">
      {Array.from({length: 12}, (_, i) => (
        <div key={i} className={`w-2 h-4 rounded-[1px] ${i < hours ? 'bg-black' : 'bg-stone/30'}`} />
      ))}
    </div>
  );
}

function SillageBar({sillage}) {
  const levels = {'Soft': 1, 'Moderate': 2, 'Moderate-Strong': 3, 'Strong': 4};
  const level = levels[sillage] || 2;
  return (
    <div className="flex items-end gap-0.5">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className={`w-2 rounded-[1px] ${i <= level ? 'bg-black' : 'bg-stone/30'}`} style={{height: `${8 + i * 4}px`}} />
      ))}
    </div>
  );
}

/* ── Reviews ──
 * Shared across all visitors: stored in the product's `almas.reviews` json
 * metafield. The route action below appends a validated review via the Admin
 * API; the loader's product query already selects the metafield. */
export async function action({request, params, context}) {
  const form = await request.formData();
  if (form.get('website')) return {ok: true}; // honeypot
  const name = String(form.get('name') ?? '').trim().slice(0, 60);
  const text = String(form.get('text') ?? '').trim().slice(0, 2000);
  const rating = Math.round(Number(form.get('rating')));
  if (!name || !text || !(rating >= 1 && rating <= 5)) {
    return {ok: false, error: 'Please fill in all fields and select a rating.'};
  }

  try {
    const found = await adminGql(
      context.env,
      `query($q: String!) {
        products(first: 5, query: $q) {
          nodes { id handle reviews: metafield(namespace: "almas", key: "reviews") { value } }
        }
      }`,
      {q: `handle:"${params.handle}"`},
    );
    const node = found.products.nodes.find((n) => n.handle === params.handle);
    if (!node) return {ok: false, error: 'Product not found.'};

    let existing = [];
    try {
      existing = JSON.parse(node.reviews?.value ?? '[]');
    } catch {
      existing = [];
    }
    const review = {
      id: `r-${Date.now()}`,
      name,
      rating,
      text,
      date: new Date().toISOString().split('T')[0],
    };
    const updated = [review, ...existing].slice(0, 200);

    const set = await adminGql(
      context.env,
      `mutation($metafields: [MetafieldsSetInput!]!) {
        metafieldsSet(metafields: $metafields) { userErrors { field message } }
      }`,
      {
        metafields: [
          {ownerId: node.id, namespace: 'almas', key: 'reviews', type: 'json', value: JSON.stringify(updated)},
        ],
      },
    );
    if (set.metafieldsSet.userErrors.length) {
      throw new Error(JSON.stringify(set.metafieldsSet.userErrors));
    }
    return {ok: true};
  } catch (e) {
    console.error('review submit failed:', e);
    return {ok: false, error: 'Could not submit your review — please try again later.'};
  }
}

/* ── Main Component ── */
export default function ProductPage() {
  /** @type {LoaderReturnData} */
  const {product, sellingPlanGroups, related: relatedProducts} = useLoaderData();
  const {addToast} = useToast();
  const reviewFetcher = useFetcher();
  const {addToWishlist, removeFromWishlist, isInWishlist} = useWishlist();

  const sizes = Object.keys(product.prices);
  const [selectedSizeRaw, setSelectedSize] = useState(sizes[0]);
  // Client navigation between products keeps this component mounted; fall
  // back to the first size when the previous selection doesn't exist here.
  const selectedSize =
    product.prices[selectedSizeRaw] != null ? selectedSizeRaw : sizes[0];
  const [quantity, setQuantity] = useState(1);
  const [subscribe, setSubscribe] = useState(false);
  const [reviewSort, setReviewSort] = useState('newest');
  const [reviews, setReviews] = useState([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewName, setReviewName] = useState('');
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewText, setReviewText] = useState('');

  useEffect(() => {
    // Reviews are server data (almas.reviews metafield); revalidation after
    // the action keeps this in sync post-submit.
    setReviews(product.reviews ?? []);
    // Reset transient purchase state when navigating between products
    setQuantity(1);
    setSubscribe(false);
    setShowReviewForm(false);
  }, [product.id, product.reviews]);

  const wishlisted = product ? isInWishlist(product.id) : false;

  // Subscribe & Save — first selling plan of the first group (null on
  // stores without the Subscriptions app, e.g. mock.shop)
  const plan = sellingPlanGroups[0]?.sellingPlans?.nodes?.[0] ?? null;
  const planPct =
    plan?.priceAdjustments?.[0]?.adjustmentValue?.adjustmentPercentage ?? 15;

  const currentPrice = product.prices[selectedSize];
  const subscriptionPrice = Math.round(currentPrice * (1 - planPct / 100));
  const isSubscription = subscribe && Boolean(plan);
  const displayPrice = isSubscription ? subscriptionPrice : currentPrice;

  const variant = product.variantBySize?.[selectedSize];
  const lines = variant
    ? [
        toCartLine(
          variant,
          product,
          quantity,
          isSubscription ? {sellingPlanId: plan.id} : {},
        ),
      ]
    : [];

  // Themed values
  const accentColor = getAccentColor(product);
  const categoryInfo = getCategoryDisplay(product.category);
  const scentBadgeStyles = getScentFamilyStyles(product);
  const bottleShadow = getBottleShadowColor(product.accords);

  // Ratings calculation
  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '0.0';

  const ratingDistribution = STARS.map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
    pct: reviews.length > 0
      ? Math.round((reviews.filter((r) => r.rating === star).length / reviews.length) * 100)
      : 0,
  })).reverse();

  const sortedReviews = useMemo(() => {
    const sorted = [...reviews];
    switch (reviewSort) {
      case 'highest':
        sorted.sort((a, b) => b.rating - a.rating);
        break;
      case 'lowest':
        sorted.sort((a, b) => a.rating - b.rating);
        break;
      default: // newest
        sorted.sort((a, b) => new Date(b.date) - new Date(a.date));
        break;
    }
    return sorted;
  }, [reviews, reviewSort]);

  const handleWishlist = () => {
    if (wishlisted) {
      removeFromWishlist(product.id);
      addToast('Removed from wishlist', 'info');
    } else {
      addToWishlist(product);
      addToast('Added to wishlist', 'success');
    }
  };

  const handleSubmitReview = (e) => {
    e.preventDefault();
    if (!reviewName.trim() || !reviewText.trim() || reviewRating === 0) {
      addToast('Please fill in all fields and select a rating', 'error');
      return;
    }

    reviewFetcher.submit(
      {name: reviewName.trim(), rating: String(reviewRating), text: reviewText.trim()},
      {method: 'post'},
    );
    // Optimistic: show it immediately; the post-action revalidation replaces
    // this with the server's copy.
    setReviews([
      {
        id: `user-${Date.now()}`,
        name: reviewName.trim(),
        rating: reviewRating,
        text: reviewText.trim(),
        date: new Date().toISOString().split('T')[0],
      },
      ...reviews,
    ]);
    setReviewName('');
    setReviewRating(0);
    setReviewText('');
    setShowReviewForm(false);
    addToast('Review submitted — thank you!', 'success');
  };

  return (
    <div className="min-h-screen bg-white">
      <JsonLd data={productJsonLd(product)} />
      <JsonLd
        data={breadcrumbJsonLd([
          {name: 'Home', path: '/'},
          {name: 'Shop', path: '/shop'},
          {name: product.name, path: `/products/${product.handle}`},
        ])}
      />
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
        style={{background: `linear-gradient(180deg, ${hexToRgba(getAccentColor(product), 0.06)} 0%, transparent 50%)`}}
      >
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          {/* Left: Product Display */}
          <div className="lg:sticky lg:top-24">
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
              {product.inspiredBy && (
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
              )}

              {/* Badge */}
              {product.badge && (
                <span className="absolute top-6 left-6 bg-black text-white font-sans text-[10px] tracking-[0.12em] uppercase px-3 py-1.5 z-[5]">
                  {product.badge}
                </span>
              )}
            </div>

            {/* Fragrance Pyramid */}
            {product.notes && (
              <div className="bg-light-gray rounded-sm p-6 mt-4">
                <h3 className="text-[11px] tracking-[0.2em] uppercase text-warm-gray font-medium mb-6">
                  Fragrance Pyramid
                </h3>

                {/* Top Notes - narrowest */}
                <div className="max-w-[65%] mx-auto mb-4">
                  <div className="flex items-center gap-2 mb-2" style={{borderLeft: `3px solid ${accentColor}30`, paddingLeft: '12px'}}>
                    <Droplets size={14} className="text-warm-gray" />
                    <span className="text-[10px] tracking-[0.1em] uppercase text-warm-gray font-medium">Top Notes</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pl-7">
                    {product.notes?.top?.map((note) => (
                      <span key={note} className="px-2.5 py-1 text-[12px] bg-white border border-stone/30 rounded-sm">{note}</span>
                    ))}
                  </div>
                </div>

                {/* Heart Notes - medium width */}
                <div className="max-w-[82%] mx-auto mb-4">
                  <div className="flex items-center gap-2 mb-2" style={{borderLeft: `3px solid ${accentColor}45`, paddingLeft: '12px'}}>
                    <HeartIcon size={14} className="text-warm-gray" />
                    <span className="text-[10px] tracking-[0.1em] uppercase text-warm-gray font-medium">Heart Notes</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pl-7">
                    {product.notes?.heart?.map((note) => (
                      <span key={note} className="px-2.5 py-1 text-[12px] bg-white border border-stone/30 rounded-sm">{note}</span>
                    ))}
                  </div>
                </div>

                {/* Base Notes - full width */}
                <div className="max-w-full mb-4">
                  <div className="flex items-center gap-2 mb-2" style={{borderLeft: `3px solid ${accentColor}65`, paddingLeft: '12px'}}>
                    <Wind size={14} className="text-warm-gray" />
                    <span className="text-[10px] tracking-[0.1em] uppercase text-warm-gray font-medium">Base Notes</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pl-7">
                    {product.notes?.base?.map((note) => (
                      <span key={note} className="px-2.5 py-1 text-[12px] bg-white border border-stone/30 rounded-sm">{note}</span>
                    ))}
                  </div>
                </div>

                <div className="h-px bg-stone-dark/30 my-5" />

                {/* Performance with visual gauges */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {product.longevity && (
                    <div className="text-center">
                      <Clock size={18} className="mx-auto mb-1.5 text-warm-gray" />
                      <div className="text-[9px] tracking-[0.1em] uppercase text-warm-gray mb-1.5">Longevity</div>
                      <div className="flex justify-center mb-1">
                        <LongevityBar longevity={product.longevity || '6 hours'} />
                      </div>
                      <div className="text-[11px] text-warm-gray">{product.longevity}</div>
                    </div>
                  )}
                  {product.sillage && (
                    <div className="text-center">
                      <Wind size={18} className="mx-auto mb-1.5 text-warm-gray" />
                      <div className="text-[9px] tracking-[0.1em] uppercase text-warm-gray mb-1.5">Sillage</div>
                      <div className="flex justify-center mb-1">
                        <SillageBar sillage={product.sillage || 'Moderate'} />
                      </div>
                      <div className="text-[11px] text-warm-gray">{product.sillage}</div>
                    </div>
                  )}
                  {product.bestFor?.length > 0 && (
                    <div className="text-center">
                      <Sun size={18} className="mx-auto mb-1.5 text-warm-gray" />
                      <div className="text-[9px] tracking-[0.1em] uppercase text-warm-gray mb-0.5">Best For</div>
                      <div className="text-[13px] font-medium text-black">{product.bestFor?.slice(0, 2).join(', ')}</div>
                    </div>
                  )}
                  {product.scentFamily && (
                    <div className="text-center">
                      <Droplets size={18} className="mx-auto mb-1.5 text-warm-gray" />
                      <div className="text-[9px] tracking-[0.1em] uppercase text-warm-gray mb-0.5">Family</div>
                      <div className="text-[13px] font-medium text-black">{product.scentFamily}</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Scent Radar Chart */}
            {(product.accords?.length ?? 0) >= 3 && (
              <div className="bg-light-gray rounded-sm p-6 mt-4">
                <h3 className="text-[11px] tracking-[0.2em] uppercase text-warm-gray font-medium mb-4">
                  Scent Profile
                </h3>
                <ScentRadar accords={product.accords} product={product} />
              </div>
            )}
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
            {product.inspiredBy && (
              <p className="font-sans text-sm text-warm-gray italic mb-4">
                Inspired by {product.inspiredBy}
              </p>
            )}

            {/* Rating (hidden until the product has real reviews) */}
            {reviews.length > 0 && (
              <div className="flex items-center gap-3 mb-6">
                <StarRating rating={Math.round(parseFloat(avgRating))} />
                <span className="font-sans text-sm text-warm-gray">
                  {avgRating} ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
                </span>
              </div>
            )}

            {/* Description */}
            <p className="font-sans text-sm text-warm-gray leading-relaxed mb-8">
              {product.description}
            </p>

            {/* Size Selector */}
            <div className="mb-6">
              <p className="font-sans text-[11px] tracking-[0.15em] uppercase mb-3">Size</p>
              <div className="flex gap-3">
                {sizes.map((size) => (
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

            {/* Subscribe & Save Toggle — hidden when the store exposes no selling plans */}
            {plan && (
              <div className="mb-8 border border-stone-dark/50 divide-y divide-stone-dark/30">
                {/* One-time */}
                <label
                  aria-label="One-time purchase"
                  className={`flex items-center gap-3 px-5 py-4 cursor-pointer transition-colors ${!subscribe ? 'bg-light-gray' : ''}`}
                >
                  <input
                    type="radio"
                    name="purchase-type"
                    checked={!subscribe}
                    onChange={() => setSubscribe(false)}
                    className="accent-black w-4 h-4"
                  />
                  <div>
                    <span className="font-sans text-sm font-medium">One-time purchase</span>
                    <span className="font-sans text-xs text-warm-gray ml-2">${currentPrice}</span>
                  </div>
                </label>
                {/* Subscription */}
                <label
                  aria-label={`Subscribe & Save ${planPct}%`}
                  className={`flex items-center gap-3 px-5 py-4 cursor-pointer transition-colors ${subscribe ? 'bg-light-gray' : ''}`}
                >
                  <input
                    type="radio"
                    name="purchase-type"
                    checked={subscribe}
                    onChange={() => setSubscribe(true)}
                    className="accent-black w-4 h-4"
                  />
                  <div>
                    <span className="font-sans text-sm font-medium">Subscribe & Save {planPct}%</span>
                    <span className="font-sans text-xs text-warm-gray ml-2">${subscriptionPrice}</span>
                    <p className="font-sans text-[11px] text-warm-gray mt-0.5">
                      Auto-refill every 3 months. Cancel anytime.
                    </p>
                  </div>
                </label>
              </div>
            )}

            {/* Quantity */}
            <div className="mb-6">
              <p className="font-sans text-[11px] tracking-[0.15em] uppercase mb-3">Quantity</p>
              <div className="inline-flex items-center border border-stone-dark/50">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-9 h-9 flex items-center justify-center hover:bg-light-gray transition-colors disabled:opacity-30"
                  disabled={quantity <= 1}
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="w-10 text-center text-sm">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="w-9 h-9 flex items-center justify-center hover:bg-light-gray transition-colors"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Add to Bag */}
            <AddToCartButton
              lines={variant?.availableForSale ? lines : []}
              disabled={!variant?.availableForSale}
              onClick={() => addToast(`${product.name} added to bag`, 'success')}
              className={`w-full font-sans text-[11px] tracking-[0.15em] uppercase py-4 transition-colors mb-3 ${
                variant?.availableForSale
                  ? 'bg-black text-white hover:bg-black/85'
                  : 'bg-warm-gray text-white cursor-not-allowed'
              }`}
            >
              {variant?.availableForSale ? `Add to Bag — $${displayPrice}` : 'Sold Out'}
            </AddToCartButton>

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
              {product.scentFamily && (
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
              )}
              {variant?.availableForSale ? (
                <>
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                  <span className="text-xs text-green-600">In Stock</span>
                </>
              ) : (
                <>
                  <span className="w-1.5 h-1.5 bg-warm-gray rounded-full" />
                  <span className="text-xs text-warm-gray">Sold Out</span>
                </>
              )}
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
              {plan && (
                <Accordion title="About Subscriptions">
                  <div className="font-sans text-sm text-warm-gray leading-relaxed space-y-3">
                    <p>Subscribe and receive a fresh bottle every 3 months at {planPct}% off the retail price.</p>
                    <p>Free shipping on all subscription orders, regardless of total.</p>
                    <p>Skip, swap your fragrance, or cancel anytime from your account page.</p>
                    <p>Subscribers get exclusive early access to all new releases.</p>
                  </div>
                </Accordion>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Scent Journey Section */}
      {product.notes && (
        <section className="px-6 md:px-12 py-16 border-t border-stone/20">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-serif text-[clamp(24px,3vw,36px)] font-light text-center mb-12">The Scent Journey</h2>

            <div className="space-y-10">
              {/* Opens With */}
              <div className="flex gap-6">
                <div className="flex flex-col items-center">
                  <span className="text-xl" style={{color: accentColor}}>&#9650;</span>
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
                  <span className="text-xl" style={{color: accentColor}}>&#9670;</span>
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
                  <span className="text-xl" style={{color: accentColor}}>&#9679;</span>
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
      )}

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

          {/* Empty state */}
          {reviews.length === 0 && (
            <p className="font-sans text-sm text-warm-gray mb-12">
              No reviews yet — be the first to share your experience with this fragrance.
            </p>
          )}

          {/* Rating Summary */}
          {reviews.length > 0 && (
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
              {ratingDistribution.map(({star, count, pct}) => (
                <div key={star} className="flex items-center gap-3">
                  <span className="font-sans text-xs text-warm-gray w-12">{star} star{star !== 1 ? 's' : ''}</span>
                  <div className="flex-1 h-2 bg-stone rounded-full overflow-hidden">
                    <div
                      className="h-full bg-black rounded-full transition-all duration-500"
                      style={{width: `${pct}%`}}
                    />
                  </div>
                  <span className="font-sans text-xs text-warm-gray w-8 text-right">{count}</span>
                </div>
              ))}
            </div>
          </div>
          )}

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
                  <label htmlFor="review-name" className="block font-sans text-[11px] tracking-[0.1em] uppercase text-warm-gray mb-2">
                    Your Name
                  </label>
                  <input
                    id="review-name"
                    type="text"
                    value={reviewName}
                    onChange={(e) => setReviewName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full border border-stone-dark px-4 py-3 font-sans text-sm focus:outline-none focus:border-black transition-colors bg-transparent"
                  />
                </div>
                <div>
                  <p className="block font-sans text-[11px] tracking-[0.1em] uppercase text-warm-gray mb-2">
                    Rating
                  </p>
                  <StarRating rating={reviewRating} size={20} interactive onChange={setReviewRating} />
                </div>
              </div>
              <div className="mb-6">
                <label htmlFor="review-text" className="block font-sans text-[11px] tracking-[0.1em] uppercase text-warm-gray mb-2">
                  Your Review
                </label>
                <textarea
                  id="review-text"
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
            {sortedReviews.map((review) => (
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
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      <Analytics.ProductView
        data={{
          products: [
            {
              id: product.gid,
              title: product.name,
              price: String(currentPrice ?? 0),
              vendor: 'Almas',
              variantId: variant?.id || '',
              variantTitle: variant?.title || '',
              quantity: 1,
            },
          ],
        }}
      />
    </div>
  );
}

/* ── Product Bottle Image sub-component ── */
function ProductBottleImage({product, bottleShadow}) {
  const accords = product.accords || [];
  const dominantColor = accords.length > 0
    ? accords.reduce((a, b) => (a.strength > b.strength ? a : b)).color
    : '#C4A882';

  const h = dominantColor.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16) / 255;
  const g = parseInt(h.substring(2, 4), 16) / 255;
  const b = parseInt(h.substring(4, 6), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let hue = 0;
  if (max !== min) {
    const d = max - min;
    if (max === r) hue = ((g - b) / d + (g < b ? 6 : 0)) * 60;
    else if (max === g) hue = ((b - r) / d + 2) * 60;
    else hue = ((r - g) / d + 4) * 60;
  }

  return (
    <img
      src="/images/bottle-transparent.png"
      alt={product.name}
      className="w-full h-auto object-contain"
      style={{filter: `drop-shadow(0 12px 30px ${bottleShadow}) sepia(0.4) hue-rotate(${Math.round(hue)}deg) saturate(0.8)`}}
    />
  );
}

const PRODUCT_QUERY = `#graphql
  ${PRODUCT_FULL_FRAGMENT}
  query ProductByHandle($handle: String!, $country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    product(handle: $handle) { ...ProductFull }
  }
`;

const RELATED_QUERY = `#graphql
  ${PRODUCT_CARD_FRAGMENT}
  query RelatedProducts($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    products(first: 8, sortKey: BEST_SELLING) { nodes { ...ProductCard } }
  }
`;

/** @typedef {import('./+types/products.$handle').Route} Route */
/** @typedef {ReturnType<typeof useLoaderData<typeof loader>>} LoaderReturnData */
