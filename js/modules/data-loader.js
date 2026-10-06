/**
 * DataLoader - Loads modular medical dictionary JSON files
 */
export class DataLoader {
  static DATA_FILES = [
    './data/prescriptions.json',
    './data/anatomy.json',
    './data/clinical.json',
    './data/general.json'
  ];

  /**
   * Loads all JSON data files in parallel and merges into a single array
   * @returns {Promise<Array>}
   */
  static async loadAll() {
    try {
      const fetchPromises = DataLoader.DATA_FILES.map(async file => {
        const response = await fetch(file);
        if (!response.ok) {
          throw new Error(`Failed to load ${file}: HTTP ${response.status}`);
        }
        return await response.json();
      });

      const results = await Promise.all(fetchPromises);
      return results.flat();
    } catch (err) {
      console.error('DataLoader error:', err);
      throw err;
    }
  }
}
