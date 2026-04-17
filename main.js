import * as THREE from 'https://unpkg.com/three@0.152.2/build/three.module.js';
import { OrbitControls } from 'https://unpkg.com/three@0.152.2/examples/jsm/controls/OrbitControls.js';

// --- Get URL parameter ---
function getImageUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get('image');
}

const imageUrl = getImageUrl();

const loadingEl = document.getElementById('loading');
const errorEl = document.getElementById('error');

if (!imageUrl) {
  loadingEl.style.display = 'none';
  errorEl.style.display = 'block';
  errorEl.innerText = "No image provided";
  throw new Error("No image URL");
}

// --- Scene setup ---
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  2000
);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('viewer').appendChild(renderer.domElement);

// --- Sphere geometry (inside-out) ---
const geometry = new THREE.SphereGeometry(500, 60, 40);
geometry.scale(-1, 1, 1); // IMPORTANT: flips inside

// --- Load texture ---
const loader = new THREE.TextureLoader();
loader.setCrossOrigin('anonymous');

loader.load(
  imageUrl,

  // SUCCESS
  (texture) => {
    const material = new THREE.MeshBasicMaterial({ map: texture });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    loadingEl.style.display = 'none';
  },

  // PROGRESS (optional)
  undefined,

  // ERROR
  () => {
    loadingEl.style.display = 'none';
    errorEl.style.display = 'block';
    errorEl.innerText = "Failed to load image";
  }
);

// --- Camera ---
camera.position.set(0, 0, 0.1);

// --- Controls ---
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableZoom = false;
controls.enablePan = false;
controls.enableDamping = true;
controls.dampingFactor = 0.05;

// Limit vertical tilt (feels more natural)
controls.minPolarAngle = Math.PI / 3;
controls.maxPolarAngle = 2 * Math.PI / 3;

// --- Resize handling ---
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// --- Animate ---
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

animate();