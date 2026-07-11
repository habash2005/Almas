# Hydrogen Scaffold Map

Generated 2026-07-10 by `@shopify/create-hydrogen@5.0.37` (skeleton template) with:
mock.shop data, JavaScript, Tailwind v4, example routes, no git init, deps installed.

- Hydrogen version: `@shopify/hydrogen` **2026.4.3**
- Router: **React Router 7.16.0** (framework mode — NOT Remix; imports come from `react-router`, route types from `./+types/<route>`)
- Node engines: `^22 || ^24`
- Dev server: `npm run dev` → `shopify hydrogen dev --codegen`, defaults to **http://localhost:3000** (auto-increments to 3001+ if the port is busy — another local app was occupying 3000 during verification)

## Route registration

`app/routes.js` uses `flatRoutes()` from `@react-router/fs-routes` wrapped in `hydrogenRoutes()` — file-based flat routing over `app/routes/`. Manual routes can be appended to the array in that file.

## Routes directory (`hydrogen/app/routes/`)

All files are `.jsx` (JavaScript, as requested). The canonical names from the plan all exist verbatim — **no mapping needed** for `_index.jsx`, `products.$handle.jsx`, `collections.$handle.jsx`, `cart.jsx`, `search.jsx`, `account*.jsx`.

```
_index.jsx                              Home (featured collection + recommended products)
$.jsx                                   Catch-all (404)
[robots.txt].jsx
[sitemap.xml].jsx
sitemap.$type.$page[.xml].jsx
account.jsx                             Account layout (auth guard + nav)
account._index.jsx                      Redirects to orders
account.$.jsx                           Account catch-all
account_.authorize.jsx                  OAuth callback (Customer Account API)
account_.login.jsx
account_.logout.jsx
account.addresses.jsx
account.orders._index.jsx
account.orders.$id.jsx
account.profile.jsx
blogs._index.jsx
blogs.$blogHandle._index.jsx
blogs.$blogHandle.$articleHandle.jsx
cart.jsx                                Cart page + cart action (CartForm mutations)
cart.$lines.jsx                         Shareable cart-lines permalink
collections._index.jsx
collections.all.jsx
collections.$handle.jsx
discount.$code.jsx
pages.$handle.jsx
policies._index.jsx
policies.$handle.jsx
products.$handle.jsx
search.jsx                              Regular + predictive search (loader & action)
```

## Layout component

- **`PageLayout`** at `hydrogen/app/components/PageLayout.jsx`.
- Rendered by the default export (`App`) in `hydrogen/app/root.jsx`: `<PageLayout {...data}><Outlet /></PageLayout>`, receiving the entire root loader data as props (`cart`, `header`, `footer`, `isLoggedIn`, `publicStoreDomain`).
- `root.jsx` also exports a separate `Layout({children})` component that renders the `<html>/<head>/<body>` shell and injects the stylesheets.
- Other components in `hydrogen/app/components/`: `AddToCartButton.jsx`, `Aside.jsx` (drawer/overlay system used for cart, search, and mobile menu), `CartLineItem.jsx`, `CartMain.jsx`, `CartSummary.jsx`, `Footer.jsx`, `Header.jsx`, `MockShopNotice.jsx`, `PaginatedResourceSection.jsx`, `ProductForm.jsx`, `ProductImage.jsx`, `ProductItem.jsx`, `ProductPrice.jsx`, `SearchForm.jsx`, `SearchFormPredictive.jsx`, `SearchResults.jsx`, `SearchResultsPredictive.jsx`.

## Cart handler

- Lives in **`hydrogen/app/lib/context.js`** — `createHydrogenRouterContext()` calls `createHydrogenContext()` from `@shopify/hydrogen` with `cart: {queryFragment: CART_QUERY_FRAGMENT}`. The cart handler is available as `context.cart` in loaders/actions.
- `hydrogen/server.js` imports `createHydrogenRouterContext` from `~/lib/context` and passes the result to the React Router request handler. Session (`AppSession`, `app/lib/session.js`) requires `SESSION_SECRET` in `.env`.
- Cart mutations are handled in the `action` of `app/routes/cart.jsx` via `CartForm.getFormInput`.

