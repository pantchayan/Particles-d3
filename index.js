import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.121.1/examples/jsm/controls/OrbitControls.js";

let sizes = { height: window.innerHeight, width: window.innerWidth };
const canvas = document.querySelector("canvas");

// RENDERER
const renderer = new THREE.WebGLRenderer({ canvas, alpha: false });

renderer.setSize(sizes.width, sizes.height);

window.addEventListener("resize", () => {
  sizes.height = window.innerHeight;
  sizes.width = window.innerWidth;

  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  renderer.setSize(sizes.width, sizes.height);
});

// TEXTURES LOADER

let textureLoader = new THREE.TextureLoader();
let particlesTexture = textureLoader.load("/assets/png_black/star_01.png");

// SCENE
const scene = new THREE.Scene();

// CAMERA
const camera = new THREE.PerspectiveCamera(
  45,
  sizes.width / sizes.height,
  0.01,
  100
);
camera.position.z = 7;

let tetrahedronGeometry = new THREE.TetrahedronGeometry(1, 2);
let tetrahedronMaterial = new THREE.MeshStandardMaterial({ color: 0xfffffff });

let tetrahedron = new THREE.Mesh(tetrahedronGeometry, tetrahedronMaterial);

scene.add(tetrahedron);

// PARTICLES

let bgParticlesGeometry = new THREE.BufferGeometry();
let count = 1000;

let positions = new Float32Array(count * 3);

for (let i = 0; i < count * 3; i++) {
  positions[i] = (Math.random() - 0.5) * 10;
}

bgParticlesGeometry.setAttribute(
  "position",
  new THREE.BufferAttribute(positions, 3)
);

let bgParticlesMaterial = new THREE.PointsMaterial();
bgParticlesMaterial.size = 0.1;
bgParticlesMaterial.sizeAttenuation = true;
bgParticlesMaterial.transparent = true;
bgParticlesMaterial.alphaMap = particlesTexture;
bgParticlesMaterial.depthWrite = false;

let bgParticles = new THREE.Points(bgParticlesGeometry, bgParticlesMaterial);

scene.add(bgParticles);

// LIGHT
const directionalLight = new THREE.DirectionalLight(0xff0000, 1);

directionalLight.position.z = 5;

directionalLight.position.x = 2;
scene.add(directionalLight);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);

scene.add(ambientLight);

let controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

renderer.render(scene, camera);


// HELPERS
const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);

const gridHelper = new THREE.GridHelper(10, 10);
scene.add(gridHelper);

const directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight, 1)
scene.add(directionalLightHelper)


// DEBUG PANEL


let gui = new dat.GUI();

let lightFolder = gui.addFolder('Light');
let directionalLightFolder = lightFolder.addFolder('Directional Light')
let directionalLightPositions = directionalLightFolder.addFolder('Position')
directionalLightPositions.add('directionalLight.position', 'x', 0, 100)

lightFolder.open()

// ANIMATING
let prevT = Date.now();
let mode = "down";
let animate = () => {
  let currT = Date.now();
  let deltaT = currT - prevT;
  prevT = currT;

  console.log();
  if (bgParticles.position.y > 2 || mode === "down") {
    bgParticles.position.y -= 0.01;
    mode = "down";
  }

  if (bgParticles.position.y < -2 || mode === "up") {
    bgParticles.position.y += 0.01;
    mode = "up";
  }
  renderer.render(scene, camera);

  controls.update();
  requestAnimationFrame(animate);
};

document.addEventListener("mousewheel", (e) => {
  // camera.position.z -= e.deltaY * 0.001;
  // prevent scrolling beyond a min/max value
  camera.position.clampScalar(mode == 1 ? -50 : -70, 10);
});

animate();
