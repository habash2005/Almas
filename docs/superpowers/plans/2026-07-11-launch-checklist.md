# ALMAS Launch Checklist — post-store-setup verification

Run this after completing `docs/STORE_SETUP.md` (real Shopify store, real
data). Everything below was already verified against mock.shop in Task 17;
this list re-verifies against YOUR store.

## 1. Migration (STORE_SETUP.md §2–3)

- [ ] Admin API token created with the scopes listed in §2 (incl. `write_products`, `write_publications`)
- [ ] `node scripts/migrate-products.mjs` completes with **"143 created"** (0 failed)
- [ ] Metafield-definitions phase reports all `almas.*` definitions created (or already existing)
- [ ] Publications phase reports products published to the Online Store / Hydrogen channels
- [ ] Re-run the script once — it should be idempotent ("143 skipped/updated", no duplicates)

## 2. Connect the storefront (STORE_SETUP.md §5)

- [ ] `npx shopify hydrogen link` from `hydrogen/` picks your storefront
- [ ] `npx shopify hydrogen env pull` writes a `.env` with real storefront credentials
- [ ] `npm run dev` boots against the real store (no mock.shop banner data)

## 3. Full route re-walk against real data

- [ ] `/` — hero, Shop by Category, Best Sellers, New Arrivals all show real ALMAS products with images
- [ ] `/shop` — 143 products; scent-family and badge filters work (badges come from tags)
- [ ] `/shop/men`, `/shop/women`, `/shop/unisex` — category filtering correct
- [ ] `/shop` price sorts (low→high, high→low) order correctly with real 50ml prices
- [ ] `/products/<handle>` — PDP shows scent radar, accords, notes pyramid, longevity/sillage, inspired-by (metafields present)
- [ ] PDP size selector shows **50ml / 100ml** with real prices
- [ ] PDP **Subscribe & Save toggle appears** once the Subscriptions app plan exists (STORE_SETUP.md §4) and the discounted price is correct
- [ ] `/scent-finder` — quiz completes, 3 results with sensible match % (needs longevity/sillage/best_for metafields)
- [ ] `/search?q=...` — real products in results and predictive dropdown
- [ ] `/wishlist` — heart toggle, badge, persistence still work
- [ ] `/subscribe`, `/our-story`, `/faq`, `/shipping`, `/privacy`, `/terms`, `/contact` — render
- [ ] `/garbage-url` — branded 404

## 4. Checkout + account (needs real store, not mock.shop)

- [ ] Enable **Bogus Gateway** (dev stores: Settings → Payments → test mode) and complete a full test checkout from cart → hosted checkout → order confirmation (card `1`, any future expiry, any CVV)
- [ ] Order appears in Shopify admin
- [ ] Cart drawer + cart page totals match checkout totals (incl. free-shipping threshold messaging)
- [ ] `/account` login via new customer accounts works; orders / profile / addresses pages render the Almas-styled account UI
- [ ] The test order shows up under account → orders with correct line items
- [ ] Create a discount code in admin (e.g. `ALMAS10`), apply it on the cart page → success toast shows and totals update
- [ ] Subscription purchase: add a PDP item with Subscribe & Save, verify the selling-plan discount carries through checkout

## 5. Deploy (STORE_SETUP.md §6)

- [ ] `npx shopify hydrogen deploy` from `hydrogen/` succeeds
- [ ] Re-spot-check `/`, `/shop`, a PDP, and checkout on the Oxygen preview URL
- [ ] (Later) going-live steps in STORE_SETUP.md §7 — domain, real payment provider, remove test mode
