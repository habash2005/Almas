// hydrogen/app/lib/almas.js
export const SCENT_FAMILIES = ['Woody', 'Oriental', 'Floral', 'Fresh', 'Spicy', 'Amber', 'Oud', 'Citrus', 'Aromatic', 'Gourmand'];
export const BADGES = ['Best Seller', 'New', 'Limited', 'Exclusive', 'Popular', 'Trending'];
export const CATEGORIES = [
  {id: 'men', name: 'For Him'},
  {id: 'women', name: 'For Her'},
  {id: 'unisex', name: 'Unisex'},
];

function parseJSON(value, fallback) {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

export function toAlmasProduct(node) {
  if (!node) return null;
  const variants = node.variants?.nodes ?? [];
  const prices = {};
  const variantBySize = {};
  for (const v of variants) {
    // Keep decimals: $29.99 must not display as $30. Whole-dollar amounts
    // ("120.00") still render as 120.
    prices[v.title] = parseFloat(v.price.amount);
    variantBySize[v.title] = v;
  }
  const tags = node.tags ?? [];
  const category = tags.includes('men') ? 'men' : tags.includes('women') ? 'women' : 'unisex';
  return {
    id: node.handle,
    handle: node.handle,
    gid: node.id,
    name: node.title,
    inspiredBy: node.inspiredBy?.value ?? '',
    category,
    scentFamily: tags.find((t) => SCENT_FAMILIES.includes(t)) ?? null,
    badge: tags.find((t) => BADGES.includes(t)) ?? null,
    prices,
    variantBySize,
    accords: parseJSON(node.accords?.value, []),
    notes: parseJSON(node.notes?.value, null),
    longevity: node.longevity?.value ?? null,
    sillage: node.sillage?.value ?? null,
    bestFor: parseJSON(node.bestFor?.value, []),
    description: node.description ?? '',
    image: node.featuredImage?.url ?? '/images/bottle.png',
  };
}

// Metafield selections are written out in full inside each fragment (rather
// than interpolated from a shared string) because Shopify's graphql-codegen
// chokes on non-#graphql interpolations ("Variable METAFIELDS not found").
export const PRODUCT_CARD_FRAGMENT = `#graphql
  fragment ProductCard on Product {
    id
    handle
    title
    description
    tags
    featuredImage { url altText width height }
    variants(first: 10) {
      nodes { id title availableForSale price { amount currencyCode } }
    }
    inspiredBy: metafield(namespace: "almas", key: "inspired_by") { value }
    accords: metafield(namespace: "almas", key: "accords") { value }
    notes: metafield(namespace: "almas", key: "notes") { value }
  }
`;

export const ALL_PRODUCTS_QUERY = `#graphql
  ${PRODUCT_CARD_FRAGMENT}
  query AllProducts($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    products(first: 250) {
      nodes {
        ...ProductCard
        # Extra scent metafields the scent-finder scoring reads; cards ignore them.
        longevity: metafield(namespace: "almas", key: "longevity") { value }
        sillage: metafield(namespace: "almas", key: "sillage") { value }
        bestFor: metafield(namespace: "almas", key: "best_for") { value }
      }
    }
  }
`;

/**
 * Fetches the full catalog (legacy shape) in one page — the legacy
 * storefront filters/sorts the whole product array client-side.
 * Shared by the shop page and the scent finder.
 */
export async function loadAllProducts(context) {
  const {products} = await context.storefront.query(ALL_PRODUCTS_QUERY);
  return products.nodes.map(toAlmasProduct);
}

export const PRODUCT_FULL_FRAGMENT = `#graphql
  fragment ProductFull on Product {
    id
    handle
    title
    description
    tags
    featuredImage { url altText width height }
    images(first: 5) { nodes { url altText width height } }
    variants(first: 10) {
      nodes { id title availableForSale price { amount currencyCode } }
    }
    sellingPlanGroups(first: 2) {
      nodes {
        name
        sellingPlans(first: 5) {
          nodes {
            id
            name
            priceAdjustments { adjustmentValue { ... on SellingPlanPercentagePriceAdjustment { adjustmentPercentage } } }
          }
        }
      }
    }
    inspiredBy: metafield(namespace: "almas", key: "inspired_by") { value }
    accords: metafield(namespace: "almas", key: "accords") { value }
    notes: metafield(namespace: "almas", key: "notes") { value }
    longevity: metafield(namespace: "almas", key: "longevity") { value }
    sillage: metafield(namespace: "almas", key: "sillage") { value }
    bestFor: metafield(namespace: "almas", key: "best_for") { value }
  }
`;
