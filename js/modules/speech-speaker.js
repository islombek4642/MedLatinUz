/**
 * SpeechSpeaker - Free, offline-capable Text-to-Speech for medical Latin terms
 * Uses browser's native Web Speech API with Latin/Italian phonetic cadence.
 */
export class SpeechSpeaker {
  static currentButton = null;

  /**
   * Prepares and cleans Latin text for accurate phonetic articulation
   * Expands common prescription abbreviations (Rp. -> Recipe) for speech
   * @param {string} text
   * @returns {string}
   */
  static cleanLatin(text) {
    if (!text) return '';
    return text
      .replace(/\bRp\.\b/gi, 'Recipe')
      .replace(/\bD\.t\.d\.N\.\b/gi, 'Da tales doses numero')
      .replace(/\bS\.\b/gi, 'Signa')
      .replace(/\bM\.f\.\b/gi, 'Misce fiat')
      .replace(/\bsol\.\b/gi, 'solutio')
      .replace(/\btab\.\b/gi, 'tabulettis')
      .replace(/\bper os\b/gi, 'per os')
      .replace(/[()[\]{}]/g, '')
      .replace(/[,;]/g, ', ')
      .trim();
  }

  /**
   * Selects the best available voice in the user's browser:
   * 1. Latin ('la' or 'lat')
   * 2. Italian ('it-IT') - highest acoustic accuracy for classical and medical Latin
   * 3. Spanish ('es-ES')
   * 4. System default
   */
  static getBestVoice() {
    if (typeof window === 'undefined' || !window.speechSynthesis) return null;
    const voices = window.speechSynthesis.getVoices() || [];
    if (!voices.length) return null;

    return (
      voices.find(v => v.lang && (v.lang.toLowerCase().startsWith('la') || v.lang.toLowerCase().includes('lat'))) ||
      voices.find(v => v.lang && v.lang.toLowerCase().startsWith('it')) ||
      voices.find(v => v.lang && v.lang.toLowerCase().startsWith('es')) ||
      voices.find(v => v.default) ||
      voices[0]
    );
  }

  /**
   * Pronounces the Latin term out loud
   * @param {string} text
   * @param {HTMLElement|null} triggerBtn
   * @returns {boolean}
   */
  static speak(text, triggerBtn = null) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      console.warn('SpeechSynthesis is not supported in this browser.');
      return false;
    }

    // Toggle: if currently speaking on the same button, cancel and stop
    if (this.currentButton === triggerBtn && triggerBtn && triggerBtn.classList.contains('speaking')) {
      window.speechSynthesis.cancel();
      this.resetButton(triggerBtn);
      this.currentButton = null;
      return true;
    }

    // Cancel any ongoing utterance
    window.speechSynthesis.cancel();
    if (this.currentButton) {
      this.resetButton(this.currentButton);
    }

    const clean = this.cleanLatin(text);
    if (!clean) return false;

    const utterance = new SpeechSynthesisUtterance(clean);
    const voice = this.getBestVoice();
    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang;
    } else {
      utterance.lang = 'it-IT'; // Default to Italian phonetics for classical Latin
    }

    utterance.rate = 0.88; // Slightly measured, clear cadence for medical terminology
    utterance.pitch = 1.0;

    if (triggerBtn) {
      this.currentButton = triggerBtn;
      triggerBtn.classList.add('speaking');
      const icon = triggerBtn.querySelector('iconify-icon');
      if (icon) icon.setAttribute('icon', 'lucide:volume-x');

      utterance.onend = () => {
        this.resetButton(triggerBtn);
        this.currentButton = null;
      };

      utterance.onerror = () => {
        this.resetButton(triggerBtn);
        this.currentButton = null;
      };
    }

    window.speechSynthesis.speak(utterance);
    return true;
  }

  static resetButton(btn) {
    if (!btn) return;
    btn.classList.remove('speaking');
    const icon = btn.querySelector('iconify-icon');
    if (icon) icon.setAttribute('icon', 'lucide:volume-2');
  }
}

// Pre-load voices if asynchronous in browser
if (typeof window !== 'undefined' && window.speechSynthesis) {
  window.speechSynthesis.onvoiceschanged = () => {
    SpeechSpeaker.getBestVoice();
  };
}
