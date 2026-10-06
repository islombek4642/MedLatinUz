/**
 * DataLoader - Loads modular medical and Latin dictionary JSON files
 */
export class DataLoader {
  static DATA_FILES = [
    // 12 Human body systems (Priority: shown at top of all categories)
    './data/anatomy_systems.json',

    // Curated core medical sets
    './data/prescriptions.json',
    './data/anatomy.json',
    './data/clinical.json',
    './data/general.json',

    // Anatomical structure categories
    './data/anatomy_organs.json',
    './data/anatomy_bones.json',
    './data/anatomy_nerves.json',
    './data/anatomy_vessels.json',
    './data/anatomy_muscles.json',
    './data/anatomy_glands.json',
    './data/anatomy_joints.json',
    './data/anatomy_ligaments.json',
    './data/anatomy_tendons.json',

    // Latin POS categories
    './data/latin_nouns.json',
    './data/latin_adjectives.json',
    './data/latin_verbs.json',
    './data/latin_adverbs.json',
    './data/latin_prepositions.json',
    './data/latin_conjunctions.json',
    './data/latin_interjections.json'
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
