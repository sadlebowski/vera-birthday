/**
 * Vintage Winamp / MySpace Audio Player & Web Audio Sound Effects Synthesizer
 */

export class AudioPlayer {
  constructor(playlist = []) {
    this.playlist = playlist;
    this.currentTrackIndex = 0;
    this.isPlaying = false;
    this.volume = 0.7;

    // HTML5 Audio Element for custom MP3s
    this.audioElement = new Audio();
    this.audioElement.volume = this.volume;
    this.audioElement.loop = true;

    // Web Audio API context for Procedural SFX & Fallback Synthesizer
    this.audioCtx = null;
    this.isSynthPlaying = false;
    this.synthInterval = null;

    this.initUI();
  }

  ensureAudioContext() {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  initUI() {
    this.playBtn = document.getElementById('play-pause-btn');
    this.prevBtn = document.getElementById('prev-track-btn');
    this.nextBtn = document.getElementById('next-track-btn');
    this.volumeSlider = document.getElementById('volume-slider');
    this.trackNameEl = document.getElementById('track-name');
    this.trackTimeEl = document.getElementById('track-time');
    this.tapeWheels = document.querySelectorAll('.tape-wheel');
    this.playerCollapseBtn = document.getElementById('player-collapse-btn');
    this.retroPlayer = document.getElementById('retro-player');

    if (this.playBtn) {
      this.playBtn.addEventListener('click', () => {
        this.ensureAudioContext();
        this.togglePlay();
      });
    }

    if (this.prevBtn) {
      this.prevBtn.addEventListener('click', () => {
        this.ensureAudioContext();
        this.prevTrack();
      });
    }

    if (this.nextBtn) {
      this.nextBtn.addEventListener('click', () => {
        this.ensureAudioContext();
        this.nextTrack();
      });
    }

    if (this.volumeSlider) {
      this.volumeSlider.addEventListener('input', (e) => {
        this.volume = parseFloat(e.target.value);
        this.audioElement.volume = this.volume;
      });
    }

    if (this.playerCollapseBtn && this.retroPlayer) {
      let collapsed = false;
      this.playerCollapseBtn.addEventListener('click', () => {
        collapsed = !collapsed;
        this.retroPlayer.style.height = collapsed ? '26px' : 'auto';
        this.playerCollapseBtn.textContent = collapsed ? '+' : '_';
      });
    }

    this.audioElement.addEventListener('timeupdate', () => {
      if (this.audioElement.duration && this.trackTimeEl) {
        const cur = this.formatTime(this.audioElement.currentTime);
        const dur = this.formatTime(this.audioElement.duration);
        this.trackTimeEl.textContent = `${cur} / ${dur}`;
      }
    });

    this.updateTrackDisplay();
  }

  formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  }

  updateTrackDisplay() {
    if (this.playlist.length > 0 && this.trackNameEl) {
      const track = this.playlist[this.currentTrackIndex];
      this.trackNameEl.textContent = `${track.title} - ${track.artist}`;
    }
  }

  async startMusic() {
    this.ensureAudioContext();
    if (this.isPlaying) return;

    if (this.playlist.length > 0) {
      const track = this.playlist[this.currentTrackIndex];
      this.audioElement.src = track.src;

      try {
        await this.audioElement.play();
        this.isPlaying = true;
        this.onPlayStateChanged();
      } catch (err) {
        console.warn("Could not play custom audio file, falling back to cozy Web Audio music box:", err);
        this.startProceduralMusicBox();
        this.isPlaying = true;
        this.onPlayStateChanged();
      }
    } else {
      this.startProceduralMusicBox();
      this.isPlaying = true;
      this.onPlayStateChanged();
    }
  }

