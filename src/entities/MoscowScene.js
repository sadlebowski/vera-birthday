/**
 * Rich, Seamless 2D Photo-Pixel Art World of Moscow (Level 2)
 * 
 * Features:
 * - Authentic Red Square & Moscow granite cobblestones ("брусчатка") with monumental curb
 * - Historic cast-iron street lanterns with warm amber glow
 * - Real photograph pixel-art landmarks (Floyd-Steinberg quantized):
 *   1. Moscow-City Skyline (illuminated skyscrapers background) [x = 480]
 *   2. Bolshoi Theatre of Russia (summer front view with Apollo quadriga) [x = 820]
 *   3. TSUM Central Department Store (summer Petrovka Gothic facade) [x = 1180]
 *   4. RGSU Main University Building (summer Wilhelm Pieck colonnade) [x = 1520]
 *   5. Spasskaya Tower of the Moscow Kremlin with ruby star and clock [x = 1860]
 *   6. Saint Basil's Cathedral (Pokrovsky Cathedral, summer domes) [x = 2200]
 *   7. Grand Birthday Cake Finale with candles, fireworks and letter [x = 2500]
 *   8. Departure Runway & Passenger Airliner waiting for the next journey! [x = 2920]
 * - Cinematic airplane landing sequence: touchdown on runway, stops early at x = 180, airstairs deploy, Alice disembarks
 * - Minimalist [ F ] interaction system
 */
import { PixelCat } from './PixelCat.js';

export class MoscowScene {
  constructor(gameConfig) {
    this.config = gameConfig;
    this.worldWidth = 3100;
    this.groundY = 220;
    this.aliceGroundY = 224;

    // Textures
    this.photoSky = null;
    this.photoCobble = null;
    this.photoPavement = null;
    this.photoLantern = null;
    this.photoCity = null;
    this.photoBolshoi = null;
    this.photoTsum = null;
    this.photoRgsu = null;
    this.photoTriumphalArch = null;
    this.photoVasily = null;
    this.photoAirplaneTarmac = null;
    this.photoAirplaneBoarded = null;
    this.photoAirplaneFlight = null;

    // Background Architecture (Authentic Central Moscow)
    this.photoBgEmpire = null;
    this.photoBgModern = null;
    this.photoBgCorner = null;
    this.photoBgStalin = null;
    this.photoBgMerchant = null;
    this.photoBgCluster = null;

    // Authentic Moscow Flora & Vegetation (Popular Moscow trees & shrubs)
    this.photoLinden = null;
    this.photoSpruce = null;
    this.photoLilac = null;
    this.photoChestnut = null;
    this.photoRowan = null;

    // Foreground Depth Assets (Parallax 1.12x..1.20x, Blurred DoF)
    this.photoFgCanopy = null;
    this.photoFgRailing = null;
    this.photoFgPot = null;
    this.photoFgStreetlamp = null;

    // Foreground Depth Coordinates
    this.fgCanopies = [220, 580, 940, 1300, 1660, 2020, 2380, 2740];
    this.fgStreetlamps = [180, 540, 900, 1260, 1620, 1980, 2340, 2700];
    this.fgPlanters = [360, 720, 1080, 1440, 1800, 2160, 2520];

    // Sunny Daytime Sky Layers (PACKS/background 1)
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

    // Moscow Trees along the promenade (placed at seams between buildings and in background)
    this.trees = [
      { type: 'birch1', x: 330, depth: 0 },
      { type: 'flowering', x: 620, depth: -1 },
      { type: 'birch2', x: 770, depth: -1 },
      { type: 'willow', x: 960, depth: -1 },
      { type: 'birch1', x: 1140, depth: -1 },
      { type: 'flowering', x: 1315, depth: -1 },
      { type: 'birch1', x: 1650, depth: -1 },
      { type: 'birch2', x: 1830, depth: -1 },
      { type: 'flowering', x: 1995, depth: -1 },
      { type: 'birch1', x: 2150, depth: -1 },
      { type: 'willow', x: 2350, depth: -1 },
      { type: 'birch1', x: 2420, depth: 0 },
      { type: 'birch1', x: 2650, depth: 0 }
    ];

    // Flowerbeds & festive garden bushes
    this.flowerbeds = [
      { type: 'flowers1', x: 380 },
      { type: 'bush1', x: 620 },
      { type: 'flowers2', x: 770 },
      { type: 'sunflowers', x: 960 },
      { type: 'flowers1', x: 1140 },
      { type: 'bush2', x: 1315 },
      { type: 'flowers2', x: 1650 },
      { type: 'sunflowers', x: 1830 },
      { type: 'flowers1', x: 1995 },
      { type: 'bush1', x: 2150 },
      { type: 'flowers2', x: 2350 },
      { type: 'sunflowers', x: 2420 },
      { type: 'sunflowers', x: 2570 },
      { type: 'bush2', x: 2650 }
    ];

    // Drifting clouds in the evening Moscow sky
    this.clouds = [
      { imgIdx: 1, x: 100, y: 20, speed: 2.0, parallax: 0.12 },
      { imgIdx: 3, x: 420, y: 45, speed: 2.6, parallax: 0.15 },
      { imgIdx: 0, x: 780, y: 15, speed: 1.7, parallax: 0.10 },
      { imgIdx: 5, x: 1150, y: 48, speed: 3.0, parallax: 0.18 },
      { imgIdx: 2, x: 1520, y: 25, speed: 2.2, parallax: 0.13 },
      { imgIdx: 4, x: 1900, y: 38, speed: 2.5, parallax: 0.16 },
      { imgIdx: 1, x: 2280, y: 22, speed: 1.9, parallax: 0.11 },
      { imgIdx: 3, x: 2650, y: 42, speed: 2.4, parallax: 0.14 },
      { imgIdx: 0, x: 2980, y: 18, speed: 1.8, parallax: 0.10 }
    ];

    // Birds perched on Moscow lanterns and trees
    this.birds = [
      { imgIdx: 1, x: 385, y: 150 },
      { imgIdx: 2, x: 675, y: 125 },
      { imgIdx: 0, x: 1035, y: 150 },
      { imgIdx: 3, x: 1720, y: 125 },
      { imgIdx: 1, x: 2060, y: 150 },
      { imgIdx: 2, x: 2400, y: 135 }
    ];

    // Airplane landing state machine
    // 'approaching' -> 'landing' -> 'touchdown' -> 'taxi' -> 'parked' -> 'disembarking' -> 'complete'
    // Halts early at x = 70 on the runway!
    this.airplane = {
      x: -300,
      y: 95,
      vx: 1.45,
      vy: 0.65,
      state: 'approaching',
      initialDelay: 80, // ~1.33 seconds of peaceful initial location view
      rot: -3, // slight nose-up flare while airborne (negative = nose up)
      propAngle: 0,
      disembarkTimer: 0,
      aliceYOffset: 0,
      touchdownSparks: []
    };

    this.landingComplete = false;
    this.onLandingComplete = null;

    // Departure airplane at the end of Moscow (x = 2920)
    this.departurePlane = {
      x: 2920,
      y: 220,
      state: 'waiting', // 'waiting' -> 'boarding' -> 'boarded' -> 'taxi' -> 'takeoff'
      propAngle: 0,
      beaconTimer: 0,
      boardTimer: 0,
      speed: 0,
      vy: 0,
      rot: 0,
      exhaustParticles: []
    };
    this.onTakeoffComplete = null;
    this.takeoffTriggered = false;

    // Twinkling Moscow stars
    this.stars = [];
    for (let i = 0; i < 90; i++) {
      this.stars.push({
        x: Math.random() * this.worldWidth,
        y: Math.random() * 110,
        size: Math.random() > 0.85 ? 2 : 1,
        color: Math.random() > 0.4 ? '#ffd4eb' : '#ffffff',
        twinkleSpeed: 0.03 + Math.random() * 0.06,
        twinkleOffset: Math.random() * Math.PI * 2
      });
    }

    // Moscow Lanterns along Red Square promenade (spaced cleanly between landmarks)
    this.streetLamps = [380, 680, 1010, 1350, 1690, 2030, 2370, 2680];

    // Moscow Landmarks: 1. City -> 2. RGSU -> 3. Bolshoi -> 4. Triumphal Arch -> 5. St. Basil -> 6. TSUM -> 7. Departure
    this.landmarks = [
      {
        id: 'city',
        x: 480,
        title: 'Москва-Сити',
        type: 'city',
        fact: 'Огни ночной столицы! Сияющие стеклянные башни небоскрёбов.'
      },
      {
        id: 'rgsu',
        x: 820,
        title: 'РГСУ',
        type: 'rgsu',
        fact: 'Главный корпус на улице Вильгельма Пика — знаменитый дом с монументальной колоннадой!'
      },
      {
        id: 'bolshoi',
        x: 1180,
        title: 'Большой театр',
        type: 'bolshoi',
        fact: 'Символ русского балета и оперы с античной квадригой Аполлона.'
      },
      {
        id: 'triumphal',
        x: 1520,
        title: 'Триумфальные ворота',
        type: 'triumphal',
        fact: 'Величественный монумент на Кутузовском проспекте с коринфскими колоннами и шестёркой коней!'
      },
      {
        id: 'vasily',
        x: 1860,
        title: 'Храм Василия Блаженного',
        type: 'vasily',
        fact: 'Шедевр русской архитектуры с неповторимыми сказочными узорчатыми куполами.'
      },
      {
        id: 'tsum',
        x: 2200,
        title: 'ЦУМ',
        type: 'tsum',
        fact: 'Легендарный исторический универмаг в стиле неоготики на Петровке!'
      },
      {
        id: 'departure',
        x: 2920,
        title: 'Лайнер',
        type: 'departure',
        fact: 'Впереди — новое удивительное место! Наше путешествие продолжается...'
      }
    ];

    this.activeLandmark = null;
    this.inspectedLandmark = null;
    this.promptPulse = 0;

    // Celebration & Departure
    this.fireworks = [];
    this.confetti = [];
    this.showDepartureLetter = false;

    // Ambient floating golden/pink dust particles
    this.ambientDust = [];
    for (let i = 0; i < 55; i++) {
      this.ambientDust.push({
        x: Math.random() * this.worldWidth,
        y: 100 + Math.random() * 115,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.2,
        alpha: Math.random(),
        color: Math.random() > 0.5 ? '#ffb6c1' : '#ffd700'
      });
    }

    // Blurred drifting foreground flower petals in Moscow daytime breeze
    this.fgLeaves = [];
    for (let i = 0; i < 20; i++) {
      this.fgLeaves.push({
        x: Math.random() * (this.worldWidth + 400),
        y: Math.random() * 260,
        size: 3 + Math.random() * 3,
        color: Math.random() > 0.5 ? '#ff80ab' : '#ffe082',
        parallax: 1.40,
        vx: -0.35 - Math.random() * 0.35,
        vy: 0.18 + Math.random() * 0.25,
        sway: Math.random() * Math.PI * 2
      });
    }

    // Cute living pixel cats across Moscow
    this.cats = [
      new PixelCat({
        x: 1140, // Bolshoi Theatre area
        groundY: this.aliceGroundY,
        breed: 'white',
        patrolRange: [1110, 1170],
        facing: 1
      }),
      new PixelCat({
        x: 1820, // St. Basil Cathedral area
        groundY: this.aliceGroundY,
        breed: 'black',
        patrolRange: [1790, 1850],
        facing: -1
      }),
      new PixelCat({
        x: 2220, // TSUM area
        groundY: this.aliceGroundY,
        breed: 'ginger',
        patrolRange: [2190, 2260],
        facing: 1
      })
    ];

    // Cat petting gameplay state
    this.nearbyCat = null;
    this.catsToastTimer = 0;
    this.catsCelebrated = false;

    this.loadTextures();
  }

