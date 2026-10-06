/**
 * UIRenderer - Handles DOM rendering of search results, empty states, and badges
 */
export class UIRenderer {
  static CATEGORY_LABELS = {
    prescription: 'Retsept / Dori',
    anatomy: 'Asosiy anatomiya',
    anatomy_system: 'Tana tizimi (System)',
    clinical: 'Klinik tashxis',
    general: 'Umumiy lotincha',
    anatomy_organ: "A'zo (Organ)",
    anatomy_bone: 'Suyak (Bone)',
    anatomy_nerve: 'Nerv (Nerve)',
    anatomy_vessel: 'Qon tomiri (Vessel)',
    anatomy_muscle: 'Mushak (Muscle)',
    anatomy_gland: 'Bez (Gland)',
    anatomy_joint: "Bo'g'im (Joint)",
    anatomy_ligament: 'Boylam (Ligament)',
    anatomy_tendon: 'Pay (Tendon)',
    latin_noun: 'Ot (Noun)',
    latin_adjective: 'Sifat (Adj)',
    latin_verb: "Fe'l (Verb)",
    latin_adverb: 'Ravish (Adv)',
    latin_preposition: "Old qo'shimcha (Prep)",
    latin_conjunction: "Bog'lovchi (Conj)",
    latin_interjection: 'Undov (Interj)'
  };

  /**
   * Sanitizes string for safe HTML injection
   */
  static escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&amp;/g, '&')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /**
   * Renders dictionary word cards into the container with pagination/slice
   * @param {HTMLElement} container
   * @param {Array} entries
   * @param {string} query
   * @param {number} limit
   */
  static renderCards(container, entries, query = '', limit = 60) {
    if (!entries || entries.length === 0) {
      this.renderEmpty(container, query);
      return;
    }

    const visibleEntries = entries.slice(0, limit);
    const hasMore = entries.length > limit;

    const cardsHtml = visibleEntries.map(item => {
      const categoryLabel = this.CATEGORY_LABELS[item.category] || item.type_uz || item.pos_uz || item.category;
      
      let badgeClass = 'category-general';
      if (item.category === 'prescription') badgeClass = 'category-prescription';
      else if (item.category === 'clinical') badgeClass = 'category-clinical';
      else if (item.category === 'anatomy_system') badgeClass = 'category-system';
      else if (item.category && item.category.startsWith('anatomy')) badgeClass = 'category-anatomy';

      return `
        <article class="word-card" data-id="${this.escapeHtml(item.id)}">
          <div class="word-card-header">
            <h3 class="latin-term">${this.escapeHtml(item.latin)}</h3>
            <span class="category-badge ${badgeClass}">${categoryLabel}</span>
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

    const moreHtml = hasMore ? `
      <div class="load-more-container" style="grid-column: 1 / -1; text-align: center; margin-top: 1.5rem;">
        <p style="color: var(--text-muted); margin-bottom: 0.75rem; font-size: 0.9rem;">
          Jami ${entries.length.toLocaleString()} ta natijadan dastlabki ${limit} tasi ko'rsatilmoqda.
        </p>
        <button type="button" id="loadMoreBtn" class="filter-btn active" style="padding: 0.65rem 1.75rem; font-size: 0.95rem;">
          Yana 60 tasini ko'rsatish
        </button>
      </div>
    ` : '';

    container.innerHTML = cardsHtml + moreHtml;

    if (hasMore) {
      const loadMoreBtn = document.getElementById('loadMoreBtn');
      if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', () => {
          this.renderCards(container, entries, query, limit + 60);
        });
      }
    }
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
          Iltimos, so'zning yozilishini tekshiring yoki umumiyroq so'z (masalan: <em>Rp</em>, <em>systema</em>, <em>biceps</em>, <em>femur</em>) bilan qidirib ko'ring.
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
        <p>20 700+ dan ortiq tibbiy, anatomik va lotincha atamalar yuklanmoqda...</p>
      </div>
    `;
  }
}
