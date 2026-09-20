/**
 * BarcelonaScene: 2D Pixel Art Catalan Modernisme & Mediterranean Adventure
 * 
 * Journey through Barcelona:
 * 1. Touchdown on coastal El Prat runway in golden hour sunset light, stop at x = 70
 * 2. Stroll along warm sidewalk paved with iconic Panot de Flor tiles under plane trees & stone pines
 * 3. Arc de Triomf in red brick Neo-Mudéjar style (1888) (x = 480)
 * 4. Casa Batlló on Passeig de Gràcia — Gaudí's dragon roof & trencadís facade (1906) (x = 850)
 * 5. Park Güell fairy-tale gingerbread pavilion with mosaic spire (1914) (x = 1220)
 * 6. Casa Milà / La Pedrera undulating stone corner facade (1910) (x = 1600)
 * 7. Sagrada Família Nativity towers soaring into the sunset sky (x = 2000)
 * 8. Mirador de Colom monument at Port Vell pointing to sea (1888) (x = 2360)
 * 9. Vera's Festive Birthday Cake, Confetti & Golden/Scarlet Fireworks (x = 2660)
 * 10. Departure Airliner on sunset runway for the next adventure (x = 2950)
 */

import { PixelCat } from './PixelCat.js';

export class BarcelonaScene {
  constructor(config = {}) {
    this.config = config;
    this.worldWidth = 2960;
    this.groundY = 220; // Road / sidewalk surface level
    this.aliceGroundY = 224;

    // Landmark sequence (Iconic Gaudí & Catalan Modernisme)
    this.landmarks = [
      {
        id: 'arc_triomf',
        x: 480,
        title: 'Триумфальная арка',
        type: 'arc_triomf',
        w: 180,
        h: 168
      },
      {
        id: 'casa_batllo',
        x: 850,
        title: 'Дом Бальо',
        type: 'casa_batllo',
        w: 135,
        h: 202
      },
      {
        id: 'park_guell',
        x: 1220,
        title: 'Парк Гуэль',
        type: 'park_guell',
        w: 135,
        h: 180
      },
      {
        id: 'casa_mila',
        x: 1600,
        title: 'Дом Мила',
        type: 'casa_mila',
        w: 185,
        h: 172
      },
      {
        id: 'sagrada_familia',
        x: 2000,
        title: 'Саграда Фамилия',
        type: 'sagrada_familia',
        w: 190,
        h: 220
      },
      {
        id: 'colom_monument',
        x: 2360,
        title: 'Памятник Колумбу',
        type: 'colom_monument',
        w: 86,
        h: 210
      }
    ];

    // Flying seagulls over the sea & city
    this.seagulls = [
      { x: 200, y: 45, vx: 1.5, flapTimer: 0 },
      { x: 720, y: 52, vx: 1.8, flapTimer: 1.4 },
      { x: 1380, y: 40, vx: 1.6, flapTimer: 2.1 },
      { x: 2180, y: 55, vx: 1.9, flapTimer: 0.7 },
      { x: 2820, y: 48, vx: 1.4, flapTimer: 1.8 }
    ];

    // Distant sailboats on the sea horizon
    this.sailboats = [
      { x: 380, speed: 0.22 },
      { x: 1020, speed: 0.18 },
      { x: 1850, speed: 0.25 },
      { x: 2560, speed: 0.20 }
    ];

    // Airplane landing state machine:
    // 'approaching' -> 'landing' -> 'touchdown' -> 'taxi' -> 'parked' -> 'disembarking' -> 'complete'
    this.airplane = {
      x: -300,
      y: 95,
      vx: 1.45,
      vy: 0.65,
      state: 'approaching',
      initialDelay: 80, // ~1.33 seconds of peaceful initial location view
      rot: -3,
      propAngle: 0,
      disembarkTimer: 0,
      aliceYOffset: 0,
      touchdownSparks: []
    };

    this.landingComplete = false;
    this.onLandingComplete = null;

    // Finale: Book Edge & Zero-G Cosmic Leap
    this.bookEdgeX = 2920;
    this.onCosmicLeap = null;
    this.cosmicLeapTriggered = false;

    // Street furniture & Flora coordinates
    this.planeTrees = [340, 680, 1020, 1420, 1780, 2180, 2520];
    this.stonePines = [580, 960, 1340, 1700, 2100, 2460];
    this.palmTrees = [300, 740, 1120, 1500, 1880, 2260, 2580];
    this.streetlamps = [380, 720, 1080, 1480, 1860, 2240, 2600];
    this.planters = [420, 810, 1180, 1560, 1950, 2320, 2620];

    // Foreground Depth Layer elements (top y = 0, bottom y = 270)
    this.fgCanopies = [220, 600, 980, 1360, 1740, 2120, 2500, 2880];
    this.fgStreetlamps = [200, 560, 940, 1310, 1690, 2060, 2440, 2820];
    this.fgPlanters = [380, 750, 1120, 1500, 1880, 2250, 2630];

    // Active inspection
    this.activeLandmark = null;
    this.inspectedLandmark = null;
    this.promptPulse = 0;

    // Birthday letter modal
    this.showBirthdayLetter = false;
    this.showDepartureLetter = false;
    this.cakeCandlesLit = true;
    this.cakeBlownOut = false;

    // Celebration particles (golden, scarlet, orange, white)
    this.fireworks = [];
    this.confetti = [];
    this.cakeSparks = [];

    this.loadAllTextures();
  }

