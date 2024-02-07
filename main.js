// IMPORTING UTILS
import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.121.1/examples/jsm/controls/OrbitControls.js";

//
// SIZES 
//
let sizes = { height: window.innerHeight, width: window.innerWidth };

//
// CANVAS
//
const canvas = document.querySelector("canvas");

//
// RENDERER
//
const renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
renderer.setSize(sizes.width, sizes.height);

//
// HANDLING SCREEN RESIZE
//
window.addEventListener("resize", () => {
  sizes.height = window.innerHeight;
  sizes.width = window.innerWidth;

  if (window.innerWidth <= 600) {
    mainObject.scale.set(0.5, 0.5, 0.5);
    camera.position.x = 0;
  } else {
    mainObject.scale.set(1, 1, 1);
    camera.position.x = -2;
  }
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  renderer.setSize(sizes.width, sizes.height);
});

//
// TEXTURES LOADER & TEXTURES (Particles & Shadow)
//
let textureLoader = new THREE.TextureLoader();
let particlesTexture = textureLoader.load("https://raw.githubusercontent.com/pantchayan/threejs-portfolio/master/assets/textures/star_01.png");
let shadowTexture = textureLoader.load("https://raw.githubusercontent.com/pantchayan/threejs-portfolio/master/assets/textures/simpleShadow.jpg");

//
// SCENE
//
const scene = new THREE.Scene();

//
// MAIN OBJECT {THREE.Group} - INNER + OUTER OBJECT
//
let innerObjectGeometry = new THREE.IcosahedronGeometry(1, 1);
let outerObjectGeometry = new THREE.IcosahedronGeometry(1, 1);

let innerObjectMaterial = new THREE.MeshStandardMaterial({
  color: 0xffffff,
  flatShading: true,
  side: THREE.DoubleSide
});

let outerObjectMaterial = new THREE.MeshStandardMaterial({
  color: 0xffffff,
  wireframe: true,
});

let innerObject = new THREE.Mesh(innerObjectGeometry, innerObjectMaterial);
let outerObject = new THREE.Mesh(outerObjectGeometry, outerObjectMaterial);

let mainObject = new THREE.Group();

mainObject.add(innerObject);
mainObject.add(outerObject);
scene.add(mainObject);

//
// GSAP CODE - to animate the outer-wireframe object as the page loads
//
outerObject.scale.set(1.25, 1.25, 1.25);
// setTimeout(() => {
//   gsap.to(outerObject.scale, { x: 1.25, y: 1.25, z: 1.25, duration: 1 });
// }, 2500);

// gsap.to(outerObject.scale, { x: 1.75, y: 1.75, z: 1.75, duration: 2.5 });

//
// RESIZING MAINOBJECT IF SCREEN IS SMALL
//
if (sizes.width <= 600) {
  mainObject.scale.set(0.5, 0.5, 0.5);
}

//
// CAMERA
//
const camera = new THREE.PerspectiveCamera(
  45,
  sizes.width / sizes.height,
  0.1,
  1000
);
camera.position.z = 7;
camera.position.x = -2;

//
// MAKING PROCEDURAL CLOUD MESH
//
let makecloudsMesh = () => {
  let cloudsMesh = new THREE.Group();
  let cloudPositions = [
    { x: -15, y: 7, z: 0 },
    { x: -15, y: 7, z: -15 },
    { x: 5, y: 5, z: -14 },
    { x: 15, y: 7, z: 0 },
  ];
  let cubeMaterial = new THREE.MeshBasicMaterial({ color: "white" });
  let cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
  for (let i = 0; i < 4; i++) {
    let cloud = new THREE.Group();
    for (let j = 0; j < 8; j++) {
      let cubeMesh = new THREE.Mesh(cubeGeometry, cubeMaterial);
      cubeMesh.material.color =
        j % 2 == 0 ? new THREE.Color("black") : new THREE.Color("white");
      cubeMesh.rotation.x = (Math.random() * Math.PI) / 2;
      cubeMesh.rotation.y = (Math.random() * Math.PI) / 2;
      cubeMesh.rotation.z = (Math.random() * Math.PI) / 2;
      cubeMesh.position.x = j - Math.random() * 0.1;
      let scaleRandom = Math.random();
      cubeMesh.scale.set(scaleRandom, scaleRandom, scaleRandom);
      cloud.add(cubeMesh);
    }
    cloud.position.set(
      cloudPositions[i].x,
      cloudPositions[i].y,
      cloudPositions[i].z
    );
    // cloud.position.x = Math.sin(i * Math.PI)
    cloudsMesh.add(cloud);
  }

  return cloudsMesh;
};

