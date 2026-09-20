import { MEMORIES_CONFIG } from '../config/memories.js';
import { PixelAlice } from '../entities/PixelAlice.js';
import { SaranskScene } from '../entities/SaranskScene.js';
import { MoscowScene } from '../entities/MoscowScene.js?v=20260920_1950';
import { IsraelScene } from '../entities/IsraelScene.js';
import { BarcelonaScene } from '../entities/BarcelonaScene.js';
import { FlightScene } from '../entities/FlightScene.js?v=20260920_1950';
import { CosmicFloatingOverlay } from '../entities/CosmicFloatingOverlay.js';
import { InteractiveCakeStage } from '../entities/InteractiveCakeStage.js';
import { ShootingStar } from '../entities/ShootingStar.js?v=20260920_1950';
import { PixelInput } from './PixelInput.js';
import { PixelAudio } from './PixelAudio.js';

/**
 * Pure 2D Pixel Art Game Engine
 * Native resolution: 480 x 270 (16:9 pixel-perfect retro canvas)
 * Presented inside an interactive Greeting Card Booklet with 3D Page Flip
 * 
 * Levels:
 * 1. Saransk Promenade (Takeoff on plane)
 * 2. 10-second Night Flight on Page 2
 * 3. Moscow Promenade (Touchdown on runway, Red Square, Landmarks)
 * 4. Israel Promenade (Touchdown at Ben Gurion, Mediterranean coast, Jaffa, Haifa, Jerusalem)
 * 5. Barcelona Promenade (Touchdown at El Prat, Catalan Modernisme, Gaudi architecture, Book Edge Zero-G Leap, Grand 26-Candle Birthday Cake finale)
 */
