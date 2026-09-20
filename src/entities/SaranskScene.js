/**
 * Rich, Seamless 2D Photo-Pixel Art World of Saransk
 * 
 * Features:
 * - 100% Seamless panoramic twilight sky
 * - Grounded buildings (no floating effect, solid foundations and curb shadows)
 * - Unique real landmarks of Saransk (Zero repetition):
 *   1. Historic Carved Wooden Manor (Sovetskaya St.)
 *   2. Bronze Fox Mascot Statue
 *   3. Mordovian National Drama Theatre
 *   4. Cathedral of St. Theodore Ushakov
 *   5. Erzia Museum of Fine Arts
 *   6. Ogarev Mordovia State University High-Rise ("МГУ Высотка" 17-floor tower)
 *   7. Pushkin Park Wrought-Iron Entrance Archway
 * - Minimalist [ F ] interaction prompt with concise titles only
 */
import { PixelCat } from './PixelCat.js?v=20260920_2004';

export class SaranskScene {
  constructor(gameConfig) {
    this.config = gameConfig;
    this.worldWidth = 2200;
    this.groundY = 220;
    this.aliceGroundY = 224;

    // Textures
    this.photoSky = null;
    this.photoCathedral = null;
    this.photoMansion = null;
    this.photoTheatre = null;
    this.photoErzia = null;
    this.photoMgu = null;
    this.photoCobble = null;
    this.photoFox = null;
    this.photoStreetlamp = null;
    this.photoFerris = null;
    this.photoPanelka5 = null;
    this.photoPanelka9 = null;
    this.photoAirplaneTarmac = null;
    this.photoAirplaneBoarded = null;
    this.photoAirplaneFlight = null;
    this.photoStalinka = null;
    this.photoCafe = null;

    // Saransk Authentic Architecture & Skyline Assets
    this.photoBgStalinkaLenina = null;
    this.photoBgMerchantBrick = null;
    this.photoBgCornerRotunda = null;
    this.photoBgMordovianModern = null;
    this.photoBgBakery = null;
    this.photoBgPostOffice = null;
    this.photoBgWoodenManor = null;
    this.photoBgCluster = null;

    // Periodic Foreground Foliage Assets (Open Sky)
    this.photoFgBranchBirch = null;
    this.photoFgBranchLinden = null;
    this.photoFgBranchRowan = null;
    this.photoFgRailing = null;
    this.photoFgPlanter = null;
    this.photoFgStreetlamp = null;

    // Book spine / Page gap
    this.photoBookSpine = null;
    this.nearSpine = false;
    this.spineJumped = false;

    // Sunset Sky Layers (PACKS/background 2)
    this.skyLayers = [];

    // GandalfHardcore Environment Assets
    this.photoBirch1 = null;
    this.photoBirch2 = null;
    this.photoBirch3 = null;
    this.photoFloweringTree = null;
    this.photoWillow = null;
    this.photoBush1 = null;
    this.photoBush2 = null;
    this.photoFlowers1 = null;
    this.photoFlowers2 = null;
    this.photoSunflowers = null;
    this.cloudImgs = [];
    this.birdImgs = [];

    // GandalfHardcore Trees along Saransk boulevard
    this.trees = [
      { type: 'birch1', x: 60, depth: 0 },
      { type: 'flowering', x: 330, depth: 0 },
      { type: 'birch2', x: 570, depth: 0 },
      { type: 'birch3', x: 970, depth: -1 },
      { type: 'birch1', x: 1300, depth: 0 },
      { type: 'flowering', x: 1670, depth: -1 },
      { type: 'birch2', x: 1910, depth: 0 }
    ];

    // Flowerbeds along the curb
    this.flowerbeds = [
      { type: 'flowers1', x: 110 },
      { type: 'bush1', x: 370 },
      { type: 'flowers2', x: 520 },
      { type: 'sunflowers', x: 670 },
      { type: 'flowers1', x: 840 },
      { type: 'bush2', x: 1020 },
      { type: 'flowers2', x: 1380 },
      { type: 'sunflowers', x: 1560 },
      { type: 'bush1', x: 1690 },
      { type: 'flowers1', x: 1890 }
    ];

    // Drifting clouds in the evening sky
    this.clouds = [
      { imgIdx: 2, x: 80, y: 22, speed: 2.2, parallax: 0.12 },
      { imgIdx: 4, x: 360, y: 44, speed: 2.8, parallax: 0.16 },
      { imgIdx: 1, x: 680, y: 18, speed: 1.8, parallax: 0.10 },
      { imgIdx: 5, x: 1040, y: 50, speed: 3.2, parallax: 0.18 },
      { imgIdx: 3, x: 1380, y: 28, speed: 2.4, parallax: 0.14 },
      { imgIdx: 0, x: 1720, y: 20, speed: 1.6, parallax: 0.11 },
      { imgIdx: 4, x: 2020, y: 40, speed: 2.7, parallax: 0.15 }
    ];

    // Birds perched in trees and on lamps
    this.birds = [
      { imgIdx: 0, x: 92, y: 150 },
      { imgIdx: 1, x: 345, y: 125 },
      { imgIdx: 2, x: 900, y: 130 },
      { imgIdx: 3, x: 1620, y: 125 },
      { imgIdx: 0, x: 1932, y: 150 }
    ];

    // Airplane state (Facing RIGHT!)
    this.airplane = {
      x: 1940,
      y: 220,
      state: 'parked', // 'parked', 'boarding', 'boarded', 'taxi', 'takeoff', 'flown'
      speed: 0,
      vy: 0,
      propAngle: 0,
      boardTimer: 0,
      takeoffTimer: 0,
      exhaustParticles: []
    };
    this.takeoffTriggered = false;
    this.onTakeoffComplete = null;

    // Twinkling stars
    this.stars = [];
    for (let i = 0; i < 70; i++) {
      this.stars.push({
        x: Math.random() * this.worldWidth,
        y: Math.random() * 105,
        size: Math.random() > 0.8 ? 2 : 1,
        color: Math.random() > 0.4 ? '#ffd8ec' : '#ffffff',
        twinkleSpeed: 0.03 + Math.random() * 0.05,
        twinkleOffset: Math.random() * Math.PI * 2
      });
    }

    // Street Lamps positions along the walkway
    this.streetLamps = [80, 300, 560, 890, 1260, 1600, 1920];

    // Unique authentic landmarks (centered precisely on their architectural point of interest)
    this.landmarks = [
      {
        id: 'fox',
        x: 420, // Bronze fox mascot on stone boulders
        title: 'Памятник Лисичке',
        type: 'fox'
      },
      {
        id: 'theatre',
        x: 810, // Center of Theatre (720 + 90)
        title: 'Театр драмы',
        type: 'theatre'
      },
      {
        id: 'cathedral',
        x: 1182, // Center of Cathedral (1080 + 102)
        title: 'Собор Феодора Ушакова',
        type: 'cathedral'
      },
      {
        id: 'erzia',
        x: 1565, // Center of Erzia Museum (1460 + 105)
        title: 'Музей им. Эрьзи',
        type: 'erzia'
      },
      {
        id: 'mgu',
        x: 1812, // Center of MGU High-Rise (1740 + 72)
        title: 'МГУ им. Огарёва',
        type: 'mgu'
      }
    ];

    // Cute living pixel cats across Saransk
    this.cats = [
      new PixelCat({
        x: 470,
        groundY: this.aliceGroundY,
        breed: 'ginger',
        patrolRange: [440, 510],
        facing: -1
      }),
      new PixelCat({
        x: 940,
        groundY: this.aliceGroundY,
        breed: 'calico',
        patrolRange: [910, 970],
        facing: 1
      }),
      new PixelCat({
        x: 1420,
        groundY: this.aliceGroundY,
        breed: 'classical',
        patrolRange: [1390, 1460],
        facing: -1
      })
    ];

    // Current nearby landmark & inspection state
    this.activeLandmark = null;
    this.inspectedLandmark = null;
    this.promptPulse = 0;
    this.archGlowTimer = 0;
    this.snapshotsTaken = {};
    this.onLandmarkSnapshot = null;

    // Cat petting gameplay state
    this.nearbyCat = null;
    this.catsToastTimer = 0;
    this.catsCelebrated = false;

    // Atmospheric fireflies
    this.fireflies = [];
    for (let i = 0; i < 40; i++) {
      this.fireflies.push({
        x: Math.random() * this.worldWidth,
        y: 110 + Math.random() * 105,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.25,
        alpha: Math.random()
      });
    }

    // Blurred drifting foreground leaves in evening breeze
    this.fgLeaves = [];
    for (let i = 0; i < 16; i++) {
      this.fgLeaves.push({
        x: Math.random() * (this.worldWidth + 400),
        y: Math.random() * 260,
        size: 3 + Math.random() * 3,
        color: Math.random() > 0.5 ? '#ff9ebb' : '#f5af5f',
        parallax: 1.40,
        vx: -0.35 - Math.random() * 0.35,
        vy: 0.18 + Math.random() * 0.25,
        sway: Math.random() * Math.PI * 2
      });
    }

    this.loadAllTextures();
  }

