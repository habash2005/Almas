# Almas → Shopify Hydrogen Conversion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the Almas perfume storefront (`storefront/`, React/Vite SPA with hardcoded data) as a Shopify Hydrogen app at `hydrogen/` with real products, cart, hosted checkout, customer accounts, and subscriptions, plus a script that migrates the 143 products into a Shopify store.

**Architecture:** New Hydrogen (React Router–based) app developed against Shopify's public `mock.shop` Storefront API until the owner's dev store exists. A single adapter module (`app/lib/almas.js`) maps Shopify product data (variants + `almas.*` metafields) into the exact product shape the legacy components consume, so the visual layer ports nearly 1:1. Cart/checkout/accounts use Hydrogen's built-ins. A Node script using the Admin GraphQL API upserts all products/collections idempotently.

**Tech Stack:** Hydrogen (latest, React Router 7), Tailwind CSS v4, lucide-react, Vitest (unit tests for data transforms), Node 20+, Shopify Storefront API + Admin GraphQL API (2025-10).

**Spec:** `docs/superpowers/specs/2026-07-10-shopify-hydrogen-conversion-design.md`

---

## Global porting conventions

Apply these to EVERY file ported from `storefront/src/` (referred to below as `LEGACY/`). Repeated here once; tasks say "apply global conventions."

