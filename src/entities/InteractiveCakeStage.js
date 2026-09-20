/**
 * InteractiveCakeStage: Authentic 3D PSX Birthday Cake with 26 Extinguishable Candles
 * 
 * Flow:
 * 1. Cake enters smoothly from deep velvet darkness (#06020a) towards the camera,
 *    settling in the exact perspective of the user's Paint sketch (curved top arc peaks at ~42% height).
 * 2. Authentic PSX 3D video game asset with Bayer dithering, chocolate glaze and cream rosettes.
 * 3. 26 lit candles with warm flickering flames and dynamic halos.
 * 4. STRICT CONSTRAINT: NO LABELS OR TEXT OVERLAYS during the cake stage.
 * 5. Player clicks or drags across the flames to snuff them out.
 * 6. Each candle snuffs with soft breath puff, rising smoke wisps & falling sparks.
 * 7. Progressive ambient dimming as candles are snuffed out.
 * 8. When the 26th candle is extinguished:
 *    - 1.0s silence in darkness
 *    - Joyful eruption of fireworks, confetti rain & triumphant retro fanfare
 *    - Glowing grand banner: "✧ ♥ С ДНЁМ РОЖДЕНИЯ! ♥ ✧" (Strictly NO "Вера")
 *    - Replay button to relight and blow out the 26 candles again anytime!
 */

import { PSX_CANDLES_CONFIG } from './candlesConfig.js';

