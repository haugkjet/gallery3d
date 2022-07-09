import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { PointerLockControls } from "three/examples/jsm/controls//PointerLockControls.js";

//import { EXRLoader } from "three/examples/jsm/loaders/EXRLoader.js";
import { GUI } from "dat.gui";

import { ShaderMaterial } from "three";

import Stats from "three/examples/jsm/libs/stats.module";

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  70,
  window.innerWidth / window.innerHeight,
  0.1,
  1500
);
camera.position.z = 30;

var light = new THREE.AmbientLight(0x404040, 1.0);
scene.add(light);

// Init skybox
const SKY_COLOR = 0x0e0353;
const GROUND_COLOR = 0xd5f3ed;
const SKY_SIZE = 950;

const vertexShader = `
 varying vec3 vWorldPosition;
            void main() {
                vec4 worldPosition = modelMatrix * vec4( position, 1.0 );
                vWorldPosition = worldPosition.xyz;
                gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
                
            }`;
const fragmentShader = `
      uniform vec3 topColor;
            uniform vec3 bottomColor;
            varying vec3 vWorldPosition;
            void main() {
                float h = normalize( vWorldPosition).y;
                gl_FragColor = vec4( mix( bottomColor, topColor, max( h, 0.1 ) ), 1.0 );
               
            }`;

const uniforms = {
  topColor: { value: new THREE.Color(SKY_COLOR) },
  bottomColor: { value: new THREE.Color(GROUND_COLOR) },
};
const skyGeo = new THREE.SphereGeometry(SKY_SIZE, 32, 15);
const skyMat = new ShaderMaterial({
  uniforms,
  vertexShader,
  fragmentShader,
  side: THREE.BackSide,
});
const sky = new THREE.Mesh(skyGeo, skyMat);
scene.add(sky);

// Load hdr
/*new EXRLoader().load(
  "textures/forest.exr",
  function (texture: any, textureData: any) {
    //texture.mapping = THREE.EquirectangularReflectionMapping;

    //scene.background = texture; // Use hdr as background
    //scene.environment = texture; // This do the lighting

    render();
  }
);*/

// Setup renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputEncoding = THREE.sRGBEncoding;
document.body.appendChild(renderer.domElement);

// Setup PointerLockControls
// Code from examples/misc_controls_pointerlock
let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
let canJump = false;

let prevTime = performance.now();
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();

const objects: any = [];
const controls = new PointerLockControls(camera, renderer.domElement);
let raycaster = new THREE.Raycaster(
  new THREE.Vector3(),
  new THREE.Vector3(0, -1, 0),
  0,
  10
);

const blocker = document.getElementById("blocker");
const instructions = document.getElementById("instructions");
if (instructions && blocker) {
  instructions.addEventListener("click", function () {
    controls.lock();
  });

  controls.addEventListener("lock", function () {
    instructions.style.display = "none";
    blocker.style.display = "none";
  });

  controls.addEventListener("unlock", function () {
    blocker.style.display = "block";
    instructions.style.display = "";
  });
}

scene.add(controls.getObject());
const onKeyDown = function (event: any) {
  switch (event.code) {
    case "ArrowUp":
    case "KeyW":
      moveForward = true;
      break;

    case "ArrowLeft":
    case "KeyA":
      moveLeft = true;
      break;

    case "ArrowDown":
    case "KeyS":
      moveBackward = true;
      break;

    case "ArrowRight":
    case "KeyD":
      moveRight = true;
      break;

    case "Space":
      camera.position.z = 16;
      camera.position.y = 15.0;
      camera.position.x = 0.0;
      camera.lookAt(0, 10, 0);
      break;
  }
};

const onKeyUp = function (event: any) {
  switch (event.code) {
    case "ArrowUp":
    case "KeyW":
      moveForward = false;
      break;

    case "ArrowLeft":
    case "KeyA":
      moveLeft = false;
      break;

    case "ArrowDown":
    case "KeyS":
      moveBackward = false;
      break;

    case "ArrowRight":
    case "KeyD":
      moveRight = false;
      break;
  }
};

document.addEventListener("keydown", onKeyDown);
document.addEventListener("keyup", onKeyUp);

const value = "Car/Saloon/827365/1728374";
const parts = value.split("/");

// parts is now a string array, containing:
// [ "Car", "Saloon", "827365", "1728374" ]
// So you can get the requested part like this:

const interestingPart = parts[2];

// Get array dog urls
let dogUrls: string;
fetch("https://dog.ceo/api/breeds/image/random/5")
  .then((response) => response.json())
  .then((data) => {
    dogUrls = data.message;
    loadgltf(dogUrls);
  });