  loadAllTextures() {
    const loadImg = (src, onDone) => {
      const img = new Image();
      img.src = src;
      img.onload = () => onDone(img);
    };

    loadImg('./assets/photos/twilight_sky_seamless.png', (img) => { this.photoSky = img; });
    loadImg('./assets/photos/cathedral_pixel.png', (img) => { this.photoCathedral = img; });
    loadImg('./assets/photos/mansion_sovetskaya_clean.png', (img) => { this.photoMansion = img; });
    loadImg('./assets/photos/saransk_theatre_pixel.png', (img) => { this.photoTheatre = img; });
    loadImg('./assets/photos/erzia_museum_pixel.png', (img) => { this.photoErzia = img; });
    loadImg('./assets/photos/mgu_tower_pixel.png', (img) => { this.photoMgu = img; });
    loadImg('./assets/photos/stone_pavement_pixel.png', (img) => { this.photoCobble = img; });
    loadImg('./assets/photos/fox_monument_pixel.png', (img) => { this.photoFox = img; });
    loadImg('./assets/photos/streetlamp_pixel.png', (img) => { this.photoStreetlamp = img; });
    loadImg('./assets/photos/ferris_wheel_pixel.png', (img) => { this.photoFerris = img; });
    loadImg('./assets/photos/panelka_5story_pixel.png', (img) => { this.photoPanelka5 = img; });
    loadImg('./assets/photos/panelka_9story_pixel.png', (img) => { this.photoPanelka9 = img; });
    this.photoAirplaneTarmac = new Image();
    this.photoAirplaneTarmac.src = './assets/photos/airplane_tarmac_pixel.png';
    this.photoAirplaneBoarded = new Image();
    this.photoAirplaneBoarded.src = './assets/photos/airplane_tarmac_boarded_pixel.png';
    this.photoAirplaneFlight = new Image();
    this.photoAirplaneFlight.src = './assets/photos/airplane_flight_pixel.png';
    loadImg('./assets/photos/saransk_stalinka_pixel.png', (img) => { this.photoStalinka = img; });
    loadImg('./assets/photos/saransk_cafe_pixel.png', (img) => { this.photoCafe = img; });

    // Saransk Authentic Architecture & Skyline Assets
    loadImg('./assets/photos/saransk_bg_stalinka_lenina.png', (img) => { this.photoBgStalinkaLenina = img; });
    loadImg('./assets/photos/saransk_bg_merchant_brick.png', (img) => { this.photoBgMerchantBrick = img; });
    loadImg('./assets/photos/saransk_bg_corner_rotunda.png', (img) => { this.photoBgCornerRotunda = img; });
    loadImg('./assets/photos/saransk_bg_mordovian_modern.png', (img) => { this.photoBgMordovianModern = img; });
    loadImg('./assets/photos/saransk_bg_sovetskaya_bakery.png', (img) => { this.photoBgBakery = img; });
    loadImg('./assets/photos/saransk_bg_post_office.png', (img) => { this.photoBgPostOffice = img; });
    loadImg('./assets/photos/saransk_bg_wooden_manor.png', (img) => { this.photoBgWoodenManor = img; });
    loadImg('./assets/photos/saransk_bg_cluster.png', (img) => { this.photoBgCluster = img; });

    // Periodic Foreground Foliage Assets (Open Sky)
    loadImg('./assets/photos/saransk_fg_branch_birch.png', (img) => { this.photoFgBranchBirch = img; });
    loadImg('./assets/photos/saransk_fg_branch_linden.png', (img) => { this.photoFgBranchLinden = img; });
    loadImg('./assets/photos/saransk_fg_branch_rowan.png', (img) => { this.photoFgBranchRowan = img; });
    loadImg('./assets/photos/saransk_fg_railing.png', (img) => { this.photoFgRailing = img; });
    loadImg('./assets/photos/saransk_fg_planter.png', (img) => { this.photoFgPlanter = img; });
    loadImg('./assets/photos/saransk_fg_streetlamp.png', (img) => { this.photoFgStreetlamp = img; });

    // Load Book Spine Texture
    loadImg('./assets/book/book_spine.png', (img) => { this.photoBookSpine = img; });

    // Load Sunset Sky Layers (PACKS/background 2)
    for (let i = 1; i <= 5; i++) {
      loadImg(`./assets/sky/saransk_sky_${i}.png`, (img) => { this.skyLayers[i - 1] = img; });
    }

    // Load GandalfHardcore Environment Assets
    loadImg('./assets/env_gandalf/Birch1.png', (img) => { this.photoBirch1 = img; });
    loadImg('./assets/env_gandalf/Birch2.png', (img) => { this.photoBirch2 = img; });
    loadImg('./assets/env_gandalf/Birch3.png', (img) => { this.photoBirch3 = img; });
    loadImg('./assets/env_gandalf/Flowering Tree.png', (img) => { this.photoFloweringTree = img; });
    loadImg('./assets/env_gandalf/Weeping Willow1.png', (img) => { this.photoWillow = img; });
    loadImg('./assets/env_gandalf/garden_bush1.png', (img) => { this.photoBush1 = img; });
    loadImg('./assets/env_gandalf/garden_bush2.png', (img) => { this.photoBush2 = img; });
    loadImg('./assets/env_gandalf/garden_flowers1.png', (img) => { this.photoFlowers1 = img; });
    loadImg('./assets/env_gandalf/garden_flowers2.png', (img) => { this.photoFlowers2 = img; });
    loadImg('./assets/env_gandalf/garden_sunflowers.png', (img) => { this.photoSunflowers = img; });

    for (let i = 1; i <= 6; i++) {
      loadImg(`./assets/env_gandalf/cloud${i}.png`, (img) => { this.cloudImgs[i - 1] = img; });
    }
    for (let i = 1; i <= 4; i++) {
      loadImg(`./assets/env_gandalf/birds${i}.png`, (img) => { this.birdImgs[i - 1] = img; });
    }
  }

