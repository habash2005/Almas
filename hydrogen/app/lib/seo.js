import {createElement} from 'react';

// Central SEO helpers. The brand entity is "ALMAS Scent" (singular — distinct
// from the unrelated "Almas Scents" line), so every title, description, and
// JSON-LD block spells it that way consistently to reinforce the entity.

export const SITE_NAME = 'ALMAS Scent';
export const SITE_URL = 'https://www.almasscent.com';
export const BRAND_DESCRIPTION =
  'ALMAS Scent crafts luxury-inspired perfumes that capture the essence of the world’s most coveted designer fragrances — available in 30ml, 50ml, and 100ml with free US shipping over $100.';

const DEFAULT_OG_IMAGE = `${SITE_URL}/images/bottle-transparent.png`;

/**
 * Builds the standard meta array for a page: title, description, canonical,
 * Open Graph, and Twitter tags. `path` must start with '/'.
 * @param {{title?: string, description?: string, path?: string, image?: string, type?: string, noindex?: boolean, fullTitle?: string}} opts
 */
export function pageMeta({
  title,
  description = BRAND_DESCRIPTION,
  path = '/',
  image = DEFAULT_OG_IMAGE,
  type = 'website',
  noindex = false,
  fullTitle,
} = {}) {
  const resolvedTitle = fullTitle ?? (title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} — Luxury-Inspired Perfumes & Fragrances`);
  const url = `${SITE_URL}${path}`;
  return [
    {title: resolvedTitle},
    {name: 'description', content: description},
    {name: 'robots', content: noindex ? 'noindex,nofollow' : 'index,follow'},
    {tagName: 'link', rel: 'canonical', href: url},
    {property: 'og:site_name', content: SITE_NAME},
    {property: 'og:title', content: resolvedTitle},
    {property: 'og:description', content: description},
    {property: 'og:url', content: url},
    {property: 'og:type', content: type},
    {property: 'og:image', content: image},
    {name: 'twitter:card', content: 'summary_large_image'},
    {name: 'twitter:title', content: resolvedTitle},
    {name: 'twitter:description', content: description},
    {name: 'twitter:image', content: image},
  ];
}

export const ORGANIZATION_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: SITE_NAME,
  alternateName: ['ALMAS', 'Almas Scent', 'Almas Scent Perfumes'],
  url: SITE_URL,
  logo: `${SITE_URL}/favicon.svg`,
  description: BRAND_DESCRIPTION,
  sameAs: [
    'https://instagram.com/almasscent',
    'https://www.tiktok.com/@almasscent',
  ],
};

export const WEBSITE_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SITE_NAME,
  alternateName: 'ALMAS',
  url: SITE_URL,
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
};

/** Product JSON-LD for a PDP, from a toAlmasProduct() shape. */
export function productJsonLd(p) {
  const inStock = Object.values(p.variantBySize ?? {}).some((v) => v.availableForSale);
  const prices = Object.values(p.prices ?? {});
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: p.name,
    url: `${SITE_URL}/products/${p.handle}`,
    image: p.image?.startsWith('http') ? p.image : `${SITE_URL}${p.image}`,
    description: p.inspiredBy
      ? `${p.description} Inspired by ${p.inspiredBy}.`
      : p.description,
    brand: {'@type': 'Brand', name: SITE_NAME},
    category: 'Fragrances',
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'USD',
      lowPrice: prices.length ? Math.min(...prices).toFixed(2) : '29.99',
      highPrice: prices.length ? Math.max(...prices).toFixed(2) : '69.99',
      offerCount: Object.keys(p.prices ?? {}).length || 3,
      availability: inStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      url: `${SITE_URL}/products/${p.handle}`,
    },
  };
}

/** BreadcrumbList JSON-LD; items = [{name, path}] in order. */
export function breadcrumbJsonLd(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  };
}

/** FAQPage JSON-LD from [{q, a}] pairs. */
export function faqJsonLd(pairs) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: pairs.map(({q, a}) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: {'@type': 'Answer', text: a},
    })),
  };
}

/** Renders a JSON-LD script tag (server-rendered; safe for SSR head/body). */
export function JsonLd({data}) {
  return createElement('script', {
    type: 'application/ld+json',
    dangerouslySetInnerHTML: {__html: JSON.stringify(data)},
  });
}
