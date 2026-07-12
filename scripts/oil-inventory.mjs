// Oil-pool inventory: each scent has a hidden pool of perfume oil (ml) and
// each bottle size consumes a fixed amount of it. Shopify variant inventory
// is derived from the pool, so customers only ever see In Stock / Sold Out.
//
//   bottle:  30ml -> 12ml oil   50ml -> 20ml oil   100ml -> 35ml oil
//
// State lives in a product metafield `almas.oil_state` (json, NO storefront
// access): {"oil": <ml remaining>, "setQty": {"30ml": n, "50ml": n, "100ml": n}}
// where setQty is the variant quantities written at the last sync — used to
// infer units sold since then without needing order-read permissions.
//
// Commands:
//   node scripts/oil-inventory.mjs set all 250        # give every IN-STOCK product a 250ml pool
//   node scripts/oil-inventory.mjs set <handle> <ml>  # set/refill one scent's pool
//   node scripts/oil-inventory.mjs sync               # reconcile sales -> pools -> quantities
//   node scripts/oil-inventory.mjs report             # ml remaining per scent
//
// "set all" applies only to handles in scripts/data/in-stock-handles.txt;
// sold-out products keep zero inventory. Requires scopes: read/write_products,
// read_locations, read_inventory, write_inventory.

import {readFileSync} from 'node:fs';
import {resolve, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {products} from '../storefront/src/data/products.js';
import {slugify, PRICING} from './lib/transform.mjs';

export const OIL_PER_BOTTLE = {'30ml': 12, '50ml': 20, '100ml': 35};

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
  const body = await res.json();
  for (const scope of ['write_inventory']) {
    if (!body.scope?.includes(scope)) {
      throw new Error(`token lacks ${scope} — release an app version adding read_inventory + write_inventory and re-approve the install`);
    }
  }
  return body.access_token;
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

const qtyFor = (oil) =>
  Object.fromEntries(Object.entries(OIL_PER_BOTTLE).map(([size, ml]) => [size, Math.max(0, Math.floor(oil / ml))]));

const PRODUCT_QUERY = `
  query($q: String!) {
    products(first: 10, query: $q) {
      nodes {
        id
        handle
        oilState: metafield(namespace: "almas", key: "oil_state") { value }
        variants(first: 10) {
          nodes {
            id
            title
            inventoryQuantity
            inventoryItem { id }
          }
        }
      }
    }
  }`;

async function getProduct(handle) {
  const data = await gql(PRODUCT_QUERY, {q: `handle:"${handle}"`});
  return data.products.nodes.find((n) => n.handle === handle) ?? null;
}

// Derived from any variant's inventory levels rather than the locations
// query, so the app doesn't need the read_locations scope.
let LOCATION_ID = null;
async function locationId() {
  if (!LOCATION_ID) {
    const data = await gql(`
      query {
        products(first: 1) {
          nodes {
            variants(first: 1) {
              nodes {
                inventoryItem { inventoryLevels(first: 1) { nodes { location { id } } } }
              }
            }
          }
        }
      }`);
    LOCATION_ID =
      data.products.nodes[0]?.variants.nodes[0]?.inventoryItem.inventoryLevels.nodes[0]?.location.id ?? null;
    if (!LOCATION_ID) throw new Error('no store location found via inventory levels');
  }
  return LOCATION_ID;
}

async function applyOil(node, oil) {
  const qty = qtyFor(oil);
  const loc = await locationId();
  // Ensure variants are tracked with DENY so hitting zero shows Sold Out.
  const setQuantities = [];
  const trackedUpdates = [];
  for (const v of node.variants.nodes) {
    if (!(v.title in OIL_PER_BOTTLE)) continue;
    trackedUpdates.push({id: v.id, inventoryPolicy: 'DENY', inventoryItem: {tracked: true}});
    setQuantities.push({inventoryItemId: v.inventoryItem.id, locationId: loc, quantity: qty[v.title]});
  }
  const upd = await gql(
    `mutation($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
      productVariantsBulkUpdate(productId: $productId, variants: $variants) {
        userErrors { field message }
      }
    }`,
    {productId: node.id, variants: trackedUpdates},
  );
  const uerr = upd.productVariantsBulkUpdate.userErrors;
  if (uerr.length) throw new Error(`${node.handle} variants: ${JSON.stringify(uerr)}`);

  const inv = await gql(
    `mutation($input: InventorySetQuantitiesInput!) {
      inventorySetQuantities(input: $input) {
        userErrors { field message }
      }
    }`,
    {input: {name: 'available', reason: 'correction', ignoreCompareQuantity: true, quantities: setQuantities}},
  );
  const ierr = inv.inventorySetQuantities.userErrors;
  if (ierr.length) throw new Error(`${node.handle} inventory: ${JSON.stringify(ierr)}`);

  const state = JSON.stringify({oil, setQty: qty});
  const mf = await gql(
    `mutation($metafields: [MetafieldsSetInput!]!) {
      metafieldsSet(metafields: $metafields) {
        userErrors { field message }
      }
    }`,
    {metafields: [{ownerId: node.id, namespace: 'almas', key: 'oil_state', type: 'json', value: state}]},
  );
  const merr = mf.metafieldsSet.userErrors;
  if (merr.length) throw new Error(`${node.handle} metafield: ${JSON.stringify(merr)}`);
  return qty;
}

function readState(node) {
  try {
    const s = JSON.parse(node.oilState?.value ?? 'null');
    if (s && typeof s.oil === 'number' && s.setQty) return s;
  } catch {
    /* fall through */
  }
  return null;
}

const inStockHandles = () =>
  readFileSync(resolve(HERE, 'data/in-stock-handles.txt'), 'utf8')
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith('#'));

