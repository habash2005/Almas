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

export function toProductSetInput(p) {
  return {
    handle: slugify(p.name),
    title: p.name,
    descriptionHtml: `<p>${p.description ?? ''}</p>`,
    productType: 'Fragrance',
    vendor: 'ALMAS',
    status: 'ACTIVE',
    tags: [p.category, p.scentFamily, p.badge].filter(Boolean),
    productOptions: [{name: 'Size', values: Object.keys(PRICING).map((name) => ({name}))}],
    variants: Object.entries(PRICING).map(([size, price]) => ({
      optionValues: [{optionName: 'Size', name: size}],
      price,
    })),
    metafields: [
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