  loadTextures() {
    const load = (src) => {
      const img = new Image();
      img.src = src;
      return img;
    };

    this.photoSky = load('./assets/photos/twilight_sky_seamless.png');
    this.photoCobble = load('./assets/photos/red_square_cobblestones.png');
    this.photoPavement = load('./assets/photos/moscow_arbat_pavement.png');
    this.photoLantern = load('./assets/photos/moscow_lantern.png');
    this.photoCity = load('./assets/photos/moscow_city_skyline_pixel.png');
    this.photoBolshoi = load('./assets/photos/moscow_bolshoi_theatre_pixel.png');
    this.photoTsum = load('./assets/photos/moscow_tsum_pixel.png');
    this.photoRgsu = load('./assets/photos/moscow_rgsu_pixel.png');
    this.photoTriumphalArch = load('./assets/photos/moscow_triumphal_arch_pixel.png');
    this.photoVasily = load('./assets/photos/moscow_vasily_blazhenny_pixel.png');
    this.photoCityFar = load('./assets/sky/city_layer_far.png');
    this.photoCityMid = load('./assets/sky/city_layer_mid.png');
    this.photoAirplaneTarmac = load('./assets/photos/airplane_tarmac_pixel.png');
    this.photoAirplaneBoarded = load('./assets/photos/airplane_tarmac_boarded_pixel.png');
    this.photoAirplaneFlight = load('./assets/photos/airplane_flight_pixel.png');

    // Load Authentic Historical Central Moscow Background Buildings
    this.photoBgEmpire = load('./assets/photos/moscow_bg_empire_mansion.png');
    this.photoBgModern = load('./assets/photos/moscow_bg_modern_facade.png');
    this.photoBgCorner = load('./assets/photos/moscow_bg_corner_dome.png');
    this.photoBgStalin = load('./assets/photos/moscow_bg_stalin_neoclassic.png');
    this.photoBgMerchant = load('./assets/photos/moscow_bg_merchant_house.png');
    this.photoBgCluster = load('./assets/photos/moscow_bg_cluster.png');

    // Load Popular Moscow Trees & Vegetation
    this.photoLinden = load('./assets/photos/moscow_linden_tree.png');
    this.photoSpruce = load('./assets/photos/moscow_kremlin_spruce.png');
    this.photoLilac = load('./assets/photos/moscow_lilac_bush.png');
    this.photoChestnut = load('./assets/photos/moscow_chestnut_tree.png');
    this.photoRowan = load('./assets/photos/moscow_rowan_tree.png');

    // Load Foreground Depth Assets (Parallax 1.12x..1.20x, Blurred DoF)
    this.photoFgCanopy = load('./assets/photos/moscow_fg_canopy.png');
    this.photoFgRailing = load('./assets/photos/moscow_fg_railing.png');
    this.photoFgPot = load('./assets/photos/moscow_fg_pot.png');
    this.photoFgStreetlamp = load('./assets/photos/moscow_fg_streetlamp.png');

    // Load Sunny Daytime Sky Layers (PACKS/background 1)
    this.skyLayers = [];
    for (let i = 1; i <= 6; i++) {
      this.skyLayers.push(load(`./assets/sky/moscow_sky_${i}.png`));
    }

    // Load GandalfHardcore Environment Assets
    this.photoBirch1 = load('./assets/env_gandalf/Birch1.png');
    this.photoBirch2 = load('./assets/env_gandalf/Birch2.png');
    this.photoBirch3 = load('./assets/env_gandalf/Birch3.png');
    this.photoFloweringTree = load('./assets/env_gandalf/Flowering Tree.png');
    this.photoWillow = load('./assets/env_gandalf/Weeping Willow1.png');
    this.photoBush1 = load('./assets/env_gandalf/garden_bush1.png');
    this.photoBush2 = load('./assets/env_gandalf/garden_bush2.png');
    this.photoFlowers1 = load('./assets/env_gandalf/garden_flowers1.png');
    this.photoFlowers2 = load('./assets/env_gandalf/garden_flowers2.png');
    this.photoSunflowers = load('./assets/env_gandalf/garden_sunflowers.png');

    this.cloudImgs = [];
    for (let i = 1; i <= 6; i++) {
      this.cloudImgs.push(load(`./assets/env_gandalf/cloud${i}.png`));
    }
    this.birdImgs = [];
    for (let i = 1; i <= 4; i++) {
      this.birdImgs.push(load(`./assets/env_gandalf/birds${i}.png`));
    }
  }

