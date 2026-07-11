# Review follow-ups to sweep in Task 17

Accumulated non-blocking findings from per-task code reviews.

- [ ] Codegen noise: `[Codegen] Error: Variable "METAFIELDS" not found` — `PRODUCT_CARD_FRAGMENT`/`PRODUCT_FULL_FRAGMENT` in `hydrogen/app/lib/almas.js` interpolate a plain string into `#graphql` literals; typegen-only noise (runtime fine). Fix: inline the three metafield lines into both fragments.
- [ ] Price sorts no-op on mock.shop (`shop.($category).jsx` comparators read `prices['50ml']`, mock variants aren't named that). Self-heals with real migrated data; optionally add a min-variant-price fallback in `toAlmasProduct`.
- [ ] Shop route `BADGES` list (4 values) vs `almas.js` `BADGES` (6) — badges Limited/Exclusive/Trending unfilterable. Pre-existing in legacy; reconcile or leave.
- [ ] `products(first: 250)` truncates catalogs >250 (146 today; fine).
- [ ] Cart: optimistic lines flash $0.00 until revalidation (inherent to useOptimisticCart). Cosmetic.
- [ ] Cart drawer: `inspiredBy` line dropped (needs product metafield in cart line query) — candidate for Task 10.
- [ ] Cart page: "You Might Also Like" upsell grid omitted (needs product data in cart route loader; ProductCard now exists) — candidate to restore in Task 10 or 17.
- [ ] Subscription line items: legacy line-through original price not shown (Shopify prices selling plans server-side). Cosmetic.
- [ ] ScrollToTop overrides ScrollRestoration back/forward scroll (legacy behavior, kept intentionally).
- [ ] 11 pre-existing scaffold lint errors (unused vars in scaffold routes, env.d.ts tsconfig parse). Sweep in Task 17.
- [ ] Toast fires on click not mutation-success for add/remove (matches legacy feel).
- [ ] SearchDropdown links via `product.id` (which the adapter sets to the handle) — works, but should read `product.handle` like ProductCard for clarity; the adapter's id-holds-handle conflation is a latent foot-gun to keep in mind.
