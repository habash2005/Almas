// Replaces ONLY the notes-card media on products listed in ONLY_FILE with
// the regenerated local <handle>-square.png, leaving the second image (notes
// card / AI art) untouched. Used when the square design changes (e.g. pure
// white background). Polls the new media to READY then reorders to front.
//
// Usage: SHOPIFY_STORE_DOMAIN=... SHOPIFY_CLIENT_ID=... SHOPIFY_CLIENT_SECRET=... \
//        node scripts/swap-squares.mjs

import {existsSync, readFileSync} from 'node:fs';
import {resolve, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {products} from '../storefront/src/data/products.js';
import {slugify} from './lib/transform.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const ONLY = new Set(readFileSync(process.env.ONLY_FILE, 'utf8').split('\n').filter(Boolean));
const DOMAIN = process.env.SHOPIFY_STORE_DOMAIN;
let TOKEN = process.env.SHOPIFY_ADMIN_TOKEN;
const CLIENT_ID = process.env.SHOPIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SHOPIFY_CLIENT_SECRET;
if (!DOMAIN || (!TOKEN && !(CLIENT_ID && CLIENT_SECRET))) {
  console.error('Set SHOPIFY_STORE_DOMAIN plus auth env vars.');
  process.exit(1);
}
const ENDPOINT = `https://${DOMAIN}/admin/api/2025-10/graphql.json`;
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

if (!TOKEN) TOKEN = await fetchAccessToken();

let swapped = 0;
for (const p of products) {
  const handle = slugify(p.name);
  if (!ONLY.has(handle)) continue;
  const imgPath = resolve(ROOT, 'storefront/public/products', `${handle}.png`);
  if (!existsSync(imgPath)) {
    console.warn(`no local square: ${handle}`);
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
  if (!node) continue;
  const oldCards = node.media.nodes.filter((m) => m.image && !m.image.url.includes('-square'));

  const resourceUrl = await uploadLocalImage(imgPath);
  const created = await gql(
    `mutation($productId: ID!, $media: [CreateMediaInput!]!) {
      productCreateMedia(productId: $productId, media: $media) {
        media { id }
        mediaUserErrors { field message }
      }
    }`,
    {productId: node.id, media: [{originalSource: resourceUrl, mediaContentType: 'IMAGE', alt: `${p.name} fragrance notes`}]},
  );
  const cerr = created.productCreateMedia.mediaUserErrors;
  if (cerr.length) throw new Error(`${handle} create: ${JSON.stringify(cerr)}`);
  const newId = created.productCreateMedia.media[0].id;

  // wait for READY before reordering
  for (let i = 0; i < 20; i++) {
    const st = await gql(`query($id: ID!) { node(id: $id) { ... on Media { status } } }`, {id: newId});
    if (st.node?.status === 'READY') break;
    await sleep(1500);
  }

  if (oldCards.length) {
    const del = await gql(
      `mutation($productId: ID!, $mediaIds: [ID!]!) {
        productDeleteMedia(productId: $productId, mediaIds: $mediaIds) {
          mediaUserErrors { field message }
        }
      }`,
      {productId: node.id, mediaIds: oldCards.map((m) => m.id)},
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
    {id: node.id, moves: [{id: newId, newPosition: '1'}]},
  );
  const rerr = re.productReorderMedia.mediaUserErrors;
  if (rerr.length) throw new Error(`${handle} reorder: ${JSON.stringify(rerr)}`);
  swapped++;
  console.log(`swapped: ${handle}`);
}
console.log(`\n${swapped} cards swapped.`);