## Fragments file

- **`hydrogen/app/lib/fragments.js`** exports: `CART_QUERY_FRAGMENT`, `HEADER_QUERY`, `FOOTER_QUERY` (header/footer queries use `main-menu` and `footer` menu handles).

## Root loader → cart exposure

- In `hydrogen/app/root.jsx`, `loadDeferredData()` returns **`cart: cart.get()`** (a promise, deferred) plus `isLoggedIn` and `footer`; `loadCriticalData()` returns `header`. So root loader data keys: **`cart`**, `isLoggedIn`, `footer`, `header`, `publicStoreDomain`, `shop`, `consent`.
- Consumers read it with `useRouteLoaderData('root')` (typed via the `RootLoader` typedef). `shouldRevalidate` only revalidates on non-GET mutations.

## CSS / Tailwind wiring

- **Tailwind v4** (`tailwindcss` `^4.1.6` in dependencies, `@tailwindcss/vite` `^4.1.6` in devDependencies). **No `tailwind.config.js`** — v4 CSS-first configuration.
- Vite plugin order in `hydrogen/vite.config.js`: `tailwindcss(), hydrogen(), oxygen(), reactRouter()`.
- CSS entry files in `hydrogen/app/styles/`:
  - `tailwind.css` — just `@import 'tailwindcss';` (v4 entry; add `@theme` tokens here)
  - `reset.css` — CSS reset
  - `app.css` — the skeleton's component styles (plain CSS, not Tailwind classes)
- All three are linked as `?url` imports inside the `Layout` component in `root.jsx` (NOT via the `links()` export — deliberate HMR workaround, see comment in root.jsx).

## Account route filenames

`account.jsx` (layout), `account._index.jsx`, `account.$.jsx`, `account_.authorize.jsx`, `account_.login.jsx`, `account_.logout.jsx`, `account.addresses.jsx`, `account.orders._index.jsx`, `account.orders.$id.jsx`, `account.profile.jsx`. Customer Account API GraphQL lives under `hydrogen/app/graphql/customer-account/`.

## Other lib files

`app/lib/search.js` (search helpers), `app/lib/variants.js`, `app/lib/redirect.js`, `app/lib/orderFilters.js`, `app/lib/session.js`.

## Deviations from stock scaffold (made during Task 1)

1. **`vite.config.js` alias fix (required):** the stock JS template is broken with Vite 8 — `resolve.tsconfigPaths: true` only reads `tsconfig.json`, but the JS template ships `jsconfig.json`, so every `~/...` import failed at runtime (`Cannot find module '~/assets/favicon.svg'`). Added `resolve.alias: {'~': <repo>/hydrogen/app}` to fix. Keep this alias if you touch vite.config.js.
2. **`hydrogen/.gitignore` added** (the CLI skips it with `--no-git`): ignores `build`, `dist`, `node_modules`, `.env` (contains `SESSION_SECRET`), `.shopify`, `.react-router`. Note: `.env` is therefore NOT in git — dev needs `SESSION_SECRET="foobar"` (any string) locally.
3. **Added deps:** `lucide-react` (dependency), `vitest` (devDependency), and `"test": "vitest run"` script.

## Notes for later tasks

- Language is JavaScript but a few TypeScript artifacts exist by design: `env.d.ts`, `*.generated.d.ts`, and `typescript` stays in devDependencies for codegen/typegen. Route/lib/component code is all `.js`/`.jsx`.
- mock.shop is active (`MockShopNotice` component renders a banner on home). No store is linked; `npx shopify hydrogen link` connects a real store later.
- `npm run dev` runs codegen watchers; expect a benign `[Codegen] envFile option is deprecated` warning.
