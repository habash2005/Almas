# ALMAS — Shopify Store Setup Guide

Everything the store owner does by hand, click by click. Total time: about 30
minutes. Do the sections in order; each later section depends on the earlier
ones. Commands run from the repo root unless noted.

---

## 1. Create a Shopify Partners account + development store (~10 min)

A development store is free, fully functional, and perfect for building and
testing. You upgrade it to a paid plan only when you're ready to sell.

1. Go to <https://partners.shopify.com> and click **Join now** → sign up with
   your email (free).
2. In the Partner Dashboard, click **Stores** in the left sidebar.
3. Click **Add store** → **Create development store**.
4. Choose **Create a store to test and build**.
5. Store name: `almas-dev` (or anything — the name becomes the URL).
6. Build version: **Current release**. Data: choose **Start with an empty
   store** (our script imports the real catalog).
7. Click **Create development store**, then **Log in to store** when it's
   ready.
8. **Write down your store domain** — it looks like
   `almas-dev.myshopify.com`. You'll need it below as
   `SHOPIFY_STORE_DOMAIN`.

## 2. Create an Admin API token for the migration script (~5 min)

The migration script needs a private token to create products.

1. In your store admin (`https://<your-store>.myshopify.com/admin`), go to
   **Settings** (bottom-left gear) → **Apps and sales channels**.
2. Click **Develop apps** (top right). If prompted, click **Allow custom app
   development** (twice).
3. Click **Create an app** → name it `almas-migration` → **Create app**.
4. On the app page, open the **Configuration** tab → under **Admin API
   integration** click **Configure**.
5. Tick these scopes (search the list):
   - `read_products`
   - `write_products`
   - `read_files`
   - `write_files`
   - `read_publications`
   - `write_publications`
6. Click **Save**.
7. Open the **API credentials** tab → click **Install app** → **Install**.
8. Under **Admin API access token**, click **Reveal token once** and copy it
   (starts with `shpat_`). **Save it somewhere safe — Shopify shows it only
   once.** This is `SHOPIFY_ADMIN_TOKEN`.

## 3. Run the product migration (~10 min)

This imports all 143 fragrances — variants (50ml/100ml with real prices),
scent metafields (accords, notes, longevity, sillage, best-for, inspired-by),
tags, and the 13 smart collections (For Him / For Her / Unisex + one per
scent family). It also creates the metafield definitions (with storefront
read access, so the site can display the scent data) and publishes every
product and collection to all sales channels, including the Hydrogen
storefront.

From the repo root:

```bash
npm install   # first time only
SHOPIFY_STORE_DOMAIN=<your-store>.myshopify.com \
SHOPIFY_ADMIN_TOKEN=shpat_XXXXXXXX \
npm run migrate
```

Expected output: one `created <handle>` line per product, ending with

```
Products: 143 created, 0 updated.
created collection: for-him
... (13 collections)
Done. Reminder: create the "Scent Subscription" selling plan in the Shopify Subscriptions app (see docs/STORE_SETUP.md §4).
```

The script is **idempotent** — safe to re-run any time (re-runs say
`updated` instead of `created` and never duplicate anything).

> Note: only two products currently have dedicated image files
> (`midnight-aventus`, `sauvage-noir`); the rest import without media. The
> storefront design renders its signature tinted-bottle art for every product
> regardless, so this is cosmetic. Add images later in the Shopify admin or
> by dropping PNGs into `storefront/public/products/<handle>.png` and
> re-running the migration (new images attach on first create only — for
> already-created products, add media via the admin).

## 4. Install Shopify Subscriptions + create the plan (~5 min)

Subscriptions must be created in Shopify's own app so it handles the
recurring billing.

1. In the store admin, go to **Apps** → search the Shopify App Store for
   **"Shopify Subscriptions"** (free, by Shopify) → **Install**.
2. Open the app → **Create subscription plan**.
3. Plan title: `Scent Subscription`.
4. Delivery frequency: **every 3 months**. Discount: **15%**.
5. Under products, click **Add products** → select all products (search box →
   select all) → save.

The storefront picks the plan up automatically: product pages show the
"Subscribe & Save 15%" option as soon as a product has a selling plan.

## 5. Connect the Hydrogen storefront (~5 min)

This links the app in `hydrogen/` to your store and pulls its API
credentials into `.env`.

```bash
cd hydrogen
npx shopify hydrogen link      # log in, pick your store, create the "hydrogen" storefront when prompted
npx shopify hydrogen env pull  # writes .env with the store tokens
npm run dev
```

Open the printed localhost URL — the site now shows the real ALMAS catalog
(scent radars, accords, notes, and the subscription toggle all populated).
Checkout, promo codes, and customer accounts (login via the account icon)
now run against your store.

## 6. Deploy to Oxygen (whenever ready)

```bash
cd hydrogen
npx shopify hydrogen deploy
```

This builds and deploys to Shopify Oxygen (free with the store) and prints a
public URL. Re-run it to ship updates.

## 7. Going live (later, when you want real customers)

- Pick a paid Shopify plan (Settings → Plan) — required to take real
  payments and lift dev-store restrictions.
- Add your domain: Settings → Domains → connect or buy one, and set it as
  primary for the Oxygen deployment (Hydrogen storefront settings → Domains).
- Configure payments (Settings → Payments → Shopify Payments) and shipping
  rates (Settings → Shipping); the storefront's free-shipping-over-$100
  message assumes a matching shipping rate.
- Retire the old Netlify deployment of `storefront/` once the new site is
  live.
