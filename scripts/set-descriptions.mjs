// Writes rich descriptions (full site-level detail: blurb, inspired-by,
// fragrance notes, scent profile, longevity/sillage/best-for) onto every
// store product via productUpdate (a true partial update — variants, media,
// and inventory are untouched). Also stores the original short blurb in the
// almas.short_description metafield so the WEBSITE keeps showing only the
// intro paragraph, and ensures that metafield's storefront-readable
// definition exists.
//
// Usage: SHOPIFY_STORE_DOMAIN=... SHOPIFY_CLIENT_ID=... SHOPIFY_CLIENT_SECRET=... \
//        node scripts/set-descriptions.mjs

import {products} from '../storefront/src/data/products.js';
import {slugify, richDescriptionHtml, METAFIELD_DEFINITIONS} from './lib/transform.mjs';

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

// Ensure the short_description definition exists (idempotent; TAKEN = exists).
const def = METAFIELD_DEFINITIONS.find((d) => d.key === 'short_description');
const defRes = await gql(
  `mutation($definition: MetafieldDefinitionInput!) {
    metafieldDefinitionCreate(definition: $definition) {
      createdDefinition { id }
      userErrors { field message code }
    }
  }`,
  {definition: def},
);
const defErrs = defRes.metafieldDefinitionCreate.userErrors;
if (defErrs.length && !defErrs.some((e) => e.code === 'TAKEN' || /already exists|in use/i.test(e.message))) {
  throw new Error(`definition: ${JSON.stringify(defErrs)}`);
}
console.log(defErrs.length ? 'definition exists: short_description' : 'created definition: short_description');

let updated = 0;
for (const p of products) {
  const handle = slugify(p.name);
  const data = await gql(
    `query($q: String!) { products(first: 10, query: $q) { nodes { id handle } } }`,
    {q: `handle:"${handle}"`},
  );
  const node = data.products.nodes.find((n) => n.handle === handle);
  if (!node) {
    console.warn(`not in store, skipped: ${handle}`);
    continue;
  }
  const upd = await gql(
    `mutation($product: ProductUpdateInput!) {
      productUpdate(product: $product) {
        product { id }
        userErrors { field message }
      }
    }`,
    {product: {id: node.id, descriptionHtml: richDescriptionHtml(p)}},
  );
  const uerr = upd.productUpdate.userErrors;
  if (uerr.length) throw new Error(`${handle} update: ${JSON.stringify(uerr)}`);

  if (p.description) {
    const mf = await gql(
      `mutation($metafields: [MetafieldsSetInput!]!) {
        metafieldsSet(metafields: $metafields) { userErrors { field message } }
      }`,
      {
        metafields: [
          {ownerId: node.id, namespace: 'almas', key: 'short_description', type: 'multi_line_text_field', value: p.description},
        ],
      },
    );
    const merr = mf.metafieldsSet.userErrors;
    if (merr.length) throw new Error(`${handle} metafield: ${JSON.stringify(merr)}`);
  }
  updated++;
  console.log(`described: ${handle}`);
}
console.log(`\n${updated} products updated with rich descriptions.`);