export class Game2D {
  constructor() {
    this.canvas = document.getElementById('pixel-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.ctx.imageSmoothingEnabled = false;

    this.width = 480;
    this.height = 270;
    this.cameraX = 0;

    // Config & Core
    this.config = MEMORIES_CONFIG;
    this.input = new PixelInput();
    this.audio = new PixelAudio(this.config.playlist);

    // Romantic Shooting Star («Загадай желание»)
    this.shootingStar = new ShootingStar({ audio: this.audio });

    // Overlays for Zero-G space leap and grand birthday cake finale
    this.cosmicOverlay = new CosmicFloatingOverlay({ audio: this.audio });
    this.cakeStage = new InteractiveCakeStage({ audio: this.audio });
    this.aliceCosmicHidden = false;

    // Entities & Scene Setup
    const urlParams = new URLSearchParams(window.location.search);
    this.urlParams = urlParams;
    const sceneParam = urlParams.get('scene');
    if (sceneParam === 'barcelona') {
      this.currentSceneType = 'barcelona';
    } else if (sceneParam === 'israel') {
      this.currentSceneType = 'israel';
    } else if (sceneParam === 'moscow') {
      this.currentSceneType = 'moscow';
    } else {
      this.currentSceneType = 'saransk';
    }

    const startX = urlParams.get('x') ? parseFloat(urlParams.get('x')) : 60;
    this.alice = new PixelAlice(startX, 224);
    this.alice.setAudio(this.audio);

    const testLanding = urlParams.get('test_landing') === '1';

    if (this.currentSceneType === 'barcelona') {
      this.scene = new BarcelonaScene(this.config);
      this.scene.audio = this.audio;
      this.audio.currentTrackIndex = 4; // Justin Hurwitz - Señor Avocado for Barcelona!
      if (!testLanding && urlParams.get('x')) {
        this.alice.x = parseFloat(urlParams.get('x'));
        this.scene.airplane.state = 'complete';
        this.scene.landingComplete = true;
        this.scene.airplane.x = 70;
        this.scene.airplane.y = 220;
        this.scene.airplane.rot = 0;
      } else {
        this.alice.x = -140;
        this.alice.y = this.scene.aliceGroundY || 224;
      }
      this.scene.onCosmicLeap = (alice) => {
        this.triggerCosmicFinale(alice);
      };
    } else if (this.currentSceneType === 'israel') {
      this.scene = new IsraelScene(this.config);
      this.scene.audio = this.audio;
      this.audio.currentTrackIndex = 2; // Manny And Nellie's Theme for Israel
      if (!testLanding && urlParams.get('x')) {
        this.alice.x = parseFloat(urlParams.get('x'));
        this.scene.airplane.state = 'complete';
        this.scene.landingComplete = true;
        this.scene.airplane.x = 70;
        this.scene.airplane.y = 220;
        this.scene.airplane.rot = 0;
      } else {
        this.alice.x = -140;
        this.alice.y = this.scene.aliceGroundY || 224;
      }
      this.scene.onTakeoffComplete = () => {
        this.triggerPageFlipTransition('barcelona');
      };
    } else if (this.currentSceneType === 'moscow') {
      this.scene = new MoscowScene(this.config);
      this.scene.audio = this.audio;
      this.audio.currentTrackIndex = 1; // Coke Room for Moscow
      if (!testLanding && urlParams.get('x')) {
        this.alice.x = parseFloat(urlParams.get('x'));
        this.scene.airplane.state = 'complete';
        this.scene.landingComplete = true;
        this.scene.airplane.x = 70;
        this.scene.airplane.y = 220;
        this.scene.airplane.rot = 0;
      } else {
        this.alice.x = -140;
        this.alice.y = this.scene.aliceGroundY || 224;
      }
      this.scene.onLandmarkSnapshot = (lm) => {
        this.triggerPolaroidSnapshot(lm);
      };
      this.scene.onTakeoffComplete = () => {
        this.triggerPageFlipTransition('israel');
      };
    } else {
      this.scene = new SaranskScene(this.config);
      this.scene.audio = this.audio;
      this.alice.y = this.scene.aliceGroundY || 224;
      this.scene.onTakeoffComplete = () => {
        this.triggerPageFlipTransition('moscow');
      };
    }

    if (urlParams.get('x')) {
      const targetCam = this.alice.x - this.width * 0.4;
      this.cameraX = Math.max(0, Math.min(this.scene.worldWidth - this.width, targetCam));
    }

    if (urlParams.get('inspect')) {
      const idx = parseInt(urlParams.get('inspect')) || 0;
      if (this.scene.landmarks[idx]) {
        this.scene.inspectedLandmark = this.scene.landmarks[idx];
        this.scene.activeLandmark = this.scene.landmarks[idx];
      }
    }

    this.firstInputHandled = false;
    this.confetti = [];
    this.pageFlipped = false;
    this.pendingTargetScene = 'moscow';
    this.flightTimerId = null;

    // Interactive Vintage Book & UI elements
    this.interactiveBook = document.getElementById('interactive-book');
    this.bookSurfaceImg = document.getElementById('book-surface-img');
    this.bookClickHint = document.getElementById('book-click-hint');
    this.cardBooklet = document.getElementById('greeting-card-booklet');
    this.closeGameBtn = document.getElementById('close-game-btn');
    this.bookPageFlipPlayer = document.getElementById('book-page-flip-player');
    this.gamePageContainer = document.getElementById('booklet-game-page');
    this.flightPageContainer = document.getElementById('flight-page-container');
    this.touchControls = document.getElementById('mobile-touch-controls');
    this.orientationHint = document.getElementById('orientation-hint');
    this.currentCameraView = null;

    // Interactive Flight Scene on Page 2
    const flightCanvas = document.getElementById('flight-canvas');
    if (flightCanvas) {
      this.flightScene = new FlightScene(flightCanvas);
      this.flightScene.shootingStar = this.shootingStar;
      this.flightScene.onFlightComplete = () => {
        if (this.pendingTargetScene === 'barcelona') {
          this.completeFlightAndLandInBarcelona();
        } else if (this.pendingTargetScene === 'israel') {
          this.completeFlightAndLandInIsrael();
        } else {
          this.completeFlightAndLandInMoscow();
        }
      };
    } else {
      this.flightScene = null;
    }

    this.preloadBookFrames();
    this.initUI();
    this.updateTrackDisplay();

    // Start 60fps game loop
    this.lastTime = performance.now();
    requestAnimationFrame((t) => this.gameLoop(t));
  }

  setCameraView(mode) {
    if (this.currentCameraView === mode) return;
    this.currentCameraView = mode;
    const book = this.interactiveBook || document.getElementById('interactive-book');
    if (book) {
      book.classList.remove('view-left-page', 'view-right-page', 'view-full-spread');
      if (mode === 'left') {
        book.classList.add('view-left-page');
      } else if (mode === 'right') {
        book.classList.add('view-right-page');
      } else if (mode === 'full') {
        book.classList.add('view-full-spread');
      }
    }
  }

  preloadBookFrames() {
    this.bookOpenFrames = [];
    for (let i = 0; i < 5; i++) {
      const img = new Image();
      img.src = `./assets/book/open/frame_${i}.png`;
      this.bookOpenFrames.push(img);
    }
    this.bookFlipFrames = [];
    for (let i = 0; i <= 7; i++) {
      const img = new Image();
      img.src = `./assets/book/flip/frame_${i}.png`;
      this.bookFlipFrames.push(img);
    }
  }

  playBookOpenAnimation(onDone) {
    if (!this.bookSurfaceImg || !this.bookOpenFrames || this.bookOpenFrames.length === 0) {
      if (onDone) onDone();
      return;
    }
    let frame = 0;
    this.bookSurfaceImg.src = this.bookOpenFrames[0].src;
    const interval = setInterval(() => {
      frame++;
      if (frame < this.bookOpenFrames.length) {
        this.bookSurfaceImg.src = this.bookOpenFrames[frame].src;
      } else {
        clearInterval(interval);
        if (onDone) onDone();
      }
    }, 70);
  }

  playBookCloseAnimation(onDone) {
    if (!this.bookSurfaceImg || !this.bookOpenFrames || this.bookOpenFrames.length === 0) {
      if (onDone) onDone();
      return;
    }
    let frame = this.bookOpenFrames.length - 1;
    this.bookSurfaceImg.src = this.bookOpenFrames[frame].src;
    const interval = setInterval(() => {
      frame--;
      if (frame >= 0) {
        this.bookSurfaceImg.src = this.bookOpenFrames[frame].src;
      } else {
        clearInterval(interval);
        if (onDone) onDone();
      }
    }, 70);
  }

  playPageFlipAnimation(onMidpoint, onDone) {
    if (this.audio && this.audio.playPageFlip) {
      this.audio.playPageFlip();
    }
    if (!this.bookPageFlipPlayer || !this.bookFlipFrames || this.bookFlipFrames.length === 0) {
      if (onMidpoint) onMidpoint();
      if (onDone) onDone();
      return;
    }
    this.bookPageFlipPlayer.src = this.bookFlipFrames[0].src;
    this.bookPageFlipPlayer.classList.remove('hidden');
    let frame = 0;
    const interval = setInterval(() => {
      frame++;
      if (frame === 4 && onMidpoint) {
        onMidpoint();
      }
      if (frame < this.bookFlipFrames.length) {
        this.bookPageFlipPlayer.src = this.bookFlipFrames[frame].src;
      } else {
        clearInterval(interval);
        this.bookPageFlipPlayer.classList.add('hidden');
        if (onDone) onDone();
      }
    }, 75);
  }

  initUI() {
    // Open Book In-Place -> Animate 0 -> 1 -> 2 -> 3 -> 4 -> Reveal Gameplay on Pages
    const openBook = () => {
      if (this.interactiveBook && this.interactiveBook.classList.contains('open')) return;
      this.audio.ensureAudioContext();
      this.audio.playBookOpen();
      this.audio.start();
      this.firstInputHandled = true;

      if (this.bookClickHint) {
        this.bookClickHint.style.display = 'none';
      }

      this.playBookOpenAnimation(() => {
        if (this.interactiveBook) {
          this.interactiveBook.classList.remove('closed');
          this.interactiveBook.classList.add('open');
        }
        if (this.cardBooklet) {
          this.cardBooklet.classList.remove('hidden');
        }
        if (this.touchControls) {
          this.touchControls.classList.remove('hidden');
        }
        this.setCameraView('full');

        // Trigger Alice's entrance hop into the frame onto the book page!
        if (this.currentSceneType === 'saransk' && this.alice && this.alice.triggerEntrance) {
          this.alice.triggerEntrance();
        }

        if (this.shootingStar) {
          this.shootingStar.gameStarted = true;
        }
      });
    };

    this.openBook = openBook;

    // Orientation hint auto-fade
    if (this.orientationHint) {
      const dismissOrientationHint = () => {
        if (!this.orientationHint) return;
        this.orientationHint.style.transition = 'opacity 0.6s ease';
        this.orientationHint.style.opacity = '0';
        setTimeout(() => {
          if (this.orientationHint) this.orientationHint.style.display = 'none';
        }, 650);
      };
      setTimeout(dismissOrientationHint, 8000);
      window.addEventListener('click', dismissOrientationHint, { once: true });
      window.addEventListener('touchstart', dismissOrientationHint, { once: true, passive: true });
    }

    // Start music immediately upon entering the site (before book is opened)
    const tryPlayInitialMusic = () => {
      if (this.audio && !this.audio.isPlaying) {
        this.audio.ensureAudioContext();
        this.audio.start().catch(() => {});
      }
    };

    // 1. Attempt immediately upon site initialization
    tryPlayInitialMusic();

    // 2. Resilient fallback: ensure music begins on the first user interaction anywhere
    const handleFirstGesture = async () => {
      if (this.audio && !this.audio.isPlaying) {
        this.audio.ensureAudioContext();
        await this.audio.start().catch(() => {});
      }
      if (this.audio && this.audio.isPlaying) {
        window.removeEventListener('pointerdown', handleFirstGesture);
        window.removeEventListener('click', handleFirstGesture);
        window.removeEventListener('touchstart', handleFirstGesture);
        window.removeEventListener('keydown', handleFirstGesture);
      }
    };
    window.addEventListener('pointerdown', handleFirstGesture, { passive: true });
    window.addEventListener('click', handleFirstGesture, { passive: true });
    window.addEventListener('touchstart', handleFirstGesture, { passive: true });
    window.addEventListener('keydown', handleFirstGesture, { passive: true });

    // Global catch for shooting star on click/tap anywhere on screen
    window.addEventListener('pointerdown', () => {
      if (this.shootingStar && this.shootingStar.active && !this.shootingStar.wishMade) {
        this.shootingStar.catch();
      }
    }, true);

    if (this.canvas) {
      const handleCanvasTap = (e) => {
        if (this.shootingStar && this.shootingStar.active && !this.shootingStar.wishMade) {
          this.shootingStar.catch();
          return;
        }
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.width / rect.width;
        const scaleY = this.height / rect.height;
        const clickX = (e.clientX - rect.left) * scaleX;
        const clickY = (e.clientY - rect.top) * scaleY;
        this.shootingStar.handleClickOrTap(clickX, clickY, this.cameraX);
      };
      this.canvas.addEventListener('click', handleCanvasTap);
      this.canvas.addEventListener('touchstart', (e) => {
        if (e.touches && e.touches[0]) {
          handleCanvasTap(e.touches[0]);
        }
      }, { passive: true });
    }

    if (this.interactiveBook) {
      this.interactiveBook.addEventListener('click', (e) => {
        if (this.interactiveBook.classList.contains('closed')) {
          openBook();
        }
      });
    }

    if (this.closeGameBtn) {
      this.closeGameBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (this.cardBooklet) {
          this.cardBooklet.classList.add('hidden');
        }
        if (this.touchControls) {
          this.touchControls.classList.add('hidden');
        }
        this.setCameraView('full');
        this.playBookCloseAnimation(() => {
          if (this.interactiveBook) {
            this.interactiveBook.classList.remove('open');
            this.interactiveBook.classList.add('closed');
          }
          if (this.bookClickHint) {
            this.bookClickHint.style.display = '';
          }
        });
      });
    }

