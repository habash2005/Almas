import {useEffect, useRef, useState} from 'react';
import {Link, data, useFetcher} from 'react-router';
import {CartForm} from '@shopify/hydrogen';
import {X, Minus, Plus, ShoppingBag, ArrowRight, Tag} from 'lucide-react';
import {useAlmasCart, toAlmasCartItem} from '~/lib/cart';
import {useToast} from '~/components/ToastContext';

/**
 * @type {Route.MetaFunction}
 */
export const meta = () => {
  return [{title: `Hydrogen | Cart`}];
};

/**
 * @type {HeadersFunction}
 */
export const headers = ({actionHeaders}) => actionHeaders;

/**
 * @param {Route.ActionArgs}
 */
export async function action({request, context}) {
  const {cart} = context;

  const formData = await request.formData();

  const {action, inputs} = CartForm.getFormInput(formData);

  if (!action) {
    throw new Error('No action provided');
  }

  let status = 200;
  let result;

  switch (action) {
    case CartForm.ACTIONS.LinesAdd:
      result = await cart.addLines(inputs.lines);
      break;
    case CartForm.ACTIONS.LinesUpdate:
      result = await cart.updateLines(inputs.lines);
      break;
    case CartForm.ACTIONS.LinesRemove:
      result = await cart.removeLines(inputs.lineIds);
      break;
    case CartForm.ACTIONS.DiscountCodesUpdate: {
      const formDiscountCode = inputs.discountCode;

      // User inputted discount code
      const discountCodes = formDiscountCode ? [formDiscountCode] : [];

      // Combine discount codes already applied on cart
      discountCodes.push(...inputs.discountCodes);

      result = await cart.updateDiscountCodes(discountCodes);
      break;
    }
    case CartForm.ACTIONS.GiftCardCodesAdd: {
      const formGiftCardCode = inputs.giftCardCode;

      const giftCardCodes = formGiftCardCode ? [formGiftCardCode] : [];

      result = await cart.addGiftCardCodes(giftCardCodes);
      break;
    }
    case CartForm.ACTIONS.GiftCardCodesRemove: {
      const appliedGiftCardIds = inputs.giftCardCodes;
      result = await cart.removeGiftCardCodes(appliedGiftCardIds);
      break;
    }
    case CartForm.ACTIONS.BuyerIdentityUpdate: {
      result = await cart.updateBuyerIdentity({
        ...inputs.buyerIdentity,
      });
      break;
    }
    default:
      throw new Error(`${action} cart action is not defined`);
  }

  const cartId = result?.cart?.id;
  const headers = cartId ? cart.setCartId(result.cart.id) : new Headers();
  const {cart: cartResult, errors, warnings} = result;

  const redirectTo = formData.get('redirectTo') ?? null;
  if (typeof redirectTo === 'string') {
    status = 303;
    headers.set('Location', redirectTo);
  }

  return data(
    {
      cart: cartResult,
      errors,
      warnings,
      analytics: {
        cartId,
      },
    },
    {status, headers},
  );
}

/**
 * @param {Route.LoaderArgs}
 */
export async function loader({context}) {
  const {cart} = context;
  return await cart.get();
}

/**
 * Port of the legacy Almas CartPage, driven by the real Shopify cart via
 * useAlmasCart (same hook that powers the CartDrawer). Mutations submit
 * CartForm posts to this route's action. Checkout goes to the Shopify
 * hosted checkout (cart.checkoutUrl) — the legacy mock /checkout route is
 * retired. The legacy upsell grid ("You Might Also Like") is omitted here;
 * it returns with the ported ProductCard + recommendations in task 10.
 */
const PROMO_FETCHER_KEY = 'cart-promo-code';

