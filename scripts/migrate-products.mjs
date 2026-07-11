import {existsSync, readFileSync} from 'node:fs';
import {resolve, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {products} from '../storefront/src/data/products.js';
import {toProductSetInput, COLLECTIONS} from './lib/transform.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DOMAIN = process.env.SHOPIFY_STORE_DOMAIN; // e.g. almas-dev.myshopify.com
const TOKEN = process.env.SHOPIFY_ADMIN_TOKEN;   // shpat_... from custom app
if (!DOMAIN || !TOKEN) {
  console.error('Set SHOPIFY_STORE_DOMAIN and SHOPIFY_ADMIN_TOKEN. See docs/STORE_SETUP.md');
  process.exit(1);
}
const ENDPOINT = `https://${DOMAIN}/admin/api/2025-10/graphql.json`;

async function gql(query, variables) {
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {'Content-Type': 'application/json', 'X-Shopify-Access-Token': TOKEN},
    body: JSON.stringify({query, variables}),
  });
  if (res.status === 429) {
    await new Promise((r) => setTimeout(r, 2000));
    return gql(query, variables);
  }
  const body = await res.json();
  if (body.errors) throw new Error(JSON.stringify(body.errors));
  return body.data;
}

async function findProductId(handle) {
  const data = await gql(
    `query($q: String!) { products(first: 1, query: $q) { nodes { id handle } } }`,
    {q: `handle:${handle}`},
  );
  const node = data.products.nodes[0];
  return node && node.handle === handle ? node.id : null;
}

const PRODUCT_SET = `
  mutation productSet($input: ProductSetInput!) {
    productSet(input: $input) {
      product { id handle }
      userErrors { field message }
    }
  }`;

const MEDIA_CREATE = `
  mutation productCreateMedia($productId: ID!, $media: [CreateMediaInput!]!) {
    productCreateMedia(productId: $productId, media: $media) {
      media { id }
      mediaUserErrors { field message }
    }
  }`;

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

async function migrateProducts() {
  let created = 0, updated = 0;
  for (const p of products) {
    const input = toProductSetInput(p);
    const existingId = await findProductId(input.handle);
    if (existingId) input.id = existingId;
    const data = await gql(PRODUCT_SET, {input});
    const errs = data.productSet.userErrors;
    if (errs.length) throw new Error(`${input.handle}: ${JSON.stringify(errs)}`);
    const productId = data.productSet.product.id;
    existingId ? updated++ : created++;

    // Attach dedicated image only on first create (avoid duplicate media on re-runs)
    const imgPath = p.image && resolve(ROOT, 'storefront/public', '.' + p.image);
    if (!existingId && imgPath && existsSync(imgPath)) {
      const resourceUrl = await uploadLocalImage(imgPath);
      const media = await gql(MEDIA_CREATE, {
        productId,
        media: [{originalSource: resourceUrl, mediaContentType: 'IMAGE', alt: p.name}],
      });
      const mErrs = media.productCreateMedia.mediaUserErrors;
      if (mErrs.length) console.warn(`  media warning ${input.handle}:`, mErrs);
    }
    console.log(`${existingId ? 'updated' : 'created'} ${input.handle}`);
  }
  console.log(`\nProducts: ${created} created, ${updated} updated.`);
}

async function migrateCollections() {
  for (const c of COLLECTIONS) {
    const found = await gql(
      `query($handle: String!) { collectionByHandle(handle: $handle) { id } }`,
      {handle: c.handle},
    );
    if (found.collectionByHandle) {
      console.log(`collection exists: ${c.handle}`);
      continue;
    }
    const data = await gql(
      `mutation($input: CollectionInput!) {
        collectionCreate(input: $input) {
          collection { id handle }
          userErrors { field message }
        }
      }`,
      {input: {
        title: c.title,
        handle: c.handle,
        ruleSet: {appliedDisjunctively: false, rules: [{column: 'TAG', relation: 'EQUALS', condition: c.tag}]},
      }},
    );
    const errs = data.collectionCreate.userErrors;
    if (errs.length) throw new Error(`${c.handle}: ${JSON.stringify(errs)}`);
    console.log(`created collection: ${c.handle}`);
  }
}

await migrateProducts();
await migrateCollections();
console.log('Done. Reminder: create the "Scent Subscription" selling plan in the Shopify Subscriptions app (see docs/STORE_SETUP.md §4).');