  loadAllTextures() {
    const load = (src) => {
      const img = new Image();
      img.src = src;
      return img;
    };

    // Landmarks
    this.photoArcTriomf = load('./assets/photos/barcelona_arc_de_triomf_pixel.png');
    this.photoCasaBatllo = load('./assets/photos/barcelona_casa_batllo_pixel.png');
    this.photoParkGuell = load('./assets/photos/barcelona_park_guell_pixel.png');
    this.photoCasaMila = load('./assets/photos/barcelona_casa_mila_pixel.png');
    this.photoSagradaFamilia = load('./assets/photos/barcelona_sagrada_familia_pixel.png');
    this.photoColomMonument = load('./assets/photos/barcelona_colom_monument_pixel.png');
    this.photoCake = load('./assets/photos/barcelona_cake_pixel.png');

    // Pavement & Flora
    this.photoPanotPavement = load('./assets/photos/barcelona_panot_pavement.png');
    this.photoPlaneTree = load('./assets/photos/barcelona_plane_tree.png');
    this.photoStonePine = load('./assets/photos/barcelona_stone_pine.png');
    this.photoPalmTree = load('./assets/photos/barcelona_palm_tree.png');
    this.photoStreetlamp = load('./assets/photos/barcelona_streetlamp.png');
    this.photoPlanterOleander = load('./assets/photos/barcelona_planter_oleander.png');

    // Background Architecture (Authentic Catalan Modernisme & Gothic facades)
    this.photoBgFuster = load('./assets/photos/barcelona_bg_fuster.png');
    this.photoBgFusterFlip = load('./assets/photos/barcelona_bg_fuster_flip.png');
    this.photoBgAmatller = load('./assets/photos/barcelona_bg_amatller.png');
    this.photoBgPunxes = load('./assets/photos/barcelona_bg_punxes.png');
    this.photoBgCluster = load('./assets/photos/barcelona_bg_cluster.png');

    // Foreground Depth
    this.photoFgCanopy = load('./assets/photos/barcelona_fg_canopy.png');
    this.photoFgStreetlamp = load('./assets/photos/barcelona_fg_streetlamp.png');
    this.photoFgPot = load('./assets/photos/barcelona_fg_pot.png');
    this.photoFgRailing = load('./assets/photos/barcelona_fg_railing.png');

    // Airplanes
    this.photoAirplaneTarmac = load('./assets/photos/airplane_tarmac_pixel.png');
    this.photoAirplaneBoarded = load('./assets/photos/airplane_tarmac_boarded_pixel.png');
    this.photoAirplaneFlight = load('./assets/photos/airplane_flight_pixel.png');

    // Sky parallax layers from City 4 (layers 1 to 5, 7, 8)
    this.skyLayers = [];
    const layerIndices = [1, 2, 3, 4, 5, 7, 8];
    for (const idx of layerIndices) {
      this.skyLayers.push(load(`./assets/sky/barcelona_sky_${idx}.png`));
    }

    // Cute living pixel cats across Barcelona
    this.cats = [
      new PixelCat({
        x: 880, // Near Casa Batlló
        groundY: this.aliceGroundY,
        breed: 'calico',
        patrolRange: [850, 910],
        facing: -1
      }),
      new PixelCat({
        x: 1250, // Park Güell gingerbread pavilion
        groundY: this.aliceGroundY,
        breed: 'black',
        patrolRange: [1220, 1280],
        facing: 1
      }),
      new PixelCat({
        x: 2020, // Sagrada Família
        groundY: this.aliceGroundY,
        breed: 'white',
        patrolRange: [1990, 2050],
        facing: -1
      })
    ];

    // Cat petting gameplay state
    this.nearbyCat = null;
    this.catsToastTimer = 0;
    this.catsCelebrated = false;
  }

  update(delta, alice, input) {
    this.promptPulse += 0.08;

    // Update living pixel cats and find nearby cat for petting
    this.nearbyCat = null;
    let minCatDist = 9999;

    if (this.cats) {
      const followingCats = this.cats.filter(c => c.isFollowing);
      const isDeparture = alice && alice.x >= 2780;
      const departureSpotX = 2760;

      for (const cat of this.cats) {
        if (this.audio && !cat.audio) cat.setAudio(this.audio);
        const slotIdx = followingCats.indexOf(cat);
        cat.update(delta, alice, slotIdx >= 0 ? slotIdx : 0, isDeparture, departureSpotX);

        if (alice && typeof alice === 'object') {
          const dist = Math.hypot(alice.x - cat.x, (alice.y || this.aliceGroundY) - cat.groundY);
          if (dist < 38 && dist < minCatDist) {
            minCatDist = dist;
            this.nearbyCat = cat;
          }
        }
      }
    }

    if (this.catsToastTimer > 0) {
      this.catsToastTimer -= delta;
    }

    // Check petting input (E / У, or F / Action if near cat and no landmark active)
    const petTriggered = (input && input.consumePet && input.consumePet());
    const actionNearCat = (this.nearbyCat && !this.activeLandmark && input && input.actionPressed);

    if ((petTriggered || actionNearCat) && this.nearbyCat && alice && typeof alice === 'object') {
      if (actionNearCat && input.consumeAction) input.consumeAction();
      const cat = this.nearbyCat;
      const wasFirstPet = !cat.isPetted;
      cat.pet(alice);
      if (alice.petCat) alice.petCat(cat);

      if (wasFirstPet) {
        const pettedCount = this.cats.filter(c => c.isPetted).length;
        if (pettedCount === this.cats.length && !this.catsCelebrated) {
          this.catsCelebrated = true;
          this.catsToastTimer = 3.6;
          if (this.audio && this.audio.playChime) {
            this.audio.playChime();
          }
        }
      }
    }

    // 1. Update landing plane
    this.updateArrivalAirplane(alice);

    // 2. Check Book Edge & Space Jump into Zero-G
    if (alice && typeof alice === 'object' && this.landingComplete) {
      if (this.cosmicLeaping) {
        // Physical leap across the edge of the book
        alice.x += alice.vx;
        alice.y += alice.vy;
        alice.vy += 0.14; // gravity
        alice.facing = 1;
        alice.state = 'jump';

        // Camera smoothly follows Alice's leap
        if (alice.x >= 2940) {
          this.cosmicLeaping = false;
          if (this.onCosmicLeap) {
            this.onCosmicLeap(alice);
          }
        }
      } else if (!this.cosmicLeapTriggered) {
        if (alice.x >= 2935) {
          alice.x = 2935;
        }
        if (alice.x >= 2800) {
          if (input && (input.isJump || input.consumeJump() || (input.keys && (input.keys.jump || input.keys['Space'] || input.keys[' '])))) {
            this.cosmicLeapTriggered = true;
            this.cosmicLeaping = true;
            alice.vx = 2.4;
            alice.vy = -3.8;
            alice.isGrounded = false;
            alice.facing = 1;
            alice.state = 'jump';
            if (this.audio) {
              this.audio.playJump();
            }
          }
        }
      }
    }

    // 3. Update atmosphere
    this.updateAtmosphere(delta);

    // 4. Update landmarks interaction
    this.updateLandmarksProximity(alice, input);

    // 5. Update celebration effects
    this.updateCelebrationParticles();
  }

