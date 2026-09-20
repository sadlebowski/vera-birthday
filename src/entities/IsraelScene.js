/**
 * IsraelScene: 2D Pixel Art Middle Eastern / Mediterranean Adventure
 * 
 * Journey through Israel:
 * 1. Touchdown on coastal tarmac with tire smoke & halt at x = 70
 * 2. Stroll along golden Jerusalem stone promenade under palms & bougainvillea
 * 3. Moses Montefiore Windmill in Jerusalem (Mishkenot Sha'ananim, 1857) (x = 480)
 * 4. Old Jaffa Ottoman Clock Tower with carved stone pedestal (1903) (x = 820)
 * 5. Bahá'í Gardens & Terraces in Haifa (Mount Carmel) (x = 1180)
 * 6. Tower of David Citadel of Jerusalem (x = 1550)
 * 7. Western Wall / Kotel & Golden Dome of Jerusalem (x = 1910)
 * 8. White City Tel Aviv Bauhaus Architecture (x = 2250)
 * 9. Vera's Birthday Cake, Confetti & Azure/Golden Fireworks (x = 2540)
 * 10. Departure Airliner on sunny runway for the next adventure (x = 2920)
 */

import { PixelCat } from './PixelCat.js';

export class IsraelScene {
  constructor(config = {}) {
    this.config = config;
    this.worldWidth = 3200;
    this.groundY = 220; // Road surface level
    this.aliceGroundY = 224;

    // Landmark sequence
    this.landmarks = [
      {
        id: 'windmill',
        x: 480,
        title: 'Мельница Монтефиоре',
        type: 'windmill',
        w: 130,
        h: 155
      },
      {
        id: 'jaffa_clock',
        x: 820,
        title: 'Часовая башня Яффо',
        type: 'jaffa_clock',
        w: 88,
        h: 185
      },
      {
        id: 'bahai',
        x: 1180,
        title: 'Бахайские сады',
        type: 'bahai',
        w: 156,
        h: 140
      },
      {
        id: 'tower_david',
        x: 1550,
        title: 'Башня Давида',
        type: 'tower_david',
        w: 140,
        h: 175
      },
      {
        id: 'western_wall',
        x: 1910,
        title: 'Стена Плача',
        type: 'western_wall',
        w: 170,
        h: 160
      },
      {
        id: 'white_city',
        x: 2250,
        title: 'Белый город',
        type: 'white_city',
        w: 164,
        h: 155
      },
      {
        id: 'departure',
        x: 2920,
        title: 'Лайнер',
        type: 'departure',
        w: 220,
        h: 75
      }
    ];

    // Flying seagulls over the sea & promenade
    this.seagulls = [
      { x: 220, y: 55, vx: 1.6, flapTimer: 0 },
      { x: 680, y: 48, vx: 1.9, flapTimer: 1.2 },
      { x: 1340, y: 62, vx: 1.7, flapTimer: 2.4 },
      { x: 2150, y: 50, vx: 2.0, flapTimer: 0.8 },
      { x: 2780, y: 58, vx: 1.5, flapTimer: 1.9 }
    ];

    // Distant sailboats on the sea horizon
    this.sailboats = [
      { x: 380, speed: 0.25 },
      { x: 1050, speed: 0.20 },
      { x: 1820, speed: 0.28 },
      { x: 2520, speed: 0.22 }
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

    // Departure plane at x = 2920
    this.departurePlane = {
      x: 2920,
      y: 220,
      state: 'waiting',
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

    // Streetlamp positions (every plaza, elegant cast iron)
    this.streetlampPositions = [
      330, 625, 740, 900, 1040, 1315, 1425, 1680, 1775, 2050, 2130, 2375, 2470, 2610, 2720
    ];

    // Authentic Mediterranean Flora (framing landmarks, leaving facades fully visible)
    this.datePalmsTall = [310, 655, 1370, 2080, 2650];
    this.datePalmsMed = [600, 960, 1730, 2435];
    this.cypressesTall = [340, 925, 1335, 1705, 2030, 2360, 2590];
    this.cypressesMed = [695, 1015, 1400, 1750, 2115, 2490, 2685];
    this.bougainvilleas = [610, 740, 985, 1350, 2095, 2450, 2540, 2630];
    this.plantersGeranium = [325, 630, 895, 1310, 1675, 2045, 2370, 2605];
    this.plantersLavender = [335, 745, 1045, 1430, 1780, 2135, 2475, 2725];

    // Foreground Depth Layer elements (rooted offscreen at top y = 0 and bottom y = 270)
    // Coordinated to frame the plazas while keeping landmark centers open and unobstructed
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

    // Celebration particles (golden, azure, white, magenta)
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
    this.photoWindmill = load('./assets/photos/israel_montefiore_windmill_pixel.png');
    this.photoJaffaClock = load('./assets/photos/israel_jaffa_clock_tower_pixel.png');
    this.photoBahai = load('./assets/photos/israel_bahai_gardens_pixel.png');
    this.photoTowerDavid = load('./assets/photos/israel_tower_of_david_pixel.png');
    this.photoWesternWall = load('./assets/photos/israel_western_wall_pixel.png');
    this.photoBauhaus = load('./assets/photos/israel_white_city_bauhaus_pixel.png');
    this.photoCake = load('./assets/photos/israel_cake_pixel.png');

    // Pavement & Flora
    this.photoJerusalemStone = load('./assets/photos/israel_jerusalem_pavement.png');
    this.photoDatePalm = load('./assets/photos/israel_date_palm.png');
    this.photoDatePalmMed = load('./assets/photos/israel_date_palm_med.png');
    this.photoCypress = load('./assets/photos/israel_cypress.png');
    this.photoCypressMed = load('./assets/photos/israel_cypress_med.png');
    this.photoBougainvillea = load('./assets/photos/israel_bougainvillea.png');
    this.photoPlanterGeranium = load('./assets/photos/israel_planter_geranium.png');
    this.photoPlanterLavender = load('./assets/photos/israel_planter_lavender.png');

    // Architecture & Street Furniture
    this.photoStreetlamp = load('./assets/photos/israel_streetlamp.png');
    this.photoBgJerusalem = load('./assets/photos/israel_bg_jerusalem_house.png');
    this.photoBgBauhaus = load('./assets/photos/israel_bg_bauhaus_house.png');
    this.photoBgJaffa = load('./assets/photos/israel_bg_jaffa_house.png');

    // New White City Tel Aviv Architecture
    this.photoWhiteBauhausTall = load('./assets/photos/israel_white_bauhaus_tall.png');
    this.photoWhiteBauhausCorner = load('./assets/photos/israel_white_bauhaus_corner.png');
    this.photoWhiteResidence = load('./assets/photos/israel_white_residence.png');
    this.photoWhiteVilla = load('./assets/photos/israel_white_villa.png');
    this.photoWhiteCityCluster = load('./assets/photos/israel_white_city_cluster.png');

    // Foreground Depth Assets
    this.photoFgCanopy = load('./assets/photos/israel_fg_canopy.png');
    this.photoFgStreetlamp = load('./assets/photos/israel_fg_streetlamp.png');
    this.photoFgPot = load('./assets/photos/israel_fg_pot.png');

    // Airplanes
    this.photoAirplaneTarmac = load('./assets/photos/airplane_tarmac_pixel.png');
    this.photoAirplaneBoarded = load('./assets/photos/airplane_tarmac_boarded_pixel.png');
    this.photoAirplaneFlight = load('./assets/photos/airplane_flight_pixel.png');

    // Sky parallax layers (1 to 6 from background pack)
    this.skyLayers = [];
    for (let i = 1; i <= 6; i++) {
      this.skyLayers.push(load(`./assets/sky/israel_sky_${i}.png`));
    }

    // Cute living pixel cats across Israel
    this.cats = [
      new PixelCat({
        x: 840, // Near Old Jaffa Clock Tower
        groundY: this.aliceGroundY,
        breed: 'siamese',
        patrolRange: [810, 870],
        facing: 1
      }),
      new PixelCat({
        x: 1530, // Tower of David Citadel
        groundY: this.aliceGroundY,
        breed: 'brown',
        patrolRange: [1500, 1560],
        facing: -1
      }),
      new PixelCat({
        x: 2270, // Bauhaus White City
        groundY: this.aliceGroundY,
        breed: 'calico',
        patrolRange: [2240, 2310],
        facing: 1
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
      const isDeparture = this.airplane && (this.airplane.state === 'boarding' || this.airplane.state === 'taxi' || this.airplane.state === 'takeoff' || this.airplane.state === 'complete');
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

    // 1. Update landing plane
    this.updateArrivalAirplane(alice);

    // 2. Update departure plane
    this.updateDeparturePlane(alice, delta);

    // 3. Update atmosphere
    this.updateAtmosphere(delta);

    // 4. Update landmarks interaction
    this.updateLandmarksProximity(alice, input);

    // 5. Update particles (fireworks, confetti, sparkles)
    this.updateCelebrationParticles();
  }

  updateArrivalAirplane(alice) {
    const plane = this.airplane;
    if (plane.state === 'complete') return;

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
      plane.rot = -3; // slight flare

      // Touchdown when wheels touch tarmac at groundY (220)
      if (plane.y >= this.groundY) {
        plane.y = this.groundY;
        plane.state = 'touchdown';
        plane.rot = 0; // level upon contact
        if (this.audio) this.audio.playPlaneTouchdown();

        // White touchdown tire smoke
        for (let i = 0; i < 28; i++) {
          plane.touchdownSparks.push({
            x: plane.x + 115 + (Math.random() - 0.5) * 15,
            y: this.groundY - 1,
            vx: -plane.vx * (0.8 + Math.random() * 0.8),
            vy: -Math.random() * 1.5 - 0.5,
            size: Math.random() * 3 + 2,
            color: Math.random() > 0.5 ? '#ffffff' : '#e0f7fa',
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
          color: '#e0f2f1',
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
      alice.x = (plane.x + 54) - progress * 34; // step down to stairs foot at x = 90

      if (progress >= 1.0) {
        alice.x = plane.x + 20; // x = 90
        alice.y = this.aliceGroundY; // 224 firmly on pavement
        alice.facing = 1; // turn right towards Israel!
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

  updateDeparturePlane(alice, delta) {
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
    if (!this.landingComplete) {
      this.activeLandmark = null;
      return;
    }

    let nearest = null;
    let minDist = 34;

    for (const lm of this.landmarks) {
      const dist = Math.abs(alice.x - lm.x);
      if (dist < minDist) {
        minDist = dist;
        nearest = lm;
      }
    }

    this.activeLandmark = nearest;

    if (input && input.consumeInspect() && this.activeLandmark) {
      if (this.audio) this.audio.playInteract();
      if (this.inspectedLandmark && this.inspectedLandmark.id === this.activeLandmark.id) {
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

  spawnFireworkBurst(bx, by) {
    const colors = ['#00e5ff', '#ffd700', '#ffffff', '#ff4081', '#76ff03'];
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

    // 1. Layered Pixel Art Mediterranean Sky & Clouds (Pack Background 1)
    this.renderSky(ctx, cameraX, canvasWidth, canvasHeight);

    // 2. Mediterranean Sea Horizon with Sailboats
    this.renderSeaHorizon(ctx, cameraX, canvasWidth);

    // 3. Distant White City Rooftops & Bauhaus Terraces (Parallax 0.55, solid blurred)
    this.renderDistantArchitecture(ctx, cameraX, canvasWidth);

    // 4. Seagulls Gliding
    this.renderSeagulls(ctx, cameraX);
  }

  renderSky(ctx, cameraX, canvasWidth, canvasHeight) {
    // Fallback base gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, this.groundY);
    skyGrad.addColorStop(0, '#589bf8');
    skyGrad.addColorStop(0.7, '#8bc0fd');
    skyGrad.addColorStop(1.0, '#d1e6fe');
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

  renderSeaHorizon(ctx, cameraX, canvasWidth) {
    const seaY = 178;
    const seaH = this.groundY - seaY; // 42px tall sea strip
    if (seaH <= 0) return;

    // Mediterranean Sea vibrant cyan/turquoise gradient on horizon
    const seaGrad = ctx.createLinearGradient(0, seaY, 0, seaY + seaH);
    seaGrad.addColorStop(0, '#0097a7');   // deep turquoise horizon
    seaGrad.addColorStop(0.45, '#00bcd4'); // vibrant Mediterranean blue
    seaGrad.addColorStop(0.85, '#4dd0e1'); // sparkling near-shore
    seaGrad.addColorStop(1.0, '#80deea');  // sunlit shallows
    ctx.fillStyle = seaGrad;
    ctx.fillRect(0, seaY, canvasWidth, seaH);

    // Sea ripples & shimmering white wave crests on horizon
    ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
    for (let i = 0; i < 18; i++) {
      const wx = ((i * 43 + cameraX * 0.22) % (canvasWidth + 80)) - 40;
      const wy = seaY + 3 + (i % 5) * 4;
      ctx.fillRect(Math.round(wx), wy, 9 + (i % 4) * 4, 1);
    }

    // Sailboats gliding on the Mediterranean horizon
    for (const sb of this.sailboats) {
      const sx = Math.round(sb.x - cameraX * 0.32);
      if (sx >= -40 && sx <= canvasWidth + 40) {
        this.renderSailboat(ctx, sx, seaY + 12);
      }
    }

    // GROUND THE CITY: Solid coastal promenade seawall & stone boulevard terrace
    // Under the buildings along the city segment (x = 300 .. 2680), we draw a solid
    // stone embankment from y = 196 to groundY (220).
    // This completely covers the sea under the buildings, so buildings sit on solid stone ground!
    // At the runways (cameraX < 280 and cameraX > 2500), it smoothly fades/opens up to the sea.
    let cityEmbankmentAlpha = 1.0;
    if (cameraX < 280) {
      cityEmbankmentAlpha = Math.max(0, Math.min(1, (cameraX - 100) / 180));
    } else if (cameraX > 2480) {
      cityEmbankmentAlpha = Math.max(0, Math.min(1, 1 - (cameraX - 2480) / 180));
    }

    if (cityEmbankmentAlpha > 0) {
      ctx.save();
      ctx.globalAlpha = cityEmbankmentAlpha;
      const embY = 195;
      const embH = this.groundY - embY + 2; // 27px solid ground
      ctx.fillStyle = '#bcaaa4'; // stone seawall base
      ctx.fillRect(0, embY, canvasWidth, embH);
      ctx.fillStyle = '#d7ccc8'; // stone pavement sidewalk
      ctx.fillRect(0, embY + 2, canvasWidth, embH - 2);

      // Stone parapet cap dividing city and sea
      ctx.fillStyle = '#8d6e63';
      ctx.fillRect(0, embY, canvasWidth, 2);
      ctx.fillStyle = '#5d4037';
      ctx.fillRect(0, embY + 2, canvasWidth, 1);
      ctx.restore();
    }
  }

  renderSailboat(ctx, x, y) {
    ctx.save();
    // Hull
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(x - 5, y);
    ctx.lineTo(x + 5, y);
    ctx.lineTo(x + 3, y + 2);
    ctx.lineTo(x - 3, y + 2);
    ctx.closePath();
    ctx.fill();

    // Mast
    ctx.fillStyle = '#37474f';
    ctx.fillRect(x, y - 9, 1, 9);

    // White triangular sail
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
    // Smoothly fade out at landing (x < 280) and departure runway (x > 2480) for open coastal sky
    let runwayAlpha = 1.0;
    if (cameraX < 280) {
      runwayAlpha = Math.max(0, Math.min(1, (cameraX - 100) / 180));
    } else if (cameraX > 2480) {
      runwayAlpha = Math.max(0, Math.min(1, 1 - (cameraX - 2480) / 180));
    }
    if (runwayAlpha <= 0) return;

    const baselineY = this.groundY + 2;

    // LAYER 1: FAR HORIZON SKYLINE (Parallax 0.36x, 100% solid, softly blurred 0.6px)
    // Continuous panoramic white Bauhaus streetscape cluster stretching across the horizon
    if (this.photoWhiteCityCluster && this.photoWhiteCityCluster.complete) {
      ctx.save();
      ctx.globalAlpha = 1.0 * runwayAlpha;
      ctx.filter = 'blur(0.6px)';
      const pFar = 0.36;
      const clusterW = 380;
      const clusterH = 142;
      const clusterPositions = [260, 620, 980, 1340, 1700, 2060, 2420];

      for (const wx of clusterPositions) {
        const sx = Math.round(wx - cameraX * pFar);
        if (sx >= -clusterW && sx <= canvasWidth + 50) {
          ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
          ctx.fillRect(sx, baselineY - 2, clusterW, 4);
          ctx.drawImage(this.photoWhiteCityCluster, sx, baselineY - clusterH, clusterW, clusterH);
        }
      }
      ctx.restore();
    }

    // LAYER 2: MID-GROUND WHITE CITY STREETSCAPE (Parallax 0.52x, 100% solid, softly blurred 0.5px)
    // Dense interlocking row of distinct white Tel Aviv Bauhaus apartments, corner boutiques,
    // modern residences with blue awnings, and Mediterranean villas
    ctx.save();
    ctx.globalAlpha = 1.0 * runwayAlpha;
    ctx.filter = 'blur(0.5px)';
    const pMid = 0.52;

    const midBuildings = [
      { type: 'tall', x: 280, w: 125, h: 142 },
      { type: 'villa', x: 395, w: 115, h: 105 },
      { type: 'corner', x: 505, w: 130, h: 118 },
      { type: 'residence', x: 625, w: 125, h: 112 },
      { type: 'jaffa', x: 745, w: 110, h: 95 },
      { type: 'tall', x: 860, w: 125, h: 142 },
      { type: 'corner', x: 975, w: 130, h: 118 },
      { type: 'residence', x: 1095, w: 125, h: 112 },
      { type: 'villa', x: 1210, w: 115, h: 105 },
      { type: 'bauhaus', x: 1320, w: 115, h: 90 },
      { type: 'tall', x: 1430, w: 125, h: 142 },
      { type: 'corner', x: 1545, w: 130, h: 118 },
      { type: 'residence', x: 1665, w: 125, h: 112 },
      { type: 'jerusalem', x: 1780, w: 115, h: 100 },
      { type: 'villa', x: 1895, w: 115, h: 105 },
      { type: 'tall', x: 2005, w: 125, h: 142 },
      { type: 'corner', x: 2120, w: 130, h: 118 },
      { type: 'residence', x: 2240, w: 125, h: 112 },
      { type: 'bauhaus', x: 2355, w: 115, h: 90 },
      { type: 'villa', x: 2465, w: 115, h: 105 },
      { type: 'corner', x: 2575, w: 130, h: 118 }
    ];

    for (const b of midBuildings) {
      const sx = Math.round(b.x - cameraX * pMid);
      if (sx >= -b.w - 40 && sx <= canvasWidth + 40) {
        let img = this.photoWhiteBauhausTall;
        if (b.type === 'corner') img = this.photoWhiteBauhausCorner;
        else if (b.type === 'residence') img = this.photoWhiteResidence;
        else if (b.type === 'villa') img = this.photoWhiteVilla;
        else if (b.type === 'bauhaus') img = this.photoBgBauhaus;
        else if (b.type === 'jerusalem') img = this.photoBgJerusalem;
        else if (b.type === 'jaffa') img = this.photoBgJaffa;

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
    ctx.strokeStyle = '#263238';
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
    // 1. SOLID GROUND & JERUSALEM STONE PAVEMENT (Flush to bottom y = 275)
    this.renderGround(ctx, cameraX, canvasWidth, canvasHeight);

    // 2. MIDGROUND FLORA: Date Palms, Cypresses, Bougainvilleas, Planters
    this.renderVegetation(ctx, cameraX);

    // 3. THE 6 ICONIC LANDMARKS (100% Grounded)
    this.renderLandmarks(ctx, cameraX);

    // 4. STREETLAMPS (Warm Mediterranean cast-iron)
    this.renderStreetlamps(ctx, cameraX);

    // 6. ARRIVAL & DEPARTURE AIRPLANES
    this.renderArrivalAirplane(ctx, cameraX);
    this.renderDepartureAirplane(ctx, cameraX);

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
    const bottomY = canvasHeight + 5; // 275
    const roadH = bottomY - gy;

    // Solid foundation underlay (prevents any blue sky background showing through)
    ctx.fillStyle = '#5d4037';
    ctx.fillRect(0, gy, canvasWidth, roadH);

    // Runway: 0 .. 340 (Arrival) and 2750 .. 3200 (Departure)
    const drawRunway = (startX, endX) => {
      const sx1 = Math.round(startX - cameraX);
      const sx2 = Math.round(endX - cameraX);
      if (sx2 < -50 || sx1 > canvasWidth + 50) return;

      const rw = sx2 - sx1;
      // Dark tarmac
      ctx.fillStyle = '#37474f';
      ctx.fillRect(sx1, gy, rw, roadH);
      // White boundary lines
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(sx1, gy, rw, 2);
      ctx.fillRect(sx1, gy + 3, rw, 1);
      // Yellow dashed taxiway lines
      ctx.fillStyle = '#fbc02d';
      for (let x = startX; x < endX; x += 32) {
        const dX = Math.round(x - cameraX);
        if (dX >= -20 && dX <= canvasWidth + 20) {
          ctx.fillRect(dX, gy + 18, 16, 2);
        }
      }
      // Blue taxiway edge lights
      ctx.fillStyle = '#00e5ff';
      for (let x = startX + 10; x < endX; x += 40) {
        const dX = Math.round(x - cameraX);
        if (dX >= 0 && dX <= canvasWidth) {
          ctx.fillRect(dX, gy - 2, 2, 2);
        }
      }
    };

    drawRunway(-200, 340);
    drawRunway(2750, 3300);

    // Jerusalem Stone Promenade: 340 .. 2750
    const promStart = Math.max(0, Math.round(340 - cameraX));
    const promEnd = Math.min(canvasWidth, Math.round(2750 - cameraX));

    if (promEnd > promStart) {
      // Repeating seamless Jerusalem limestone texture
      if (this.photoJerusalemStone && this.photoJerusalemStone.complete) {
        ctx.save();
        const pattern = ctx.createPattern(this.photoJerusalemStone, 'repeat');
        if (pattern) {
          ctx.translate(-Math.round(cameraX % 64), gy);
          ctx.fillStyle = pattern;
          ctx.fillRect(Math.round(cameraX % 64) + promStart, 0, promEnd - promStart, roadH);
        }
        ctx.restore();
      } else {
        // Fallback warm limestone
        ctx.fillStyle = '#d9caa8';
        ctx.fillRect(promStart, gy, promEnd - promStart, roadH);
      }

      // Elegant Promenade Curb & Brass Railing at top
      ctx.fillStyle = '#bcaaa4';
      ctx.fillRect(promStart, gy, promEnd - promStart, 3);
      ctx.fillStyle = '#8d6e63';
      ctx.fillRect(promStart, gy + 3, promEnd - promStart, 1);
    }
  }

  renderVegetation(ctx, cameraX) {
    const gy = this.groundY;

    const drawFlora = (img, x, w, h, shadowW = 0.4) => {
      const sx = Math.round(x - cameraX);
      if (sx < -w - 30 || sx > 510) return;

      // Contact shadow & soil patch under roots
      ctx.fillStyle = 'rgba(62, 39, 35, 0.45)';
      ctx.beginPath();
      ctx.ellipse(sx + w * 0.5, gy + 1, w * shadowW, 3, 0, 0, Math.PI * 2);
      ctx.fill();

      if (img && img.complete) {
        ctx.drawImage(img, sx, gy - h + 2, w, h);
      }
    };

    // Slender Mediterranean Cypresses (Drawn first in background flora)
    for (const x of this.cypressesTall) {
      drawFlora(this.photoCypress, x, 28, 130, 0.35);
    }
    for (const x of this.cypressesMed) {
      drawFlora(this.photoCypressMed, x, 25, 115, 0.35);
    }

    // Tall Arching Date Palms
    for (const x of this.datePalmsTall) {
      drawFlora(this.photoDatePalm, x, 72, 145, 0.45);
    }
    for (const x of this.datePalmsMed) {
      drawFlora(this.photoDatePalmMed, x, 65, 130, 0.45);
    }

    // Flowering Magenta Bougainvillea Pergolas
    for (const x of this.bougainvilleas) {
      drawFlora(this.photoBougainvillea, x, 78, 68, 0.5);
    }

    // Blooming Terracotta Planters (Geranium & Lavender)
    for (const x of this.plantersGeranium) {
      drawFlora(this.photoPlanterGeranium, x, 22, 28, 0.4);
    }
    for (const x of this.plantersLavender) {
      drawFlora(this.photoPlanterLavender, x, 22, 28, 0.4);
    }
  }

  renderLandmarks(ctx, cameraX) {
    const gy = this.groundY;

    const drawLandmark = (img, lm) => {
      const sx = Math.round(lm.x - lm.w * 0.5 - cameraX);
      if (sx < -lm.w - 50 || sx > 530) return;

      // Solid contact shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.32)';
      ctx.beginPath();
      ctx.ellipse(sx + lm.w * 0.5, gy + 1, lm.w * 0.46, 4, 0, 0, Math.PI * 2);
      ctx.fill();

      // Solid foundation under plinth
      ctx.fillStyle = '#4e342e';
      ctx.fillRect(sx + 2, gy - 2, lm.w - 4, 5);

      if (img && img.complete) {
        ctx.drawImage(img, sx, gy - lm.h + 2, lm.w, lm.h);
      }
    };

    // 1. Moses Montefiore Windmill (x = 480)
    drawLandmark(this.photoWindmill, this.landmarks[0]);

    // 2. Old Jaffa Clock Tower with full stone base (x = 820)
    drawLandmark(this.photoJaffaClock, this.landmarks[1]);

    // 3. Bahá'í Gardens in Haifa (x = 1180)
    drawLandmark(this.photoBahai, this.landmarks[2]);

    // 4. Tower of David Jerusalem (x = 1550)
    drawLandmark(this.photoTowerDavid, this.landmarks[3]);

    // 5. Western Wall / Kotel & Golden Dome (x = 1910)
    drawLandmark(this.photoWesternWall, this.landmarks[4]);

    // 6. White City Tel Aviv Bauhaus (x = 2250)
    drawLandmark(this.photoBauhaus, this.landmarks[5]);
  }

  renderStreetlamps(ctx, cameraX) {
    const gy = this.groundY;
    const w = 24;
    const h = 75;

    for (const x of this.streetlampPositions) {
      const sx = Math.round(x - cameraX);
      if (sx < -w || sx > 500) continue;

      // Solid base
      ctx.fillStyle = '#212121';
      ctx.fillRect(sx + 6, gy - 2, 12, 5);

      if (this.photoStreetlamp && this.photoStreetlamp.complete) {
        ctx.drawImage(this.photoStreetlamp, sx, gy - h + 2, w, h);
      }

      // Warm lantern glow
      ctx.save();
      const lx = sx + 4;
      const ly = gy - h + 18;
      const glow = ctx.createRadialGradient(lx, ly, 2, lx, ly, 16);
      glow.addColorStop(0, 'rgba(255, 245, 157, 0.65)');
      glow.addColorStop(1, 'rgba(255, 238, 88, 0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(lx, ly, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
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

  drawForeground(ctx, cameraX, canvasWidth, canvasHeight, aliceX, aliceY) {
    // 1. FOREGROUND DEPTH LAYER (Overhanging canopy & Bottom-up streetlamps & planters)
    this.renderForegroundDepth(ctx, cameraX, canvasWidth, canvasHeight);

    // 2. Floating [ F ] Prompt
    this.renderUI(ctx, cameraX, canvasWidth, canvasHeight);

    // 3. Birthday letter modal
    if (this.showBirthdayLetter) {
      this.renderBirthdayLetterModal(ctx, canvasWidth, canvasHeight);
    }

    // 4. Departure confirmation modal
    if (this.showDepartureLetter) {
      this.renderDepartureModal(ctx, canvasWidth, canvasHeight);
    }
  }

  renderForegroundDepth(ctx, cameraX, canvasWidth, canvasHeight) {
    ctx.save();
    ctx.filter = 'blur(1.8px)';
    ctx.globalAlpha = 0.96;

    // 1. Overhanging Top Canopy (Palm fronds & trailing magenta bougainvillea hanging from top border)
    // Parallax 1.15x
    if (this.photoFgCanopy && this.photoFgCanopy.complete) {
      const pTop = 1.15;
      const canopyW = 225;
      const canopyH = 110;
      const topY = -15;

      for (let i = 0; i < this.fgCanopies.length; i++) {
        const wx = this.fgCanopies[i];
        const sx = Math.round(wx - cameraX * pTop);
        if (sx >= -canopyW && sx <= canvasWidth + 50) {
          ctx.save();
          if (i % 2 === 1) {
            // Flip horizontally for organic variation
            ctx.translate(sx + canopyW, topY);
            ctx.scale(-1, 1);
            ctx.drawImage(this.photoFgCanopy, 0, 0, canopyW, canopyH);
          } else {
            ctx.drawImage(this.photoFgCanopy, sx, topY, canopyW, canopyH);
          }
          ctx.restore();
        }
      }
    }

    // 2. Large Cast-Iron Streetlamps rooted offscreen below bottom y = 270 (Parallax 1.22x)
    if (this.photoFgStreetlamp && this.photoFgStreetlamp.complete) {
      const pLamp = 1.22;
      const lampW = 65;
      const lampH = 143;
      // Rising up from bottom edge: base is below y = 270, lantern reaches y = 148
      const lampY = canvasHeight - 122;

      for (const wx of this.fgStreetlamps) {
        const sx = Math.round(wx - cameraX * pLamp);
        if (sx >= -lampW && sx <= canvasWidth + 50) {
          ctx.drawImage(this.photoFgStreetlamp, sx, lampY, lampW, lampH);

          // Warm lantern glow in foreground
          const lx = sx + 22;
          const ly = lampY + 28;
          const glow = ctx.createRadialGradient(lx, ly, 3, lx, ly, 22);
          glow.addColorStop(0, 'rgba(255, 245, 157, 0.7)');
          glow.addColorStop(1, 'rgba(255, 238, 88, 0)');
          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(lx, ly, 22, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // 3. Large Terracotta Planters rooted offscreen below bottom y = 270 (Parallax 1.20x)
    if (this.photoFgPot && this.photoFgPot.complete) {
      const pPot = 1.20;
      const potW = 93;
      const potH = 110;
      // Base sits below bottom edge y = 270, flowers bloom up to y = 195
      const potY = canvasHeight - 75;

      for (const wx of this.fgPlanters) {
        const sx = Math.round(wx - cameraX * pPot);
        if (sx >= -potW && sx <= canvasWidth + 50) {
          ctx.drawImage(this.photoFgPot, sx, potY, potW, potH);
        }
      }
    }

    ctx.restore();
  }

  renderUI(ctx, cameraX, canvasWidth, canvasHeight) {
    if (this.activeLandmark && !this.showBirthdayLetter && !this.showDepartureLetter) {
      const lm = this.activeLandmark;
      const screenX = Math.round(lm.x - cameraX);
      const promptY = lm.type === 'departure' ? 140 : 135;
      const floatOffset = Math.sin(this.promptPulse) * 2.5;

      ctx.save();
      const btnW = 24;
      const btnH = 15;
      const bx = Math.round(screenX - btnW / 2);
      const by = Math.round(promptY + floatOffset);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.fillRect(bx, by, btnW, btnH);
      ctx.strokeStyle = '#0288d1';
      ctx.lineWidth = 1;
      ctx.strokeRect(bx, by, btnW, btnH);

      ctx.shadowColor = '#4fc3f7';
      ctx.shadowBlur = 6;

      ctx.font = 'bold 12px "Handjet", "VT323", monospace';
      ctx.fillStyle = '#01579b';
      ctx.textAlign = 'center';
      ctx.fillText('[ F ]', bx + btnW / 2, by + 11);
      ctx.restore();
    }

    // Minimal bottom landmark title card if inspected
    if (this.inspectedLandmark && !this.showBirthdayLetter && !this.showDepartureLetter) {
      const lm = this.inspectedLandmark;
      ctx.save();
      ctx.font = 'bold 13px "Handjet", "VT323", monospace';
      const text = lm.title;
      const metrics = ctx.measureText(text);
      const boxW = metrics.width + 16;
      const boxH = 18;
      const boxX = Math.round((canvasWidth - boxW) / 2);
      const boxY = canvasHeight - 26;

      ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
      ctx.fillRect(boxX, boxY, boxW, boxH);

      ctx.fillStyle = '#e0f7fa';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, canvasWidth / 2, boxY + boxH / 2 + 1);
      ctx.restore();
    }

    // Cat Petting Prompt (minimalist, no box, no frame, no stars)
    if (this.nearbyCat && !this.showBirthdayLetter && !this.showDepartureLetter) {
      const cat = this.nearbyCat;
      const sx = Math.round(cat.x - cameraX);
      const floatOffset = Math.sin(this.promptPulse * 1.5) * 2;
      const py = Math.round(cat.groundY - 32 + floatOffset);

      const label = cat.isPetted ? '[ E ] ПОГЛАДИТЬ ЕЩЁ' : '[ E ] ПОГЛАДИТЬ';

      ctx.save();
      ctx.font = 'bold 12px "Handjet", "VT323", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // 1px dark outline for visibility
      ctx.fillStyle = '#06101e';
      ctx.fillText(label, sx + 1, py);
      ctx.fillText(label, sx - 1, py);
      ctx.fillText(label, sx, py + 1);
      ctx.fillText(label, sx, py - 1);

      // Crisp white text
      ctx.fillStyle = '#ffffff';
      ctx.fillText(label, sx, py);
      ctx.restore();
    }

    // Top-Right Cat Counter Badge (clean minimal)
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
      ctx.fillStyle = '#06101e';
      ctx.fillText(text, badgeX + 1, badgeY);
      ctx.fillText(text, badgeX - 1, badgeY);
      ctx.fillText(text, badgeX, badgeY + 1);
      ctx.fillText(text, badgeX, badgeY - 1);

      ctx.fillStyle = pettedCount === totalCats ? '#00e5ff' : '#ffffff';
      ctx.fillText(text, badgeX, badgeY);
      ctx.restore();
    }
  }

  renderBirthdayLetterModal(ctx, canvasWidth, canvasHeight) {
    const modalW = 380;
    const modalH = 210;
    const modalX = (canvasWidth - modalW) / 2;
    const modalY = (canvasHeight - modalH) / 2;

    // Scrim
    ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Card parchment
    ctx.fillStyle = '#fffdf7';
    ctx.fillRect(modalX, modalY, modalW, modalH);
    ctx.strokeStyle = '#0288d1';
    ctx.lineWidth = 2;
    ctx.strokeRect(modalX, modalY, modalW, modalH);

    // Inner gold border
    ctx.strokeStyle = '#ffd54f';
    ctx.lineWidth = 1;
    ctx.strokeRect(modalX + 4, modalY + 4, modalW - 8, modalH - 8);

    // Header
    ctx.font = 'bold 15px "Handjet", "VT323", monospace';
    ctx.fillStyle = '#01579b';
    ctx.textAlign = 'center';
    ctx.fillText('✧ С ДНЁМ РОЖДЕНИЯ, ВЕРА! ✧', canvasWidth / 2, modalY + 24);

    // Letter Lines
    ctx.font = '11px "Handjet", "VT323", monospace';
    ctx.fillStyle = '#263238';
    ctx.textAlign = 'left';

    const lines = [
      'Дорогая Верочка!',
      '',
      'Наше путешествие продолжается под тёплым солнцем Средиземноморья!',
      'Пусть каждый твой день будет наполнен морским бризом, вдохновением,',
      'яркими открытиями и искренней любовью. Ты — самое прекрасное чудо,',
      'и впереди тебя ждёт ещё столько удивительных городов и сказок!',
      '',
      'С любовью и восхищением ♥'
    ];

    let lineY = modalY + 48;
    for (const l of lines) {
      ctx.fillText(l, modalX + 18, lineY);
      lineY += 15;
    }

    // Dismiss prompt
    ctx.font = '10px "Handjet", "VT323", monospace';
    ctx.fillStyle = '#0288d1';
    ctx.textAlign = 'center';
    ctx.fillText('[ Нажмите F, чтобы закрыть письмо ]', canvasWidth / 2, modalY + modalH - 12);
  }

  renderDepartureModal(ctx, canvasWidth, canvasHeight) {
    const modalW = 280;
    const modalH = 80;
    const modalX = (canvasWidth - modalW) / 2;
    const modalY = (canvasHeight - modalH) / 2;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    ctx.fillStyle = '#fffdf7';
    ctx.fillRect(modalX, modalY, modalW, modalH);
    ctx.strokeStyle = '#0288d1';
    ctx.lineWidth = 2;
    ctx.strokeRect(modalX, modalY, modalW, modalH);

    ctx.font = 'bold 12px "Handjet", "VT323", monospace';
    ctx.fillStyle = '#01579b';
    ctx.textAlign = 'center';
    ctx.fillText('✈ Посадка на рейс в следующий город', canvasWidth / 2, modalY + 30);

    ctx.font = '10px "Handjet", "VT323", monospace';
    ctx.fillStyle = '#546e7a';
    ctx.fillText('Алиса поднимается на борт лайнера...', canvasWidth / 2, modalY + 54);
  }
}
