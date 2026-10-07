/**
 * DataLoader - Loads medical Latin dictionary entries via IndexedDB cache with fallback
 * Strategy:
 * 1. Check IndexedDB (instant 0ms offline load if cached)
 * 2. Fetch unified './data/dictionary.json' (single HTTP request)
 * 3. Cache to IndexedDB in background
 * 4. Fallback to individual files if needed
 */
import { DBStorage } from './db-storage.js';

export class DataLoader {
  static UNIFIED_FILE = './data/dictionary.json';

  /**
   * Loads dictionary entries using Cache-First (IndexedDB) -> Unified JSON -> Fallback
   * @param {Function} onProgress - Optional callback (percent, text)
   * @returns {Promise<Array>}
   */
  static async loadAll(onProgress = null) {
    const notify = (p, text) => {
      if (typeof onProgress === 'function') onProgress(p, text);
    };

    // 1. Try IndexedDB cache first (instant local disk access)
    try {
      const cached = await DBStorage.getAll();
      if (cached && cached.length >= 20000) {
        console.log(`Loaded ${cached.length.toLocaleString()} entries instantly from IndexedDB.`);
        notify(100, "Xotiradan o'qildi!");
        return cached;
      }
    } catch (e) {
      console.warn('IndexedDB read skipped:', e);
    }

    notify(30, "Lug'at ma'lumotlari o'qilmoqda...");

    // 2. Instant in-memory bundle (works offline, under file://, 0ms, zero network)
    if (typeof window !== 'undefined' && window.__MEDLATIN_DATA__ && window.__MEDLATIN_DATA__.length >= 20000) {
      console.log(`Loaded ${window.__MEDLATIN_DATA__.length.toLocaleString()} entries from in-memory preloaded bundle.`);
      notify(60, "Oflayn xotiraga saqlanmoqda...");
      await DBStorage.saveAll(window.__MEDLATIN_DATA__);
      notify(80, "Keshga muvaffaqiyatli saqlandi!");
      return window.__MEDLATIN_DATA__;
    }

    // 3. Fetch unified dictionary.json (single network request)
    try {
      notify(40, "Yagona dictionary.json yuklanmoqda...");
      const res = await fetch(this.UNIFIED_FILE);
      if (res.ok) {
        notify(65, "Atamalar qabul qilinmoqda...");
        const entries = await res.json();
        console.log(`Loaded ${entries.length.toLocaleString()} entries from unified dictionary.json.`);
        
        notify(80, "Oflayn xotiraga yozilmoqda...");
        await DBStorage.saveAll(entries);
        notify(90, "Keshlandi!");
        return entries;
      }
    } catch (unifiedErr) {
      console.warn('Failed to fetch unified dictionary.json:', unifiedErr);
    }

    // 4. Fallback: If network fetch failed, check if window.__MEDLATIN_DATA__ is available
    if (typeof window !== 'undefined' && window.__MEDLATIN_DATA__ && window.__MEDLATIN_DATA__.length >= 20000) {
      notify(80, "Zaxira to'plamdan yuklandi!");
      return window.__MEDLATIN_DATA__;
    }

    throw new Error("Lug'at ma'lumotlarini yuklab bo'lmadi. Iltimos, internet aloqasini tekshiring.");
  }
}
