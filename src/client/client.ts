import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

import { PointerLockControls } from "three/examples/jsm/controls//PointerLockControls.js";
import Stats from "three/examples/jsm/libs/stats.module";
import { EXRLoader } from "three/examples/jsm/loaders/EXRLoader.js";
import { GUI } from "dat.gui";

import { ShaderMaterial, Vector2, Vector3 } from "three";
import { mapLinear } from "three/src/math/MathUtils";

const params = {
  exposure: 0.5,
};

const scene = new THREE.Scene();

const clock = new THREE.Clock(true);

const camera = new THREE.PerspectiveCamera(
  70,
  window.innerWidth / window.innerHeight,
  0.1,
  1500
);
camera.position.z = 30;

var light = new THREE.AmbientLight(0x404040, 1.0);
scene.add(light);

let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
let canJump = false;

let prevTime = performance.now();
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();
const vertex = new THREE.Vector3();
const color = new THREE.Color();

const objects: any = [];

/*const light = new THREE.DirectionalLight(0xffffff, 1.0);
light.position.set(12, 12, 7);
light.castShadow = true; // default false
light.shadow.normalBias = 1e-2;
light.shadow.bias = -1e-3;

light.shadow.mapSize.width = 1024;
light.shadow.mapSize.height = 1024;
light.shadow.camera.near = 0.5;
light.shadow.camera.far = 100;

// Camera
scene.add(light);*/

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
new EXRLoader().load(
  "textures/forest.exr",
  function (texture: any, textureData: any) {
    //texture.mapping = THREE.EquirectangularReflectionMapping;

    //scene.background = texture; // Use hdr as background
    //scene.environment = texture; // This do the lighting

    render();
  }
);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
//renderer.physicallyCorrectLights = true;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

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

//controls.lookAt( scene.position );
//renderer.toneMapping = THREE.ReinhardToneMapping;
//renderer.toneMappingExposure = params.exposure;

renderer.outputEncoding = THREE.sRGBEncoding;

document.body.appendChild(renderer.domElement);

//const controls = new OrbitControls(camera, renderer.domElement);
//controls.enableDamping = true;

//Light theme
//scene.background = new THREE.Color(0xd9d9d9);

const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshBasicMaterial({
  color: 0x00ff00,
  wireframe: true,
});

// Init
// Make empty array to contain urls
let dogUrl1: any;

fetch("https://dog.ceo/api/breeds/image/random")
  .then((response) => response.json())
  .then((data) => {
    dogUrl1 = data.message;
    console.log(dogUrl1);
  });

let dogUrl2: any;

fetch("https://dog.ceo/api/breeds/image/random")
  .then((response) => response.json())
  .then((data) => {
    dogUrl2 = data.message;
    console.log(dogUrl2);
  });

let dogUrl3: any;

fetch("https://dog.ceo/api/breeds/image/random")
  .then((response) => response.json())
  .then((data) => {
    dogUrl3 = data.message;
    console.log(dogUrl3);
  });

let dogUrl4: any;

fetch("https://dog.ceo/api/breeds/image/random")
  .then((response) => response.json())
  .then((data) => {
    dogUrl4 = data.message;
    console.log(dogUrl5);
  });

let dogUrl5: any;

fetch("https://dog.ceo/api/breeds/image/random")
  .then((response) => response.json())
  .then((data) => {
    dogUrl5 = data.message;
    console.log(dogUrl5);
  });

// Read 5 entries from dogs api and push the result (parse to find url) to the array.
// Use the URLs from the table in slot1 to 5.

const loader = new GLTFLoader();
loader.load(
  "models/gallery.glb",
  function (gltf) {
    gltf.scene.traverse(function (child) {
      console.log(child.name);
      if ((child as THREE.Mesh).isMesh) {
        const m = child as THREE.Mesh;
        m.receiveShadow = true;
        m.castShadow = true;
        objects.push(m);

        if (m.name.includes("Slot1")) {
          const texture = new THREE.TextureLoader().load(
            "https://source.unsplash.com/random/?dog"
          );
          let material = new THREE.MeshStandardMaterial({ map: texture });
          if (m.material) {
            m.material = material;
          }

          m.receiveShadow = true;
          m.userData.ground = true;
        }

        if (m.name.includes("Slot2")) {
          const texture = new THREE.TextureLoader().load(dogUrl2);
          let material = new THREE.MeshStandardMaterial({ map: texture });
          if (m.material) {
            m.material = material;
          }

          m.receiveShadow = true;
          m.userData.ground = true;
        }
        if (m.name.includes("Slot3")) {
          const texture = new THREE.TextureLoader().load(dogUrl3);
          let material = new THREE.MeshStandardMaterial({ map: texture });
          if (m.material) {
            m.material = material;
          }
        }
        if (m.name.includes("Slot4")) {
          const texture = new THREE.TextureLoader().load(dogUrl4);
          let material = new THREE.MeshStandardMaterial({ map: texture });
          if (m.material) {
            m.material = material;
          }

          m.receiveShadow = true;
          m.userData.ground = true;
        }
        if (m.name.includes("Slot5")) {
          const texture = new THREE.TextureLoader().load(dogUrl5);
          let material = new THREE.MeshStandardMaterial({ map: texture });
          if (m.material) {
            m.material = material;
          }

          m.receiveShadow = true;
          m.userData.ground = true;
        }
      }
      if ((child as THREE.Light).isLight) {
        const l = child as THREE.Light;
        l.castShadow = false;
        l.intensity = l.intensity * 0.000004; // Scaling from blender
        l.shadow.bias = -0.003;
        l.shadow.mapSize.width = 1028;
        l.shadow.mapSize.height = 1028;
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

//const gui = new GUI();
/*const LightFolder = gui.addFolder("Light");
LightFolder.add(light.position, "x", -30, 30);
LightFolder.add(light.position, "y", -30, 30);
LightFolder.add(light.position, "z", -30, 30);
LightFolder.open();*/
/*const cameraFolder = gui.addFolder("Camera");
cameraFolder.add(camera.position, "z", 0, 10);

cameraFolder
  .add(camera, "fov", 0, 150)
  .onChange(function (newvalue) {
    camera.updateProjectionMatrix();
  })
  .name("camera.fov");
cameraFolder.open();*/

function animate() {
  requestAnimationFrame(animate);

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

  render();

  stats.update();
}

function render() {
  renderer.render(scene, camera);
}

animate();
