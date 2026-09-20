/**
 * Highly Detailed 2D Pixel Art Alice (GandalfHardcore Overworld Engine)
 * 
 * Features authentic 16-bit animations:
 * - Idle (5 frames with breathing & swaying dark hair)
 * - Walk (8 smooth cinematic stride frames)
 * - Run (8 dynamic running frames with billowing skirt)
 * - Jump (4 soaring frames)
 * - Fall (4 floating descent frames)
 * - Responsive physics with momentum, walking/running (Shift)
 */
export class PixelAlice {
  constructor(x = 60, y = 220) {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.walkSpeed = 1.35; // Well-balanced, agile, pleasant walk speed
    this.runSpeed = 2.40;  // Brisk responsive run with Shift
    this.accel = 0.22;     // Snappy, immediate controller response
    this.friction = 0.86;  // Clean, crisp stop
    this.jumpForce = -3.30;// Solid, springy leap that easily clears the spine gap
    this.gravity = 0.14;   // Natural platformer gravity
    this.isGrounded = false;
    this.facing = 1; // 1: right, -1: left

    // Frame canvas is 48x64 with feet touching y=64 and center at x=24
    this.width = 48;
    this.height = 64;

    this.state = 'idle'; // 'idle', 'walk', 'run', 'jump', 'fall', 'pet'
    this.frameTimer = 0;
    this.animTime = 0;
    this.animIndex = 0;
    this.petTimer = 0;
    this.isEntering = false;
    this.entranceParticles = [];
    this.audio = null;

    // Sprite frames storage
    this.sprites = {
      idle_r: [],
      idle_l: [],
      walk_r: [],
      walk_l: [],
      run_r: [],
      run_l: [],
      jump_r: [],
      jump_l: [],
      fall_r: [],
      fall_l: []
    };

    this.loadSpriteSheets();
  }

  setAudio(audio) {
    this.audio = audio;
  }

  petCat(cat) {
    if (cat) {
      this.facing = cat.x >= this.x ? 1 : -1;
    }
    this.vx = 0;
    this.state = 'pet';
    this.petTimer = 0.85;
    this.animTime = 0;
    this.animIndex = 0;
  }

  spawnLandingDust(groundY) {
    for (let i = 0; i < 5; i++) {
      this.entranceParticles.push({
        x: this.x + (Math.random() - 0.5) * 12,
        y: groundY - 1,
        vx: (Math.random() - 0.5) * 1.4,
        vy: -Math.random() * 0.9 - 0.3,
        color: Math.random() > 0.5 ? '#f5e8da' : '#eed0d8',
        size: Math.random() > 0.5 ? 2 : 1.5,
        life: 14
      });
    }
  }

  triggerEntrance() {
    this.isEntering = true;
    this.x = -15;
    this.y = 170;
    this.vx = 2.4;
    this.vy = -3.5;
    this.facing = 1;
    this.isGrounded = false;
    this.state = 'jump';
    this.animIndex = 0;
    this.animTime = 0;
    this.entranceParticles = [];
  }

  loadSpriteSheets() {
    const basePath = './assets/alice_gandalf/';
    const loadImg = (src, onDone) => {
      const img = new Image();
      img.src = src;
      img.onload = () => onDone(img);
    };

    // Idle: 5 frames
    for (let i = 0; i < 5; i++) {
      loadImg(`${basePath}alice_idle_r_${i}.png`, (img) => { this.sprites.idle_r[i] = img; });
      loadImg(`${basePath}alice_idle_l_${i}.png`, (img) => { this.sprites.idle_l[i] = img; });
    }

    // Walk: 8 frames
    for (let i = 0; i < 8; i++) {
      loadImg(`${basePath}alice_walk_r_${i}.png`, (img) => { this.sprites.walk_r[i] = img; });
      loadImg(`${basePath}alice_walk_l_${i}.png`, (img) => { this.sprites.walk_l[i] = img; });
    }

    // Run: 8 frames
    for (let i = 0; i < 8; i++) {
      loadImg(`${basePath}alice_run_r_${i}.png`, (img) => { this.sprites.run_r[i] = img; });
      loadImg(`${basePath}alice_run_l_${i}.png`, (img) => { this.sprites.run_l[i] = img; });
    }

    // Jump: 4 frames
    for (let i = 0; i < 4; i++) {
      loadImg(`${basePath}alice_jump_r_${i}.png`, (img) => { this.sprites.jump_r[i] = img; });
      loadImg(`${basePath}alice_jump_l_${i}.png`, (img) => { this.sprites.jump_l[i] = img; });
    }

    // Fall: 4 frames
    for (let i = 0; i < 4; i++) {
      loadImg(`${basePath}alice_fall_r_${i}.png`, (img) => { this.sprites.fall_r[i] = img; });
      loadImg(`${basePath}alice_fall_l_${i}.png`, (img) => { this.sprites.fall_l[i] = img; });
    }
  }

