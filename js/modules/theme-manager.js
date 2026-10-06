/**
 * ThemeManager - Manages Dark and Light theme states with persistence
 */
export class ThemeManager {
  static STORAGE_KEY = 'medlatin_theme';
  static defaultInstance = null;

  static getInstance() {
    if (!ThemeManager.defaultInstance) {
      ThemeManager.defaultInstance = new ThemeManager();
    }
    return ThemeManager.defaultInstance;
  }

  static init() {
    return ThemeManager.getInstance().init();
  }

  static toggle() {
    return ThemeManager.getInstance().toggleTheme();
  }

  static getTheme() {
    return ThemeManager.getInstance().getTheme();
  }

  static setTheme(theme) {
    return ThemeManager.getInstance().setTheme(theme);
  }

  constructor(options = {}) {
    this.storage = options.storage || (typeof window !== 'undefined' ? window.localStorage : null);
    this.root = options.rootElement || (typeof document !== 'undefined' ? document.documentElement : null);
    this.systemPrefersDark = options.systemPrefersDark !== undefined
      ? options.systemPrefersDark
      : (typeof window !== 'undefined' && window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)').matches : false);
    
    this.currentTheme = 'light';
  }

  /**
   * Initializes theme from storage or system preferences
   */
  init() {
    let savedTheme = null;
    try {
      if (this.storage) {
        savedTheme = this.storage.getItem(ThemeManager.STORAGE_KEY);
      }
    } catch (e) {
      console.warn('Could not read theme from storage:', e);
    }

    if (savedTheme === 'dark' || savedTheme === 'light') {
      this.currentTheme = savedTheme;
    } else {
      this.currentTheme = this.systemPrefersDark ? 'dark' : 'light';
    }

    this.applyTheme(this.currentTheme);
    return this.currentTheme;
  }

  /**
   * Applies the theme attribute to the root HTML element
   * @param {string} theme 'dark' | 'light'
   */
  applyTheme(theme) {
    if (this.root && this.root.setAttribute) {
      this.root.setAttribute('data-theme', theme);
    }
  }

  /**
   * Sets explicit theme and persists to storage
   * @param {string} theme 'dark' | 'light'
   */
  setTheme(theme) {
    if (theme !== 'dark' && theme !== 'light') return;
    this.currentTheme = theme;
    this.applyTheme(theme);

    try {
      if (this.storage) {
        this.storage.setItem(ThemeManager.STORAGE_KEY, theme);
      }
    } catch (e) {
      console.warn('Could not save theme to storage:', e);
    }
  }

  /**
   * Toggles between dark and light themes
   * @returns {string} New theme
   */
  toggleTheme() {
    const nextTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
    this.setTheme(nextTheme);
    return nextTheme;
  }

  /**
   * Gets currently active theme
   * @returns {string}
   */
  getTheme() {
    return this.currentTheme;
  }
}
