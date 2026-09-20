/**
 * Retro UI Controller: HUD, Speech Bubbles, Letter Modal, and Click Interactions
 */
export class RetroUI {
  constructor(gameConfig) {
    this.config = gameConfig;

    // Elements
    this.introPrompt = document.getElementById('intro-prompt');
    this.openCardBtn = document.getElementById('open-card-btn');
    this.hudContainer = document.getElementById('hud-container');
    this.chapterNumberEl = document.getElementById('chapter-number');
    this.chapterTitleEl = document.getElementById('chapter-title');
    this.memoryBubble = document.getElementById('memory-bubble');
    this.memoryText = document.getElementById('memory-text');
    this.finaleModal = document.getElementById('finale-modal');
    this.letterContent = document.getElementById('letter-content');
    this.closeLetterBtn = document.getElementById('close-letter-btn');
    this.replayBtn = document.getElementById('replay-btn');

    this.initEvents();
  }

  initEvents() {
    if (this.closeLetterBtn && this.finaleModal) {
      this.closeLetterBtn.addEventListener('click', () => {
        this.hideFinaleLetter();
      });
    }

    if (this.replayBtn) {
      this.replayBtn.addEventListener('click', () => {
        window.location.reload();
      });
    }
  }

  setOpenCardCallback(callback) {
    if (this.openCardBtn) {
      this.openCardBtn.addEventListener('click', () => {
        callback();
      });
    }
  }

  hideIntroPrompt() {
    if (this.introPrompt) {
      this.introPrompt.classList.add('fade-out');
      setTimeout(() => {
        this.introPrompt.style.display = 'none';
      }, 600);
    }
    if (this.hudContainer) {
      this.hudContainer.classList.remove('hidden');
    }
  }

  updateChapter(chapter) {
    if (this.chapterNumberEl) {
      this.chapterNumberEl.textContent = `${chapter.number} ✦ ${chapter.year || ''}`;
    }
    if (this.chapterTitleEl) {
      this.chapterTitleEl.textContent = chapter.title;
    }

    if (chapter.note) {
      this.showMemoryNote(chapter.note);
    } else {
      this.hideMemoryNote();
    }
  }

  showMemoryNote(text) {
    if (!this.memoryBubble || !this.memoryText) return;
    this.memoryText.textContent = text;
    this.memoryBubble.classList.remove('hidden');
    this.memoryBubble.style.opacity = '1';
  }

  hideMemoryNote() {
    if (!this.memoryBubble) return;
    this.memoryBubble.style.opacity = '0';
    setTimeout(() => {
      this.memoryBubble.classList.add('hidden');
    }, 400);
  }

  showFinaleLetter(letterText) {
    if (!this.finaleModal) return;
    if (this.letterContent) {
      this.letterContent.textContent = letterText || this.config.finaleLetter;
    }
    this.finaleModal.classList.remove('hidden');
    this.finaleModal.style.opacity = '0';
    setTimeout(() => {
      this.finaleModal.style.opacity = '1';
    }, 50);
  }

  hideFinaleLetter() {
    if (!this.finaleModal) return;
    this.finaleModal.style.opacity = '0';
    setTimeout(() => {
      this.finaleModal.classList.add('hidden');
    }, 600);
  }
}
