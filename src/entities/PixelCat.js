/**
 * Authentic Retro 2D Pixel Cat (ToffeeCraft Mega Pack)
 * 
 * Features:
 * - 7 authentic breeds (ginger tabby, calico, classical grey, white, black, siamese, brown)
 * - 1:1 pixel art resolution (32x32) perfectly matching retro canvas (480x270)
 * - Living AI behaviors:
 *   1. 'idle': sitting comfortably, breathing, ear twitches, tail swishing (7 frames)
 *   2. 'walk': trotting along patrol path
 *   3. 'hop': playful springy cat leap (13 frames)
 *   4. 'sit_watch': stops and turns towards Alice when she walks by
 *   5. 'purr': purrs and emits floating pixel hearts (♥) when Alice comes close
 * - Soft ground shadow anchored to pavement
 */
export class PixelCat {
  static spriteCache = {};

  constructor({
    x = 100,
    groundY = 224,
    breed = 'classical',
    patrolRange = [x - 30, x + 30],
    facing = 1,
    audio = null
  } = {}) {
    this.x = x;
    this.y = groundY;
    this.groundY = groundY;
    this.breed = breed;
    this.patrolRange = patrolRange;
    this.facing = facing;
    this.audio = audio;

    this.state = 'idle'; // 'idle', 'walk', 'hop', 'sit_watch', 'purr'
    this.stateTimer = 2.0 + Math.random() * 3.0;
    this.animTimer = Math.random() * 0.5;
    this.animIndex = 0;
    this.hopProgress = 0;
    this.hopStartX = x;
    this.hopTargetX = x;

    this.hasPurredForAlice = false;
    this.isPetted = false;
    this.isFollowing = false;
    this.followSlot = 0;
    this.followTimer = 0;
    this.hearts = [];
    this.sparkles = [];

    this.loadSprites();
  }

  loadSprites() {
    if (!PixelCat.spriteCache[this.breed]) {
      const idleImg = new Image();
      idleImg.src = `./assets/cats/${this.breed}/idle.png`;

      const jumpImg = new Image();
      jumpImg.src = `./assets/cats/${this.breed}/jump.png`;

      PixelCat.spriteCache[this.breed] = {
        idle: idleImg,
        jump: jumpImg,
        loaded: false
      };

      let count = 0;
      const onLoad = () => {
        count++;
        if (count >= 2) {
          PixelCat.spriteCache[this.breed].loaded = true;
        }
      };
      idleImg.onload = onLoad;
      jumpImg.onload = onLoad;
    }
  }

  get sprites() {
    return PixelCat.spriteCache[this.breed];
  }

  setAudio(audio) {
    this.audio = audio;
  }

  spawnHeart() {
    this.hearts.push({
      x: this.x + (Math.random() * 12 - 6),
      y: this.groundY - 24,
      vy: -0.45 - Math.random() * 0.35,
      vx: (Math.random() - 0.5) * 0.3,
      alpha: 1.0,
      life: 0,
      maxLife: 1.4 + Math.random() * 0.4
    });
  }

  spawnSparkle() {
    this.sparkles.push({
      x: this.x + (Math.random() * 16 - 8),
      y: this.groundY - 18 - Math.random() * 10,
      vy: -0.35 - Math.random() * 0.35,
      vx: (Math.random() - 0.5) * 0.4,
      alpha: 1.0,
      color: Math.random() > 0.4 ? '#ffd166' : '#fff0b3',
      life: 0,
      maxLife: 1.2 + Math.random() * 0.4
    });
  }

  pet(alice) {
    this.isPetted = true;
    this.isFollowing = true; // Permanent loyal follower in this city!
    this.state = 'purr';
    this.stateTimer = 1.8;
    if (alice) {
      this.facing = alice.x >= this.x ? 1 : -1;
    }
    // Hearts and sparkles burst
    for (let i = 0; i < 6; i++) {
      this.spawnHeart();
    }
    for (let i = 0; i < 6; i++) {
      this.spawnSparkle();
    }
    if (this.audio) {
      this.audio.playCatPurr();
      setTimeout(() => {
        if (this.audio) this.audio.playCatMeow();
      }, 260);
    }
  }