let cloudsMesh = makecloudsMesh();
scene.add(cloudsMesh);

//
// PLANE
//
const geometry = new THREE.PlaneGeometry(100, 50);
const material = new THREE.MeshBasicMaterial({
  color: new THREE.Color("#222"), // #ffddff
  transparent: true,
  side: THREE.DoubleSide
});
const plane = new THREE.Mesh(geometry, material);
plane.rotation.x = Math.PI / 2;
plane.position.y = -1.5;
scene.add(plane);

//
// SHADOW - Fake shadow using plane and texture
//
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
mainObjectShadow.position.y = plane.position.y + 0.01
mainObjectShadow.position.x = 0;

scene.add(mainObjectShadow);

//
// PARTICLES
//
let backgroundParticlesGeometry = new THREE.BufferGeometry();
let particlesCount = 1500;

let particlePositionsArr = new Float32Array(particlesCount * 3);

for (let i = 0; i < particlesCount * 3; i++) {
  particlePositionsArr[i] = (Math.random() - 0.5) * 10;
}

backgroundParticlesGeometry.setAttribute(
  "position",
  new THREE.BufferAttribute(particlePositionsArr, 3)
);

let backgroundParticlesMaterial = new THREE.PointsMaterial();
backgroundParticlesMaterial.wireframe = true;
backgroundParticlesMaterial.size = 0.15;
// backgroundParticlesMaterial.sizeAttenuation = true;
backgroundParticlesMaterial.transparent = true;
backgroundParticlesMaterial.alphaMap = particlesTexture;
backgroundParticlesMaterial.depthWrite = false;
backgroundParticlesMaterial.color = new THREE.Color("white");

let backgroundParticles = new THREE.Points(backgroundParticlesGeometry, backgroundParticlesMaterial);
scene.add(backgroundParticles);

//
// LIGHT
//
const directionalLight = new THREE.DirectionalLight(0xff0000, 1);
directionalLight.position.x = -5;
scene.add(directionalLight);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const hemisphereLight = new THREE.HemisphereLight(0x0000ff, 0x00ff00, 1);
scene.add(hemisphereLight);

//
// ORBIT CONTROL - Comment if not in use
//
// let controls = new OrbitControls(camera, renderer.domElement);
// controls.enableDamping = true;
// controls.dampingFactor = 0.05;

//
// HELPERS - Comment if not in use
//

// const axesHelper = new THREE.AxesHelper(5);
// scene.add(axesHelper);

// const gridHelper = new THREE.GridHelper(10, 10);
// scene.add(gridHelper);

// const directionalLightHelper = new THREE.DirectionalLightHelper(
//   directionalLight
// );
// scene.add(directionalLightHelper);

//
// DEBUG UI PANEL {ToDo: re-vamp using lil-gui}
//
// const gui = new dat.GUI();
// const cameraFolder = gui.addFolder("Camera");
// cameraFolder.add(camera.position, "x").min(-15).max(15).step(0.01);
// cameraFolder.add(camera.position, "y").min(-15).max(15).step(0.01);
// cameraFolder.add(camera.position, "z").min(-15).max(15).step(0.01);
// cameraFolder.open();

// camera.lookAt(mainObject.position);

//
// HANDLING MOUSE MOVE 
//
let mouseX = 0;
let mouseY = 0;

let onDocumentMouseMove = (event) => {
  // Scaling from - to +
  mouseX = event.clientX - (sizes.width/2);
  mouseY = event.clientY - (sizes.height/2);
};
document.addEventListener("mousemove", onDocumentMouseMove);

