/**
 * UIRenderer - Handles DOM rendering of search results, empty states, and badges
 */
export class UIRenderer {
  static CATEGORY_LABELS = {
    prescription: 'Retsept / Dori',
    anatomy: 'Anatomiya',
    clinical: 'Klinik tashxis',
    general: 'Umumiy lotincha'
  };

  /**
   * Sanitizes string for safe HTML injection
   */
  static escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /**
   * Renders dictionary word cards into the container
   * @param {HTMLElement} container
   * @param {Array} entries
   * @param {string} query
   */
  static renderCards(container, entries, query = '') {
    if (!entries || entries.length === 0) {
      this.renderEmpty(container, query);
      return;
    }

    const html = entries.map(item => {
      const categoryLabel = this.CATEGORY_LABELS[item.category] || item.category;
      const categoryClass = `category-${item.category}`;

      return `
        <article class="word-card" data-id="${this.escapeHtml(item.id)}">
          <div class="word-card-header">
            <h3 class="latin-term">${this.escapeHtml(item.latin)}</h3>
            <span class="category-badge ${categoryClass}">${categoryLabel}</span>
          </div>
          
          <div class="uzbek-translation">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
            <span>${this.escapeHtml(item.translation_uz)}</span>
          </div>

          <div class="definition-box">
            ${this.escapeHtml(item.definition_uz)}
          </div>
        </article>
      `;
    }).join('');

    container.innerHTML = html;
  }

  /**
   * Renders the empty state when no terms match
   * @param {HTMLElement} container
   * @param {string} query
   */
  static renderEmpty(container, query = '') {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🔍</div>
        <h3 class="empty-title">Hech qanday atama topilmadi</h3>
        <p class="empty-desc">
          ${query ? `<strong>"${this.escapeHtml(query)}"</strong> bo'yicha ma'lumot topilmadi.` : ''}
          Iltimos, so'zning yozilishini tekshiring yoki umumiyroq so'z (masalan: <em>Rp</em>, <em>sol</em>, <em>yurak</em>) bilan qidirib ko'ring.
        </p>
      </div>
    `;
  }

  /**
   * Renders loading spinner
   * @param {HTMLElement} container
   */
  static renderLoading(container) {
    container.innerHTML = `
      <div class="loading-state">
        <div class="spinner"></div>
        <p>Tibbiy lug'at yuklanmoqda...</p>
      </div>
    `;
  }
}