    if (window.location.search.includes('open')) {
      if (this.bookClickHint) this.bookClickHint.style.display = 'none';
      if (this.interactiveBook) {
        this.interactiveBook.classList.remove('closed');
        this.interactiveBook.classList.add('open');
      }
      if (this.bookSurfaceImg) {
        this.bookSurfaceImg.src = './assets/book/open/frame_4.png';
      }
      if (this.cardBooklet) {
        this.cardBooklet.classList.remove('hidden');
      }
      if (this.touchControls) {
        this.touchControls.classList.remove('hidden');
      }
      this.setCameraView('full');
      if (this.shootingStar) {
        this.shootingStar.gameStarted = true;
      }
    }

    if (window.location.search.includes('test_cake=1') || window.location.search.includes('scene=cake')) {
      setTimeout(() => {
        this.cakeStage.start();
      }, 250);
    }

    if (window.location.search.includes('test_cosmic=1')) {
      setTimeout(() => {
        this.triggerCosmicFinale(this.alice);
      }, 350);
    }

    if (window.location.search.includes('flip') || window.location.search.includes('flight')) {
      if (this.gamePageContainer) this.gamePageContainer.classList.add('hidden');
      if (this.flightPageContainer) this.flightPageContainer.classList.remove('hidden');
      this.pageFlipped = true;
      this.setCameraView('full');
      if (this.shootingStar) {
        this.shootingStar.gameStarted = true;
      }
      if (this.flightScene) {
        const urlParams = new URLSearchParams(window.location.search);
        const flightVal = urlParams.get('flight');
        const targetVal = urlParams.get('target');
        const target = (flightVal && flightVal !== '1') ? flightVal : (targetVal || 'moscow');
        const quick = window.location.search.includes('quickflight');
        this.flightScene.start(quick, target);
      }
    }