//
// ANIMATE FUNCTION - 
// Handles MainObject, CloudsMesh and BackgroundParticles Animation
//
let transitionHappening = false; // What do you do : Keep a track of whether a transition is happening or not, and make camera look at the object if yes
let mainObjectRotationToggleFlag = true; // What do you do : Toggles Rotation from left to right

const clock = new THREE.Clock();
let animate = () => {
  let elapsedTime = clock.getElapsedTime();

  // Main object's y position changes between [0, 0.5]
  mainObject.position.y = (1 + Math.sin(elapsedTime)) * 0.25;

  // Main object's y position will serve as a factor to accelerate rotation
  let factor = mainObject.position.y/4;

  // factor value can further be adjusted to speed up/slow down the spin
  if (mainObject.position.y > 0.5) {
    factor += 0.1;
  }

  // mainObjectRotationToggle is toggled whenever position of mainObject is close to 0
  if (mainObject.position.y <= 0.000008) {
    mainObjectRotationToggleFlag = !mainObjectRotationToggleFlag;
  }

  // condition block that manages rotation based on toggle value
  // innerObject rotates on y axis
  // outerObject rotates on y-z plane
  if (mainObjectRotationToggleFlag) {
    innerObject.rotation.y += factor * 5 * 0.05;
    outerObject.rotation.z += -1 * factor * 0.1;
    outerObject.rotation.y += -1 * factor * 0.1;
  } else {
    innerObject.rotation.y -= factor * 5 * 0.05;
    outerObject.rotation.z -= -1 * factor * 0.1;
    outerObject.rotation.y -= -1 * factor * 0.1;
  }

  // background particles animation on x-z plane
  backgroundParticles.rotation.z += 0.002;
  backgroundParticles.rotation.x += 0.002;
  
  // backgroundParticles.position.x = Math.sin(elapsedTime * 0.5)*1;
  // backgroundParticles.position.y = Math.cos(elapsedTime * 0.5)*1;

  // using cursor position to move particles on x-y plane
  let targetX = mouseX * 0.001;
  let targetY = mouseY * 0.001;
  backgroundParticles.rotation.y += 0.25 * (targetX - backgroundParticles.rotation.y);
  backgroundParticles.rotation.x += 0.25 * (targetY - backgroundParticles.rotation.x);

  if (transitionHappening) {
    camera.lookAt(mainObject.position);
  } 
  cloudsMesh.position.x = Math.sin(elapsedTime * 0.5);
  cloudsMesh.position.z = Math.cos(elapsedTime * 0.1);

  mainObjectShadow.material.opacity = 0.7 - mainObject.position.y;
  // controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
};
document.addEventListener("mousewheel", (e) => {
  // camera.position.z -= e.deltaY * 0.001;
});

let scrollPercent = 0;

document.body.onscroll = () => {
  //calculate the current scroll progress as a percentage
  scrollPercent =
    ((document.documentElement.scrollTop || document.body.scrollTop) /
      ((document.documentElement.scrollHeight || document.body.scrollHeight) -
        document.documentElement.clientHeight)) *
    100;
};

let viewNum = 0;
document.getElementById("next-view").addEventListener("click", (e) => {
  viewNum = (viewNum + 1) % 5;
  switchAnimation();
});

document.getElementById("prev-view").addEventListener("click", (e) => {
  viewNum = viewNum > 0 ? Math.abs((viewNum - 1) % 5) : -1;
  if (viewNum != -1) {
    switchAnimation();
  } else {
    viewNum = 0;
  }
});

let animateView0 = () => {
  gsap.to(camera.position, { y: 1, x: 0, z: 7 });
  camera.rotation.set(0, 0, 0);
  setTimeout(() => {
    innerObject.geometry = new THREE.IcosahedronGeometry(1, 1);

    gsap.to(innerObject.scale, { x: 1, y: 1, z: 1, duration: 1 });
    gsap.to(camera.position, { x: -2 });
    transitionHappening = false;
  }, 1000);
  gsap.to(innerObject.scale, { x: 0, y: 0, z: 0, duration: 1 });
};

