// Attaches product images so every store product carries TWO media, in order:
//   1. <handle>-square.png  — 1200x1200 bottle-only thumbnail (featured; what
//      Shop app / admin / collections center-crop to ~square)
//   2. <handle>.png         — the 1024x1536 notes card (or original AI art
//      for the PRESERVE handles)
// Idempotent: products already at 2+ media are skipped. Run
// generate-bottle-images.py first.
//
// Usage: SHOPIFY_STORE_DOMAIN=... SHOPIFY_CLIENT_ID=... SHOPIFY_CLIENT_SECRET=... \
//        [REPLACE=1] node scripts/attach-images.mjs

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

// REPLACE=1 swaps existing media for [square, notes-card]. PRESERVE handles
// keep their original AI artwork as image 2 but still get the square first.
const REPLACE = process.env.REPLACE === '1';
const PRESERVE = new Set(['midnight-aventus', 'sauvage-noir']);

async function createMedia(productId, entries) {
  const data = await gql(
    `mutation($productId: ID!, $media: [CreateMediaInput!]!) {
      productCreateMedia(productId: $productId, media: $media) {
        media { id }
        mediaUserErrors { field message }
      }
    }`,
    {productId, media: entries},
  );
  const errs = data.productCreateMedia.mediaUserErrors;
  if (errs.length) throw new Error(JSON.stringify(errs));
  return data.productCreateMedia.media.map((m) => m.id);
}

async function waitForMediaReady(mediaId) {
  for (let i = 0; i < 20; i++) {
    const d = await gql(
      `query($id: ID!) { node(id: $id) { ... on MediaImage { status } } }`,
      {id: mediaId},
    );
    const s = d.node?.status;
    if (s === 'READY') return;
    if (s === 'FAILED') throw new Error(`media processing failed: ${mediaId}`);
    await sleep(1500);
  }
  throw new Error(`media never became READY: ${mediaId}`);
}

let attached = 0, skipped = 0, missing = 0;
for (const p of products) {
  const handle = slugify(p.name);
  const data = await gql(
    `query($q: String!) {
      products(first: 10, query: $q) {
        nodes { id handle mediaCount { count } media(first: 10) { nodes { id } } }
      }
    }`,
    {q: `handle:"${handle}"`},
  );
  const node = data.products.nodes.find((n) => n.handle === handle);
  if (!node) {
    console.warn(`not in store, skipped: ${handle}`);
    continue;
  }
  // 2+ media means the square-first layout is already in place.
  if (node.mediaCount.count >= 2 || (node.mediaCount.count > 0 && !REPLACE)) {
    skipped++;
    continue;
  }

  const squarePath = resolve(ROOT, 'storefront/public/products', `${handle}-square.png`);
  const cardPath = resolve(ROOT, 'storefront/public/products', `${handle}.png`);
  if (!existsSync(squarePath) || (!PRESERVE.has(handle) && !existsSync(cardPath))) {
    console.warn(`no local image: ${handle}`);
    missing++;
    continue;
  }

  if (PRESERVE.has(handle) && node.mediaCount.count > 0) {
    // Keep the original AI card; prepend the square as the featured image.
    const squareUrl = await uploadLocalImage(squarePath);
    const [squareId] = await createMedia(node.id, [
      {originalSource: squareUrl, mediaContentType: 'IMAGE', alt: p.name},
    ]);
    await waitForMediaReady(squareId);
    const reorder = await gql(
      `mutation($id: ID!, $moves: [MoveInput!]!) {
        productReorderMedia(id: $id, moves: $moves) {
          job { id }
          mediaUserErrors { field message }
        }
      }`,
      {id: node.id, moves: [{id: squareId, newPosition: '0'}]},
    );
    const rerr = reorder.productReorderMedia.mediaUserErrors;
    if (rerr.length) throw new Error(`${handle} reorder: ${JSON.stringify(rerr)}`);
  } else {
    if (node.mediaCount.count > 0) {
      const del = await gql(
        `mutation($productId: ID!, $mediaIds: [ID!]!) {
          productDeleteMedia(productId: $productId, mediaIds: $mediaIds) {
            deletedMediaIds
            mediaUserErrors { field message }
          }
        }`,
        {productId: node.id, mediaIds: node.media.nodes.map((m) => m.id)},
      );
      const derr = del.productDeleteMedia.mediaUserErrors;
      if (derr.length) throw new Error(`${handle} delete media: ${JSON.stringify(derr)}`);
    }
    const squareUrl = await uploadLocalImage(squarePath);
    const cardUrl = await uploadLocalImage(cardPath);
    await createMedia(node.id, [
      {originalSource: squareUrl, mediaContentType: 'IMAGE', alt: p.name},
      {originalSource: cardUrl, mediaContentType: 'IMAGE', alt: `${p.name} — scent notes`},
    ]);
  }
  attached++;
  console.log(`attached: ${handle}`);
}
console.log(`\n${attached} attached, ${skipped} skipped (already square-first), ${missing} missing local files.`);
