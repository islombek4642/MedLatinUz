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
    if (str === null || str === undefined) return '';
    return String(str)
      .toLowerCase()
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Safely highlights matching query parts in text using <mark class="search-highlight">
   * Escapes HTML entities first to prevent XSS.
   * @param {string} text
   * @param {string} query
   * @returns {string} HTML string with highlights
   */
  static highlightMatch(text, query) {
    if (text === null || text === undefined || text === '') return '';
    const escapeHtml = (str) =>
      String(str)
         .replace(/&/g, '&amp;')
         .replace(/</g, '&lt;')
         .replace(/>/g, '&gt;')
         .replace(/"/g, '&quot;')
         .replace(/'/g, '&#039;');

    const escapedText = escapeHtml(text);
    if (!query || typeof query !== 'string') return escapedText;

    const trimmed = query.trim();
    if (!trimmed) return escapedText;

    const escapedQuery = trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    try {
      const regex = new RegExp(`(${escapedQuery})`, 'gi');
      return escapedText.replace(regex, '<mark class="search-highlight">$1</mark>');
    } catch (e) {
      return escapedText;
    }
  }

  /**
   * Initializes the engine with dictionary entries
   * @param {Array} entries
   */
  init(entries) {
    this.entries = entries.map(item => ({
      ...item,
      _normLatin: SearchEngine.normalize(item.latin),
      _normUzbek: SearchEngine.normalize(item.uzbek || item.translation_uz),
      _normEnglish: SearchEngine.normalize(item.english),
      _normDefinition: SearchEngine.normalize(item.definition || item.definition_uz)
    }));

    this.searchId = 0;
    this.pendingResolvers = new Map();

    if (typeof window !== 'undefined' && window.Worker) {
      try {
        this.worker = new Worker('./js/workers/search-worker.js');
        this.worker.postMessage({ type: 'INIT', payload: entries });
        this.worker.onmessage = (e) => {
          const { type, searchId, results } = e.data;
          if (type === 'SEARCH_RESULTS') {
            const resolver = this.pendingResolvers.get(searchId);
            if (resolver) {
              this.pendingResolvers.delete(searchId);
              resolver(results);
            }
          }
        };
      } catch (err) {
        console.warn('Web Worker initialization skipped:', err);
        this.worker = null;
      }
    }
  }

  /**
   * Asynchronous search utilizing background Web Worker
   * @param {string} query
   * @param {string} categoryFilter
   * @returns {Promise<Array>}
   */
  async searchAsync(query = '', categoryFilter = 'all') {
    if (this.worker) {
      const searchId = ++this.searchId;
      return new Promise((resolve) => {
        this.pendingResolvers.set(searchId, resolve);
        this.worker.postMessage({
          type: 'SEARCH',
          payload: { query, categoryFilter, searchId }
        });
      });
    }
    return this.search(query, categoryFilter);
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
    let pool = this.entries;
    if (hasCategory) {
      if (categoryFilter === 'anatomy' || categoryFilter === 'anatomy_group') {
        pool = this.entries.filter(e => e.category === 'anatomy' || (e.category && e.category.startsWith('anatomy_')));
      } else if (categoryFilter === 'latin' || categoryFilter === 'general' || categoryFilter === 'latin_group') {
        pool = this.entries.filter(e => e.category === 'latin' || e.category === 'general' || (e.category && e.category.startsWith('latin_')));
      } else {
        pool = this.entries.filter(e => e.category === categoryFilter);
      }
    }

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
      if (entry._normUzbek === normQuery) {
        score += 85;
      } else if (entry._normUzbek.startsWith(normQuery)) {
        score += 65;
      } else if (entry._normUzbek.includes(normQuery)) {
        score += 35;
      }

      // Check English translation if present
      if (entry._normEnglish) {
        if (entry._normEnglish === normQuery) {
          score += 80;
        } else if (entry._normEnglish.startsWith(normQuery)) {
          score += 55;
        } else if (entry._normEnglish.includes(normQuery)) {
          score += 30;
        }
      }

      // Check definition
      if (entry._normDefinition && entry._normDefinition.includes(normQuery)) {
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
