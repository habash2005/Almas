// Attaches storefront/public/products/<handle>.png to any store product that
// has no media yet (admin thumbnails, Shop app, POS). Idempotent: products
// that already have media are skipped. Run generate-bottle-images.py first.
//
// Usage: SHOPIFY_STORE_DOMAIN=... SHOPIFY_CLIENT_ID=... SHOPIFY_CLIENT_SECRET=... \
//        node scripts/attach-images.mjs

import {existsSync, readFileSync} from 'node:fs';
import {resolve, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {products} from '../storefront/src/data/products.js';
import {slugify} from './lib/transform.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
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

async function uploadLocalImage(path) {
  const filename = path.split('/').pop();
  const data = await gql(
    `mutation($input: [StagedUploadInput!]!) {
      stagedUploadsCreate(input: $input) {
        stagedTargets { url resourceUrl parameters { name value } }
        userErrors { field message }
      }
    }`,
    {input: [{resource: 'IMAGE', filename, mimeType: 'image/png', httpMethod: 'POST'}]},
  );
  const target = data.stagedUploadsCreate.stagedTargets[0];
  const form = new FormData();
  for (const p of target.parameters) form.append(p.name, p.value);
  form.append('file', new Blob([readFileSync(path)]), filename);
  const up = await fetch(target.url, {method: 'POST', body: form});
  if (!up.ok) throw new Error(`upload failed: ${up.status}`);
  return target.resourceUrl;
}

if (!TOKEN) TOKEN = await fetchAccessToken();

let attached = 0, skipped = 0, missing = 0;
for (const p of products) {
  const handle = slugify(p.name);
  const data = await gql(
    `query($q: String!) {
      products(first: 10, query: $q) { nodes { id handle mediaCount { count } } }
    }`,
    {q: `handle:"${handle}"`},
  );
  const node = data.products.nodes.find((n) => n.handle === handle);
  if (!node) {
    console.warn(`not in store, skipped: ${handle}`);
    continue;
  }
  if (node.mediaCount.count > 0) {
    skipped++;
    continue;
  }
  const imgPath = resolve(ROOT, 'storefront/public/products', `${handle}.png`);
  if (!existsSync(imgPath)) {
    console.warn(`no local image: ${handle}`);
    missing++;
    continue;
  }
  const resourceUrl = await uploadLocalImage(imgPath);
  const media = await gql(
    `mutation($productId: ID!, $media: [CreateMediaInput!]!) {
      productCreateMedia(productId: $productId, media: $media) {
        media { id }
        mediaUserErrors { field message }
      }
    }`,
    {productId: node.id, media: [{originalSource: resourceUrl, mediaContentType: 'IMAGE', alt: p.name}]},
  );
  const errs = media.productCreateMedia.mediaUserErrors;
  if (errs.length) throw new Error(`${handle}: ${JSON.stringify(errs)}`);
  attached++;
  console.log(`attached: ${handle}`);
}
console.log(`\n${attached} attached, ${skipped} already had media, ${missing} missing local files.`);