  update(delta = 0.016, input, groundY = 224, maxWorldX = 3100) {
    const dtFactor = Math.min(Math.max(delta, 0.005), 0.05) * 60; // 1.0 at 60 FPS, normalized

    // 0. Opening Entrance Hop Animation
    if (this.isEntering) {
      this.vy += this.gravity * dtFactor;
      this.y += this.vy * dtFactor;
      this.x += this.vx * dtFactor;

      if (this.y >= groundY) {
        this.y = groundY;
        this.vy = 0;
        this.vx = 0;
        this.isGrounded = true;
        this.isEntering = false;
        this.state = 'idle';
        this.animIndex = 0;
        this.animTime = 0;
        if (this.audio) this.audio.playLand();

        // Cute landing dust puff particles
        for (let i = 0; i < 10; i++) {
          this.entranceParticles.push({
            x: this.x + (Math.random() - 0.5) * 16,
            y: groundY - 2,
            vx: (Math.random() - 0.5) * 1.8,
            vy: -Math.random() * 1.5 - 0.4,
            color: Math.random() > 0.5 ? '#fff4dd' : '#ffd1e6',
            size: Math.random() > 0.5 ? 3 : 2,
            life: 22
          });
        }
      } else {
        this.state = this.vy < 0 ? 'jump' : 'fall';
        if (this.state === 'jump') {
          this.animIndex = this.vy < -1.5 ? 0 : 1;
        } else {
          this.animIndex = this.vy < 1.5 ? 2 : 3;
        }
      }
      return;
    }

    // Petting state: crouch down gently for petTimer duration
    if (this.petTimer > 0) {
      this.petTimer -= delta;
      this.vx = 0;
      this.state = 'pet';
      this.animTime += delta;
      if (input.isRight || input.isLeft || input.isJump) {
        this.petTimer = 0; // break out if player actively moves
      } else {
        return;
      }
    }

    let moveX = 0;
    if (input.isRight) moveX += 1;
    if (input.isLeft) moveX -= 1;

    const isRunning = input.isRun && moveX !== 0;
    const currentMaxSpeed = isRunning ? this.runSpeed : this.walkSpeed;
    const previousState = this.state;

    // Horizontal movement
    if (moveX !== 0) {
      this.facing = moveX > 0 ? 1 : -1;
      const targetVx = moveX * currentMaxSpeed;
      this.vx += (targetVx - this.vx) * Math.min(1.0, this.accel * dtFactor);
      if (this.isGrounded) {
        this.state = isRunning ? 'run' : 'walk';
      }
    } else {
      this.vx *= Math.pow(this.friction, dtFactor);
      if (Math.abs(this.vx) < 0.04) {
        this.vx = 0;
        if (this.isGrounded) {
          this.state = 'idle';
        }
      }
    }

    // Jump logic
    if (input.consumeJump() && this.isGrounded) {
      this.vy = this.jumpForce;
      this.isGrounded = false;
      this.state = 'jump';
      this.animIndex = 0;
      this.animTime = 0;
      if (this.audio) this.audio.playJump();
    }

    this.vy += this.gravity * dtFactor;
    this.y += this.vy * dtFactor;
    this.x += this.vx * dtFactor;

    // World boundaries
    if (this.x < 20) {
      this.x = 20;
      this.vx = 0;
    }
    if (this.x > maxWorldX - 30) {
      this.x = maxWorldX - 30;
      this.vx = 0;
    }

    // Ground collision
    if (this.y >= groundY) {
      this.y = groundY;
      this.vy = 0;
      this.isGrounded = true;
      if (this.state === 'jump' || this.state === 'fall') {
        this.state = Math.abs(this.vx) > 0.1 ? (isRunning ? 'run' : 'walk') : 'idle';
        this.animTime = 0;
        if (this.audio) this.audio.playLand();
        this.spawnLandingDust(groundY);
      }
    } else {
      this.isGrounded = false;
      this.state = this.vy < 0 ? 'jump' : 'fall';
    }

    // Reset animTime on state change for instantaneous, responsive feedback
    if (this.state !== previousState && (this.state === 'idle' || this.state === 'walk' || this.state === 'run')) {
      this.animTime = 0;
    }

    // Advance frame timers with strict DELTA-TIME (identical pace across 60Hz, 120Hz, 144Hz+)
    const WALK_FRAME_TIME = 0.095; // 95ms per frame -> 10.5 FPS, perfectly matched to 1.35 walk speed!
    const RUN_FRAME_TIME = 0.065;  // 65ms per frame -> brisk running
    const IDLE_FRAME_TIME = 0.30;  // 300ms per frame -> calm natural breathing
    const FALL_FRAME_TIME = 0.12;  // 120ms per frame

    if (this.state === 'walk') {
      this.animTime += delta;
      if (this.animTime >= WALK_FRAME_TIME) {
        this.animTime -= WALK_FRAME_TIME;
        this.animIndex = (this.animIndex + 1) % 8;
        if ((this.animIndex === 2 || this.animIndex === 6) && this.isGrounded && this.audio) {
          this.audio.playFootstep(false);
        }
      }
    } else if (this.state === 'run') {
      this.animTime += delta;
      if (this.animTime >= RUN_FRAME_TIME) {
        this.animTime -= RUN_FRAME_TIME;
        this.animIndex = (this.animIndex + 1) % 8;
        if ((this.animIndex === 2 || this.animIndex === 6) && this.isGrounded && this.audio) {
          this.audio.playFootstep(true);
        }
      }
    } else if (this.state === 'idle') {
      this.animTime += delta;
      if (this.animTime >= IDLE_FRAME_TIME) {
        this.animTime -= IDLE_FRAME_TIME;
        this.animIndex = (this.animIndex + 1) % 5;
      }
    } else if (this.state === 'jump') {
      // 4 frames in row 3 based on vertical velocity
      if (this.vy < -2.0) this.animIndex = 0;
      else if (this.vy < -0.8) this.animIndex = 1;
      else if (this.vy < 0.8) this.animIndex = 2;
      else this.animIndex = 3;
    } else if (this.state === 'fall') {
      this.animTime += delta;
      if (this.animTime >= FALL_FRAME_TIME) {
        this.animTime -= FALL_FRAME_TIME;
        this.animIndex = (this.animIndex + 1) % 4;
      }
    }
  }

