// Targeted update: writes inspired-by SKUs onto every variant and adds the
// inspired-by name as a product tag, WITHOUT touching inventory/stock state.
// POS search matches SKUs, so store staff can find products by the original
// scent name (e.g. "aventus" -> Midnight Aventus via CREED-AVENTUS-50ML).
//
// Usage: SHOPIFY_STORE_DOMAIN=... SHOPIFY_CLIENT_ID=... SHOPIFY_CLIENT_SECRET=... \
//        node scripts/set-pos-skus.mjs

import {products} from '../storefront/src/data/products.js';
import {slugify, skuFor} from './lib/transform.mjs';

const DOMAIN = process.env.SHOPIFY_STORE_DOMAIN;
let TOKEN = process.env.SHOPIFY_ADMIN_TOKEN;
const CLIENT_ID = process.env.SHOPIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SHOPIFY_CLIENT_SECRET;
if (!DOMAIN || (!TOKEN && !(CLIENT_ID && CLIENT_SECRET))) {
  console.error('Set SHOPIFY_STORE_DOMAIN plus SHOPIFY_ADMIN_TOKEN or SHOPIFY_CLIENT_ID + SHOPIFY_CLIENT_SECRET.');
  process.exit(1);
}
const ENDPOINT = `https://${DOMAIN}/admin/api/2025-10/graphql.json`;

async function fetchAccessToken() {
  const res = await fetch(`https://${DOMAIN}/admin/oauth/access_token`, {
    method: 'POST',
    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
    body: new URLSearchParams({grant_type: 'client_credentials', client_id: CLIENT_ID, client_secret: CLIENT_SECRET}),
  });
  if (!res.ok) throw new Error(`token exchange failed: HTTP ${res.status}`);
  return (await res.json()).access_token;
}

const MAX_ATTEMPTS = 5;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function gql(query, variables, attempt = 1) {
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {'Content-Type': 'application/json', 'X-Shopify-Access-Token': TOKEN},
    body: JSON.stringify({query, variables}),
  });
  if (res.status === 429 && attempt < MAX_ATTEMPTS) {
    await sleep(2000);
    return gql(query, variables, attempt + 1);
  }
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
  const body = await res.json();
  if (body.errors) {
    if (body.errors.every((e) => e.extensions?.code === 'THROTTLED') && attempt < MAX_ATTEMPTS) {
      await sleep(2000);
      return gql(query, variables, attempt + 1);
    }
    throw new Error(JSON.stringify(body.errors));
  }
  return body.data;
}

if (!TOKEN) TOKEN = await fetchAccessToken();

let updated = 0;
for (const p of products) {
  const handle = slugify(p.name);
  const data = await gql(
    `query($q: String!) {
      products(first: 10, query: $q) {
        nodes { id handle variants(first: 10) { nodes { id title sku } } }
      }
    }`,
    {q: `handle:"${handle}"`},
  );
  const node = data.products.nodes.find((n) => n.handle === handle);
  if (!node) {
    console.warn(`not in store, skipped: ${handle}`);
    continue;
  }

  const variantUpdates = node.variants.nodes
    .map((v) => ({id: v.id, want: skuFor(p, v.title), have: v.sku}))
    .filter((v) => v.have !== v.want)
    .map((v) => ({id: v.id, inventoryItem: {sku: v.want}}));

  if (variantUpdates.length) {
    const upd = await gql(
      `mutation($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
        productVariantsBulkUpdate(productId: $productId, variants: $variants) {
          userErrors { field message }
        }
      }`,
      {productId: node.id, variants: variantUpdates},
    );
    const uerr = upd.productVariantsBulkUpdate.userErrors;
    if (uerr.length) throw new Error(`${handle} skus: ${JSON.stringify(uerr)}`);
  }

  if (p.inspiredBy) {
    const tag = await gql(
      `mutation($id: ID!, $tags: [String!]!) {
        tagsAdd(id: $id, tags: $tags) { userErrors { field message } }
      }`,
      {id: node.id, tags: [p.inspiredBy]},
    );
    const terr = tag.tagsAdd.userErrors;
    if (terr.length) throw new Error(`${handle} tag: ${JSON.stringify(terr)}`);
  }
  updated++;
  console.log(`${handle}: skus ${variantUpdates.length ? 'set' : 'ok'}, tag "${p.inspiredBy}"`);
}
console.log(`\n${updated} products updated.`);
