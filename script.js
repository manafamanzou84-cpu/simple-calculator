import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87c7ff);
scene.fog = new THREE.Fog(0x87c7ff, 30, 220);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 500);
camera.position.set(0, 5, -12);

const clock = new THREE.Clock();
const hudSpeed = document.getElementById('speed');
const hudCamera = document.getElementById('cameraLabel');

const environment = new THREE.Group();
scene.add(environment);

const ambientLight = new THREE.HemisphereLight(0xcfe8ff, 0x204020, 1.3);
scene.add(ambientLight);

const sun = new THREE.DirectionalLight(0xffffff, 1.5);
sun.position.set(18, 26, 12);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.left = -60;
sun.shadow.camera.right = 60;
sun.shadow.camera.top = 60;
sun.shadow.camera.bottom = -60;
scene.add(sun);

const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(220, 240),
  new THREE.MeshStandardMaterial({ color: 0x2d8f4f, roughness: 0.9 })
);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

const roadMaterial = new THREE.MeshStandardMaterial({ color: 0x2d2d31, roughness: 0.9, metalness: 0.2 });
const lineMaterial = new THREE.MeshStandardMaterial({ color: 0xf2f2f2, emissive: 0x111111 });

const roadSegments = [];
for (let i = 0; i < 18; i++) {
  const road = new THREE.Mesh(new THREE.BoxGeometry(18, 0.5, 60), roadMaterial);
  road.position.set(0, 0.1, -i * 60);
  road.receiveShadow = true;
  scene.add(road);

  const leftLine = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.2, 16), lineMaterial);
  leftLine.position.set(-4.2, 0.35, road.position.z);
  scene.add(leftLine);

  const rightLine = leftLine.clone();
  rightLine.position.x = 4.2;
  scene.add(rightLine);

  const centerLine = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.2, 16), lineMaterial);
  centerLine.position.set(0, 0.35, road.position.z);
  scene.add(centerLine);

  roadSegments.push({ road, leftLine, rightLine, centerLine });
}

function createTree(x, z) {
  const group = new THREE.Group();
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.5, 0.7, 3.5, 8),
    new THREE.MeshStandardMaterial({ color: 0x5b3b28 })
  );
  trunk.position.y = 1.8;
  trunk.castShadow = true;
  group.add(trunk);

  const leaves = new THREE.Mesh(
    new THREE.SphereGeometry(2.2, 12, 12),
    new THREE.MeshStandardMaterial({ color: 0x2f8d4a })
  );
  leaves.position.y = 4.3;
  leaves.castShadow = true;
  group.add(leaves);

  group.position.set(x, 0, z);
  scene.add(group);
  return group;
}

const trees = [];
for (let i = 0; i < 28; i++) {
  const x = i % 2 === 0 ? -28 - Math.random() * 8 : 28 + Math.random() * 8;
  const z = -i * 18 - Math.random() * 60;
  trees.push(createTree(x, z));
}

