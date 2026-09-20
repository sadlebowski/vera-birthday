/**
 * CosmicFloatingOverlay: Physical Zero-G Leap, Eye-Zoom & 3D Card Flythrough
 * 
 * Cinematic Flow:
 * 1. Physical Book Exit: Alice leaps gracefully out of the book page to the right.
 *    The book slides smoothly off-screen left into the distance, leaving only the Pinterest polaroid wall.
 * 2. Zero-G Floating: Alice drifts weightlessly in open space with starry trail (STRICTLY NO LABELS/TEXT).
 * 3. Eye Zoom: The camera smoothly zooms directly into Alice's eyes, passing through into first-person POV.
 * 4. Cards Flythrough: Camera plunges forward; all polaroid cards physically part and fly outward to the sides.
 * 5. Dark Velvet Void: Screen falls into pitch-black void (#06020a).
 * 6. Calls onDiveComplete() to reveal the 3D PSX Cake Stage.
 */

export class CosmicFloatingOverlay {
  constructor(options = {}) {
    this.audio = options.audio || null;
    this.stageEl = document.getElementById('cosmic-stage');
    this.canvas = document.getElementById('cosmic-canvas');
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
    this.titleHintEl = document.getElementById('cosmic-title-hint');
    this.pinterestWall = document.querySelector('.pinterest-wall');
    this.interactiveBook = document.getElementById('interactive-book');

    this.active = false;
    // States: 'leap' -> 'floating' -> 'eye_zoom' -> 'cards_flythrough' -> 'done'
    this.state = 'idle';
    this.timer = 0;
    this.zoomTimer = 0;
    this.flyTimer = 0;
    this.onDiveComplete = null;

    // Alice zero-g physics
    this.aliceX = 0;
    this.aliceY = 0;
    this.aliceVx = 0;
    this.aliceVy = 0;
    this.baseFloatX = 0;
    this.baseFloatY = 0;
    this.aliceAngle = 0;
    this.aliceScale = 1.0;
    this.aliceAlpha = 1.0;
    this.aliceFacing = 1;
    this.aliceRef = null;

    // Camera zoom
    this.zoomFactor = 1.0;

    // Visual particles
    this.stardust = [];
    this.warpStars = [];
    this.darkVoidAlpha = 0;
    this.cardsDispersed = false;

    // Dedicated floating sprites
    this.floatSprite = new Image();
    this.floatSprite.src = './assets/alice_gandalf/alice_jump_r_2.png';
    this.fallSprite = new Image();
    this.fallSprite.src = './assets/alice_gandalf/alice_fall_r_1.png';

    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    if (!this.canvas) return;
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
  }

