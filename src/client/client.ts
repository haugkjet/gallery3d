import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import Stats from "three/examples/jsm/libs/stats.module";
import { EXRLoader } from "three/examples/jsm/loaders/EXRLoader.js";
import { GUI } from "dat.gui";

import { ShaderMaterial, Vector2, Vector3 } from "three";

const params = {
  exposure: 1.5,
};

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 15;
camera.position.y = 7;

const light = new THREE.DirectionalLight(0xffffff, 1.0);
light.position.set(12, 12, 7);
light.castShadow = true; // default false
light.shadow.normalBias = 1e-2;
light.shadow.bias = -1e-3;

light.shadow.mapSize.width = 1024;
light.shadow.mapSize.height = 1024;
light.shadow.camera.near = 0.5;
light.shadow.camera.far = 100;

// Camera
scene.add(light);

const SKY_COLOR = 0x0e0353;
const GROUND_COLOR = 0xd5f3ed;
const SKY_SIZE = 100;

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
    // memorial.exr is NPOT

    //console.log( textureData );
    //console.log( texture );

    // EXRLoader sets these default settings
    //texture.generateMipmaps = false;
    //texture.minFilter = Lihttps://www.google.com/search?q=git+add&oq=git+add&aqs=chrome..69i57j0i512l6j69i60.1217j0j7&client=ubuntu&sourceid=chrome&ie=UTF-8nearFilter;
    //texture.magFilter = LinearFilter;

    /*const material = new THREE.MeshBasicMaterial({ map: texture });

    const quad = new THREE.PlaneGeometry(
      (1.5 * textureData.width) / textureData.height,
      1.5
    );

    const mesh = new THREE.Mesh(quad, material);*/
    texture.mapping = THREE.EquirectangularReflectionMapping;

    //scene.background = texture; // Use hdr as background
    scene.environment = texture; // This do the lighting

    render();
  }
);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
//controls.enableDamping = true;

//Light theme
//scene.background = new THREE.Color(0xd9d9d9);

const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshBasicMaterial({
  color: 0x00ff00,
  wireframe: true,
});

const loader = new GLTFLoader();
loader.load(
  "models/gallery.glb",
  function (gltf) {
    gltf.scene.traverse(function (child) {
      if ((child as THREE.Mesh).isMesh) {
        const m = child as THREE.Mesh;
        m.receiveShadow = true;
        m.castShadow = true;
      }
      if ((child as THREE.Light).isLight) {
        const l = child as THREE.Light;
        l.castShadow = true;
        l.shadow.bias = -0.003;
        l.shadow.mapSize.width = 2048;
        l.shadow.mapSize.height = 2048;
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
}

const stats = Stats();
document.body.appendChild(stats.dom);

const gui = new GUI();
const LightFolder = gui.addFolder("Light");
LightFolder.add(light.position, "x", -30, 30);
LightFolder.add(light.position, "y", -30, 30);
LightFolder.add(light.position, "z", -30, 30);
LightFolder.open();
const cameraFolder = gui.addFolder("Camera");
cameraFolder.add(camera.position, "z", 0, 10);
cameraFolder.open();

function animate() {
  requestAnimationFrame(animate);

  //  cube.rotation.x += 0.01;
  //  cube.rotation.y += 0.01;

  stats.update();

  render();
}

function render() {
  renderer.render(scene, camera);
}

animate();
