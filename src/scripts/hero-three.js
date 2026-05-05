import * as THREE from 'three';

export function initHero() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 5;

  // ── Node positions ────────────────────────────────────────────────────────
  const NODE_COUNT = 60;
  const positions  = [];
  const nodeGeo    = new THREE.SphereGeometry(0.03, 8, 8);
  const nodeMat    = new THREE.MeshBasicMaterial({ color: 0x00d4aa });
  const nodes      = new THREE.InstancedMesh(nodeGeo, nodeMat, NODE_COUNT);
  const dummy       = new THREE.Object3D();

  for (let i = 0; i < NODE_COUNT; i++) {
    const p = new THREE.Vector3(
      (Math.random() - 0.5) * 10,
      (Math.random() - 0.5) * 6,
      (Math.random() - 0.5) * 4,
    );
    positions.push(p);
    dummy.position.copy(p);
    dummy.updateMatrix();
    nodes.setMatrixAt(i, dummy.matrix);
  }
  nodes.instanceMatrix.needsUpdate = true;
  scene.add(nodes);

  // ── Edges (connect nodes within threshold distance) ───────────────────────
  const CONNECT_DIST = 2.2;
  const linePositions = [];
  for (let i = 0; i < NODE_COUNT; i++) {
    for (let j = i + 1; j < NODE_COUNT; j++) {
      if (positions[i].distanceTo(positions[j]) < CONNECT_DIST) {
        linePositions.push(
          positions[i].x, positions[i].y, positions[i].z,
          positions[j].x, positions[j].y, positions[j].z,
        );
      }
    }
  }

  const lineGeo = new THREE.BufferGeometry();
  lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
  const lineMat = new THREE.LineBasicMaterial({ color: 0x00d4aa, opacity: 0.18, transparent: true });
  scene.add(new THREE.LineSegments(lineGeo, lineMat));

  // ── Mouse parallax ────────────────────────────────────────────────────────
  let mouseX = 0, mouseY = 0;
  window.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth  - 0.5) * 0.5;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 0.5;
  });

  // ── Resize ────────────────────────────────────────────────────────────────
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // ── Animate ───────────────────────────────────────────────────────────────
  const clock = new THREE.Clock();
  function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();

    // Slow rotation
    scene.rotation.y = t * 0.04 + mouseX;
    scene.rotation.x = mouseY * 0.5;

    // Subtle node pulsing
    const s = 1 + Math.sin(t * 1.5) * 0.15;
    nodes.scale.set(s, s, s);

    renderer.render(scene, camera);
  }
  animate();
}
