import { DataLoader } from './modules/data-loader.js';
import { SearchEngine } from './modules/search-engine.js';
import { UIRenderer } from './modules/ui-renderer.js';

class MedLatinApp {
  constructor() {
    this.searchEngine = new SearchEngine();
    this.currentCategory = 'all';
    this.currentQuery = '';

    // DOM Elements
    this.searchInput = document.getElementById('searchInput');
    this.clearBtn = document.getElementById('clearBtn');
    this.resultsGrid = document.getElementById('resultsGrid');
    this.resultsCount = document.getElementById('resultsCount');
    this.filterButtons = document.querySelectorAll('.filter-btn');
    this.quickTags = document.querySelectorAll('.quick-tag');
  }

  async init() {
    UIRenderer.renderLoading(this.resultsGrid);

    try {
      const allEntries = await DataLoader.loadAll();
      this.searchEngine.init(allEntries);
      
      this.updateCategoryCounts(allEntries);
      this.attachEvents();
      this.performSearch();

      // Register PWA Service Worker for offline support
      this.initServiceWorker();
    } catch (err) {
      console.error('Failed to initialize MedLatinApp:', err);
      this.resultsGrid.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">⚠️</div>
          <h3 class="empty-title">Xatolik yuz berdi</h3>
          <p class="empty-desc">Lug'at ma'lumotlarini yuklashda xatolik yuz berdi. Iltimos, sahifani qayta yuklang.</p>
        </div>
      `;
    }
  }

  updateCategoryCounts(entries) {
    const counts = {
      all: entries.length,
      prescription: entries.filter(e => e.category === 'prescription').length,
      anatomy: entries.filter(e => e.category === 'anatomy' || (e.category && e.category.startsWith('anatomy_'))).length,
      clinical: entries.filter(e => e.category === 'clinical').length,
      general: entries.filter(e => e.category === 'general').length,
      anatomy_organ: entries.filter(e => e.category === 'anatomy_organ').length,
      anatomy_bone: entries.filter(e => e.category === 'anatomy_bone').length,
      anatomy_nerve: entries.filter(e => e.category === 'anatomy_nerve').length,
      anatomy_vessel: entries.filter(e => e.category === 'anatomy_vessel').length,
      anatomy_muscle: entries.filter(e => e.category === 'anatomy_muscle').length,
      anatomy_gland: entries.filter(e => e.category === 'anatomy_gland').length,
      anatomy_joint: entries.filter(e => e.category === 'anatomy_joint').length,
      anatomy_ligament: entries.filter(e => e.category === 'anatomy_ligament').length,
      anatomy_tendon: entries.filter(e => e.category === 'anatomy_tendon').length
    };

    this.filterButtons.forEach(btn => {
      const cat = btn.dataset.category;
      const countEl = btn.querySelector('.filter-count');
      if (countEl && counts[cat] !== undefined) {
        countEl.textContent = counts[cat].toLocaleString();
      }
    });
  }

  attachEvents() {
    // Real-time search
    this.searchInput.addEventListener('input', (e) => {
      this.currentQuery = e.target.value.trim();
      this.toggleClearButton();
      this.performSearch();
    });

    // Clear search
    this.clearBtn.addEventListener('click', () => {
      this.searchInput.value = '';
      this.currentQuery = '';
      this.toggleClearButton();
      this.searchInput.focus();
      this.performSearch();
    });

    // Category filter tabs
    this.filterButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        this.filterButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentCategory = btn.dataset.category;
        this.performSearch();
      });
    });

    // Quick suggestion tags
    this.quickTags.forEach(tag => {
      tag.addEventListener('click', () => {
        const query = tag.dataset.query;
        this.searchInput.value = query;
        this.currentQuery = query;
        this.toggleClearButton();
        this.performSearch();
      });
    });
  }

  toggleClearButton() {
    if (this.currentQuery.length > 0) {
      this.clearBtn.classList.add('visible');
    } else {
      this.clearBtn.classList.remove('visible');
    }
  }

  performSearch() {
    const results = this.searchEngine.search(this.currentQuery, this.currentCategory);
    
    // Update counter
    if (this.resultsCount) {
      this.resultsCount.textContent = `${results.length.toLocaleString()} ta atama topildi`;
    }

    // Render cards with pagination/limit
    UIRenderer.renderCards(this.resultsGrid, results, this.currentQuery, 60);
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

// Bootstrap on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  const app = new MedLatinApp();
  app.init();
});
