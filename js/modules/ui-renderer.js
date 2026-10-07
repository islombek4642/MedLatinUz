/**
 * UIRenderer - Handles DOM rendering of search results, empty states, badges, and card interactions
 */
import { SearchEngine } from './search-engine.js';
import { BookmarkManager } from './bookmark-manager.js';
import { SpeechSpeaker } from './speech-speaker.js';

export class UIRenderer {
  static CATEGORY_LABELS = {
    prescription: 'Retsept / Dori',
    anatomy: 'Anatomiya',
    clinical: 'Klinik tashxis',
    latin: 'Lotin tili',
    general: 'Lotin tili'
  };

  /**
   * Sanitizes string for safe HTML injection
   */
  static escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
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
      const speakBtn = e.target.closest('.speak-btn');
      if (speakBtn) {
        const text = speakBtn.getAttribute('data-speak-text');
        if (text) {
          SpeechSpeaker.speak(text, speakBtn);
        }
        return;
      }

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
   * Renders dictionary word cards into the container
   * @param {HTMLElement} container
   * @param {Array} entries
   * @param {string} query
   * @param {Function} onBookmarkChange
   */
  static renderCards(container, entries, query = '', onBookmarkChange = null) {
    this.bindCardActions(container, onBookmarkChange);

    if (!entries || entries.length === 0) {
      this.renderEmpty(container, query);
      return;
    }

    const cardsHtml = entries.map(item => {
      const categoryLabel = this.CATEGORY_LABELS[item.category] || item.category;
      
      let badgeClass = 'category-latin';
      if (item.category === 'prescription') badgeClass = 'category-prescription';
      else if (item.category === 'clinical') badgeClass = 'category-clinical';
      else if (item.category === 'anatomy') badgeClass = 'category-anatomy';

      const isBookmarked = BookmarkManager.isBookmarked(item.id);
      const uzbekText = item.uzbek || item.translation_uz || '';
      const defText = item.definition || item.definition_uz || '';
      const englishText = item.english ? item.english.trim() : '';

      const highlightedLatin = SearchEngine.highlightMatch(item.latin, query);
      const highlightedTranslation = SearchEngine.highlightMatch(uzbekText, query);
      const highlightedDefinition = SearchEngine.highlightMatch(defText, query);
      const highlightedEnglish = englishText ? SearchEngine.highlightMatch(englishText, query) : '';

      const copyPayload = `${item.latin}${englishText ? ` (${englishText})` : ''} - ${uzbekText}: ${defText}`;
      const watermarkHtml = item.category === 'prescription' 
        ? '<span class="prescription-watermark" aria-hidden="true">℞</span>' 
        : '';

      const englishHtml = englishText ? `
        <div class="english-translation" title="Inglizcha nomi">
          <iconify-icon icon="lucide:languages" width="14" height="14" class="en-icon"></iconify-icon>
          <span class="en-label">EN:</span>
          <span class="en-text">${highlightedEnglish}</span>
        </div>
      ` : '';

      return `
        <article class="word-card" data-id="${this.escapeHtml(item.id)}">
          ${watermarkHtml}
          <div class="word-card-meta">
            <span class="category-badge ${badgeClass}" title="${this.escapeHtml(categoryLabel)}">${categoryLabel}</span>
            <div class="card-actions">
              <button 
                type="button" 
                class="card-action-btn speak-btn" 
                data-speak-text="${this.escapeHtml(item.latin)}" 
                title="Talaffuzni tinglash" 
                aria-label="Talaffuzni tinglash"
              >
                <iconify-icon icon="lucide:volume-2"></iconify-icon>
              </button>
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

          <div class="word-card-header">
            <h3 class="latin-term">${highlightedLatin}</h3>
          </div>
          
          <div class="uzbek-translation">
            <iconify-icon icon="lucide:arrow-right" width="18" height="18" class="translation-arrow"></iconify-icon>
            <span class="translation-text">${highlightedTranslation}</span>
          </div>

          ${englishHtml}

          <div class="definition-box">
            ${highlightedDefinition}
          </div>
        </article>
      `;
    }).join('');

    container.innerHTML = cardsHtml;
  }

