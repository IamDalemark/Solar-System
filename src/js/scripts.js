import * as THREE from 'three';
// import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js'; 
import { gsap } from 'gsap';
import {CSS2DRenderer} from 'three/examples/jsm/renderers/CSS2DRenderer.js';



import starsTexture from '../img/stars.jpg';
import sunTexture from '../img/sun.jpg';
import mercuryTexture from '../img/mercury.jpg';
import venusTexture from '../img/venus.jpg';
import earthTexture from '../img/earth.jpg';
import marsTexture from '../img/mars.png';
import jupiterTexture from '../img/jupiter.jpg';
import saturnTexture from '../img/saturn.png';
import saturnRingTexture from '../img/saturn ring.png';
import uranusTexture from '../img/uranus.png';
import uranusRingTexture from '../img/uranus ring.png';
import neptuneTexture from '../img/neptune.jpg';

import mercuryBump from '../img/mercurybump.jpg'
import venusBump from '../img/venusbump.jpg'
import earthBump from '../img/earthbump.jpg'
import marsBump from '../img/marsbump.jpg'


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

camera.position.set(0, 50, 500); // move up to 150 on the y-axis
// loading page - wieg
const loadingManager = new THREE.LoadingManager();

const audioElement = document.querySelector('audio');
audioElement.autoplay = true; // autoplay
audioElement.loop = true; // loop for background music

//loading bar
const progressBar = document.getElementById('progress-bar');
loadingManager.onProgress = function(url, loaded, total){
       progressBar.value = (loaded / total) *100;
    }
loadingManager.onError = function(url, loaded, total){
        console.error(`Error on loading: ${url}`);
    }

const progressBarContainer = document.querySelector('.progress-bar-container')
loadingManager.onLoad = function(){
        progressBarContainer.style.display = 'none';
    }



//stars background(ging cube)
const cubeTextureLoader = new THREE.CubeTextureLoader(loadingManager);
scene.background = cubeTextureLoader.load([
    starsTexture,
    starsTexture,
    starsTexture,
    starsTexture,
    starsTexture,
    starsTexture
]);

//loop for blinking stars
const numStars = 10000;
const stars = new THREE.Group();

for (let i = 0; i < numStars; i++) {
  const starGeo = new THREE.SphereGeometry(0.1);
  const starMat = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
  const star = new THREE.Mesh(starGeo, starMat);
  
  // raandomly position stars within the background
  star.position.set(
    Math.random() * 1000 - 500,
    Math.random() * 1000 - 500,
    Math.random() * 1000 - 500
  );
  
  stars.add(star);
}
//add the scene of stars
scene.add(stars);
//add the texture of the planets and Sun
const textureLoader = new THREE.TextureLoader();

//Creation of the Sun's mesh in threejs
const sunGeo = new THREE.SphereGeometry(16, 30, 30);
const sunMat = new THREE.MeshBasicMaterial({
    map: textureLoader.load(sunTexture)
});
const sun = new THREE.Mesh(sunGeo, sunMat);
scene.add(sun);

//create ng mga planets
function createPlanete(size, texture, position, ring, bumpMap, bumpScale) {
  const geo = new THREE.SphereGeometry(size, 30, 30);
  const mat = new THREE.MeshStandardMaterial({
      map: textureLoader.load(texture),
      emissiveIntensity: 1, // Increase this value to make the planet brighter
      bumpMap: bumpMap ? textureLoader.load(bumpMap) : null,
      bumpScale: bumpScale || 1, // Adjust the bump scale as needed, default to 1 if not provided
  });
    const mesh = new THREE.Mesh(geo, mat);
    const obj = new THREE.Object3D();
    obj.add(mesh);
    //condition if may ring ang planet
    if(ring) {
        const ringGeo = new THREE.RingGeometry(
            ring.innerRadius,
            ring.outerRadius,
            32);
        const ringMat = new THREE.MeshBasicMaterial({
            map: textureLoader.load(ring.texture),
            side: THREE.DoubleSide,
            emissiveIntensity: 1.5, 
            transparent: true, 
            opacity: 1 
        });
        //ring mesh creation
        const ringMesh = new THREE.Mesh(ringGeo, ringMat);
        obj.add(ringMesh);
        ringMesh.position.x = position;
        ringMesh.rotation.x = -0.5 * Math.PI;
    }
    scene.add(obj);
    mesh.position.x = position;
    return {mesh, obj}
}
//himo element sa html
let divText = document.createElement('div') //wieg
let divDescription = document.createElement('div')

