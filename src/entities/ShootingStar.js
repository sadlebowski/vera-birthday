/**
 * Romantic Interactive Shooting Star («Загадай желание»)
 * 
 * Features:
 * - Streaks across evening/night skies with a luminous particle trail
 * - Catches via Spacebar [ Пробел ] or direct click/touch on the screen
 * - On catch: sparkling stardust firework burst + magical chime
 * - Displays romantic banner: "✨ Загадай желание... Пусть оно обязательно сбудется ✨"
 */
export class ShootingStar {
  constructor({ audio = null } = {}) {
    this.audio = audio;
    this.active = false;
    this.x = 0;
    this.y = 0;
    this.vx = 0;
    this.vy = 0;
    this.trail = [];
    this.burstParticles = [];

    // Timing
    this.spawnTimer = 2.5; // First star appears 2.5s after starting!
    this.wishBannerTimer = 0;
    this.wishMade = false; // Permanent once caught
    this.gameStarted = false;
    this.pulseTimer = 0;
  }

  setAudio(audio) {
    this.audio = audio;
  }

  spawn(cameraX = 0, viewportWidth = 480) {
    if (this.wishMade) return;
    this.active = true;
    this.x = cameraX + viewportWidth * 0.95;
    this.y = 15 + Math.random() * 25;
    this.vx = -(115 + Math.random() * 25); // Smooth glide across entire sky (~3.5-4s)
    this.vy = 32 + Math.random() * 15;
    this.trail = [];

    // Next star interval if missed: only 6 to 8.5 seconds!
    this.spawnTimer = 6.0 + Math.random() * 2.5;
  }

  catch() {
    if (!this.active || this.wishMade) return;
    this.active = false;
    this.wishMade = true; // Permanent: never spawn again!
    this.wishBannerTimer = 4.5;

    // Golden & pink stardust burst
    this.burstParticles = [];
    for (let i = 0; i < 38; i++) {
      const angle = (Math.PI * 2 * i) / 38 + (Math.random() - 0.5) * 0.4;
      const speed = 35 + Math.random() * 75;
      this.burstParticles.push({
        x: this.x,
        y: this.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 15,
        alpha: 1.0,
        size: Math.random() > 0.4 ? 2 : 1,
        color: Math.random() > 0.45 ? '#ffd700' : (Math.random() > 0.4 ? '#ff70a6' : '#ffffff'),
        life: 0,
        maxLife: 1.2 + Math.random() * 0.6
      });
    }

    if (this.audio && this.audio.playChime) {
      this.audio.playChime();
    }
  }

  handleClickOrTap(screenX, screenY, cameraX = 0) {
    if (!this.active || this.wishMade) return false;
    // Any click / tap on screen while star is active catches the star!
    this.catch();
    return true;
  }

  update(delta = 0.016, sceneType = 'saransk', cameraX = 0, input = null, viewportWidth = 480) {
    this.pulseTimer += delta * 4;

    // If wish is already made, never spawn new stars!
    if (this.wishMade) {
      this.active = false;
    } else {
      // Allowed in all playable scenes and flight
      const canSpawn = this.gameStarted && !this.active;

      if (canSpawn) {
        this.spawnTimer -= delta;
        if (this.spawnTimer <= 0) {
          this.spawn(cameraX, viewportWidth);
        }
      }

      // Active shooting star motion
      if (this.active) {
        this.x += this.vx * delta;
        this.y += this.vy * delta;

        // Add trailing stardust
        this.trail.push({
          x: this.x,
          y: this.y + (Math.random() - 0.5) * 2,
          alpha: 1.0,
          size: Math.random() > 0.5 ? 2 : 1,
          color: Math.random() > 0.35 ? '#fff3c4' : (Math.random() > 0.5 ? '#ffd700' : '#ffb3c6'),
          life: 0,
          maxLife: 0.35 + Math.random() * 0.20
        });

        // Spacebar / Jump / Action catch input
        const spacePressed = input && (
          input.isSpacePressed ||
          (input.keys && input.keys.space) ||
          (input.consumeJump && input.consumeJump()) ||
          (input.consumeAction && input.consumeAction())
        );

        if (spacePressed) {
          this.catch();
        }

        // Check off-screen
        if (this.x < cameraX - 50 || this.y > 220) {
          this.active = false;
          if (!this.wishMade) {
            this.spawnTimer = 6.0 + Math.random() * 2.5; // Next star comes quickly!
          }
        }
      }
    }

    // Update trail particles
    for (let i = this.trail.length - 1; i >= 0; i--) {
      const p = this.trail[i];
      p.life += delta;
      p.alpha = Math.max(0, 1.0 - p.life / p.maxLife);
      if (p.life >= p.maxLife) {
        this.trail.splice(i, 1);
      }
    }

    // Update burst particles
    for (let i = this.burstParticles.length - 1; i >= 0; i--) {
      const p = this.burstParticles[i];
      p.life += delta;
      p.x += p.vx * delta;
      p.y += p.vy * delta;
      p.vy += 45 * delta; // gentle gravity
      p.vx *= 0.96; // air friction
      p.alpha = Math.max(0, 1.0 - p.life / p.maxLife);
      if (p.life >= p.maxLife) {
        this.burstParticles.splice(i, 1);
      }
    }

    // Wish banner timer
    if (this.wishBannerTimer > 0) {
      this.wishBannerTimer -= delta;
    }
  }