    if (window.location.search.includes('autotest=1')) {
      window.__AUTOTEST_RESULTS__ = { steps: [] };
      setTimeout(() => {
        window.__AUTOTEST_RESULTS__.steps.push('calling openBook');
        openBook();
        setTimeout(() => {
          window.__AUTOTEST_RESULTS__.steps.push('opened: booklet hidden=' + this.cardBooklet.classList.contains('hidden'));
          window.__AUTOTEST_RESULTS__.steps.push('triggering page flip');
          this.triggerPageFlipTransition();
          setTimeout(() => {
            window.__AUTOTEST_RESULTS__.steps.push('flipped: flight hidden=' + this.flightPageContainer.classList.contains('hidden'));
            window.__AUTOTEST_PASSED__ = true;
            document.title = "TEST_PASSED";
          }, 600);
        }, 600);
      }, 300);
    }

    if (window.location.search.includes('test_moscow_to_israel=1')) {
      window.__E2E_STATUS__ = 'STARTING';
      const checkInterval = setInterval(() => {
        // 1. In Moscow, walk Alice to stairs if plane waiting
        if (this.currentSceneType === 'moscow' && this.scene && this.scene.departurePlane) {
          const dp = this.scene.departurePlane;
          if (dp.state === 'waiting') {
            this.input.keys.right = true;
            if (this.alice && this.alice.x < dp.x + 22) {
              this.alice.x += 2.0;
            }
          } else {
            this.input.keys.right = false;
          }
        }
        // 2. Check if landed in Israel
        if (this.currentSceneType === 'israel' && this.scene && this.scene.landingComplete) {
          clearInterval(checkInterval);
          window.__E2E_STATUS__ = 'ISRAEL_LANDED';
          const track = this.audio ? this.audio.getCurrentTrack() : null;
          const trackTitle = track ? track.title : 'None';
          console.log('E2E TEST REACHED ISRAEL! Track:', trackTitle);
          document.title = 'E2E_TEST_PASSED_' + encodeURIComponent(trackTitle);
          
          try {
            const canvas = document.getElementById('game-canvas');
            if (canvas) {
              fetch('/api/save_screenshot', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  filename: 'verify_e2e_israel_landing.png',
                  data: canvas.toDataURL('image/png')
                })
              });
            }
          } catch (e) {
            console.error('Snapshot failed:', e);
          }
        }
      }, 50);
    }

    if (window.location.search.includes('test_g6=1')) {
      window.__G6_STATUS__ = 'STARTING';
      if (this.gamePageContainer) this.gamePageContainer.classList.add('hidden');
      if (this.flightPageContainer) this.flightPageContainer.classList.remove('hidden');
      this.pageFlipped = true;
      this.setCameraView('full');
      if (this.flightScene) {
        this.flightScene.start(false, 'israel');
      }

      let captured1 = false;
      let captured2 = false;
      const g6Interval = setInterval(() => {
        if (!this.flightScene) return;
        const g6 = this.flightScene.g6Jet;
        const flightCanvas = document.getElementById('flight-canvas');

        // Capture 1: G6 entering and flying towards player's plane
        if (!captured1 && g6.active && g6.x <= 360 && g6.x >= 200) {
          captured1 = true;
          if (flightCanvas) {
            fetch('/api/save_screenshot', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                filename: 'g6_flyby_midway.png',
                data: flightCanvas.toDataURL('image/png')
              })
            });
          }
        }

        // Capture 2: G6 close up crossing the player's plane
        if (!captured2 && g6.active && g6.x < 200 && g6.x >= -40) {
          captured2 = true;
          if (flightCanvas) {
            fetch('/api/save_screenshot', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                filename: 'g6_flyby_closeup.png',
                data: flightCanvas.toDataURL('image/png')
              })
            });
          }
        }

        if (captured1 && captured2) {
          clearInterval(g6Interval);
          window.__G6_STATUS__ = 'CAPTURED';
          document.title = 'G6_CAPTURED';
        }
      }, 40);
    }

    if (window.location.search.includes('test_israel_to_barcelona=1')) {
      window.__E2E_STATUS__ = 'STARTING';
      const checkInterval = setInterval(() => {
        // 1. In Israel, walk Alice to stairs if plane waiting
        if (this.currentSceneType === 'israel' && this.scene && this.scene.departurePlane) {
          const dp = this.scene.departurePlane;
          if (dp.state === 'waiting') {
            this.input.keys.right = true;
            if (this.alice && this.alice.x < dp.x + 22) {
              this.alice.x += 2.0;
            }
          } else {
            this.input.keys.right = false;
          }
        }
        // 2. Check if landed in Barcelona
        if (this.currentSceneType === 'barcelona' && this.scene && this.scene.landingComplete) {
          clearInterval(checkInterval);
          window.__E2E_STATUS__ = 'BARCELONA_LANDED';
          const track = this.audio ? this.audio.getCurrentTrack() : null;
          const trackTitle = track ? track.title : 'None';
          console.log('E2E TEST REACHED BARCELONA! Track:', trackTitle);
          document.title = 'E2E_TEST_PASSED_' + encodeURIComponent(trackTitle);
        }
      }, 50);
    }

    if (this.canvas) {
      this.canvas.addEventListener('click', (e) => {
        if (this.scene) {
          if (this.scene.showBirthdayLetter) this.scene.showBirthdayLetter = false;
          if (this.scene.showDepartureLetter) this.scene.showDepartureLetter = false;

          // Calculate click coordinates in game world
          let clickWorldX = null;
          if (e && e.clientX !== undefined) {
            const rect = this.canvas.getBoundingClientRect();
            const scaleX = this.width / rect.width;
            clickWorldX = (e.clientX - rect.left) * scaleX + (this.cameraX || 0);
          }

          // Determine target landmark: either activeLandmark, or landmark near click / Alice
          let targetLm = this.scene.activeLandmark;
          if (!targetLm && this.scene.landmarks) {
            for (const lm of this.scene.landmarks) {
              const nearAlice = Math.abs(this.alice.x - lm.x) < 85;
              const nearClick = clickWorldX !== null && Math.abs(clickWorldX - lm.x) < 95;
              if (nearAlice || nearClick) {
                targetLm = lm;
                break;
              }
            }
          }

          if (targetLm) {
            // Toggle inspection
            if (this.scene.inspectedLandmark && this.scene.inspectedLandmark.id === targetLm.id) {
              this.scene.inspectedLandmark = null;
            } else {
              this.scene.inspectedLandmark = targetLm;
            }

            // Trigger snapshot for tsum or rgsu
            if (targetLm.id === 'tsum' || targetLm.id === 'rgsu') {
              const id = targetLm.id;
              if (this.scene.onLandmarkSnapshot && !this.scene.snapshotsTaken[id]) {
                this.scene.snapshotsTaken[id] = true;
                this.scene.onLandmarkSnapshot(targetLm);
              }
            }
          } else {
            if (this.scene.inspectedLandmark) this.scene.inspectedLandmark = null;
          }

          if (this.scene.nearbyCat && this.alice) {
            const cat = this.scene.nearbyCat;
            const wasFirstPet = !cat.isPetted;
            cat.pet(this.alice);
            if (this.alice.petCat) this.alice.petCat(cat);
            if (wasFirstPet && this.scene.cats) {
              const pettedCount = this.scene.cats.filter(c => c.isPetted).length;
              if (pettedCount === this.scene.cats.length && !this.scene.catsCelebrated) {
                this.scene.catsCelebrated = true;
                this.scene.catsToastTimer = 3.6;
                if (this.audio && this.audio.playChime) this.audio.playChime();
              }
            }
          }
        }
      });
    }

    // Wire Winamp Player controls
    const playBtn = document.getElementById('audio-play');
    const prevBtn = document.getElementById('audio-prev');
    const nextBtn = document.getElementById('audio-next');
    const volInput = document.getElementById('audio-volume');
    const winampToggle = document.getElementById('winamp-toggle');
    const winampBox = document.getElementById('winamp-player');

    if (playBtn) {
      playBtn.addEventListener('click', () => {
        this.audio.ensureAudioContext();
        if (this.audio.isPlaying) {
          this.audio.stop();
          playBtn.textContent = '▶';
        } else {
          this.audio.start();
          playBtn.textContent = '❚❚';
        }
      });
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        this.audio.prev();
        this.updateTrackDisplay();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        this.audio.next();
        this.updateTrackDisplay();
      });
    }

    if (volInput) {
      volInput.addEventListener('input', (e) => {
        this.audio.setVolume(parseFloat(e.target.value));
      });
    }

    if (winampToggle && winampBox) {
      winampToggle.addEventListener('click', () => {
        winampBox.classList.toggle('minimized');
      });
    }
  }

  updateTrackDisplay() {
    const trackEl = document.getElementById('track-name');
    if (trackEl && this.audio) {
      const track = this.audio.getCurrentTrack();
      trackEl.textContent = track ? track.title : 'Nostalgia Music Box';
    }
  }

  triggerPageFlipTransition(targetScene = 'moscow') {
    if (this.pageFlipped) return;
    this.pageFlipped = true;
    this.pendingTargetScene = targetScene;
    this.audio.startFlightAmbient();
    if (targetScene === 'barcelona') {
      this.audio.crossfadeTo(4, 1.8); // Justin Hurwitz - Señor Avocado!
    } else if (targetScene === 'israel') {
      this.audio.crossfadeTo(2, 1.8); // Justin Hurwitz - Manny And Nellie's Theme!
    } else {
      this.audio.crossfadeTo(1, 1.5); // Justin Hurwitz - Coke Room!
    }
    this.setCameraView('full');

    const urlParams = new URLSearchParams(window.location.search);
    const quickflight = urlParams.get('quickflight') === '1';

    // Play authentic Humble Pixel page flip animation
    this.playPageFlipAnimation(
      () => {
        // At midpoint of page arc: switch view to interactive flight sky on Page 2
        if (this.gamePageContainer) this.gamePageContainer.classList.add('hidden');
        if (this.flightPageContainer) this.flightPageContainer.classList.remove('hidden');
        if (this.flightScene) {
          this.flightScene.start(quickflight, this.pendingTargetScene || 'moscow');
        }
      },
      () => {
        // Flip finished, interactive flight continues on Page 2
      }
    );

    // Celebration sparkles
    const colors = ['#ff7ebb', '#ffd32a', '#a865c9', '#55efc4', '#ffffff', '#ff4757'];
    for (let i = 0; i < 90; i++) {
      this.confetti.push({
        x: (this.scene ? this.scene.worldWidth - 280 : 2040) + (Math.random() - 0.5) * 80,
        y: (this.scene ? this.scene.groundY : 220) - 55,
        vx: (Math.random() - 0.5) * 6.0,
        vy: -Math.random() * 5.0 - 2.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() > 0.5 ? 3 : 2,
        gravity: 0.12,
        life: 180
      });
    }
  }

  completeFlightAndLandInMoscow() {
    if (!this.pageFlipped) return;
    this.pageFlipped = false;
    this.audio.stopFlightAmbient();
    this.audio.crossfadeTo(1, 1.5);
    this.setCameraView('full');

    // Play authentic Humble Pixel page flip animation back to Moscow!
    this.playPageFlipAnimation(
      () => {
        // At midpoint: switch view to game canvas with Moscow Scene
        this.currentSceneType = 'moscow';
        this.scene = new MoscowScene(this.config);
        this.scene.audio = this.audio;
        this.alice.x = -140;
        this.alice.y = this.scene.aliceGroundY || 224;
        this.cameraX = 0;
        this.scene.onTakeoffComplete = () => {
          this.triggerPageFlipTransition('israel');
        };
        this.scene.onLandmarkSnapshot = (landmark) => {
          this.triggerPolaroidSnapshot(landmark);
        };

        if (this.flightPageContainer) this.flightPageContainer.classList.add('hidden');
        if (this.gamePageContainer) this.gamePageContainer.classList.remove('hidden');
        this.setCameraView('left');
      },
      () => {
        // Landing begins on Red Square!
      }
    );
  }

  triggerPolaroidSnapshot(landmark) {
    if (!landmark) return;
    
    let photoSrc = './assets/polaroids/tsum_pizza.jpg';
    let targetLeftPercent = 0.73;
    let targetLeftVw = '73vw';
    let targetTopPercent = 0.02;
    let targetTopVh = '2vh';
    let targetRotate = 4.5;
    let tapeRotate = 2.5;

    if (landmark.id === 'rgsu') {
      photoSrc = './assets/polaroids/rgsu_classroom.jpg';
      targetLeftPercent = 0.14;
      targetLeftVw = '14vw';
      targetTopPercent = 0.02;
      targetTopVh = '2vh';
      targetRotate = -4.2;
      tapeRotate = -2.0;
    }

    // 1. Play camera shutter sound
    if (this.audio && this.audio.playCameraShutter) {
      this.audio.playCameraShutter();
    }

    // 2. Camera flash overlay
    const flashEl = document.getElementById('camera-flash-overlay');
    if (flashEl) {
      flashEl.classList.add('flash');
      setTimeout(() => {
        flashEl.classList.remove('flash');
      }, 70);
    }

    // 3. Create the flying polaroid element
    const container = document.getElementById('polaroid-snapshot-container');
    if (!container) return;

    const card = document.createElement('div');
    card.className = 'flying-polaroid';
    card.innerHTML = `
      <div class="washi-tape"></div>
      <div class="polaroid-inner-photo">
        <img src="${photoSrc}" alt="memory" />
      </div>
    `;

    // Center of viewport
    const startW = Math.min(300, Math.floor(window.innerWidth * 0.40));
    const startLeft = Math.floor((window.innerWidth - startW) / 2);
    const startTop = Math.floor((window.innerHeight - startW * 1.05) / 2);

    card.style.left = `${startLeft}px`;
    card.style.top = `${startTop}px`;
    card.style.width = `${startW}px`;
    card.style.transform = 'scale(0.2) rotate(-8deg)';
    card.style.opacity = '0';
    card.style.zIndex = '99999';

    container.appendChild(card);

    // Pop into center
    requestAnimationFrame(() => {
      card.style.transition = 'transform 0.45s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.35s ease';
      card.style.transform = 'scale(1.0) rotate(-1.5deg)';
      card.style.opacity = '1';
    });

    // 4. After 2.0 seconds of viewing in center, fly and pin to background wall!
    setTimeout(() => {
      const targetLeft = Math.floor(window.innerWidth * targetLeftPercent);
      const targetTop = Math.floor(window.innerHeight * targetTopPercent);
      const targetW = Math.min(220, Math.floor(window.innerWidth * 0.22));

      card.style.transition = 'all 1.15s cubic-bezier(0.25, 1, 0.5, 1)';
      card.style.left = `${targetLeft}px`;
      card.style.top = `${targetTop}px`;
      card.style.width = `${targetW}px`;
      card.style.transform = `scale(0.9) rotate(${targetRotate}deg)`;

      // When flight finishes:
      setTimeout(() => {
        const scrapbook = document.querySelector('.scrapbook-container');
        if (scrapbook) {
          const wallCard = document.createElement('div');
          wallCard.className = 'scrapbook-card';
          wallCard.style.position = 'absolute';
          wallCard.style.left = targetLeftVw;
          wallCard.style.top = targetTopVh;
          wallCard.style.width = `${targetW}px`;
          wallCard.style.transform = `rotate(${targetRotate}deg)`;
          wallCard.style.zIndex = '38';
          wallCard.innerHTML = `
            <div class="washi-tape" style="transform: translateX(-50%) rotate(${tapeRotate}deg);"></div>
            <div class="polaroid-photo-wrapper">
              <img src="${photoSrc}" class="photo-real" alt="pin" />
            </div>
          `;
          scrapbook.appendChild(wallCard);
        }

        if (card.parentNode) {
          card.parentNode.removeChild(card);
        }

        if (this.audio && this.audio.playChime) {
          this.audio.playChime();
        }
      }, 1200);
    }, 2000);
  }

  completeFlightAndLandInIsrael() {
    if (!this.pageFlipped) return;
    this.pageFlipped = false;
    this.audio.stopFlightAmbient();
    this.audio.crossfadeTo(2, 1.8); // Justin Hurwitz - Manny And Nellie's Theme!
    this.setCameraView('full');

    // Play authentic Humble Pixel page flip animation into Israel!
    this.playPageFlipAnimation(
      () => {
        this.currentSceneType = 'israel';
        this.scene = new IsraelScene(this.config);
        this.scene.audio = this.audio;
        this.alice.x = -140;
        this.alice.y = this.scene.aliceGroundY || 224;
        this.cameraX = 0;

        this.scene.onTakeoffComplete = () => {
          this.triggerPageFlipTransition('barcelona');
        };

        if (this.flightPageContainer) this.flightPageContainer.classList.add('hidden');
        if (this.gamePageContainer) this.gamePageContainer.classList.remove('hidden');
        this.setCameraView('left');
      },
      () => {
        // Landing begins on Israeli Mediterranean tarmac!
      }
    );
  }

  completeFlightAndLandInBarcelona() {
    if (!this.pageFlipped) return;
    this.pageFlipped = false;
    this.audio.stopFlightAmbient();
    this.audio.crossfadeTo(4, 1.8); // Justin Hurwitz - Señor Avocado!
    this.setCameraView('full');

    // Play authentic Humble Pixel page flip animation into Barcelona!
    this.playPageFlipAnimation(
      () => {
        this.currentSceneType = 'barcelona';
        this.scene = new BarcelonaScene(this.config);
        this.scene.audio = this.audio;
        this.alice.x = -140;
        this.alice.y = this.scene.aliceGroundY || 224;
        this.cameraX = 0;
        this.scene.onCosmicLeap = (alice) => {
          this.triggerCosmicFinale(alice);
        };

        if (this.flightPageContainer) this.flightPageContainer.classList.add('hidden');
        if (this.gamePageContainer) this.gamePageContainer.classList.remove('hidden');
        this.setCameraView('left');
      },
      () => {
        // Landing begins on Barcelona El Prat tarmac!
      }
    );
  }

  triggerCosmicFinale(alice) {
    this.aliceCosmicHidden = true;
    if (this.touchControls) {
      this.touchControls.classList.add('hidden');
    }
    const rect = this.canvas.getBoundingClientRect();
    const cw = rect.width > 50 ? rect.width : window.innerWidth * 0.55;
    const ch = rect.height > 50 ? rect.height : window.innerHeight * 0.55;
    const cl = rect.width > 50 ? rect.left : (window.innerWidth - cw) / 2;
    const ct = rect.height > 50 ? rect.top : (window.innerHeight - ch) / 2;

    const aliceScreenX = cl + (alice.x - this.cameraX) * (cw / this.width);
    const aliceScreenY = ct + (alice.y) * (ch / this.height);
    const scale = Math.max(1.2, (cw / this.width) * 1.35);

    this.cosmicOverlay.start({ x: aliceScreenX, y: aliceScreenY, scale }, alice);
    this.cosmicOverlay.onDiveComplete = () => {
      this.cakeStage.start();
    };
  }

  update(delta) {
    // Start music on first movement
    if (!this.firstInputHandled && (this.input.isLeft || this.input.isRight || this.input.isJump)) {
      this.firstInputHandled = true;
      this.audio.start();
    }

    // If page is flipped to night flight, update flight scene & stay in full book spread view
    if (this.pageFlipped) {
      this.setCameraView('full');
      if (this.flightScene) {
        this.flightScene.update(delta, this.input);
      }
      return;
    }

    if (this.currentSceneType === 'moscow' || this.currentSceneType === 'israel' || this.currentSceneType === 'barcelona') {
      const plane = this.scene.airplane;
      const dp = this.scene.departurePlane;

      if (this.scene.landingComplete && !this.aliceCosmicHidden) {
        if (!dp || dp.state === 'waiting' || dp.state === 'boarding') {
          if (!this.scene.cosmicLeaping) {
            this.alice.update(delta, this.input, this.scene.aliceGroundY || this.scene.groundY || 224, this.scene.worldWidth);
            if (this.alice.x < 25) this.alice.x = 25;
            if (this.alice.x > this.scene.worldWidth - 30) this.alice.x = this.scene.worldWidth - 30;
          }
        }
      }

      this.scene.update(delta, this.alice, this.input);

      // Camera tracking
      let focusX = this.alice.x;
      if (!this.scene.landingComplete && plane.state !== 'complete') {
        focusX = Math.max(120, plane.x + 40);
      } else if (dp && (dp.state === 'taxi' || dp.state === 'takeoff')) {
        focusX = Math.min(this.scene.worldWidth - 100, dp.x + 80);
      }
      const targetCameraX = focusX - this.width * 0.4;
      const maxCameraX = this.scene.worldWidth - this.width;
      this.cameraX += (targetCameraX - this.cameraX) * 0.08;
      this.cameraX = Math.max(0, Math.min(maxCameraX, this.cameraX));

      // Dynamic camera zoom on book pages
      if (this.alice.x >= 2400) {
        this.setCameraView('full');
      } else if (this.alice.x >= 1200) {
        this.setCameraView('right');
      } else {
        this.setCameraView('left');
      }

    } else {
      const airplaneState = this.scene.airplane.state;

      // Update Alice (only when walking freely in parked state)
      if (airplaneState === 'parked' && !this.aliceCosmicHidden) {
        this.alice.update(delta, this.input, this.scene.aliceGroundY || this.scene.groundY || 224, this.scene.worldWidth);
        if (this.alice.x < 15) this.alice.x = 15;
        if (this.alice.x > this.scene.worldWidth - 40) this.alice.x = this.scene.worldWidth - 40;
      }

      this.scene.update(delta, this.alice, this.input);

      let focusX = this.alice.x;
      if (airplaneState === 'boarded' || airplaneState === 'taxi' || airplaneState === 'takeoff') {
        focusX = Math.min(2080, this.scene.airplane.x + 80);
      }
      const targetCameraX = focusX - this.width * 0.4;
      const maxCameraX = Math.min(1720, this.scene.worldWidth - this.width);
      this.cameraX += (targetCameraX - this.cameraX) * 0.08;
      this.cameraX = Math.max(0, Math.min(maxCameraX, this.cameraX));

      // Dynamic camera zoom on book pages
      if (airplaneState !== 'parked' || this.alice.x >= 1840) {
        this.setCameraView('full');
      } else if (this.alice.x >= 980) {
        this.setCameraView('right');
      } else {
        this.setCameraView('left');
      }
    }

    // Update confetti
    for (let i = this.confetti.length - 1; i >= 0; i--) {
      const c = this.confetti[i];
      c.x += c.vx;
      c.y += c.vy;
      c.vy += c.gravity;
      c.vx *= 0.98;
      c.life--;
      if (c.life <= 0 || c.y > this.height + 20) {
        this.confetti.splice(i, 1);
      }
    }

    // 6. Romantic Shooting Star («Загадай желание»)
    if (this.shootingStar) {
      this.shootingStar.update(delta, this.currentSceneType, this.cameraX, this.input, this.width);
    }
  }

  render() {
    if (this.pageFlipped) {
      if (this.flightScene) {
        this.flightScene.render();
      }
      return;
    }

    this.ctx.clearRect(0, 0, this.width, this.height);

    // 1. LAYER 1: BACKGROUND (Deep sky, stars, clouds, distant skyline, back trees)
    if (this.scene.drawBackground) {
      this.scene.drawBackground(this.ctx, this.cameraX, this.width, this.height);
    }

    // 2. LAYER 2: MIDGROUND (Promenade base, cobblestones, real architecture landmarks, trees, streetlamps, airplane)
    if (this.scene.drawMidground) {
      this.scene.drawMidground(this.ctx, this.cameraX, this.width, this.height);
    } else {
      this.scene.draw(this.ctx, this.cameraX, this.width, this.height, this.alice.x, this.alice.y);
    }

    // 3. Draw Pixel Confetti (midground level)
    this.confetti.forEach(c => {
      const sx = c.x - this.cameraX;
      if (sx >= -10 && sx <= this.width + 10) {
        this.ctx.fillStyle = c.color;
        this.ctx.fillRect(Math.round(sx), Math.round(c.y), c.size, c.size);
      }
    });

    // 4. ALICE (Midground: walks on the walkway!)
    let showAlice = false;
    if (this.currentSceneType === 'moscow' || this.currentSceneType === 'israel' || this.currentSceneType === 'barcelona') {
      const dp = this.scene.departurePlane;
      const isBoardedOrGone = dp && (dp.state === 'boarded' || dp.state === 'taxi' || dp.state === 'takeoff');
      showAlice = (this.scene.landingComplete || this.scene.airplane.state === 'disembarking') && !isBoardedOrGone;
    } else {
      showAlice = this.scene.airplane.state === 'parked' || this.scene.airplane.state === 'boarding';
    }

    if (showAlice && !this.aliceCosmicHidden) {
      this.ctx.save();
      this.ctx.translate(-Math.round(this.cameraX), 0);
      this.alice.draw(this.ctx);
      this.ctx.restore();
    }

    // 5. LAYER 3: FOREGROUND (Overhanging canopy foliage with 1.15x parallax, foreground streetlamps with 1.25x parallax, fireflies, UI)
    if (this.scene.drawForeground) {
      this.scene.drawForeground(this.ctx, this.cameraX, this.width, this.height, this.alice.x, this.alice.y);
    }

    // 6. Shooting star & Wish banner in the sky
    if (this.shootingStar) {
      this.shootingStar.draw(this.ctx, this.cameraX, this.width);
    }
  }

  gameLoop(currentTime) {
    const delta = Math.min((currentTime - this.lastTime) / 1000, 0.1);
    this.lastTime = currentTime;

    this.update(delta);
    this.render();

    // Update and draw zero-g cosmic overlay and grand cake stage
    if (this.cosmicOverlay && this.cosmicOverlay.active) {
      this.cosmicOverlay.update(delta);
      this.cosmicOverlay.draw();
    }
    if (this.cakeStage && this.cakeStage.active) {
      this.cakeStage.update(delta);
      this.cakeStage.draw();
    }

    requestAnimationFrame((t) => this.gameLoop(t));
  }
}
