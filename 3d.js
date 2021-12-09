import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.121.1/examples/jsm/controls/OrbitControls.js";

let sizes = { height: window.innerHeight, width: window.innerWidth };
const canvas = document.querySelector("canvas");
let transitionHappening = false;
// RENDERER
const renderer = new THREE.WebGLRenderer({ canvas, alpha: true });

renderer.setSize(sizes.width, sizes.height);

window.addEventListener("resize", () => {
  sizes.height = window.innerHeight;
  sizes.width = window.innerWidth;

  if (window.innerWidth <= 600) {
    mainObject.scale.set(0.5, 0.5, 0.5);
    console.log("Small");
  } else {
    mainObject.scale.set(1, 1, 1);
  }
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  renderer.setSize(sizes.width, sizes.height);
});

// TEXTURES LOADER

let textureLoader = new THREE.TextureLoader();
let particlesTexture = textureLoader.load("/assets/textures/star_01.png");
let shadowTexture = textureLoader.load("/assets/textures/simpleShadow.jpg");

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
camera.position.y = 2;

// ELEMENTS

let innerObjectGeometry = new THREE.IcosahedronGeometry(1, 1);
let outerObjectGeometry = new THREE.IcosahedronGeometry(1, 1);

let innerObjectMaterial = new THREE.MeshStandardMaterial({
  color: 0xffffff,
  flatShading: true,
});

let outerObjectMaterial = new THREE.MeshStandardMaterial({
  color: 0xffffff,
  wireframe: true,
  side: THREE.DoubleSide,
});

let innerObject = new THREE.Mesh(innerObjectGeometry, innerObjectMaterial);
let outerObject = new THREE.Mesh(outerObjectGeometry, outerObjectMaterial);

outerObject.scale.set(0, 0, 0);
setTimeout(() => {
  gsap.to(outerObject.scale, { x: 1.25, y: 1.25, z: 1.25, duration: 1 });
}, 2500);
// outerObject.geometry.scale.set(1.25)
gsap.to(outerObject.scale, { x: 1.75, y: 1.75, z: 1.75, duration: 2.5 });

let mainObject = new THREE.Group();
mainObject.add(innerObject);
mainObject.add(outerObject);
if (window.innerWidth <= 600) {
  mainObject.scale.set(0.5, 0.5, 0.5);
  console.log("Small");
}
scene.add(mainObject);

// PLANE
const geometry = new THREE.PlaneGeometry(100, 15);
const material = new THREE.MeshBasicMaterial({
  color: new THREE.Color("#ffddff"), // #eeeeee
  transparent: true,
  side: THREE.DoubleSide,
});
const plane = new THREE.Mesh(geometry, material);
plane.rotation.x = Math.PI / 2;
plane.position.y = -1.5;
plane.position.z = 0;

mainObject.castShadow = true;

scene.add(plane);

// SHADOW

const mainObjectShadow = new THREE.Mesh(
  new THREE.PlaneBufferGeometry(1.5, 1.5),
  new THREE.MeshBasicMaterial({
    color: 0x000000,
    transparent: true,
    alphaMap: shadowTexture,
    opacity: 1,
  })
);
mainObjectShadow.rotation.x = -Math.PI * 0.5;
mainObjectShadow.position.y = plane.position.y + 0.01;
mainObjectShadow.position.x = 0;

scene.add(mainObjectShadow);

// PARTICLES

let bgParticlesGeometry = new THREE.BufferGeometry();
let count = 1500;

let positions = new Float32Array(count * 3);

