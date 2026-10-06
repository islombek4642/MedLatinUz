/**
 * SearchEngine - High performance fuzzy and bi-directional medical Latin search engine
 */
export class SearchEngine {
  constructor() {
    this.entries = [];
  }

  /**
   * Normalizes a string for search comparisons:
   * lowercases, removes dots, punctuation, excess whitespace
   */
  static normalize(str) {
    if (!str) return '';
    return str
      .toLowerCase()
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Initializes the engine with dictionary entries
   * @param {Array} entries
   */
  init(entries) {
    this.entries = entries.map(item => ({
      ...item,
      _normLatin: SearchEngine.normalize(item.latin),
      _normTranslation: SearchEngine.normalize(item.translation_uz),
      _normDefinition: SearchEngine.normalize(item.definition_uz)
    }));
  }

  /**
   * Searches entries by query and optional category filter
   * @param {string} query
   * @param {string} categoryFilter - 'all' or specific category
   * @returns {Array} Sorted matching entries
   */
  search(query = '', categoryFilter = 'all') {
    const normQuery = SearchEngine.normalize(query);
    const hasCategory = categoryFilter && categoryFilter !== 'all';

    // Base filtering by category
    let pool = hasCategory
      ? this.entries.filter(e => e.category === categoryFilter)
      : this.entries;

    if (!normQuery) {
      return pool;
    }

    const scored = [];

    for (const entry of pool) {
      let score = 0;

      // Exact match on normalized Latin
      if (entry._normLatin === normQuery) {
        score += 100;
      } else if (entry._normLatin.startsWith(normQuery)) {
        score += 70;
      } else if (entry._normLatin.includes(normQuery)) {
        score += 40;
      }

      // Check Uzbek translation
      if (entry._normTranslation === normQuery) {
        score += 80;
      } else if (entry._normTranslation.startsWith(normQuery)) {
        score += 60;
      } else if (entry._normTranslation.includes(normQuery)) {
        score += 35;
      }

      // Check definition
      if (entry._normDefinition.includes(normQuery)) {
        score += 15;
      }

      if (score > 0) {
        scored.push({ entry, score });
      }
    }

    // Sort by relevance score descending, then by Latin alphabetical
    scored.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.entry.latin.localeCompare(b.entry.latin);
    });

    return scored.map(s => s.entry);
  }
}