export class InteractiveCakeStage {
  constructor(options = {}) {
    this.audio = options.audio || null;
    this.stageEl = document.getElementById('grand-cake-stage');
    this.canvas = document.getElementById('grand-cake-canvas');
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;

    // UI elements
    this.counterEl = document.getElementById('cake-candles-counter');
    this.instructionBanner = document.getElementById('cake-instruction-banner');
    this.celebrationBanner = document.getElementById('cake-celebration-banner');
    this.replayBtn = document.getElementById('cake-replay-btn');
    this.returnBtn = document.getElementById('cake-return-btn');

    this.active = false;
    this.state = 'idle'; // 'entrance' -> 'interactive' -> 'celebration'
    this.entranceTimer = 0;
    this.animTime = 0;

    // Authentic Minimalist Pink & White Pixel Birthday Cake Asset
    this.cakeImage = new Image();
    this.cakeImage.src = './assets/photos/pixel_birthday_cake_26.png';

    // 4-frame Animated Pixel Flame Spritesheet (64x24, 4 frames of 16x24)
    this.flameSprite = new Image();
    this.flameSprite.src = './assets/photos/pixel_flame_4f.png';

    // 26 Candles initialization
    this.candles = [];
    this.initCandles();

    // Visual particles
    this.smokeParticles = [];
    this.sparkParticles = [];
    this.fireworks = [];
    this.confetti = [];

    // Celebration state
    this.allExtinguished = false;
    this.celebrationTriggered = false;
    this.celebrationTimer = 0;
    this.fireworkTimer = 0;

    // Pointer input
    this.isPointerDown = false;
    this.lastPointerX = 0;
    this.lastPointerY = 0;

    this.initEvents();
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  initCandles() {
    this.candles = PSX_CANDLES_CONFIG.map(c => ({
      id: c.id,
      x: c.x, // wick tip X in 640x360 coordinates
      y: c.y, // wick tip Y in 640x360 coordinates
      baseX: c.baseX,
      baseY: c.baseY,
      z: c.z,
      candleScale: c.scale || 1.0,
      extinguished: false,
      flameScale: 1.0,
      flickerOffset: Math.random() * 12.0
    }));
  }

  resize() {
    if (!this.canvas) return;
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width;
    this.canvas.height = this.height;

    // Scale cake (base 640x360) so it spans wide across viewport
    // and aligns its curved top rim peak (y = 152 in 640x360) at exactly 42% of screen height.
    const baseW = 640;
    const baseH = 360;
    let s = Math.max(this.width / baseW, this.height / baseH);
    let cakeY = Math.round(this.height * 0.42 - 152 * s);
    // Ensure bottom of cake extends to or past the bottom of viewport
    if (cakeY + baseH * s < this.height) {
      s = (this.height - this.height * 0.42) / (baseH - 152);
      cakeY = Math.round(this.height * 0.42 - 152 * s);
    }
    this.scale = s;
    this.cakeWidth = Math.round(baseW * s);
    this.cakeHeight = Math.round(baseH * s);
    this.cakeX = Math.round((this.width - this.cakeWidth) / 2);
    this.cakeY = cakeY;
  }

  initEvents() {
    if (!this.canvas) return;

    const updateHoverCursor = (clientX, clientY) => {
      if (!this.canvas) return;
      if (!this.active || this.allExtinguished) {
        this.canvas.style.cursor = 'default';
        return;
      }

      let isOverCandle = false;
      for (const candle of this.candles) {
        if (candle.extinguished) continue;
        const fx = this.cakeX + candle.x * this.scale;
        const fy = this.cakeY + (candle.y - 4) * this.scale;
        const hitRadius = Math.max(26, 22 * this.scale * (candle.candleScale || 1.0));
        const dist = Math.hypot(clientX - fx, clientY - fy);
        if (dist <= hitRadius) {
          isOverCandle = true;
          break;
        }
      }

      if (isOverCandle) {
        this.canvas.style.cursor = "url('./assets/photos/cursor_lips.png') 16 16, pointer";
      } else {
        this.canvas.style.cursor = 'default';
      }
    };

    const onMove = (clientX, clientY, isDown) => {
      if (!this.active) return;
      this.lastPointerX = clientX;
      this.lastPointerY = clientY;

      updateHoverCursor(clientX, clientY);

      if (isDown && this.state === 'interactive') {
        this.checkCollision(clientX, clientY);
      }
    };

    this.canvas.addEventListener('pointerdown', (e) => {
      this.isPointerDown = true;
      onMove(e.clientX, e.clientY, true);
    });

    window.addEventListener('pointermove', (e) => {
      onMove(e.clientX, e.clientY, this.isPointerDown);
    });

    window.addEventListener('pointerup', () => {
      this.isPointerDown = false;
    });

    this.canvas.addEventListener('click', (e) => {
      if (this.state === 'entrance') return;
      this.checkCollision(e.clientX, e.clientY);
    });

    this.canvas.addEventListener('pointerleave', () => {
      if (this.canvas) this.canvas.style.cursor = 'default';
    });

    if (this.replayBtn) {
      this.replayBtn.addEventListener('click', () => {
        this.resetCandles();
      });
    }

    if (this.returnBtn) {
      this.returnBtn.addEventListener('click', () => {
        this.close();
      });
    }
  }

  start() {
    this.resize();
    this.active = true;
    this.state = 'entrance';
    this.entranceTimer = 0;
    this.animTime = 0;
    this.allExtinguished = false;
    this.celebrationTriggered = false;
    this.celebrationTimer = 0;

    if (this.stageEl) this.stageEl.classList.remove('hidden');

    // STRICT CONSTRAINT: Absolutely NO labels or text
    if (this.instructionBanner) {
      this.instructionBanner.classList.add('hidden');
      this.instructionBanner.style.display = 'none';
    }
    if (this.counterEl) {
      this.counterEl.classList.add('hidden');
      this.counterEl.style.display = 'none';
    }
    if (this.celebrationBanner) {
      this.celebrationBanner.classList.add('hidden');
    }

    if (this.audio && this.audio.playZeroGWhoosh) {
      this.audio.playZeroGWhoosh();
    }
  }

  close() {
    this.active = false;
    this.state = 'idle';
    if (this.canvas) this.canvas.style.cursor = 'default';
    if (this.stageEl) this.stageEl.classList.add('hidden');
    if (this.celebrationBanner) this.celebrationBanner.classList.add('hidden');

    // Restore cards and book
    const wall = document.querySelector('.pinterest-wall');
    if (wall) {
      wall.classList.remove('hyperspace-dive');
      const cards = wall.querySelectorAll('.scrapbook-card');
      cards.forEach(card => {
        card.style.transform = '';
        card.style.opacity = '';
        card.style.filter = '';
        card.style.transition = '';
      });
    }
    const book = document.getElementById('interactive-book');
    if (book) {
      book.style.transform = '';
      book.style.opacity = '';
      book.style.filter = '';
      book.style.pointerEvents = '';
    }
  }

  resetCandles() {
    this.initCandles();
    this.allExtinguished = false;
    this.celebrationTriggered = false;
    this.celebrationTimer = 0;
    this.state = 'interactive';
    this.smokeParticles = [];
    this.sparkParticles = [];
    this.fireworks = [];
    this.confetti = [];

    if (this.celebrationBanner) this.celebrationBanner.classList.add('hidden');

    if (this.audio && this.audio.playChime) {
      this.audio.playChime();
    }
  }

  checkCollision(px, py) {
    if (this.allExtinguished || this.state !== 'interactive') return;

    for (const candle of this.candles) {
      if (candle.extinguished) continue;

      const fx = this.cakeX + candle.x * this.scale;
      const fy = this.cakeY + (candle.y - 4) * this.scale;
      const hitRadius = Math.max(22, 18 * this.scale * (candle.candleScale || 1.0));

      const dist = Math.hypot(px - fx, py - fy);
      if (dist <= hitRadius) {
        this.extinguishCandle(candle, fx, fy);
      }
    }
  }

  extinguishCandle(candle, fx, fy) {
    candle.extinguished = true;

    // Breath snuff sound
    if (this.audio && this.audio.playCandleSnuff) {
      this.audio.playCandleSnuff();
    } else if (this.audio && this.audio.playCandleBlow) {
      this.audio.playCandleBlow();
    }

    // Rising smoke wisps
    const smokeCount = 10 + Math.floor(Math.random() * 6);
    for (let i = 0; i < smokeCount; i++) {
      this.smokeParticles.push({
        x: fx + (Math.random() - 0.5) * 6,
        y: fy + (Math.random() - 0.5) * 4,
        vx: (Math.random() - 0.5) * 0.9,
        vy: -1.0 - Math.random() * 1.6,
        size: 3 + Math.random() * 4,
        alpha: 0.85,
        life: 50 + Math.random() * 25,
        curl: (Math.random() - 0.5) * 0.08
      });
    }

    // Falling orange/golden sparks
    for (let i = 0; i < 5; i++) {
      this.sparkParticles.push({
        x: fx,
        y: fy,
        vx: (Math.random() - 0.5) * 2.2,
        vy: -Math.random() * 2.0,
        alpha: 1.0,
        life: 25 + Math.random() * 15,
        color: Math.random() > 0.5 ? '#ff9800' : '#ffd54f'
      });
    }

    // Check if all 26 candles are extinguished
    const remaining = this.candles.filter(c => !c.extinguished).length;
    if (remaining === 0) {
      this.allExtinguished = true;
      this.celebrationTimer = 0;
      if (this.canvas) this.canvas.style.cursor = 'default';
    }
  }

  update(delta) {
    if (!this.active) return;
    this.animTime += delta;

    // 1. Entrance animation: Cake zooms in smoothly from deep darkness
    if (this.state === 'entrance') {
      this.entranceTimer += delta;
      const t = Math.min(1.0, this.entranceTimer / 1.8);
      if (t >= 1.0) {
        this.state = 'interactive';
      }
    }

    // Autoblow testing support via URL parameter ?autoblow=1
    if (window.location.search.includes('autoblow=1') && this.state === 'interactive' && !this.allExtinguished) {
      this.autoblowTimer = (this.autoblowTimer || 0) + delta;
      if (this.autoblowTimer >= 0.04) {
        this.autoblowTimer = 0;
        const unlit = this.candles.filter(c => !c.extinguished);
        if (unlit.length > 0) {
          const c = unlit[0];
          const fx = this.cakeX + c.x * this.scale;
          const fy = this.cakeY + c.y * this.scale;
          this.extinguishCandle(c, fx, fy);
        }
      }
    }

    // 2. Update smoke wisps
    for (let i = this.smokeParticles.length - 1; i >= 0; i--) {
      const p = this.smokeParticles[i];
      p.x += p.vx + Math.sin(p.life * 0.1) * p.curl * 8;
      p.y += p.vy;
      p.vy *= 0.985;
      p.size += 0.08;
      p.alpha -= 1.0 / p.life;
      if (p.alpha <= 0) {
        this.smokeParticles.splice(i, 1);
      }
    }

    // 3. Update sparks
    for (let i = this.sparkParticles.length - 1; i >= 0; i--) {
      const p = this.sparkParticles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.08;
      p.alpha -= 1.0 / p.life;
      if (p.alpha <= 0) {
        this.sparkParticles.splice(i, 1);
      }
    }

    // 4. Finale Celebration triggers 1.0s after the 26th candle is snuffed
    if (this.allExtinguished && !this.celebrationTriggered) {
      this.celebrationTimer += delta;
      if (this.celebrationTimer >= 1.0) {
        this.celebrationTriggered = true;
        this.state = 'celebration';
        this.triggerGrandCelebration();
      }
    }

    // 5. Update fireworks & confetti during celebration
    if (this.celebrationTriggered) {
      this.fireworkTimer += delta;
      if (this.fireworkTimer > 0.40) {
        this.fireworkTimer = 0;
        this.spawnFirework();
      }

      for (let i = this.fireworks.length - 1; i >= 0; i--) {
        const f = this.fireworks[i];
        f.x += f.vx;
        f.y += f.vy;
        f.vy += 0.04;
        f.alpha -= 1.0 / f.life;
        if (f.alpha <= 0) this.fireworks.splice(i, 1);
      }

      for (let i = this.confetti.length - 1; i >= 0; i--) {
        const c = this.confetti[i];
        c.x += c.vx + Math.sin(c.life * 0.08) * 0.8;
        c.y += c.vy;
        c.rot += c.vrot;
        if (c.y > this.height + 20) {
          c.y = -10;
          c.x = Math.random() * this.width;
        }
      }
    }
  }

  triggerGrandCelebration() {
    if (this.audio && this.audio.playGrandFanfare) {
      this.audio.playGrandFanfare();
    }

    if (this.celebrationBanner) {
      this.celebrationBanner.classList.remove('hidden');
    }

    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        if (this.active) this.spawnFirework();
      }, i * 200);
    }

    this.confetti = [];
    const colors = ['#ffd54f', '#ff4081', '#00e5ff', '#b388ff', '#76ff03', '#ffffff', '#ff9800'];
    for (let i = 0; i < 130; i++) {
      this.confetti.push({
        x: Math.random() * this.width,
        y: Math.random() * -this.height,
        vx: (Math.random() - 0.5) * 1.6,
        vy: 1.8 + Math.random() * 2.8,
        size: 3.5 + Math.random() * 4,
        rot: Math.random() * Math.PI * 2,
        vrot: (Math.random() - 0.5) * 0.15,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 300
      });
    }
  }

  spawnFirework() {
    const bx = this.width * (0.12 + Math.random() * 0.76);
    const by = this.height * (0.10 + Math.random() * 0.35);
    const colors = ['#ff4081', '#ffd54f', '#00e5ff', '#ff9800', '#b388ff', '#ffffff'];
    const color = colors[Math.floor(Math.random() * colors.length)];

    for (let i = 0; i < 48; i++) {
      const angle = (i / 48) * Math.PI * 2;
      const speed = 2.0 + Math.random() * 4.4;
      this.fireworks.push({
        x: bx,
        y: by,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        alpha: 1.0,
        life: 55 + Math.random() * 25,
        color: color,
        size: 2.2 + Math.random() * 2.0
      });
    }
  }

  draw() {
    if (!this.active || !this.ctx) return;
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);

    const remaining = this.candles.filter(c => !c.extinguished).length;
    const litRatio = remaining / 26;

    // 1. Velvet Dark Void Background (#06020a)
    ctx.save();
    ctx.fillStyle = '#06020a';
    ctx.fillRect(0, 0, this.width, this.height);

    // Entrance progress [0..1]
    let entranceProgress = 1.0;
    if (this.state === 'entrance') {
      entranceProgress = Math.min(1.0, this.entranceTimer / 2.0);
    }

    // Warm ambient candlelight room glow expands out from the cake
    let glowAlpha = this.celebrationTriggered ? 0.70 : (0.08 + litRatio * 0.48);
    glowAlpha *= Math.min(1.0, entranceProgress * 1.2);

    const glowGrad = ctx.createRadialGradient(
      this.cakeX + this.cakeWidth / 2,
      this.cakeY + this.cakeHeight * 0.42,
      30,
      this.cakeX + this.cakeWidth / 2,
      this.cakeY + this.cakeHeight * 0.42,
      this.cakeWidth * 0.72
    );
    glowGrad.addColorStop(0, `rgba(255, 185, 45, ${glowAlpha * 0.40})`);
    glowGrad.addColorStop(0.45, `rgba(240, 98, 146, ${glowAlpha * 0.18})`);
    glowGrad.addColorStop(1, 'rgba(6, 2, 10, 0)');
    ctx.fillStyle = glowGrad;
    ctx.fillRect(0, 0, this.width, this.height);
    ctx.restore();

    // 2. Smooth Manifestation from Deep Darkness (NO box scale, NO square boundaries)
    const ease = 1.0 - Math.pow(1.0 - entranceProgress, 2.5);
    const cakeAlpha = Math.min(1.0, Math.pow(entranceProgress, 1.4));
    const cakeOffsetY = (1.0 - ease) * 10;

    ctx.save();
    ctx.globalAlpha = cakeAlpha;

    // 3. Draw Minimalist Pink & White Pixel Cake
    if (this.cakeImage && this.cakeImage.complete && this.cakeImage.naturalWidth > 0) {
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(
        this.cakeImage,
        this.cakeX,
        this.cakeY + cakeOffsetY,
        this.cakeWidth,
        this.cakeHeight
      );
    }

    // 4. Draw 26 Animated Candle Flames (from pixel spritesheet) & Glowing Halos
    const flameIgnite = Math.min(1.0, Math.max(0.0, (entranceProgress - 0.12) / 0.88));

    for (const candle of this.candles) {
      const fx = this.cakeX + candle.x * this.scale;
      const fy = this.cakeY + candle.y * this.scale + cakeOffsetY;
      const cScale = (candle.candleScale || 1.0) * this.scale;

      if (!candle.extinguished && flameIgnite > 0.01) {
        const t = this.animTime * 9.0 + candle.flickerOffset;
        const frameIdx = Math.floor((this.animTime * 9.0 + candle.flickerOffset) % 4);

        // Warm radial candlelight aura
        ctx.save();
        const auraRadius = (20 + Math.sin(t * 1.8) * 3) * cScale;
        const aura = ctx.createRadialGradient(fx, fy - 6 * cScale, 1, fx, fy - 6 * cScale, auraRadius);
        aura.addColorStop(0, `rgba(255, 235, 59, ${0.45 * flameIgnite})`);
        aura.addColorStop(0.35, `rgba(255, 140, 0, ${0.22 * flameIgnite})`);
        aura.addColorStop(1, 'rgba(255, 60, 0, 0)');
        ctx.fillStyle = aura;
        ctx.beginPath();
        ctx.arc(fx, fy - 6 * cScale, auraRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // 4-frame Animated Pixel Flame Sprite
        if (this.flameSprite && this.flameSprite.complete && this.flameSprite.naturalWidth > 0) {
          ctx.save();
          ctx.globalAlpha = cakeAlpha * flameIgnite;
          ctx.imageSmoothingEnabled = false;
          // In 16x24 sprite frame, the wick is at x=8, y=20
          const dw = 16 * cScale;
          const dh = 24 * cScale;
          const dx = fx - 8 * cScale;
          const dy = fy - 20 * cScale;
          ctx.drawImage(
            this.flameSprite,
            frameIdx * 16, 0, 16, 24,
            dx, dy, dw, dh
          );
          ctx.restore();
        } else {
          // Fallback procedural flame
          ctx.save();
          ctx.fillStyle = '#ff9800';
          ctx.beginPath();
          ctx.ellipse(fx, fy - 8 * cScale, 4 * cScale, 8 * cScale, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.ellipse(fx, fy - 6 * cScale, 2 * cScale, 4 * cScale, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      } else if (candle.extinguished) {
        // Burnt dark wick tip
        ctx.save();
        ctx.fillStyle = '#1c1822';
        ctx.fillRect(Math.round(fx - 1), Math.round(fy - 2 * cScale), 2, 3 * cScale);
        ctx.restore();
      }
    }

    ctx.restore(); // end cakeAlpha save

    // 5. Draw Rising Smoke Wisps
    for (const p of this.smokeParticles) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.fillStyle = 'rgba(225, 225, 235, 0.85)';
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 6. Draw Falling Sparks
    for (const p of this.sparkParticles) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.fillStyle = p.color;
      ctx.fillRect(Math.round(p.x), Math.round(p.y), 2.5, 2.5);
      ctx.restore();
    }

    // 7. Draw Fireworks during Celebration
    for (const f of this.fireworks) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, f.alpha);
      ctx.fillStyle = f.color;
      ctx.beginPath();
      ctx.arc(f.x, f.y, f.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 8. Draw Confetti Rain
    for (const c of this.confetti) {
      ctx.save();
      ctx.translate(c.x, c.y);
      ctx.rotate(c.rot);
      ctx.fillStyle = c.color;
      ctx.fillRect(-c.size, -c.size * 0.6, c.size * 2, c.size * 1.2);
      ctx.restore();
    }
  }
}