//planets variable 
const mercury = createPlanete(3.2, mercuryTexture, 48, null, mercuryBump, 0.5);
const venus = createPlanete(5.5, venusTexture, 75, null, venusBump, 1.5);
const earth = createPlanete(6.8, earthTexture, 108, null, earthBump, 7);
const mars = createPlanete(4.6, marsTexture, 130, null, marsBump, 6);
const jupiter = createPlanete(14, jupiterTexture, 165);
const saturn = createPlanete(12.5, saturnTexture, 215, {
    innerRadius: 16,
    outerRadius: 24,
    texture: saturnRingTexture
});
const uranus = createPlanete(8.5, uranusTexture, 265, {
    innerRadius: 14,
    outerRadius: 17,
    texture: uranusRingTexture
});
const neptune = createPlanete(9, neptuneTexture, 295);


// audio playback
function startAudio() {
  if (guiControls.audioEnabled) {
    audioElement.play();
  } else {
    audioElement.pause();
  }
}

//NOTE -lights on -side of Sun
const pointLight = new THREE.PointLight(0xFFFFFF, 30000, 3000);
scene.add(pointLight);

//NOTE - ambient light
const ambientLight = new THREE.AmbientLight(0xffffff, 0.06);
scene.add(ambientLight);

const gui = new dat.GUI();

// GUI controls
const guiControls = {
  audioVolume: 1.0,
  rotationSpeed: 0.01,
  audioEnabled: false, 
  showOrbitPaths: true,
  stopRotation: false,
};



// Add controls to GUI
gui.add(guiControls, 'showOrbitPaths').name('Show Orbit Paths');
gui.add(guiControls, 'rotationSpeed', 0.001, 0.4).name('Rotation Speed');
gui.add(guiControls, 'stopRotation').name('Stop Rotation');
gui.add(guiControls, 'audioVolume').min(0).max(1).step(0.01).name('Audio Volume');
gui.add(guiControls, 'audioEnabled').name('Toggle Audio'); // New control


//circular paths
function createOrbitPath(radius) {
  const numSegments = 100;
  const lineLoopPoints = [];

  for (let i = 0; i <= numSegments; i++) {
    const angle = (i / numSegments) * Math.PI * 2;
    const x = radius * Math.cos(angle);
    const z = radius * Math.sin(angle);
    lineLoopPoints.push(new THREE.Vector3(x, 0, z));
  }

  const orbitPathGeometry = new THREE.BufferGeometry().setFromPoints(lineLoopPoints);
  const orbitPathMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
  const orbitPath = new THREE.Line(orbitPathGeometry, orbitPathMaterial);

  return orbitPath;
}

const mercuryOrbitPath = createOrbitPath(48);
const venusOrbitPath = createOrbitPath(75);
const earthOrbitPath = createOrbitPath(108);
const marsOrbitPath = createOrbitPath(130);
const jupiterOrbitPath = createOrbitPath(165);
const saturnOrbitPath = createOrbitPath(215);
const uranusOrbitPath = createOrbitPath(265);
const neptuneOrbitPath = createOrbitPath(295);

scene.add(mercuryOrbitPath);
scene.add(venusOrbitPath);
scene.add(earthOrbitPath);
scene.add(marsOrbitPath);
scene.add(jupiterOrbitPath);
scene.add(saturnOrbitPath);
scene.add(uranusOrbitPath);
scene.add(neptuneOrbitPath);

function updateOrbitPathsVisibility() {
  mercuryOrbitPath.visible = guiControls.showOrbitPaths;
  venusOrbitPath.visible = guiControls.showOrbitPaths;
  earthOrbitPath.visible = guiControls.showOrbitPaths;
  marsOrbitPath.visible = guiControls.showOrbitPaths;
  jupiterOrbitPath.visible = guiControls.showOrbitPaths;
  saturnOrbitPath.visible = guiControls.showOrbitPaths;
  uranusOrbitPath.visible = guiControls.showOrbitPaths;
  neptuneOrbitPath.visible = guiControls.showOrbitPaths;
}