  updateArrivalAirplane(alice) {
    const plane = this.airplane;

    if (plane.state === 'approaching') {
      plane.initialDelay--;
      if (plane.initialDelay <= 0) {
        plane.state = 'landing';
        plane.x = -220;
        plane.y = 95;
        plane.vx = 1.45;
        plane.vy = 0.65;
        plane.rot = -3;
      }
      return;
    }

    if (plane.state === 'landing') {
      plane.propAngle = (plane.propAngle + 0.40) % (Math.PI * 2);
      plane.x += plane.vx;
      plane.y += plane.vy;

      if (plane.y >= 220) {
        plane.y = 220;
        plane.state = 'touchdown';
        plane.vy = 0;
        plane.rot = 0;
        if (this.audio) this.audio.playPlaneTouchdown();

        // Smoke puffs upon touchdown
        for (let i = 0; i < 28; i++) {
          plane.touchdownSparks.push({
            x: plane.x + 115 + (Math.random() - 0.5) * 20,
            y: this.groundY - 3,
            vx: -Math.random() * 2.5 - 1.0,
            vy: -Math.random() * 1.5 - 0.2,
            size: Math.random() * 3 + 2,
            color: Math.random() > 0.5 ? '#ffffff' : '#cfd8dc',
            alpha: 1.0,
            life: 45
          });
        }
      }
    } else if (plane.state === 'touchdown' || plane.state === 'taxi') {
      plane.propAngle = (plane.propAngle + 0.30) % (Math.PI * 2);
      plane.state = 'taxi';
      plane.x += plane.vx;
      plane.vx *= 0.965; // Gentle, smooth, unhurried rollout deceleration

      if (Math.random() > 0.4 && plane.vx > 0.3) {
        plane.touchdownSparks.push({
          x: plane.x + 115,
          y: this.groundY - 2,
          vx: -plane.vx * 0.4,
          vy: -Math.random() * 0.8,
          size: Math.random() * 2 + 1,
          color: '#cfd8dc',
          alpha: 0.7,
          life: 25
        });
      }

      if (plane.vx < 0.05 || plane.x >= 70) {
        plane.x = 70;
        plane.vx = 0;
        plane.rot = 0;
        plane.state = 'parked';
        plane.disembarkTimer = 0;
      }
    } else if (plane.state === 'parked') {
      plane.disembarkTimer++;
      if (plane.disembarkTimer > 45) {
        plane.state = 'disembarking';
        plane.aliceYOffset = 0;
        alice.x = plane.x + 54;
        alice.y = this.aliceGroundY - 26;
        alice.facing = -1;
        alice.state = 'walk';
      }
    } else if (plane.state === 'disembarking') {
      plane.aliceYOffset += 0.35;
      alice.facing = -1;
      alice.state = 'walk';
      alice.frameTimer = (alice.frameTimer || 0) + 1;
      if (alice.frameTimer % 11 === 0) {
        alice.animIndex = (alice.animIndex + 1) % 8;
      }
      const progress = Math.min(1.0, plane.aliceYOffset / 26);
      alice.y = (this.aliceGroundY - 26) + progress * 26;
      alice.x = (plane.x + 54) - progress * 34; // step down stairs to x = 90

      if (progress >= 1.0) {
        alice.x = plane.x + 20; // x = 90
        alice.y = this.aliceGroundY; // 224 firmly on pavement
        alice.facing = 1; // turn right towards Barcelona!
        alice.state = 'idle';
        plane.state = 'complete';
        this.landingComplete = true;
        if (this.onLandingComplete) this.onLandingComplete();
      }
    }

    // Update sparks & smoke
    for (let i = plane.touchdownSparks.length - 1; i >= 0; i--) {
      const p = plane.touchdownSparks[i];
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= 1 / p.life;
      if (p.alpha <= 0) {
        plane.touchdownSparks.splice(i, 1);
      }
    }
  }

  updateAtmosphere(delta) {
    for (const sg of this.seagulls) {
      sg.x += sg.vx;
      sg.flapTimer += 0.15;
      if (sg.x > this.worldWidth + 100) sg.x = -60;
    }

    for (const sb of this.sailboats) {
      sb.x += sb.speed * delta * 8;
      if (sb.x > this.worldWidth + 120) sb.x = -80;
    }
  }

  updateLandmarksProximity(alice, input) {
    if (!alice || typeof alice !== 'object' || !this.landingComplete) return;

    let nearest = null;
    let minDist = 38;

    for (const lm of this.landmarks) {
      const dist = Math.abs(alice.x - lm.x);
      if (dist < minDist) {
        minDist = dist;
        nearest = lm;
      }
    }

    this.activeLandmark = nearest;

    // If player walked away, close inspection automatically
    if (!this.activeLandmark || (this.inspectedLandmark && this.inspectedLandmark.id !== this.activeLandmark.id)) {
      this.inspectedLandmark = null;
    }

    if (input && input.consumeInspect() && this.activeLandmark) {
      if (this.audio) this.audio.playInteract();
      if (this.inspectedLandmark && this.inspectedLandmark.id === this.activeLandmark.id) {
        this.inspectedLandmark = null;
      } else {
        this.inspectedLandmark = this.activeLandmark;
      }
    }
  }