const [cmd, arg1, arg2] = process.argv.slice(2);
if (!TOKEN) TOKEN = await fetchAccessToken();

if (cmd === 'set') {
  const ml = parseFloat(arg2);
  if (!arg1 || !(ml >= 0)) {
    console.error('usage: oil-inventory.mjs set <handle|all> <ml>');
    process.exit(1);
  }
  const handles = arg1 === 'all' ? inStockHandles() : [arg1];
  for (const handle of handles) {
    const node = await getProduct(handle);
    if (!node) {
      console.warn(`not found, skipped: ${handle}`);
      continue;
    }
    const qty = await applyOil(node, ml);
    console.log(`${handle}: pool ${ml}ml -> 30ml x${qty['30ml']}, 50ml x${qty['50ml']}, 100ml x${qty['100ml']}`);
  }
} else if (cmd === 'sync') {
  let touched = 0;
  for (const p of products) {
    const handle = slugify(p.name);
    const node = await getProduct(handle);
    if (!node) continue;
    const state = readState(node);
    if (!state) continue; // no pool tracked for this product
    let consumed = 0;
    for (const v of node.variants.nodes) {
      if (!(v.title in OIL_PER_BOTTLE)) continue;
      const sold = Math.max(0, (state.setQty[v.title] ?? 0) - (v.inventoryQuantity ?? 0));
      consumed += sold * OIL_PER_BOTTLE[v.title];
    }
    const oil = Math.max(0, state.oil - consumed);
    if (consumed > 0 || JSON.stringify(qtyFor(oil)) !== JSON.stringify(state.setQty)) {
      const qty = await applyOil(node, oil);
      console.log(`${handle}: sold ${consumed}ml -> pool ${oil}ml (30ml x${qty['30ml']}, 50ml x${qty['50ml']}, 100ml x${qty['100ml']})`);
      touched++;
    }
  }
  console.log(`sync complete, ${touched} product(s) updated.`);
} else if (cmd === 'report') {
  const rows = [];
  for (const h of inStockHandles()) {
    const node = await getProduct(h);
    const state = node && readState(node);
    rows.push([h, state ? `${state.oil}ml` : '(no pool)']);
  }
  for (const [h, oil] of rows) console.log(`${oil.padStart(9)}  ${h}`);
} else {
  console.error('usage: oil-inventory.mjs <set|sync|report> ...');
  process.exit(1);
}
