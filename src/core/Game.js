import * as THREE from 'three';
import * as TWEEN from '@tweenjs/tween.js';
import { MEMORIES_CONFIG } from '../config/memories.js';
import { InputManager } from './Input.js';
import { AudioPlayer } from './AudioPlayer.js';
import { RetroUI } from '../ui/RetroUI.js';
import { Alice } from '../entities/Alice.js';
import { Book } from '../entities/Book.js';
import { Cake } from '../entities/Cake.js';
import { ParticleManager } from '../entities/Particles.js';
import { DeskEnvironment } from '../rendering/DeskEnvironment.js';

export const GAME_STATES = {
  INTRO: 'INTRO',
  OPENING: 'OPENING',
  PLAYING: 'PLAYING',
  PAGE_FLIP: 'PAGE_FLIP',
  FINALE: 'FINALE'
};

export class Game {
  constructor() {
    this.canvas = document.getElementById('webgl-canvas');
    this.state = GAME_STATES.INTRO;

    // Config & Managers
    this.config = MEMORIES_CONFIG;
    this.currentChapterIndex = 0;
    this.input = new InputManager();
    this.audio = new AudioPlayer(this.config.playlist);
    this.ui = new RetroUI(this.config);

    // Three.js Core
    this.clock = new THREE.Clock();
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x15121b);
    this.scene.fog = new THREE.FogExp2(0x15121b, 0.045);

    this.initCamera();
    this.initRenderer();
    this.initWorld();
    this.initInteractions();

    // Resize listener
    window.addEventListener('resize', () => this.onResize());