export default function Cart() {
  const {cart, lines, cartCount, cartTotal, checkoutUrl, freeShippingThreshold} =
    useAlmasCart();
  const {showToast} = useToast();
  const [promoCode, setPromoCode] = useState('');
  // Code the user just submitted, pending validation feedback (legacy showed
  // "applied"/"invalid" toasts). The apply CartForm uses PROMO_FETCHER_KEY so
  // we can observe the same fetcher here; it returns to 'idle' only after the
  // root loader has revalidated, so cart.discountCodes is fresh by then.
  const [pendingCode, setPendingCode] = useState(null);
  const promoFetcher = useFetcher({key: PROMO_FETCHER_KEY});
  // Guards against the effect firing on the render between the Apply click
  // and the fetcher actually entering 'submitting' (still 'idle' then).
  const promoSubmitStartedRef = useRef(false);

  useEffect(() => {
    if (promoFetcher.state !== 'idle') {
      promoSubmitStartedRef.current = true;
      return;
    }
    if (!pendingCode || !promoSubmitStartedRef.current) return;
    promoSubmitStartedRef.current = false;
    const submitted = (cart?.discountCodes ?? []).find(
      (c) => c.code.toLowerCase() === pendingCode.toLowerCase(),
    );
    if (submitted?.applicable) {
      showToast('Promo code applied!', 'success');
      setPromoCode('');
    } else {
      showToast('Invalid promo code. Please try again.', 'error');
    }
    setPendingCode(null);
  }, [pendingCode, promoFetcher.state, cart, showToast]);

  const items = lines.map(toAlmasCartItem);
  const subtotal = cartTotal;
  const shippingCost = subtotal >= freeShippingThreshold ? 0 : 8.95;
  // Only chips for codes Shopify actually accepted (applicable: false codes
  // stay in cart.discountCodes but must not render as applied).
  const appliedCodes = (cart?.discountCodes ?? []).filter((c) => c.applicable);
  const promoApplied = appliedCodes.length > 0;
  // Promo discount = cart-level discount allocations. cost.subtotalAmount is
  // "before taxes and cart-level discounts" but already nets out line-level
  // discounts, so subtracting cart-level allocations is exact and never
  // conflates tax (unlike subtotal - totalAmount in tax-inclusive markets).
  const promoDiscount = (cart?.discountAllocations ?? []).reduce(
    (sum, allocation) =>
      sum + parseFloat(allocation?.discountedAmount?.amount ?? '0'),
    0,
  );
  const total = subtotal - promoDiscount + shippingCost;
  const shippingProgress = Math.min((subtotal / freeShippingThreshold) * 100, 100);
  const amountToFreeShipping = Math.max(freeShippingThreshold - subtotal, 0);

  if (items.length === 0) {
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
    );
  }

  return (
    <section className="py-16 md:py-24 px-6 md:px-12">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-12">
          <h1 className="font-serif text-4xl md:text-5xl font-light mb-2">Your Bag</h1>
          <p className="text-warm-gray text-sm">
            {cartCount} {cartCount === 1 ? 'item' : 'items'}
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

            {items.map((item) => (
              <div
                key={item.lineId}
                className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_auto] gap-4 md:gap-4 py-6 border-b border-stone-dark/30 items-center"
              >
                {/* Product Info */}
                <div className="flex gap-5">
                  <Link to={`/products/${item.handle}`} className="shrink-0">
                    <div className="w-16 h-20 sm:w-24 sm:h-28 bg-light-gray flex items-center justify-center">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="font-serif text-stone-dark text-sm">ALMAS</span>
                      )}
                    </div>
                  </Link>
                  <div className="flex flex-col justify-center gap-1">
                    <Link
                      to={`/products/${item.handle}`}
                      className="font-serif text-lg hover:opacity-70 transition-opacity"
                    >
                      {item.name}
                    </Link>
                    <p className="text-xs text-warm-gray mt-0.5">{item.size}</p>
                    {item.isSubscription && (
                      <span className="inline-flex items-center gap-1.5 mt-1 text-[10px] tracking-[0.1em] uppercase bg-light-gray text-black px-2.5 py-1 w-fit">
                        <Tag className="w-3 h-3" />
                        Refill every 3 months — Save 15%
                      </span>
                    )}
                    <p className="text-sm mt-1 md:hidden">${item.price.toFixed(2)}</p>
                  </div>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center justify-start md:justify-center">
                  <div className="flex items-center border border-stone-dark/50">
                    <CartForm
                      route="/cart"
                      action={CartForm.ACTIONS.LinesUpdate}
                      inputs={{lines: [{id: item.lineId, quantity: item.quantity - 1}]}}
                    >
                      <button
                        type="submit"
                        className="w-9 h-9 flex items-center justify-center hover:bg-light-gray transition-colors disabled:opacity-30"
                        disabled={item.quantity <= 1 || item.isOptimistic}
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                    </CartForm>
                    <span className="w-10 text-center text-sm">{item.quantity}</span>
                    <CartForm
                      route="/cart"
                      action={CartForm.ACTIONS.LinesUpdate}
                      inputs={{lines: [{id: item.lineId, quantity: item.quantity + 1}]}}
                    >
                      <button
                        type="submit"
                        className="w-9 h-9 flex items-center justify-center hover:bg-light-gray transition-colors disabled:opacity-30"
                        disabled={item.isOptimistic}
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </CartForm>
                  </div>
                </div>

                {/* Line Total */}
                <div className="hidden md:flex items-center justify-end">
                  <div className="text-right">
                    <p className="text-sm font-normal">${item.lineTotal.toFixed(2)}</p>
                  </div>
                </div>

                {/* Remove */}
                <div className="hidden md:flex items-center justify-end">
                  <CartForm
                    route="/cart"
                    action={CartForm.ACTIONS.LinesRemove}
                    inputs={{lineIds: [item.lineId]}}
                  >
                    <button
                      type="submit"
                      disabled={item.isOptimistic}
                      onClick={() => showToast(`${item.name} removed from bag.`, 'info')}
                      className="w-8 h-8 flex items-center justify-center hover:bg-light-gray rounded-full transition-colors"
                      aria-label={`Remove ${item.name}`}
                    >
                      <X className="w-4 h-4 text-warm-gray" />
                    </button>
                  </CartForm>
                </div>

                {/* Mobile remove */}
                <div className="flex md:hidden justify-between items-center">
                  <p className="text-sm font-normal">${item.lineTotal.toFixed(2)}</p>
                  <CartForm
                    route="/cart"
                    action={CartForm.ACTIONS.LinesRemove}
                    inputs={{lineIds: [item.lineId]}}
                  >
                    <button
                      type="submit"
                      disabled={item.isOptimistic}
                      onClick={() => showToast(`${item.name} removed from bag.`, 'info')}
                      className="text-xs text-warm-gray underline hover:text-black transition-colors"
                    >
                      Remove
                    </button>
                  </CartForm>
                </div>
              </div>
            ))}

            {/* Clear Cart */}
            <div className="mt-6 flex justify-between items-center">
              <Link
                to="/shop"
                className="text-xs tracking-[0.12em] uppercase text-black border-b border-black pb-0.5 hover:opacity-60 transition-opacity"
              >
                Continue Shopping
              </Link>
              <CartForm
                route="/cart"
                action={CartForm.ACTIONS.LinesRemove}
                inputs={{lineIds: items.map((item) => item.lineId)}}
              >
                <button
                  type="submit"
                  onClick={() => showToast('Your bag has been cleared.', 'info')}
                  className="text-xs tracking-[0.12em] uppercase text-warm-gray hover:text-black transition-colors"
                >
                  Clear Bag
                </button>
              </CartForm>
            </div>
          </div>

          {/* Cart Summary Sidebar */}
          <div className="mt-12 lg:mt-0">
            <div className="bg-light-gray p-8 lg:sticky lg:top-32">
              <h2 className="text-[11px] tracking-[0.15em] uppercase font-medium mb-8">
                Order Summary
              </h2>

              {/* Free Shipping Progress */}
              {subtotal < freeShippingThreshold && (
                <div className="mb-8 pb-8 border-b border-stone-dark/30">
                  <p className="text-xs text-warm-gray mb-3">
                    You&apos;re <span className="text-black font-medium">${amountToFreeShipping.toFixed(2)}</span> away from free shipping
                  </p>
                  <div className="w-full h-1 bg-stone-dark/30 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-black rounded-full transition-all duration-500"
                      style={{width: `${shippingProgress}%`}}
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

                {promoDiscount > 0 && (
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

              {/* Promo Code (real Shopify discount codes) */}
              <div className="mb-6 pb-6 border-t border-stone-dark/30 pt-6">
                {promoApplied ? (
                  <div className="flex items-center justify-between bg-white px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Tag className="w-3.5 h-3.5 text-warm-gray" />
                      <span className="text-sm">
                        {appliedCodes.map((c) => c.code.toUpperCase()).join(', ')}
                      </span>
                    </div>
                    <CartForm
                      route="/cart"
                      action={CartForm.ACTIONS.DiscountCodesUpdate}
                      inputs={{discountCodes: []}}
                    >
                      <button
                        type="submit"
                        onClick={() => showToast('Promo code removed.', 'info')}
                        className="text-xs text-warm-gray hover:text-black transition-colors"
                      >
                        Remove
                      </button>
                    </CartForm>
                  </div>
                ) : (
                  <CartForm
                    route="/cart"
                    action={CartForm.ACTIONS.DiscountCodesUpdate}
                    inputs={{discountCodes: []}}
                    fetcherKey={PROMO_FETCHER_KEY}
                  >
                    <div className="flex border border-stone-dark/50">
                      <input
                        type="text"
                        name="discountCode"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        placeholder="Promo code"
                        className="flex-1 px-4 py-3 bg-transparent text-sm outline-none placeholder:text-warm-gray/60"
                      />
                      {/* NOTE: disabled must not depend on pendingCode — the
                          onClick state update flushes synchronously (React
                          discrete event) and would disable the button before
                          the browser runs the form-submit default action,
                          cancelling the submit. promoFetcher.state only
                          changes once the submission has actually started. */}
                      <button
                        type="submit"
                        disabled={!promoCode.trim() || promoFetcher.state !== 'idle'}
                        onClick={() => setPendingCode(promoCode.trim())}
                        className="px-5 py-3 bg-black text-white text-[10px] tracking-[0.12em] uppercase hover:bg-black/85 transition-colors disabled:opacity-40"
                      >
                        Apply
                      </button>
                    </div>
                  </CartForm>
                )}
              </div>

              {/* Total */}
              <div className="flex justify-between items-center pt-4 border-t border-black/10 mb-8">
                <span className="text-sm font-medium">Total</span>
                <span className="font-serif text-2xl">${total.toFixed(2)}</span>
              </div>

              {/* Checkout Button — Shopify hosted checkout */}
              <a
                href={checkoutUrl ?? '#'}
                className="w-full bg-black text-white py-4 text-[11px] tracking-[0.15em] uppercase hover:bg-black/85 transition-all flex items-center justify-center gap-3 no-underline"
              >
                Proceed to Checkout
                <ArrowRight className="w-4 h-4" />
              </a>

              {/* Trust signals */}
              <div className="mt-6 space-y-2 text-center">
                <p className="text-[10px] text-warm-gray tracking-wide uppercase">
                  Secure checkout &middot; Free returns &middot; Authentic fragrances
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/** @typedef {import('react-router').HeadersFunction} HeadersFunction */
/** @typedef {import('./+types/cart').Route} Route */
/** @typedef {import('@shopify/hydrogen').CartQueryDataReturn} CartQueryDataReturn */
/** @typedef {ReturnType<typeof useLoaderData<typeof loader>>} LoaderReturnData */
/** @typedef {ReturnType<typeof useActionData<typeof action>>} ActionReturnData */
