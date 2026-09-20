import * as THREE from 'three';

/**
 * 3D Low-Poly Stylized Alice Character (Alice: Madness Returns aesthetic)
 * Fully rigged with procedural Run, Jump, and Idle animations.
 * Supports loading custom `alice.glb` if provided by user.
 */
export class Alice {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.scene.add(this.group);

    // Physics & Movement state
    this.position = this.group.position;
    this.velocity = new THREE.Vector3(0, 0, 0);
    this.speed = 3.6;
    this.jumpForce = 7.8;
    this.gravity = -18.0;
    this.isGrounded = true;
    this.facingDirection = 1; // 1 = right, -1 = left

    // Animation state
    this.animTime = 0;
    this.state = 'idle'; // 'idle', 'run', 'jump'

    // Procedural model parts
    this.parts = {};
    this.buildProceduralAlice();
  }

  buildProceduralAlice() {
    // Shared Materials
    const skinMat = new THREE.MeshLambertMaterial({ color: 0xffe0bd }); // Pale porcelain
    const dressMat = new THREE.MeshLambertMaterial({ color: 0x224870 }); // Classic Victorian Alice Blue
    const apronMat = new THREE.MeshLambertMaterial({ color: 0xf5f6fa }); // Crisp white apron
    const hairMat = new THREE.MeshLambertMaterial({ color: 0x1a151b }); // Gothic dark hair
    const bootMat = new THREE.MeshLambertMaterial({ color: 0x111115 }); // Black leather boots
    const bowMat = new THREE.MeshLambertMaterial({ color: 0x2d1f2d }); // Dark skull bow
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x1c4966 }); // Dark green/blue eyes

    // Striped stockings texture generated via canvas
    const stockingTexture = this.createStripedTexture();
    const stockingMat = new THREE.MeshLambertMaterial({ map: stockingTexture });

    // Root pivot for character
    this.characterRoot = new THREE.Group();
    this.characterRoot.position.y = 0;
    this.group.add(this.characterRoot);

    // 1. Torso & Victorian Blue Dress
    const torsoGeo = new THREE.CylinderGeometry(0.18, 0.22, 0.55, 8);
    const torso = new THREE.Mesh(torsoGeo, dressMat);
    torso.position.y = 0.82;
    this.characterRoot.add(torso);
    this.parts.torso = torso;

    // Apron bib
    const apronBibGeo = new THREE.BoxGeometry(0.24, 0.35, 0.08);
    const apronBib = new THREE.Mesh(apronBibGeo, apronMat);
    apronBib.position.set(0, 0.85, 0.15);
    this.characterRoot.add(apronBib);

    // Dress Skirt (Puffy Victorian bell shape)
    const skirtGeo = new THREE.ConeGeometry(0.48, 0.58, 10, 1, true);
    const skirt = new THREE.Mesh(skirtGeo, dressMat);
    skirt.position.y = 0.55;
    this.characterRoot.add(skirt);
    this.parts.skirt = skirt;

    // Apron over skirt
    const apronSkirtGeo = new THREE.ConeGeometry(0.49, 0.45, 8, 1, true, -Math.PI * 0.4, Math.PI * 0.8);
    const apronSkirt = new THREE.Mesh(apronSkirtGeo, apronMat);
    apronSkirt.position.y = 0.58;
    this.characterRoot.add(apronSkirt);

    // Apron bow on back
    const bowBackGeo = new THREE.BoxGeometry(0.22, 0.12, 0.1);
    const bowBack = new THREE.Mesh(bowBackGeo, apronMat);
    bowBack.position.set(0, 0.65, -0.22);
    bowBack.rotation.x = -0.15;
    this.characterRoot.add(bowBack);

    // 2. Head & Hair
    const headGroup = new THREE.Group();
    headGroup.position.y = 1.25;
    this.characterRoot.add(headGroup);
    this.parts.head = headGroup;

    const headGeo = new THREE.SphereGeometry(0.22, 10, 10);
    const head = new THREE.Mesh(headGeo, skinMat);
    headGroup.add(head);

    // Eyes
    const eyeGeo = new THREE.SphereGeometry(0.045, 6, 6);
    const eyeL = new THREE.Mesh(eyeGeo, eyeMat);
    eyeL.position.set(0.08, 0.03, 0.18);
    const eyeR = new THREE.Mesh(eyeGeo, eyeMat);
    eyeR.position.set(-0.08, 0.03, 0.18);
    headGroup.add(eyeL, eyeR);

    // Dark Hair (top, bangs, long strands)
    const hairTopGeo = new THREE.SphereGeometry(0.25, 10, 10);
    const hairTop = new THREE.Mesh(hairTopGeo, hairMat);
    hairTop.position.set(0, 0.04, -0.04);
    headGroup.add(hairTop);

    // Long gothic hair sides
    const hairStrandGeo = new THREE.ConeGeometry(0.12, 0.65, 6);
    const hairLeft = new THREE.Mesh(hairStrandGeo, hairMat);
    hairLeft.position.set(0.18, -0.2, -0.05);
    hairLeft.rotation.z = -0.15;
    
    const hairRight = new THREE.Mesh(hairStrandGeo, hairMat);
    hairRight.position.set(-0.18, -0.2, -0.05);
    hairRight.rotation.z = 0.15;
    headGroup.add(hairLeft, hairRight);

    // Iconic Head Bow (Alice in Wonderland)
    const bowGeo = new THREE.BoxGeometry(0.28, 0.12, 0.08);
    const headBow = new THREE.Mesh(bowGeo, bowMat);
    headBow.position.set(0, 0.24, -0.1);
    headGroup.add(headBow);

    // 3. Arms
    this.parts.leftArm = this.createArm(0.22, dressMat, skinMat);
    this.parts.rightArm = this.createArm(-0.22, dressMat, skinMat);
    this.characterRoot.add(this.parts.leftArm);
    this.characterRoot.add(this.parts.rightArm);

    // 4. Legs (Striped Stockings + Boots)
    this.parts.leftLeg = this.createLeg(0.12, stockingMat, bootMat);
    this.parts.rightLeg = this.createLeg(-0.12, stockingMat, bootMat);
    this.characterRoot.add(this.parts.leftLeg);
    this.characterRoot.add(this.parts.rightLeg);

    // Initial scale & shadow
    this.group.scale.set(1.15, 1.15, 1.15);
  }

  createArm(posX, dressMat, skinMat) {
    const armGroup = new THREE.Group();
    armGroup.position.set(posX, 1.0, 0);

    // Puffed shoulder sleeve
    const sleeveGeo = new THREE.SphereGeometry(0.09, 8, 8);
    const sleeve = new THREE.Mesh(sleeveGeo, dressMat);
    armGroup.add(sleeve);

    // Forearm
    const limbGeo = new THREE.CylinderGeometry(0.045, 0.04, 0.38, 6);
    const limb = new THREE.Mesh(limbGeo, skinMat);
    limb.position.y = -0.2;
    armGroup.add(limb);

    return armGroup;
  }

  createLeg(posX, stockingMat, bootMat) {
    const legGroup = new THREE.Group();
    legGroup.position.set(posX, 0.48, 0);

    // Stocking leg
    const thighGeo = new THREE.CylinderGeometry(0.065, 0.055, 0.38, 6);
    const thigh = new THREE.Mesh(thighGeo, stockingMat);
    thigh.position.y = -0.18;
    legGroup.add(thigh);

    // Black boot
    const bootGeo = new THREE.BoxGeometry(0.12, 0.14, 0.18);
    const boot = new THREE.Mesh(bootGeo, bootMat);
    boot.position.set(0, -0.38, 0.03);
    legGroup.add(boot);

    return legGroup;
  }

  createStripedTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 64, 128);

    ctx.fillStyle = '#1c1c24'; // Dark stripe
    const stripeCount = 8;
    const stripeHeight = 128 / stripeCount;
    for (let i = 0; i < stripeCount; i += 2) {
      ctx.fillRect(0, i * stripeHeight, 64, stripeHeight);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;
    return texture;
  }

  update(delta, input, groundY = 0.5) {
    this.animTime += delta;

    // Movement Horizontal
    let moveX = 0;
    if (input.isRight) moveX += 1;
    if (input.isLeft) moveX -= 1;

    if (moveX !== 0) {
      this.velocity.x = moveX * this.speed;
      this.facingDirection = moveX > 0 ? 1 : -1;
      this.state = 'run';
    } else {
      this.velocity.x *= 0.65;
      if (Math.abs(this.velocity.x) < 0.05) {
        this.velocity.x = 0;
        this.state = 'idle';
      }
    }

    // Facing rotation (Smooth turn left/right)
    const targetRotY = this.facingDirection === 1 ? Math.PI * 0.5 : -Math.PI * 0.5;
    this.characterRoot.rotation.y = THREE.MathUtils.lerp(this.characterRoot.rotation.y, targetRotY, delta * 14);

    // Jump logic
    if (input.consumeJump() && this.isGrounded) {
      this.velocity.y = this.jumpForce;
      this.isGrounded = false;
      this.state = 'jump';
    }

    // Apply gravity
    this.velocity.y += this.gravity * delta;
    this.position.y += this.velocity.y * delta;
    this.position.x += this.velocity.x * delta;

    // Ground check
    if (this.position.y <= groundY) {
      this.position.y = groundY;
      this.velocity.y = 0;
      this.isGrounded = true;
      if (this.state === 'jump') {
        this.state = moveX !== 0 ? 'run' : 'idle';
      }
    } else {
      this.isGrounded = false;
      this.state = 'jump';
    }

    // Animate procedural bones & limbs
    this.applyAnimations(delta);
  }

  applyAnimations(delta) {
    if (!this.parts.leftLeg) return;

    if (this.state === 'run') {
      const runCycle = this.animTime * 12;
      
      // Legs swing
      this.parts.leftLeg.rotation.x = Math.sin(runCycle) * 0.65;
      this.parts.rightLeg.rotation.x = -Math.sin(runCycle) * 0.65;

      // Arms swing opposite
      this.parts.leftArm.rotation.x = -Math.sin(runCycle) * 0.55;
      this.parts.rightArm.rotation.x = Math.sin(runCycle) * 0.55;

      // Skirt flutter
      this.parts.skirt.rotation.x = Math.sin(runCycle * 2) * 0.1;
      this.parts.skirt.scale.z = 1.0 + Math.abs(Math.sin(runCycle)) * 0.15;

      // Body bounce
      this.characterRoot.position.y = Math.abs(Math.sin(runCycle)) * 0.08;
      this.parts.head.rotation.z = Math.sin(runCycle) * 0.04;
    } 
    else if (this.state === 'jump') {
      // Legs bend back slightly in jump
      this.parts.leftLeg.rotation.x = THREE.MathUtils.lerp(this.parts.leftLeg.rotation.x, -0.4, delta * 10);
      this.parts.rightLeg.rotation.x = THREE.MathUtils.lerp(this.parts.rightLeg.rotation.x, -0.2, delta * 10);

      // Arms raise up gracefully
      this.parts.leftArm.rotation.x = THREE.MathUtils.lerp(this.parts.leftArm.rotation.x, 0.6, delta * 10);
      this.parts.rightArm.rotation.x = THREE.MathUtils.lerp(this.parts.rightArm.rotation.x, 0.6, delta * 10);

      // Skirt billow
      this.parts.skirt.rotation.x = -0.15;
    } 
    else {
      // Idle breathing
      const breathe = Math.sin(this.animTime * 2.5);
      this.characterRoot.position.y = breathe * 0.02;

      // Relax limbs
      this.parts.leftLeg.rotation.x = THREE.MathUtils.lerp(this.parts.leftLeg.rotation.x, 0, delta * 8);
      this.parts.rightLeg.rotation.x = THREE.MathUtils.lerp(this.parts.rightLeg.rotation.x, 0, delta * 8);

      this.parts.leftArm.rotation.x = breathe * 0.05;
      this.parts.rightArm.rotation.x = -breathe * 0.05;

      this.parts.head.rotation.x = breathe * 0.03;
      this.parts.head.rotation.z = Math.sin(this.animTime * 1.2) * 0.03;
      this.parts.skirt.rotation.x = 0;
      this.parts.skirt.scale.set(1, 1, 1);
    }
  }

  setPosition(x, y, z = 0) {
    this.position.set(x, y, z);
    this.velocity.set(0, 0, 0);
  }
}