//rotation animation
function animate() {
  if (!guiControls.stopRotation) {
    // Self-rotation
    sun.rotateY(guiControls.rotationSpeed);
    mercury.mesh.rotateY(guiControls.rotationSpeed);
    venus.mesh.rotateY(guiControls.rotationSpeed * -0.5);
    earth.mesh.rotateY(guiControls.rotationSpeed * 2);
    mars.mesh.rotateY(guiControls.rotationSpeed * 1.8);
    jupiter.mesh.rotateY(guiControls.rotationSpeed * 4);
    saturn.mesh.rotateY(guiControls.rotationSpeed * 3.8);
    uranus.mesh.rotateY(guiControls.rotationSpeed * 3);
    neptune.mesh.rotateY(guiControls.rotationSpeed * 3.2);

    // Around-sun-rotation
    mercury.obj.rotateY(guiControls.rotationSpeed * 1);
    venus.obj.rotateY(guiControls.rotationSpeed * 0.5);
    earth.obj.rotateY(guiControls.rotationSpeed * 0.3);
    mars.obj.rotateY(guiControls.rotationSpeed * 0.1);
    jupiter.obj.rotateY(guiControls.rotationSpeed * 0.07);
    saturn.obj.rotateY(guiControls.rotationSpeed * 0.04);
    uranus.obj.rotateY(guiControls.rotationSpeed * 0.02);
    neptune.obj.rotateY(guiControls.rotationSpeed * 0.009);
  }

  updateOrbitPathsVisibility();
  labelRenderer.render(scene, camera);
  renderer.render(scene, camera);

    //audio volume control
    audioElement.volume = guiControls.audioVolume;
    if (guiControls.audioEnabled && audioElement.paused) {
      audioElement.play();
    } else if (!guiControls.audioEnabled && !audioElement.paused) {
      audioElement.pause();
    }
    
   // Update audio volume
   audioElement.volume = guiControls.audioVolume;
}


renderer.setAnimationLoop(animate);



//button to show text - wieg

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

disableUserControl();//disables user controls

let zoomedIn = false; //track of the zoom state
let zoomedInPlanet = null; //zooms in the planet

//zooms in and follows the planet
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
        });
        if (zoomedInPlanet) {
          zoomedInPlanet.obj.remove(camera);
        }
        zoomedInPlanet = planet;
        planet.obj.add(camera);
      }
    };
  }
  
  



// update ya ang pwesto ka camera
function updateCameraPosition(planet, xOffset, yOffset, zOffset, extraHeight = 0) {
    const orbitingPlanetPosition = new THREE.Vector3().copy(planet.mesh.position);
    orbitingPlanetPosition.add(new THREE.Vector3(0, yOffset, zOffset + extraHeight));
  
    const distanceToPlanet = camera.position.distanceTo(orbitingPlanetPosition);
  
    //ging pa center ang camera
    const desiredCameraPosition = orbitingPlanetPosition.clone().sub(
      camera.getWorldDirection().multiplyScalar(distanceToPlanet)
    );
  
    camera.position.lerp(desiredCameraPosition, 0.1);
    camera.lookAt(planet.mesh.position);
    requestAnimationFrame(() => updateCameraPosition(planet, xOffset, yOffset, zOffset, extraHeight));
  }

//initial camera position
const initialCameraPosition = camera.position.clone();

// for zoomOut button(back)
function zoomOut() {
    if (zoomedInPlanet) {
      gsap.to(camera.position, {
        duration: 2,
        x: initialCameraPosition.x,
        y: initialCameraPosition.y,  
        z: initialCameraPosition.z,
        onUpdate: () => {
          updateCameraPosition(null, 0, 0, 0, 0);
        },
      });
      zoomedInPlanet.obj.remove(camera);
      scene.add(camera); 
      zoomedInPlanet = null;
      divText.textContent = "";
      divDescription.textContent = "";
    } else{
      window.location.href ='landingpage.html'
    }
  }
  
  //event listener for back button
document.getElementById('back').addEventListener('click', zoomOut);

// function updateTextContent(planetName, planetDescription) {
//     const title = document.getElementById('title');
//     const description = document.getElementById('description');

//     divText.textContent = planetName;
//     divText.style.marginTop = '10px';
//     divText.setAttribute('id', 'title');
//     divText.setAttribute('class', 'title');
//     title.innerHTML = ''; // Clear existing content
//     title.append(divText);

//     divDescription.textContent = planetDescription;
//     divDescription.setAttribute('id', 'description');
//     divDescription.setAttribute('class', 'description');
//     description.innerHTML = ''; // Clear existing content
//     description.append(divDescription);
// }

