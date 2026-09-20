/**
 * Retro Pixel Audio System & Winamp Visualizer
 * Synthesizes nostalgic music box melodies and chiptune sound effects.
 */
export class PixelAudio {
  constructor(playlist = []) {
    this.playlist = playlist;
    this.currentTrackIndex = 0;
    this.isPlaying = false;
    this.volume = 0.20; // Default quiet comfortable volume (20%)

    this.audioElementA = new Audio();
    this.audioElementB = new Audio();
    this.audioElementA.preload = 'auto';
    this.audioElementB.preload = 'auto';
    this.audioElementA.loop = true;
    this.audioElementB.loop = true;
    this.audioElementA.volume = this.volume;
    this.audioElementB.volume = 0;
    this.currentAudio = this.audioElementA;
    this.fadeInterval = null;

    if (this.playlist.length > 0 && this.playlist[0]?.src) {
      this.audioElementA.src = this.playlist[0].src;
    }

    // Backward compatibility pointer
    this.audioElement = this.audioElementA;

    this.audioCtx = null;
    this.synthInterval = null;

    // SFX & Ambient state
    this.lastFootstepTime = 0;
    this.footstepFoot = 0;
    this.flightAmbientNodes = null;

    // Authentic non-cartoonish book & page sounds
    this.bookOpenAudio = new Audio('./assets/sfx/book_open.mp3');
    this.bookOpenAudio.preload = 'auto';
    this.pageFlipAudio = new Audio('./assets/sfx/page_flip.mp3');
    this.pageFlipAudio.preload = 'auto';

    this.initWinampUI();
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

  getCurrentTrack() {
    return this.playlist[this.currentTrackIndex] || null;
  }

  initWinampUI() {
    this.playBtn = document.getElementById('audio-play');
    this.volSlider = document.getElementById('audio-volume');
    this.eqBars = document.querySelectorAll('.winamp-visualizer .bar, .eq-bar');
    this.winampWindow = document.getElementById('winamp-player');

    // Animate equalizer bars when playing
    setInterval(() => {
      if (this.isPlaying && this.eqBars.length > 0) {
        this.eqBars.forEach(bar => {
          const h = Math.floor(Math.random() * 85 + 15);
          bar.style.height = `${h}%`;
        });
      }
    }, 150);
  }

  async start() {
    this.ensureAudioContext();
    if (this.isPlaying && !this.currentAudio.paused) return;

    if (this.playlist.length > 0 && this.playlist[this.currentTrackIndex]?.src) {
      const track = this.playlist[this.currentTrackIndex];
      try {
        const cleanSrc = track.src.replace(/^\.\//, '');
        if (!this.currentAudio.src || !this.currentAudio.src.includes(cleanSrc)) {
          this.currentAudio.src = track.src;
        }
        this.currentAudio.volume = this.volume;
        await this.currentAudio.play();
        this.isPlaying = true;
        this.updatePlayState();
        this.updateTrackDisplay();
        return;
      } catch (e) {
        // Autoplay blocked prior to user interaction
        this.isPlaying = false;
        this.updatePlayState();
        console.log("Audio autoplay pending user gesture:", e.message || e);
      }
    }
  }

  /**
   * Smoothly crossfade from current track to target track over duration seconds
   */
  async crossfadeTo(targetIndex, duration = 1.5) {
    if (targetIndex === this.currentTrackIndex && this.isPlaying) return;
    if (targetIndex < 0 || targetIndex >= this.playlist.length) return;

    this.ensureAudioContext();

    if (this.fadeInterval) {
      clearInterval(this.fadeInterval);
      this.fadeInterval = null;
    }

    const nextTrack = this.playlist[targetIndex];
    const incoming = this.currentAudio === this.audioElementA ? this.audioElementB : this.audioElementA;
    const outgoing = this.currentAudio;

    incoming.src = nextTrack.src;
    incoming.currentTime = 0;
    incoming.volume = 0;

    this.currentTrackIndex = targetIndex;
    this.updateTrackDisplay();

    try {
      await incoming.play();
      this.isPlaying = true;
      this.updatePlayState();
    } catch (e) {
      console.log("Could not play incoming track:", e);
    }

    const steps = 30;
    const stepTime = (duration * 1000) / steps;
    let step = 0;

    this.fadeInterval = setInterval(() => {
      step++;
      const t = Math.min(1.0, step / steps);
      incoming.volume = t * this.volume;
      outgoing.volume = Math.max(0, (1.0 - t) * this.volume);

      if (step >= steps) {
        clearInterval(this.fadeInterval);
        this.fadeInterval = null;
        outgoing.pause();
        outgoing.volume = 0;
        this.currentAudio = incoming;
        this.audioElement = incoming;
        this.currentTrackIndex = targetIndex;
        this.updateTrackDisplay();
      }
    }, stepTime);
  }

  next() {
    if (this.playlist.length <= 1) return;
    const nextIdx = (this.currentTrackIndex + 1) % this.playlist.length;
    this.crossfadeTo(nextIdx, 1.2);
  }

  prev() {
    if (this.playlist.length <= 1) return;
    const prevIdx = (this.currentTrackIndex - 1 + this.playlist.length) % this.playlist.length;
    this.crossfadeTo(prevIdx, 1.2);
  }

  toggle() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.start();
    }
  }