  update(delta, alice, input) {
    this.archGlowTimer += 0.08;
    this.promptPulse += 0.1;

    // Update living pixel cats and find nearby cat for petting
    this.nearbyCat = null;
    let minCatDist = 9999;

    if (this.cats) {
      const followingCats = this.cats.filter(c => c.isFollowing);
      const isDeparture = this.airplane && (this.airplane.state === 'boarding' || this.airplane.state === 'boarded' || this.airplane.state === 'taxi' || this.airplane.state === 'takeoff');
      const departureSpotX = 1920;

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

    const aliceX = (alice && typeof alice.x === 'number') ? alice.x : (typeof alice === 'number' ? alice : 0);

    // 1. Automatic physical boarding on airstairs without [F]
    const plane = this.airplane;
    const stairsFootX = plane.x + 20;
    const doorX = plane.x + 56;

    if (plane.state === 'parked' && alice && typeof alice === 'object') {
      if (alice.x >= stairsFootX) {
        plane.state = 'boarding';
        if (this.audio) this.audio.playPlaneBoarding();
      }
    }

    if (plane.state === 'boarding' && alice && typeof alice === 'object') {
      // Alice ascends airstairs step-by-step with delta-time
      alice.facing = 1;
      alice.state = 'walk';
      alice.animTime = (alice.animTime || 0) + delta;
      if (alice.animTime >= 0.095) {
        alice.animTime = 0;
        alice.animIndex = (alice.animIndex + 1) % 8;
      }
      alice.x += 38 * delta;
      const progress = Math.min(1.0, Math.max(0, (alice.x - stairsFootX) / (doorX - stairsFootX)));
      alice.y = this.groundY - progress * 22;

      if (alice.x >= doorX) {
        plane.state = 'boarded';
        plane.boardTimer = 0;
        alice.y = this.groundY - 22;
        if (this.audio) this.audio.playPlaneEngineStart();
      }
    } else if (plane.state === 'boarded') {
      plane.boardTimer += delta;
      if (plane.boardTimer > 1.0) {
        plane.state = 'taxi';
        if (this.audio) this.audio.playPlaneTaxi();
      }
    } else if (plane.state === 'taxi') {
      plane.speed += 50 * delta;
      plane.x += plane.speed * delta;
      if (plane.x > 2140) {
        plane.state = 'takeoff';
        if (this.audio) this.audio.playPlaneTakeoff();
      }
    } else if (plane.state === 'takeoff') {
      plane.speed += 85 * delta;
      plane.vy -= 46 * delta;
      plane.x += plane.speed * delta;
      plane.y += plane.vy * delta;

      // Exhaust spark particles behind the plane engines (x ~ plane.x + 30)
      if (Math.random() > 0.25) {
        plane.exhaustParticles.push({
          x: plane.x + 30,
          y: plane.y - 35 + (Math.random() - 0.5) * 6,
          vx: -50 - Math.random() * 30,
          vy: (Math.random() - 0.5) * 8,
          alpha: 1.0,
          color: Math.random() > 0.5 ? '#ffd166' : '#ff7ebb'
        });
      }

      // Trigger 3D page flip transition ONLY when plane has completely flown off screen!
      // When plane.x - cameraX > 480 + 80, the whole plane is completely past the right edge
      const cameraX = (this.lastCameraX || 1720);
      if ((plane.x - cameraX > 540) && !this.takeoffTriggered) {
        this.takeoffTriggered = true;
        if (this.onTakeoffComplete) {
          this.onTakeoffComplete();
        }
      }
    }

    // Update exhaust particles
    for (let i = plane.exhaustParticles.length - 1; i >= 0; i--) {
      const p = plane.exhaustParticles[i];
      p.x += p.vx * delta;
      p.y += p.vy * delta;
      p.alpha -= 1.8 * delta;
      if (p.alpha <= 0) {
        plane.exhaustParticles.splice(i, 1);
      }
    }

    // 2. Check proximity to landmarks
    let foundNearby = null;
    for (const lm of this.landmarks) {
      const dist = Math.abs(aliceX - lm.x);
      if (dist < 65) {
        foundNearby = lm;
        break;
      }
    }

    this.activeLandmark = foundNearby;

    // If player walked away, close inspection
    if (!this.activeLandmark || (this.inspectedLandmark && this.inspectedLandmark.id !== this.activeLandmark.id)) {
      this.inspectedLandmark = null;
    }

    // Toggle inspection on [F]
    if (input && input.consumeInspect()) {
      if (this.activeLandmark) {
        if (this.audio) this.audio.playInteract();

        // Trigger polaroid photo for Fox monument or Ushakov cathedral if not yet taken
        if (this.activeLandmark.id === 'fox' || this.activeLandmark.id === 'cathedral') {
          const id = this.activeLandmark.id;
          if (this.onLandmarkSnapshot && !this.snapshotsTaken[id]) {
            this.snapshotsTaken[id] = true;
            this.onLandmarkSnapshot(this.activeLandmark);
          }
        }

        if (this.inspectedLandmark && this.inspectedLandmark.id === this.activeLandmark.id) {
          this.inspectedLandmark = null; // Toggle off
        } else {
          this.inspectedLandmark = this.activeLandmark; // Toggle on
        }
      }
    }

    // Update fireflies
    this.fireflies.forEach(f => {
      f.x += f.vx;
      f.y += f.vy;
      f.alpha += 0.03;
      if (f.x < 0) f.x = this.worldWidth;
      if (f.x > this.worldWidth) f.x = 0;
      if (f.y < 110) f.vy = Math.abs(f.vy);
      if (f.y > 220) f.vy = -Math.abs(f.vy);
    });

    // Update drifting clouds
    this.clouds.forEach(c => {
      c.x -= c.speed * delta * 12;
      if (c.x < -150) {
        c.x = this.worldWidth + 80;
      }
    });

    // Update foreground drifting leaves
    this.fgLeaves.forEach(l => {
      l.x += l.vx * 60 * delta;
      l.y += l.vy * 60 * delta;
      if (l.x < -40) l.x = this.worldWidth + 60;
      if (l.y > 270) {
        l.y = -10;
        l.x = Math.random() * (this.worldWidth + 100);
      }
    });
  }

  drawBackground(ctx, cameraX, viewportWidth, viewportHeight) {
    // -------------------------------------------------------------
    // LAYER 1: MULTI-LAYER SUNSET SKY (PACKS/background 2)
    // Draw clouds & mountains layers (idx 1..4), skip idx 0 (solid opaque sky fill)
    // so that the authentic cream paper of the book pages is visible!
    // -------------------------------------------------------------
    if (this.skyLayers && this.skyLayers.length >= 5) {
      const skyW = 480;
      const skyH = 270;
      const parallaxes = [0.02, 0.05, 0.08, 0.12, 0.16];
      this.skyLayers.forEach((layer, idx) => {
        if (idx === 0) return; // Skip solid opaque sky background
        if (layer && layer.complete) {
          const p = parallaxes[idx];
          const startX = -Math.floor((cameraX * p) % skyW);
          for (let x = startX - skyW; x < viewportWidth + skyW; x += skyW) {
            ctx.drawImage(layer, x, 0, skyW, skyH);
          }
        }
      });
    }

    // -------------------------------------------------------------
    // LAYER 1.5: DRIFTING PIXEL CLOUDS (Parallax 0.10x..0.18x)
    // -------------------------------------------------------------
    this.drawDriftingClouds(ctx, cameraX, viewportWidth);

    // -------------------------------------------------------------
    // LAYER 2: TWINKLING STARS & CRESCENT MOON
    // -------------------------------------------------------------
    this.stars.forEach(star => {
      const screenX = star.x - cameraX * 0.08;
      if (screenX >= -10 && screenX <= viewportWidth + 10) {
        const twinkle = Math.sin(Date.now() * star.twinkleSpeed + star.twinkleOffset);
        if (twinkle > -0.2) {
          ctx.fillStyle = star.color;
          ctx.fillRect(Math.round(screenX), Math.round(star.y), star.size, star.size);
        }
      }
    });

    // Glowing Crescent Moon
    const moonScreenX = 410 - cameraX * 0.04;
    ctx.fillStyle = '#fff5df';
    ctx.beginPath();
    ctx.arc(moonScreenX, 42, 13, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#180e28';
    ctx.beginPath();
    ctx.arc(moonScreenX + 5, 39, 11, 0, Math.PI * 2);
    ctx.fill();

    // -------------------------------------------------------------
    // LAYER 3: DENSE SARANSK ARCHITECTURAL SKYLINE & STREETSCAPE
    // -------------------------------------------------------------
    this.renderDistantArchitecture(ctx, cameraX, viewportWidth);

    // -------------------------------------------------------------
    // LAYER 3.5 & 4.5: FERRIS WHEEL & BACKGROUND BOULEVARD TREES
    // -------------------------------------------------------------
    ctx.save();
    ctx.filter = 'blur(0.5px)';
    this.drawDistantSkyline(ctx, cameraX, viewportWidth);
    this.drawBoulevardTrees(ctx, cameraX, viewportWidth, -1);
    ctx.restore();
  }

  drawMidground(ctx, cameraX, viewportWidth, viewportHeight) {
    // -------------------------------------------------------------
    // LAYER 4: SOLID GROUNDED PROMENADE BASELINE
    // -------------------------------------------------------------
    this.drawGroundedPromenadeBase(ctx, viewportWidth);

    // -------------------------------------------------------------
    // LAYER 5: UNIQUE HISTORIC & MODERN SARANSK LANDMARKS
    // -------------------------------------------------------------
    this.drawSaranskUniqueLandmarks(ctx, cameraX, viewportWidth);

    // -------------------------------------------------------------
    // LAYER 5.5: BOULEVARD TREES & RUSSIAN BIRCHES (Depth 0)
    // -------------------------------------------------------------
    this.drawBoulevardTrees(ctx, cameraX, viewportWidth, 0);

    // -------------------------------------------------------------
    // LAYER 6: FOREGROUND COBBLESTONE ROAD (1.0x)
    // -------------------------------------------------------------
    this.drawCobblestoneRoad(ctx, cameraX, viewportWidth);

    // -------------------------------------------------------------
    // LAYER 6.5: CURB FLOWERBEDS, BUSHES & SUNFLOWERS
    // -------------------------------------------------------------
    this.drawCurbFlowerbeds(ctx, cameraX, viewportWidth);

    // -------------------------------------------------------------
    // LAYER 7: STREET LAMPS WITH WARM LIGHT HALOS (1.0x)
    // -------------------------------------------------------------
    this.drawStreetLamps(ctx, cameraX, viewportWidth);

    // -------------------------------------------------------------
    // LAYER 7.5: PIXEL BIRDS PERCHED ON LAMPS & BRANCHES
    // -------------------------------------------------------------
    this.drawPerchedBirds(ctx, cameraX, viewportWidth);

    // -------------------------------------------------------------
    // LAYER 8: FOX MASCOT STATUE ON STONE BOULDERS (1.0x)
    // -------------------------------------------------------------
    this.drawFoxPedestal(ctx, cameraX, viewportWidth);

    // -------------------------------------------------------------
    // LAYER 8.5: LIVING PIXEL CATS (1.0x crisp midground)
    // -------------------------------------------------------------
    if (this.cats) {
      for (const cat of this.cats) {
        cat.draw(ctx, cameraX);
      }
    }

    // -------------------------------------------------------------
    // LAYER 9: AIRPORT RUNWAY & RIGHT-FACING AIRLINER (1.0x)
    // -------------------------------------------------------------
    this.drawRunwayAndAirplane(ctx, cameraX, viewportWidth);
  }

  drawForeground(ctx, cameraX, viewportWidth, viewportHeight, aliceX, aliceY) {
    // 1. Rich Foreground Depth Layer (100% solid, crisp, overhanging birch canopy & cast-iron railing)
    this.renderForegroundDepth(ctx, cameraX, viewportWidth, viewportHeight);

    // 2. In-focus fireflies
    this.drawFireflies(ctx, cameraX);

    // 3. Minimalist [ F ] interaction prompt above Alice / landmark
    this.drawMinimalistInteraction(ctx, cameraX, viewportWidth, aliceX, aliceY);
  }

  drawPassingForegroundBokeh(ctx, cameraX, viewportWidth) {
    const time = Date.now() * 0.001;
    // Passing cherry blossom petals & evening leaves fluttering in the wind (depth of field)
    this.fgLeaves.forEach(l => {
      const sx = (l.x - cameraX * l.parallax + Math.sin(time * 3 + l.sway) * 8) % (this.worldWidth + 400);
      const drawX = sx < -40 ? sx + this.worldWidth + 400 : sx;
      if (drawX >= -30 && drawX <= viewportWidth + 30) {
        ctx.fillStyle = l.color;
        ctx.fillRect(Math.round(drawX), Math.round(l.y), Math.round(l.size), Math.round(l.size * 0.7));
      }
    });
  }

  draw(ctx, cameraX, viewportWidth, viewportHeight, aliceX, aliceY) {
    this.drawBackground(ctx, cameraX, viewportWidth, viewportHeight);
    this.drawMidground(ctx, cameraX, viewportWidth, viewportHeight);
    this.drawForeground(ctx, cameraX, viewportWidth, viewportHeight, aliceX, aliceY);
  }

  drawGroundedPromenadeBase(ctx, viewportWidth) {
    const groundLevel = this.groundY; // 220

    // 1. Dark granite foundation embankment strip behind the street
    ctx.fillStyle = '#1c1426';
    ctx.fillRect(0, groundLevel - 8, viewportWidth, 14);

    // 2. Stone retaining curb line
    ctx.fillStyle = '#3a2c48';
    ctx.fillRect(0, groundLevel - 8, viewportWidth, 2);

    // 3. Subtle evening grass / verge accents between buildings
    ctx.fillStyle = '#1e2422';
    ctx.fillRect(0, groundLevel - 6, viewportWidth, 3);
  }

  drawDriftingClouds(ctx, cameraX, viewportWidth) {
    if (!this.cloudImgs || this.cloudImgs.length === 0) return;
    this.clouds.forEach(c => {
      const img = this.cloudImgs[c.imgIdx % this.cloudImgs.length];
      if (img && img.complete) {
        const sx = Math.round(c.x - cameraX * c.parallax);
        const w = img.width;
        const h = img.height;
        if (sx > -w && sx < viewportWidth + w) {
          ctx.save();
          ctx.globalAlpha = 0.75;
          ctx.drawImage(img, sx, c.y, w, h);
          ctx.restore();
        }
      }
    });
  }

  drawBoulevardTrees(ctx, cameraX, viewportWidth, targetDepth = 0) {
    const baselineY = this.groundY + 6;
    this.trees.filter(t => t.depth === targetDepth).forEach(t => {
      let img = null;
      if (t.type === 'birch1') img = this.photoBirch1;
      else if (t.type === 'birch2') img = this.photoBirch2;
      else if (t.type === 'birch3') img = this.photoBirch3;
      else if (t.type === 'flowering') img = this.photoFloweringTree;
      else if (t.type === 'willow') img = this.photoWillow;

      if (img && img.complete) {
        const sx = Math.round(t.x - cameraX);
        const w = img.width;
        const h = img.height;
        if (sx > -w - 30 && sx < viewportWidth + 30) {
          // Tree base contact shadow
          ctx.fillStyle = 'rgba(10, 5, 15, 0.50)';
          ctx.beginPath();
          ctx.ellipse(sx + w / 2, this.groundY - 1, w * 0.25, 3, 0, 0, Math.PI * 2);
          ctx.fill();

          ctx.drawImage(img, sx, baselineY - h, w, h);
        }
      }
    });
  }

  drawCurbFlowerbeds(ctx, cameraX, viewportWidth) {
    this.flowerbeds.forEach(fb => {
      let img = null;
      if (fb.type === 'flowers1') img = this.photoFlowers1;
      else if (fb.type === 'flowers2') img = this.photoFlowers2;
      else if (fb.type === 'bush1') img = this.photoBush1;
      else if (fb.type === 'bush2') img = this.photoBush2;
      else if (fb.type === 'sunflowers') img = this.photoSunflowers;

      if (img && img.complete) {
        const sx = Math.round(fb.x - cameraX);
        const w = img.width;
        const h = img.height;
        if (sx > -w - 20 && sx < viewportWidth + 20) {
          ctx.drawImage(img, sx, this.groundY - h + 4, w, h);
        }
      }
    });
  }

  drawPerchedBirds(ctx, cameraX, viewportWidth) {
    if (!this.birdImgs || this.birdImgs.length === 0) return;
    this.birds.forEach(b => {
      const img = this.birdImgs[b.imgIdx % this.birdImgs.length];
      if (img && img.complete) {
        const sx = Math.round(b.x - cameraX);
        if (sx > -30 && sx < viewportWidth + 30) {
          ctx.drawImage(img, sx, b.y, img.width, img.height);
        }
      }
    });
  }

  renderDistantArchitecture(ctx, cameraX, viewportWidth) {
    let runwayAlpha = 1.0;
    if (cameraX > 1850) {
      runwayAlpha = Math.max(0, Math.min(1, 1 - (cameraX - 1850) / 160));
    }
    if (runwayAlpha <= 0) return;

    const baselineY = this.groundY + 2;

    // LAYER 1: FAR HORIZON ARCHITECTURAL CLUSTER (Parallax 0.35x, softly blurred 0.6px)
    if (this.photoBgCluster && this.photoBgCluster.complete) {
      ctx.save();
      ctx.globalAlpha = 1.0 * runwayAlpha;
      ctx.filter = 'blur(0.6px)';
      const pFar = 0.35;
      const clusterW = 640;
      const clusterH = 155;
      const clusterPositions = [-40, 600, 1240, 1880, 2520];

      for (const wx of clusterPositions) {
        const sx = Math.round(wx - cameraX * pFar);
        if (sx >= -clusterW && sx <= viewportWidth + 50) {
          ctx.drawImage(this.photoBgCluster, sx, baselineY - clusterH, clusterW, clusterH);
        }
      }
      ctx.restore();
    }

    // LAYER 2: MID-GROUND SARANSK STREETSCAPE (Parallax 0.52x, softly blurred 0.5px)
    ctx.save();
    ctx.globalAlpha = 1.0 * runwayAlpha;
    ctx.filter = 'blur(0.5px)';
    const pMid = 0.52;

    const midBuildings = [
      { type: 'rotunda', x: 20, w: 135, h: 170 },
      { type: 'stalinka', x: 145, w: 140, h: 165 },
      { type: 'merchant', x: 275, w: 125, h: 140 },
      { type: 'post', x: 410, w: 140, h: 160 },
      { type: 'bakery', x: 545, w: 125, h: 135 },
      { type: 'rotunda', x: 670, w: 135, h: 170 },
      { type: 'stalinka', x: 800, w: 140, h: 165 },
      { type: 'merchant', x: 935, w: 125, h: 140 },
      { type: 'post', x: 1065, w: 140, h: 160 },
      { type: 'bakery', x: 1200, w: 125, h: 135 },
      { type: 'rotunda', x: 1330, w: 135, h: 170 },
      { type: 'stalinka', x: 1460, w: 140, h: 165 },
      { type: 'merchant', x: 1595, w: 125, h: 140 },
      { type: 'post', x: 1725, w: 140, h: 160 },
      { type: 'bakery', x: 1860, w: 125, h: 135 },
      { type: 'rotunda', x: 1990, w: 135, h: 170 },
      { type: 'stalinka', x: 2120, w: 140, h: 165 },
      { type: 'merchant', x: 2255, w: 125, h: 140 }
    ];

    for (const b of midBuildings) {
      let img = null;
      if (b.type === 'rotunda') img = this.photoBgCornerRotunda;
      else if (b.type === 'stalinka') img = this.photoBgStalinkaLenina;
      else if (b.type === 'merchant') img = this.photoBgMerchantBrick;
      else if (b.type === 'bakery') img = this.photoBgBakery;
      else if (b.type === 'post') img = this.photoBgPostOffice;

      if (img && img.complete) {
        const sx = Math.round(b.x - cameraX * pMid);
        if (sx >= -b.w - 50 && sx <= viewportWidth + 50) {
          ctx.drawImage(img, sx, baselineY - b.h, b.w, b.h);
        }
      }
    }
    ctx.restore();
  }

  drawDistantSkyline(ctx, cameraX, viewportWidth) {
    const horizonY = this.groundY;
    const parallax = 0.20;

    // Distant Pushkin Park Ferris Wheel
    if (this.photoFerris && this.photoFerris.complete) {
      const ferrisScreenX = Math.round(780 - cameraX * parallax);
      if (ferrisScreenX > -150 && ferrisScreenX < viewportWidth + 150) {
        ctx.drawImage(this.photoFerris, ferrisScreenX, horizonY - 120, 110, 120);

        const colors = ['#ff7ebb', '#ffd166', '#06d6a0', '#118ab2'];
        for (let i = 0; i < 12; i++) {
          const angle = (Date.now() * 0.001) + (i / 12) * Math.PI * 2;
          const cx = ferrisScreenX + 55 + Math.cos(angle) * 44;
          const cy = horizonY - 70 + Math.sin(angle) * 44;
          ctx.fillStyle = colors[i % colors.length];
          ctx.fillRect(Math.round(cx - 1), Math.round(cy - 1), 2, 2);
        }
      }
    }
  }

  drawSaranskUniqueLandmarks(ctx, cameraX, viewportWidth) {
    const baselineY = this.groundY + 4; // Solidly planted 4px beneath the curb!

    // 0.1. Midground Stalinka on Lenin Ave at x = 140
    if (this.photoBgStalinkaLenina && this.photoBgStalinkaLenina.complete) {
      const sx = Math.round(140 - cameraX);
      const w = 140;
      const h = 165;
      if (sx > -w - 30 && sx < viewportWidth + 30) {
        ctx.fillStyle = 'rgba(10, 5, 15, 0.65)';
        ctx.fillRect(sx - 4, this.groundY - 2, w + 8, 4);
        ctx.drawImage(this.photoBgStalinkaLenina, sx, baselineY - h, w, h);
      }
    }

    // 0.2. Midground Red-Brick Merchant Mansion at x = 340
    if (this.photoBgMerchantBrick && this.photoBgMerchantBrick.complete) {
      const sx = Math.round(340 - cameraX);
      const w = 125;
      const h = 140;
      if (sx > -w - 30 && sx < viewportWidth + 30) {
        ctx.fillStyle = 'rgba(10, 5, 15, 0.65)';
        ctx.fillRect(sx - 4, this.groundY - 2, w + 8, 4);
        ctx.drawImage(this.photoBgMerchantBrick, sx, baselineY - h, w, h);
      }
    }

    // 0.3. Midground Corner Rotunda Building at x = 530
    if (this.photoBgCornerRotunda && this.photoBgCornerRotunda.complete) {
      const sx = Math.round(530 - cameraX);
      const w = 135;
      const h = 170;
      if (sx > -w - 30 && sx < viewportWidth + 30) {
        ctx.fillStyle = 'rgba(10, 5, 15, 0.65)';
        ctx.fillRect(sx - 4, this.groundY - 2, w + 8, 4);
        ctx.drawImage(this.photoBgCornerRotunda, sx, baselineY - h, w, h);
      }
    }

    // 1. Mordovian National Drama Theatre at x = 720 (Landmark)
    if (this.photoTheatre && this.photoTheatre.complete) {
      const sx = Math.round(720 - cameraX);
      const w = this.photoTheatre.width;
      const h = this.photoTheatre.height;
      if (sx > -w - 30 && sx < viewportWidth + 30) {
        ctx.fillStyle = 'rgba(10, 5, 15, 0.70)';
        ctx.fillRect(sx - 4, this.groundY - 2, w + 8, 4);

        // Theatre portico illumination
        const glow = ctx.createRadialGradient(sx + w / 2, baselineY - 40, 6, sx + w / 2, baselineY - 40, 60);
        glow.addColorStop(0, 'rgba(255, 220, 130, 0.35)');
        glow.addColorStop(1, 'rgba(255, 180, 70, 0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(sx + w / 2, baselineY - 40, 60, 0, Math.PI * 2);
        ctx.fill();

        ctx.drawImage(this.photoTheatre, sx, baselineY - h, w, h);
      }
    }

    // 1.5. Midground Cozy Bakery / Bookstore at x = 915
    if (this.photoBgBakery && this.photoBgBakery.complete) {
      const sx = Math.round(915 - cameraX);
      const w = 125;
      const h = 135;
      if (sx > -w - 30 && sx < viewportWidth + 30) {
        ctx.fillStyle = 'rgba(10, 5, 15, 0.55)';
        ctx.fillRect(sx - 3, this.groundY - 2, w + 6, 4);

        // Warm window glow
        const glow = ctx.createRadialGradient(sx + 40, baselineY - 35, 4, sx + 40, baselineY - 35, 45);
        glow.addColorStop(0, 'rgba(255, 215, 120, 0.35)');
        glow.addColorStop(1, 'rgba(255, 150, 60, 0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(sx + 40, baselineY - 35, 45, 0, Math.PI * 2);
        ctx.fill();

        ctx.drawImage(this.photoBgBakery, sx, baselineY - h, w, h);
      }
    }

    // 2. Cathedral of St. Theodore Ushakov at x = 1080
    if (this.photoCathedral && this.photoCathedral.complete) {
      const sx = Math.round(1080 - cameraX);
      const w = this.photoCathedral.width;
      const h = this.photoCathedral.height;
      if (sx > -w - 30 && sx < viewportWidth + 30) {
        // Cathedral base terrace firmly planted into ground
        ctx.fillStyle = '#22192e';
        ctx.fillRect(sx - 15, this.groundY - 8, w + 30, 14);
        ctx.fillStyle = '#3a2d48';
        ctx.fillRect(sx - 12, this.groundY - 10, w + 24, 3);

        ctx.drawImage(this.photoCathedral, sx, this.groundY - h + 2, w, h);
      }
    }

    // 2.5. Midground Neoclassical Post Office at x = 1300
    if (this.photoBgPostOffice && this.photoBgPostOffice.complete) {
      const sx = Math.round(1300 - cameraX);
      const w = 140;
      const h = 160;
      if (sx > -w - 30 && sx < viewportWidth + 30) {
        ctx.fillStyle = 'rgba(10, 5, 15, 0.65)';
        ctx.fillRect(sx - 4, this.groundY - 2, w + 8, 4);
        ctx.drawImage(this.photoBgPostOffice, sx, baselineY - h, w, h);
      }
    }

    // 4. Erzia Museum of Fine Arts at x = 1460
    if (this.photoErzia && this.photoErzia.complete) {
      const sx = Math.round(1460 - cameraX);
      const w = this.photoErzia.width;
      const h = this.photoErzia.height;
      if (sx > -w - 30 && sx < viewportWidth + 30) {
        ctx.fillStyle = 'rgba(10, 5, 15, 0.65)';
        ctx.fillRect(sx - 4, this.groundY - 2, w + 8, 4);

        ctx.drawImage(this.photoErzia, sx, baselineY - h, w, h);
      }
    }

    // 4.5. Midground Merchant Mansion at x = 1620
    if (this.photoBgMerchantBrick && this.photoBgMerchantBrick.complete) {
      const sx = Math.round(1620 - cameraX);
      const w = 125;
      const h = 140;
      if (sx > -w - 30 && sx < viewportWidth + 30) {
        ctx.fillStyle = 'rgba(10, 5, 15, 0.65)';
        ctx.fillRect(sx - 4, this.groundY - 2, w + 8, 4);
        ctx.drawImage(this.photoBgMerchantBrick, sx, baselineY - h, w, h);
      }
    }

    // 5. Ogarev Mordovia State University High-Rise ("МГУ Высотка") at x = 1740
    if (this.photoMgu && this.photoMgu.complete) {
      const sx = Math.round(1740 - cameraX);
      const w = this.photoMgu.width;
      const h = this.photoMgu.height;
      if (sx > -w - 30 && sx < viewportWidth + 30) {
        ctx.fillStyle = 'rgba(10, 5, 15, 0.65)';
        ctx.fillRect(sx - 6, this.groundY - 2, w + 12, 4);

        // Golden Spire Glow
        const spireGlow = ctx.createRadialGradient(sx + w / 2, baselineY - h + 20, 2, sx + w / 2, baselineY - h + 20, 35);
        spireGlow.addColorStop(0, 'rgba(255, 235, 140, 0.45)');
        spireGlow.addColorStop(1, 'rgba(255, 200, 70, 0)');
        ctx.fillStyle = spireGlow;
        ctx.beginPath();
        ctx.arc(sx + w / 2, baselineY - h + 20, 35, 0, Math.PI * 2);
        ctx.fill();

        ctx.drawImage(this.photoMgu, sx, baselineY - h, w, h);
      }
    }
  }

  drawCobblestoneRoad(ctx, cameraX, viewportWidth) {
    const roadY = this.groundY;
    const roadHeight = 50;

    if (this.photoCobble && this.photoCobble.complete) {
      const tileW = this.photoCobble.width;
      const firstTile = Math.floor((cameraX - tileW) / tileW);
      const lastTile = Math.floor((cameraX + viewportWidth + tileW) / tileW);
      for (let t = firstTile; t <= lastTile; t++) {
        const worldX = t * tileW;
        const screenX = Math.round(worldX - cameraX);
        ctx.drawImage(this.photoCobble, screenX, roadY, tileW, roadHeight);
      }
    } else {
      ctx.fillStyle = '#211a2c';
      ctx.fillRect(0, roadY, viewportWidth, roadHeight);
    }
  }

  drawStreetLamps(ctx, cameraX, viewportWidth) {
    this.streetLamps.forEach(lampX => {
      const screenX = lampX - cameraX;
      if (screenX >= -40 && screenX <= viewportWidth + 40) {
        const lx = Math.round(screenX);
        const ly = this.groundY;

        // Warm radial light aura on the cobblestones
        const halo = ctx.createRadialGradient(lx, ly - 50, 4, lx, ly - 50, 56);
        halo.addColorStop(0, 'rgba(255, 220, 130, 0.40)');
        halo.addColorStop(0.5, 'rgba(255, 170, 70, 0.15)');
        halo.addColorStop(1, 'rgba(255, 150, 50, 0)');
        ctx.fillStyle = halo;
        ctx.beginPath();
        ctx.arc(lx, ly - 50, 56, 0, Math.PI * 2);
        ctx.fill();

        if (this.photoStreetlamp && this.photoStreetlamp.complete) {
          ctx.drawImage(this.photoStreetlamp, lx - 12, ly - 68, 24, 68);
        } else {
          ctx.fillStyle = '#181220';
          ctx.fillRect(lx - 2, ly - 56, 4, 56);
          ctx.fillStyle = '#fff0b3';
          ctx.fillRect(lx - 4, ly - 56, 8, 10);
        }
      }
    });
  }

  drawFoxPedestal(ctx, cameraX, viewportWidth) {
    const foxScreenX = 420 - cameraX;
    if (foxScreenX >= -60 && foxScreenX <= viewportWidth + 60) {
      const fx = Math.round(foxScreenX);
      const fy = this.groundY + 2;

      // Contact shadow
      ctx.fillStyle = 'rgba(10, 5, 15, 0.65)';
      ctx.fillRect(fx - 24, fy - 4, 48, 6);

      if (this.photoFox && this.photoFox.complete) {
        ctx.drawImage(this.photoFox, fx - 25, fy - 48, 49, 48);
      } else {
        ctx.fillStyle = '#372d47';
        ctx.fillRect(fx - 24, fy - 16, 48, 16);
      }
    }
  }

  drawRunwayAndAirplane(ctx, cameraX, viewportWidth) {
    this.lastCameraX = cameraX;
    const runwayStart = 1920;
    const runwayEnd = 2750;

    // 1. Runway Tarmac Surface
    const rx = Math.round(runwayStart - cameraX);
    const rw = runwayEnd - runwayStart;
    const gy = this.groundY;
    const gHeight = 50;

    if (rx + rw > -50 && rx < viewportWidth + 50) {
      // Dark tarmac pavement
      ctx.fillStyle = '#14131d';
      ctx.fillRect(rx, gy, rw, gHeight);

      // Top curb & border line
      ctx.fillStyle = '#262033';
      ctx.fillRect(rx, gy, rw, 3);
      ctx.fillStyle = '#4e4063';
      ctx.fillRect(rx, gy, rw, 1);

      // White runway edge boundary lines (top and bottom)
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(rx + 10, gy + 3, rw - 20, 2);
      ctx.fillRect(rx + 10, gy + gHeight - 3, rw - 20, 2);

      // Green threshold flush lights
      for (let ty = gy + 7; ty <= gy + 41; ty += 5) {
        ctx.fillStyle = '#00f5d4';
        ctx.shadowColor = '#00f5d4';
        ctx.shadowBlur = 4;
        ctx.fillRect(rx + 12, ty, 3, 2);
      }
      ctx.shadowBlur = 0;

      // Solid white transverse threshold bar
      ctx.fillStyle = '#f0edf6';
      ctx.fillRect(rx + 17, gy + 5, 5, 38);

      // Runway threshold piano keys (8 crisp bars)
      for (let s = 0; s < 8; s++) {
        ctx.fillRect(Math.round(rx + 26 + s * 9), gy + 7, 5, 34);
      }

      // Stencil "24" Runway Designation Number (pixel font)
      const numX = rx + 106;
      const numY = gy + 16;
      ctx.fillStyle = '#e8edf5';
      // "2"
      ctx.fillRect(numX, numY, 9, 2);
      ctx.fillRect(numX + 7, numY + 2, 2, 6);
      ctx.fillRect(numX, numY + 7, 9, 2);
      ctx.fillRect(numX, numY + 9, 2, 6);
      ctx.fillRect(numX, numY + 14, 9, 2);
      // "4"
      ctx.fillRect(numX + 13, numY, 2, 9);
      ctx.fillRect(numX + 13, numY + 8, 9, 2);
      ctx.fillRect(numX + 19, numY, 2, 16);

      // Aiming point markers (touchdown zone bars)
      ctx.fillRect(rx + 145, gy + 8, 26, 7);
      ctx.fillRect(rx + 145, gy + 33, 26, 7);

      // Runway Centerline dashes (crisp yellow)
      for (let cx = rx + 185; cx < rx + rw - 30; cx += 36) {
        ctx.fillStyle = '#ffd166';
        ctx.fillRect(Math.round(cx), gy + 23, 18, 3);
      }

      // Runway Edge Lights (Warm golden glow)
      for (let lx = runwayStart + 10; lx < runwayEnd; lx += 45) {
        const sx = Math.round(lx - cameraX);
        if (sx >= -10 && sx <= viewportWidth + 10) {
          const isGreen = lx < runwayStart + 50;
          const lightCol = isGreen ? '#00f5d4' : '#ffd166';
          const pulse = Math.sin(Date.now() * 0.005 + lx) * 0.25 + 0.75;

          // Light aura on ground
          ctx.fillStyle = isGreen ? `rgba(0, 245, 212, ${pulse * 0.35})` : `rgba(255, 209, 102, ${pulse * 0.35})`;
          ctx.beginPath();
          ctx.arc(sx, gy - 2, 6, 0, Math.PI * 2);
          ctx.fill();

          // Fixture post
          ctx.fillStyle = '#3a2d48';
          ctx.fillRect(sx - 1, gy - 5, 2, 5);
          ctx.fillStyle = lightCol;
          ctx.fillRect(sx - 2, gy - 7, 4, 3);
        }
      }
    }

    // 2. Airplane exhaust particles
    this.airplane.exhaustParticles.forEach(p => {
      const sx = Math.round(p.x - cameraX);
      if (sx >= -10 && sx <= viewportWidth + 10) {
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, Math.min(1, p.alpha));
        ctx.fillRect(sx, Math.round(p.y), 2, 2);
        ctx.globalAlpha = 1.0;
      }
    });

    // 3. Draw Airplane (Facing RIGHT!)
    const ax = Math.round(this.airplane.x - cameraX);
    const ay = Math.round(this.airplane.y);

    if (ax > -260 && ax < viewportWidth + 260) {
      if (this.airplane.state === 'takeoff') {
        // In flight sprite (nose up facing right)
        if (this.photoAirplaneFlight && this.photoAirplaneFlight.complete) {
          ctx.save();
          ctx.translate(ax + 110, ay - 35);
          ctx.rotate(-0.12); // Nose up pitch
          ctx.drawImage(this.photoAirplaneFlight, -110, -35, 220, 75);
          ctx.restore();
        }
      } else {
        // On tarmac with airstairs on left
        const planeImg = (this.airplane.state === 'boarded' || this.airplane.state === 'taxi')
          ? this.photoAirplaneBoarded
          : this.photoAirplaneTarmac;

        if (planeImg && planeImg.complete) {
          // Contact shadow
          ctx.fillStyle = 'rgba(10, 5, 15, 0.75)';
          ctx.fillRect(ax + 20, this.groundY - 2, 185, 4);
          ctx.drawImage(planeImg, ax, ay - 70, 220, 75);
        }
      }
    }
  }

  renderForegroundDepth(ctx, cameraX, viewportWidth, viewportHeight) {
    ctx.save();
    ctx.filter = 'blur(1.8px)';
    ctx.globalAlpha = 0.96;

    // 1. Bottom Decorative Cast-Iron Embankment Railing (snug against the bottom edge)
    if (this.photoFgRailing && this.photoFgRailing.complete) {
      const pRail = 1.12;
      const railW = 128;
      const railH = 36;
      const railY = viewportHeight - 22; // snug against the bottom edge

      const startX = -((cameraX * pRail) % railW);
      const loopStart = startX > 0 ? startX - railW : startX;
      for (let rx = loopStart; rx < viewportWidth + railW; rx += railW) {
        const worldX = (rx + cameraX * pRail);
        if (worldX < 1920) {
          ctx.drawImage(this.photoFgRailing, Math.round(rx), railY, railW, railH);
        }
      }
    }

    // 3. Foreground Flower Planters with Blooming Marigolds (every ~360px along railing)
    if (this.photoFgPlanter && this.photoFgPlanter.complete) {
      const pPot = 1.12;
      const planterPositions = [140, 500, 860, 1220, 1580];
      const planterW = 36;
      const planterH = 32;
      const planterY = viewportHeight - 30;

      for (const wx of planterPositions) {
        const sx = Math.round(wx - cameraX * pPot);
        if (sx >= -50 && sx <= viewportWidth + 50) {
          ctx.drawImage(this.photoFgPlanter, sx, planterY, planterW, planterH);
        }
      }
    }

    // 4. Foreground Cast-Iron Streetlamps with warm glow
    if (this.photoFgStreetlamp && this.photoFgStreetlamp.complete) {
      const pLamp = 1.18;
      const lampPositions = [260, 860, 1460];
      const lampW = 28;
      const lampH = 76;
      const lampY = viewportHeight - 65;

      for (const wx of lampPositions) {
        const sx = Math.round(wx - cameraX * pLamp);
        if (sx >= -40 && sx <= viewportWidth + 40) {
          const halo = ctx.createRadialGradient(sx + 14, lampY + 22, 2, sx + 14, lampY + 22, 28);
          halo.addColorStop(0, 'rgba(255, 230, 140, 0.35)');
          halo.addColorStop(1, 'rgba(255, 180, 70, 0)');
          ctx.fillStyle = halo;
          ctx.beginPath();
          ctx.arc(sx + 14, lampY + 22, 28, 0, Math.PI * 2);
          ctx.fill();

          ctx.drawImage(this.photoFgStreetlamp, sx, lampY, lampW, lampH);
        }
      }
    }

    // 5. Passing golden birch leaves & petals fluttering in the breeze
    this.drawPassingForegroundBokeh(ctx, cameraX, viewportWidth);

    ctx.restore();
  }

  drawFireflies(ctx, cameraX) {
    this.fireflies.forEach(f => {
      const screenX = f.x - cameraX;
      if (screenX >= -5 && screenX <= 485) {
        const alpha = Math.abs(Math.sin(f.alpha));
        ctx.fillStyle = `rgba(255, 235, 140, ${alpha * 0.8})`;
        ctx.fillRect(Math.round(screenX), Math.round(f.y), 2, 2);
      }
    });
  }

  drawMinimalistInteraction(ctx, cameraX, viewportWidth, aliceX, aliceY) {
    // 1. If player is near an interactive landmark, show minimal prompt: [ F ] centered directly on the landmark
    if (this.activeLandmark) {
      const lm = this.activeLandmark;
      const screenX = Math.round(lm.x - cameraX);
      let promptY = 145;
      if (lm.type === 'cathedral' || lm.type === 'mgu') {
        promptY = 140;
      } else if (lm.type === 'fox') {
        promptY = 155;
      }

      // Cute subtle hovering pulse
      const floatOffset = Math.sin(this.promptPulse) * 2.5;

      ctx.save();
      // Small rounded button badge [ F ]
      const btnW = 24;
      const btnH = 15;
      const bx = Math.round(screenX - btnW / 2);
      const by = Math.round(promptY + floatOffset);

      // Badge background
      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.fillRect(bx, by, btnW, btnH);
      ctx.strokeStyle = '#ff4081';
      ctx.lineWidth = 1;
      ctx.strokeRect(bx, by, btnW, btnH);

      // Glow aura
      ctx.shadowColor = '#ff7ebb';
      ctx.shadowBlur = 6;

      // Key icon text "F"
      ctx.font = 'bold 12px "Handjet", "VT323", monospace';
      ctx.fillStyle = '#d81b60';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('F', screenX, by + btnH / 2 + 1);

      ctx.restore();
    }

    // 2. If landmark is inspected, show minimal clean title (no stars, minimal clean background)
    if (this.inspectedLandmark) {
      ctx.save();
      const text = this.inspectedLandmark.title;
      ctx.font = 'bold 13px "Handjet", "VT323", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const textWidth = ctx.measureText(text).width;

      const badgeW = textWidth + 16;
      const badgeH = 18;
      const badgeX = viewportWidth / 2;
      const badgeY = 250;

      // Clean subtle card without heavy borders
      ctx.fillStyle = 'rgba(255, 255, 255, 0.94)';
      ctx.fillRect(badgeX - badgeW / 2, badgeY - badgeH / 2, badgeW, badgeH);

      ctx.fillStyle = '#8a1d48';
      ctx.fillText(text, badgeX, badgeY + 1);

      ctx.restore();
    }

    // 3. Cat Petting Prompt (minimalist, no box, no frame, no stars)
    // Only show prompt for unpetted cats to avoid clutter when cats follow Alice
    if (this.nearbyCat && !this.nearbyCat.isPetted) {
      const cat = this.nearbyCat;
      const sx = Math.round(cat.x - cameraX);
      const floatOffset = Math.sin(this.promptPulse * 1.5) * 2;
      const py = Math.round(cat.groundY - 32 + floatOffset);

      const label = '[ F ] ПОГЛАДИТЬ';

      ctx.save();
      ctx.font = 'bold 12px "Handjet", "VT323", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // 1px dark text outline for perfect readability
      ctx.fillStyle = '#100516';
      ctx.fillText(label, sx + 1, py);
      ctx.fillText(label, sx - 1, py);
      ctx.fillText(label, sx, py + 1);
      ctx.fillText(label, sx, py - 1);

      // Clean crisp white text
      ctx.fillStyle = '#ffffff';
      ctx.fillText(label, sx, py);
      ctx.restore();
    }

    // 4. Top-Right Cat Counter Badge (clean minimal)
    if (this.cats && this.cats.length > 0) {
      const pettedCount = this.cats.filter(c => c.isPetted).length;
      const totalCats = this.cats.length;
      const badgeX = viewportWidth - 14;
      const badgeY = 12;

      ctx.save();
      ctx.font = 'bold 12px "Handjet", "VT323", monospace';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';

      const icon = pettedCount === totalCats ? '♥' : '🐾';
      const text = `${icon} ${pettedCount}/${totalCats}`;

      // 1px dark outline
      ctx.fillStyle = '#100516';
      ctx.fillText(text, badgeX + 1, badgeY);
      ctx.fillText(text, badgeX - 1, badgeY);
      ctx.fillText(text, badgeX, badgeY + 1);
      ctx.fillText(text, badgeX, badgeY - 1);

      ctx.fillStyle = pettedCount === totalCats ? '#ff6090' : '#ffffff';
      ctx.fillText(text, badgeX, badgeY);
      ctx.restore();
    }
  }
}
