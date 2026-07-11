import {describe, it, expect} from 'vitest';
import {toProductSetInput, slugify, METAFIELD_DEFINITIONS} from './transform.mjs';

const LEGACY_PRODUCT = {
  id: 1,
  name: 'Midnight Aventus',
  inspiredBy: 'Creed Aventus',
  category: 'men',
  scentFamily: 'Woody',
  badge: 'Best Seller',
  prices: {'50ml': 120, '100ml': 180},
  accords: [{name: 'Fruity', strength: 90, color: '#FF6347'}],
  notes: {top: ['Pineapple'], heart: ['Birch'], base: ['Musk']},
  longevity: '8-10 hours',
  sillage: 'Strong',
  bestFor: ['Evening', 'Fall', 'Winter'],
  description: 'A bold fragrance.',
  image: '/products/midnight-aventus.png',
};

describe('slugify', () => {
  it('makes url-safe handles', () => {
    expect(slugify('Midnight Aventus')).toBe('midnight-aventus');
    expect(slugify("L'Éclat No. 5")).toBe('l-eclat-no-5');
  });
});

describe('toProductSetInput', () => {
  it('builds a complete ProductSetInput', () => {
    const input = toProductSetInput(LEGACY_PRODUCT);
    expect(input.handle).toBe('midnight-aventus');
    expect(input.title).toBe('Midnight Aventus');
    expect(input.vendor).toBe('ALMAS');
    expect(input.status).toBe('ACTIVE');
    expect(input.tags).toEqual(['men', 'Woody', 'Best Seller']);
    expect(input.productOptions).toEqual([
      {name: 'Size', values: [{name: '50ml'}, {name: '100ml'}]},
    ]);
    expect(input.variants).toEqual([
      {optionValues: [{optionName: 'Size', name: '50ml'}], price: '120'},
      {optionValues: [{optionName: 'Size', name: '100ml'}], price: '180'},
    ]);
    const mf = Object.fromEntries(input.metafields.map((m) => [m.key, m]));
    expect(mf.inspired_by).toEqual({namespace: 'almas', key: 'inspired_by', type: 'single_line_text_field', value: 'Creed Aventus'});
    expect(JSON.parse(mf.accords.value)).toEqual(LEGACY_PRODUCT.accords);
    expect(JSON.parse(mf.notes.value)).toEqual(LEGACY_PRODUCT.notes);
    expect(mf.longevity.value).toBe('8-10 hours');
    expect(mf.sillage.value).toBe('Strong');
    expect(mf.best_for.type).toBe('list.single_line_text_field');
    expect(JSON.parse(mf.best_for.value)).toEqual(['Evening', 'Fall', 'Winter']);
  });

  it('omits badge tag and empty metafields when fields missing', () => {
    const input = toProductSetInput({...LEGACY_PRODUCT, badge: undefined, inspiredBy: undefined});
    expect(input.tags).toEqual(['men', 'Woody']);
    expect(input.metafields.find((m) => m.key === 'inspired_by')).toBeUndefined();
  });
});

describe('METAFIELD_DEFINITIONS', () => {
  it('covers exactly the metafield keys produced by toProductSetInput, with matching types', () => {
    const produced = toProductSetInput(LEGACY_PRODUCT).metafields;
    const producedByKey = Object.fromEntries(produced.map((m) => [m.key, m]));
    const definedByKey = Object.fromEntries(METAFIELD_DEFINITIONS.map((d) => [d.key, d]));
    expect(Object.keys(definedByKey).sort()).toEqual(Object.keys(producedByKey).sort());
    for (const [key, def] of Object.entries(definedByKey)) {
      expect(def.type).toBe(producedByKey[key].type);
      expect(def.namespace).toBe(producedByKey[key].namespace);
    }
  });

  it('grants storefront read access on every definition', () => {
    for (const def of METAFIELD_DEFINITIONS) {
      expect(def.ownerType).toBe('PRODUCT');
      expect(def.access).toEqual({storefront: 'PUBLIC_READ'});
      expect(def.name).toBeTruthy();
    }
  });
});