// Mercury Button
const mercuryButton = document.getElementById('mercuryButton');
mercuryButton.addEventListener('click', function () {
  if (!zoomedIn) {
      toggleZoom(mercury, 15, 2, 30)();
  }

  // titlechange -wieg
  divText.textContent = 'MERCURY';
  divText.setAttribute('id', 'title');
  divText.setAttribute('class', 'title');
  title.append(divText);

  // updateTextContent('MERCURY',
  //  'Mercury, the nearest planet to the sun and the smallest in our solar system, lacks moons and races around the sun faster than any other planet. Romans named it after their swift-footed messenger god due to its rapid orbit. Its surface is marked by tens of thousands of impact craters.');
});
document.getElementById('mercuryButton').addEventListener('click', function(){ //wieg
  divDescription
  // divDescription.textContent = `Mercury, the nearest planet to the sun and the smallest in our solar system, lacks moons and races around the sun faster than any other planet. Romans named it after their swift-footed messenger god due to its rapid orbit. Its surface is marked by tens of thousands of impact craters. mass = 0.33 x 10^24 diameter = 4879km density = 5429kg/m^3 gravity = 3.7 m/s^2`
  divDescription.innerHTML =`Mercury, the nearest planet to the sun and the smallest in our solar system, lacks moons and races around the sun faster than any other planet. Romans named it after their swift-footed messenger god due to its rapid orbit. Its surface is marked by tens of thousands of impact craters. <br><br> mass = 0.33 x 10^24 <br> diameter = 4879km <br> density = 5429kg/m^3 <br> gravity = 3.7 m/s^2`
  divDescription.setAttribute('id', 'description')
  divDescription.setAttribute('class', 'description')
  description.append(divDescription)
});  

// Venus Button
const venusButton = document.getElementById('venusButton');
venusButton.addEventListener('click', function () {
  if (!zoomedIn) {
      toggleZoom(venus, 15, 2, 30)();
  }

  // updateTextContent('VENUS',
  //  "Venus, shrouded in clouds and named after a goddess of love, is frequently referred to as Earth's counterpart. However, upon closer examination, Venus reveals its infernal nature. Positioned as our closest planetary neighbor, it's the second planet from the Sun and possesses a surface so scorching that it could liquefy lead. Ranking as the second planet from the Sun and sixth in size and mass within our solar system.");
});

document.getElementById('venusButton').addEventListener('click', function(){ // wieg
  divDescription
  divText.textContent = 'VENUS'
  divText.setAttribute('id', 'title')
  divText.setAttribute('class', 'title')
  title.append(divText);
});

document.getElementById('venusButton').addEventListener('click', function(){ //wieg
  divDescription
  divDescription.setAttribute('id', 'description')
  divDescription.setAttribute('class', 'description')
  // divDescription.textContent = "Venus, shrouded in clouds and named after a goddess of love, is frequently referred to as Earth's counterpart. However, upon closer examination, Venus reveals its infernal nature. Positioned as our closest planetary neighbor, it's the second planet from the Sun and possesses a surface so scorching that it could liquefy lead. Ranking as the second planet from the Sun and sixth in size and mass within our solar system. mass = 4.87 x 10^24 diameter = 12104km density = 5234kg/m^3 gravity = 8.9 m/s^2"
  divDescription.innerHTML="Venus, shrouded in clouds and named after a goddess of love, is frequently referred to as Earth's counterpart. However, upon closer examination, Venus reveals its infernal nature. Positioned as our closest planetary neighbor, it's the second planet from the Sun and possesses a surface so scorching that it could liquefy lead. Ranking as the second planet from the Sun and sixth in size and mass within our solar system. <br><br>mass= 4.87 x 10^24 <br>diameter = 12104km <br>density = 5234kg/m^3<br>gravity = 8.9 m/s^2"
  description.append(divDescription)

});  
// Earth Button
const earthButton = document.getElementById('earthButton');
earthButton.addEventListener('click', function () {
  if (!zoomedIn) {
      toggleZoom(earth, 15, 2, 30)();
  }

  // updateTextContent('EARTH',
  //  "Earth, named uniquely from Old English and Germanic origins, means 'the ground' and is the third planet from the Sun. It's called by diverse names in various languages, serving as our home and the singular known habitat for life in the solar system, distinguished by its possession of surface water.");
});