    // Start loop
    this.animate();
  }

  initCamera() {
    const aspect = window.innerWidth / window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 100);
    // Initial isometric perspective looking at the closed greeting card
    this.camera.position.set(2.5, 6.0, 7.5);
    this.camera.lookAt(1.5, 0.2, 0);
  }

  initRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
  }

  initWorld() {
    // 1. Desk environment & lights
    this.desk = new DeskEnvironment(this.scene);

    // 2. 3D Pop-up Book / Greeting Card
    this.book = new Book(this.scene);

    // 3. Particles (Glitter & Ambient Stars)
    this.particles = new ParticleManager(this.scene);

    // 4. Alice Character
    this.alice = new Alice(this.scene);
    this.alice.group.visible = false; // Hidden until card opens
    this.alice.setPosition(-3.8, 0.2, 0.4);

    // 5. Birthday Cake (Instantiated on last chapter)
    this.cake = new Cake(this.scene, 2.5, 0.15);
    this.cake.hide();
  }

  initInteractions() {
    // Raycaster for clicking 3D card on desk
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    const triggerOpen = () => {
      if (this.state === GAME_STATES.INTRO) {
        this.startOpenSequence();
      }
    };

    this.ui.setOpenCardCallback(triggerOpen);

    window.addEventListener('pointerdown', (e) => {
      if (this.state === GAME_STATES.INTRO) {
        this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
        this.raycaster.setFromCamera(this.mouse, this.camera);

        const intersects = this.raycaster.intersectObjects(this.book.group.children, true);
        if (intersects.length > 0) {
          triggerOpen();
        }
      } else if (this.state === GAME_STATES.FINALE) {
        // Tap/click to blow candles if close to cake
        if (Math.abs(this.alice.position.x - this.cake.group.position.x) < 2.0 && !this.cake.isBlown) {
          this.blowCandlesSequence();
        }
      }
    });
  }

  startOpenSequence() {
    this.state = GAME_STATES.OPENING;
    this.ui.hideIntroPrompt();
    this.audio.startMusic();

    // 1. Open the card cover
    this.book.openCard(() => {
      // 2. Camera glides into 2.5D side-scroller position
      this.transitionCameraToPlaying(() => {
        // 3. Alice appears and starts first chapter
        this.alice.group.visible = true;
        this.alice.setPosition(-3.8, 0.2, 0.4);
        this.particles.emitSparkle(this.alice.position.x, this.alice.position.y + 0.5, 0.4, 15);
        this.audio.playSparkle();

        this.loadCurrentChapter();
        this.state = GAME_STATES.PLAYING;
      });
    });
  }

  transitionCameraToPlaying(onComplete) {
    new TWEEN.Tween(this.camera.position)
      .to({ x: 0, y: 2.2, z: 6.8 }, 1600)
      .easing(TWEEN.Easing.Cubic.InOut)
      .start();

    const lookTarget = { x: 1.5, y: 0.2, z: 0 };
    new TWEEN.Tween(lookTarget)
      .to({ x: 0, y: 1.2, z: 0 }, 1600)
      .easing(TWEEN.Easing.Cubic.InOut)
      .onUpdate(() => {
        this.camera.lookAt(lookTarget.x, lookTarget.y, lookTarget.z);
      })
      .onComplete(() => {
        if (onComplete) onComplete();
      })
      .start();
  }

  loadCurrentChapter() {
    const chapter = this.config.chapters[this.currentChapterIndex];
    this.book.loadChapter(chapter);
    this.ui.updateChapter(chapter);

    if (chapter.isFinale) {
      this.cake.show();
      this.cake.group.position.x = 2.2;
    } else {
      this.cake.hide();
    }
  }

  goToNextChapter() {
    if (this.currentChapterIndex >= this.config.chapters.length - 1) return;

    this.state = GAME_STATES.PAGE_FLIP;
    this.audio.playPageFlip();

    // 3D page flip animation
    this.book.flipPage(
      () => {
        // Midpoint: swap chapter data & reset Alice to left side
        this.currentChapterIndex++;
        this.loadCurrentChapter();
        this.alice.setPosition(-3.8, 0.2, 0.4);
      },
      () => {
        // Completed page flip
        this.state = GAME_STATES.PLAYING;
      }
    );
  }

  blowCandlesSequence() {
    this.audio.playCandleBlow();
    this.cake.blowCandles(() => {
      // Show finale heartfelt letter
      setTimeout(() => {
        this.ui.showFinaleLetter(this.config.finaleLetter);
      }, 500);
    });
  }

  update(delta) {
    TWEEN.update();

    if (this.state === GAME_STATES.PLAYING || this.state === GAME_STATES.FINALE) {
      // Update Alice physics
      this.alice.update(delta, this.input, 0.2);

      // Boundaries for 2.5D page spread
      const minX = -4.2;
      const maxX = 4.2;

      if (this.alice.position.x < minX) {
        this.alice.position.x = minX;
      }

      // Check reaching right edge -> Flip to next page!
      if (this.alice.position.x > maxX) {
        const isLastChapter = this.currentChapterIndex >= this.config.chapters.length - 1;
        if (!isLastChapter) {
          this.goToNextChapter();
        } else {
          this.alice.position.x = maxX;
        }
      }

      // Check proximity to cake on final chapter
      const curChapter = this.config.chapters[this.currentChapterIndex];
      if (curChapter && curChapter.isFinale) {
        this.cake.update(delta);
        const distToCake = Math.abs(this.alice.position.x - this.cake.group.position.x);
        
        if (distToCake < 1.4 && !this.cake.isBlown) {
          if (this.input.consumeAction() || this.input.isJump) {
            this.blowCandlesSequence();
          }
        }
      }

      // Emit soft sparkles when Alice is moving
      if (this.alice.state === 'run' && Math.random() < 0.2) {
        this.particles.emitSparkle(this.alice.position.x, this.alice.position.y + 0.1, 0.4, 1);
      }
    }

    // Update particles
    this.particles.update(delta);
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    const delta = Math.min(this.clock.getDelta(), 0.1);
    this.update(delta);
    this.renderer.render(this.scene, this.camera);
  }

  onResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }
}