// Load gltf and populate frames with dog pictures from URl list
function loadgltf(dogUrls: string) {
  const loader = new GLTFLoader();
  loader.load(
    "models/gallery.glb",
    function (gltf) {
      gltf.scene.traverse(function (child) {
        console.log(child.name);
        if ((child as THREE.Mesh).isMesh) {
          const m = child as THREE.Mesh;
          objects.push(m);

          if (m.name.includes("Slot1")) {
            const texture = new THREE.TextureLoader().load(dogUrls[0]);
            let material = new THREE.MeshStandardMaterial({ map: texture });

            const parts = dogUrls[0].split("/");
            const interestingPart = parts[4];
            console.log(interestingPart);

            loadText(child, interestingPart);

            if (m.material) {
              m.material = material;
            }
          }
          if (m.name.includes("Slot2")) {
            const texture = new THREE.TextureLoader().load(dogUrls[1]);
            let material = new THREE.MeshStandardMaterial({ map: texture });

            const parts = dogUrls[1].split("/");
            const interestingPart = parts[4];
            console.log(interestingPart);

            loadText(child, interestingPart);

            if (m.material) {
              m.material = material;
            }
          }
          if (m.name.includes("Slot3")) {
            const texture = new THREE.TextureLoader().load(dogUrls[2]);
            let material = new THREE.MeshStandardMaterial({ map: texture });
            if (m.material) {
              m.material = material;
            }
            const parts = dogUrls[2].split("/");
            const interestingPart = parts[4];
            console.log(interestingPart);
            loadText(child, interestingPart);
          }
          if (m.name.includes("Slot4")) {
            const texture = new THREE.TextureLoader().load(dogUrls[3]);
            let material = new THREE.MeshStandardMaterial({ map: texture });
            if (m.material) {
              m.material = material;
            }
            const parts = dogUrls[3].split("/");
            const interestingPart = parts[4];
            console.log(interestingPart);
            loadText(child, interestingPart);
          }
          if (m.name.includes("Slot5")) {
            const texture = new THREE.TextureLoader().load(dogUrls[4]);
            let material = new THREE.MeshStandardMaterial({ map: texture });
            if (m.material) {
              m.material = material;
            }
            const parts = dogUrls[4].split("/");
            const interestingPart = parts[4];
            console.log(interestingPart);
            loadText(child, interestingPart);
          }
        }
        if ((child as THREE.Light).isLight) {
          const l = child as THREE.Light;
          l.castShadow = false;
          l.intensity = l.intensity * 0.000004; // Scaling from blender
        }
      });
      scene.add(gltf.scene);
    },
    (xhr) => {
      console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
    },
    (error) => {
      console.log(error);
    }
  );
}

import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";

function loadText(mesh: any, text: any) {
  const loader = new FontLoader();
  loader.load("helvetiker_regular.typeface.json", function (font) {
    const geometry2 = new TextGeometry(text, {
      font: font,
      size: 2.5,
      height: 1.25,
      curveSegments: 12,
      bevelEnabled: false,
    });
    const textMaterial = new THREE.MeshStandardMaterial({
      color: 0x000000, //Black
      //color: 0xffffff, //Light
    });

    var mesh3 = new THREE.Mesh(geometry2, textMaterial);
    mesh3.position.set(10, -0.4, -18.4);
    mesh3.rotation.set(-1.57, 0, 3.14);
    mesh3.scale.z = 0.001; // Trick to flatten text. Need to properly solve

    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial({ color: 0xffff00 });

    mesh.add(mesh3);
  });
}

window.addEventListener("resize", onWindowResize, false);
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  render();
  //controls.handleResize();
}

const stats = Stats();
document.body.appendChild(stats.dom);

const gui = new GUI();
const cameraFolder = gui.addFolder("Camera");
cameraFolder.add(camera.rotation, "y", -0.98, 0.98);

cameraFolder
  .add(camera, "fov", 0, 150)
  .onChange(function (newvalue) {
    camera.updateProjectionMatrix();
  })
  .name("camera.fov");
cameraFolder.open();

function animate() {
  requestAnimationFrame(animate);

  // Code from examples/misc_controls_pointerlock

  const time = performance.now();

  raycaster.ray.origin.copy(controls.getObject().position);
  raycaster.ray.origin.y -= 10;

  const intersections = raycaster.intersectObjects(objects, false);

  const onObject = intersections.length > 0;

  const delta = (time - prevTime) / 1000;

  velocity.x -= velocity.x * 10.0 * delta;
  velocity.z -= velocity.z * 10.0 * delta;

  velocity.y -= 9.8 * 100.0 * delta; // 100.0 = mass

  direction.z = Number(moveForward) - Number(moveBackward);
  direction.x = Number(moveRight) - Number(moveLeft);
  direction.normalize(); // this ensures consistent movements in all directions

  if (moveForward || moveBackward) velocity.z -= direction.z * 800.0 * delta;
  if (moveLeft || moveRight) velocity.x -= direction.x * 800.0 * delta;

  if (onObject === true) {
    velocity.y = Math.max(0, velocity.y);
    canJump = true;
  }

  controls.moveRight(-velocity.x * delta);
  controls.moveForward(-velocity.z * delta);

  controls.getObject().position.y += velocity.y * delta; // new behavior

  if (controls.getObject().position.y < 10) {
    velocity.y = 0;
    controls.getObject().position.y = 10;
    canJump = true;
  }

  prevTime = time;

  /*if (camera.rotation.y <= -0.98) {
    //console.log(camera.rotation.x);
    camera.rotation.y += 0.01;
  } else if (camera.rotation.y <= +0.98) camera.rotation.y -= 0.01;*/

  render();

  stats.update();
}

function render() {
  renderer.render(scene, camera);
}

animate();
