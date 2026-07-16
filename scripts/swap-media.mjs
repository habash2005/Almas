// Replaces BOTH media (square thumbnail + notes card) on every product with
// the regenerated local files, leaving PRESERVE products' original AI card in
// place (their square still swaps). Used when the image design changes for
// the whole set (e.g. enlarged bottle/notes). Uploads new media, polls to
// READY, deletes the old media, then reorders the square to the front.
//
// Usage: SHOPIFY_STORE_DOMAIN=... SHOPIFY_CLIENT_ID=... SHOPIFY_CLIENT_SECRET=... \
//        node scripts/swap-media.mjs

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
  console.error('Set SHOPIFY_STORE_DOMAIN plus auth env vars.');
  process.exit(1);
}
const ENDPOINT = `https://${DOMAIN}/admin/api/2025-10/graphql.json`;
const PRESERVE = new Set(['midnight-aventus', 'sauvage-noir']);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

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

async function waitForReady(mediaId) {
  for (let i = 0; i < 20; i++) {
    const st = await gql(`query($id: ID!) { node(id: $id) { ... on Media { status } } }`, {id: mediaId});
    if (st.node?.status === 'READY') return;
    if (st.node?.status === 'FAILED') throw new Error(`media failed: ${mediaId}`);
    await sleep(1500);
  }
  throw new Error(`media never READY: ${mediaId}`);
}

if (!TOKEN) TOKEN = await fetchAccessToken();

let swapped = 0;
for (const p of products) {
  const handle = slugify(p.name);
  const squarePath = resolve(ROOT, 'storefront/public/products', `${handle}-square.png`);
  const cardPath = resolve(ROOT, 'storefront/public/products', `${handle}.png`);
  const swapCard = !PRESERVE.has(handle);
  if (!existsSync(squarePath) || (swapCard && !existsSync(cardPath))) {
    console.warn(`no local image: ${handle}`);
    continue;
  }

  const data = await gql(
    `query($q: String!) {
      products(first: 10, query: $q) {
        nodes {
          id handle
          media(first: 10) { nodes { id ... on MediaImage { image { url } } } }
        }
      }
    }`,
    {q: `handle:"${handle}"`},
  );
  const node = data.products.nodes.find((n) => n.handle === handle);
  if (!node) {
    console.warn(`not in store: ${handle}`);
    continue;
  }
  const oldMedia = node.media.nodes.filter((m) =>
    swapCard ? Boolean(m.image) : m.image?.url?.includes('-square'),
  );

  const uploads = [{originalSource: await uploadLocalImage(squarePath), mediaContentType: 'IMAGE', alt: p.name}];
  if (swapCard) {
    uploads.push({originalSource: await uploadLocalImage(cardPath), mediaContentType: 'IMAGE', alt: `${p.name} fragrance notes`});
  }
  const newIds = await createMedia(node.id, uploads);
  for (const id of newIds) await waitForReady(id);

  if (oldMedia.length) {
    const del = await gql(
      `mutation($productId: ID!, $mediaIds: [ID!]!) {
        productDeleteMedia(productId: $productId, mediaIds: $mediaIds) {
          mediaUserErrors { field message }
        }
      }`,
      {productId: node.id, mediaIds: oldMedia.map((m) => m.id)},
    );
    const derr = del.productDeleteMedia.mediaUserErrors;
    if (derr.length) throw new Error(`${handle} delete: ${JSON.stringify(derr)}`);
  }

  const re = await gql(
    `mutation($id: ID!, $moves: [MoveInput!]!) {
      productReorderMedia(id: $id, moves: $moves) {
        mediaUserErrors { field message }
      }
    }`,
    {id: node.id, moves: [{id: newIds[0], newPosition: '0'}]},
  );
  const rerr = re.productReorderMedia.mediaUserErrors;
  if (rerr.length) throw new Error(`${handle} reorder: ${JSON.stringify(rerr)}`);
  swapped++;
  console.log(`swapped: ${handle}`);
}
console.log(`\n${swapped} products swapped to enlarged imagery.`);
