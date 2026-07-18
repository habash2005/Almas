// Typo-tolerant catalog search. Shopify's storefront search only does exact
// word matching, so misspellings like "backarat" found nothing. The catalog
// is small (~200 products), so we rank every product ourselves against the
// query: exact > prefix > substring > small-edit-distance matches, across
// name, inspired-by, scent family, accords, and notes.

const norm = (s) =>
  (s ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

/** Levenshtein distance, bailing out early once it exceeds `cap`. */
function editDistance(a, b, cap) {
  if (Math.abs(a.length - b.length) > cap) return cap + 1;
  let prev = Array.from({length: b.length + 1}, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    let rowMin = i;
    for (let j = 1; j <= b.length; j++) {
      cur[j] = Math.min(
        prev[j] + 1,
        cur[j - 1] + 1,
        prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
      if (cur[j] < rowMin) rowMin = cur[j];
    }
    if (rowMin > cap) return cap + 1;
    prev = cur;
  }
  return prev[b.length];
}

/** Best match score for one query token against one word. */
function tokenWordScore(token, word) {
  if (token === word) return 100;
  if (word.startsWith(token) && token.length >= 2) return 70;
  if (token.length >= 4 && word.includes(token)) return 50;
  if (token.length >= 4) {
    if (isAdjacentSwap(token, word)) return 40;
    const cap = token.length >= 6 ? 2 : 1;
    if (editDistance(token, word, cap) <= cap) return 40;
  }
  return 0;
}

/** True when two words differ only by one swapped adjacent letter pair. */
function isAdjacentSwap(a, b) {
  if (a.length !== b.length) return false;
  let i = 0;
  while (i < a.length && a[i] === b[i]) i++;
  if (i >= a.length - 1) return false;
  return (
    a[i] === b[i + 1] &&
    a[i + 1] === b[i] &&
    a.slice(i + 2) === b.slice(i + 2)
  );
}

/** Adds adjacent-word concatenations so "tomford" matches "tom ford". */
function withJoins(words) {
  const out = [...words];
  for (let i = 0; i < words.length - 1; i++) out.push(words[i] + words[i + 1]);
  return out;
}

function bestInField(token, words) {
  let best = 0;
  for (const w of words) {
    const s = tokenWordScore(token, w);
    if (s > best) best = s;
    if (best === 100) break;
  }
  return best;
}

/**
 * Ranks products against a query. Every query token must match somewhere
 * (typo-tolerantly); results are sorted by total weighted score.
 * @param {Array} products - toAlmasProduct() shapes
 * @param {string} query
 * @param {{limit?: number}} [opts]
 */
export function searchProducts(products, query, {limit = 50} = {}) {
  const tokens = norm(query).split(' ').filter(Boolean);
  if (!tokens.length) return [];

  const scored = [];
  for (const p of products) {
    const fields = [
      {words: withJoins(norm(p.name).split(' ')), weight: 1.0},
      {words: withJoins(norm(p.inspiredBy).split(' ')), weight: 1.0},
      {words: norm(p.scentFamily).split(' '), weight: 0.6},
      {words: (p.accords ?? []).flatMap((a) => norm(a.name).split(' ')), weight: 0.5},
      {
        words: p.notes
          ? Object.values(p.notes).flat().flatMap((n) => norm(n).split(' '))
          : [],
        weight: 0.4,
      },
    ];
    let total = 0;
    let allMatched = true;
    for (const token of tokens) {
      let best = 0;
      for (const f of fields) {
        const s = bestInField(token, f.words) * f.weight;
        if (s > best) best = s;
      }
      if (best === 0) {
        allMatched = false;
        break;
      }
      total += best;
    }
    if (allMatched) scored.push({p, total});
  }
  scored.sort((a, b) => b.total - a.total);
  return scored.slice(0, limit).map((s) => s.p);
}