  update(delta = 0.016, alice = null, followSlotIndex = 0, isDeparture = false, departureSpotX = null) {
    this.animTimer += delta;

    // Update floating heart particles
    for (let i = this.hearts.length - 1; i >= 0; i--) {
      const h = this.hearts[i];
      h.life += delta;
      h.x += h.vx;
      h.y += h.vy;
      h.alpha = Math.max(0, 1.0 - h.life / h.maxLife);
      if (h.life >= h.maxLife) {
        this.hearts.splice(i, 1);
      }
    }

    // Update floating sparkle particles
    for (let i = this.sparkles.length - 1; i >= 0; i--) {
      const s = this.sparkles[i];
      s.life += delta;
      s.x += s.vx;
      s.y += s.vy;
      s.alpha = Math.max(0, 1.0 - s.life / s.maxLife);
      if (s.life >= s.maxLife) {
        this.sparkles.splice(i, 1);
      }
    }

    // Active loyal follow behavior when petted («Кошачий хвостик»)
    if (this.isFollowing) {
      // 1. Departure sequence: cats gather neatly at tarmac edge and bid farewell
      if (isDeparture && departureSpotX !== null) {
        const targetX = departureSpotX - (followSlotIndex * 15);
        const diffX = targetX - this.x;
        if (Math.abs(diffX) > 4) {
          this.facing = diffX > 0 ? 1 : -1;
          const speed = Math.min(85, Math.max(35, Math.abs(diffX) * 2.5));
          this.x += Math.sign(diffX) * speed * delta;
          this.state = 'walk';
          const walkFrames = [0, 1, 10, 11, 12, 0];
          const walkStep = Math.floor((this.animTimer / 0.10) % walkFrames.length);
          this.animIndex = walkFrames[walkStep];
        } else {
          this.state = 'sit_watch';
          this.facing = 1; // Facing the departing airplane / cliff
          this.animIndex = Math.floor((this.animTimer / 0.20) % 7);
          if (Math.random() < 0.03) {
            this.spawnHeart();
          }
        }
        return;
      }

      // 2. Train follow behind Alice
      if (alice) {
        const slotDist = 18 + followSlotIndex * 14;
        const aliceFacing = alice.facing || 1;
        const targetX = alice.x + (aliceFacing === 1 ? -slotDist : slotDist);
        const diffX = targetX - this.x;

        if (Math.abs(diffX) > 4) {
          this.facing = diffX > 0 ? 1 : -1;
          // Scale speed according to Alice's speed and distance
          let followSpeed = 60;
          if (alice.state === 'run') {
            followSpeed = 120;
          } else if (alice.state === 'walk') {
            followSpeed = 70;
          }
          if (Math.abs(diffX) > 70) {
            followSpeed = Math.min(150, Math.max(followSpeed, Math.abs(diffX) * 2.6));
          }

          this.x += Math.sign(diffX) * followSpeed * delta;
          this.state = 'walk';
          const walkFrames = [0, 1, 10, 11, 12, 0];
          const frameDuration = Math.max(0.06, 0.12 - (followSpeed / 150) * 0.06);
          const walkStep = Math.floor((this.animTimer / frameDuration) % walkFrames.length);
          this.animIndex = walkFrames[walkStep];

          // Playful hop if Alice jumps nearby
          if (alice.y < this.groundY - 14 && Math.abs(diffX) < 26 && this.state !== 'hop' && Math.random() < 0.08) {
            this.state = 'hop';
            this.hopProgress = 0;
            this.hopStartX = this.x;
            this.hopTargetX = this.x + this.facing * 16;
          }
        } else {
          // Arrived at slot in line! Sit comfortably and watch
          this.state = 'sit_watch';
          this.facing = alice.facing || 1;
          const frameDuration = 0.20;
          this.animIndex = Math.floor((this.animTimer / frameDuration) % 7);
          if (Math.random() < 0.018) {
            this.spawnHeart();
          }
        }
        return;
      }
    }

    // Proximity to Alice
    let distToAlice = 9999;
    if (alice) {
      distToAlice = Math.hypot(alice.x - this.x, (alice.y || this.groundY) - this.groundY);
    }

    // Passive reaction to Alice: close petting / purring
    if (alice && distToAlice < 34) {
      if (!this.hasPurredForAlice) {
        this.hasPurredForAlice = true;
        this.state = 'purr';
        this.stateTimer = 2.4;
        this.facing = alice.x >= this.x ? 1 : -1;
        this.spawnHeart();
        this.spawnHeart();
        if (this.audio) {
          this.audio.playCatPurr();
          if (Math.random() < 0.6) {
            setTimeout(() => {
              if (this.audio) this.audio.playCatMeow();
            }, 320);
          }
        }
      }
    } else if (alice && distToAlice < 68) {
      // Alice is walking by: pause and look at her
      if (this.state !== 'purr') {
        this.state = 'sit_watch';
        this.facing = alice.x >= this.x ? 1 : -1;
      }
    } else if (distToAlice > 90) {
      this.hasPurredForAlice = false;
      if (this.state === 'sit_watch') {
        this.state = 'idle';
        this.stateTimer = 1.5 + Math.random() * 2.0;
      }
    }

    // State machine updates
    this.stateTimer -= delta;

    if (this.state === 'idle') {
      // Idle animation: 7 frames, 140ms per frame
      const frameDuration = 0.14;
      this.animIndex = Math.floor((this.animTimer / frameDuration) % 7);

      if (this.stateTimer <= 0) {
        const roll = Math.random();
        if (roll < 0.45 && this.patrolRange) {
          // Start walking patrol
          this.state = 'walk';
          this.stateTimer = 1.8 + Math.random() * 2.2;
          // Pick direction
          if (this.x <= this.patrolRange[0] + 5) this.facing = 1;
          else if (this.x >= this.patrolRange[1] - 5) this.facing = -1;
          else this.facing = Math.random() < 0.5 ? 1 : -1;
        } else if (roll < 0.70 && this.patrolRange) {
          // Playful short hop
          this.state = 'hop';
          this.hopProgress = 0;
          this.hopStartX = this.x;
          const jumpDist = (20 + Math.random() * 16) * this.facing;
          this.hopTargetX = Math.max(this.patrolRange[0], Math.min(this.patrolRange[1], this.x + jumpDist));
        } else {
          // Keep resting / tail swishing
          this.stateTimer = 2.0 + Math.random() * 3.0;
          if (Math.random() < 0.3) {
            this.facing = -this.facing;
          }
        }
      }
    } else if (this.state === 'walk') {
      // Smooth pacing stride along ground
      const walkSpeed = 18; // px / sec
      this.x += this.facing * walkSpeed * delta;

      // Keep within patrol bounds
      if (this.patrolRange) {
        if (this.x <= this.patrolRange[0]) {
          this.x = this.patrolRange[0];
          this.facing = 1;
        } else if (this.x >= this.patrolRange[1]) {
          this.x = this.patrolRange[1];
          this.facing = -1;
        }
      }

      // Walk cycle uses trot sequence [0, 1, 10, 11, 12, 0] from jump sheet
      const walkFrames = [0, 1, 10, 11, 12, 0];
      const frameDuration = 0.11;
      const walkStep = Math.floor((this.animTimer / frameDuration) % walkFrames.length);
      this.animIndex = walkFrames[walkStep];

      if (this.stateTimer <= 0) {
        this.state = 'idle';
        this.stateTimer = 2.5 + Math.random() * 3.5;
      }
    } else if (this.state === 'hop') {
      // Springy cat leap: 13 frames over ~0.85s
      const hopDuration = 0.85;
      this.hopProgress += delta / hopDuration;
      const t = Math.min(1.0, this.hopProgress);

      this.x = this.hopStartX + (this.hopTargetX - this.hopStartX) * t;
      // Parabolic jump arc (up to 9px in air)
      const arc = Math.sin(t * Math.PI) * 9;
      this.y = this.groundY - arc;

      this.animIndex = Math.min(12, Math.floor(t * 13));

      if (t >= 1.0) {
        this.y = this.groundY;
        this.state = 'idle';
        this.stateTimer = 1.5 + Math.random() * 2.5;
      }
    } else if (this.state === 'sit_watch') {
      // Cat sitting upright and calmly watching
      this.y = this.groundY;
      const frameDuration = 0.20;
      this.animIndex = Math.floor((this.animTimer / frameDuration) % 7);
    } else if (this.state === 'purr') {
      this.y = this.groundY;
      const frameDuration = 0.12;
      this.animIndex = Math.floor((this.animTimer / frameDuration) % 7);

      if (Math.random() < 0.05) {
        this.spawnHeart();
      }

      if (this.stateTimer <= 0) {
        this.state = 'sit_watch';
      }
    }
  }

