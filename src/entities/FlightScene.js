/**
 * FlightScene: Interactive 2D Pixel Art Cinematic Flight on Page 2
 * 
 * Features:
 * - Dynamic flight sky themes:
 *   1. 'night' (Saransk -> Moscow): Midnight starry sky, multi-colored twinkling stars, dark nocturnal clouds
 *   2. 'day' (Moscow -> Israel): Bright azure Mediterranean sky, radiant glowing sun, fluffy white cumulus clouds, white contrails
 *   3. 'sunset' (Israel -> Barcelona): Fiery golden/crimson Catalan sunset, sinking evening sun, amber clouds & golden contrails
 *   4. 'twilight' (Barcelona -> Saransk): Romantic pink/purple dusk, early evening stars
 * - Interactive player vertical control (Up/Down or W/S or Ц/Ы) with smooth damping & dynamic pitch tilt
 * - Airplane entrance animation from off-screen left (x < 0)
 * - Contrail / engine exhaust particles matching current flight atmosphere
 * - Navigation beacon strobes & wingtip glints
 * - Flight exit: plane throttles up, climbs and zooms completely off-screen right
 * - onFlightComplete callback triggered ONLY AFTER the plane is completely off-screen
 */
export class FlightScene {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.ctx.imageSmoothingEnabled = false;
    this.width = canvas.width || 480;
    this.height = canvas.height || 270;

    // Plane state
    this.plane = {
      x: -160,
      y: 135,
      targetY: 135,
      vy: 0,
      vx: 0,
      pitch: 0,
      state: 'entering', // 'entering' -> 'flying' -> 'exiting' -> 'done'
      timer: 0,
      exhaustParticles: []
    };

    this.theme = 'night'; // 'night' | 'day' | 'sunset' | 'twilight'
    this.targetScene = 'moscow';
    this.flightDuration = 9.0; // seconds of interactive flight
    this.onFlightComplete = null;
    this.isComplete = false;

    // Assets
    this.photoFlightPlane = null;
    this.photoG6 = null;
    this.clouds3 = [];
    this.clouds8 = [];
    this.stars = [];

    // Gulfstream G650 ('G6') encounter
    this.g6Jet = {
      active: false,
      triggered: false,
      x: 550,
      y: 75,
      vx: -350,
      exhaustParticles: []
    };

