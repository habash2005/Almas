# Review follow-ups to sweep in Task 17

Accumulated non-blocking findings from per-task code reviews.
Swept in Task 17 (final verification) — 2026-07-12.

- [x] Codegen noise: `[Codegen] Error: Variable "METAFIELDS" not found` — FIXED in 8e09cb3 (metafield lines inlined into both fragments). Verified: no codegen errors in dev-server output.
- [x] Price sorts no-op on mock.shop (`shop.($category).jsx` comparators read `prices['50ml']`, mock variants aren't named that). FIXED in Task 17: comparators fall back to the cheapest variant price. Verified asc/desc reorder correctly against mock.shop.
- [ ] DEFERRED — Shop route `BADGES` list (4 values) vs `almas.js` `BADGES` (6) — badges Limited/Exclusive/Trending unfilterable. Pre-existing in legacy; kept for 1:1 parity.
- [ ] DEFERRED — `products(first: 250)` truncates catalogs >250 (143 today; fine). Revisit only if the catalog grows past 250.
- [x] Cart: optimistic lines flash $0.00 until revalidation. FIXED in Task 17: cart-add lines now carry `selectedVariant` (also silences the `useOptimisticCart` console error on every add), and `toAlmasCartItem` falls back to the variant price when the line has no cost yet.
- [ ] DEFERRED — Cart drawer: `inspiredBy` line dropped (needs a product metafield added to the cart line query + adapter + drawer UI). Cosmetic parity gap; not worth a cart-query change in the final pass.
- [ ] DEFERRED — Cart page: "You Might Also Like" upsell grid omitted (needs product data in the cart route loader). Non-trivial loader change; left out per Task 17 scope.
- [ ] DEFERRED — Subscription line items: legacy line-through original price not shown (Shopify prices selling plans server-side). Cosmetic.
- [x] ScrollToTop overrides ScrollRestoration back/forward scroll — INTENTIONAL, matches legacy behavior. No action.
- [x] 11 pre-existing scaffold lint errors — FIXED in Task 17 (unused vars removed; `env.d.ts` excluded from eslint since the type-aware parser wants a tsconfig this JS project doesn't have). Lint: 0 errors.
- [x] Toast fires on click not mutation-success for add/remove — INTENTIONAL, matches legacy feel. No action.
- [x] products.$handle.jsx meta: canonical descriptor — FIXED in 73655d8 (`tagName: 'link'`, href gated on `data?.product?.handle`). Verified in source.
- [ ] DEFERRED — PDP related products are global BEST_SELLING while "View All" links to `/shop/${category}` — semantic mismatch, agreed design for now.
- [x] SearchDropdown links via `product.id` — FIXED in Task 17: reads `product.handle` like ProductCard (adapter's id-holds-handle conflation no longer load-bearing here).
