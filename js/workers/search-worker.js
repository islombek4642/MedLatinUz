/**
 * search-worker.js - Dedicated background Web Worker for fuzzy medical search
 * Offloads indexing, scoring, and sorting from the main UI thread.
 */

let entries = [];

function normalize(str) {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

self.onmessage = function (e) {
  const { type, payload } = e.data;

  if (type === 'INIT') {
    entries = payload.map(item => ({
      ...item,
      _normLatin: normalize(item.latin),
      _normTranslation: normalize(item.translation_uz),
      _normDefinition: normalize(item.definition_uz)
    }));
    self.postMessage({ type: 'INIT_DONE', count: entries.length });
    return;
  }

  if (type === 'SEARCH') {
    const { query, categoryFilter, searchId } = payload;
    const normQuery = normalize(query);
    const hasCategory = categoryFilter && categoryFilter !== 'all';

    let pool = entries;
    if (hasCategory) {
      if (categoryFilter === 'anatomy' || categoryFilter === 'anatomy_group') {
        pool = entries.filter(e => e.category === 'anatomy' || (e.category && e.category.startsWith('anatomy_')));
      } else if (categoryFilter === 'general' || categoryFilter === 'latin_group') {
        pool = entries.filter(e => e.category === 'general' || (e.category && e.category.startsWith('latin_')));
      } else {
        pool = entries.filter(e => e.category === categoryFilter);
      }
    }

    if (!normQuery) {
      self.postMessage({ type: 'SEARCH_RESULTS', searchId, results: pool });
      return;
    }

    const scored = [];
    for (let i = 0; i < pool.length; i++) {
      const entry = pool[i];
      let score = 0;

      if (entry._normLatin === normQuery) {
        score += 100;
      } else if (entry._normLatin.startsWith(normQuery)) {
        score += 70;
      } else if (entry._normLatin.includes(normQuery)) {
        score += 40;
      }

      if (entry._normTranslation === normQuery) {
        score += 80;
      } else if (entry._normTranslation.startsWith(normQuery)) {
        score += 60;
      } else if (entry._normTranslation.includes(normQuery)) {
        score += 35;
      }

      if (entry._normDefinition.includes(normQuery)) {
        score += 15;
      }

      if (score > 0) {
        scored.push({ entry, score });
      }
    }

    scored.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.entry.latin.localeCompare(b.entry.latin);
    });

    const results = scored.map(s => s.entry);
    self.postMessage({ type: 'SEARCH_RESULTS', searchId, results });
  }
};