    this.initStars();
    this.loadAssets();
  }

  initStars() {
    this.stars = [];
    for (let i = 0; i < 65; i++) {
      this.stars.push({
        x: Math.random() * this.width,
        y: Math.random() * (this.height - 40),
        size: Math.random() > 0.82 ? 2 : 1,
        color: Math.random() > 0.5 ? '#ffffff' : (Math.random() > 0.5 ? '#ffd3e2' : '#ffea79'),
        speed: 0.15 + Math.random() * 0.25,
        twinkleOffset: Math.random() * Math.PI * 2
      });
    }
  }

  loadAssets() {
    const loadImg = (src, cb) => {
      const img = new Image();
      img.onload = () => cb(img);
      img.src = src;
    };

    // Airplane flight sprite
    loadImg('./assets/photos/airplane_flight_pixel.png', (img) => {
      this.photoFlightPlane = img;
    });

    // Gulfstream G650 flight sprite
    loadImg('./assets/photos/airplane_g6_pixel.png', (img) => {
      this.photoG6 = img;
    });

    // Cloud layers (Clouds 3 night set: 1 to 4)
    this.clouds3 = [];
    for (let i = 1; i <= 4; i++) {
      loadImg(`./assets/clouds/clouds3/${i}.png`, (img) => {
        this.clouds3[i - 1] = img;
      });
    }

    // Fluffy cloud layers (Clouds 8 set: 1 to 6)
    this.clouds8 = [];
    for (let i = 1; i <= 6; i++) {
      loadImg(`./assets/clouds/clouds8/${i}.png`, (img) => {
        this.clouds8[i - 1] = img;
      });
    }
  }

  start(quick = false, targetScene = 'moscow') {
    this.flightDuration = quick ? 2.2 : 9.0;
    this.targetScene = targetScene;

    const urlParams = new URLSearchParams(window.location.search);
    const forcedTheme = urlParams.get('flight_theme');

    if (forcedTheme) {
      this.theme = forcedTheme;
    } else if (targetScene === 'israel') {
      this.theme = 'day'; // Bright Mediterranean day flight
    } else if (targetScene === 'barcelona') {
      this.theme = 'sunset'; // Radiant golden sunset flight
    } else if (targetScene === 'saransk') {
      this.theme = 'twilight'; // Twilight return flight
    } else {
      this.theme = 'night'; // Starry night flight to Moscow
    }

    this.plane.x = -160;
    this.plane.y = 135;
    this.plane.targetY = 135;
    this.plane.vy = 0;
    this.plane.vx = 0;
    this.plane.pitch = 0;
    this.plane.state = 'entering';
    this.plane.timer = 0;
    this.plane.exhaustParticles = [];
    this.isComplete = false;

    // Reset G6 jet encounter for Israel flight
    this.g6Jet = {
      active: false,
      triggered: false,
      x: this.width + 120,
      y: 75,
      vx: quick ? -550 : -350,
      exhaustParticles: []
    };
  }

  update(delta, input) {
    if (this.isComplete) return;

    const p = this.plane;
    p.timer += delta;

    // 1. Entrance phase: fly in from left to x = 90
    if (p.state === 'entering') {
      p.x += (90 - p.x) * (delta * 3.5);
      p.pitch = -0.04;
      if (p.x >= 88) {
        p.x = 90;
        p.state = 'flying';
        p.timer = 0;
      }
    }
    // 2. Interactive flight phase: player controls UP/DOWN
    else if (p.state === 'flying') {
      // Input handling (W / S / Up / Down / Russian Ц / Ы)
      let moveY = 0;
      if (input && (input.isUp || input.keys?.up || input.rawKeys?.['KeyW'] || input.rawKeys?.['ArrowUp'])) {
        moveY -= 1;
      }
      if (input && (input.isDown || input.keys?.down || input.rawKeys?.['KeyS'] || input.rawKeys?.['ArrowDown'])) {
        moveY += 1;
      }

      // Vertical movement with smooth damping
      const accel = 180;
      if (moveY !== 0) {
        p.vy += moveY * accel * delta;
      } else {
        p.vy *= 0.90; // drag damping
      }

      // Max vertical speed
      p.vy = Math.max(-95, Math.min(95, p.vy));
      p.y += p.vy * delta;

      // Soft natural atmospheric turbulence bobbing
      const bob = Math.sin(p.timer * 2.5) * 4 * delta;
      p.y += bob;

      // Clamp vertical bounds (keep safely in sky)
      const minY = 35;
      const maxY = 210;
      if (p.y < minY) {
        p.y = minY;
        p.vy = 0;
      }
      if (p.y > maxY) {
        p.y = maxY;
        p.vy = 0;
      }

      // Dynamic pitch tilt: tilts nose up/down based on vertical velocity
      const targetPitch = (p.vy / 95) * 0.12;
      p.pitch += (targetPitch - p.pitch) * (delta * 6.0);

      // Check if flight time has elapsed -> trigger exit!
      if (p.timer >= this.flightDuration) {
        p.state = 'exiting';
        p.vx = 40;
      }
    }
    // 3. Exit phase: plane accelerates and zooms completely off screen!
    else if (p.state === 'exiting') {
      p.vx += 180 * delta; // rapid acceleration
      p.x += p.vx * delta;
      p.pitch += (-0.08 - p.pitch) * (delta * 4.0); // slight climb

      // Trigger completion ONLY WHEN plane is completely off screen
      if (p.x > this.width + 120 && !this.isComplete) {
        this.isComplete = true;
        p.state = 'done';
        if (this.onFlightComplete) {
          this.onFlightComplete();
        }
      }
    }

    // Gulfstream G650 ('G6') encounter when flying from Moscow to Israel!
    if (this.targetScene === 'israel') {
      if (!this.g6Jet.triggered && p.timer >= (this.flightDuration * 0.40)) {
        this.g6Jet.triggered = true;
        this.g6Jet.active = true;
        this.g6Jet.x = this.width + 80;
        // Position in clear sky above player's plane so both planes and the face are 100% visible
        this.g6Jet.y = Math.max(25, Math.min(60, p.y - 75));
      }

      if (this.g6Jet.active) {
        this.g6Jet.x += this.g6Jet.vx * delta;

        // Twin white condensation contrails from rear Rolls-Royce engines
        if (Math.random() > 0.15) {
          const trailBaseX = this.g6Jet.x + 117;
          const trailBaseY = this.g6Jet.y + 31;
          for (const offsetY of [-2, 2]) {
            this.g6Jet.exhaustParticles.push({
              x: trailBaseX,
              y: trailBaseY + offsetY + (Math.random() - 0.5) * 2,
              vx: 45 + Math.random() * 20,
              vy: (Math.random() - 0.5) * 3,
              color: Math.random() > 0.25 ? '#ffffff' : '#e1f5fe',
              size: Math.random() > 0.4 ? 3.0 : 1.8,
              alpha: 0.85
            });
          }
        }

        if (this.g6Jet.x < -220) {
          this.g6Jet.active = false;
        }
      }

      // Update G6 contrail particles
      for (let i = this.g6Jet.exhaustParticles.length - 1; i >= 0; i--) {
        const ep = this.g6Jet.exhaustParticles[i];
        ep.x += ep.vx * delta;
        ep.y += ep.vy * delta;
        ep.alpha -= delta * 1.5;
        ep.size += delta * 1.2;
        if (ep.alpha <= 0) {
          this.g6Jet.exhaustParticles.splice(i, 1);
        }
      }
    }

    // Engine exhaust contrail / spark particles matching theme
    if (Math.random() > 0.30 && p.state !== 'done') {
      let pColor = '#ffffff';
      let pSize = Math.random() > 0.5 ? 2 : 1;
      let pAlpha = 0.85;

      if (this.theme === 'day') {
        // Pure white condensation vapor trail (contrail)
        pColor = Math.random() > 0.35 ? '#ffffff' : '#e1f5fe';
        pSize = Math.random() > 0.4 ? 3 : 2;
        pAlpha = 0.75;
      } else if (this.theme === 'sunset') {
        // Golden-amber & coral sunset contrails
        pColor = Math.random() > 0.4 ? '#ffe082' : (Math.random() > 0.5 ? '#ffab91' : '#ffd54f');
        pSize = Math.random() > 0.5 ? 2.5 : 1.5;
        pAlpha = 0.80;
      } else if (this.theme === 'twilight') {
        pColor = Math.random() > 0.4 ? '#f8bbd0' : (Math.random() > 0.5 ? '#e1bee7' : '#ffffff');
      } else {
        // Night: twinkling sparks
        pColor = Math.random() > 0.4 ? '#ffffff' : (Math.random() > 0.5 ? '#ffd3e2' : '#ff7ebb');
      }

      p.exhaustParticles.push({
        x: p.x + 20,
        y: p.y - 12 + (Math.random() - 0.5) * 5,
        vx: -55 - Math.random() * 30,
        vy: (Math.random() - 0.5) * 7,
        color: pColor,
        size: pSize,
        alpha: pAlpha,
        life: this.theme === 'day' ? 34 : 26
      });
    }

    for (let i = p.exhaustParticles.length - 1; i >= 0; i--) {
      const ep = p.exhaustParticles[i];
      ep.x += ep.vx * delta;
      ep.y += ep.vy * delta;
      ep.alpha -= delta * 1.6;
      if (this.theme === 'day') {
        ep.size += delta * 1.2; // soft contrail expansion
      }
      if (ep.alpha <= 0) {
        p.exhaustParticles.splice(i, 1);
      }
    }

    // Update stars (drift left slowly during night/twilight)
    if (this.theme === 'night' || this.theme === 'twilight') {
      this.stars.forEach(s => {
        s.x -= s.speed;
        if (s.x < -10) s.x = this.width + 10;
      });
    }
  }

  render() {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    ctx.clearRect(0, 0, w, h);
    const time = Date.now() * 0.001;

    // 1. SKY BACKGROUND PER THEME
    if (this.theme === 'day') {
      // Vivid Mediterranean Daytime Sky: Cobalt -> Azure -> Pale sunlit haze
      const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
      skyGrad.addColorStop(0, '#0d47a1');   // Deep cobalt
      skyGrad.addColorStop(0.35, '#1e88e5'); // Brilliant azure
      skyGrad.addColorStop(0.70, '#64b5f6'); // Sky blue
      skyGrad.addColorStop(1.0, '#e3f2fd');  // Bright sunlit horizon
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, w, h);

      // Radiant Glowing Sun at x = 385, y = 46
      const sunX = 385;
      const sunY = 46;
      const sunGlow = ctx.createRadialGradient(sunX, sunY, 8, sunX, sunY, 85);
      sunGlow.addColorStop(0, 'rgba(255, 255, 255, 0.55)');
      sunGlow.addColorStop(0.35, 'rgba(255, 248, 210, 0.28)');
      sunGlow.addColorStop(0.75, 'rgba(227, 242, 253, 0.12)');
      sunGlow.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = sunGlow;
      ctx.beginPath();
      ctx.arc(sunX, sunY, 85, 0, Math.PI * 2);
      ctx.fill();

      // Blazing sun core
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(sunX, sunY, 15, 0, Math.PI * 2);
      ctx.fill();

    } else if (this.theme === 'sunset') {
      // Radiant Mediterranean Sunset: Royal Violet -> Crimson -> Fiery Orange -> Golden Dusk
      const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
      skyGrad.addColorStop(0, '#2b0b3e');    // Deep royal violet
      skyGrad.addColorStop(0.28, '#641348'); // Rich magenta-plum
      skyGrad.addColorStop(0.55, '#b83431'); // Fiery sunset crimson
      skyGrad.addColorStop(0.78, '#f57c00'); // Glowing amber-orange
      skyGrad.addColorStop(1.0, '#ffd54f');  // Golden dusk horizon
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, w, h);

      // Setting Sun sinking towards the horizon at x = 75, y = 175
      const sunX = 75;
      const sunY = 175;
      const sunGlow = ctx.createRadialGradient(sunX, sunY, 10, sunX, sunY, 68);
      sunGlow.addColorStop(0, 'rgba(255, 235, 170, 0.65)');
      sunGlow.addColorStop(0.40, 'rgba(255, 150, 50, 0.35)');
      sunGlow.addColorStop(1, 'rgba(255, 100, 30, 0)');
      ctx.fillStyle = sunGlow;
      ctx.beginPath();
      ctx.arc(sunX, sunY, 68, 0, Math.PI * 2);
      ctx.fill();

      // Setting Sun disc
      ctx.fillStyle = '#fff4d6';
      ctx.beginPath();
      ctx.arc(sunX, sunY, 17, 0, Math.PI * 2);
      ctx.fill();

    } else if (this.theme === 'twilight') {
      // Romantic Purple-Lavender Dusk Sky
      const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
      skyGrad.addColorStop(0, '#1c0a35');
      skyGrad.addColorStop(0.35, '#4a1240');
      skyGrad.addColorStop(0.70, '#8e24aa');
      skyGrad.addColorStop(1.0, '#f48fb1');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, w, h);

      // Early evening twinkle stars
      this.stars.forEach(s => {
        const twinkle = Math.sin(time * 3 + s.twinkleOffset) * 0.25 + 0.65;
        ctx.fillStyle = s.color;
        ctx.globalAlpha = twinkle * 0.65;
        ctx.fillRect(Math.round(s.x), Math.round(s.y), s.size, s.size);
      });
      ctx.globalAlpha = 1.0;

    } else {
      // Night Sky (Default): Midnight Indigo -> Deep Violet -> Wine Twilight
      const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
      skyGrad.addColorStop(0, '#0c071a');
      skyGrad.addColorStop(0.40, '#170c2e');
      skyGrad.addColorStop(0.75, '#2e1245');
      skyGrad.addColorStop(1.0, '#541d44');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, w, h);

      // Twinkling Stars
      this.stars.forEach(s => {
        const twinkle = Math.sin(time * 3 + s.twinkleOffset) * 0.3 + 0.7;
        ctx.fillStyle = s.color;
        ctx.globalAlpha = twinkle;
        ctx.fillRect(Math.round(s.x), Math.round(s.y), s.size, s.size);
      });
      ctx.globalAlpha = 1.0;
    }

    // 2. PARALLAX CLOUD LAYERS PER THEME
    if (this.theme === 'day') {
      // White daytime cumulus clouds
      // Layer 1: Distant wispy clouds (Clouds 8 - 1.png)
      if (this.clouds8[0] && this.clouds8[0].complete) {
        const img = this.clouds8[0];
        const speed = 10;
        const offsetX = -((time * speed) % w);
        ctx.save();
        ctx.globalAlpha = 0.40;
        ctx.drawImage(img, Math.round(offsetX), -10, w, h);
        ctx.drawImage(img, Math.round(offsetX + w), -10, w, h);
        ctx.restore();
      }

      // Layer 2: Midground fluffy white clouds (Clouds 8 - 3.png)
      if (this.clouds8[2] && this.clouds8[2].complete) {
        const img = this.clouds8[2];
        const speed = 24;
        const offsetX = -((time * speed) % w);
        ctx.save();
        ctx.globalAlpha = 0.60;
        ctx.drawImage(img, Math.round(offsetX), 10, w, h);
        ctx.drawImage(img, Math.round(offsetX + w), 10, w, h);
        ctx.restore();
      }

      // Layer 3: Foreground drifting cumulus (Clouds 8 - 5.png)
      if (this.clouds8[4] && this.clouds8[4].complete) {
        const img = this.clouds8[4];
        const speed = 48;
        const offsetX = -((time * speed) % w);
        ctx.save();
        ctx.globalAlpha = 0.55;
        ctx.drawImage(img, Math.round(offsetX), 25, w, h);
        ctx.drawImage(img, Math.round(offsetX + w), 25, w, h);
        ctx.restore();
      }

    } else if (this.theme === 'sunset') {
      // Golden / amber sunset clouds
      // Layer 1: Distant golden clouds (Clouds 8 - 2.png)
      if (this.clouds8[1] && this.clouds8[1].complete) {
        const img = this.clouds8[1];
        const speed = 11;
        const offsetX = -((time * speed) % w);
        ctx.save();
        ctx.globalAlpha = 0.50;
        ctx.drawImage(img, Math.round(offsetX), -5, w, h);
        ctx.drawImage(img, Math.round(offsetX + w), -5, w, h);
        ctx.restore();
      }

      // Layer 2: Midground warm amber clouds (Clouds 8 - 3.png)
      if (this.clouds8[2] && this.clouds8[2].complete) {
        const img = this.clouds8[2];
        const speed = 25;
        const offsetX = -((time * speed) % w);
        ctx.save();
        ctx.globalAlpha = 0.55;
        ctx.drawImage(img, Math.round(offsetX), 12, w, h);
        ctx.drawImage(img, Math.round(offsetX + w), 12, w, h);
        ctx.restore();
      }

      // Layer 3: Foreground deep plum/coral clouds (Clouds 8 - 6.png)
      if (this.clouds8[5] && this.clouds8[5].complete) {
        const img = this.clouds8[5];
        const speed = 48;
        const offsetX = -((time * speed) % w);
        ctx.save();
        ctx.globalAlpha = 0.52;
        ctx.drawImage(img, Math.round(offsetX), 20, w, h);
        ctx.drawImage(img, Math.round(offsetX + w), 20, w, h);
        ctx.restore();
      }

    } else {
      // Night / Twilight Clouds
      // Layer 1: Distant subtle clouds (Clouds 3 - 3.png)
      if (this.clouds3[2] && this.clouds3[2].complete) {
        const img = this.clouds3[2];
        const speed = 12;
        const offsetX = -((time * speed) % w);
        ctx.save();
        ctx.globalAlpha = 0.55;
        ctx.drawImage(img, Math.round(offsetX), 0, w, h);
        ctx.drawImage(img, Math.round(offsetX + w), 0, w, h);
        ctx.restore();
      }

      // Layer 2: Midground clouds (Clouds 8 - 3.png)
      if (this.clouds8[2] && this.clouds8[2].complete) {
        const img = this.clouds8[2];
        const speed = 26;
        const offsetX = -((time * speed) % w);
        ctx.save();
        ctx.globalAlpha = 0.40;
        ctx.drawImage(img, Math.round(offsetX), 15, w, h);
        ctx.drawImage(img, Math.round(offsetX + w), 15, w, h);
        ctx.restore();
      }

      // Layer 3: Foreground fast puffy clouds (Clouds 3 - 4.png)
      if (this.clouds3[3] && this.clouds3[3].complete) {
        const img = this.clouds3[3];
        const speed = 48;
        const offsetX = -((time * speed) % w);
        ctx.save();
        ctx.globalAlpha = 0.50;
        ctx.drawImage(img, Math.round(offsetX), 20, w, h);
        ctx.drawImage(img, Math.round(offsetX + w), 20, w, h);
        ctx.restore();
      }
    }

    // 3. ENGINE EXHAUST CONTRAILS & SPARK PARTICLES
    const p = this.plane;
    p.exhaustParticles.forEach(ep => {
      ctx.fillStyle = ep.color;
      ctx.globalAlpha = Math.max(0, Math.min(1, ep.alpha));
      if (this.theme === 'day') {
        ctx.beginPath();
        ctx.arc(Math.round(ep.x), Math.round(ep.y), Math.max(1, ep.size), 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillRect(Math.round(ep.x), Math.round(ep.y), Math.max(1, ep.size), Math.max(1, ep.size));
      }
    });
    ctx.globalAlpha = 1.0;

    // 3.5. GULFSTREAM G650 CONTRAIL PARTICLES
    if (this.g6Jet.exhaustParticles.length > 0) {
      this.g6Jet.exhaustParticles.forEach(ep => {
        ctx.fillStyle = ep.color;
        ctx.globalAlpha = Math.max(0, Math.min(1, ep.alpha));
        ctx.beginPath();
        ctx.arc(Math.round(ep.x), Math.round(ep.y), Math.max(1, ep.size), 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1.0;
    }

    // 4. DRAW AIRPLANE
    if (this.photoFlightPlane && this.photoFlightPlane.complete) {
      ctx.save();
      ctx.translate(Math.round(p.x + 110), Math.round(p.y - 35));
      ctx.rotate(p.pitch);

      ctx.drawImage(this.photoFlightPlane, -110, -35, 220, 75);

      // Blinking Navigation Beacon Lights
      // Tail strobe (flashes every 1.0s)
      const strobeOn = (Math.floor(time * 2.5) % 2 === 0);
      if (strobeOn) {
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#ffffff';
        ctx.shadowBlur = this.theme === 'day' ? 3 : 6;
        ctx.fillRect(-104, -22, 3, 3);
      }

      // Top red beacon (pulses)
      const redPulse = Math.sin(time * 4) * 0.3 + 0.7;
      ctx.fillStyle = `rgba(255, 30, 60, ${redPulse})`;
      ctx.shadowColor = '#ff1e3c';
      ctx.shadowBlur = this.theme === 'day' ? 2 : 4;
      ctx.fillRect(-30, 3, 3, 3);

      // Right wing green beacon (steady)
      ctx.fillStyle = '#00ff96';
      ctx.shadowColor = '#00ff96';
      ctx.shadowBlur = this.theme === 'day' ? 2 : 4;
      ctx.fillRect(20, -2, 3, 3);

      ctx.restore();
    }

    // 4.5. DRAW GULFSTREAM G650 ('G6') JET (Flying in opposite direction!)
    if (this.g6Jet.active && this.photoG6 && this.photoG6.complete) {
      const gx = Math.round(this.g6Jet.x);
      const gy = Math.round(this.g6Jet.y);
      ctx.save();
      ctx.drawImage(this.photoG6, gx, gy, 180, 41);

      // Flashing navigation lights on G6
      // Tail strobe on T-tail (flashes rapidly)
      if (Math.floor(time * 3.0) % 2 === 0) {
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#ffffff';
        ctx.shadowBlur = 3;
        ctx.fillRect(gx + 120, gy + 8, 2, 2);
      }
      // Wingtip navigation red light on winglet
      ctx.fillStyle = '#ff1e3c';
      ctx.shadowColor = '#ff1e3c';
      ctx.shadowBlur = 3;
      ctx.fillRect(gx + 175, gy + 29, 2, 2);
      ctx.shadowBlur = 0;

      ctx.restore();
    }

    // 5. FLIGHT HUD / CONTROL HINT (Minimalist, disappears after 3.2s)
    if (p.state === 'flying' && p.timer < 3.2) {
      const hintAlpha = Math.min(1.0, (3.2 - p.timer) * 1.5);
      ctx.save();
      ctx.globalAlpha = hintAlpha;

      let boxBg = 'rgba(25, 12, 35, 0.75)';
      let boxBorder = 'rgba(255, 215, 80, 0.6)';
      let textCol = '#ffffff';

      if (this.theme === 'day') {
        boxBg = 'rgba(13, 71, 161, 0.75)';
        boxBorder = 'rgba(187, 222, 251, 0.8)';
      } else if (this.theme === 'sunset') {
        boxBg = 'rgba(60, 15, 40, 0.78)';
        boxBorder = 'rgba(255, 213, 79, 0.8)';
      }

      ctx.fillStyle = boxBg;
      ctx.strokeStyle = boxBorder;
      ctx.lineWidth = 1;
      const hintW = 170;
      const hintH = 22;
      const hx = Math.round((w - hintW) / 2);
      const hy = h - 32;
      ctx.fillRect(hx, hy, hintW, hintH);
      ctx.strokeRect(hx, hy, hintW, hintH);

      ctx.fillStyle = textCol;
      ctx.font = '10px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('▲ / ▼  УПРАВЛЕНИЕ', w / 2, hy + 15);
      ctx.restore();
    }
  }
}