  start(aliceScreenCoords, aliceRef) {
    this.resize();
    this.active = true;
    this.state = 'floating';
    this.timer = 0;
    this.zoomTimer = 0;
    this.flyTimer = 0;
    this.zoomFactor = 1.0;
    this.darkVoidAlpha = 0;
    this.stardust = [];
    this.warpStars = [];
    this.cardsDispersed = false;
    this.aliceRef = aliceRef;

    if (this.stageEl) this.stageEl.classList.remove('hidden');

    // STRICT CONSTRAINT: Absolutely NO labels or text
    if (this.titleHintEl) {
      this.titleHintEl.classList.add('hidden');
      this.titleHintEl.style.display = 'none';
      this.titleHintEl.style.opacity = '0';
    }

    // Precise screen coordinates matching the book's canvas position
    this.aliceX = (aliceScreenCoords && !isNaN(aliceScreenCoords.x) && aliceScreenCoords.x > 30)
      ? aliceScreenCoords.x
      : this.width * 0.48;
    this.aliceY = (aliceScreenCoords && !isNaN(aliceScreenCoords.y) && aliceScreenCoords.y > 30)
      ? aliceScreenCoords.y
      : this.height * 0.50;
    this.aliceScale = Math.max(1.3, (aliceScreenCoords && aliceScreenCoords.scale) || 1.35);
    this.aliceAlpha = 1.0;
    this.aliceAngle = 0;

    // Smooth, gentle zero-G levitation drifting slowly to the right
    this.baseFloatX = this.width * 0.50;
    this.baseFloatY = this.height * 0.44;
    this.aliceVx = 1.8;
    this.aliceVy = -0.6;

    // Physical Book Exit: Book glides smoothly and slowly off-screen to the left
    if (this.interactiveBook) {
      this.interactiveBook.style.transition = 'transform 6.5s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 6.0s ease';
      this.interactiveBook.style.transform = 'translateX(-220vw) scale(0.95)';
      this.interactiveBook.style.opacity = '0';
      this.interactiveBook.style.pointerEvents = 'none';
    }

    // Pre-cache scrapbook card coordinates & promote to GPU layers for 100% lag-free flythrough
    this.cachedCards = [];
    const cards = document.querySelectorAll('.pinterest-wall .scrapbook-card');
    const cx = this.width / 2;
    const cy = this.height / 2;
    cards.forEach((card) => {
      const rect = card.getBoundingClientRect();
      let dx = (rect.left + rect.width / 2) - cx;
      let dy = (rect.top + rect.height / 2) - cy;
      const dist = Math.hypot(dx, dy) || 1;
      dx = (dx / dist) * Math.max(dist, 180);
      dy = (dy / dist) * Math.max(dist, 180);
      const rot = (Math.random() - 0.5) * 50;
      const scale = 3.2 + Math.random() * 1.5;
      card.style.willChange = 'transform, opacity, filter';
      this.cachedCards.push({ card, dx, dy, rot, scale });
    });

    // Sound effect & Music track switch to Justin Hurwitz - Manny And Nellie's Theme (Reprise)
    if (this.audio) {
      if (this.audio.playZeroGWhoosh) {
        this.audio.playZeroGWhoosh();
      }
      // Track 5: Justin Hurwitz - Manny And Nellie's Theme (Reprise)
      this.audio.crossfadeTo(5, 1.8);
    }

    this.initWarpStars();
  }

