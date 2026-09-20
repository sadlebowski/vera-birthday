import * as THREE from 'three';
import * as TWEEN from '@tweenjs/tween.js';

/**
 * 3D Pop-Up Greeting Card & Diary Pages
 * Handles card opening, pop-up 3D decor, polaroids, and 3D page flipping.
 */
export class Book {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.scene.add(this.group);

    this.isOpen = false;
    this.currentChapterIndex = 0;
    this.photoMeshes = [];

    this.buildBaseBook();
  }

  buildBaseBook() {
    // Materials
    const coverMat = new THREE.MeshLambertMaterial({ color: 0x3d1c33 }); // Vintage deep wine/burgundy velvet
    const spineMat = new THREE.MeshLambertMaterial({ color: 0x24111f });
    const paperMat = new THREE.MeshLambertMaterial({ color: 0xfaf4e8 }); // Ivory parchment paper
    const goldMat = new THREE.MeshStandardMaterial({ color: 0xf1c40f, roughness: 0.3, metalness: 0.6 });
    const ribbonMat = new THREE.MeshLambertMaterial({ color: 0xff69b4 }); // Pink ribbon

    // 1. Back Cover (Stationary base on desk)
    const backCoverGeo = new THREE.BoxGeometry(10.5, 0.2, 7.2);
    this.backCover = new THREE.Mesh(backCoverGeo, coverMat);
    this.backCover.position.set(0, -0.1, 0);
    this.group.add(this.backCover);

    // Spine
    const spineGeo = new THREE.CylinderGeometry(0.3, 0.3, 7.2, 12, 1, false, 0, Math.PI);
    this.spine = new THREE.Mesh(spineGeo, spineMat);
    this.spine.rotation.z = Math.PI * 0.5;
    this.spine.position.set(0, -0.05, 0);
    this.group.add(this.spine);

    // 2. Front Cover (Rotates around spine on open)
    this.frontCoverPivot = new THREE.Group();
    this.frontCoverPivot.position.set(0, 0.1, 0); // At spine
    this.group.add(this.frontCoverPivot);

    const frontCoverGeo = new THREE.BoxGeometry(5.2, 0.15, 7.2);
    this.frontCoverMesh = new THREE.Mesh(frontCoverGeo, coverMat);
    this.frontCoverMesh.position.set(2.6, 0, 0);
    this.frontCoverPivot.add(this.frontCoverMesh);

    // Front Cover Title Plaque & Ribbon
    const plaqueGeo = new THREE.BoxGeometry(3.2, 0.04, 2.2);
    const plaqueMat = new THREE.MeshLambertMaterial({ color: 0xfdf7ed });
    const plaque = new THREE.Mesh(plaqueGeo, plaqueMat);
    plaque.position.set(2.6, 0.1, 0);
    this.frontCoverPivot.add(plaque);

    // Wax Seal / Heart Button
    const sealGeo = new THREE.CylinderGeometry(0.45, 0.45, 0.1, 16);
    this.waxSeal = new THREE.Mesh(sealGeo, ribbonMat);
    this.waxSeal.position.set(5.1, 0.1, 0);
    this.frontCoverPivot.add(this.waxSeal);

    // 3. Inner Open Pages Spread (Left page & Right page)
    this.pagesGroup = new THREE.Group();
    this.pagesGroup.position.set(0, 0.05, 0);
    this.group.add(this.pagesGroup);

    const pageGeo = new THREE.BoxGeometry(5.0, 0.1, 6.8);
    
    // Left stationary page
    this.leftPage = new THREE.Mesh(pageGeo, paperMat);
    this.leftPage.position.set(-2.55, 0, 0);
    this.pagesGroup.add(this.leftPage);

    // Right stationary page
    this.rightPage = new THREE.Mesh(pageGeo, paperMat);
    this.rightPage.position.set(2.55, 0, 0);
    this.pagesGroup.add(this.rightPage);

    // Pop-up decorations container
    this.popupContainer = new THREE.Group();
    this.popupContainer.position.set(0, 0.1, 0);
    this.group.add(this.popupContainer);

    // Flipping page sheet (for transitions)
    this.flipPivot = new THREE.Group();
    this.flipPivot.position.set(0, 0.12, 0);
    this.group.add(this.flipPivot);

    const flipPageGeo = new THREE.BoxGeometry(5.0, 0.04, 6.8);
    this.flipPageMesh = new THREE.Mesh(flipPageGeo, paperMat);
    this.flipPageMesh.position.set(2.5, 0, 0);
    this.flipPivot.add(this.flipPageMesh);
    this.flipPivot.visible = false;

    // Initially closed: front cover covers right half
    this.frontCoverPivot.rotation.z = 0;
  }

  /**
   * Cinematic Card Opening Animation
   */
  openCard(onComplete) {
    if (this.isOpen) return;
    this.isOpen = true;

    // Rotate front cover open 180 degrees
    new TWEEN.Tween(this.frontCoverPivot.rotation)
      .to({ z: Math.PI }, 1400)
      .easing(TWEEN.Easing.Cubic.InOut)
      .onComplete(() => {
        if (onComplete) onComplete();
      })
      .start();

    // Pop-up scale effect
    this.popupContainer.scale.set(0.01, 0.01, 0.01);
    new TWEEN.Tween(this.popupContainer.scale)
      .to({ x: 1, y: 1, z: 1 }, 1200)
      .delay(400)
      .easing(TWEEN.Easing.Back.Out)
      .start();
  }

  /**
   * Load a specific Chapter's content onto the 3D book spread
   */
  loadChapter(chapter) {
    // Clear old polaroids and popups
    while (this.popupContainer.children.length > 0) {
      const obj = this.popupContainer.children[0];
      this.popupContainer.remove(obj);
    }
    this.photoMeshes = [];

    // Build Polaroid Frames for the photos in this chapter
    if (chapter.photos) {
      chapter.photos.forEach((photoData) => {
        const polaroid = this.createPolaroid(photoData);
        this.popupContainer.add(polaroid);
        this.photoMeshes.push(polaroid);
      });
    }

    // Add cute 3D Pop-up elements (butterflies, flowers, washi paper cutouts)
    this.addScrapbookDecorations();

    // Pop-in bounce animation
    this.popupContainer.scale.set(0.7, 0.7, 0.7);
    new TWEEN.Tween(this.popupContainer.scale)
      .to({ x: 1, y: 1, z: 1 }, 700)
      .easing(TWEEN.Easing.Back.Out)
      .start();
  }

  /**
   * Creates a 3D Polaroid frame with texture, tape, and pin
   */
  createPolaroid(photoData) {
    const polaroidGroup = new THREE.Group();
    polaroidGroup.position.set(photoData.x - 5.0, photoData.y, -0.4);
    polaroidGroup.rotation.z = photoData.rotation || 0;
    polaroidGroup.rotation.y = 0.05; // Slight angle for 2.5D depth

    // Polaroid white paper backing
    const frameGeo = new THREE.BoxGeometry(2.1, 2.5, 0.04);
    const frameMat = new THREE.MeshLambertMaterial({ color: 0xffffff });
    const frame = new THREE.Mesh(frameGeo, frameMat);
    polaroidGroup.add(frame);

    // Photo Area
    const photoGeo = new THREE.PlaneGeometry(1.8, 1.8);
    const photoMat = this.createPhotoMaterial(photoData);
    const photoMesh = new THREE.Mesh(photoGeo, photoMat);
    photoMesh.position.set(0, 0.22, 0.025);
    polaroidGroup.add(photoMesh);

    // Washi Tape on top
    const tapeGeo = new THREE.BoxGeometry(0.7, 0.22, 0.06);
    const tapeMat = new THREE.MeshLambertMaterial({ 
      color: 0xffadc7, 
      transparent: true, 
      opacity: 0.85 
    });
    const tape = new THREE.Mesh(tapeGeo, tapeMat);
    tape.position.set(0, 1.25, 0.03);
    tape.rotation.z = (Math.random() - 0.5) * 0.2;
    polaroidGroup.add(tape);

    // Floating animation (gentle hover)
    const startY = polaroidGroup.position.y;
    new TWEEN.Tween(polaroidGroup.position)
      .to({ y: startY + 0.08 }, 2000 + Math.random() * 800)
      .yoyo(true)
      .repeat(Infinity)
      .easing(TWEEN.Easing.Sinusoidal.InOut)
      .start();

    return polaroidGroup;
  }

  createPhotoMaterial(photoData) {
    const textureLoader = new THREE.TextureLoader();
    const fallbackCanvas = this.createFallbackCanvas(photoData.caption, photoData.sticker, photoData.fallbackColor);
    const fallbackTexture = new THREE.CanvasTexture(fallbackCanvas);

    const mat = new THREE.MeshLambertMaterial({
      map: fallbackTexture
    });

    // Try loading actual image
    if (photoData.src) {
      textureLoader.load(
        photoData.src,
        (loadedTex) => {
          loadedTex.colorSpace = THREE.SRGBColorSpace;
          mat.map = loadedTex;
          mat.needsUpdate = true;
        },
        undefined,
        () => {
          // On error, keep aesthetic procedural canvas fallback
          console.log(`Using aesthetic retro fallback for ${photoData.src}`);
        }
      );
    }

    return mat;
  }

  createFallbackCanvas(caption, sticker, bgColor = '#ff758c') {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    // Gradient background
    const grad = ctx.createLinearGradient(0, 0, 256, 256);
    grad.addColorStop(0, bgColor);
    grad.addColorStop(1, '#2c1e3d');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 256);

    // Cute retro sticker
    ctx.font = '72px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(sticker || '♥', 128, 100);

    // Vintage text label
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 15px sans-serif';
    ctx.fillText(caption || 'Vera & Memory', 128, 190);

    // Subtle grain dots
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    for (let i = 0; i < 300; i++) {
      ctx.fillRect(Math.random() * 256, Math.random() * 256, 2, 2);
    }

    return canvas;
  }

  addScrapbookDecorations() {
    // 3D butterfly / bow cutouts popping up
    const decorGeo = new THREE.PlaneGeometry(0.6, 0.6);
    const decorCanvas = document.createElement('canvas');
    decorCanvas.width = 64;
    decorCanvas.height = 64;
    const dctx = decorCanvas.getContext('2d');
    dctx.font = '48px sans-serif';
    dctx.textAlign = 'center';
    dctx.textBaseline = 'middle';
    dctx.fillText('🦋', 32, 32);

    const decorTex = new THREE.CanvasTexture(decorCanvas);
    const decorMat = new THREE.MeshBasicMaterial({ map: decorTex, transparent: true });

    const butterfly = new THREE.Mesh(decorGeo, decorMat);
    butterfly.position.set(-1.2, 2.8, -0.2);
    this.popupContainer.add(butterfly);

    new TWEEN.Tween(butterfly.position)
      .to({ y: 3.1, x: -1.0 }, 1800)
      .yoyo(true)
      .repeat(Infinity)
      .easing(TWEEN.Easing.Sinusoidal.InOut)
      .start();
  }

  /**
   * 3D Physical Page Turn Animation
   */
  flipPage(onMidpoint, onComplete) {
    this.flipPivot.visible = true;
    this.flipPivot.rotation.z = 0;

    // Rotate from Right (0 rad) to Left (Math.PI rad)
    new TWEEN.Tween(this.flipPivot.rotation)
      .to({ z: Math.PI }, 900)
      .easing(TWEEN.Easing.Cubic.InOut)
      .onUpdate(() => {
        if (this.flipPivot.rotation.z >= Math.PI * 0.5 && onMidpoint) {
          onMidpoint();
          onMidpoint = null; // trigger once
        }
      })
      .onComplete(() => {
        this.flipPivot.visible = false;
        this.flipPivot.rotation.z = 0;
        if (onComplete) onComplete();
      })
      .start();
  }
}