for (let i = 0; i < count * 3; i++) {
  positions[i] = (Math.random() - 0.5) * 15;
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
bgParticlesMaterial.color = new THREE.Color("white");

let bgParticles = new THREE.Points(bgParticlesGeometry, bgParticlesMaterial);

scene.add(bgParticles);

// LIGHT
const directionalLight = new THREE.DirectionalLight(0xff0000, 1);
directionalLight.position.x = -5;
scene.add(directionalLight);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const hemisphereLight = new THREE.HemisphereLight(0x0000ff, 0x00ff00, 1);
scene.add(hemisphereLight);

// CONTROLS
// let controls = new OrbitControls(camera, renderer.domElement);
// controls.enableDamping = true;
// controls.dampingFactor = 0.05;

renderer.render(scene, camera);

// HELPERS
// const axesHelper = new THREE.AxesHelper(5);
// scene.add(axesHelper);

// const gridHelper = new THREE.GridHelper(10, 10);
// scene.add(gridHelper);

// const directionalLightHelper = new THREE.DirectionalLightHelper(
//   directionalLight
// );
// scene.add(directionalLightHelper);

// DEBUG PANEL
const gui = new dat.GUI();
const cameraFolder = gui.addFolder("Camera");
cameraFolder.add(camera.position, "x").min(-15).max(15).step(0.01);
cameraFolder.add(camera.position, "y").min(-15).max(15).step(0.01);
cameraFolder.add(camera.position, "z").min(-15).max(15).step(0.01);
cameraFolder.open();

camera.lookAt(mainObject.position);

// MOUSE

let mouseX = 0;
let mouseY = 0;
let targetX = 0;
let targetY = 0;

const windowX = window.innerWidth / 2;
const windowY = window.innerHeight / 2;

let onDocumentMouseMove = (event) => {
  mouseX = event.clientX - windowX;
  mouseY = event.clientY - windowY;
};
document.addEventListener("mousemove", onDocumentMouseMove);

// ANIMATING
const clock = new THREE.Clock();
let rotationMode = true;
let animate = () => {
  let elapsedTime = clock.getElapsedTime();

  mainObject.position.y = (1 + Math.sin(elapsedTime)) * 0.25;
  let factor = 1 * mainObject.position.y;
  if (mainObject.position.y > 0.5) {
    factor += 0.1;
  }
  if (mainObject.position.y <= 0.000008) {
    rotationMode = !rotationMode;
  }

  if (rotationMode) {
    innerObject.rotation.y += factor * 5 * 0.05;
    outerObject.rotation.z += -1 * factor * 0.1;
    outerObject.rotation.y += -1 * factor * 0.1;
  } else {
    innerObject.rotation.y -= factor * 5 * 0.05;
    outerObject.rotation.z -= -1 * factor * 0.1;
    outerObject.rotation.y -= -1 * factor * 0.1;
  }

  bgParticles.rotation.z += 0.005;
  bgParticles.rotation.x += 0.005;

  targetX = mouseX * 0.001;
  targetY = mouseY * 0.001;
  bgParticles.rotation.y += 0.5 * (targetX - bgParticles.rotation.y);

  if (transitionHappening) {
    camera.lookAt(mainObject.position);
  }

  mainObjectShadow.material.opacity = 0.7 - mainObject.position.y;
  // bgParticles.rotation.x += 0.5 * (targetY - bgParticles.rotation.x);
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
};

document.addEventListener("mousewheel", (e) => {
  camera.position.z -= e.deltaY * 0.001;
  // prevent scrolling beyond a min/max value
  camera.position.clampScalar(mode == 1 ? -50 : -70, 10);
});

let view = 1;
document.getElementById("view-change").addEventListener("click", (e) => {
  view = (view + 1) % 5;
  handleAnimations()
});

let handleAnimations = () => {
  if (view == 2) {
    animate2();
  } else if (view == 3) {
    animate3();
  }
  else if(view == 4){
    animate4();
  }
}

let animate2 = () => {
  transitionHappening = true;
  gsap.to(camera.position, { y: 8, x: 0, z: 0  });
  // directionalLight.color = new THREE.Color(0x00ff00)
  hemisphereLight.color = new THREE.Color(0xff0000)
  hemisphereLight.groundColor = new THREE.Color(0xff00ff)
  console.log(directionalLight, hemisphereLight) // groundColor
  console.log(directionalLight.color, hemisphereLight.color)
};

let animate3 = () => {
  transitionHappening = true;
  gsap.to(camera.position, { y: 1, x: -7, z: 0 });
};

let animate4 = () => {
  
  transitionHappening = true;
  gsap.to(camera.position, { y: 2, x: -1.3, z: 2 });
}

animate();