  initWarpStars() {
    this.warpStars = [];
    const count = 180;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 30 + Math.random() * (this.width * 0.6);
      this.warpStars.push({
        x: Math.cos(angle) * dist,
        y: Math.sin(angle) * dist,
        z: Math.random() * 1000 + 100,
        speed: 12 + Math.random() * 22,
        color: ['#ffffff', '#ffd54f', '#ff80ab', '#80d8ff', '#e040fb'][Math.floor(Math.random() * 5)]
      });
    }
  }

  update(delta) {
    if (!this.active) return;
    this.timer += delta;

    // 1. Zero-G Floating Phase: Serene weightless drifting without heavy gravity
    if (this.state === 'floating') {
      // Gentle horizontal drift from book edge toward center, softly decelerating into baseFloatX
      this.aliceX += (this.baseFloatX - this.aliceX) * 0.02 + this.aliceVx;
      this.aliceVx *= 0.985;
      this.aliceY += Math.sin(this.timer * 1.4) * 0.35 + this.aliceVy;
      this.aliceVy *= 0.985;
      this.aliceAngle = Math.sin(this.timer * 1.1) * 0.10;

      const floatDuration = window.location.search.includes('quickcosmic=1') ? 1.5 : 9.5;
      if (this.timer >= floatDuration) {
        this.state = 'eye_zoom';
        this.zoomTimer = 0;
      }
    }
    // 2. Eye Zoom Phase: Camera dives directly into Alice's eyes (~2.0s)
    else if (this.state === 'eye_zoom') {
      this.zoomTimer += delta;
      const zoomDuration = window.location.search.includes('quickcosmic=1') ? 1.0 : 2.0;
      const p = Math.min(1.0, this.zoomTimer / zoomDuration);
      const easeP = Math.pow(p, 2.6); // exponential rush into eyes
      this.zoomFactor = 1.0 + easeP * 18.0;

      // Alice dissolves as camera passes through her face
      if (this.zoomFactor > 5.0) {
        this.aliceAlpha = Math.max(0, 1.0 - (this.zoomFactor - 5.0) / 7.0);
      }

      // Seamlessly initiate cards parting near end of zoom to avoid any abrupt transition
      if (p >= 0.85 && !this.cardsDispersed) {
        this.triggerCardsFlythrough();
      }

      if (p >= 1.0) {
        this.state = 'cards_flythrough';
        this.flyTimer = 0;
      }
    }
    // 3. Cards Flythrough & Dark Void Phase: Cards part to sides, warp into darkness (~2.4s)
    else if (this.state === 'cards_flythrough') {
      this.flyTimer += delta;

      // Dark velvet void expands across view
      this.darkVoidAlpha = Math.min(1.0, this.flyTimer / 1.5);

      // Warp speed stars rush past camera
      for (const s of this.warpStars) {
        s.z -= s.speed * (1.8 + this.flyTimer * 2.5);
        if (s.z <= 0) {
          s.z = 1000;
          const angle = Math.random() * Math.PI * 2;
          const dist = 30 + Math.random() * (this.width * 0.5);
          s.x = Math.cos(angle) * dist;
          s.y = Math.sin(angle) * dist;
        }
      }

      const flyDuration = window.location.search.includes('quickcosmic=1') ? 1.2 : 2.4;
      if (this.flyTimer >= flyDuration) {
        this.state = 'done';
        this.active = false;
        if (this.stageEl) this.stageEl.classList.add('hidden');
        if (this.onDiveComplete) {
          this.onDiveComplete();
        }
      }
    }

    // Spawn Stardust particles during floating
    if (this.state === 'floating') {
      if (Math.random() < 0.75) {
        const colors = ['#ffffff', '#ffd54f', '#ff7ebb', '#80d8ff', '#b388ff', '#ffeb3b'];
        this.stardust.push({
          x: this.aliceX + (Math.random() - 0.5) * 36,
          y: this.aliceY + (Math.random() - 0.5) * 40,
          vx: (Math.random() - 0.5) * 1.2,
          vy: 0.3 + Math.random() * 0.8,
          size: 2.5 + Math.random() * 3.5,
          color: colors[Math.floor(Math.random() * colors.length)],
          alpha: 1.0,
          life: 45 + Math.random() * 25,
          maxLife: 60,
          type: Math.random() > 0.4 ? 'star' : 'dot'
        });
      }
    }

    // Update Stardust particles
    for (let i = this.stardust.length - 1; i >= 0; i--) {
      const p = this.stardust[i];
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= 1.0 / p.life;
      if (p.alpha <= 0) {
        this.stardust.splice(i, 1);
      }
    }
  }

  triggerCardsFlythrough() {
    if (this.cardsDispersed) return;
    this.cardsDispersed = true;

    // Disperse all scrapbook cards using pre-cached GPU layers without layout recalculations
    if (this.cachedCards && this.cachedCards.length > 0) {
      for (let i = 0; i < this.cachedCards.length; i++) {
        const item = this.cachedCards[i];
        item.card.style.transition = 'transform 2.0s cubic-bezier(0.12, 0, 0.39, 0), opacity 1.6s ease-in, filter 1.6s ease-in';
        item.card.style.transform = `translate3d(${item.dx * 3.5}px, ${item.dy * 3.5}px, 700px) scale(${item.scale}) rotate(${item.rot}deg)`;
        item.card.style.opacity = '0';
        item.card.style.filter = 'blur(16px)';
      }
    }

    if (this.audio && this.audio.playZeroGWhoosh) {
      this.audio.playZeroGWhoosh();
    }
  }

  draw() {
    if (!this.active || !this.ctx) return;
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);

    const cx = this.width / 2;
    const cy = this.height / 2;

    if (this.state === 'eye_zoom') {
      ctx.save();
      // Zoom centered directly on Alice's eyes / face (y - 45)
      const eyeX = this.aliceX;
      const eyeY = this.aliceY - 45;
      ctx.translate(cx, cy);
      ctx.scale(this.zoomFactor, this.zoomFactor);
      ctx.translate(-eyeX, -eyeY);

      this.drawStardust(ctx);
      this.drawAlice(ctx);
      ctx.restore();
    } else {
      this.drawStardust(ctx);
      this.drawAlice(ctx);
    }

    // Warp lines during cards flythrough
    if (this.state === 'cards_flythrough') {
      ctx.save();
      for (const s of this.warpStars) {
        const k = 500 / Math.max(1, s.z);
        const px = cx + s.x * k;
        const py = cy + s.y * k;

        const prevK = 500 / Math.max(1, s.z + s.speed * 2.2);
        const prevPx = cx + s.x * prevK;
        const prevPy = cy + s.y * prevK;

        if (px >= 0 && px <= this.width && py >= 0 && py <= this.height) {
          ctx.strokeStyle = s.color;
          ctx.lineWidth = Math.min(4.0, Math.max(1, (1000 - s.z) / 220));
          ctx.beginPath();
          ctx.moveTo(prevPx, prevPy);
          ctx.lineTo(px, py);
          ctx.stroke();
        }
      }
      ctx.restore();
    }

    // Velvet dark void transition overlay
    if (this.darkVoidAlpha > 0.01) {
      ctx.save();
      ctx.globalAlpha = Math.min(1.0, this.darkVoidAlpha);
      ctx.fillStyle = '#06020a';
      ctx.fillRect(0, 0, this.width, this.height);
      ctx.restore();
    }
  }

  drawStardust(ctx) {
    for (const p of this.stardust) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.fillStyle = p.color;

      if (p.type === 'star') {
        const s = p.size;
        ctx.fillRect(Math.round(p.x - s / 2), Math.round(p.y - 1), s, 2);
        ctx.fillRect(Math.round(p.x - 1), Math.round(p.y - s / 2), 2, s);
      } else {
        ctx.fillRect(Math.round(p.x - p.size / 2), Math.round(p.y - p.size / 2), p.size, p.size);
      }
      ctx.restore();
    }
  }

  drawAlice(ctx) {
    if (this.aliceAlpha <= 0.01) return;

    ctx.save();
    ctx.globalAlpha = this.aliceAlpha;
    ctx.translate(Math.round(this.aliceX), Math.round(this.aliceY));
    ctx.rotate(this.aliceAngle);
    ctx.scale(this.aliceScale, this.aliceScale);

    // Ethereal glowing aura around Alice
    const auraGrad = ctx.createRadialGradient(0, -20, 10, 0, -20, 52);
    auraGrad.addColorStop(0, 'rgba(255, 126, 187, 0.40)');
    auraGrad.addColorStop(0.5, 'rgba(255, 215, 0, 0.18)');
    auraGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = auraGrad;
    ctx.beginPath();
    ctx.arc(0, -20, 52, 0, Math.PI * 2);
    ctx.fill();

    // Draw Alice sprite
    let img = null;
    if (this.aliceRef && this.aliceRef.sprites) {
      const list = (this.state === 'leap' || Math.sin(this.timer * 2) > 0)
        ? this.aliceRef.sprites.jump_r
        : this.aliceRef.sprites.fall_r;
      if (list && list.length > 0) {
        img = list[Math.min(2, list.length - 1)];
      }
    }
    if (!img || !img.complete || img.naturalWidth === 0) {
      img = (this.state === 'leap' || Math.sin(this.timer * 2) > 0)
        ? this.floatSprite
        : this.fallSprite;
    }
    if (img && img.complete && img.naturalWidth > 0) {
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(img, -24, -58, 48, 64);
    } else {
      ctx.fillStyle = '#163a6e';
      ctx.fillRect(-8, -32, 16, 22);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-6, -30, 12, 14);
      ctx.fillStyle = '#100b16';
      ctx.fillRect(-10, -46, 20, 16);
    }
    ctx.restore();
  }
}
