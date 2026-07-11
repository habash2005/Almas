// hydrogen/app/lib/almas.test.js
import {describe, it, expect} from 'vitest';
import {toAlmasProduct} from './almas';

const NODE = {
  id: 'gid://shopify/Product/1',
  handle: 'midnight-aventus',
  title: 'Midnight Aventus',
  description: 'A bold fragrance.',
  tags: ['men', 'Woody', 'Best Seller'],
  featuredImage: {url: 'https://cdn/img.png', altText: null, width: 800, height: 800},
  variants: {nodes: [
    {id: 'gid://shopify/ProductVariant/11', title: '50ml', availableForSale: true, price: {amount: '120.0', currencyCode: 'USD'}},
    {id: 'gid://shopify/ProductVariant/12', title: '100ml', availableForSale: true, price: {amount: '180.0', currencyCode: 'USD'}},
  ]},
  inspiredBy: {value: 'Creed Aventus'},
  accords: {value: JSON.stringify([{name: 'Fruity', strength: 90, color: '#FF6347'}])},
  notes: {value: JSON.stringify({top: ['Pineapple'], heart: ['Birch'], base: ['Musk']})},
  longevity: {value: '8-10 hours'},
  sillage: {value: 'Strong'},
  bestFor: {value: JSON.stringify(['Evening', 'Fall'])},
};

describe('toAlmasProduct', () => {
  it('maps a full Shopify node to the legacy shape', () => {
    const p = toAlmasProduct(NODE);
    expect(p.name).toBe('Midnight Aventus');
    expect(p.handle).toBe('midnight-aventus');
    expect(p.id).toBe('midnight-aventus'); // legacy components key on id; handle is stable
    expect(p.inspiredBy).toBe('Creed Aventus');
    expect(p.category).toBe('men');
    expect(p.scentFamily).toBe('Woody');
    expect(p.badge).toBe('Best Seller');
    expect(p.prices).toEqual({'50ml': 120, '100ml': 180});
    expect(p.variantBySize['50ml'].id).toBe('gid://shopify/ProductVariant/11');
    expect(p.accords[0].name).toBe('Fruity');
    expect(p.notes.top).toEqual(['Pineapple']);
    expect(p.bestFor).toEqual(['Evening', 'Fall']);
    expect(p.image).toBe('https://cdn/img.png');
  });

  it('degrades gracefully with no metafields/tags (mock.shop)', () => {
    const p = toAlmasProduct({...NODE, tags: [], inspiredBy: null, accords: null, notes: null, longevity: null, sillage: null, bestFor: null, featuredImage: null});
    expect(p.category).toBe('unisex');
    expect(p.accords).toEqual([]);
    expect(p.notes).toBeNull();
    expect(p.badge).toBeNull();
    expect(p.image).toBe('/images/bottle.png');
  });

  it('handles malformed metafield JSON', () => {
    const p = toAlmasProduct({...NODE, accords: {value: 'not-json'}});
    expect(p.accords).toEqual([]);
  });

  it('returns null for null input', () => {
    expect(toAlmasProduct(null)).toBeNull();
  });
});