  draw(ctx) {
    let frame = null;
    const isRight = this.facing === 1;

    let frameList = null;
    let offsetY = 0;
    if (this.state === 'jump') {
      frameList = isRight ? this.sprites.jump_r : this.sprites.jump_l;
    } else if (this.state === 'fall') {
      frameList = isRight ? this.sprites.fall_r : this.sprites.fall_l;
    } else if (this.state === 'run') {
      frameList = isRight ? this.sprites.run_r : this.sprites.run_l;
    } else if (this.state === 'walk') {
      frameList = isRight ? this.sprites.walk_r : this.sprites.walk_l;
    } else if (this.state === 'pet') {
      frameList = isRight ? this.sprites.walk_r : this.sprites.walk_l;
      offsetY = 4 + Math.sin(this.animTime * 12) * 1.2;
    } else {
      frameList = isRight ? this.sprites.idle_r : this.sprites.idle_l;
    }

    if (frameList && frameList.length > 0) {
      if (this.state === 'pet') {
        frame = frameList[1] || frameList[0];
      } else {
        frame = frameList[this.animIndex % frameList.length];
      }
    }

    ctx.save();
    // Soft contact shadow under Alice's feet firmly anchoring her to the pavement
    if (this.isGrounded || this.state === 'idle' || this.state === 'walk' || this.state === 'run' || this.state === 'pet') {
      ctx.fillStyle = 'rgba(15, 10, 20, 0.40)';
      ctx.beginPath();
      ctx.ellipse(Math.round(this.x), Math.round(this.y), 10.5, 3.0, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Feet touch this.y, center is at this.x
    const drawX = Math.round(this.x - 24);
    const drawY = Math.round(this.y - 64 + offsetY);

    if (frame && frame.complete && frame.naturalWidth > 0) {
      ctx.drawImage(frame, drawX, drawY);
    } else {
      // Clean fallback silhouette
      ctx.fillStyle = '#163a6e';
      ctx.fillRect(drawX + 16, drawY + 28, 16, 20);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(drawX + 18, drawY + 30, 12, 14);
      ctx.fillStyle = '#100b16';
      ctx.fillRect(drawX + 14, drawY + 16, 20, 14);
    }

    // Draw cute landing dust puff particles
    if (this.entranceParticles && this.entranceParticles.length > 0) {
      for (let i = this.entranceParticles.length - 1; i >= 0; i--) {
        const p = this.entranceParticles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life--;
        ctx.fillStyle = p.color;
        ctx.fillRect(Math.round(p.x), Math.round(p.y), p.size, p.size);
        if (p.life <= 0) this.entranceParticles.splice(i, 1);
      }
    }

    ctx.restore();
  }
}
