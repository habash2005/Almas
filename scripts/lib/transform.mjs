export function slugify(name) {
  return name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function metafield(key, type, value) {
  return value == null || value === '' ? null : {namespace: 'almas', key, type, value};
}

// Uniform storewide pricing (2026-07-12): every fragrance sells in three
// sizes at fixed price points, superseding the per-product prices in
// storefront/src/data/products.js.
export const PRICING = {
  '30ml': '29.99',
  '50ml': '49.99',
  '100ml': '69.99',
};

// SKUs carry the ORIGINAL (inspired-by) scent name so Shopify POS search —
// which matches SKUs, not tags — finds products by the name used in stores,
// while the website keeps the alias titles. e.g. CREED-AVENTUS-50ML.
export function skuFor(p, size) {
  return `${slugify(p.inspiredBy || p.name).toUpperCase()}-${size.toUpperCase()}`;
}

const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const strengthLabel = (v) => (v >= 85 ? 'Strong' : v >= 60 ? 'Medium' : 'Soft');

// Rich product description for Shopify surfaces (Shop app, POS, admin,
// channels) mirroring the detail the website renders from metafields.
// The site itself keeps showing only the short blurb (almas.short_description
// metafield) as its intro paragraph.
export function richDescriptionHtml(p) {
  const parts = [];
  if (p.description) parts.push(`<p>${esc(p.description)}</p>`);
  if (p.inspiredBy) parts.push(`<p><em>Inspired by ${esc(p.inspiredBy)}</em></p>`);
  if (p.notes && (p.notes.top?.length || p.notes.heart?.length || p.notes.base?.length)) {
    const rows = [
      ['Top', p.notes.top],
      ['Heart', p.notes.heart],
      ['Base', p.notes.base],
    ]
      .filter(([, list]) => list?.length)
      .map(([label, list]) => `<li><strong>${label}:</strong> ${esc(list.join(', '))}</li>`);
    parts.push(`<h3>Fragrance Notes</h3><ul>${rows.join('')}</ul>`);
  }
  if (p.accords?.length) {
    const rows = [...p.accords]
      .sort((a, b) => b.strength - a.strength)
      .map((a) => `<li>${esc(a.name)} — ${strengthLabel(a.strength)}</li>`);
    parts.push(`<h3>Scent Profile</h3><ul>${rows.join('')}</ul>`);
  }
  const details = [
    p.longevity && `<li><strong>Longevity:</strong> ${esc(p.longevity)}</li>`,
    p.sillage && `<li><strong>Sillage:</strong> ${esc(p.sillage)}</li>`,
    p.bestFor?.length && `<li><strong>Best for:</strong> ${esc(p.bestFor.join(', '))}</li>`,
  ].filter(Boolean);
  if (details.length) parts.push(`<h3>Details</h3><ul>${details.join('')}</ul>`);
  return parts.join('\n');
}

export function toProductSetInput(p) {
  return {
    handle: slugify(p.name),
    title: p.name,
    descriptionHtml: richDescriptionHtml(p),
    productType: 'Fragrance',
    vendor: 'ALMAS',
    status: 'ACTIVE',
    // inspiredBy tag aids admin search; site tag logic only reads
    // category/scent-family/badge values so it is unaffected.
    tags: [p.category, p.scentFamily, p.badge, p.inspiredBy].filter(Boolean),
    productOptions: [{name: 'Size', values: Object.keys(PRICING).map((name) => ({name}))}],
    // NOTE: no inventory fields here — stock is owned by set-stock.mjs and
    // oil-inventory.mjs; the migration must never clobber availability.
    variants: Object.entries(PRICING).map(([size, price]) => ({
      optionValues: [{optionName: 'Size', name: size}],
      price,
      inventoryItem: {sku: skuFor(p, size)},
    })),
    metafields: [
      metafield('short_description', 'multi_line_text_field', p.description),
      metafield('inspired_by', 'single_line_text_field', p.inspiredBy),
      metafield('accords', 'json', p.accords && JSON.stringify(p.accords)),
      metafield('notes', 'json', p.notes && JSON.stringify(p.notes)),
      metafield('longevity', 'single_line_text_field', p.longevity),
      metafield('sillage', 'single_line_text_field', p.sillage),
      metafield('best_for', 'list.single_line_text_field', p.bestFor?.length ? JSON.stringify(p.bestFor) : null),
    ].filter(Boolean),
  };
}

// One definition per metafield key emitted by toProductSetInput. Storefront access
// PUBLIC_READ is required for the Hydrogen storefront to read these via the Storefront API.
export const METAFIELD_DEFINITIONS = [
  {name: 'Short description', key: 'short_description', type: 'multi_line_text_field'},
  {name: 'Inspired by', key: 'inspired_by', type: 'single_line_text_field'},
  {name: 'Accords', key: 'accords', type: 'json'},
  {name: 'Notes', key: 'notes', type: 'json'},
  {name: 'Longevity', key: 'longevity', type: 'single_line_text_field'},
  {name: 'Sillage', key: 'sillage', type: 'single_line_text_field'},
  {name: 'Best for', key: 'best_for', type: 'list.single_line_text_field'},
].map((d) => ({
  ...d,
  namespace: 'almas',
  ownerType: 'PRODUCT',
  access: {storefront: 'PUBLIC_READ'},
}));

export const COLLECTIONS = [
  {title: 'For Him', handle: 'for-him', tag: 'men'},
  {title: 'For Her', handle: 'for-her', tag: 'women'},
  {title: 'Unisex', handle: 'unisex', tag: 'unisex'},
  ...['Woody', 'Oriental', 'Floral', 'Fresh', 'Spicy', 'Amber', 'Oud', 'Citrus', 'Aromatic', 'Gourmand']
    .map((f) => ({title: f, handle: slugify(f), tag: f})),
];
