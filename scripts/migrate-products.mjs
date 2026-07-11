import {existsSync, readFileSync} from 'node:fs';
import {resolve, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {products} from '../storefront/src/data/products.js';
import {toProductSetInput, COLLECTIONS, METAFIELD_DEFINITIONS} from './lib/transform.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DOMAIN = process.env.SHOPIFY_STORE_DOMAIN; // e.g. almas-dev.myshopify.com
const TOKEN = process.env.SHOPIFY_ADMIN_TOKEN;   // shpat_... from custom app
if (!DOMAIN || !TOKEN) {
  console.error('Set SHOPIFY_STORE_DOMAIN and SHOPIFY_ADMIN_TOKEN. See docs/STORE_SETUP.md');
  process.exit(1);
}
const ENDPOINT = `https://${DOMAIN}/admin/api/2025-10/graphql.json`;

const MAX_ATTEMPTS = 5;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function gql(query, variables, attempt = 1) {
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {'Content-Type': 'application/json', 'X-Shopify-Access-Token': TOKEN},
    body: JSON.stringify({query, variables}),
  });
  if (res.status === 429) {
    if (attempt >= MAX_ATTEMPTS) throw new Error(`rate limited (HTTP 429): gave up after ${MAX_ATTEMPTS} attempts`);
    await sleep(2000);
    return gql(query, variables, attempt + 1);
  }
  if (!res.ok) throw new Error(`Admin API request failed: HTTP ${res.status} ${res.statusText}`);
  const body = await res.json();
  if (body.errors) {
    const throttled = body.errors.length > 0 &&
      body.errors.every((e) => e.extensions?.code === 'THROTTLED');
    if (throttled) {
      if (attempt >= MAX_ATTEMPTS) throw new Error(`rate limited (THROTTLED): gave up after ${MAX_ATTEMPTS} attempts`);
      await sleep(2000);
      return gql(query, variables, attempt + 1);
    }
    throw new Error(JSON.stringify(body.errors));
  }
  return body.data;
}

async function findProductId(handle) {
  const data = await gql(
    `query($q: String!) { products(first: 10, query: $q) { nodes { id handle } } }`,
    {q: `handle:"${handle}"`},
  );
  return data.products.nodes.find((n) => n.handle === handle)?.id ?? null;
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

const METAFIELD_DEFINITION_CREATE = `
  mutation($definition: MetafieldDefinitionInput!) {
    metafieldDefinitionCreate(definition: $definition) {
      createdDefinition { id }
      userErrors { field message code }
    }
  }`;

const PUBLISHABLE_PUBLISH = `
  mutation($id: ID!, $input: [PublicationInput!]!) {
    publishablePublish(id: $id, input: $input) { userErrors { field message } }
  }`;

// Metafields written via the Admin API are invisible to the Storefront API unless a
// definition with storefront access exists — create them first, idempotently.
async function ensureMetafieldDefinitions() {
  for (const definition of METAFIELD_DEFINITIONS) {
    const data = await gql(METAFIELD_DEFINITION_CREATE, {definition});
    const errs = data.metafieldDefinitionCreate.userErrors;
    if (errs.length) {
      const alreadyExists = errs.every(
        (e) => e.code === 'TAKEN' || /already exists|in use/i.test(e.message),
      );
      if (!alreadyExists) throw new Error(`metafield definition ${definition.key}: ${JSON.stringify(errs)}`);
      console.log(`definition exists: ${definition.key}`);
      continue;
    }
    console.log(`created definition: ${definition.key}`);
  }
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

async function migrateProducts() {
  let created = 0, updated = 0;
  const productIds = [];
  for (const p of products) {
    const input = toProductSetInput(p);
    const existingId = await findProductId(input.handle);
    if (existingId) input.id = existingId;
    const data = await gql(PRODUCT_SET, {input});
    const errs = data.productSet.userErrors;
    if (errs.length) throw new Error(`${input.handle}: ${JSON.stringify(errs)}`);
    const productId = data.productSet.product.id;
    productIds.push(productId);
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
  return productIds;
}

async function migrateCollections() {
  const collectionIds = [];
  for (const c of COLLECTIONS) {
    const found = await gql(
      `query($handle: String!) { collectionByHandle(handle: $handle) { id } }`,
      {handle: c.handle},
    );
    if (found.collectionByHandle) {
      collectionIds.push(found.collectionByHandle.id);
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
    collectionIds.push(data.collectionCreate.collection.id);
    console.log(`created collection: ${c.handle}`);
  }
  return collectionIds;
}

// Publish every migrated product/collection to all sales channels (idempotent:
// re-publishing an already-published resource is a no-op).
async function publishAll(resourceIds) {
  let publications;
  try {
    const data = await gql(`{ publications(first: 20) { nodes { id name } } }`);
    publications = data.publications.nodes;
  } catch (err) {
    console.warn(`Could not read publications: ${err.message}`);
    console.warn('Hint: the custom app needs the read_publications and write_publications access scopes.');
    console.warn('Skipping channel publishing — migrated products/collections may not be visible on the storefront until published.');
    return;
  }
  if (!publications.length) {
    console.warn('No publications found — skipping channel publishing.');
    return;
  }
  const input = publications.map((p) => ({publicationId: p.id}));
  const failed = [];
  for (const id of resourceIds) {
    try {
      const data = await gql(PUBLISHABLE_PUBLISH, {id, input});
      const errs = data.publishablePublish.userErrors.filter(
        (e) => !/already published/i.test(e.message),
      );
      if (errs.length) {
        failed.push(id);
        console.warn(`publish warning ${id}:`, JSON.stringify(errs));
      }
    } catch (err) {
      failed.push(id);
      console.warn(`publish failed ${id}: ${err.message}`);
    }
  }
  console.log(`\nPublished ${resourceIds.length - failed.length}/${resourceIds.length} resources to ${publications.length} channel(s): ${publications.map((p) => p.name).join(', ')}.`);
  if (failed.length) {
    console.warn(`${failed.length} resource(s) failed to publish — re-run the script or publish manually in the Shopify admin:`);
    for (const id of failed) console.warn(`  ${id}`);
  }
}

await ensureMetafieldDefinitions();
const productIds = await migrateProducts();
const collectionIds = await migrateCollections();
await publishAll([...productIds, ...collectionIds]);
console.log('Done. Reminder: create the "Scent Subscription" selling plan in the Shopify Subscriptions app (see docs/STORE_SETUP.md §4).');
