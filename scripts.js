import * as THREE from 'three';
//import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js'; kaksa nyo lng ni kung gusto nyo mag pan ka scene
import { gsap } from 'gsap';

import starsTexture from '../img/stars.jpg';
import sunTexture from '../img/sun.jpg';
import mercuryTexture from '../img/mercury.jpg';
import venusTexture from '../img/venus.jpg';
import earthTexture from '../img/earth.jpg';
import marsTexture from '../img/mars.png';
import jupiterTexture from '../img/jupiter.jpg';
import saturnTexture from '../img/saturn.jpg';
import saturnRingTexture from '../img/saturn ring.png';
import uranusTexture from '../img/uranus.jpg';
import uranusRingTexture from '../img/uranus ring.png';
import neptuneTexture from '../img/neptune.jpg';
import plutoTexture from '../img/pluto.jpg';

const renderer = new THREE.WebGLRenderer();

renderer.setSize(window.innerWidth, window.innerHeight);

document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

//const orbit = new OrbitControls(camera, renderer.domElement); kwaa lng ni kung gusto mo ni himoon pannable

camera.position.set(0, 100, 600); // move up to 150 on the y-axis
camera.rotation.x = -0.15; // tilt down a bit

//orbit.update(); kwaa lng ni kung gusto mo ni himoon pannable

const ambientLight = new THREE.AmbientLight(0x333333);
scene.add(ambientLight);

const cubeTextureLoader = new THREE.CubeTextureLoader();
scene.background = cubeTextureLoader.load([
    starsTexture,
    starsTexture,
    starsTexture,
    starsTexture,
    starsTexture,
    starsTexture
]);

const textureLoader = new THREE.TextureLoader();

const sunGeo = new THREE.SphereGeometry(16, 30, 30);
const sunMat = new THREE.MeshBasicMaterial({
    map: textureLoader.load(sunTexture)
});
const sun = new THREE.Mesh(sunGeo, sunMat);
scene.add(sun);

function createPlanete(size, texture, position, ring) {
    const geo = new THREE.SphereGeometry(size, 30, 30);
    const mat = new THREE.MeshStandardMaterial({
        map: textureLoader.load(texture),
        emissiveIntensity: 1 // Increase this value to make the planet brighter
    });
    const mesh = new THREE.Mesh(geo, mat);
    const obj = new THREE.Object3D();
    obj.add(mesh);
    if(ring) {
        const ringGeo = new THREE.RingGeometry(
            ring.innerRadius,
            ring.outerRadius,
            32);
        const ringMat = new THREE.MeshBasicMaterial({
            map: textureLoader.load(ring.texture),
            side: THREE.DoubleSide
        });
        const ringMesh = new THREE.Mesh(ringGeo, ringMat);
        obj.add(ringMesh);
        ringMesh.position.x = position;
        ringMesh.rotation.x = -0.5 * Math.PI;
    }
    scene.add(obj);
    mesh.position.x = position;
    return {mesh, obj}
}


const mercury = createPlanete(3.2, mercuryTexture, 48);
const venus = createPlanete(5.5, venusTexture, 75);
const earth = createPlanete(6.8, earthTexture, 122);
const mars = createPlanete(4.6, marsTexture, 160);
const jupiter = createPlanete(14, jupiterTexture, 220);
const saturn = createPlanete(12.5, saturnTexture, 280, {
    innerRadius: 10,
    outerRadius: 20,
    texture: saturnRingTexture
});
const uranus = createPlanete(8.5, uranusTexture, 350, {
    innerRadius: 7,
    outerRadius: 12,
    texture: uranusRingTexture
});
const neptune = createPlanete(9, neptuneTexture, 410);

const pointLight = new THREE.PointLight(0xFFFFFF, 30000, 30000);

scene.add(pointLight);


function animate() {
    //Self-rotation
    sun.rotateY(0.004);
    mercury.mesh.rotateY(0.001);
    venus.mesh.rotateY(-0.002);
    earth.mesh.rotateY(0.003);
    mars.mesh.rotateY(0.0018);
    jupiter.mesh.rotateY(0.008);
    saturn.mesh.rotateY(0.0038);
    uranus.mesh.rotateY(0.003);
    neptune.mesh.rotateY(0.0032);

    //Around-sun-rotation
    mercury.obj.rotateY(0.008);
    venus.obj.rotateY(0.005);
    earth.obj.rotateY(0.003);
    mars.obj.rotateY(0.002);
    jupiter.obj.rotateY(0.001);
    saturn.obj.rotateY(0.0005);
    uranus.obj.rotateY(0.0004);
    neptune.obj.rotateY(0.0001);

    renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);