  spawnFireworkBurst(bx, by) {
    const colors = ['#ff9f43', '#ffd700', '#ffffff', '#ff3838', '#ff7ebb'];
    const col = colors[Math.floor(Math.random() * colors.length)];
    for (let i = 0; i < 36; i++) {
      const angle = (i / 36) * Math.PI * 2;
      const speed = 1.6 + Math.random() * 2.5;
      this.fireworks.push({
        x: bx,
        y: by,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: col,
        alpha: 1.0,
        life: 55 + Math.random() * 20
      });
    }
  }

  updateCelebrationParticles() {
    // Fireworks
    for (let i = this.fireworks.length - 1; i >= 0; i--) {
      const f = this.fireworks[i];
      f.x += f.vx;
      f.y += f.vy;
      f.vy += 0.04;
      f.alpha -= 1 / f.life;
      if (f.alpha <= 0) this.fireworks.splice(i, 1);
    }

    // Confetti
    for (let i = this.confetti.length - 1; i >= 0; i--) {
      const c = this.confetti[i];
      c.x += c.vx;
      c.y += c.vy;
      c.vy += c.gravity;
      c.rot += c.vrot;
      if (c.y >= this.groundY - 1) {
        c.y = this.groundY - 1;
        c.vx *= 0.6;
        c.vy = 0;
      }
      c.life--;
      if (c.life <= 0) this.confetti.splice(i, 1);
    }
  }

  /* ================= RENDERING ================= */

  drawBackground(ctx, cameraX, canvasWidth, canvasHeight) {
    this.lastCameraX = cameraX;

    // 1. Layered Pixel Art Sunset Sky & Clouds (City 4 layers)
    this.renderSky(ctx, cameraX, canvasWidth, canvasHeight);

    // 2. Mediterranean Sea Horizon with Sailboats
    this.renderSeaHorizon(ctx, cameraX, canvasWidth);

    // 3. Distant Catalan Architecture (Parallax 0.35 & 0.52, 100% solid)
    this.renderDistantArchitecture(ctx, cameraX, canvasWidth);

    // 4. Seagulls Gliding
    this.renderSeagulls(ctx, cameraX);
  }

  renderSky(ctx, cameraX, canvasWidth, canvasHeight) {
    // Radiant warm orange sunset gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, this.groundY);
    skyGrad.addColorStop(0, '#e65100');    // deep rich sunset amber-orange
    skyGrad.addColorStop(0.45, '#ff9800'); // radiant golden amber
    skyGrad.addColorStop(1.0, '#ffe0b2');  // glowing warm peach-gold horizon
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Parallax rendering for City 4 layers (576 x 324)
    // Layers:
    // [0]: base sky gradient
    // [1]: sunset clouds
    // [2]: high skyline silhouette
    // [3]: mid skyline silhouette
    // [4]: low skyline
    const layerConfigs = [
      { idx: 0, factor: 0.02, y: -20 },
      { idx: 1, factor: 0.06, y: -15 },
      { idx: 2, factor: 0.12, y: -10 },
      { idx: 3, factor: 0.18, y: -5 },
      { idx: 4, factor: 0.25, y: 0 }
    ];

    for (const cfg of layerConfigs) {
      const img = this.skyLayers[cfg.idx];
      if (img && img.complete) {
        const pX = -((cameraX * cfg.factor) % 576);
        const startX = pX > 0 ? pX - 576 : pX;
        for (let x = startX; x < canvasWidth + 576; x += 576) {
          ctx.drawImage(img, Math.round(x), cfg.y, 576, 270);
        }
      }
    }
  }

  renderSeaHorizon(ctx, cameraX, canvasWidth) {
    const seaY = 178;
    const seaH = this.groundY - seaY;
    if (seaH <= 0) return;

    // Mediterranean Sea warm golden sunset gradient
    const seaGrad = ctx.createLinearGradient(0, seaY, 0, seaY + seaH);
    seaGrad.addColorStop(0, '#00838f');    // deep turquoise horizon
    seaGrad.addColorStop(0.4, '#00acc1');  // vibrant warm blue
    seaGrad.addColorStop(0.8, '#4dd0e1');  // sunlit water
    seaGrad.addColorStop(1.0, '#ffcc80');  // warm sunset reflection
    ctx.fillStyle = seaGrad;
    ctx.fillRect(0, seaY, canvasWidth, seaH);

    // Sea ripples & golden sunset glimmer
    ctx.fillStyle = 'rgba(255, 243, 224, 0.6)';
    for (let i = 0; i < 18; i++) {
      const wx = ((i * 43 + cameraX * 0.22) % (canvasWidth + 80)) - 40;
      const wy = seaY + 3 + (i % 5) * 4;
      ctx.fillRect(Math.round(wx), wy, 9 + (i % 4) * 4, 1);
    }

    // Sailboats gliding on horizon
    for (const sb of this.sailboats) {
      const sx = Math.round(sb.x - cameraX * 0.32);
      if (sx >= -40 && sx <= canvasWidth + 40) {
        this.renderSailboat(ctx, sx, seaY + 12);
      }
    }

    // GROUND THE CITY: Solid stone promenade seawall & sidewalk foundation
    // Along the city segment (x = 280 .. 2750), a solid stone embankment from y = 195 to groundY (220)
    // completely covers water under the buildings.
    let cityEmbankmentAlpha = 1.0;
    if (cameraX < 280) {
      cityEmbankmentAlpha = Math.max(0, Math.min(1, (cameraX - 100) / 180));
    } else if (cameraX > 2500) {
      cityEmbankmentAlpha = Math.max(0, Math.min(1, 1 - (cameraX - 2500) / 180));
    }

    if (cityEmbankmentAlpha > 0) {
      ctx.save();
      ctx.globalAlpha = cityEmbankmentAlpha;
      const embY = 195;
      const embH = this.groundY - embY + 2;
      ctx.fillStyle = '#bcaaa4'; // stone seawall base
      ctx.fillRect(0, embY, canvasWidth, embH);
      ctx.fillStyle = '#d7ccc8'; // stone sidewalk terrace
      ctx.fillRect(0, embY + 2, canvasWidth, embH - 2);

      // Stone parapet cap
      ctx.fillStyle = '#8d6e63';
      ctx.fillRect(0, embY, canvasWidth, 2);
      ctx.fillStyle = '#5d4037';
      ctx.fillRect(0, embY + 2, canvasWidth, 1);
      ctx.restore();
    }
  }

