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

export function toProductSetInput(p) {
  return {
    handle: slugify(p.name),
    title: p.name,
    descriptionHtml: `<p>${p.description ?? ''}</p>`,
    productType: 'Fragrance',
    vendor: 'ALMAS',
    status: 'ACTIVE',
    tags: [p.category, p.scentFamily, p.badge].filter(Boolean),
    productOptions: [{name: 'Size', values: Object.keys(p.prices).map((name) => ({name}))}],
    variants: Object.entries(p.prices).map(([size, price]) => ({
      optionValues: [{optionName: 'Size', name: size}],
      price: String(price),
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

export const COLLECTIONS = [
  {title: 'For Him', handle: 'for-him', tag: 'men'},
  {title: 'For Her', handle: 'for-her', tag: 'women'},
  {title: 'Unisex', handle: 'unisex', tag: 'unisex'},
  ...['Woody', 'Oriental', 'Floral', 'Fresh', 'Spicy', 'Amber', 'Oud', 'Citrus', 'Aromatic', 'Gourmand']
    .map((f) => ({title: f, handle: slugify(f), tag: f})),
];
