import {createContext, useContext, useState} from 'react';
import {useRouteLoaderData} from 'react-router';
import {useOptimisticCart} from '@shopify/hydrogen';

const CartUIContext = createContext(null);

const FREE_SHIPPING_THRESHOLD = 100;

/**
 * Holds the client-only cart drawer open/closed state. Cart *data* lives in
 * the root loader (Shopify cart via context.cart.get()); this context only
 * carries UI state so any component can open/close the drawer.
 */
export function CartUIProvider({children}) {
  const [isCartOpen, setIsCartOpen] = useState(false);

  return (
    <CartUIContext.Provider value={{isCartOpen, setIsCartOpen}}>
      {children}
    </CartUIContext.Provider>
  );
}

/**
 * Adapter hook exposing the same surface the legacy Almas components expected
 * from `useCart()`, backed by the real Shopify cart.
 *
 * NOTE: the root loader AWAITS `cart.get()` (see root.jsx loadCriticalData)
 * instead of deferring it. Rationale: this app runs React 18 (no `use()` hook
 * to unwrap a deferred promise), and the cart count badge is above the fold
 * in the Navbar — scoping a Suspense/Await boundary around the nav would
 * blank it during streaming. The cart query runs in Promise.all with the
 * header query, so awaiting adds no serialized roundtrip.
 *
 * `useOptimisticCart` layers pending CartForm mutations on top so quantity
 * changes/removals render instantly.
 */
export function useAlmasCart() {
  const ui = useContext(CartUIContext);
  if (!ui) {
    throw new Error('useAlmasCart must be used within a CartUIProvider');
  }
  const {isCartOpen, setIsCartOpen} = ui;

  const rootData = useRouteLoaderData('root');
  const cart = useOptimisticCart(rootData?.cart);

  const lines = cart?.lines?.nodes ?? [];
  const cartCount = cart?.totalQuantity ?? 0;
  const cartTotal = parseFloat(cart?.cost?.subtotalAmount?.amount ?? '0');
  const freeShippingRemaining = Math.max(0, FREE_SHIPPING_THRESHOLD - cartTotal);

  return {
    cart,
    lines,
    cartCount,
    cartTotal,
    checkoutUrl: cart?.checkoutUrl ?? null,
    isCartOpen,
    setIsCartOpen,
    freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
    freeShippingRemaining,
    hasFreeShipping: cartTotal >= FREE_SHIPPING_THRESHOLD,
  };
}

/**
 * Builds a CartForm LinesAdd input from an Almas product + variant.
 * Attaching `selectedVariant` (with product/image) lets `useOptimisticCart`
 * render the pending line immediately instead of logging
 * "[h2:error:useOptimisticCart] No selected variant was passed".
 *
 * @param {object} variant Storefront variant node ({id, title, price, ...})
 * @param {object} product Almas-shaped product (name, handle, image)
 * @param {number} [quantity]
 * @param {object} [extra] Extra line fields (e.g. {sellingPlanId})
 */
export function toCartLine(variant, product, quantity = 1, extra = {}) {
  return {
    merchandiseId: variant.id,
    quantity,
    selectedVariant: {
      ...variant,
      product: {title: product.name, handle: product.handle},
      image: {url: product.image},
    },
    ...extra,
  };
}

/**
 * Maps a Shopify cart line to the item shape the legacy Almas cart UI used.
 * @param {object} line CartLine from the cart query / useOptimisticCart
 */
export function toAlmasCartItem(line) {
  const merchandise = line?.merchandise;
  const quantity = line?.quantity ?? 1;
  const lineTotal = parseFloat(line?.cost?.totalAmount?.amount ?? '0');

  return {
    lineId: line?.id,
    name: merchandise?.product?.title ?? '',
    handle: merchandise?.product?.handle ?? '',
    size: merchandise?.title ?? '',
    image: merchandise?.image?.url ?? '/images/bottle.png',
    price: quantity > 0 ? lineTotal / quantity : 0,
    lineTotal,
    quantity,
    isSubscription: Boolean(line?.sellingPlanAllocation),
    isOptimistic: Boolean(line?.isOptimistic),
  };
}