  togglePlay() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.startMusic();
    }
  }

  pause() {
    this.isPlaying = false;
    this.audioElement.pause();
    this.stopProceduralMusicBox();
    this.onPlayStateChanged();
  }

  nextTrack() {
    if (this.playlist.length === 0) return;
    this.currentTrackIndex = (this.currentTrackIndex + 1) % this.playlist.length;
    this.updateTrackDisplay();
    if (this.isPlaying) {
      this.audioElement.pause();
      this.isPlaying = false;
      this.startMusic();
    }
  }

  prevTrack() {
    if (this.playlist.length === 0) return;
    this.currentTrackIndex = (this.currentTrackIndex - 1 + this.playlist.length) % this.playlist.length;
    this.updateTrackDisplay();
    if (this.isPlaying) {
      this.audioElement.pause();
      this.isPlaying = false;
      this.startMusic();
    }
  }

  onPlayStateChanged() {
    if (this.playBtn) {
      this.playBtn.textContent = this.isPlaying ? '⏸' : '▶';
    }
    this.tapeWheels.forEach(wheel => {
      if (this.isPlaying) {
        wheel.classList.remove('paused');
      } else {
        wheel.classList.add('paused');
      }
    });
  }

  /**
   * Procedural Nostalgic Music Box Melody (fallback or standalone cozy tune)
   */
  startProceduralMusicBox() {
    if (this.isSynthPlaying || !this.audioCtx) return;
    this.isSynthPlaying = true;

    // Melody notes (pentatonic / dream lofi scale: C4, D4, E4, G4, A4, C5, D5, E5)
    const melody = [
      261.63, 329.63, 392.00, 523.25, 392.00, 329.63,
      293.66, 349.23, 440.00, 587.33, 440.00, 349.23,
      261.63, 329.63, 392.00, 659.25, 523.25, 392.00,
      349.23, 440.00, 523.25, 440.00, 392.00, 329.63
    ];
    let noteIndex = 0;

    this.synthInterval = setInterval(() => {
      if (!this.isPlaying || !this.audioCtx) return;
      const freq = melody[noteIndex % melody.length];
      this.playMusicBoxNote(freq);
      noteIndex++;
    }, 450);
  }

  stopProceduralMusicBox() {
    this.isSynthPlaying = false;
    if (this.synthInterval) {
      clearInterval(this.synthInterval);
      this.synthInterval = null;
    }
  }

  playMusicBoxNote(freq) {
    if (!this.audioCtx) return;
    const now = this.audioCtx.currentTime;
    
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);

    // Warm bell envelope
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.18 * this.volume, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.6);

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);

    osc.start(now);
    osc.stop(now + 1.6);
  }

  /* ================= SFX GENERATORS ================= */

  playPageFlip() {
    this.ensureAudioContext();
    if (!this.audioCtx) return;

    // Soft paper whoosh / rustle
    const now = this.audioCtx.currentTime;
    const bufferSize = this.audioCtx.sampleRate * 0.25;
    const buffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.2));
    }

    const noise = this.audioCtx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.audioCtx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800, now);
    filter.frequency.exponentialRampToValueAtTime(300, now + 0.25);

    const gain = this.audioCtx.createGain();
    gain.gain.setValueAtTime(0.4 * this.volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.audioCtx.destination);

    noise.start(now);
  }

  playJump() {
    this.ensureAudioContext();
    if (!this.audioCtx) return;

    const now = this.audioCtx.currentTime;
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(240, now);
    osc.frequency.exponentialRampToValueAtTime(480, now + 0.18);

    gain.gain.setValueAtTime(0.2 * this.volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);

    osc.start(now);
    osc.stop(now + 0.2);
  }

  playSparkle() {
    this.ensureAudioContext();
    if (!this.audioCtx) return;

    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, idx) => {
      const now = this.audioCtx.currentTime + idx * 0.06;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.12 * this.volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(now);
      osc.stop(now + 0.4);
    });
  }

  playCandleBlow() {
    this.ensureAudioContext();
    if (!this.audioCtx) return;

    // Wind breath sound
    const now = this.audioCtx.currentTime;
    const bufferSize = this.audioCtx.sampleRate * 0.5;
    const buffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.sin(i / bufferSize * Math.PI);
    }

    const noise = this.audioCtx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, now);
    filter.frequency.linearRampToValueAtTime(200, now + 0.5);

    const gain = this.audioCtx.createGain();
    gain.gain.setValueAtTime(0.5 * this.volume, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.audioCtx.destination);

    noise.start(now);

    // Chime chords after blow
    setTimeout(() => {
      this.playSparkle();
    }, 300);
  }
}
