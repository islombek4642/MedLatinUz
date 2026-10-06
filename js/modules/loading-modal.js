/**
 * LoadingModal - Manages the dictionary setup modal with animated progress bar.
 * Connects directly to the pre-rendered #loadingModal in index.html for instant 0ms appearance.
 */
export class LoadingModal {
  static async isReady() { return false; }
  static isFirstVisit() { return true; }
  static markCompleted() {}

  constructor() {
    this.modalEl = typeof document !== 'undefined' ? document.getElementById('loadingModal') : null;
    this.progressBarEl = typeof document !== 'undefined' ? document.getElementById('modalProgressBar') : null;
    this.statusTextEl = typeof document !== 'undefined' ? document.getElementById('modalStatusText') : null;
    this.percentTextEl = typeof document !== 'undefined' ? document.getElementById('modalPercentText') : null;
  }

  /**
   * Shows the loading modal
   */
  show() {
    if (!this.modalEl && typeof document !== 'undefined') {
      this.modalEl = document.getElementById('loadingModal');
    }
    if (this.modalEl) {
      this.modalEl.style.display = 'flex';
      this.modalEl.classList.remove('fade-out');
    }
  }

  /**
   * Updates the progress bar and status text
   * @param {number} percent - 0 to 100
   * @param {string} statusText
   */
  setProgress(percent, statusText) {
    if (!this.modalEl && typeof document !== 'undefined') {
      this.modalEl = document.getElementById('loadingModal');
      this.progressBarEl = document.getElementById('modalProgressBar');
      this.statusTextEl = document.getElementById('modalStatusText');
      this.percentTextEl = document.getElementById('modalPercentText');
    }

    const clamped = Math.min(100, Math.max(0, percent));
    if (this.progressBarEl) {
      this.progressBarEl.style.width = `${clamped}%`;
    }
    if (this.percentTextEl) {
      this.percentTextEl.textContent = `${Math.round(clamped)}%`;
    }
    if (statusText && this.statusTextEl) {
      const isComplete = clamped >= 100;
      const icon = isComplete 
        ? '<iconify-icon icon="lucide:check-circle" style="color: var(--accent-emerald);"></iconify-icon>' 
        : '<iconify-icon icon="lucide:loader-2" style="animation: spin 1s linear infinite;"></iconify-icon>';
      this.statusTextEl.innerHTML = `${icon} <span>${statusText}</span>`;
    }
  }

  /**
   * Smoothly fades out and hides the modal
   */
  hide() {
    if (!this.modalEl && typeof document !== 'undefined') {
      this.modalEl = document.getElementById('loadingModal');
    }
    if (!this.modalEl) return;

    this.setProgress(100, 'Tayyor!');
    setTimeout(() => {
      if (this.modalEl) {
        this.modalEl.classList.add('fade-out');
        setTimeout(() => {
          if (this.modalEl) {
            this.modalEl.style.display = 'none';
          }
        }, 450);
      }
    }, 400);
  }
}
