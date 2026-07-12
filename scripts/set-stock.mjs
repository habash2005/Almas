// Sets availability across the catalog from scripts/data/in-stock-handles.txt:
// products whose handle is listed stay purchasable (untracked inventory);
// everything else becomes tracked-with-zero-stock => shows Sold Out but stays
// visible. Idempotent; edit the list and re-run to flip products either way.
//
// Usage: SHOPIFY_STORE_DOMAIN=... SHOPIFY_CLIENT_ID=... SHOPIFY_CLIENT_SECRET=... \
//        node scripts/set-stock.mjs

import {readFileSync} from 'node:fs';
import {resolve, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {products} from '../storefront/src/data/products.js';
import {slugify, PRICING} from './lib/transform.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
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
    const throttled = body.errors.every((e) => e.extensions?.code === 'THROTTLED');
    if (throttled && attempt < MAX_ATTEMPTS) {
      await sleep(2000);
      return gql(query, variables, attempt + 1);
    }
    throw new Error(JSON.stringify(body.errors));
  }
  return body.data;
}

const inStock = new Set(
  readFileSync(resolve(HERE, 'data/in-stock-handles.txt'), 'utf8')
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith('#')),
);

const PRODUCT_SET = `
  mutation productSet($input: ProductSetInput!) {
    productSet(input: $input) {
      product { id handle }
      userErrors { field message }
    }
  }`;

async function findProductId(handle) {
  const data = await gql(
    `query($q: String!) { products(first: 10, query: $q) { nodes { id handle } } }`,
    {q: `handle:"${handle}"`},
  );
  return data.products.nodes.find((n) => n.handle === handle)?.id ?? null;
}

if (!TOKEN) TOKEN = await fetchAccessToken();

const unknownListed = [...inStock].filter((h) => !products.some((p) => slugify(p.name) === h));
if (unknownListed.length) console.warn('WARNING: listed handles not in catalog:', unknownListed.join(', '));

let available = 0, soldOut = 0;
for (const p of products) {
  const handle = slugify(p.name);
  const stocked = inStock.has(handle);
  const id = await findProductId(handle);
  if (!id) {
    console.warn(`missing in store, skipped: ${handle}`);
    continue;
  }
  const variants = Object.entries(PRICING).map(([size, price]) => ({
    optionValues: [{optionName: 'Size', name: size}],
    price,
    inventoryItem: {tracked: !stocked},
    inventoryPolicy: stocked ? 'CONTINUE' : 'DENY',
  }));
  const data = await gql(PRODUCT_SET, {
    input: {
      id,
      productOptions: [{name: 'Size', values: Object.keys(PRICING).map((name) => ({name}))}],
      variants,
    },
  });
  const errs = data.productSet.userErrors;
  if (errs.length) throw new Error(`${handle}: ${JSON.stringify(errs)}`);
  stocked ? available++ : soldOut++;
  console.log(`${stocked ? 'IN STOCK ' : 'sold out '} ${handle}`);
}
console.log(`\n${available} purchasable, ${soldOut} marked sold out.`);