function createCar(color = 0xff3b3b) {
  const group = new THREE.Group();

  const bodyMaterial = new THREE.MeshStandardMaterial({ color, metalness: 0.65, roughness: 0.35 });
  const body = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.9, 4.8), bodyMaterial);
  body.position.y = 0.9;
  body.castShadow = true;
  group.add(body);

  const cabin = new THREE.Mesh(
    new THREE.BoxGeometry(1.8, 0.8, 2.1),
    new THREE.MeshStandardMaterial({ color: 0xbdd6ef, transparent: true, opacity: 0.8 })
  );
  cabin.position.set(0, 1.5, -0.2);
  cabin.castShadow = true;
  group.add(cabin);

  const wheelGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.45, 16);
  const wheelMat = new THREE.MeshStandardMaterial({ color: 0x121212, roughness: 0.9 });
  const positions = [
    [-1.2, 0.5, -1.5],
    [1.2, 0.5, -1.5],
    [-1.2, 0.5, 1.5],
    [1.2, 0.5, 1.5],
  ];

  positions.forEach(([x, y, z]) => {
    const wheel = new THREE.Mesh(wheelGeo, wheelMat);
    wheel.rotation.z = Math.PI / 2;
    wheel.position.set(x, y, z);
    wheel.castShadow = true;
    group.add(wheel);
  });

  const frontLightMaterial = new THREE.MeshStandardMaterial({ color: 0xf9ffda, emissive: 0xfff8c7, emissiveIntensity: 0.8 });
  const rearLightMaterial = new THREE.MeshStandardMaterial({ color: 0xff5a5a, emissive: 0xff1111, emissiveIntensity: 0.6 });

  const headlightLeft = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.25, 0.12), frontLightMaterial);
  headlightLeft.position.set(-0.7, 1.0, 2.55);
  group.add(headlightLeft);

  const headlightRight = headlightLeft.clone();
  headlightRight.position.x = 0.7;
  group.add(headlightRight);

  const brakeLeft = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.25, 0.12), rearLightMaterial);
  brakeLeft.position.set(-0.7, 1.0, -2.55);
  group.add(brakeLeft);

  const brakeRight = brakeLeft.clone();
  brakeRight.position.x = 0.7;
  group.add(brakeRight);

  group.position.set(0, 0, 0);
  return group;
}

const playerCar = createCar(0x28c4ff);
playerCar.position.set(0, 0.25, 14);
scene.add(playerCar);

const npcCars = [];
for (let i = 0; i < 6; i++) {
  const car = createCar([0xff4d4d, 0xffd354, 0x9b5de5, 0x2eb872][i % 4]);
  const lane = [-6, -2, 2, 6][i % 4];
  car.position.set(lane, 0.25, -30 - i * 35);
  scene.add(car);
  npcCars.push({ mesh: car, x: lane, z: -30 - i * 35, speed: 18 + Math.random() * 9 });
}

const keys = {
  w: false,
  s: false,
  a: false,
  d: false,
};

let currentCameraMode = 'chase';
let carSpeed = 0;
let steer = 0;
let playerX = 0;

function setCameraMode(mode) {
  currentCameraMode = mode;
  const label = {
    chase: 'Chasse',
    hood: 'Capot',
    cockpit: 'Cockpit',
    top: 'Vue haute',
  }[mode] || 'Chasse';
  hudCamera.textContent = 'Camera: ' + label;
}

function updateCamera() {
  const target = new THREE.Vector3(playerX, 1.1, 0);

  if (currentCameraMode === 'chase') {
    const desired = new THREE.Vector3(playerX, 4.2, -11.5);
    camera.position.lerp(desired, 0.08);
    camera.lookAt(target.clone().add(new THREE.Vector3(0, 1.4, 20)));
  } else if (currentCameraMode === 'hood') {
    const desired = new THREE.Vector3(playerX, 2.6, 2.7);
    camera.position.lerp(desired, 0.1);
    camera.lookAt(target.clone().add(new THREE.Vector3(0, 1.1, 26)));
  } else if (currentCameraMode === 'cockpit') {
    const desired = new THREE.Vector3(playerX, 1.75, 0.9);
    camera.position.lerp(desired, 0.12);
    camera.lookAt(target.clone().add(new THREE.Vector3(0, 1.2, 18)));
  } else if (currentCameraMode === 'top') {
    const desired = new THREE.Vector3(playerX, 28, 2);
    camera.position.lerp(desired, 0.08);
    camera.lookAt(new THREE.Vector3(playerX, 0, 16));
  }
}