  update(delta, alice, input) {
    this.promptPulse = (this.promptPulse + 0.05) % (Math.PI * 2);

    // Update living pixel cats and find nearby cat for petting
    this.nearbyCat = null;
    let minCatDist = 9999;

    if (this.cats) {
      const followingCats = this.cats.filter(c => c.isFollowing);
      const dp = this.departurePlane;
      const isDeparture = dp && (dp.state === 'boarding' || dp.state === 'boarded' || dp.state === 'taxi' || dp.state === 'takeoff');
      const departureSpotX = 2900;

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

    // 1. Airplane landing physics and sequence
    this.updateAirplaneLanding(alice);

    // 1.5. Departure airplane beacon & animation
    this.updateDeparturePlane(alice, delta);

    // 2. Proximity check for landmarks
    this.updateLandmarksProximity(alice, input);

    // 3. Birthday celebration particle effects
    this.updateCelebrationParticles();

    // 4. Ambient dust
    for (const d of this.ambientDust) {
      d.x += d.vx;
      d.y += d.vy;
      if (d.x < 0) d.x = this.worldWidth;
      if (d.x > this.worldWidth) d.x = 0;
      if (d.y < 100) d.y = 215;
      if (d.y > 215) d.y = 100;
    }

    // 5. Drifting clouds
    this.clouds.forEach(c => {
      c.x -= c.speed * delta * 12;
      if (c.x < -150) {
        c.x = this.worldWidth + 80;
      }
    });

    // 6. Foreground flower petals
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

  updateAirplaneLanding(alice) {
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

      // Touchdown when wheels touch ground level (y = 220)
      if (plane.y >= 220) {
        plane.y = 220;
        plane.state = 'touchdown';
        plane.vy = 0;
        plane.rot = 0; // flatten pitch
        if (this.audio) this.audio.playPlaneTouchdown();

        // Touchdown tire smoke puffs
        for (let i = 0; i < 28; i++) {
          plane.touchdownSparks.push({
            x: plane.x + 115 + (Math.random() - 0.5) * 20,
            y: this.groundY - 3,
            vx: -Math.random() * 2.5 - 1.0,
            vy: -Math.random() * 1.5 - 0.2,
            size: Math.random() * 3 + 2,
            color: Math.random() > 0.5 ? '#ffffff' : '#b0bec5',
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

      // Rolling dust
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
      // After ~0.75s at stop, airstairs deploy and Alice appears at cabin door
      if (plane.disembarkTimer > 45) {
        plane.state = 'disembarking';
        plane.aliceYOffset = 0;
        alice.x = plane.x + 54;
        alice.y = this.aliceGroundY - 26;
        alice.facing = -1; // facing left down the stairs
        alice.state = 'walk';
      }
    } else if (plane.state === 'disembarking') {
      // Alice descends airstairs step by step onto pavement
      plane.aliceYOffset += 0.35;
      alice.facing = -1;
      alice.state = 'walk';
      alice.frameTimer = (alice.frameTimer || 0) + 1;
      if (alice.frameTimer % 11 === 0) {
        alice.animIndex = (alice.animIndex + 1) % 8;
      }
      const progress = Math.min(1.0, plane.aliceYOffset / 26);
      alice.y = (this.aliceGroundY - 26) + progress * 26;
      alice.x = (plane.x + 54) - progress * 34; // step down to stairs foot at x = plane.x + 20 (x = 90)

      if (progress >= 1.0) {
        alice.x = plane.x + 20; // x = 90
        alice.y = this.aliceGroundY; // 224 firmly on pavement
        alice.facing = 1; // turn right towards Moscow!
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

  updateDeparturePlane(alice, delta = 0.016) {
    const dp = this.departurePlane;
    dp.beaconTimer = (dp.beaconTimer + 1) % 60;

    const stairsFootX = dp.x + 20;
    const doorX = dp.x + 56;

    if (dp.state === 'waiting' && alice && typeof alice === 'object' && this.landingComplete) {
      if (alice.x >= stairsFootX) {
        dp.state = 'boarding';
        if (this.audio) this.audio.playPlaneBoarding();
      }
    }

    if (dp.state === 'boarding' && alice && typeof alice === 'object') {
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
        dp.state = 'boarded';
        dp.boardTimer = 0;
        alice.y = this.groundY - 22;
        if (this.audio) this.audio.playPlaneEngineStart();
      }
    } else if (dp.state === 'boarded') {
      dp.boardTimer += delta;
      if (dp.boardTimer > 1.2) {
        dp.state = 'taxi';
        if (this.audio) this.audio.playPlaneTaxi();
      }
    } else if (dp.state === 'taxi') {
      dp.speed += 50 * delta;
      dp.x += dp.speed * delta;
      dp.propAngle = (dp.propAngle + 0.5) % (Math.PI * 2);
      if (dp.x > 3040) {
        dp.state = 'takeoff';
        if (this.audio) this.audio.playPlaneTakeoff();
      }
    } else if (dp.state === 'takeoff') {
      dp.speed += 85 * delta;
      dp.vy -= 46 * delta;
      dp.x += dp.speed * delta;
      dp.y += dp.vy * delta;
      dp.rot = -6; // nose up
      dp.propAngle = (dp.propAngle + 0.6) % (Math.PI * 2);

      if (Math.random() > 0.25) {
        dp.exhaustParticles.push({
          x: dp.x + 30,
          y: dp.y - 35 + (Math.random() - 0.5) * 6,
          vx: -50 - Math.random() * 30,
          vy: (Math.random() - 0.5) * 8,
          alpha: 1.0,
          color: Math.random() > 0.5 ? '#ffd54f' : '#ffffff'
        });
      }

      const cameraX = (this.lastCameraX || 2720);
      if ((dp.x - cameraX > 540) && !this.takeoffTriggered) {
        this.takeoffTriggered = true;
        if (this.onTakeoffComplete) {
          this.onTakeoffComplete();
        }
      }
    }

    // Update exhaust particles
    for (let i = dp.exhaustParticles.length - 1; i >= 0; i--) {
      const p = dp.exhaustParticles[i];
      p.x += p.vx * delta;
      p.y += p.vy * delta;
      p.alpha -= 1.8 * delta;
      if (p.alpha <= 0) {
        dp.exhaustParticles.splice(i, 1);
      }
    }
  }

  updateLandmarksProximity(alice, input) {
    if (!this.landingComplete) {
      this.activeLandmark = null;
      return;
    }

    let nearest = null;
    let minDist = 32;

    for (const lm of this.landmarks) {
      const dist = Math.abs(alice.x - lm.x);
      if (dist < minDist) {
        minDist = dist;
        nearest = lm;
      }
    }

    this.activeLandmark = nearest;

    // Handle [ F ] inspection
    if (input && input.consumeInspect() && this.activeLandmark) {
      if (this.audio) this.audio.playInteract();
      if (this.inspectedLandmark && this.inspectedLandmark.id === this.activeLandmark.id) {
        // Toggle off
        this.inspectedLandmark = null;
        if (this.activeLandmark.type === 'departure') {
          this.showDepartureLetter = false;
        }
      } else {
        this.inspectedLandmark = this.activeLandmark;
        if (this.activeLandmark.type === 'departure') {
          if (this.departurePlane.state === 'waiting') {
            this.departurePlane.state = 'boarding';
            this.departurePlane.boardTimer = 0;
          } else {
            this.showDepartureLetter = !this.showDepartureLetter;
          }
        }
      }
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

  drawBackground(ctx, cameraX, canvasWidth, canvasHeight) {
    this.lastCameraX = cameraX;

    // 1. Sunny Daytime Moscow Sky (Parallax 0.02..0.18)
    this.renderSky(ctx, cameraX, canvasWidth, canvasHeight);

    // 2. Drifting Summer Clouds
    this.renderClouds(ctx, cameraX, canvasWidth);

    // 3. Distant Historic Central Moscow Architecture (Far Horizon Cluster 0.35x + Mid-ground Streetscape 0.52x)
    this.renderDistantArchitecture(ctx, cameraX, canvasWidth);

    // 4. Background Trees (slightly blurred 0.5px for soft depth)
    ctx.save();
    ctx.filter = 'blur(0.5px)';
    this.renderTrees(ctx, cameraX, -1);
    ctx.restore();
  }

  drawMidground(ctx, cameraX, canvasWidth, canvasHeight) {
    // 1. Airport Runway, Old Arbat Granite Pavement, and Departure Runway
    this.renderGround(ctx, cameraX, canvasWidth);

    // 2. Authentic Moscow Flora & Vegetation (Lindens, Chestnuts, Spruces, Rowans, Lilacs)
    this.renderMoscowVegetation(ctx, cameraX);

    // 3. Moscow Promenade Trees (Midground depth 0)
    this.renderTrees(ctx, cameraX, 0);

    // 4. Moscow Street Lanterns
    this.renderStreetLamps(ctx, cameraX);

    // 5. Moscow Landmarks (Moscow-City, RGSU, Bolshoi, Triumphal Arch, Vasily, TSUM)
    this.renderLandmarks(ctx, cameraX);

    // 6. Curb Flowerbeds, Sunflowers & Festive Bushes
    this.renderFlowerbeds(ctx, cameraX);

    // 7. Perched Birds
    this.renderBirds(ctx, cameraX);

    // 8. Arrival Airplane (stops at x = 180)
    this.renderArrivalAirplane(ctx, cameraX);

    // 9. Departure Airplane at the end of Moscow (x = 2920)
    this.renderDepartureAirplane(ctx, cameraX);

    // 10. Living Pixel Cats (1.0x crisp midground)
    if (this.cats) {
      for (const cat of this.cats) {
        cat.draw(ctx, cameraX);
      }
    }
  }

  drawForeground(ctx, cameraX, canvasWidth, canvasHeight, aliceX, aliceY) {
    // 1. Rich Foreground Depth Layer (Overhanging canopy, boulevard railing, pots, streetlamps - Blurred 1.8px DoF)
    this.renderForegroundDepth(ctx, cameraX, canvasWidth, canvasHeight);

    // 2. Passing blurred bokeh flower petals in summer breeze
    this.drawPassingForegroundBokeh(ctx, cameraX, canvasWidth);

    // 3. Celebration Particles (Fireworks, Confetti, Candle sparks)
    this.renderCelebrationEffects(ctx, cameraX);

    // 4. Ambient Dust
    this.renderAmbientDust(ctx, cameraX);

    // 5. Minimalist UI Prompt [ F ] & Birthday Letter Overlay
    this.renderUI(ctx, cameraX, canvasWidth, canvasHeight);
  }

  drawPassingForegroundBokeh(ctx, cameraX, canvasWidth) {
    if (!this.fgLeaves || this.fgLeaves.length === 0) return;
    ctx.save();
    ctx.filter = 'blur(1.5px)';
    for (const l of this.fgLeaves) {
      const sx = Math.round(l.x - cameraX * (l.parallax || 1.4));
      if (sx >= -15 && sx <= canvasWidth + 15) {
        ctx.fillStyle = l.color;
        ctx.globalAlpha = 0.55;
        ctx.beginPath();
        ctx.arc(sx, l.y, l.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  }

  renderForegroundDepth(ctx, cameraX, canvasWidth, canvasHeight) {
    ctx.save();
    ctx.filter = 'blur(1.8px)';
    ctx.globalAlpha = 0.96;

    // 1. Bottom Decorative Moscow Boulevard Cast-Iron Railing
    if (this.photoFgRailing && this.photoFgRailing.complete) {
      const pRail = 1.12;
      const railW = 128;
      const railH = 36;
      const railY = canvasHeight - 22; // snug against the bottom edge

      const startX = -((cameraX * pRail) % railW);
      const loopStart = startX > 0 ? startX - railW : startX;
      for (let rx = loopStart; rx < canvasWidth + railW; rx += railW) {
        ctx.drawImage(this.photoFgRailing, Math.round(rx), railY, railW, railH);
      }
    }

    // 3. Bottom Granite Flower Urns / Planters with Blooming Petunias & Marigolds
    if (this.photoFgPot && this.photoFgPot.complete) {
      const pPot = 1.20;
      const potW = 55;
      const potH = 65;
      const potY = canvasHeight - 48; // sitting on bottom ledge

      for (let i = 0; i < this.fgPlanters.length; i++) {
        const sx = Math.round(this.fgPlanters[i] - cameraX * pPot);
        if (sx >= -potW && sx <= canvasWidth + potW) {
          ctx.drawImage(this.photoFgPot, sx, potY, potW, potH);
        }
      }
    }

    // 4. Bottom Vintage Cast-Iron Streetlamps
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

  draw(ctx, cameraX, viewportWidth, viewportHeight, aliceX, aliceY) {
    this.drawBackground(ctx, cameraX, viewportWidth, viewportHeight);
    this.drawMidground(ctx, cameraX, viewportWidth, viewportHeight);
    this.drawForeground(ctx, cameraX, viewportWidth, viewportHeight, aliceX, aliceY);
  }

  renderClouds(ctx, cameraX, canvasWidth) {
    if (!this.cloudImgs || this.cloudImgs.length === 0) return;
    this.clouds.forEach(c => {
      const img = this.cloudImgs[c.imgIdx % this.cloudImgs.length];
      if (img && img.complete) {
        const sx = Math.round(c.x - cameraX * c.parallax);
        const w = img.width;
        const h = img.height;
        if (sx > -w && sx < canvasWidth + w) {
          ctx.save();
          ctx.globalAlpha = 0.70;
          ctx.drawImage(img, sx, c.y, w, h);
          ctx.restore();
        }
      }
    });
  }

  renderTrees(ctx, cameraX, targetDepth = 0) {
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
        if (sx > -w - 30 && sx < 480 + 30) {
          ctx.fillStyle = 'rgba(10, 5, 15, 0.50)';
          ctx.beginPath();
          ctx.ellipse(sx + w / 2, this.groundY - 1, w * 0.25, 3, 0, 0, Math.PI * 2);
          ctx.fill();

          ctx.drawImage(img, sx, baselineY - h, w, h);
        }
      }
    });
  }

  renderFlowerbeds(ctx, cameraX) {
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
        if (sx > -w - 20 && sx < 480 + 20) {
          ctx.drawImage(img, sx, this.groundY - h + 4, w, h);
        }
      }
    });
  }

  renderBirds(ctx, cameraX) {
    if (!this.birdImgs || this.birdImgs.length === 0) return;
    this.birds.forEach(b => {
      const img = this.birdImgs[b.imgIdx % this.birdImgs.length];
      if (img && img.complete) {
        const sx = Math.round(b.x - cameraX);
        if (sx > -30 && sx < 480 + 30) {
          ctx.drawImage(img, sx, b.y, img.width, img.height);
        }
      }
    });
  }

  renderSky(ctx, cameraX, canvasWidth, canvasHeight) {
    // Fallback base daytime gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, this.groundY);
    skyGrad.addColorStop(0, '#4a90e2');
    skyGrad.addColorStop(0.65, '#82b1ff');
    skyGrad.addColorStop(1.0, '#cce0ff');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Parallax rendering for Pack Background 1 layers (576 x 324)
    // Layers:
    // [0]: solid blue sky
    // [1]: glowing sun & upper sky haze
    // [2]: high cumulus cloud layer
    // [3]: mid cloud layer
    // [4]: low puffy clouds
    // [5]: horizon cloud bank
    if (this.skyLayers && this.skyLayers.length >= 6) {
      const layerConfigs = [
        { idx: 0, factor: 0.02, y: -20 },
        { idx: 1, factor: 0.05, y: -20 },
        { idx: 2, factor: 0.12, y: -15 },
        { idx: 3, factor: 0.18, y: -10 },
        { idx: 4, factor: 0.25, y: -5 },
        { idx: 5, factor: 0.32, y: 0 }
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
  }

  renderDistantArchitecture(ctx, cameraX, canvasWidth) {
    // Smoothly fade out at landing (x < 280) and departure runway (x > 2480) for open runway sky
    let runwayAlpha = 1.0;
    if (cameraX < 280) {
      runwayAlpha = Math.max(0, Math.min(1, (cameraX - 100) / 180));
    } else if (cameraX > 2480) {
      runwayAlpha = Math.max(0, Math.min(1, 1 - (cameraX - 2480) / 180));
    }
    if (runwayAlpha <= 0) return;

    const baselineY = this.groundY + 3;

    // LAYER 1: FAR HORIZON SKYLINE CLUSTER (Parallax 0.35x, 100% solid, softly blurred 0.6px)
    // Continuous panoramic streetscape of historic central Moscow (domes, spires, towers)
    if (this.photoBgCluster && this.photoBgCluster.complete) {
      ctx.save();
      ctx.globalAlpha = 1.0 * runwayAlpha;
      ctx.filter = 'blur(0.6px)';
      const pFar = 0.35;
      const clusterW = 576;
      const clusterH = 155;
      const clusterPositions = [200, 776, 1352, 1928, 2504];

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

    // LAYER 2: MID-GROUND HISTORIC MOSCOW STREETSCAPE (Parallax 0.52x, 100% solid, softly blurred 0.5px)
    // Dense interlocking row of distinct central Moscow buildings:
    // Empire mansions, Art Nouveau facades, corner domes, Stalinist neoclassicism, merchant townhouses
    ctx.save();
    ctx.globalAlpha = 1.0 * runwayAlpha;
    ctx.filter = 'blur(0.5px)';
    const pMid = 0.52;

    const midBuildings = [
      { type: 'stalin', x: 260, w: 135, h: 155 },
      { type: 'empire', x: 380, w: 135, h: 130 },
      { type: 'modern', x: 500, w: 120, h: 148 },
      { type: 'corner', x: 610, w: 135, h: 160 },
      { type: 'merchant', x: 735, w: 125, h: 120 },
      { type: 'empire', x: 850, w: 135, h: 130 },
      { type: 'stalin', x: 975, w: 135, h: 155 },
      { type: 'modern', x: 1095, w: 120, h: 148 },
      { type: 'corner', x: 1205, w: 135, h: 160 },
      { type: 'merchant', x: 1330, w: 125, h: 120 },
      { type: 'empire', x: 1445, w: 135, h: 130 },
      { type: 'stalin', x: 1570, w: 135, h: 155 },
      { type: 'modern', x: 1690, w: 120, h: 148 },
      { type: 'corner', x: 1800, w: 135, h: 160 },
      { type: 'merchant', x: 1925, w: 125, h: 120 },
      { type: 'empire', x: 2040, w: 135, h: 130 },
      { type: 'stalin', x: 2165, w: 135, h: 155 },
      { type: 'modern', x: 2285, w: 120, h: 148 },
      { type: 'corner', x: 2395, w: 135, h: 160 },
      { type: 'merchant', x: 2520, w: 125, h: 120 },
      { type: 'empire', x: 2635, w: 135, h: 130 }
    ];

    for (const b of midBuildings) {
      const sx = Math.round(b.x - cameraX * pMid);
      if (sx >= -b.w - 40 && sx <= canvasWidth + 40) {
        let img = this.photoBgEmpire;
        if (b.type === 'modern') img = this.photoBgModern;
        else if (b.type === 'corner') img = this.photoBgCorner;
        else if (b.type === 'stalin') img = this.photoBgStalin;
        else if (b.type === 'merchant') img = this.photoBgMerchant;

        if (img && img.complete) {
          ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
          ctx.fillRect(sx, baselineY - 2, b.w, 4);
          ctx.drawImage(img, sx, baselineY - b.h, b.w, b.h);
        }
      }
    }
    ctx.restore();
  }

  renderGround(ctx, cameraX, canvasWidth) {
    const gy = this.groundY;
    const gHeight = 55; // Reach all the way past canvas bottom (220 + 55 = 275)

    // SECTION 1: Arrival Runway (x: 0 .. 300)
    const arrivalRunwayEnd = Math.round(300 - cameraX);
    if (arrivalRunwayEnd > 0) {
      const rw = Math.min(canvasWidth, Math.max(0, arrivalRunwayEnd));
      ctx.fillStyle = '#14131d';
      ctx.fillRect(0, gy, rw, gHeight);

      // Top curb & border line
      ctx.fillStyle = '#262033';
      ctx.fillRect(0, gy, rw, 3);
      ctx.fillStyle = '#4e4063';
      ctx.fillRect(0, gy, rw, 1);

      // White runway edge boundary lines
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, gy + 3, rw, 2);
      ctx.fillRect(0, gy + 46, rw, 2);

      // Green threshold flush lights at x = 25
      const tx = Math.round(25 - cameraX);
      if (tx > -20 && tx < canvasWidth) {
        for (let ty = gy + 7; ty <= gy + 41; ty += 5) {
          ctx.fillStyle = '#00f5d4';
          ctx.shadowColor = '#00f5d4';
          ctx.shadowBlur = 4;
          ctx.fillRect(tx, ty, 3, 2);
        }
        ctx.shadowBlur = 0;
      }

      // Solid white transverse threshold bar
      const tbx = Math.round(30 - cameraX);
      if (tbx > -20 && tbx < canvasWidth) {
        ctx.fillStyle = '#f0edf6';
        ctx.fillRect(tbx, gy + 5, 5, 38);
      }

      // Runway threshold piano keys
      for (let s = 0; s < 6; s++) {
        const kx = Math.round(38 + s * 9 - cameraX);
        if (kx > -20 && kx < canvasWidth) {
          ctx.fillStyle = '#f0edf6';
          ctx.fillRect(kx, gy + 7, 5, 34);
        }
      }

      // Stencil "06" Runway Designation Number
      const numX = Math.round(105 - cameraX);
      if (numX > -30 && numX < canvasWidth) {
        const numY = gy + 16;
        ctx.fillStyle = '#e8edf5';
        ctx.fillRect(numX, numY, 9, 2);
        ctx.fillRect(numX + 7, numY + 2, 2, 12);
        ctx.fillRect(numX + 7, numY + 2, 2, 12);
        ctx.fillRect(numX, numY + 14, 9, 2);
        ctx.fillRect(numX + 13, numY, 9, 2);
        ctx.fillRect(numX + 13, numY + 2, 2, 14);
        ctx.fillRect(numX + 13, numY + 7, 9, 2);
        ctx.fillRect(numX + 20, numY + 7, 2, 9);
        ctx.fillRect(numX + 13, numY + 14, 9, 2);
      }

      // Aiming point markers
      const ax1 = Math.round(145 - cameraX);
      if (ax1 > -30 && ax1 < canvasWidth) {
        ctx.fillStyle = '#e8edf5';
        ctx.fillRect(ax1, gy + 8, 24, 7);
        ctx.fillRect(ax1, gy + 33, 24, 7);
      }
    }

    // SECTION 2: Distinct Old Arbat & Red Square Granite Pavement (x: 300 .. 2750)
    const moscowStart = Math.max(0, Math.round(300 - cameraX));
    const moscowEnd = Math.min(canvasWidth, Math.round(2750 - cameraX));

    if (moscowEnd > moscowStart) {
      // Solid granite base underlay: absolutely zero background show-through!
      ctx.fillStyle = '#4a4855';
      ctx.fillRect(moscowStart, gy, moscowEnd - moscowStart, gHeight);

      const tex = this.photoPavement || this.photoCobble;
      if (tex && tex.complete) {
        const texW = tex.width;
        const texH = gHeight;
        const firstTile = Math.floor((300 + Math.max(0, cameraX - 300)) / texW);
        const lastTile = Math.floor((Math.min(2750, cameraX + canvasWidth)) / texW) + 1;

        for (let t = firstTile; t <= lastTile; t++) {
          const worldX = t * texW;
          if (worldX >= 300 - texW && worldX <= 2750) {
            const screenX = Math.round(worldX - cameraX);
            ctx.drawImage(tex, screenX, gy, texW, texH);
          }
        }
      }

      // Monumental Granite Curb for Moscow Promenade with bronze studs
      const curbX1 = Math.max(0, moscowStart);
      const curbW = moscowEnd - curbX1;
      if (curbW > 0) {
        // Upper polished granite curb edge
        ctx.fillStyle = '#4a4855';
        ctx.fillRect(curbX1, gy, curbW, 3);
        ctx.fillStyle = '#8e8d9c';
        ctx.fillRect(curbX1, gy, curbW, 1);
        ctx.fillStyle = '#1c1b22';
        ctx.fillRect(curbX1, gy + 3, curbW, 1);

        // Bronze road studs along the promenade curb every 40px
        for (let bx = 320; bx < 2740; bx += 40) {
          const bsx = Math.round(bx - cameraX);
          if (bsx >= 0 && bsx <= canvasWidth) {
            ctx.fillStyle = '#ffd166';
            ctx.fillRect(bsx, gy + 1, 3, 2);
          }
        }
      }
    }

    // SECTION 3: Departure Runway (x: 2750 .. 3100)
    const departureRunwayStart = Math.round(2750 - cameraX);
    if (departureRunwayStart < canvasWidth) {
      const dsx = Math.max(0, departureRunwayStart);
      const dw = canvasWidth - dsx;

      ctx.fillStyle = '#14131d';
      ctx.fillRect(dsx, gy, dw, gHeight);

      // Top curb & border line
      ctx.fillStyle = '#262033';
      ctx.fillRect(dsx, gy, dw, 3);
      ctx.fillStyle = '#4e4063';
      ctx.fillRect(dsx, gy, dw, 1);

      // White runway edge boundary lines
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(dsx, gy + 3, dw, 2);
      ctx.fillRect(dsx, gy + gHeight - 3, dw, 2);

      // Green threshold flush lights at x = 2780
      const dtx = Math.round(2780 - cameraX);
      if (dtx > -20 && dtx < canvasWidth) {
        for (let ty = gy + 7; ty <= gy + 41; ty += 5) {
          ctx.fillStyle = '#00f5d4';
          ctx.shadowColor = '#00f5d4';
          ctx.shadowBlur = 4;
          ctx.fillRect(dtx, ty, 3, 2);
        }
        ctx.shadowBlur = 0;
      }

      // Solid white transverse threshold bar
      const dtbx = Math.round(2785 - cameraX);
      if (dtbx > -20 && dtbx < canvasWidth) {
        ctx.fillStyle = '#f0edf6';
        ctx.fillRect(dtbx, gy + 5, 5, 38);
      }

      // Runway threshold piano keys
      for (let s = 0; s < 6; s++) {
        const kx = Math.round(2795 + s * 9 - cameraX);
        if (kx > -20 && kx < canvasWidth) {
          ctx.fillStyle = '#f0edf6';
          ctx.fillRect(kx, gy + 7, 5, 34);
        }
      }

      // Stencil "24" Runway Designation Number
      const numX = Math.round(2865 - cameraX);
      if (numX > -30 && numX < canvasWidth) {
        const numY = gy + 16;
        ctx.fillStyle = '#e8edf5';
        // "2"
        ctx.fillRect(numX, numY, 9, 2);
        ctx.fillRect(numX + 7, numY + 2, 2, 6);
        ctx.fillRect(numX, numY + 7, 9, 2);
        ctx.fillRect(numX, numY + 9, 2, 5);
        ctx.fillRect(numX, numY + 14, 9, 2);
        // "4"
        ctx.fillRect(numX + 13, numY, 2, 9);
        ctx.fillRect(numX + 13, numY + 7, 9, 2);
        ctx.fillRect(numX + 20, numY, 2, 16);
      }

      // Runway edge lights
      for (let lx = 2770; lx < 3100; lx += 45) {
        const sx = Math.round(lx - cameraX);
        if (sx > -10 && sx < canvasWidth) {
          const isGreen = lx < 2820;
          const lightCol = isGreen ? '#00f5d4' : '#ffd166';
          const pulse = Math.sin(Date.now() * 0.005 + lx) * 0.25 + 0.75;

          ctx.fillStyle = isGreen ? `rgba(0, 245, 212, ${pulse * 0.35})` : `rgba(255, 209, 102, ${pulse * 0.35})`;
          ctx.beginPath();
          ctx.arc(sx, gy - 2, 6, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#3a2d48';
          ctx.fillRect(sx - 1, gy - 5, 2, 5);
          ctx.fillStyle = lightCol;
          ctx.fillRect(sx - 2, gy - 7, 4, 3);
        }
      }
    }

    // Golden boundary markers between zones
    const mark1 = Math.round(300 - cameraX);
    if (mark1 >= -5 && mark1 <= canvasWidth) {
      ctx.fillStyle = '#ff7ebb';
      ctx.fillRect(mark1, gy, 3, gHeight);
    }
    const mark2 = Math.round(2750 - cameraX);
    if (mark2 >= -5 && mark2 <= canvasWidth) {
      ctx.fillStyle = '#ff7ebb';
      ctx.fillRect(mark2, gy, 3, gHeight);
    }
  }

  renderStreetLamps(ctx, cameraX) {
    if (!this.photoLantern || !this.photoLantern.complete) return;

    const img = this.photoLantern;
    const lampW = 28;
    const lampH = 74;

    for (const lampX of this.streetLamps) {
      const screenX = lampX - cameraX;
      if (screenX < -50 || screenX > 530) continue;

      ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
      ctx.beginPath();
      ctx.ellipse(screenX, this.groundY, 10, 3, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.drawImage(img, screenX - lampW / 2, this.groundY - lampH, lampW, lampH);

      const glowY = this.groundY - lampH + 16;
      const glowGrad = ctx.createRadialGradient(screenX, glowY, 4, screenX, glowY, 32);
      glowGrad.addColorStop(0, 'rgba(255, 235, 150, 0.45)');
      glowGrad.addColorStop(0.5, 'rgba(255, 180, 80, 0.15)');
      glowGrad.addColorStop(1, 'rgba(255, 150, 50, 0)');

      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(screenX, glowY, 32, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  renderMoscowVegetation(ctx, cameraX) {
    const gy = this.groundY;
    const baselineY = this.groundY + 3;

    // Authentic Moscow Promenade Trees & Bushes (Framing landmarks, leaving facades open)
    const moscowFlora = [
      { type: 'linden', x: 340, w: 92, h: 130 },
      { type: 'lilac', x: 390, w: 62, h: 58 },
      { type: 'chestnut', x: 640, w: 95, h: 132 },
      { type: 'lilac', x: 695, w: 62, h: 58 },
      { type: 'rowan', x: 760, w: 80, h: 125 },
      { type: 'linden', x: 970, w: 92, h: 130 },
      { type: 'lilac', x: 1030, w: 62, h: 58 },
      { type: 'chestnut', x: 1340, w: 95, h: 132 },
      { type: 'lilac', x: 1385, w: 62, h: 58 },
      { type: 'rowan', x: 1440, w: 80, h: 125 },
      { type: 'linden', x: 1660, w: 92, h: 130 },
      { type: 'lilac', x: 1710, w: 62, h: 58 },
      { type: 'spruce', x: 1750, w: 78, h: 135 },
      { type: 'spruce', x: 1960, w: 78, h: 135 },
      { type: 'chestnut', x: 2010, w: 95, h: 132 },
      { type: 'lilac', x: 2055, w: 62, h: 58 },
      { type: 'rowan', x: 2110, w: 80, h: 125 },
      { type: 'linden', x: 2340, w: 92, h: 130 },
      { type: 'lilac', x: 2380, w: 62, h: 58 },
      { type: 'spruce', x: 2420, w: 78, h: 135 },
      { type: 'lilac', x: 2580, w: 62, h: 58 },
      { type: 'linden', x: 2650, w: 92, h: 130 },
      { type: 'spruce', x: 2710, w: 78, h: 135 }
    ];

    for (const f of moscowFlora) {
      const sx = Math.round(f.x - cameraX);
      if (sx >= -f.w - 30 && sx <= 480 + 30) {
        let img = null;
        if (f.type === 'linden') img = this.photoLinden;
        else if (f.type === 'chestnut') img = this.photoChestnut;
        else if (f.type === 'spruce') img = this.photoSpruce;
        else if (f.type === 'rowan') img = this.photoRowan;
        else if (f.type === 'lilac') img = this.photoLilac;

        if (img && img.complete) {
          // Soft ground contact shadow
          ctx.fillStyle = 'rgba(10, 5, 15, 0.45)';
          ctx.beginPath();
          ctx.ellipse(sx + f.w / 2, gy, f.w * 0.28, 3, 0, 0, Math.PI * 2);
          ctx.fill();

          ctx.drawImage(img, sx, baselineY - f.h, f.w, f.h);
        }
      }
    }
  }

  renderLandmarks(ctx, cameraX) {
    const baselineY = this.groundY + 3; // Firmly seated 3px beneath the curb line

    // 0. Moscow-City Skyscrapers (x = 480)
    if (this.photoCity && this.photoCity.complete) {
      const sx = 480 - cameraX;
      const drawW = 240;
      const drawH = 160;
      const drawY = baselineY - drawH;

      if (sx + drawW / 2 > -50 && sx - drawW / 2 < 530) {
        ctx.fillStyle = 'rgba(15, 12, 22, 0.85)';
        ctx.fillRect(sx - drawW / 2 + 4, this.groundY - 2, drawW - 8, 6);
        ctx.drawImage(this.photoCity, sx - drawW / 2, drawY, drawW, drawH);
      }
    }

    // 1. RGSU (x = 820) - strictly 2nd landmark!
    if (this.photoRgsu && this.photoRgsu.complete) {
      const sx = 820 - cameraX;
      const drawW = 215;
      const drawH = 145;
      const drawY = baselineY - drawH;

      if (sx + drawW / 2 > -50 && sx - drawW / 2 < 530) {
        ctx.fillStyle = 'rgba(15, 12, 22, 0.85)';
        ctx.fillRect(sx - drawW / 2 + 4, this.groundY - 2, drawW - 8, 6);
        ctx.drawImage(this.photoRgsu, sx - drawW / 2, drawY, drawW, drawH);
      }
    }

    // 2. Bolshoi Theatre (x = 1180) - 3rd landmark
    if (this.photoBolshoi && this.photoBolshoi.complete) {
      const sx = 1180 - cameraX;
      const drawW = 215;
      const drawH = 145;
      const drawY = baselineY - drawH;

      if (sx + drawW / 2 > -50 && sx - drawW / 2 < 530) {
        ctx.fillStyle = 'rgba(15, 12, 22, 0.85)';
        ctx.fillRect(sx - drawW / 2 + 4, this.groundY - 2, drawW - 8, 6);
        ctx.drawImage(this.photoBolshoi, sx - drawW / 2, drawY, drawW, drawH);
      }
    }

    // 3. Moscow Triumphal Arch (x = 1520) - 4th landmark (replacing Spasskaya Tower)
    if (this.photoTriumphalArch && this.photoTriumphalArch.complete) {
      const sx = 1520 - cameraX;
      const drawW = 210;
      const drawH = 146; // exact cropped height
      const drawY = baselineY - drawH;

      if (sx + drawW / 2 > -50 && sx - drawW / 2 < 530) {
        ctx.fillStyle = 'rgba(15, 12, 22, 0.90)';
        ctx.fillRect(sx - drawW / 2 + 4, this.groundY - 2, drawW - 8, 6);
        ctx.drawImage(this.photoTriumphalArch, sx - drawW / 2, drawY, drawW, drawH);
      }
    }

    // 4. Saint Basil's Cathedral (x = 1860) - 5th landmark (perfect GrabCut sprite)
    if (this.photoVasily && this.photoVasily.complete) {
      const sx = 1860 - cameraX;
      const drawW = 220;
      const drawH = 168; // exact cropped height
      const drawY = baselineY - drawH;

      if (sx + drawW / 2 > -50 && sx - drawW / 2 < 530) {
        ctx.fillStyle = 'rgba(15, 12, 22, 0.90)';
        ctx.fillRect(sx - drawW / 2 + 4, this.groundY - 2, drawW - 8, 6);
        ctx.drawImage(this.photoVasily, sx - drawW / 2, drawY, drawW, drawH);
      }
    }

    // 5. TSUM (x = 2200) - strictly last landmark before cake!
    if (this.photoTsum && this.photoTsum.complete) {
      const sx = 2200 - cameraX;
      const drawW = 190;
      const drawH = 145;
      const drawY = baselineY - drawH;

      if (sx + drawW / 2 > -50 && sx - drawW / 2 < 530) {
        ctx.fillStyle = 'rgba(15, 12, 22, 0.85)';
        ctx.fillRect(sx - drawW / 2 + 4, this.groundY - 2, drawW - 8, 6);
        ctx.drawImage(this.photoTsum, sx - drawW / 2, drawY, drawW, drawH);
      }
    }
  }

  renderArrivalAirplane(ctx, cameraX) {
    const plane = this.airplane;
    if (plane.state === 'approaching') return; // Not visible during initial quiet location view

    const sx = Math.round(plane.x - cameraX);
    const sy = Math.round(plane.y);

    if (sx < -260 || sx > 600) return;

    ctx.save();
    ctx.translate(sx + 110, sy - 35);
    ctx.rotate((plane.rot * Math.PI) / 180);

    let img = this.photoAirplaneTarmac;
    if (plane.state === 'landing') {
      img = this.photoAirplaneFlight;
    } else if (plane.state === 'touchdown' || plane.state === 'taxi' || plane.state === 'parked') {
      img = this.photoAirplaneBoarded || this.photoAirplaneTarmac;
    } else if (plane.state === 'disembarking' || plane.state === 'complete') {
      img = this.photoAirplaneTarmac;
    }

    if (img && img.complete) {
      ctx.drawImage(img, -110, -35, 220, 75);
    }
    ctx.restore();

    // Render touchdown smoke particles
    for (const p of plane.touchdownSparks) {
      const psx = Math.round(p.x - cameraX);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = Math.max(0, Math.min(1, p.alpha));
      ctx.beginPath();
      ctx.arc(psx, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1.0;
  }

  renderDepartureAirplane(ctx, cameraX) {
    const dp = this.departurePlane;
    const sx = Math.round(dp.x - cameraX);
    const sy = Math.round(dp.y);

    if (sx < -260 || sx > 600) return;

    // Contact shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.beginPath();
    ctx.ellipse(sx + 110, sy, 80, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    if (dp.state === 'takeoff') {
      ctx.translate(sx + 110, sy - 35);
      ctx.rotate((dp.rot * Math.PI) / 180);
      const img = this.photoAirplaneFlight;
      if (img && img.complete) {
        ctx.drawImage(img, -110, -35, 220, 75);
      }
    } else {
      const img = (dp.state === 'boarded' || dp.state === 'taxi')
        ? (this.photoAirplaneBoarded || this.photoAirplaneTarmac)
        : this.photoAirplaneTarmac;
      if (img && img.complete) {
        ctx.drawImage(img, sx, sy - 70, 220, 75);
      }
    }
    ctx.restore();

    // Flashing red beacon on tail
    if (dp.beaconTimer < 30) {
      const beaconX = sx + 22;
      const beaconY = sy - 66;
      ctx.fillStyle = '#ff1744';
      ctx.fillRect(beaconX - 1, beaconY - 1, 3, 3);
      ctx.fillStyle = 'rgba(255, 23, 68, 0.4)';
      ctx.beginPath();
      ctx.arc(beaconX, beaconY, 6, 0, Math.PI * 2);
      ctx.fill();
    }

    // Exhaust particles on takeoff
    for (const ep of dp.exhaustParticles) {
      const esx = Math.round(ep.x - cameraX);
      ctx.fillStyle = ep.color;
      ctx.globalAlpha = Math.max(0, Math.min(1, ep.alpha));
      ctx.fillRect(esx, Math.round(ep.y), 2, 2);
    }
    ctx.globalAlpha = 1.0;
  }

  renderCelebrationEffects(ctx, cameraX) {
    for (const f of this.fireworks) {
      const fx = f.x - cameraX;
      ctx.fillStyle = f.color;
      ctx.globalAlpha = f.alpha;
      ctx.fillRect(Math.floor(fx), Math.floor(f.y), 2, 2);
    }

    for (const c of this.confetti) {
      const cx = c.x - cameraX;
      ctx.save();
      ctx.translate(cx, c.y);
      ctx.rotate(c.rot);
      ctx.fillStyle = c.color;
      ctx.fillRect(-c.size / 2, -c.size / 2, c.size, c.size * 1.6);
      ctx.restore();
    }

    ctx.globalAlpha = 1.0;
  }

  renderAmbientDust(ctx, cameraX) {
    for (const d of this.ambientDust) {
      const dx = d.x - cameraX;
      if (dx >= 0 && dx <= 480) {
        ctx.fillStyle = d.color;
        ctx.globalAlpha = d.alpha * 0.5;
        ctx.fillRect(Math.floor(dx), Math.floor(d.y), 1.5, 1.5);
      }
    }
    ctx.globalAlpha = 1.0;
  }

  renderUI(ctx, cameraX, canvasWidth, canvasHeight) {
    // 1. Minimalist [ F ] floating icon above landmark
    if (this.activeLandmark && !this.showBirthdayLetter && !this.showDepartureLetter) {
      const lm = this.activeLandmark;
      const screenX = Math.round(lm.x - cameraX);
      const promptY = lm.type === 'cake' ? 150 : (lm.type === 'departure' ? 140 : 135);
      const floatOffset = Math.sin(this.promptPulse) * 2.5;

      ctx.save();
      const btnW = 24;
      const btnH = 15;
      const bx = Math.round(screenX - btnW / 2);
      const by = Math.round(promptY + floatOffset);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.fillRect(bx, by, btnW, btnH);
      ctx.strokeStyle = '#ff4081';
      ctx.lineWidth = 1;
      ctx.strokeRect(bx, by, btnW, btnH);

      ctx.shadowColor = '#ff7ebb';
      ctx.shadowBlur = 6;

      ctx.font = 'bold 12px "Handjet", "VT323", monospace';
      ctx.fillStyle = '#d81b60';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('F', screenX, by + btnH / 2 + 1);
      ctx.restore();
    }

    // 2. Inspected landmark clean title (minimal, no stars)
    if (this.inspectedLandmark && !this.showBirthdayLetter && !this.showDepartureLetter) {
      ctx.save();
      const text = this.inspectedLandmark.title;
      ctx.font = 'bold 13px "Handjet", "VT323", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const textWidth = ctx.measureText(text).width;

      const badgeW = textWidth + 16;
      const badgeH = 18;
      const badgeX = canvasWidth / 2;
      const badgeY = 250;

      ctx.fillStyle = 'rgba(255, 255, 255, 0.94)';
      ctx.fillRect(badgeX - badgeW / 2, badgeY - badgeH / 2, badgeW, badgeH);

      ctx.fillStyle = '#8a1d48';
      ctx.fillText(text, badgeX, badgeY + 1);
      ctx.restore();
    }

    // 2.5. Cat Petting Prompt (minimalist, no box, no frame, no stars)
    if (this.nearbyCat && !this.showBirthdayLetter && !this.showDepartureLetter) {
      const cat = this.nearbyCat;
      const sx = Math.round(cat.x - cameraX);
      const floatOffset = Math.sin(this.promptPulse * 1.5) * 2;
      const py = Math.round(cat.groundY - 32 + floatOffset);

      const label = cat.isPetted ? '[ F ] ПОГЛАДИТЬ ЕЩЁ' : '[ F ] ПОГЛАДИТЬ';

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

    // 2.6. Top-Right Cat Counter Badge (clean minimal)
    if (this.cats && this.cats.length > 0 && !this.showBirthdayLetter && !this.showDepartureLetter) {
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
      ctx.fillStyle = '#100516';
      ctx.fillText(text, badgeX + 1, badgeY);
      ctx.fillText(text, badgeX - 1, badgeY);
      ctx.fillText(text, badgeX, badgeY + 1);
      ctx.fillText(text, badgeX, badgeY - 1);

      ctx.fillStyle = pettedCount === totalCats ? '#ff6090' : '#ffffff';
      ctx.fillText(text, badgeX, badgeY);
      ctx.restore();
    }

    // 3. Departure Teaser Modal when boarding the departure plane
    if (this.showDepartureLetter) {
      ctx.save();
      ctx.fillStyle = 'rgba(10, 4, 18, 0.78)';
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      const modalW = 380;
      const modalH = 170;
      const mx = (canvasWidth - modalW) / 2;
      const my = (canvasHeight - modalH) / 2;

      ctx.fillStyle = '#fff7fa';
      ctx.strokeStyle = '#ff4081';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(mx, my, modalW, modalH, 10);
      ctx.fill();
      ctx.stroke();

      ctx.strokeStyle = '#ffb3d1';
      ctx.lineWidth = 1;
      ctx.strokeRect(mx + 6, my + 6, modalW - 12, modalH - 12);

      ctx.fillStyle = '#c2185b';
      ctx.font = 'bold 20px "Handjet", "VT323", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('✧ НАШЕ ПУТЕШЕСТВИЕ ПРОДОЛЖАЕТСЯ! ✧', canvasWidth / 2, my + 28);

      ctx.fillStyle = '#3e1728';
      ctx.font = '16px "Handjet", "VT323", monospace';
      ctx.textAlign = 'center';

      const lines = [
        'Двигатели запущены, лайнер готов к взлёту!',
        'Впереди ждёт следующий волшебный город и новая глава...',
        '',
        'Пристегните ремни, взлетаем в небо! ✈️'
      ];

      for (let i = 0; i < lines.length; i++) {
        ctx.fillText(lines[i], canvasWidth / 2, my + 56 + i * 18);
      }

      ctx.fillStyle = '#ff4081';
      ctx.font = 'bold 13px "Handjet", "VT323", monospace';
      ctx.fillText('[ F — Продолжить ]', canvasWidth / 2, my + modalH - 12);

      ctx.restore();
    }
  }
}
