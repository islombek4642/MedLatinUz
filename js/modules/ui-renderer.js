/**
 * UIRenderer - Handles DOM rendering of search results, empty states, badges, and card interactions
 */
import { SearchEngine } from './search-engine.js';
import { BookmarkManager } from './bookmark-manager.js';

export class UIRenderer {
  static CATEGORY_LABELS = {
    prescription: 'Retsept / Dori',
    anatomy: 'Asosiy anatomiya',
    anatomy_system: 'Tana tizimi (System)',
    anatomy_region: 'Tana sohasi (Region)',
    anatomy_glossary: 'Anatomik termin (Glossary)',
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
   * Displays temporary toast notification
   * @param {string} message
   */
  static showToast(message = 'Nusxalandi!') {
    let container = document.getElementById('toastContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toastContainer';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
      <iconify-icon icon="lucide:check-circle"></iconify-icon>
      <span>${this.escapeHtml(message)}</span>
    `;
    container.appendChild(toast);

    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 2600);
  }

  /**
   * Binds click delegation for card actions (copy, bookmark) on the results container
   * @param {HTMLElement} container
   * @param {Function} onBookmarkChange
   */
  static bindCardActions(container, onBookmarkChange) {
    if (container._actionsBound) return;
    container._actionsBound = true;

    container.addEventListener('click', (e) => {
      const copyBtn = e.target.closest('.copy-btn');
      if (copyBtn) {
        const text = copyBtn.getAttribute('data-copy-text');
        if (text) {
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text)
              .then(() => UIRenderer.showToast('Nusxa olindi!'))
              .catch(() => UIRenderer.showToast('Nusxalandi!'));
          } else {
            // Fallback for non-https/insecure context
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            UIRenderer.showToast('Nusxa olindi!');
          }
        }
        return;
      }

      const starBtn = e.target.closest('.star-btn');
      if (starBtn) {
        const id = starBtn.getAttribute('data-id');
        if (id) {
          const isBookmarked = BookmarkManager.toggle(id);
          starBtn.classList.toggle('bookmarked', isBookmarked);
          const icon = starBtn.querySelector('iconify-icon');
          if (icon) {
            icon.setAttribute('icon', isBookmarked ? 'solar:star-bold' : 'solar:star-linear');
          }
          starBtn.setAttribute('title', isBookmarked ? 'Tanlanganlardan olib tashlash' : 'Tanlanganlarga saqlash');
          UIRenderer.showToast(isBookmarked ? "Tanlanganlarga saqlandi ⭐" : "Tanlanganlardan olib tashlandi");

          if (typeof onBookmarkChange === 'function') {
            onBookmarkChange(id, isBookmarked);
          }
        }
        return;
      }
    });
  }

  /**
   * Renders dictionary word cards into the container with pagination/slice
   * @param {HTMLElement} container
   * @param {Array} entries
   * @param {string} query
   * @param {number} limit
   * @param {Function} onBookmarkChange
   */
  static renderCards(container, entries, query = '', limit = 60, onBookmarkChange = null) {
    this.bindCardActions(container, onBookmarkChange);

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

      const isBookmarked = BookmarkManager.isBookmarked(item.id);
      const highlightedLatin = SearchEngine.highlightMatch(item.latin, query);
      const highlightedTranslation = SearchEngine.highlightMatch(item.translation_uz, query);
      const highlightedDefinition = SearchEngine.highlightMatch(item.definition_uz, query);

      const copyPayload = `${item.latin} - ${item.translation_uz}: ${item.definition_uz}`;
      const watermarkHtml = item.category === 'prescription' 
        ? '<span class="prescription-watermark" aria-hidden="true">℞</span>' 
        : '';

      return `
        <article class="word-card" data-id="${this.escapeHtml(item.id)}">
          ${watermarkHtml}
          <div class="word-card-header">
            <h3 class="latin-term">${highlightedLatin}</h3>
            <div class="card-actions">
              <span class="category-badge ${badgeClass}">${categoryLabel}</span>
              <button 
                type="button" 
                class="card-action-btn star-btn ${isBookmarked ? 'bookmarked' : ''}" 
                data-id="${this.escapeHtml(item.id)}" 
                title="${isBookmarked ? 'Tanlanganlardan olib tashlash' : 'Tanlanganlarga saqlash'}" 
                aria-label="Saqlash"
              >
                <iconify-icon icon="${isBookmarked ? 'solar:star-bold' : 'solar:star-linear'}"></iconify-icon>
              </button>
              <button 
                type="button" 
                class="card-action-btn copy-btn" 
                data-copy-text="${this.escapeHtml(copyPayload)}" 
                title="Nusxa olish" 
                aria-label="Nusxa olish"
              >
                <iconify-icon icon="lucide:copy"></iconify-icon>
              </button>
            </div>
          </div>
          
          <div class="uzbek-translation">
            <iconify-icon icon="lucide:arrow-right" width="18" height="18"></iconify-icon>
            <span>${highlightedTranslation}</span>
          </div>

          <div class="definition-box">
            ${highlightedDefinition}
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
          this.renderCards(container, entries, query, limit + 60, onBookmarkChange);
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
        <div class="empty-icon">
          <iconify-icon icon="lucide:search-x" width="48" height="48" style="color: var(--text-muted);"></iconify-icon>
        </div>
        <h3 class="empty-title">Hech qanday atama topilmadi</h3>
        <p class="empty-desc">
          ${query ? `<strong>"${this.escapeHtml(query)}"</strong> bo'yicha ma'lumot topilmadi.` : ''}
          Iltimos, so'zning yozilishini tekshiring yoki umumiyroq so'z (masalan: <em>Rp</em>, <em>systema</em>, <em>biceps</em>, <em>femur</em>) bilan qidirib ko'ring.
        </p>
      </div>
    `;
  }

  /**
   * Renders skeleton shimmer cards during initial data load
   * @param {HTMLElement} container
   */
  static renderLoading(container) {
    const skeletonHtml = Array.from({ length: 8 }).map(() => `
      <div class="skeleton-card" aria-hidden="true">
        <div class="skeleton-header">
          <div class="skeleton-shimmer skeleton-title"></div>
          <div class="skeleton-shimmer skeleton-badge"></div>
        </div>
        <div class="skeleton-shimmer skeleton-translation"></div>
        <div class="skeleton-shimmer skeleton-box"></div>
      </div>
    `).join('');

    container.innerHTML = skeletonHtml;
  }
}
