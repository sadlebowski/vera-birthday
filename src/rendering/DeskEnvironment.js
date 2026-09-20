import * as THREE from 'three';

/**
 * Vintage 2000s Desk Environment with Warm Romantic Lighting & Tumblr Decor
 */
export class DeskEnvironment {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.scene.add(this.group);

    this.setupLighting();
    this.buildDeskSurroundings();
  }

  setupLighting() {
    // 1. Soft Ambient Light (Lilac/Pink tint)
    const ambientLight = new THREE.AmbientLight(0xd1c4e9, 0.85);
    this.scene.add(ambientLight);

    // 2. Warm Desk Lamp (Key Light)
    this.deskLamp = new THREE.DirectionalLight(0xffecd2, 1.4);
    this.deskLamp.position.set(5, 8, 7);
    this.deskLamp.castShadow = true;
    this.scene.add(this.deskLamp);

    // 3. Rim Light (Cool Cyan/Purple rim for Alice: Madness Returns aesthetic)
    const rimLight = new THREE.DirectionalLight(0xa29bfe, 0.7);
    rimLight.position.set(-6, 4, -4);
    this.scene.add(rimLight);

    // 4. Subtle Point Light over center of desk
    const warmCenterLight = new THREE.PointLight(0xffa8d8, 0.6, 12);
    warmCenterLight.position.set(0, 3, 2);
    this.scene.add(warmCenterLight);
  }

  buildDeskSurroundings() {
    // Large Wooden Table Top
    const tableGeo = new THREE.BoxGeometry(26, 0.4, 18);
    const tableMat = new THREE.MeshStandardMaterial({
      color: 0x1a1520, // Dark gothic mahogany
      roughness: 0.8,
      metalness: 0.1
    });
    const table = new THREE.Mesh(tableGeo, tableMat);
    table.position.set(0, -0.3, 0);
    this.group.add(table);

    // Vintage Cassette Tape on desk
    this.createCassetteTape(6.2, -0.05, 3.5, 0.3);

    // Tea Cup & Saucer (Alice tea party motif)
    this.createTeaCup(-5.5, -0.05, 2.5);

    // Golden Wonderland Skeleton Key
    this.createVintageKey(-4.8, -0.05, 4.0, -0.4);

    // Dried Rose on table
    this.createDriedRose(5.2, -0.05, -3.2, 0.6);
  }

  createCassetteTape(x, y, z, rotY) {
    const cassetteGroup = new THREE.Group();
    cassetteGroup.position.set(x, y, z);
    cassetteGroup.rotation.y = rotY;

    // Body
    const bodyGeo = new THREE.BoxGeometry(1.6, 0.12, 1.0);
    const bodyMat = new THREE.MeshLambertMaterial({ color: 0x2d2b38 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    cassetteGroup.add(body);

    // Label
    const labelGeo = new THREE.BoxGeometry(1.2, 0.13, 0.6);
    const labelMat = new THREE.MeshLambertMaterial({ color: 0xffd1dc });
    const label = new THREE.Mesh(labelGeo, labelMat);
    cassetteGroup.add(label);

    // Tape holes
    const holeGeo = new THREE.CylinderGeometry(0.09, 0.09, 0.15, 12);
    const holeMat = new THREE.MeshBasicMaterial({ color: 0x111115 });
    const hole1 = new THREE.Mesh(holeGeo, holeMat);
    hole1.position.set(0.3, 0, 0);
    const hole2 = new THREE.Mesh(holeGeo, holeMat);
    hole2.position.set(-0.3, 0, 0);
    cassetteGroup.add(hole1, hole2);

    this.group.add(cassetteGroup);
  }

  createTeaCup(x, y, z) {
    const cupGroup = new THREE.Group();
    cupGroup.position.set(x, y, z);

    // Saucer
    const saucerGeo = new THREE.CylinderGeometry(0.9, 0.7, 0.08, 16);
    const chinaMat = new THREE.MeshStandardMaterial({ color: 0xfdfaf6, roughness: 0.2 });
    const saucer = new THREE.Mesh(saucerGeo, chinaMat);
    cupGroup.add(saucer);

    // Cup
    const cupGeo = new THREE.CylinderGeometry(0.5, 0.35, 0.6, 16);
    const cup = new THREE.Mesh(cupGeo, chinaMat);
    cup.position.y = 0.32;
    cupGroup.add(cup);

    // Tea inside
    const teaGeo = new THREE.CylinderGeometry(0.46, 0.46, 0.05, 16);
    const teaMat = new THREE.MeshLambertMaterial({ color: 0x6e2c00 });
    const tea = new THREE.Mesh(teaGeo, teaMat);
    tea.position.y = 0.58;
    cupGroup.add(tea);

    this.group.add(cupGroup);
  }

  createVintageKey(x, y, z, rotY) {
    const keyGroup = new THREE.Group();
    keyGroup.position.set(x, y, z);
    keyGroup.rotation.y = rotY;

    const goldMat = new THREE.MeshStandardMaterial({ color: 0xf39c12, metalness: 0.8, roughness: 0.3 });

    // Ring top
    const ringGeo = new THREE.TorusGeometry(0.2, 0.05, 8, 16);
    const ring = new THREE.Mesh(ringGeo, goldMat);
    ring.rotation.x = Math.PI * 0.5;
    keyGroup.add(ring);

    // Shaft
    const shaftGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.8, 8);
    const shaft = new THREE.Mesh(shaftGeo, goldMat);
    shaft.rotation.z = Math.PI * 0.5;
    shaft.position.x = 0.5;
    keyGroup.add(shaft);

    // Teeth
    const toothGeo = new THREE.BoxGeometry(0.08, 0.04, 0.16);
    const tooth = new THREE.Mesh(toothGeo, goldMat);
    tooth.position.set(0.85, 0, 0.08);
    keyGroup.add(tooth);

    this.group.add(keyGroup);
  }

  createDriedRose(x, y, z, rotY) {
    const roseGroup = new THREE.Group();
    roseGroup.position.set(x, y, z);
    roseGroup.rotation.y = rotY;

    // Stem
    const stemGeo = new THREE.CylinderGeometry(0.02, 0.02, 1.2, 6);
    const stemMat = new THREE.MeshLambertMaterial({ color: 0x3b3a30 });
    const stem = new THREE.Mesh(stemGeo, stemMat);
    stem.rotation.z = Math.PI * 0.5;
    roseGroup.add(stem);

    // Petals (Dark gothic crimson)
    const budGeo = new THREE.SphereGeometry(0.18, 8, 8);
    const petalMat = new THREE.MeshLambertMaterial({ color: 0x5a1827 });
    const bud = new THREE.Mesh(budGeo, petalMat);
    bud.position.x = 0.65;
    roseGroup.add(bud);

    this.group.add(roseGroup);
  }
}