let animateView1 = () => {
  transitionHappening = true;
  gsap.to(camera.position, { y: 8, x: 1, z: 0 });

  gsap.to(camera.position, { y: 5, x: 0, z: 3, delay: 1, duration: 1 });

  setTimeout(() => {
    innerObject.geometry = new THREE.TorusGeometry(0.75, 0.2, 16, 100);

    gsap.to(innerObject.scale, { x: 1, y: 1, z: 1, duration: 1 });
  }, 1000);
  gsap.to(innerObject.scale, { x: 0, y: 0, z: 0, duration: 1 });

  // hemisphereLight.color = new THREE.Color(0xff0000)
  // hemisphereLight.groundColor = new THREE.Color(0xff00ff)
  // console.log(directionalLight, hemisphereLight) // groundColor
  // console.log(directionalLight.color, hemisphereLight.color)
};

let animateView2 = () => {
  transitionHappening = true;
  gsap.to(camera.position, { y: 5, x: 0, z: -6 });
  gsap.to(camera.position, { y: 1, x: 0, z: -3, delay: 1, duration: 1 });

  setTimeout(() => {
    innerObject.geometry = new THREE.SphereGeometry(
      1,
      4,
      9,
      0,
      Math.PI * 2,
      Math.PI * 2,
      Math.PI * 2
    );

    gsap.to(innerObject.scale, { x: 1, y: 1, z: 1, duration: 1 });
  }, 1000);
  gsap.to(innerObject.scale, { x: 0, y: 0, z: 0, duration: 1 });
  // gsap.to(camera.position, { y: 3, x: 2, z: 0 });
  // gsap.to(camera.position, { y: 1, x: 7, z: 0, delay: 1, duration:1 });
};

let animateView3 = () => {
  transitionHappening = true;
  gsap.to(camera.position, { y: 2, x: -1.3, z: 2 });
  gsap.to(camera.position, { y: 1, x: -2, z: 5, delay: 1, duration: 1 });

  setTimeout(() => {
    innerObject.geometry = new THREE.OctahedronGeometry(1, 1);

    gsap.to(innerObject.scale, { x: 1, y: 1, z: 1, duration: 1 });
  }, 1000);
  gsap.to(innerObject.scale, { x: 0, y: 0, z: 0, duration: 1 });
};

let animateView4 = () => {
  gsap.to(camera.position, { y: 1, x: 0, z: 7 });

  setTimeout(() => {
    innerObject.geometry = new THREE.IcosahedronGeometry(1, 1);

    gsap.to(innerObject.scale, { x: 1, y: 1, z: 1, duration: 1 });

    transitionHappening = false;

    gsap.to(camera.position, { y: 1, x: 2, z: 7 });
  }, 1500);
  gsap.to(innerObject.scale, { x: 0, y: 0, z: 0, duration: 1 });
};

let switchAnimation = () => {
  if (viewNum == 0) {
    animateView0();
  } else if (viewNum == 1) {
    animateView1();
  } else if (viewNum == 2) {
    animateView2();
  } else if (viewNum == 3) {
    animateView3();
  } else if (viewNum == 4) {
    animateView4();
  }
};

// setInterval(() => {
//   document.getElementById("next-view").click();
// }, 4000);

let listenScroll = () => {
  if (scrollPercent > 0 && scrollPercent < 15 && viewNum != 0) {
    viewNum = 0;
    switchAnimation();
  } else if (scrollPercent > 20 && scrollPercent < 35 && viewNum != 1) {
    viewNum = 1;
    switchAnimation();
  } else if (scrollPercent > 45 && scrollPercent < 60 && viewNum != 2) {
    viewNum = 2;
    switchAnimation();
  } else if (scrollPercent > 60 && scrollPercent < 80 && viewNum != 3) {
    viewNum = 3;
    switchAnimation();
  } else if (scrollPercent > 85 && scrollPercent < 100 && viewNum != 4) {
    viewNum = 4;
    switchAnimation();
  }
};

setInterval(() => {
  listenScroll();
}, 500);


window.scrollTo({ top: 0, behavior: 'smooth' })
animate();