  renderSailboat(ctx, x, y) {
    ctx.save();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(x - 5, y);
    ctx.lineTo(x + 5, y);
    ctx.lineTo(x + 3, y + 2);
    ctx.lineTo(x - 3, y + 2);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#37474f';
    ctx.fillRect(x, y - 9, 1, 9);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.beginPath();
    ctx.moveTo(x + 1, y - 8);
    ctx.lineTo(x + 6, y - 2);
    ctx.lineTo(x + 1, y - 2);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  renderDistantArchitecture(ctx, cameraX, canvasWidth) {
    let runwayAlpha = 1.0;
    if (cameraX < 280) {
      runwayAlpha = Math.max(0, Math.min(1, (cameraX - 100) / 180));
    } else if (cameraX > 2500) {
      runwayAlpha = Math.max(0, Math.min(1, 1 - (cameraX - 2500) / 180));
    }
    if (runwayAlpha <= 0) return;

    const baselineY = this.groundY + 2;

    // LAYER 1: FAR HORIZON SKYLINE (Parallax 0.35x, softly blurred 0.6px for atmospheric depth)
    if (this.photoBgCluster && this.photoBgCluster.complete) {
      ctx.save();
      ctx.globalAlpha = 1.0 * runwayAlpha;
      ctx.filter = 'blur(0.6px)';
      const pFar = 0.35;
      const clusterW = 640;
      const clusterH = 155;
      const clusterPositions = [200, 840, 1480, 2120, 2760];

      for (const wx of clusterPositions) {
        const sx = Math.round(wx - cameraX * pFar);
        if (sx >= -clusterW && sx <= canvasWidth + 50) {
          ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
          ctx.fillRect(sx, baselineY - 2, clusterW, 4);
          ctx.drawImage(this.photoBgCluster, sx, baselineY - clusterH, clusterW, clusterH);
        }
      }
      ctx.restore();
    }

    // LAYER 2: MID-GROUND CATALAN STREETSCAPE (Parallax 0.52x, softly blurred 0.5px for layer depth of field)
    ctx.save();
    ctx.globalAlpha = 1.0 * runwayAlpha;
    ctx.filter = 'blur(0.5px)';
    const pMid = 0.52;

    const midBuildings = [
      { type: 'fuster', x: 260, w: 140, h: 155 },
      { type: 'amatller', x: 375, w: 109, h: 145 },
      { type: 'punxes', x: 470, w: 140, h: 155 },
      { type: 'fuster_flip', x: 590, w: 140, h: 155 },
      { type: 'fuster', x: 710, w: 140, h: 155 },
      { type: 'amatller', x: 825, w: 109, h: 145 },
      { type: 'punxes', x: 920, w: 140, h: 155 },
      { type: 'fuster_flip', x: 1040, w: 140, h: 155 },
      { type: 'fuster', x: 1160, w: 140, h: 155 },
      { type: 'amatller', x: 1275, w: 109, h: 145 },
      { type: 'punxes', x: 1370, w: 140, h: 155 },
      { type: 'fuster_flip', x: 1490, w: 140, h: 155 },
      { type: 'fuster', x: 1610, w: 140, h: 155 },
      { type: 'amatller', x: 1725, w: 109, h: 145 },
      { type: 'punxes', x: 1820, w: 140, h: 155 },
      { type: 'fuster_flip', x: 1940, w: 140, h: 155 },
      { type: 'fuster', x: 2060, w: 140, h: 155 },
      { type: 'amatller', x: 2175, w: 109, h: 145 },
      { type: 'punxes', x: 2270, w: 140, h: 155 },
      { type: 'fuster_flip', x: 2390, w: 140, h: 155 },
      { type: 'fuster', x: 2510, w: 140, h: 155 }
    ];

    for (const b of midBuildings) {
      const sx = Math.round(b.x - cameraX * pMid);
      if (sx >= -b.w - 40 && sx <= canvasWidth + 40) {
        let img = this.photoBgFuster;
        if (b.type === 'amatller') img = this.photoBgAmatller;
        else if (b.type === 'punxes') img = this.photoBgPunxes;
        else if (b.type === 'fuster_flip') img = this.photoBgFusterFlip;

        if (img && img.complete) {
          ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
          ctx.fillRect(sx, baselineY - 2, b.w, 4);
          ctx.drawImage(img, sx, baselineY - b.h, b.w, b.h);
        }
      }
    }
    ctx.restore();
  }

  renderSeagulls(ctx, cameraX) {
    ctx.save();
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#37474f';
    ctx.lineWidth = 1;

    for (const sg of this.seagulls) {
      const sx = Math.round(sg.x - cameraX * 0.4);
      if (sx >= -20 && sx <= 500) {
        const wingY = Math.sin(sg.flapTimer) * 2.5;
        ctx.beginPath();
        ctx.moveTo(sx - 4, sg.y + wingY);
        ctx.quadraticCurveTo(sx - 2, sg.y - 3, sx, sg.y);
        ctx.quadraticCurveTo(sx + 2, sg.y - 3, sx + 4, sg.y + wingY);
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  drawMidground(ctx, cameraX, canvasWidth, canvasHeight) {
    // 1. SOLID GROUND & PANOT DE FLOR PAVEMENT (y = 220 to 275)
    this.renderGround(ctx, cameraX, canvasWidth, canvasHeight);

    // 2. VEGETATION: Plane Trees, Stone Pines, Oleander Planters
    this.renderVegetation(ctx, cameraX);

    // 3. THE 6 ICONIC BARCELONA LANDMARKS (100% Grounded)
    this.renderLandmarks(ctx, cameraX);

    // 4. MODERNISME STREETLAMPS
    this.renderStreetlamps(ctx, cameraX);

    // 6. ARRIVAL AIRPLANE
    this.renderArrivalAirplane(ctx, cameraX);

    // 7. CELEBRATION PARTICLES
    this.renderCelebrationEffects(ctx, cameraX);

    // 8. LIVING PIXEL CATS (1.0x crisp midground)
    if (this.cats) {
      for (const cat of this.cats) {
        cat.draw(ctx, cameraX);
      }
    }
  }

  renderGround(ctx, cameraX, canvasWidth, canvasHeight) {
    const gy = this.groundY; // 220
    const gH = canvasHeight - gy + 5; // 55px tall

    // SECTION 1: Arrival Runway (x: 0 .. 280)
    const arrivalEnd = Math.round(280 - cameraX);
    if (arrivalEnd > 0) {
      const rw = Math.min(canvasWidth, Math.max(0, arrivalEnd));
      ctx.fillStyle = '#1c1b24';
      ctx.fillRect(0, gy, rw, gH);

      // Curb & border
      ctx.fillStyle = '#2e2a3b';
      ctx.fillRect(0, gy, rw, 3);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, gy + 3, rw, 2);
      ctx.fillRect(0, gy + 46, rw, 2);

      // Green runway threshold lights at x = 25
      const tx = Math.round(25 - cameraX);
      if (tx > -20 && tx < canvasWidth) {
        for (let ty = gy + 7; ty <= gy + 41; ty += 5) {
          ctx.fillStyle = '#00e676';
          ctx.fillRect(tx, ty, 3, 2);
        }
      }
    }

    // SECTION 2: Barcelona Panot de Flor Pavement (x: 280 .. worldWidth)
    const pavStartX = Math.max(0, Math.round(280 - cameraX));
    const pavEndX = Math.min(canvasWidth, Math.round(this.worldWidth - cameraX));
    const pavW = pavEndX - pavStartX;

    if (pavW > 0) {
      // Warm stone sidewalk base
      ctx.fillStyle = '#d4b494';
      ctx.fillRect(pavStartX, gy, pavW, gH);

      // Repeating Panot de Flor texture
      if (this.photoPanotPavement && this.photoPanotPavement.complete) {
        const tileW = 128;
        const tileH = 48;
        const startTileX = -((cameraX - 280) % tileW);
        const loopStart = startTileX > 0 ? startTileX - tileW : startTileX;

        ctx.save();
        ctx.beginPath();
        ctx.rect(pavStartX, gy + 3, pavW, gH - 3);
        ctx.clip();

        for (let x = loopStart; x < canvasWidth + tileW; x += tileW) {
          ctx.drawImage(this.photoPanotPavement, Math.round(x), gy + 3, tileW, tileH);
        }
        ctx.restore();
      }

      // Granite curb line
      ctx.fillStyle = '#a1887f';
      ctx.fillRect(pavStartX, gy, pavW, 3);
      ctx.fillStyle = '#5d4037';
      ctx.fillRect(pavStartX, gy + 2, pavW, 1);
    }
  }

  renderVegetation(ctx, cameraX) {
    const baselineY = this.groundY;

    // 1. London Plane Trees (Platanus)
    if (this.photoPlaneTree && this.photoPlaneTree.complete) {
      const pw = 100;
      const ph = 135;
      for (const px of this.planeTrees) {
        const sx = Math.round(px - cameraX);
        if (sx >= -pw && sx <= 500) {
          ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
          ctx.fillRect(sx + 38, baselineY - 2, 24, 3);
          ctx.drawImage(this.photoPlaneTree, sx, baselineY - ph + 2, pw, ph);
        }
      }
    }

    // 2. Mediterranean Stone Pines (Pinus pinea)
    if (this.photoStonePine && this.photoStonePine.complete) {
      const pw = 115;
      const ph = 120;
      for (const px of this.stonePines) {
        const sx = Math.round(px - cameraX);
        if (sx >= -pw && sx <= 500) {
          ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
          ctx.fillRect(sx + 48, baselineY - 2, 20, 3);
          ctx.drawImage(this.photoStonePine, sx, baselineY - ph + 2, pw, ph);
        }
      }
    }

    // 3. Canary Island Date Palms (Phoenix canariensis)
    if (this.photoPalmTree && this.photoPalmTree.complete) {
      const pw = 68;
      const ph = 138;
      for (const px of this.palmTrees) {
        const sx = Math.round(px - cameraX);
        if (sx >= -pw && sx <= 500) {
          ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
          ctx.fillRect(sx + 25, baselineY - 2, 18, 3);
          ctx.drawImage(this.photoPalmTree, sx, baselineY - ph + 2, pw, ph);
        }
      }
    }

    // 4. Terracotta Oleander Planters
    if (this.photoPlanterOleander && this.photoPlanterOleander.complete) {
      const pw = 32;
      const ph = 34;
      for (const px of this.planters) {
        const sx = Math.round(px - cameraX);
        if (sx >= -pw && sx <= 500) {
          ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
          ctx.fillRect(sx + 4, baselineY - 2, pw - 8, 3);
          ctx.drawImage(this.photoPlanterOleander, sx, baselineY - ph + 2, pw, ph);
        }
      }
    }
  }

  renderStreetlamps(ctx, cameraX) {
    if (!this.photoStreetlamp || !this.photoStreetlamp.complete) return;
    const lw = 28;
    const lh = 78;
    const baselineY = this.groundY;

    for (const lx of this.streetlamps) {
      const sx = Math.round(lx - cameraX);
      if (sx >= -lw && sx <= 500) {
        // Contact shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(sx + 6, baselineY - 2, lw - 12, 3);

        // Streetlamp
        ctx.drawImage(this.photoStreetlamp, sx, baselineY - lh + 2, lw, lh);

        // Warm amber glow halo around lantern
        ctx.save();
        const glowGrad = ctx.createRadialGradient(sx + 14, baselineY - lh + 15, 2, sx + 14, baselineY - lh + 15, 22);
        glowGrad.addColorStop(0, 'rgba(255, 215, 120, 0.45)');
        glowGrad.addColorStop(0.5, 'rgba(255, 175, 50, 0.18)');
        glowGrad.addColorStop(1, 'rgba(255, 150, 30, 0)');
        ctx.fillStyle = glowGrad;
        ctx.beginPath();
        ctx.arc(sx + 14, baselineY - lh + 15, 22, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }
  }

  renderLandmarks(ctx, cameraX) {
    const baselineY = this.groundY;

    for (const lm of this.landmarks) {
      if (lm.type === 'departure') continue;

      let img = null;
      if (lm.type === 'arc_triomf') img = this.photoArcTriomf;
      else if (lm.type === 'casa_batllo') img = this.photoCasaBatllo;
      else if (lm.type === 'park_guell') img = this.photoParkGuell;
      else if (lm.type === 'casa_mila') img = this.photoCasaMila;
      else if (lm.type === 'sagrada_familia') img = this.photoSagradaFamilia;
      else if (lm.type === 'colom_monument') img = this.photoColomMonument;

      if (img && img.complete) {
        const sx = Math.round(lm.x - cameraX - lm.w * 0.5);
        if (sx >= -lm.w - 50 && sx <= 530) {
          // Contact shadow on the Panot pavement
          ctx.fillStyle = 'rgba(0, 0, 0, 0.32)';
          ctx.fillRect(sx + 8, baselineY - 2, lm.w - 16, 4);

          // Landmark sprite (flush to ground)
          ctx.drawImage(img, sx, baselineY - lm.h + 2, lm.w, lm.h);
        }
      }
    }
  }

  renderArrivalAirplane(ctx, cameraX) {
    const plane = this.airplane;
    if (plane.state === 'approaching') return;

    const sx = Math.round(plane.x - cameraX);
    const sy = Math.round(plane.y);

    ctx.save();
    ctx.translate(sx, sy);
    if (plane.rot) ctx.rotate((plane.rot * Math.PI) / 180);

    let img = this.photoAirplaneTarmac;
    if (plane.state === 'landing') {
      img = this.photoAirplaneFlight;
    } else if (plane.state === 'touchdown' || plane.state === 'taxi' || plane.state === 'parked') {
      img = this.photoAirplaneBoarded || this.photoAirplaneTarmac;
    } else if (plane.state === 'disembarking' || plane.state === 'complete') {
      img = this.photoAirplaneTarmac;
    }

    if (img && img.complete) {
      ctx.drawImage(img, 0, -75, 220, 75);
    }

    ctx.restore();

    // Tire smoke sparks
    for (const p of plane.touchdownSparks) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.fillStyle = p.color;
      ctx.fillRect(Math.round(p.x - cameraX), Math.round(p.y), p.size, p.size);
      ctx.restore();
    }
  }

  renderCelebrationEffects(ctx, cameraX) {
    // Fireworks
    for (const f of this.fireworks) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, f.alpha);
      ctx.fillStyle = f.color;
      ctx.fillRect(Math.round(f.x - cameraX), Math.round(f.y), 2, 2);
      ctx.restore();
    }

    // Confetti
    for (const c of this.confetti) {
      ctx.save();
      ctx.translate(Math.round(c.x - cameraX), Math.round(c.y));
      ctx.rotate(c.rot);
      ctx.fillStyle = c.color;
      ctx.fillRect(-c.size, -c.size, c.size * 2, c.size * 2);
      ctx.restore();
    }
  }

  drawForeground(ctx, cameraX, canvasWidth, canvasHeight, aliceX, aliceY) {
    // 1. Foreground Depth Layer rendered first (overhanging canopy, blurred bokeh pots and railings)
    this.renderForegroundDepth(ctx, cameraX, canvasWidth, canvasHeight);

    // 2. UI Elements rendered on top of all visual layers with strictly no blur
    ctx.save();
    ctx.filter = 'none';

    // 0. Book Edge Zero-G Leap Prompt (floats safely above Alice's head)
    if (aliceX >= 2800 && !this.cosmicLeapTriggered) {
      const bobY = Math.sin(this.promptPulse * 1.5) * 3;
      const promptX = Math.round(aliceX - cameraX);
      const promptY = Math.round(aliceY - 76 + bobY);

      ctx.save();
      const pw = 146;
      const ph = 24;
      ctx.fillStyle = 'rgba(26, 12, 34, 0.94)';
      ctx.fillRect(promptX - pw / 2, promptY - ph / 2, pw, ph);
      ctx.strokeStyle = '#ff7ebb';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(promptX - pw / 2, promptY - ph / 2, pw, ph);

      // Inner gold line
      ctx.strokeStyle = '#ffd54f';
      ctx.lineWidth = 1;
      ctx.strokeRect(promptX - pw / 2 + 2, promptY - ph / 2 + 2, pw - 4, ph - 4);

      ctx.fillStyle = '#fff0f7';
      ctx.font = 'bold 12px "Handjet", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('✧ [ ПРОБЕЛ — ПРЫГНУТЬ ] ✧', promptX, promptY);
      ctx.restore();
    }

    // 1. Floating [ F ] key above Alice's head when near a landmark (never obscuring her face/body)
    if (this.activeLandmark && !this.showBirthdayLetter && aliceX < 2800) {
      const bobY = Math.sin(this.promptPulse) * 2.5;
      const promptX = Math.round(aliceX - cameraX);
      const promptY = Math.round(aliceY - 74 + bobY);

      ctx.save();
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#37474f';
      ctx.lineWidth = 1;
      ctx.fillRect(promptX - 11, promptY - 8, 22, 16);
      ctx.strokeRect(promptX - 11, promptY - 8, 22, 16);

      ctx.fillStyle = '#1e88e5';
      ctx.font = 'bold 11px "Handjet", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('[F]', promptX, promptY);
      ctx.restore();
    }

    // 2. Inspected Landmark Bottom Placard (minimalist)
    if (this.inspectedLandmark && !this.showBirthdayLetter) {
      ctx.save();
      const text = this.inspectedLandmark.title;
      ctx.font = 'bold 13px "Handjet", "VT323", monospace';
      const metrics = ctx.measureText(text);
      const boxW = metrics.width + 16;
      const boxH = 18;
      const boxX = Math.round((canvasWidth - boxW) / 2);
      const boxY = canvasHeight - 26;

      ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
      ctx.fillRect(boxX, boxY, boxW, boxH);

      ctx.fillStyle = '#ffecb3';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, canvasWidth / 2, boxY + boxH / 2 + 1);
      ctx.restore();
    }

    // 2.5. Cat Petting Prompt floating above nearby cat (minimalist, no box, no frame, no stars)
    // Only show prompt for unpetted cats to avoid clutter when cats follow Alice
    if (this.nearbyCat && !this.nearbyCat.isPetted && !this.showBirthdayLetter) {
      const cat = this.nearbyCat;
      const sx = Math.round(cat.x - cameraX);
      const floatOffset = Math.sin(this.promptPulse * 1.5) * 2;
      const py = Math.round(cat.groundY - 32 + floatOffset);

      const label = '[ F ] ПОГЛАДИТЬ';

      ctx.save();
      ctx.font = 'bold 12px "Handjet", "VT323", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // 1px dark outline for visibility
      ctx.fillStyle = '#1a0d18';
      ctx.fillText(label, sx + 1, py);
      ctx.fillText(label, sx - 1, py);
      ctx.fillText(label, sx, py + 1);
      ctx.fillText(label, sx, py - 1);

      // Crisp white text
      ctx.fillStyle = '#ffffff';
      ctx.fillText(label, sx, py);
      ctx.restore();
    }

    // 2.6. Top-Right Cat Counter Badge (clean minimal)
    if (this.cats && this.cats.length > 0 && !this.showBirthdayLetter) {
      const pettedCount = this.cats.filter(c => c.isPetted).length;
      const totalCats = this.cats.length;
      const badgeX = canvasWidth - 14;
      const badgeY = 12;

      ctx.save();
      ctx.font = 'bold 12px "Handjet", "VT323", monospace';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';

      const icon = pettedCount === totalCats ? '♥' : '🐾';
      const text = `${icon} ${pettedCount}/${totalCats}`;

      // 1px dark outline
      ctx.fillStyle = '#1a0d18';
      ctx.fillText(text, badgeX + 1, badgeY);
      ctx.fillText(text, badgeX - 1, badgeY);
      ctx.fillText(text, badgeX, badgeY + 1);
      ctx.fillText(text, badgeX, badgeY - 1);

      ctx.fillStyle = pettedCount === totalCats ? '#ff4081' : '#ffffff';
      ctx.fillText(text, badgeX, badgeY);
      ctx.restore();
    }

    // Note: City Cat Completion Celebration Toast removed per user instructions

    ctx.restore();
  }

  renderForegroundDepth(ctx, cameraX, canvasWidth, canvasHeight) {
    ctx.save();
    ctx.filter = 'blur(1.8px)';
    ctx.globalAlpha = 0.96;

    // 1. Overhanging Top Canopy (Bougainvillea & plane leaves)
    if (this.photoFgCanopy && this.photoFgCanopy.complete) {
      const pTop = 1.15;
      const canopyW = 220;
      const canopyH = 95;
      const topY = -12;

      for (let i = 0; i < this.fgCanopies.length; i++) {
        const sx = Math.round(this.fgCanopies[i] - cameraX * pTop);
        if (sx >= -canopyW && sx <= canvasWidth + canopyW) {
          ctx.drawImage(this.photoFgCanopy, sx, topY, canopyW, canopyH);
        }
      }
    }

    // 2. Bottom Decorative Wrought-Iron Balcony Railings
    if (this.photoFgRailing && this.photoFgRailing.complete) {
      const pRail = 1.12;
      const railW = 128;
      const railH = 36;
      const railY = canvasHeight - 22; // snug against the bottom edge

      // Repeat along camera view
      const startX = -((cameraX * pRail) % railW);
      const loopStart = startX > 0 ? startX - railW : startX;
      for (let rx = loopStart; rx < canvasWidth + railW; rx += railW) {
        ctx.drawImage(this.photoFgRailing, Math.round(rx), railY, railW, railH);
      }
    }

    // 3. Bottom Planters (100% solid, grounded)
    if (this.photoFgPot && this.photoFgPot.complete) {
      const pPot = 1.20;
      const potW = 55;
      const potH = 65;
      const potY = canvasHeight - 48; // sitting on the bottom ledge

      for (let i = 0; i < this.fgPlanters.length; i++) {
        const sx = Math.round(this.fgPlanters[i] - cameraX * pPot);
        if (sx >= -potW && sx <= canvasWidth + potW) {
          ctx.drawImage(this.photoFgPot, sx, potY, potW, potH);
        }
      }
    }

    // 4. Bottom Vintage Streetlamps (100% solid)
    if (this.photoFgStreetlamp && this.photoFgStreetlamp.complete) {
      const pBot = 1.18;
      const lampW = 38;
      const lampH = 95;
      const botY = canvasHeight - 88;

      for (let i = 0; i < this.fgStreetlamps.length; i++) {
        const sx = Math.round(this.fgStreetlamps[i] - cameraX * pBot);
        if (sx >= -lampW && sx <= canvasWidth + lampW) {
          ctx.drawImage(this.photoFgStreetlamp, sx, botY, lampW, lampH);
        }
      }
    }

    ctx.restore();
  }
}