document.getElementById('earthButton').addEventListener('click', function(){ //weig
  divText.textContent = 'EARTH'
  divText.setAttribute('id', 'title')
  divText.setAttribute('class', 'title')
  title.append(divText);
});

document.getElementById('earthButton').addEventListener('click', function(){ //wieg
  divDescription
  divDescription.setAttribute('id', 'description')
  divDescription.setAttribute('class', 'description')
  divDescription.innerHTML = "Earth, named uniquely from Old English and Germanic origins, means 'the ground' and is the third planet from the Sun. It's called by diverse names in various languages, serving as our home and the singular known habitat for life in the solar system, distinguished by its possession of surface water. <br><br>mass= 5.97 x 10^24kg <br>diameter = 12,756km <br>density = 5514kg/m^3<br>gravity = 9.8 m/s^2"
  description.append(divDescription)
});

// Mars Button
const marsButton = document.getElementById('marsButton');
marsButton.addEventListener('click', function () {
    if (!zoomedIn) {
        toggleZoom(mars, 15, 2, 30)();
    }

    // updateTextContent('MARS',
    //  "Mars, a barren, rocky, and frigid world, orbits as the fourth planet from the Sun and stands as one of Earth's adjacent neighbors alongside Venus. Easily visible in the night sky, it appears as a vibrant red dot, earning its moniker, the Red Planet. Throughout history, Mars has been linked to conflict and violence due to its association with warfare and slaughter.");
});


document.getElementById('marsButton').addEventListener('click', function(){ //weig
  divText.textContent = 'MARS';
  divText.setAttribute('id', 'title');
  divText.setAttribute('class', 'title');
  title.append(divText);
});

document.getElementById('marsButton').addEventListener('click', function(){ //wieg
  divDescription;
  divDescription.setAttribute('id', 'description');
  divDescription.setAttribute('class', 'description');
  divDescription.innerHTML = "Mars, a barren, rocky, and frigid world, orbits as the fourth planet from the Sun and stands as one of Earth's adjacent neighbors alongside Venus. Easily visible in the night sky, it appears as a vibrant red dot, earning its moniker, the Red Planet. Throughout history, Mars has been linked to conflict and violence due to its association with warfare and slaughter. <br><br>mass= 0.641 x 10^24kg <br>diameter = 6,792km <br>density = 3934kg/m^3<br>gravity = 3.7 m/s^2";
  description.append(divDescription);
});

// Jupiter Button
const jupiterButton = document.getElementById('jupiterButton');
jupiterButton.addEventListener('click', function () {
    if (!zoomedIn) {
        toggleZoom(jupiter, 15, 2, 70)();
    }

    // updateTextContent('JUPITER',
    //  'Jupiter, positioned as the fifth planet from the Sun, reigns as the largest planet in our solar system, surpassing the combined mass of all other planets twofold. Its distinctive bands and whirling patterns consist of chilly, windy clouds comprising ammonia and water, suspended within an atmosphere primarily composed of hydrogen and helium.');
});
document.getElementById('jupiterButton').addEventListener('click', function(){ //weig
  divText.textContent = 'JUPITER'
  divText.setAttribute('id', 'title')
  divText.setAttribute('class', 'title')
  title.append(divText);
});

document.getElementById('jupiterButton').addEventListener('click', function(){ //wieg
  divDescription
  divDescription.setAttribute('id', 'description')
  divDescription.setAttribute('class', 'description')
  divDescription.innerHTML = 'Jupiter, positioned as the fifth planet from the Sun, reigns as the largest planet in our solar system, surpassing the combined mass of all other planets twofold. Its distinctive bands and whirling patterns consist of chilly, windy clouds comprising ammonia and water, suspended within an atmosphere primarily composed of hydrogen and helium. <br><br>mass= 1898 x 10^24kg <br>diameter = 142,984km <br>density = 687kg/m^3<br>gravity = 23.1 m/s^2'
  description.append(divDescription)
});
// Saturn Button
const saturnButton = document.getElementById('saturnButton');
saturnButton.addEventListener('click', function () {
    if (!zoomedIn) {
        toggleZoom(saturn, 15, 2, 55)();
    }

    // updateTextContent('SATURN',
    //  'Saturn, the sixth planet from the Sun and second-largest in our system, shares similarities with Jupiter as a massive gas sphere rich in hydrogen and helium. Distinguished by its unparalleled ring system, Saturn possesses a collection of moons, setting it apart from other planets in our solar system.');
});

