import * as THREE from 'three';

/**
 * Aesthetic Sparkles & Floating Dust Motes (Tumblr / Pinterest Glitter)
 */
export class ParticleManager {
  constructor(scene) {
    this.scene = scene;
    this.sparkles = [];
    this.maxSparkles = 60;

    // Ambient floating dust/stars
    this.buildAmbientDust();
  }

  buildAmbientDust() {
    const count = 75;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const scales = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 16;
      positions[i * 3 + 1] = Math.random() * 6;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 6;
      scales[i] = Math.random() * 0.15 + 0.05;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('scale', new THREE.BufferAttribute(scales, 1));

    // Custom star sprite
    const spriteCanvas = document.createElement('canvas');
    spriteCanvas.width = 32;
    spriteCanvas.height = 32;
    const sctx = spriteCanvas.getContext('2d');
    sctx.fillStyle = '#ffb6c1';
    sctx.font = '24px sans-serif';
    sctx.textAlign = 'center';
    sctx.textBaseline = 'middle';
    sctx.fillText('✦', 16, 16);

    const texture = new THREE.CanvasTexture(spriteCanvas);
    const material = new THREE.PointsMaterial({
      size: 0.35,
      map: texture,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.dustPoints = new THREE.Points(geometry, material);
    this.scene.add(this.dustPoints);
  }

  emitSparkle(x, y, z = 0, count = 5) {
    for (let i = 0; i < count; i++) {
      const geo = new THREE.PlaneGeometry(0.12, 0.12);
      const mat = new THREE.MeshBasicMaterial({
        color: Math.random() > 0.5 ? 0xff9ee2 : 0xffd700,
        transparent: true,
        opacity: 0.9,
        blending: THREE.AdditiveBlending
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(x + (Math.random() - 0.5) * 0.2, y + (Math.random() - 0.5) * 0.2, z);
      
      const vel = new THREE.Vector3(
        (Math.random() - 0.5) * 1.5,
        Math.random() * 1.8 + 0.4,
        (Math.random() - 0.5) * 0.5
      );

      this.scene.add(mesh);
      this.sparkles.push({
        mesh,
        velocity: vel,
        life: 1.0,
        maxLife: 0.8 + Math.random() * 0.4
      });
    }
  }

  update(delta) {
    // Animate ambient dust
    if (this.dustPoints) {
      const positions = this.dustPoints.geometry.attributes.position.array;
      for (let i = 1; i < positions.length; i += 3) {
        positions[i] += delta * 0.2;
        if (positions[i] > 6) {
          positions[i] = 0;
        }
      }
      this.dustPoints.geometry.attributes.position.needsUpdate = true;
      this.dustPoints.rotation.y += delta * 0.03;
    }

    // Update active sparkles
    for (let i = this.sparkles.length - 1; i >= 0; i--) {
      const s = this.sparkles[i];
      s.life -= delta;
      s.mesh.position.addScaledVector(s.velocity, delta);
      s.mesh.rotation.z += delta * 4;
      s.velocity.y -= delta * 2.0; // soft gravity

      const progress = s.life / s.maxLife;
      s.mesh.material.opacity = Math.max(0, progress);
      s.mesh.scale.set(progress, progress, progress);

      if (s.life <= 0) {
        this.scene.remove(s.mesh);
        s.mesh.geometry.dispose();
        s.mesh.material.dispose();
        this.sparkles.splice(i, 1);
      }
    }
  }
}
