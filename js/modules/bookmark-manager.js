/**
 * BookmarkManager - Manages saved/starred terms in localStorage
 */
export class BookmarkManager {
  static STORAGE_KEY = 'medlatin_bookmarks';
  static defaultInstance = null;

  static getInstance() {
    if (!BookmarkManager.defaultInstance) {
      BookmarkManager.defaultInstance = new BookmarkManager();
    }
    return BookmarkManager.defaultInstance;
  }

  static isBookmarked(id) {
    return BookmarkManager.getInstance().isBookmarked(id);
  }

  static add(id) {
    return BookmarkManager.getInstance().add(id);
  }

  static remove(id) {
    return BookmarkManager.getInstance().remove(id);
  }

  static toggle(id) {
    return BookmarkManager.getInstance().toggle(id);
  }

  static getAll() {
    return BookmarkManager.getInstance().getAll();
  }

  static count() {
    return BookmarkManager.getInstance().count();
  }

  constructor(options = {}) {
    this.storage = options.storage || (typeof window !== 'undefined' ? window.localStorage : null);
    this.bookmarks = new Set();
    this.load();
  }

  /**
   * Loads bookmarks from storage
   */
  load() {
    try {
      if (this.storage) {
        const raw = this.storage.getItem(BookmarkManager.STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            this.bookmarks = new Set(parsed);
          }
        }
      }
    } catch (e) {
      console.warn('Could not load bookmarks:', e);
      this.bookmarks = new Set();
    }
  }

  /**
   * Saves current bookmarks to storage
   */
  save() {
    try {
      if (this.storage) {
        this.storage.setItem(BookmarkManager.STORAGE_KEY, JSON.stringify(Array.from(this.bookmarks)));
      }
    } catch (e) {
      console.warn('Could not save bookmarks:', e);
    }
  }

  /**
   * Checks if an ID is bookmarked
   * @param {string} id
   * @returns {boolean}
   */
  isBookmarked(id) {
    return this.bookmarks.has(id);
  }

  /**
   * Adds an ID to bookmarks
   * @param {string} id
   * @returns {boolean} true
   */
  add(id) {
    this.bookmarks.add(id);
    this.save();
    return true;
  }

  /**
   * Removes an ID from bookmarks
   * @param {string} id
   * @returns {boolean} false
   */
  remove(id) {
    this.bookmarks.delete(id);
    this.save();
    return false;
  }

  /**
   * Toggles bookmark state
   * @param {string} id
   * @returns {boolean} true if now bookmarked, false if removed
   */
  toggle(id) {
    if (this.bookmarks.has(id)) {
      this.remove(id);
      return false;
    } else {
      this.add(id);
      return true;
    }
  }

  /**
   * Returns array of all bookmarked IDs
   * @returns {string[]}
   */
  getAll() {
    return Array.from(this.bookmarks);
  }

  /**
   * Total number of bookmarks
   * @returns {number}
   */
  count() {
    return this.bookmarks.size;
  }
}