function updatePlayer(dt) {
  const acceleration = keys.w ? 22 : 0;
  const brake = keys.s ? 26 : 0;
  const turning = (keys.a ? 1 : 0) - (keys.d ? 1 : 0);

  if (keys.w) {
    carSpeed += acceleration * dt;
  } else {
    carSpeed -= 12 * dt;
  }

  if (keys.s) {
    carSpeed -= brake * dt;
  }

  carSpeed = THREE.MathUtils.clamp(carSpeed, 0, 62);
  if (!keys.w && !keys.s) {
    carSpeed -= 8 * dt;
    carSpeed = Math.max(0, carSpeed);
  }

  const steerFactor = THREE.MathUtils.clamp(carSpeed / 30, 0.2, 1.2);
  steer += (turning - steer) * dt * 8;
  playerX += steer * dt * (6 + steerFactor * 4);
  playerX = THREE.MathUtils.clamp(playerX, -7.6, 7.6);

  playerCar.position.x = playerX;
  playerCar.rotation.y = -steer * 0.35;
  playerCar.rotation.z = -steer * 0.15;

  if (carSpeed > 0.5) {
    playerCar.position.z = 14;
  }
}

function updateRoad(dt) {
  const scroll = (carSpeed * 1.6 + 18) * dt;

  for (const segment of roadSegments) {
    segment.road.position.z += scroll;
    segment.leftLine.position.z += scroll;
    segment.rightLine.position.z += scroll;
    segment.centerLine.position.z += scroll;

    if (segment.road.position.z > 70) {
      segment.road.position.z -= 60 * roadSegments.length;
      segment.leftLine.position.z -= 60 * roadSegments.length;
      segment.rightLine.position.z -= 60 * roadSegments.length;
      segment.centerLine.position.z -= 60 * roadSegments.length;
    }
  }

  for (const tree of trees) {
    tree.position.z += scroll;
    if (tree.position.z > 90) {
      tree.position.z -= 250;
      tree.position.x = Math.random() > 0.5 ? -32 - Math.random() * 8 : 32 + Math.random() * 8;
    }
  }
}

function updateNPC(dt) {
  for (const npc of npcCars) {
    npc.z += (carSpeed * 0.8 + npc.speed) * dt;
    if (npc.z > 60) {
      npc.z = -240 - Math.random() * 160;
      npc.x = [-6, -2, 2, 6][Math.floor(Math.random() * 4)];
    }

    npc.mesh.position.set(npc.x, 0.25, npc.z);

    if (Math.abs(npc.z - playerCar.position.z) < 2.7 && Math.abs(npc.x - playerX) < 2.3) {
      carSpeed *= 0.64;
      npc.z = -250 - Math.random() * 150;
      npc.x = [-6, -2, 2, 6][Math.floor(Math.random() * 4)];
    }
  }
}

window.addEventListener('keydown', (event) => {
  const key = event.key.toLowerCase();
  if (key === 'w' || key === 'arrowup') keys.w = true;
  if (key === 's' || key === 'arrowdown') keys.s = true;
  if (key === 'a' || key === 'arrowleft') keys.a = true;
  if (key === 'd' || key === 'arrowright') keys.d = true;

  if (key === 'c') {
    const modes = ['chase', 'hood', 'cockpit', 'top'];
    const currentIndex = modes.indexOf(currentCameraMode);
    setCameraMode(modes[(currentIndex + 1) % modes.length]);
  }

  if (key === '1') setCameraMode('chase');
  if (key === '2') setCameraMode('hood');
  if (key === '3') setCameraMode('cockpit');
  if (key === '4') setCameraMode('top');
});

window.addEventListener('keyup', (event) => {
  const key = event.key.toLowerCase();
  if (key === 'w' || key === 'arrowup') keys.w = false;
  if (key === 's' || key === 'arrowdown') keys.s = false;
  if (key === 'a' || key === 'arrowleft') keys.a = false;
  if (key === 'd' || key === 'arrowright') keys.d = false;
});

document.querySelectorAll('[data-camera]').forEach((button) => {
  button.addEventListener('click', () => {
    setCameraMode(button.dataset.camera);
  });
});

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), 0.033);

  updatePlayer(dt);
  updateRoad(dt);
  updateNPC(dt);
  updateCamera();

  const speedKmh = Math.round(carSpeed * 6.4);
  hudSpeed.textContent = speedKmh + ' km/h';

  renderer.render(scene, camera);
}

setCameraMode('chase');
animate();
