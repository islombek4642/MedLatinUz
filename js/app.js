import { DataLoader } from './modules/data-loader.js';
import { SearchEngine } from './modules/search-engine.js';
import { UIRenderer } from './modules/ui-renderer.js';
import { ThemeManager } from './modules/theme-manager.js';
import { BookmarkManager } from './modules/bookmark-manager.js';
import { LoadingModal } from './modules/loading-modal.js';

class MedLatinApp {
  constructor() {
    this.searchEngine = new SearchEngine();
    this.themeManager = new ThemeManager();
    this.allEntries = [];
    this.currentCategory = 'all';
    this.currentSubCategory = null;
    this.currentQuery = '';

    // DOM Elements
    this.searchInput = document.getElementById('searchInput');
    this.clearBtn = document.getElementById('clearBtn');
    this.resultsGrid = document.getElementById('resultsGrid');
    this.resultsCount = document.getElementById('resultsCount');
    this.filterButtons = document.querySelectorAll('.filter-btn');
    this.subFiltersContainer = document.getElementById('subFiltersContainer');
    this.themeToggleBtn = document.getElementById('themeToggleBtn');
    this.discoveryChips = document.querySelectorAll('.discovery-chip');

    // Sub-filters configuration
    this.subCategoryDefs = {
      anatomy_group: [
        { id: 'anatomy', label: 'Barchasi' },
        { id: 'anatomy_system', label: 'Tizimlar' },
        { id: 'anatomy_region', label: 'Sohalar' },
        { id: 'anatomy_muscle', label: 'Mushaklar' },
        { id: 'anatomy_bone', label: 'Suyaklar' },
        { id: 'anatomy_vessel', label: 'Qon tomirlari' },
        { id: 'anatomy_nerve', label: 'Nervlar' },
        { id: 'anatomy_organ', label: "A'zolar" },
        { id: 'anatomy_gland', label: 'Bezlar' },
        { id: 'anatomy_joint', label: "Bo'g'imlar" },
        { id: 'anatomy_glossary', label: 'Atamalar' }
      ],
      latin_group: [
        { id: 'general', label: 'Barchasi' },
        { id: 'latin_noun', label: 'Otlar' },
        { id: 'latin_adjective', label: 'Sifatlar' },
        { id: 'latin_verb', label: "Fe'llar" },
        { id: 'latin_adverb', label: 'Ravishlar' }
      ]
    };
  }