  draw(ctx, cameraX = 0, viewportWidth = 480) {
    // 1. Draw star trail
    if (this.trail.length > 0) {
      ctx.save();
      for (const p of this.trail) {
        const sx = Math.round(p.x - cameraX);
        const sy = Math.round(p.y);
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.fillRect(sx, sy, p.size, p.size);
      }
      ctx.restore();
    }

    // 2. Draw active glowing star head
    if (this.active) {
      const sx = Math.round(this.x - cameraX);
      const sy = Math.round(this.y);

      ctx.save();
      // Outer subtle glow
      ctx.fillStyle = 'rgba(255, 220, 120, 0.4)';
      ctx.fillRect(sx - 3, sy - 3, 7, 7);

      // Golden crosshair star
      ctx.fillStyle = '#ffd700';
      ctx.fillRect(sx - 2, sy, 5, 1);
      ctx.fillRect(sx, sy - 2, 1, 5);
      ctx.fillRect(sx - 1, sy - 1, 3, 3);

      // Bright white core
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(sx, sy, 1, 1);
      ctx.restore();

      // Subtle minimalist prompt while star is flying
      const pulseAlpha = 0.75 + Math.sin(this.pulseTimer) * 0.25;
      ctx.save();
      ctx.font = 'bold 12px "Handjet", "VT323", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';

      const promptText = '[ КЛИК — ЧТОБЫ ПОЙМАТЬ ]';
      const promptX = viewportWidth / 2;
      const promptY = 16;

      // Dark shadow
      ctx.fillStyle = '#100516';
      ctx.fillText(promptText, promptX + 1, promptY + 1);
      ctx.fillText(promptText, promptX - 1, promptY);
      ctx.fillText(promptText, promptX, promptY + 1);

      // Golden shining text
      ctx.globalAlpha = pulseAlpha;
      ctx.fillStyle = '#ffe066';
      ctx.fillText(promptText, promptX, promptY);
      ctx.restore();
    }

    // 3. Draw burst stardust particles
    if (this.burstParticles.length > 0) {
      ctx.save();
      for (const p of this.burstParticles) {
        const sx = Math.round(p.x - cameraX);
        const sy = Math.round(p.y);
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.fillRect(sx, sy, p.size, p.size);
      }
      ctx.restore();
    }

    // 4. Romantic Wish Banner
    if (this.wishBannerTimer > 0) {
      const bannerDuration = 4.0;
      let alpha = 1.0;
      if (this.wishBannerTimer > bannerDuration - 0.4) {
        alpha = (bannerDuration - this.wishBannerTimer) / 0.4;
      } else if (this.wishBannerTimer < 0.8) {
        alpha = this.wishBannerTimer / 0.8;
      }

      const text = '✨ Загадай желание... Пусть оно обязательно сбудется ✨';
      const bx = viewportWidth / 2;
      const by = 26;

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.font = 'bold 14px "Handjet", "VT323", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Soft ribbon backing
      ctx.fillStyle = 'rgba(16, 6, 24, 0.78)';
      const textWidth = ctx.measureText(text).width;
      ctx.fillRect(bx - textWidth / 2 - 10, by - 10, textWidth + 20, 20);

      // Gold border on ribbon
      ctx.strokeStyle = '#ffd166';
      ctx.lineWidth = 1;
      ctx.strokeRect(bx - textWidth / 2 - 10, by - 10, textWidth + 20, 20);

      // Shadow
      ctx.fillStyle = '#000000';
      ctx.fillText(text, bx + 1, by + 1);

      // Text in gradient gold & white
      ctx.fillStyle = '#fff0b3';
      ctx.fillText(text, bx, by);
      ctx.restore();
    }
  }
}