function disableUserControl() {
    document.removeEventListener('keydown', handleKeyDown);
    document.removeEventListener('mousedown', handleMouseDown);
}

function handleKeyDown(event) {
    event.preventDefault();
}

function handleMouseDown(event) {
    event.preventDefault();
}

disableUserControl();

var zoomedIn = false; //  track of the zoom state
var zoomedInPlanet = null; // store the currently zoomed-in planet

function toggleZoom(planet, xOffset, yOffset, zOffset, extraHeight = 5) {
    return function () {
      if (zoomedInPlanet !== planet) {
        gsap.to(camera.position, {
          duration: 2,
          x: planet.mesh.position.x,
          y: planet.mesh.position.y + yOffset,
          z: planet.mesh.position.z + zOffset,
          onUpdate: () => {
            updateCameraPosition(planet, xOffset, yOffset, zOffset, extraHeight);
          },
          onStart: () => {
            const startingRotation = camera.rotation.x; // Store tilt
            camera.rotation.x = 0; // Removes tilt
          },
          onComplete: () => {
            // Keep tilt removed for zoomed-in view
            zoomedInPlanet.obj.rotation.x = -startingRotation; // Applied tilt to planet's object
          }
        });
        if (zoomedInPlanet) {
          zoomedInPlanet.obj.remove(camera);
        }
        zoomedInPlanet = planet;
        planet.obj.add(camera);
      }
    };
  }
  
  



// Function to update the camera's position and ensure the planet is centered
function updateCameraPosition(planet, xOffset, yOffset, zOffset, extraHeight = 0) {
    const orbitingPlanetPosition = new THREE.Vector3().copy(planet.mesh.position);
    orbitingPlanetPosition.add(new THREE.Vector3(0, yOffset, zOffset + extraHeight));
  
    const distanceToPlanet = camera.position.distanceTo(orbitingPlanetPosition);
  
    // Center the camera on the planet's position
    const desiredCameraPosition = orbitingPlanetPosition.clone().sub(
      camera.getWorldDirection().multiplyScalar(distanceToPlanet)
    );
  
    camera.position.lerp(desiredCameraPosition, 0.1);
    camera.lookAt(planet.mesh.position);
    requestAnimationFrame(() => updateCameraPosition(planet, xOffset, yOffset, zOffset, extraHeight));
  }

// Store the initial camera position for reference
const initialCameraPosition = camera.position.clone();


// Function to handle back button zoom out (with precise restoration)
function zoomOut() {
    if (zoomedInPlanet) {
      gsap.to(camera.position, {
        duration: 2,
        x: initialCameraPosition.x,
        y: initialCameraPosition.y,  // Ensure exact y-position match
        z: initialCameraPosition.z,
        onUpdate: () => {
          updateCameraPosition(null, 0, 0, 0, 0);
        },
        onComplete: () => {
          camera.rotation.x = startingRotation; // Restore tilt after zoom-out
        }
      });
      zoomedInPlanet.obj.remove(camera);
      scene.add(camera); // Re-add camera to the scene
      zoomedInPlanet = null;
    }
  }
  
  

  // Event listener for back button
document.getElementById('back').addEventListener('click', zoomOut);


//Tween function to zoom kada planet
document.getElementById('mercuryButton').addEventListener('click', () => {
    if (!zoomedIn) {
      toggleZoom(mercury, 15, 0, 30)();
    }
  });

  document.getElementById('venusButton').addEventListener('click', () => {
    if (!zoomedIn) {
      toggleZoom(venus, 15, 0, 30)();
    }
  });

  document.getElementById('earthButton').addEventListener('click', () => {
    if (!zoomedIn) {
      toggleZoom(earth, 15, 0, 30)();
    }
  });

  document.getElementById('marsButton').addEventListener('click', () => {
    if (!zoomedIn) {
      toggleZoom(mars, 15, 0, 30)();
    }
  });

  document.getElementById('jupiterButton').addEventListener('click', () => {
    if (!zoomedIn) {
      toggleZoom(jupiter, 15, 0, 55)();
    }
  });

  document.getElementById('saturnButton').addEventListener('click', () => {
    if (!zoomedIn) {
      toggleZoom(saturn, 15, 2, 55)();
    }
  });

  document.getElementById('uranusButton').addEventListener('click', () => {
    if (!zoomedIn) {
      toggleZoom(uranus, 15, 2, 40)();
    }
  });

  document.getElementById('neptuneButton').addEventListener('click', () => {
    if (!zoomedIn) {
      toggleZoom(neptune, 15, 0, 40)();
    }
  });






//resize
window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});