  async init() {
    // 1. Initialize Theme
    this.themeManager.init();

    // 2. Display loading modal with progress bar
    const modal = new LoadingModal();
    modal.show();
    modal.setProgress(15, "Lug'at bazasi tekshirilmoqda...");

    // Also mount skeleton shimmer cards in the results container
    UIRenderer.renderLoading(this.resultsGrid);

    try {
      this.allEntries = await DataLoader.loadAll((percent, text) => {
        modal.setProgress(percent, text);
      });

      modal.setProgress(85, "Qidiruv indekslari o'rnatilmoqda...");
      this.searchEngine.init(this.allEntries);
      
      this.updateCategoryCounts();
      this.attachEvents();

      modal.setProgress(95, "Interfeys tayyorlanmoqda...");
      await this.performSearch();

      modal.setProgress(100, "Tayyor!");
      LoadingModal.markCompleted();
      modal.hide();

      // PWA & Network Status
      this.initNetworkStatus();
      this.initServiceWorker();
    } catch (err) {
      modal.hide();
      console.error('Failed to initialize MedLatinApp:', err);
      this.resultsGrid.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">
            <iconify-icon icon="lucide:alert-triangle" width="48" height="48" style="color: var(--accent-rose);"></iconify-icon>
          </div>
          <h3 class="empty-title">Xatolik yuz berdi</h3>
          <p class="empty-desc">Lug'at ma'lumotlarini yuklashda xatolik yuz berdi. Iltimos, sahifani qayta yuklang.</p>
        </div>
      `;
    }
  }

  updateCategoryCounts() {
    const entries = this.allEntries;
    let prescription = 0;
    let anatomy_group = 0;
    let clinical = 0;
    let latin_group = 0;

    for (let i = 0; i < entries.length; i++) {
      const cat = entries[i].category;
      if (cat === 'prescription') prescription++;
      else if (cat === 'clinical') clinical++;
      else if (cat && cat.startsWith('anatomy')) anatomy_group++;
      else if (cat && (cat.startsWith('latin') || cat === 'general')) latin_group++;
    }

    const bookmarkCount = BookmarkManager.getAll().length;

    const counts = {
      all: entries.length,
      prescription,
      anatomy_group,
      clinical,
      latin_group,
      bookmarks: bookmarkCount
    };

    this.filterButtons.forEach(btn => {
      const cat = btn.dataset.category;
      const countEl = btn.querySelector('.filter-count');
      if (countEl && counts[cat] !== undefined) {
        countEl.textContent = counts[cat].toLocaleString();
      }
    });

    const totalBadge = document.getElementById('totalTermsBadge');
    if (totalBadge) {
      totalBadge.textContent = `${entries.length.toLocaleString()}+ atama`;
    }
  }

  renderSubFilters(groupKey) {
    if (!this.subFiltersContainer) return;

    const items = this.subCategoryDefs[groupKey];
    if (!items) {
      this.subFiltersContainer.style.display = 'none';
      this.subFiltersContainer.innerHTML = '';
      this.currentSubCategory = null;
      return;
    }

    if (!this.currentSubCategory) {
      this.currentSubCategory = items[0].id;
    }

    const html = items.map(sub => {
      const isActive = this.currentSubCategory === sub.id;
      return `
        <button type="button" class="sub-chip ${isActive ? 'active' : ''}" data-subcategory="${sub.id}">
          <span>${sub.label}</span>
        </button>
      `;
    }).join('');

    this.subFiltersContainer.innerHTML = html;
    this.subFiltersContainer.style.display = 'flex';

    // Sub-chip click listener
    this.subFiltersContainer.querySelectorAll('.sub-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        this.subFiltersContainer.querySelectorAll('.sub-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        this.currentSubCategory = chip.dataset.subcategory;
        this.performSearch();
      });
    });
  }

  attachEvents() {
    // 1. Theme toggle button
    if (this.themeToggleBtn) {
      this.themeToggleBtn.addEventListener('click', () => {
        this.themeManager.toggleTheme();
      });
    }

    // 2. Real-time search with 100ms debounce
    let debounceTimer = null;
    this.searchInput.addEventListener('input', (e) => {
      this.currentQuery = e.target.value.trim();
      this.toggleClearButton();
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        this.performSearch();
      }, 100);
    });

    // 3. Clear search button (instant, cancels debounce)
    this.clearBtn.addEventListener('click', () => {
      clearTimeout(debounceTimer);
      this.searchInput.value = '';
      this.currentQuery = '';
      this.toggleClearButton();
      this.searchInput.focus();
      this.performSearch();
    });

    // 4. Discovery chips
    this.discoveryChips.forEach(chip => {
      chip.addEventListener('click', () => {
        const query = chip.dataset.query;
        if (query) {
          this.searchInput.value = query;
          this.currentQuery = query;
          this.toggleClearButton();
          this.searchInput.focus();
          this.performSearch();
        }
      });
    });

    // 5. Main Category filter buttons
    this.filterButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        this.filterButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const cat = btn.dataset.category;
        this.currentCategory = cat;

        if (cat === 'anatomy_group' || cat === 'latin_group') {
          this.currentSubCategory = null;
          this.renderSubFilters(cat);
        } else {
          if (this.subFiltersContainer) {
            this.subFiltersContainer.style.display = 'none';
            this.subFiltersContainer.innerHTML = '';
          }
          this.currentSubCategory = null;
        }

        this.performSearch();
      });
    });

    // 6. Keyboard Shortcuts: Ctrl+K or '/' to focus search, Esc to blur
    window.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        this.searchInput.focus();
        this.searchInput.select();
      } else if (e.key === '/' && document.activeElement !== this.searchInput && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
        e.preventDefault();
        this.searchInput.focus();
        this.searchInput.select();
      } else if (e.key === 'Escape' && document.activeElement === this.searchInput) {
        if (this.searchInput.value) {
          this.searchInput.value = '';
          this.currentQuery = '';
          this.toggleClearButton();
          this.performSearch();
        }
        this.searchInput.blur();
      }
    });
  }

  toggleClearButton() {
    if (this.currentQuery.length > 0) {
      this.clearBtn.classList.add('visible');
    } else {
      this.clearBtn.classList.remove('visible');
    }
  }

  async performSearch() {
    let effectiveCategory = this.currentSubCategory || this.currentCategory;
    let results = [];

    if (this.currentCategory === 'bookmarks') {
      const bookmarkedIds = new Set(BookmarkManager.getAll());
      const bookmarkedEntries = this.allEntries.filter(e => bookmarkedIds.has(e.id));
      if (this.currentQuery) {
        const queryNorm = SearchEngine.normalize(this.currentQuery);
        results = bookmarkedEntries.filter(e => {
          return SearchEngine.normalize(e.latin).includes(queryNorm) ||
                 SearchEngine.normalize(e.translation_uz).includes(queryNorm) ||
                 SearchEngine.normalize(e.definition_uz).includes(queryNorm);
        });
      } else {
        results = bookmarkedEntries;
      }
    } else {
      results = await this.searchEngine.searchAsync(this.currentQuery, effectiveCategory);
    }
    
    // Update counter
    if (this.resultsCount) {
      this.resultsCount.classList.remove('loading');
      const label = this.currentCategory === 'bookmarks' ? 'saqlangan atama' : 'atama topildi';
      this.resultsCount.innerHTML = `
        <iconify-icon icon="lucide:layers"></iconify-icon>
        <span>${results.length.toLocaleString()} ta ${label}</span>
      `;
    }

    // Render cards with bookmark change callback
    UIRenderer.renderCards(this.resultsGrid, results, this.currentQuery, 60, (id, isBookmarked) => {
      this.updateCategoryCounts();
      if (this.currentCategory === 'bookmarks') {
        this.performSearch();
      }
    });
  }

  initNetworkStatus() {
    const updateStatus = () => {
      const isOnline = navigator.onLine;
      const badge = document.getElementById('totalTermsBadge');
      if (badge) {
        if (isOnline) {
          badge.textContent = `${this.allEntries.length.toLocaleString()}+ atama`;
        } else {
          badge.textContent = `Offlayn (Keshda)`;
        }
      }
    };

    window.addEventListener('online', updateStatus);
    window.addEventListener('offline', updateStatus);
  }

  async initServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('./sw.js');
        console.log('MedLatin ServiceWorker registered:', registration.scope);
      } catch (err) {
        console.warn('ServiceWorker registration skipped:', err);
      }
    }
  }
}

// Bootstrap: runs immediately if DOM is already ready, or waits for DOMContentLoaded
function bootstrap() {
  console.log('[MedLatin] Bootstrapping application...');
  const app = new MedLatinApp();
  app.init().catch(err => {
    console.error('[MedLatin] Initialization error:', err);
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap);
} else {
  bootstrap();
}