  setVolume(vol) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.currentAudio) this.currentAudio.volume = this.volume;
    if (this.audioElement) this.audioElement.volume = this.volume;
    if (this.flightAmbientNodes && this.flightAmbientNodes.masterGain) {
      try {
        this.flightAmbientNodes.masterGain.gain.setValueAtTime(0.14 * this.volume, this.audioCtx.currentTime);
      } catch (e) {}
    }
  }

  stop() {
    this.pause();
  }

  pause() {
    this.isPlaying = false;
    if (this.fadeInterval) {
      clearInterval(this.fadeInterval);
      this.fadeInterval = null;
    }
    this.audioElementA.pause();
    this.audioElementB.pause();
    this.stopMusicBox();
    this.updatePlayState();
  }

  updatePlayState() {
    const playBtn = document.getElementById('audio-play') || this.playBtn;
    if (playBtn) {
      playBtn.textContent = this.isPlaying ? '❚❚' : '▶';
    }
  }

  updateTrackDisplay() {
    // Intentionally left blank: user requested no song titles in player
    const trackEl = document.getElementById('track-name');
    if (trackEl) {
      trackEl.textContent = '';
      trackEl.style.display = 'none';
    }
  }

  startMusicBox() {
    // Disabled: Justin Hurwitz soundtrack is used exclusively
  }

  stopMusicBox() {
    if (this.synthInterval) {
      clearInterval(this.synthInterval);
      this.synthInterval = null;
    }
  }

  playPlink(freq) {
    if (!this.audioCtx) return;
    const now = this.audioCtx.currentTime;
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.15 * this.volume, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);

    osc.start(now);
    osc.stop(now + 1.2);
  }

  /* ================= SFX ================= */

  playJump() {
    this.ensureAudioContext();
    if (!this.audioCtx) return;
    const now = this.audioCtx.currentTime;

    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(360, now + 0.12);

    gain.gain.setValueAtTime(0.1 * this.volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);

    osc.start(now);
    osc.stop(now + 0.12);
  }

  playChime() {
    this.ensureAudioContext();
    if (!this.audioCtx) return;
    const chord = [523.25, 659.25, 783.99];
    chord.forEach((f, idx) => {
      const now = this.audioCtx.currentTime + idx * 0.05;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, now);

      gain.gain.setValueAtTime(0.08 * this.volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(now);
      osc.stop(now + 0.5);
    });
  }

  playCandleBlow() {
    this.ensureAudioContext();
    if (!this.audioCtx) return;

    // Soft breath noise
    const now = this.audioCtx.currentTime;
    const bufferSize = this.audioCtx.sampleRate * 0.4;
    const buffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.sin(i / bufferSize * Math.PI);
    }

    const noise = this.audioCtx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(350, now);

    const gain = this.audioCtx.createGain();
    gain.gain.setValueAtTime(0.35 * this.volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.audioCtx.destination);

    noise.start(now);

    setTimeout(() => this.playChime(), 200);
  }

  playCandleSnuff() {
    this.ensureAudioContext();
    if (!this.audioCtx) return;

    const now = this.audioCtx.currentTime;

    // 1. Crisp soft breath puff (0.12s)
    const bufferSize = Math.floor(this.audioCtx.sampleRate * 0.12);
    const buffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.sin((i / bufferSize) * Math.PI);
    }
    const noise = this.audioCtx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(480, now);
    filter.frequency.exponentialRampToValueAtTime(150, now + 0.12);

    const gain = this.audioCtx.createGain();
    gain.gain.setValueAtTime(0.4 * this.volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.audioCtx.destination);
    noise.start(now);

    // 2. Gentle sparkle chime (pleasant pentatonic note)
    const pitches = [880, 1046.5, 1174.66, 1318.51, 1567.98];
    const pitch = pitches[Math.floor(Math.random() * pitches.length)];
    const osc = this.audioCtx.createOscillator();
    const oscGain = this.audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(pitch, now);
    osc.frequency.exponentialRampToValueAtTime(pitch * 1.05, now + 0.18);

    oscGain.gain.setValueAtTime(0.06 * this.volume, now);
    oscGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);

    osc.connect(oscGain);
    oscGain.connect(this.audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.18);
  }

  playGrandFanfare() {
    this.ensureAudioContext();
    if (!this.audioCtx) return;

    const now = this.audioCtx.currentTime;

    // Celebratory ascending fanfare arpeggio: C5, E5, G5, C6, E6, G6
    const notes = [
      { f: 523.25, time: 0.00, dur: 0.20 },
      { f: 659.25, time: 0.10, dur: 0.20 },
      { f: 783.99, time: 0.20, dur: 0.25 },
      { f: 1046.50, time: 0.30, dur: 0.30 },
      { f: 1318.51, time: 0.42, dur: 0.45 },
      { f: 1567.98, time: 0.55, dur: 1.4 }
    ];

    notes.forEach(n => {
      const noteTime = now + n.time;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(n.f, noteTime);

      gain.gain.setValueAtTime(0.18 * this.volume, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + n.dur);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(noteTime);
      osc.stop(noteTime + n.dur);
    });

    // Rich sustained chords on finale
    const finalChord = [523.25, 659.25, 783.99, 1046.50];
    finalChord.forEach(f => {
      const chordTime = now + 0.55;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, chordTime);

      gain.gain.setValueAtTime(0.12 * this.volume, chordTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, chordTime + 2.2);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(chordTime);
      osc.stop(chordTime + 2.2);
    });
  }

  playZeroGWhoosh() {
    this.ensureAudioContext();
    if (!this.audioCtx) return;

    const now = this.audioCtx.currentTime;

    // Atmospheric lowpass breath sweep
    const bufferSize = Math.floor(this.audioCtx.sampleRate * 0.8);
    const buffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.sin((i / bufferSize) * Math.PI);
    }
    const noise = this.audioCtx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.audioCtx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(320, now);
    filter.frequency.exponentialRampToValueAtTime(800, now + 0.8);

    const gain = this.audioCtx.createGain();
    gain.gain.setValueAtTime(0.3 * this.volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.audioCtx.destination);
    noise.start(now);

    // Ethereal rising harmonics
    [440, 659.25, 880].forEach((freq, idx) => {
      const t = now + idx * 0.08;
      const osc = this.audioCtx.createOscillator();
      const oGain = this.audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.15, t + 0.7);

      oGain.gain.setValueAtTime(0.08 * this.volume, t);
      oGain.gain.exponentialRampToValueAtTime(0.001, t + 0.7);

      osc.connect(oGain);
      oGain.connect(this.audioCtx.destination);
      osc.start(t);
      osc.stop(t + 0.7);
    });
  }

  /* ================= GAMEPLAY & VEHICLE SFX ================= */

  playFootstep(isRunning = false) {
    this.ensureAudioContext();
    if (!this.audioCtx) return;
    const now = this.audioCtx.currentTime;
    if (now - this.lastFootstepTime < (isRunning ? 0.08 : 0.12)) return;
    this.lastFootstepTime = now;

    this.footstepFoot = 1 - this.footstepFoot;
    const baseFreq = this.footstepFoot === 0 ? 115 : 135;

    // Subtle tactile foot tap
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(38, now + 0.045);

    const stepVol = (isRunning ? 0.08 : 0.05) * this.volume;
    gain.gain.setValueAtTime(stepVol, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.045);

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.045);

    // Subtle sole friction noise
    const bufferSize = Math.floor(this.audioCtx.sampleRate * 0.03);
    const buffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }
    const noise = this.audioCtx.createBufferSource();
    noise.buffer = buffer;
    const filter = this.audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(isRunning ? 600 : 450, now);

    const nGain = this.audioCtx.createGain();
    nGain.gain.setValueAtTime(stepVol * 0.8, now);
    nGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.03);

    noise.connect(filter);
    filter.connect(nGain);
    nGain.connect(this.audioCtx.destination);
    noise.start(now);
  }

  playLand() {
    this.ensureAudioContext();
    if (!this.audioCtx) return;
    const now = this.audioCtx.currentTime;

    // Low pitch thud
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(45, now + 0.08);

    gain.gain.setValueAtTime(0.12 * this.volume, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.08);

    // Ground impact puff noise
    const bufferSize = Math.floor(this.audioCtx.sampleRate * 0.06);
    const buffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }
    const noise = this.audioCtx.createBufferSource();
    noise.buffer = buffer;
    const filter = this.audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(320, now);

    const nGain = this.audioCtx.createGain();
    nGain.gain.setValueAtTime(0.15 * this.volume, now);
    nGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);

    noise.connect(filter);
    filter.connect(nGain);
    nGain.connect(this.audioCtx.destination);
    noise.start(now);
  }

  playInteract() {
    this.ensureAudioContext();
    if (!this.audioCtx) return;
    const now = this.audioCtx.currentTime;

    // Upward two-tone chime (587.33Hz D5 -> 880Hz A5)
    [587.33, 880].forEach((freq, idx) => {
      const t = now + idx * 0.06;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.12 * this.volume, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.14);
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start(t);
      osc.stop(t + 0.14);
    });
  }

  playCatMeow() {
    this.ensureAudioContext();
    if (!this.audioCtx) return;
    const now = this.audioCtx.currentTime;

    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();
    osc.type = 'triangle';

    // Sweet nostalgic kitten meow curve: start ~520Hz, pitch rises to ~780Hz, slides softly down to ~460Hz
    osc.frequency.setValueAtTime(520, now);
    osc.frequency.exponentialRampToValueAtTime(780, now + 0.08);
    osc.frequency.exponentialRampToValueAtTime(460, now + 0.24);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.14 * this.volume, now + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.25);
  }

  playCatPurr() {
    this.ensureAudioContext();
    if (!this.audioCtx) return;
    const now = this.audioCtx.currentTime;

    // Gentle rhythmic purr oscillation
    for (let i = 0; i < 3; i++) {
      const t = now + i * 0.11;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(110 + (i % 2) * 15, t);

      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.08 * this.volume, t + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.10);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start(t);
      osc.stop(t + 0.10);
    }
  }

  playBookOpen() {
    this.ensureAudioContext();
    try {
      const sound = this.bookOpenAudio ? this.bookOpenAudio.cloneNode() : new Audio('./assets/sfx/book_open.mp3');
      sound.volume = Math.max(0.05, Math.min(1.0, this.volume * 2.2));
      sound.play().catch(() => {});
    } catch (e) {}
  }

  playPageFlip() {
    this.ensureAudioContext();
    try {
      const sound = this.pageFlipAudio ? this.pageFlipAudio.cloneNode() : new Audio('./assets/sfx/page_flip.mp3');
      sound.volume = Math.max(0.05, Math.min(1.0, this.volume * 2.0));
      sound.play().catch(() => {});
    } catch (e) {}
  }

  // All airplane sound effects silenced per user request
  playPlaneBoarding() {}
  playPlaneEngineStart() {}
  playPlaneTaxi() {}
  playPlaneTakeoff() {}
  startFlightAmbient() {}
  stopFlightAmbient() {}
  playPlaneTouchdown() {}
}