1. **Imports:** `react-router-dom` → `react-router` (Hydrogen uses React Router 7 framework mode; `Link`, `useNavigate`, `useSearchParams` keep the same names). `lucide-react` stays (add as dependency).
2. **Product links:** `/product/${product.id}` → `/products/${product.handle}`.
3. **Data:** never import `LEGACY/data/products.js`. Product data arrives as props from route loaders, already mapped through `toAlmasProduct()` (Task 4) into the legacy shape (`name`, `inspiredBy`, `prices`, `accords`, `notes`, `longevity`, `sillage`, `bestFor`, `badge`, `category`, `image`, plus new `handle`, `gid`, `variantBySize`).
4. **Cart:** `import {useCart} from '../context/CartContext'` → `import {useAlmasCart} from '~/lib/cart'` (Task 6). Same field names (`cartCount`, `cartTotal`, `isCartOpen`, `setIsCartOpen`, `freeShippingRemaining`, `hasFreeShipping`); `addToCart(product, size, qty, isSubscription)` is replaced by the `<AddToCartButton>` component or `addLine()` helper from Task 6 (they need `product.variantBySize[size].id`).
5. **Toast/Wishlist:** paths change to `~/components/ToastContext` and `~/lib/wishlist` but the hook APIs are preserved verbatim, EXCEPT wishlist keys on `product.handle` instead of numeric `product.id`.
6. **Path alias:** use `~/` (Hydrogen's alias for `app/`).
7. **Static assets:** copy referenced images from `LEGACY/../public/` into `hydrogen/public/` preserving paths (`/images/...`, `/products/...`).
8. **Missing metafields degrade gracefully:** every component already guards (`product.accords || []`, `product.notes && ...`). Keep those guards — on mock.shop, metafields are absent and sections must simply hide, not crash.
9. **Verification for visual ports:** `npm run dev` in `hydrogen/`, open the route, confirm it renders without console errors and matches the legacy page side-by-side (`npm run dev` in `storefront/` serves the reference on another port).

**Commit style:** one commit per task minimum, `feat(hydrogen): <what>`. Run `npm run lint` in `hydrogen/` before each commit.

---

### Task 1: Scaffold the Hydrogen app

**Files:**
- Create: `hydrogen/` (entire scaffold, generated)
- Create: `docs/superpowers/plans/scaffold-map.md` (actual generated structure, for later tasks)

- [ ] **Step 1: Scaffold with mock.shop**

```bash
cd /Users/ahmadhijaz/Almas
npm create @shopify/hydrogen@latest -- --path hydrogen --mockshop --language js --shortcut false --routes --install-deps
```

If the interactive prompt asks for styling, pick **Tailwind**. If flags have drifted in the current CLI version, run `npm create @shopify/hydrogen@latest` interactively: path `hydrogen`, mock.shop data, JavaScript, Tailwind, scaffold example routes, install deps.

- [ ] **Step 2: Verify dev server**

```bash
cd hydrogen && npm run dev
```
Expected: server starts (default `http://localhost:3000`), home page renders mock.shop products. Ctrl-C after confirming.

- [ ] **Step 3: Record the real scaffold structure**

Write `docs/superpowers/plans/scaffold-map.md` listing: the routes directory contents, the layout component (`PageLayout` or equivalent), where the cart handler lives (`app/lib/context.js` or `server.js`), the fragments file, and the account route filenames. Later tasks reference canonical names (`app/routes/_index.jsx`, `products.$handle.jsx`, `collections.$handle.jsx`, `cart.jsx`, `search.jsx`, `account*.jsx`); if the scaffold differs, the scaffold's names win — note the mapping in this file.

- [ ] **Step 4: Add dependencies and test runner**

```bash
cd hydrogen && npm i lucide-react && npm i -D vitest
```
Add to `hydrogen/package.json` scripts: `"test": "vitest run"`.

- [ ] **Step 5: Commit**

```bash
git add hydrogen docs/superpowers/plans/scaffold-map.md
git commit -m "feat(hydrogen): scaffold Hydrogen app against mock.shop"
```

---

### Task 2: Port the design system

**Files:**
- Modify: `hydrogen/app/styles/app.css` (or scaffold's tailwind css file — see scaffold-map)
- Create: `hydrogen/app/lib/scentTheme.js`, `hydrogen/app/hooks/useScrollAnimation.js`
- Copy: all of `storefront/public/images/`, `storefront/public/products/`, `storefront/public/icons.svg`, `storefront/public/favicon.svg` → `hydrogen/public/`

- [ ] **Step 1: Replace scaffold CSS with the Almas design system**

Replace the scaffold's main CSS file content with the full content of `storefront/src/index.css` (it already begins with `@import "tailwindcss"` and the `@theme` block for Tailwind v4 — verify the scaffold's Tailwind setup is v4 with `@tailwindcss/vite`; if the scaffold wired Tailwind differently, keep the scaffold's import mechanism and paste everything from `@theme` down). Keep the Google Fonts `@import url(...)` line at the very top.

- [ ] **Step 2: Port utilities and hooks**

Copy `storefront/src/utils/scentTheme.js` → `hydrogen/app/lib/scentTheme.js` and `storefront/src/hooks/useScrollAnimation.js` → `hydrogen/app/hooks/useScrollAnimation.js`, applying global conventions (these two have no router/data imports; expect zero changes beyond the copy).

- [ ] **Step 3: Copy static assets**

```bash
cp -R storefront/public/images storefront/public/products storefront/public/icons.svg storefront/public/favicon.svg hydrogen/public/
```

- [ ] **Step 4: Verify**

`npm run dev` — scaffold pages now render with Cormorant Garamond/Inter fonts and the warm-white palette (they'll look half-styled; that's expected until layout port).

- [ ] **Step 5: Commit**

```bash
git add -A hydrogen && git commit -m "feat(hydrogen): port Almas design system, assets, and utils"
```

---

### Task 3: Toast context (dependency of everything interactive)

**Files:**
- Create: `hydrogen/app/components/ToastContext.jsx` (port of `storefront/src/context/ToastContext.jsx` + `storefront/src/components/Toast.jsx` — keep them as two files if legacy does)

- [ ] **Step 1: Port ToastContext + Toast component** applying global conventions (no data dependencies — near-verbatim copy).
- [ ] **Step 2: Mount `<ToastProvider>` + `<Toast/>`** in the scaffold's root layout component (see scaffold-map; typically `app/root.jsx` wrapping the outlet, matching how `LEGACY/App.jsx` nests providers).
- [ ] **Step 3: Verify** dev server renders; no console errors.
- [ ] **Step 4: Commit** `git add -A hydrogen && git commit -m "feat(hydrogen): port toast system"`

---

### Task 4: Product adapter + GraphQL fragments (TDD)

The keystone. Maps Storefront API product nodes → legacy product shape.

**Files:**
- Create: `hydrogen/app/lib/almas.js`
- Test: `hydrogen/app/lib/almas.test.js`

- [ ] **Step 1: Write the failing test**

```js
// hydrogen/app/lib/almas.test.js
import {describe, it, expect} from 'vitest';
import {toAlmasProduct} from './almas';

const NODE = {
  id: 'gid://shopify/Product/1',
  handle: 'midnight-aventus',
  title: 'Midnight Aventus',
  description: 'A bold fragrance.',
  tags: ['men', 'Woody', 'Best Seller'],
  featuredImage: {url: 'https://cdn/img.png', altText: null, width: 800, height: 800},
  variants: {nodes: [
    {id: 'gid://shopify/ProductVariant/11', title: '50ml', availableForSale: true, price: {amount: '120.0', currencyCode: 'USD'}},
    {id: 'gid://shopify/ProductVariant/12', title: '100ml', availableForSale: true, price: {amount: '180.0', currencyCode: 'USD'}},
  ]},
  inspiredBy: {value: 'Creed Aventus'},
  accords: {value: JSON.stringify([{name: 'Fruity', strength: 90, color: '#FF6347'}])},
  notes: {value: JSON.stringify({top: ['Pineapple'], heart: ['Birch'], base: ['Musk']})},
  longevity: {value: '8-10 hours'},
  sillage: {value: 'Strong'},
  bestFor: {value: JSON.stringify(['Evening', 'Fall'])},
};

describe('toAlmasProduct', () => {
  it('maps a full Shopify node to the legacy shape', () => {
    const p = toAlmasProduct(NODE);
    expect(p.name).toBe('Midnight Aventus');
    expect(p.handle).toBe('midnight-aventus');
    expect(p.id).toBe('midnight-aventus'); // legacy keys now use handle
    expect(p.inspiredBy).toBe('Creed Aventus');
    expect(p.category).toBe('men');
    expect(p.scentFamily).toBe('Woody');
    expect(p.badge).toBe('Best Seller');
    expect(p.prices).toEqual({'50ml': 120, '100ml': 180});
    expect(p.variantBySize['50ml'].id).toBe('gid://shopify/ProductVariant/11');
    expect(p.accords[0].name).toBe('Fruity');
    expect(p.notes.top).toEqual(['Pineapple']);
    expect(p.bestFor).toEqual(['Evening', 'Fall']);
    expect(p.image).toBe('https://cdn/img.png');
  });

  it('degrades gracefully with no metafields/tags (mock.shop)', () => {
    const p = toAlmasProduct({...NODE, tags: [], inspiredBy: null, accords: null, notes: null, longevity: null, sillage: null, bestFor: null, featuredImage: null});
    expect(p.category).toBe('unisex');
    expect(p.accords).toEqual([]);
    expect(p.notes).toBeNull();
    expect(p.badge).toBeNull();
    expect(p.image).toBe('/images/bottle.png');
  });

  it('handles malformed metafield JSON', () => {
    const p = toAlmasProduct({...NODE, accords: {value: 'not-json'}});
    expect(p.accords).toEqual([]);
  });

  it('returns null for null input', () => {
    expect(toAlmasProduct(null)).toBeNull();
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `cd hydrogen && npx vitest run app/lib/almas.test.js`
Expected: FAIL — cannot resolve `./almas`.

- [ ] **Step 3: Implement**

```js
// hydrogen/app/lib/almas.js
export const SCENT_FAMILIES = ['Woody', 'Oriental', 'Floral', 'Fresh', 'Spicy', 'Amber', 'Oud', 'Citrus', 'Aromatic', 'Gourmand'];
export const BADGES = ['Best Seller', 'New', 'Limited', 'Exclusive', 'Popular', 'Trending'];
export const CATEGORIES = [
  {id: 'men', name: 'For Him'},
  {id: 'women', name: 'For Her'},
  {id: 'unisex', name: 'Unisex'},
];

function parseJSON(value, fallback) {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

export function toAlmasProduct(node) {
  if (!node) return null;
  const variants = node.variants?.nodes ?? [];
  const prices = {};
  const variantBySize = {};
  for (const v of variants) {
    prices[v.title] = Math.round(parseFloat(v.price.amount));
    variantBySize[v.title] = v;
  }
  const tags = node.tags ?? [];
  const category = tags.includes('men') ? 'men' : tags.includes('women') ? 'women' : 'unisex';
  return {
    id: node.handle,
    handle: node.handle,
    gid: node.id,
    name: node.title,
    inspiredBy: node.inspiredBy?.value ?? '',
    category,
    scentFamily: tags.find((t) => SCENT_FAMILIES.includes(t)) ?? null,
    badge: tags.find((t) => BADGES.includes(t)) ?? null,
    prices,
    variantBySize,
    accords: parseJSON(node.accords?.value, []),
    notes: parseJSON(node.notes?.value, null),
    longevity: node.longevity?.value ?? null,
    sillage: node.sillage?.value ?? null,
    bestFor: parseJSON(node.bestFor?.value, []),
    description: node.description ?? '',
    image: node.featuredImage?.url ?? '/images/bottle.png',
  };
}

const METAFIELDS = `
    inspiredBy: metafield(namespace: "almas", key: "inspired_by") { value }
    accords: metafield(namespace: "almas", key: "accords") { value }
    notes: metafield(namespace: "almas", key: "notes") { value }
`;

export const PRODUCT_CARD_FRAGMENT = `#graphql
  fragment ProductCard on Product {
    id
    handle
    title
    description
    tags
    featuredImage { url altText width height }
    variants(first: 10) {
      nodes { id title availableForSale price { amount currencyCode } }
    }
    ${METAFIELDS}
  }
`;

export const PRODUCT_FULL_FRAGMENT = `#graphql
  fragment ProductFull on Product {
    id
    handle
    title
    description
    tags
    featuredImage { url altText width height }
    images(first: 5) { nodes { url altText width height } }
    variants(first: 10) {
      nodes { id title availableForSale price { amount currencyCode } }
    }
    sellingPlanGroups(first: 2) {
      nodes {
        name
        sellingPlans(first: 5) {
          nodes {
            id
            name
            priceAdjustments { adjustmentValue { ... on SellingPlanPercentagePriceAdjustment { adjustmentPercentage } } }
          }
        }
      }
    }
    ${METAFIELDS}
    longevity: metafield(namespace: "almas", key: "longevity") { value }
    sillage: metafield(namespace: "almas", key: "sillage") { value }
    bestFor: metafield(namespace: "almas", key: "best_for") { value }
  }
`;
```

Note: `PRODUCT_CARD_FRAGMENT` omits longevity/sillage/bestFor (cards don't show them); `toAlmasProduct` handles their absence. `bestFor` in the test is only exercised via the full shape — the adapter is shared.

- [ ] **Step 4: Run tests**

Run: `npx vitest run app/lib/almas.test.js`
Expected: 4 passing.

- [ ] **Step 5: Commit** `git add -A hydrogen && git commit -m "feat(hydrogen): product adapter and GraphQL fragments"`

---

### Task 5: Layout shell — AnnouncementBar, Navbar, Footer, ScrollToTop

**Files:**
- Create: `hydrogen/app/components/AnnouncementBar.jsx`, `Navbar.jsx`, `Footer.jsx`, `ScrollToTop.jsx` (ports of same-named files in `storefront/src/components/`)
- Modify: scaffold's `PageLayout` (or `root.jsx` layout — see scaffold-map) to render `<AnnouncementBar/> <Navbar/> {children} <Footer/>` replacing the scaffold's header/footer
- Defer: `SearchDropdown.jsx` (Task 9) and `CartDrawer.jsx` (Task 6) — stub their slots: temporarily comment out their imports/usages inside Navbar with `{/* TODO(task-6) */}` markers that Tasks 6/9 remove.

- [ ] **Step 1: Port the four components** applying global conventions. In `Navbar.jsx`: cart count comes from `useAlmasCart()` — not built until Task 6 — so for THIS task import nothing and render the bag icon with count `0`, marked `{/* TODO(task-6) */}`. Wishlist icon likewise hardcodes 0 with `{/* TODO(task-11) */}`.
- [ ] **Step 2: Replace scaffold layout** — edit the scaffold layout component to use the four ported components; delete scaffold demo header/footer components it referenced.
- [ ] **Step 3: Verify** per convention 9: announcement marquee, sticky navbar, mega-footer render on `/`.
- [ ] **Step 4: Commit** `git add -A hydrogen && git commit -m "feat(hydrogen): port layout shell"`

---

### Task 6: Real cart — context, drawer, cart page, checkout redirect

**Files:**
- Create: `hydrogen/app/lib/cart.jsx` (UI state + `useAlmasCart`)
- Create: `hydrogen/app/components/AddToCartButton.jsx`
- Create: `hydrogen/app/components/CartDrawer.jsx` (port)
- Modify: `hydrogen/app/routes/cart.jsx` (scaffold's cart route: keep its action, replace its UI with the port of `LEGACY/pages/CartPage.jsx`)
- Modify: `Navbar.jsx` (remove TODO(task-6): real count + drawer open)
- Delete: nothing (scaffold cart components can be removed if unused)

The scaffold already provides the cart handler (server-side, in `app/lib/context.js`/`server.js`) and a `cart.jsx` route action handling `CartForm` mutations. We keep ALL of that and only replace UI.

- [ ] **Step 1: Cart UI context and adapter hook**

```jsx
// hydrogen/app/lib/cart.jsx
import {createContext, useContext, useState} from 'react';
import {useRouteLoaderData} from 'react-router';
import {useOptimisticCart} from '@shopify/hydrogen';

const CartUIContext = createContext(null);
const FREE_SHIPPING_THRESHOLD = 100;

export function CartUIProvider({children}) {
  const [isCartOpen, setIsCartOpen] = useState(false);
  return (
    <CartUIContext.Provider value={{isCartOpen, setIsCartOpen}}>
      {children}
    </CartUIContext.Provider>
  );
}

// Same surface the legacy components expect from useCart()
export function useAlmasCart() {
  const {isCartOpen, setIsCartOpen} = useContext(CartUIContext);
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
```

(If the scaffold's root loader keys the cart differently than `rootData.cart`, match the scaffold — check scaffold-map.)

- [ ] **Step 2: AddToCartButton**

```jsx
// hydrogen/app/components/AddToCartButton.jsx
import {CartForm} from '@shopify/hydrogen';
import {useAlmasCart} from '~/lib/cart';

/**
 * Renders children inside a CartForm submit button.
 * lines: [{merchandiseId, quantity, sellingPlanId?}]
 */
export function AddToCartButton({lines, onClick, className, children, disabled}) {
  const {setIsCartOpen} = useAlmasCart();
  return (
    <CartForm route="/cart" action={CartForm.ACTIONS.LinesAdd} inputs={{lines}}>
      {(fetcher) => (
        <button
          type="submit"
          className={className}
          disabled={disabled || fetcher.state !== 'idle'}
          onClick={(e) => {
            e.stopPropagation();
            setIsCartOpen(true);
            onClick?.(e);
          }}
        >
          {children}
        </button>
      )}
    </CartForm>
  );
}
```

- [ ] **Step 3: Mount `CartUIProvider`** in the root layout (inside ToastProvider, mirroring legacy provider nesting).

- [ ] **Step 4: Port CartDrawer**

Port `LEGACY/components/CartDrawer.jsx` applying global conventions. Line-item mapping from Shopify cart lines:

```jsx
// inside CartDrawer: legacy fields ← Shopify line
// item.name          ← line.merchandise.product.title
// item.size          ← line.merchandise.title           (variant title, "50ml")
// item.image         ← line.merchandise.image?.url ?? '/images/bottle.png'
// item.price         ← parseFloat(line.cost.totalAmount.amount) / line.quantity
// item.quantity      ← line.quantity
// item.isSubscription← Boolean(line.sellingPlanAllocation)
```

Quantity +/- and remove use `CartForm` with `CartForm.ACTIONS.LinesUpdate` / `LinesRemove` and `{lineIds: [line.id]}` / `{lines: [{id: line.id, quantity}]}`. The "Checkout" button becomes `<a href={checkoutUrl}>` (hosted checkout). Ensure the root loader's cart line fragment includes `merchandise { ... product { title handle } image { url } }` and `sellingPlanAllocation { sellingPlan { name } }` — extend the scaffold's cart fragment (usually `app/lib/fragments.js`) if missing.

- [ ] **Step 5: Cart page route** — replace scaffold `cart.jsx` UI with the port of `LEGACY/pages/CartPage.jsx` using the same line mapping; KEEP the scaffold's `action` export untouched. The legacy "Proceed to checkout" navigates to `checkoutUrl`; delete every reference to the legacy `/checkout` route (`LEGACY/pages/CheckoutPage.jsx` is NOT ported).

- [ ] **Step 6: Un-stub Navbar** — real `cartCount` badge and drawer toggle via `useAlmasCart()`; remove `TODO(task-6)` markers; render `<CartDrawer/>` from the layout.

- [ ] **Step 7: Verify on mock.shop** — from the scaffold's product page (still scaffold-styled at this point), add an item: drawer opens, count updates, +/- works, checkout button lands on a Shopify checkout URL. `npx vitest run` still green.

- [ ] **Step 8: Commit** `git add -A hydrogen && git commit -m "feat(hydrogen): real Shopify cart with ported drawer and cart page"`

---

### Task 7: ProductCard + Home page

**Files:**
- Create: `hydrogen/app/components/ProductCard.jsx` (port)
- Create: `hydrogen/app/components/ScentSilhouette.jsx`, `AccordBar.jsx`, `ScentRadar.jsx` (ports, no data deps — near-verbatim)
- Modify: `hydrogen/app/routes/_index.jsx` (replace scaffold home with port of `LEGACY/pages/HomePage.jsx`)
- Create: `hydrogen/app/lib/banners.js` (copy of `LEGACY/data/banners.js`, static content — this is marketing copy, not product data, so a direct copy is correct)

- [ ] **Step 1: Port ProductCard.** Apply global conventions. Specific changes beyond them:

```jsx
// was:
const handleQuickAdd = (e) => { e.preventDefault(); e.stopPropagation(); addToCart(product, selectedSize); setIsCartOpen(true); addToast(...) }
// ...
<button onClick={handleQuickAdd} className="...">Add to Bag — ${price}</button>

// becomes: (AddToCartButton from Task 6; variant id from adapter)
const variant = product.variantBySize?.[selectedSize];
// ...
<AddToCartButton
  lines={variant ? [{merchandiseId: variant.id, quantity: 1}] : []}
  disabled={!variant}
  onClick={(e) => { e.preventDefault(); addToast(`${product.name} added to bag`, 'success'); }}
  className="(same classes as legacy quick-add button)"
>
  <ShoppingBag size={13} strokeWidth={1.5} />
  Add to Bag — ${price}
</AddToCartButton>
```

Also guard `const sizes = Object.keys(product.prices || {})` and default `selectedSize` to `sizes[0]` (mock.shop variants aren't named 50ml/100ml).

- [ ] **Step 2: Home route.** Port `LEGACY/pages/HomePage.jsx` as the `_index.jsx` route component. Add a loader fetching featured products:

```js
import {toAlmasProduct, PRODUCT_CARD_FRAGMENT} from '~/lib/almas';

export async function loader({context}) {
  const {products} = await context.storefront.query(FEATURED_QUERY);
  return {featured: products.nodes.map(toAlmasProduct)};
}

const FEATURED_QUERY = `#graphql
  ${PRODUCT_CARD_FRAGMENT}
  query FeaturedProducts {
    products(first: 8, sortKey: BEST_SELLING) { nodes { ...ProductCard } }
  }
`;
```

In the component, `useLoaderData()` replaces the legacy `products.filter(...)` selections (best sellers / new arrivals sections both draw from `featured`; if the legacy home page has distinct sections, add a second query field with `query: "tag:New"` for new arrivals — mirror whatever sections `HomePage.jsx` actually renders).

- [ ] **Step 3: Verify** home page renders end-to-end with mock.shop data, cards quick-add to cart.
- [ ] **Step 4: Commit** `git add -A hydrogen && git commit -m "feat(hydrogen): port product card and home page"`

---

### Task 8: Shop page with filters

**Files:**
- Create: `hydrogen/app/routes/shop.jsx` (port of `LEGACY/pages/ShopPage.jsx`)

- [ ] **Step 1: Loader.** Legacy ShopPage filters the full 143-product array client-side by category/scent family/price and sorts. Keep that UX: fetch up to 250 products once and keep client-side filtering (143 products fit in one page):

```js
export async function loader({context}) {
  const {products} = await context.storefront.query(ALL_PRODUCTS_QUERY);
  return {products: products.nodes.map(toAlmasProduct)};
}

const ALL_PRODUCTS_QUERY = `#graphql
  ${PRODUCT_CARD_FRAGMENT}
  query AllProducts {
    products(first: 250) { nodes { ...ProductCard } }
  }
`;
```

- [ ] **Step 2: Port the page component.** Filter/sort logic transfers verbatim (it operates on the legacy shape the adapter reproduces). URL params (`?category=men` etc.) keep working via `useSearchParams` from `react-router`.
- [ ] **Step 3: Verify** `/shop` renders grid, filters and sorting work (on mock.shop, category filters may yield empty states — confirm the empty state renders, not a crash).
- [ ] **Step 4: Commit** `git add -A hydrogen && git commit -m "feat(hydrogen): port shop page with filters"`

---

### Task 9: Search — results page + navbar dropdown

**Files:**
- Create: `hydrogen/app/routes/search.jsx` (port of `LEGACY/pages/SearchResultsPage.jsx`; if the scaffold generated `search.jsx`, replace its UI, keep its loader shape)
- Create: `hydrogen/app/components/SearchDropdown.jsx` (port)
- Modify: `Navbar.jsx` (remove the search TODO stub)

- [ ] **Step 1: Search route loader** using Storefront search:

```js
export async function loader({request, context}) {
  const url = new URL(request.url);
  const q = url.searchParams.get('q') ?? '';
  if (!q) return {q, results: []};
  const {search} = await context.storefront.query(SEARCH_QUERY, {variables: {q}});
  return {q, results: search.nodes.map(toAlmasProduct)};
}

const SEARCH_QUERY = `#graphql
  ${PRODUCT_CARD_FRAGMENT}
  query SearchProducts($q: String!) {
    search(query: $q, first: 50, types: PRODUCT) {
      nodes { ...on Product { ...ProductCard } }
    }
  }
`;
```

- [ ] **Step 2: Port SearchResultsPage UI** over that loader data.
- [ ] **Step 3: Port SearchDropdown.** Legacy filters the local array as you type; new version debounces (250ms) a `fetcher.load('/search?q=...')` via `useFetcher()` and renders `fetcher.data?.results?.slice(0, 5)`. Keep the exact markup/styling; wire into Navbar removing the Task-5 stub.
- [ ] **Step 4: Verify** typing in navbar search shows suggestions (mock.shop titles); `/search?q=shirt` style queries render the results grid.
- [ ] **Step 5: Commit** `git add -A hydrogen && git commit -m "feat(hydrogen): port search page and predictive dropdown"`

---

### Task 10: Product detail page (with subscription option)

**Files:**
- Create: `hydrogen/app/routes/products.$handle.jsx` (replace scaffold version; UI is the port of `LEGACY/pages/ProductPage.jsx`)

- [ ] **Step 1: Loader**

```js
import {toAlmasProduct, PRODUCT_FULL_FRAGMENT, PRODUCT_CARD_FRAGMENT} from '~/lib/almas';

export async function loader({params, context}) {
  const {product} = await context.storefront.query(PRODUCT_QUERY, {
    variables: {handle: params.handle},
  });
  if (!product) throw new Response('Not found', {status: 404});
  const {products: related} = await context.storefront.query(RELATED_QUERY);
  return {
    product: toAlmasProduct(product),
    sellingPlanGroups: product.sellingPlanGroups?.nodes ?? [],
    related: related.nodes.map(toAlmasProduct).filter((p) => p.handle !== params.handle).slice(0, 4),
  };
}

const PRODUCT_QUERY = `#graphql
  ${PRODUCT_FULL_FRAGMENT}
  query ProductByHandle($handle: String!) {
    product(handle: $handle) { ...ProductFull }
  }
`;

const RELATED_QUERY = `#graphql
  ${PRODUCT_CARD_FRAGMENT}
  query RelatedProducts {
    products(first: 8, sortKey: BEST_SELLING) { nodes { ...ProductCard } }
  }
`;
```

- [ ] **Step 2: Port ProductPage UI.** ScentRadar/AccordBar/notes/longevity/sillage sections read the adapter fields and keep their existing null-guards. Size selector drives `variantBySize`. The legacy "Subscribe & Save 15%" toggle (`isSubscription` flag) becomes a selling-plan picker:

```jsx
const plan = sellingPlanGroups[0]?.sellingPlans?.nodes?.[0] ?? null;
const [subscribe, setSubscribe] = useState(false);
const variant = product.variantBySize?.[selectedSize];
const lines = variant
  ? [{merchandiseId: variant.id, quantity, ...(subscribe && plan ? {sellingPlanId: plan.id} : {})}]
  : [];
// Render the legacy one-time vs subscribe radio UI; hide the subscribe option
// entirely when `plan` is null (mock.shop / store without the Subscriptions app).
<AddToCartButton lines={lines} disabled={!variant} onClick={() => addToast(`${product.name} added to bag`, 'success')} className="(legacy classes)">
  Add to Bag — ${subscribe && plan ? Math.round(price * 0.85) : price}
</AddToCartButton>
```

Related-products section uses `related` from the loader instead of legacy array filtering.

- [ ] **Step 3: Verify** `/products/<any-mockshop-handle>` renders; add to cart works; scent sections hidden gracefully (no metafields on mock.shop); subscribe option hidden (no plans).
- [ ] **Step 4: Commit** `git add -A hydrogen && git commit -m "feat(hydrogen): port product detail page with selling-plan support"`

---

### Task 11: Wishlist

**Files:**
- Create: `hydrogen/app/lib/wishlist.jsx` (port of `LEGACY/context/WishlistContext.jsx`)
- Create: `hydrogen/app/routes/wishlist.jsx` (port of `LEGACY/pages/WishlistPage.jsx`)
- Modify: `Navbar.jsx` (remove TODO(task-11): real wishlist count)

- [ ] **Step 1: Port WishlistContext** applying conventions; keys become `product.handle` (adapter sets `id = handle`, so if the legacy context keys on `product.id` it works unchanged — verify and keep localStorage key `almas_wishlist`). It stores whole product objects in localStorage exactly as legacy does, so the wishlist page renders offline data without a loader.
- [ ] **Step 2: Guard SSR:** localStorage isn't available during server render. Initialize state to `[]` and hydrate in a `useEffect` on mount (this differs from legacy's lazy `useState(load)` — required for Hydrogen SSR):

```jsx
const [items, setItems] = useState([]);
useEffect(() => { setItems(load()); }, []);
useEffect(() => { localStorage.setItem('almas_wishlist', JSON.stringify(items)); }, [items]);
```

Wrap the second effect to skip the very first run (a `useRef(false)` mounted flag) so hydration doesn't clobber storage with `[]`.
- [ ] **Step 3: Mount provider** in root layout; port WishlistPage; un-stub the Navbar count.
- [ ] **Step 4: Verify** heart toggles persist across reload; wishlist page lists items; count badge updates.
- [ ] **Step 5: Commit** `git add -A hydrogen && git commit -m "feat(hydrogen): port wishlist (localStorage)"`

---

### Task 12: Scent finder quiz

**Files:**
- Create: `hydrogen/app/routes/scent-finder.jsx` (port of `LEGACY/pages/ScentFinderPage.jsx`)

- [ ] **Step 1: Loader** — same `ALL_PRODUCTS_QUERY` as Task 8 (extract that query + loader into `~/lib/almas.js` as `loadAllProducts(context)` and reuse in both routes — DRY).
- [ ] **Step 2: Port the quiz.** Scoring logic operates on `scentFamily`, `accords`, `bestFor`, `category` — all reproduced by the adapter; the algorithm ports verbatim, reading products from `useLoaderData()` instead of the static import.
- [ ] **Step 3: Verify** quiz completes and recommends products (on mock.shop scores will be flat since metafields are absent — confirm it still returns results and renders).
- [ ] **Step 4: Commit** `git add -A hydrogen && git commit -m "feat(hydrogen): port scent finder quiz"`

---

### Task 13: Static pages, subscription page, 404

**Files:**
- Create: `hydrogen/app/routes/about.jsx`, `faq.jsx`, `shipping.jsx`, `privacy.jsx`, `terms.jsx`, `contact.jsx`, `subscription.jsx` (ports of the same-named `LEGACY/pages/*.jsx`)
- Modify: scaffold's catch-all/404 (`$.jsx` or root ErrorBoundary) with the port of `LEGACY/pages/NotFoundPage.jsx`

- [ ] **Step 1: Port the six static pages** applying conventions (content-only pages; expect only import swaps). Contact form keeps its current client-side-only behavior (legacy has no backend — preserve exactly what it does today, including any fake-submit toast).
- [ ] **Step 2: Subscription page** — port `SubscriptionPage.jsx` marketing content; its CTA buttons link to `/shop`. If the page displays plan pricing examples, keep the static 15%/3-month copy (it matches the real plan the owner will create).
- [ ] **Step 3: 404** — port NotFoundPage into the root ErrorBoundary (404 branch) and/or `$.jsx` catch-all per scaffold-map.
- [ ] **Step 4: Verify** every route + a garbage URL renders correctly.
- [ ] **Step 5: Commit** `git add -A hydrogen && git commit -m "feat(hydrogen): port static pages, subscription page, 404"`

---

### Task 14: Product migration script (TDD)

**Files:**
- Create: `scripts/migrate-products.mjs` (repo root)
- Create: `scripts/lib/transform.mjs`
- Test: `scripts/lib/transform.test.mjs`
- Modify: root — add `package.json` if none exists at repo root:

```json
{
  "name": "almas-scripts",
  "private": true,
  "type": "module",
  "scripts": {"migrate": "node scripts/migrate-products.mjs", "test": "vitest run scripts"},
  "devDependencies": {"vitest": "^3.0.0"}
}
```

- [ ] **Step 1: Write the failing transform test**

```js
// scripts/lib/transform.test.mjs
import {describe, it, expect} from 'vitest';
import {toProductSetInput, slugify} from './transform.mjs';

const LEGACY_PRODUCT = {
  id: 1,
  name: 'Midnight Aventus',
  inspiredBy: 'Creed Aventus',
  category: 'men',
  scentFamily: 'Woody',
  badge: 'Best Seller',
  prices: {'50ml': 120, '100ml': 180},
  accords: [{name: 'Fruity', strength: 90, color: '#FF6347'}],
  notes: {top: ['Pineapple'], heart: ['Birch'], base: ['Musk']},
  longevity: '8-10 hours',
  sillage: 'Strong',
  bestFor: ['Evening', 'Fall', 'Winter'],
  description: 'A bold fragrance.',
  image: '/products/midnight-aventus.png',
};

describe('slugify', () => {
  it('makes url-safe handles', () => {
    expect(slugify('Midnight Aventus')).toBe('midnight-aventus');
    expect(slugify("L'Éclat No. 5")).toBe('l-eclat-no-5');
  });
});

describe('toProductSetInput', () => {
  it('builds a complete ProductSetInput', () => {
    const input = toProductSetInput(LEGACY_PRODUCT);
    expect(input.handle).toBe('midnight-aventus');
    expect(input.title).toBe('Midnight Aventus');
    expect(input.vendor).toBe('ALMAS');
    expect(input.status).toBe('ACTIVE');
    expect(input.tags).toEqual(['men', 'Woody', 'Best Seller']);
    expect(input.productOptions).toEqual([
      {name: 'Size', values: [{name: '50ml'}, {name: '100ml'}]},
    ]);
    expect(input.variants).toEqual([
      {optionValues: [{optionName: 'Size', name: '50ml'}], price: '120'},
      {optionValues: [{optionName: 'Size', name: '100ml'}], price: '180'},
    ]);
    const mf = Object.fromEntries(input.metafields.map((m) => [m.key, m]));
    expect(mf.inspired_by).toEqual({namespace: 'almas', key: 'inspired_by', type: 'single_line_text_field', value: 'Creed Aventus'});
    expect(JSON.parse(mf.accords.value)).toEqual(LEGACY_PRODUCT.accords);
    expect(JSON.parse(mf.notes.value)).toEqual(LEGACY_PRODUCT.notes);
    expect(mf.longevity.value).toBe('8-10 hours');
    expect(mf.sillage.value).toBe('Strong');
    expect(mf.best_for.type).toBe('list.single_line_text_field');
    expect(JSON.parse(mf.best_for.value)).toEqual(['Evening', 'Fall', 'Winter']);
  });

  it('omits badge tag and empty metafields when fields missing', () => {
    const input = toProductSetInput({...LEGACY_PRODUCT, badge: undefined, inspiredBy: undefined});
    expect(input.tags).toEqual(['men', 'Woody']);
    expect(input.metafields.find((m) => m.key === 'inspired_by')).toBeUndefined();
  });
});
```

- [ ] **Step 2: Run to verify failure** — `npm i && npx vitest run scripts` at repo root. Expected: FAIL (module not found).

- [ ] **Step 3: Implement transform**

```js
// scripts/lib/transform.mjs
export function slugify(name) {
  return name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function metafield(key, type, value) {
  return value == null || value === '' ? null : {namespace: 'almas', key, type, value};
}

export function toProductSetInput(p) {
  return {
    handle: slugify(p.name),
    title: p.name,
    descriptionHtml: `<p>${p.description ?? ''}</p>`,
    productType: 'Fragrance',
    vendor: 'ALMAS',
    status: 'ACTIVE',
    tags: [p.category, p.scentFamily, p.badge].filter(Boolean),
    productOptions: [{name: 'Size', values: Object.keys(p.prices).map((name) => ({name}))}],
    variants: Object.entries(p.prices).map(([size, price]) => ({
      optionValues: [{optionName: 'Size', name: size}],
      price: String(price),
    })),
    metafields: [
      metafield('inspired_by', 'single_line_text_field', p.inspiredBy),
      metafield('accords', 'json', p.accords && JSON.stringify(p.accords)),
      metafield('notes', 'json', p.notes && JSON.stringify(p.notes)),
      metafield('longevity', 'single_line_text_field', p.longevity),
      metafield('sillage', 'single_line_text_field', p.sillage),
      metafield('best_for', 'list.single_line_text_field', p.bestFor?.length ? JSON.stringify(p.bestFor) : null),
    ].filter(Boolean),
  };
}

export const COLLECTIONS = [
  {title: 'For Him', handle: 'for-him', tag: 'men'},
  {title: 'For Her', handle: 'for-her', tag: 'women'},
  {title: 'Unisex', handle: 'unisex', tag: 'unisex'},
  ...['Woody', 'Oriental', 'Floral', 'Fresh', 'Spicy', 'Amber', 'Oud', 'Citrus', 'Aromatic', 'Gourmand']
    .map((f) => ({title: f, handle: slugify(f), tag: f})),
];
```

- [ ] **Step 4: Run tests** — `npx vitest run scripts`. Expected: 3 passing.

- [ ] **Step 5: Write the migration runner**

```js
// scripts/migrate-products.mjs
import {existsSync, readFileSync} from 'node:fs';
import {resolve, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {products} from '../storefront/src/data/products.js';
import {toProductSetInput, COLLECTIONS} from './lib/transform.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DOMAIN = process.env.SHOPIFY_STORE_DOMAIN; // e.g. almas-dev.myshopify.com
const TOKEN = process.env.SHOPIFY_ADMIN_TOKEN;   // shpat_... from custom app
if (!DOMAIN || !TOKEN) {
  console.error('Set SHOPIFY_STORE_DOMAIN and SHOPIFY_ADMIN_TOKEN. See docs/STORE_SETUP.md');
  process.exit(1);
}
const ENDPOINT = `https://${DOMAIN}/admin/api/2025-10/graphql.json`;

async function gql(query, variables) {
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {'Content-Type': 'application/json', 'X-Shopify-Access-Token': TOKEN},
    body: JSON.stringify({query, variables}),
  });
  if (res.status === 429) {
    await new Promise((r) => setTimeout(r, 2000));
    return gql(query, variables);
  }
  const body = await res.json();
  if (body.errors) throw new Error(JSON.stringify(body.errors));
  return body.data;
}

async function findProductId(handle) {
  const data = await gql(
    `query($q: String!) { products(first: 1, query: $q) { nodes { id handle } } }`,
    {q: `handle:${handle}`},
  );
  const node = data.products.nodes[0];
  return node && node.handle === handle ? node.id : null;
}

const PRODUCT_SET = `
  mutation productSet($input: ProductSetInput!) {
    productSet(input: $input) {
      product { id handle }
      userErrors { field message }
    }
  }`;

const MEDIA_CREATE = `
  mutation productCreateMedia($productId: ID!, $media: [CreateMediaInput!]!) {
    productCreateMedia(productId: $productId, media: $media) {
      media { id }
      mediaUserErrors { field message }
    }
  }`;

async function uploadLocalImage(path) {
  // stagedUploadsCreate -> POST file -> return resourceUrl
  const filename = path.split('/').pop();
  const data = await gql(
    `mutation($input: [StagedUploadInput!]!) {
      stagedUploadsCreate(input: $input) {
        stagedTargets { url resourceUrl parameters { name value } }
        userErrors { field message }
      }
    }`,
    {input: [{resource: 'IMAGE', filename, mimeType: 'image/png', httpMethod: 'POST'}]},
  );
  const target = data.stagedUploadsCreate.stagedTargets[0];
  const form = new FormData();
  for (const p of target.parameters) form.append(p.name, p.value);
  form.append('file', new Blob([readFileSync(path)]), filename);
  const up = await fetch(target.url, {method: 'POST', body: form});
  if (!up.ok) throw new Error(`upload failed: ${up.status}`);
  return target.resourceUrl;
}

async function migrateProducts() {
  let created = 0, updated = 0;
  for (const p of products) {
    const input = toProductSetInput(p);
    const existingId = await findProductId(input.handle);
    if (existingId) input.id = existingId;
    const data = await gql(PRODUCT_SET, {input});
    const errs = data.productSet.userErrors;
    if (errs.length) throw new Error(`${input.handle}: ${JSON.stringify(errs)}`);
    const productId = data.productSet.product.id;
    existingId ? updated++ : created++;

    // Attach dedicated image only on first create (avoid duplicate media on re-runs)
    const imgPath = p.image && resolve(ROOT, 'storefront/public', '.' + p.image);
    if (!existingId && imgPath && existsSync(imgPath)) {
      const resourceUrl = await uploadLocalImage(imgPath);
      const media = await gql(MEDIA_CREATE, {
        productId,
        media: [{originalSource: resourceUrl, mediaContentType: 'IMAGE', alt: p.name}],
      });
      const mErrs = media.productCreateMedia.mediaUserErrors;
      if (mErrs.length) console.warn(`  media warning ${input.handle}:`, mErrs);
    }
    console.log(`${existingId ? 'updated' : 'created'} ${input.handle}`);
  }
  console.log(`\nProducts: ${created} created, ${updated} updated.`);
}

async function migrateCollections() {
  for (const c of COLLECTIONS) {
    const found = await gql(
      `query($handle: String!) { collectionByHandle(handle: $handle) { id } }`,
      {handle: c.handle},
    );
    if (found.collectionByHandle) {
      console.log(`collection exists: ${c.handle}`);
      continue;
    }
    const data = await gql(
      `mutation($input: CollectionInput!) {
        collectionCreate(input: $input) {
          collection { id handle }
          userErrors { field message }
        }
      }`,
      {input: {
        title: c.title,
        handle: c.handle,
        ruleSet: {appliedDisjunctively: false, rules: [{column: 'TAG', relation: 'EQUALS', condition: c.tag}]},
      }},
    );
    const errs = data.collectionCreate.userErrors;
    if (errs.length) throw new Error(`${c.handle}: ${JSON.stringify(errs)}`);
    console.log(`created collection: ${c.handle}`);
  }
}

await migrateProducts();
await migrateCollections();
console.log('Done. Reminder: create the "Scent Subscription" selling plan in the Shopify Subscriptions app (see docs/STORE_SETUP.md §4).');
```

- [ ] **Step 6: Dry validation without a store** — `node --check scripts/migrate-products.mjs` passes; running without env vars prints the setup message and exits 1. (Live run happens in Task 17.)

- [ ] **Step 7: Commit**

```bash
git add package.json scripts && git commit -m "feat: idempotent product migration script (Admin GraphQL)"
```

---

### Task 15: Store setup documentation

**Files:**
- Create: `docs/STORE_SETUP.md`

- [ ] **Step 1: Write the owner guide** with these numbered sections (click-by-click, each step one action):
  1. **Partners account + dev store:** partners.shopify.com → sign up (free) → Stores → Add store → Create development store → name it (e.g. `almas-dev`), purpose "test and build". Record `<store>.myshopify.com`.
  2. **Admin API token for migration:** Store admin → Settings → Apps and sales channels → Develop apps → Allow custom app development → Create app ("almas-migration") → Configure Admin API scopes: `read_products`, `write_products`, `read_files`, `write_files` → Install app → reveal Admin API access token (`shpat_...`) once and save it.
  3. **Run migration:** at repo root, `SHOPIFY_STORE_DOMAIN=<store>.myshopify.com SHOPIFY_ADMIN_TOKEN=shpat_... npm run migrate`. Expected output ends `Products: 143 created, 0 updated.` Safe to re-run.
  4. **Subscriptions:** admin → Apps → Shopify App Store → install the free "Shopify Subscriptions" app → Create plan: name "Scent Subscription", delivery every 3 months, 15% discount → apply to all products.
  5. **Connect Hydrogen:** in `hydrogen/`, run `npx shopify hydrogen link` (creates/links a Hydrogen storefront on the store and provisions the Storefront API + Customer Account API config), then `npx shopify hydrogen env pull` to write `.env`. Restart `npm run dev` — the app now serves real Almas products.
  6. **Deploy:** `npx shopify hydrogen deploy` → Oxygen URL; later attach a custom domain in admin.
- [ ] **Step 2: Commit** `git add docs/STORE_SETUP.md && git commit -m "docs: click-by-click Shopify store setup guide"`

---

### Task 16: Customer accounts restyle

**Files:**
- Modify: scaffold's `account_.login.jsx` / `account.jsx` / nested account routes (names per scaffold-map)
- Modify: `Navbar.jsx` (account icon → `/account`)
- Delete: nothing from scaffold logic — restyle only

The scaffold already implements Customer Account API OAuth (login redirect, orders, profile, addresses, logout). Legacy `LoginPage`/`RegisterPage`/`AuthContext` are NOT ported (password auth is replaced by hosted OAuth).

- [ ] **Step 1: Restyle account routes** to the Almas design system: apply the typography/spacing/button classes used in `LEGACY/pages/AccountPage.jsx` to the scaffold's account order-list, order-detail, profile, and addresses views. Keep every loader/action untouched.
- [ ] **Step 2: Navbar account icon** links to `/account` (scaffold redirects to hosted login when logged out).
- [ ] **Step 3: Verify (limited on mock.shop):** mock.shop has no Customer Account API — verify the routes compile and `/account` triggers the login redirect without crashing. Full verification is a Task 17 item post store setup.
- [ ] **Step 4: Commit** `git add -A hydrogen && git commit -m "feat(hydrogen): restyle customer account pages to Almas design"`

---

### Task 17: Final verification

**Files:** none new (fixes only, plus `docs/superpowers/plans/2026-07-10-launch-checklist.md`)

- [ ] **Step 1: Full mock.shop walkthrough.** `npm run dev`; visit `/`, `/shop` (+ filters/sort), `/products/<handle>` (sizes, add, subscribe hidden), `/search?q=...` + navbar dropdown, `/cart` (+ drawer, quantities, remove, checkout link), `/wishlist` (+ toggle/persist), `/scent-finder` (complete quiz), `/subscription`, `/about`, `/faq`, `/shipping`, `/privacy`, `/terms`, `/contact`, garbage URL → 404. Fix anything broken.
- [ ] **Step 2: Quality gates.** In `hydrogen/`: `npm run lint` clean, `npx vitest run` green, `npm run build` succeeds. At root: `npx vitest run scripts` green.
- [ ] **Step 3: Write the post-store-setup checklist** (`docs/superpowers/plans/2026-07-10-launch-checklist.md`): run migration; `hydrogen link`/`env pull`; re-walk all routes against real data (143 products, radar/accords/notes render from metafields, subscribe toggle appears with the real plan, hosted checkout completes a test order with Shopify's test gateway, account login/orders work); `hydrogen deploy`. Each as a checkbox.
- [ ] **Step 4: Commit** `git add -A && git commit -m "chore: final verification fixes and launch checklist"`
- [ ] **Step 5: Push** `git push origin main` (repo is the user's own `habash2005/Almas`).

---

## Self-review notes (already applied)

- **Spec coverage:** products/cart/checkout (T4–T10), accounts (T16), subscriptions (T10 PDP + T13 page + T15 §4 owner step), migration (T14), mock.shop-first testing (every task) + real-store checklist (T17), owner docs (T15), design port (T2–T13). Legacy `CheckoutPage`/`LoginPage`/`RegisterPage`/`AuthContext` intentionally not ported per spec.
- **Known judgment calls:** shop page keeps client-side filtering over one 250-product query (matches legacy UX, fine at 143 products); wishlist stores product snapshots in localStorage exactly like legacy; only products with a dedicated image file get media (2 exist today — cards use the shared tinted bottle render regardless, same as legacy).
- **Scaffold drift:** exact scaffold filenames may differ by CLI version; Task 1 Step 3's scaffold-map is the source of truth and later tasks defer to it.