document.getElementById('saturnButton').addEventListener('click', function(){ //weig
  divText.textContent = 'SATURN';
  divText.setAttribute('id', 'title');
  divText.setAttribute('class', 'title');
  title.append(divText);
});

document.getElementById('saturnButton').addEventListener('click', function(){ //wieg
  divDescription
  divDescription.setAttribute('id', 'description')
  divDescription.setAttribute('class', 'description')
  divDescription.innerHTML = 'Saturn, the sixth planet from the Sun and second-largest in our system, shares similarities with Jupiter as a massive gas sphere rich in hydrogen and helium. Distinguished by its unparalleled ring system, Saturn possesses a collection of moons, setting it apart from other planets in our solar system. <br><br>mass= 568 x 10^24kg <br>diameter = 120,536km <br>density = 687kg/m^3<br>gravity = 9.0 m/s^2'
  description.append(divDescription)
});
// Uranus Button
const uranusButton = document.getElementById('uranusButton');
uranusButton.addEventListener('click', function () {
    if (!zoomedIn) {
        toggleZoom(uranus, 15, 2, 40)();
    }

    // updateTextContent('URANUS',
    //  "Uranus, an ice giant akin to Neptune, is composed mainly of hot, dense icy substances such as water, methane, and ammonia, surrounding a small rocky core. Its freezing, windy climate hosts faint rings and more than two dozen moons, while its unique nearly 90-degree tilt gives it an appearance of rotating on its side.");
});
document.getElementById('uranusButton').addEventListener('click', function(){ //weig
  divText.textContent = 'URANUS';
  divText.setAttribute('id', 'title');
  divText.setAttribute('class', 'title');
  title.append(divText);
});

document.getElementById('uranusButton').addEventListener('click', function(){ //wieg
  divDescription;
  divDescription.setAttribute('id', 'description');
  divDescription.setAttribute('class', 'description');
  divDescription.innerHTML = "Neptune, the solar system's third most massive and farthest planet from the Sun, can't be seen without aid due to its extreme distance. Through a small telescope, it appears as a faint, tiny blue-green disk, showcasing its icy, windy, and remote nature, positioned significantly beyond Earth's distance from the Sun. As the sole unobservable planet without visual assistance, Neptune remains over 30 times farther from the Sun than our planet. <br><br>mass= 86.8 x 10^24kg <br>diameter = 51,118km <br>density = 1270kg/m^3<br>gravity = 8.7 m/s^2";
  description.append(divDescription);
});
// Neptune Button
const neptuneButton = document.getElementById('neptuneButton');
neptuneButton.addEventListener('click', function () {
    if (!zoomedIn) {
        toggleZoom(neptune, 15, 2, 50)();
    }

    // updateTextContent('NEPTUNE',
    //  'Neptune, the solar system\'s third most massive and farthest planet from the Sun, can\'t be seen without aid due to its extreme distance. Through a small telescope, it appears as a faint, tiny blue-green disk, showcasing its icy, windy, and remote nature, positioned significantly beyond Earth\'s distance from the Sun. As the sole unobservable planet without visual assistance, Neptune remains over 30 times farther from the Sun than our planet.');
});

document.getElementById('neptuneButton').addEventListener('click', function(){ //wieg
  divDescription;
  divDescription.setAttribute('id', 'description');
  divDescription.setAttribute('class', 'description');
  divDescription.innerHTML = 'Uranus, an ice giant akin to Neptune, is composed mainly of hot, dense icy substances such as water, methane, and ammonia, surrounding a small rocky core. Its freezing, windy climate hosts faint rings and more than two dozen moons, while its unique nearly 90-degree tilt gives it an appearance of rotating on its side. <br><br>mass= 102 x 10^24 <br>diameter = 49,528km <br>density = 1638kg/m^3<br>gravity = 11.0 m/s^2';
  description.append(divDescription);
});

document.getElementById('neptuneButton').addEventListener('click', function(){ //weig
  divText.textContent = 'NEPTUNE';
  divText.setAttribute('id', 'title');
  divText.setAttribute('class', 'title');
  title.append(divText);
});
// Add an event listener to a button or another element
document.addEventListener('click', startAudio);

//displays the all rendered scene
const labelRenderer = new CSS2DRenderer();
labelRenderer.setSize(window.innerWidth, window.innerHeight);