  draw(ctx, cameraX = 0) {
    const sprites = this.sprites;
    if (!sprites || !sprites.idle || !sprites.jump) return;

    const screenX = Math.round(this.x - cameraX);
    const screenY = Math.round(this.y);

    // Render soft grounded shadow
    ctx.save();
    ctx.fillStyle = 'rgba(18, 10, 26, 0.32)';
    ctx.beginPath();
    ctx.ellipse(screenX, this.groundY - 1, 9, 2.2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Select sprite sheet & frame
    let sheet = sprites.idle;
    let frame = this.animIndex;

    if (this.state === 'hop' || this.state === 'walk') {
      sheet = sprites.jump;
    }

    if (!sheet.complete || sheet.naturalWidth === 0) return;

    // Sprite is 32x32, with cat bottom at Y ~30
    const drawX = screenX - 16;
    const drawY = screenY - 30;

    ctx.save();
    // Pixel-perfect crisp rendering
    ctx.imageSmoothingEnabled = false;

    if (this.facing === -1) {
      ctx.translate(drawX + 32, drawY);
      ctx.scale(-1, 1);
      ctx.drawImage(sheet, frame * 32, 0, 32, 32, 0, 0, 32, 32);
    } else {
      ctx.drawImage(sheet, frame * 32, 0, 32, 32, drawX, drawY, 32, 32);
    }
    ctx.restore();

    // Render cute floating pixel hearts
    if (this.hearts.length > 0) {
      for (const h of this.hearts) {
        const hx = Math.round(h.x - cameraX);
        const hy = Math.round(h.y);
        ctx.save();
        ctx.globalAlpha = h.alpha;

        // Draw 5x5 crisp pixel heart:
        //  . # . # .
        //  # # # # #
        //  # # # # #
        //  . # # # .
        //  . . # . .
        ctx.fillStyle = '#ff4382';
        ctx.fillRect(hx - 2, hy - 2, 2, 2);
        ctx.fillRect(hx + 1, hy - 2, 2, 2);
        ctx.fillRect(hx - 2, hy, 5, 2);
        ctx.fillRect(hx - 1, hy + 2, 3, 1);
        ctx.fillRect(hx, hy + 3, 1, 1);

        // Pixel highlight
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(hx - 1, hy - 1, 1, 1);

        ctx.restore();
      }
    }

    // Render cute floating golden sparkles
    if (this.sparkles && this.sparkles.length > 0) {
      for (const s of this.sparkles) {
        const sx = Math.round(s.x - cameraX);
        const sy = Math.round(s.y);
        ctx.save();
        ctx.globalAlpha = s.alpha;
        ctx.fillStyle = s.color || '#ffd166';
        // 5x5 pixel star:
        ctx.fillRect(sx, sy - 2, 1, 5);
        ctx.fillRect(sx - 2, sy, 5, 1);
        ctx.fillRect(sx - 1, sy - 1, 3, 3);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(sx, sy, 1, 1);
        ctx.restore();
      }
    }
  }
}