  /**
   * Renders modern responsive left/right pagination controls
   * @param {HTMLElement} container
   * @param {number} totalItems
   * @param {number} currentPage
   * @param {number} pageSize
   * @param {Function} onPageChange
   */
  static renderPagination(container, totalItems, currentPage, pageSize = 9, onPageChange = null) {
    if (!container) return;
    const totalPages = Math.ceil(totalItems / pageSize);

    if (totalPages <= 1) {
      container.innerHTML = '';
      container.style.display = 'none';
      return;
    }

    container.style.display = 'flex';
    const startItem = (currentPage - 1) * pageSize + 1;
    const endItem = Math.min(currentPage * pageSize, totalItems);

    // Smart numbered pagination buttons
    const pageButtons = [];
    if (totalPages <= 7) {
      for (let p = 1; p <= totalPages; p++) pageButtons.push(p);
    } else {
      pageButtons.push(1);
      if (currentPage > 3) {
        pageButtons.push('...');
      }

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let p = start; p <= end; p++) {
        if (!pageButtons.includes(p)) pageButtons.push(p);
      }

      if (currentPage < totalPages - 2) {
        pageButtons.push('...');
      }
      if (!pageButtons.includes(totalPages)) {
        pageButtons.push(totalPages);
      }
    }

    const desktopNumbersHtml = pageButtons.map(item => {
      if (item === '...') {
        return `<span class="page-ellipsis" aria-hidden="true">…</span>`;
      }
      const isActive = item === currentPage;
      return `
        <button 
          type="button" 
          class="page-btn ${isActive ? 'active' : ''}" 
          data-page="${item}"
          ${isActive ? 'aria-current="page"' : ''}
          title="Sahifa ${item}"
        >
          ${item}
        </button>
      `;
    }).join('');

    container.innerHTML = `
      <div class="pagination-info">
        <span>Sahifa <strong>${currentPage}</strong> / <strong>${totalPages.toLocaleString()}</strong></span>
        <span>(${startItem}–${endItem} / ${totalItems.toLocaleString()} ta atama)</span>
      </div>

      <div class="pagination-controls">
        <button 
          type="button" 
          class="page-btn nav-direction-btn prev-btn" 
          ${currentPage <= 1 ? 'disabled' : ''} 
          data-page="${currentPage - 1}"
          title="Oldingi sahifa"
          aria-label="Oldingi sahifa"
        >
          <iconify-icon icon="lucide:chevron-left"></iconify-icon>
          <span class="btn-label">Oldingi</span>
        </button>

        <div class="page-numbers-desktop" style="display: flex; align-items: center; gap: 0.35rem;">
          ${desktopNumbersHtml}
        </div>

        <div class="page-numbers-mobile">
          <span>${currentPage} / ${totalPages}</span>
        </div>

        <button 
          type="button" 
          class="page-btn nav-direction-btn next-btn" 
          ${currentPage >= totalPages ? 'disabled' : ''} 
          data-page="${currentPage + 1}"
          title="Keyingi sahifa"
          aria-label="Keyingi sahifa"
        >
          <span class="btn-label">Keyingi</span>
          <iconify-icon icon="lucide:chevron-right"></iconify-icon>
        </button>
      </div>
    `;

    // Bind page change events
    container.querySelectorAll('.page-btn[data-page]').forEach(btn => {
      btn.addEventListener('click', () => {
        const targetPage = parseInt(btn.getAttribute('data-page'), 10);
        if (!isNaN(targetPage) && targetPage >= 1 && targetPage <= totalPages && targetPage !== currentPage) {
          if (typeof onPageChange === 'function') {
            onPageChange(targetPage);
          }
        }
      });
    });
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
        <div class="skeleton-meta">
          <div class="skeleton-shimmer skeleton-badge"></div>
          <div class="skeleton-shimmer skeleton-actions"></div>
        </div>
        <div class="skeleton-shimmer skeleton-title"></div>
        <div class="skeleton-shimmer skeleton-translation"></div>
        <div class="skeleton-shimmer skeleton-box"></div>
      </div>
    `).join('');

    container.innerHTML = skeletonHtml;
  }
}
