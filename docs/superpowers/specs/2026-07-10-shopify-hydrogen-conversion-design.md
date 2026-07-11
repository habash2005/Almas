# Almas → Shopify Hydrogen Conversion — Design

**Date:** 2026-07-10
**Status:** Approved

## Goal

Convert the Almas perfume storefront (React/Vite SPA with hardcoded data and mock
commerce, currently in `storefront/`) into a real Shopify-powered store using
Hydrogen, Shopify's official headless framework. Scope includes products, cart,
hosted checkout, customer accounts, subscriptions, and product data migration.

## Architecture

- New Hydrogen app at `hydrogen/` in this repo, scaffolded with the latest
  `@shopify/create-hydrogen` (React Router–based). The existing `storefront/`
  stays untouched as the design reference.
- Data source: a Shopify **development store** (to be created by the owner via a
  free Shopify Partners account). Until it exists, the app runs against
  Shopify's public `mock.shop` Storefront API so all development and testing can
  proceed; swapping to the real store is an `.env` change.
- Hosting target: Shopify Oxygen (included with the store). The old Netlify
  deployment is retired at cutover.
- Checkout is Shopify's hosted checkout (the standard for headless Shopify).
  The existing mock `CheckoutPage` is retired; the cart's checkout button uses
  the Shopify cart's `checkoutUrl`.

## Product data migration

`scripts/migrate-products.mjs` (Node, Admin GraphQL API):

- Reads `storefront/src/data/products.js` (146 products, categories, scent
  families).
- Creates each product with:
  - Two variants — **50ml** and **100ml** — with the real prices from `prices`.
  - Product image uploaded from `storefront/public/products/` where one exists;
    products without a dedicated image get the shared bottle render.
  - Tags: category (`men`/`women`/`unisex`), scent family, badge.
  - Metafields, namespace `almas`:
    | key | type | source |
    |-----|------|--------|
    | `inspired_by` | single_line_text_field | `inspiredBy` |
    | `accords` | json | `accords` (name/strength/color, feeds ScentRadar + AccordBar) |
    | `notes` | json | `notes` (top/heart/base) |
    | `longevity` | single_line_text_field | `longevity` |
    | `sillage` | single_line_text_field | `sillage` |
    | `best_for` | list.single_line_text_field | `bestFor` |
- Creates collections: For Him, For Her, Unisex, and one per scent family
  (rule-based on tags).
- Creates a selling plan group ("Scent Subscription", monthly, discount %) and
  attaches all products (see Subscriptions).
- **Idempotent:** keyed on product handle; re-runs update rather than duplicate.
- Auth: `SHOPIFY_STORE_DOMAIN` + `SHOPIFY_ADMIN_TOKEN` env vars.

## Design port (1:1 visual parity)

Ported from `storefront/src/`:

- `index.css` design system (tokens, fonts, animations).
- Layout: AnnouncementBar, Navbar, SearchDropdown, CartDrawer, Footer, Toast,
  ScrollToTop.
- Product UI: ProductCard, ScentRadar, AccordBar, ScentSilhouette,
  scent-theme utilities, scroll-animation hook.

## Routes

| Old page | Hydrogen route | Notes |
|----------|----------------|-------|
| HomePage | `/` | banners/data ported; featured products from Storefront API |
| ShopPage | `/shop` (collections + filters) | filters map to collections/tags |
| ProductPage | `/products/:handle` | metafields feed radar/accords/notes; selling-plan picker |
| SearchResultsPage | `/search` | Storefront API search; SearchDropdown uses predictive search |
| CartPage | `/cart` | real Shopify cart |
| CheckoutPage | — removed | hosted checkout via `checkoutUrl` |
| Login/Register/Account | `/account/*` | Customer Account API; hosted OAuth login replaces custom forms |
| SubscriptionPage | `/subscription` | real selling plans |
| ScentFinderPage | `/scent-finder` | quiz stays client-side, scores live products |
| WishlistPage | `/wishlist` | localStorage, keyed by product handle |
| About/FAQ/Shipping/Privacy/Terms/Contact | static routes | content ported as-is |
| NotFoundPage | catch-all | ported |

## Cart, accounts, subscriptions

- **Cart:** Hydrogen cart handler (context + optimistic updates); drawer and
  cart page both drive it. Line items carry variant (size) and optional selling
  plan.
- **Accounts:** Shopify Customer Account API (hosted OAuth). Login/Register
  become a redirect to Shopify auth; `/account` shows real orders, addresses,
  profile. Note: requires the real dev store (not available on mock.shop) —
  built to Hydrogen's standard account skeleton, verified after store setup.
- **Subscriptions:** free Shopify Subscriptions app installed on the store;
  migration script attaches a monthly selling plan with a discount to all
  products. PDP offers one-time vs. subscribe; subscription page markets the
  program and links into it.

## Error handling

- Route-level error boundaries (Hydrogen defaults) with branded 404/500.
- Missing metafields degrade gracefully (radar/accords sections hide).
- Cart mutations surface failures via the existing Toast pattern.

## Testing

1. Develop and verify against `mock.shop` (all routes render, cart works).
2. After the owner creates the dev store: run migration, point `.env` at the
   store, re-verify products/metafields/cart/checkout/accounts/subscriptions.
3. Hydrogen GraphQL codegen + ESLint clean; manual walk of every route.

## Owner's manual steps (documented click-by-click when reached)

1. Create free Shopify Partners account + development store.
2. Create an Admin API custom app token (for migration script).
3. Install the Shopify Subscriptions app.
4. (Cutover) point DNS / retire Netlify.

## Phases

1. Hydrogen scaffold + design system port (against mock.shop).
2. Core commerce routes: home, shop, product, search, cart + drawer.
3. Client-side features: scent finder, wishlist, static pages.
4. Migration script + store setup docs.
5. Accounts + subscriptions (needs real store).
