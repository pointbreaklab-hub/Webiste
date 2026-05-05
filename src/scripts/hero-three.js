import * as THREE from 'three';

export function initHero() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;

  // Respect reduced-motion preference — skip animation entirely
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 5;

  const NODE_COUNT = 60;
  const positions  = [];
  const nodeGeo    = new THREE.SphereGeometry(0.03, 8, 8);
  const nodeMat    = new THREE.MeshBasicMaterial({ color: 0x00d4aa });
  const nodes      = new THREE.InstancedMesh(nodeGeo, nodeMat, NODE_COUNT);
  const dummy      = new THREE.Object3D();

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

  // Mouse parallax — passive listener, throttled to one update per frame
  let mouseX = 0, mouseY = 0;
  let pendingMouse = false;
  window.addEventListener('mousemove', (e) => {
    if (pendingMouse) return;
    pendingMouse = true;
    requestAnimationFrame(() => {
      mouseX = (e.clientX / window.innerWidth  - 0.5) * 0.5;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 0.5;
      pendingMouse = false;
    });
  }, { passive: true });

  // Resize — debounced so we're not thrashing during drag
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }, 100);
  }, { passive: true });

  // Pause animation when hero is off-screen or tab is hidden
  let visibleOnScreen = true;
  let tabVisible = !document.hidden;

  const heroSection = document.getElementById('hero');
  if (heroSection && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      (entries) => { visibleOnScreen = entries[0].isIntersecting; },
      { threshold: 0 },
    );
    io.observe(heroSection);
  }
  document.addEventListener('visibilitychange', () => {
    tabVisible = !document.hidden;
  });

  // Render once if reduced-motion is set, then stop. Otherwise loop.
  const clock = new THREE.Clock();
  function frame() {
    if (visibleOnScreen && tabVisible) {
      const t = clock.getElapsedTime();
      scene.rotation.y = t * 0.04 + mouseX;
      scene.rotation.x = mouseY * 0.5;
      const s = 1 + Math.sin(t * 1.5) * 0.15;
      nodes.scale.set(s, s, s);
      renderer.render(scene, camera);
    }
    if (!reduced) requestAnimationFrame(frame);
  }

  if (reduced) {
    // Render a single static frame and exit — no animation
    renderer.render(scene, camera);
  } else {
    requestAnimationFrame(frame);
  }
}
