import * as THREE from 'three';
import * as TWEEN from '@tweenjs/tween.js';
import confetti from 'canvas-confetti';

/**
 * 3D Birthday Cake with Animated Candles and Blowout Finale
 */
export class Cake {
  constructor(scene, posX = 2.0, posY = 0.5) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.group.position.set(posX, posY, 0);
    this.scene.add(this.group);

    this.candles = [];
    this.flames = [];
    this.isBlown = false;
    this.flameTime = 0;

    this.buildCake();
  }

  buildCake() {
    // Materials
    const cakePlateMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2, metalness: 0.1 });
    const spongeMat = new THREE.MeshLambertMaterial({ color: 0xffd8ec }); // Pink strawberry cream
    const frostingMat = new THREE.MeshLambertMaterial({ color: 0xffffff }); // Whipped white cream
    const dripMat = new THREE.MeshLambertMaterial({ color: 0xff69b4 }); // Raspberry glaze drip
    const cherryMat = new THREE.MeshStandardMaterial({ color: 0xc0392b, roughness: 0.3 });
    const candleWaxMat = new THREE.MeshLambertMaterial({ color: 0xa29bfe }); // Lavender wax

    // 1. Silver/White Serving Plate
    const plateGeo = new THREE.CylinderGeometry(1.5, 1.2, 0.08, 20);
    const plate = new THREE.Mesh(plateGeo, cakePlateMat);
    plate.position.y = 0.04;
    this.group.add(plate);

    // 2. Bottom Tier
    const tier1Geo = new THREE.CylinderGeometry(1.2, 1.2, 0.6, 20);
    const tier1 = new THREE.Mesh(tier1Geo, spongeMat);
    tier1.position.y = 0.38;
    this.group.add(tier1);

    // Cream dollops around bottom tier
    for (let i = 0; i < 10; i++) {
      const angle = (i / 10) * Math.PI * 2;
      const dollopGeo = new THREE.SphereGeometry(0.1, 8, 8);
      const dollop = new THREE.Mesh(dollopGeo, frostingMat);
      dollop.position.set(Math.cos(angle) * 1.15, 0.68, Math.sin(angle) * 1.15);
      this.group.add(dollop);
    }

    // 3. Top Tier
    const tier2Geo = new THREE.CylinderGeometry(0.8, 0.8, 0.5, 18);
    const tier2 = new THREE.Mesh(tier2Geo, dripMat);
    tier2.position.y = 0.93;
    this.group.add(tier2);

    // Cherries on top
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2;
      const cherryGeo = new THREE.SphereGeometry(0.08, 8, 8);
      const cherry = new THREE.Mesh(cherryGeo, cherryMat);
      cherry.position.set(Math.cos(angle) * 0.55, 1.22, Math.sin(angle) * 0.55);
      this.group.add(cherry);
    }

    // 4. Birthday Candles & Flames
    const candlePositions = [
      { x: 0, z: 0 },
      { x: 0.3, z: 0.2 },
      { x: -0.3, z: 0.2 }
    ];

    candlePositions.forEach((pos) => {
      // Candle stick
      const candleGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.45, 8);
      const candle = new THREE.Mesh(candleGeo, candleWaxMat);
      candle.position.set(pos.x, 1.4, pos.z);
      this.group.add(candle);
      this.candles.push(candle);

      // Flame (Tear-drop flame)
      const flameGeo = new THREE.ConeGeometry(0.06, 0.16, 8);
      const flameMat = new THREE.MeshBasicMaterial({ color: 0xffd700 });
      const flame = new THREE.Mesh(flameGeo, flameMat);
      flame.position.set(pos.x, 1.68, pos.z);
      this.group.add(flame);
      this.flames.push(flame);
    });

    // Warm Point Light for Candle Glow
    this.candleLight = new THREE.PointLight(0xffaa44, 1.8, 4.5);
    this.candleLight.position.set(0, 1.9, 0);
    this.group.add(this.candleLight);

    // Gentle floating greeting label above cake
    this.createCakeLabel();
  }

  createCakeLabel() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ff69b4';
    ctx.font = 'bold 24px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('✨ ЗАДУЙ СВЕЧИ ✨', 128, 32);

    const texture = new THREE.CanvasTexture(canvas);
    const labelGeo = new THREE.PlaneGeometry(1.6, 0.4);
    const labelMat = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
    this.label = new THREE.Mesh(labelGeo, labelMat);
    this.label.position.set(0, 2.3, 0);
    this.group.add(this.label);

    new TWEEN.Tween(this.label.position)
      .to({ y: 2.45 }, 1200)
      .yoyo(true)
      .repeat(Infinity)
      .easing(TWEEN.Easing.Sinusoidal.InOut)
      .start();
  }

  update(delta) {
    if (this.isBlown) return;

    this.flameTime += delta * 15;

    // Flickering candle flames
    this.flames.forEach((flame, index) => {
      const flicker = Math.sin(this.flameTime + index * 2.1) * 0.15 + 1.0;
      flame.scale.set(flicker, flicker * 1.1, flicker);
      flame.rotation.z = Math.sin(this.flameTime * 0.8 + index) * 0.12;
    });

    if (this.candleLight) {
      this.candleLight.intensity = 1.6 + Math.sin(this.flameTime * 2.0) * 0.35;
    }
  }

  /**
   * Blow out candles sequence
   */
  blowCandles(onComplete) {
    if (this.isBlown) return;
    this.isBlown = true;

    // Extinguish flames
    this.flames.forEach((flame) => {
      new TWEEN.Tween(flame.scale)
        .to({ x: 0.01, y: 0.01, z: 0.01 }, 300)
        .easing(TWEEN.Easing.Quadratic.Out)
        .onComplete(() => {
          flame.visible = false;
        })
        .start();
    });

    // Dim candle light
    new TWEEN.Tween(this.candleLight)
      .to({ intensity: 0 }, 400)
      .start();

    // Hide label
    if (this.label) this.label.visible = false;

    // Launch celebratory confetti burst
    this.triggerCelebrationConfetti();

    if (onComplete) {
      setTimeout(() => {
        onComplete();
      }, 700);
    }
  }

  triggerCelebrationConfetti() {
    // Pastel heart & star confetti explosion
    const count = 200;
    const defaults = {
      origin: { y: 0.6 }
    };

    function fire(particleRatio, opts) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
        colors: ['#ff9ee2', '#ff69b4', '#fed330', '#a55eea', '#ffffff', '#ffd700']
      });
    }

    fire(0.25, {
      spread: 26,
      startVelocity: 55,
    });
    fire(0.2, {
      spread: 60,
    });
    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8
    });
    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2
    });
    fire(0.1, {
      spread: 120,
      startVelocity: 45,
    });
  }

  show() {
    this.group.visible = true;
  }

  hide() {
    this.group.visible = false;
  }
}
