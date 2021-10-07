import * as THREE from 'three';
import * as dat from 'three/examples/jsm/libs/dat.gui.module.js';
import Stats from 'three/examples/jsm/libs/stats.module.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

import {FOGPARAMS} from  './src/const.js'

import FogPlane from './src/fog/fogPlane.js'

require('normalize.css/normalize.css');
require('./src/css/index.css');

//

let camera, scene, renderer;
let container, controls, stats;
let planeMesh;

let clock = new THREE.Clock();

//

window.onload = function() {
    
    initScene();
    initFog();

    initObjects();

    initControls();
    initStats();
    initGUI();

    animate();
}

//

function initScene() {
    container = document.getElementById('canvas');

    camera = new THREE.PerspectiveCamera(
        60,
        window.innerWidth / window.innerHeight,
        1,
        10000
    );

    scene = new THREE.Scene();

    camera.position.set(100, 800, -800);
    camera.lookAt(-100, 810, -800);

    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

}

//

function initFog() {

    scene.background = new THREE.Color(FOGPARAMS.fogHorizonColor);
    scene.fog = new THREE.FogExp2(FOGPARAMS.fogHorizonColor, FOGPARAMS.fogDensity);

}

//

function initObjects() {

    planeMesh = new FogPlane(true);
    scene.add(planeMesh);

}

//

function initControls() {
    controls = new OrbitControls(camera, renderer.domElement);

    controls.enablePan = true;
    controls.enableZoom = true;
    controls.enableRotate = true;
}

//

function initGUI() {

    var gui = new dat.GUI();

    gui.add(FOGPARAMS, "fogDensity", 0, 0.01).onChange(function () {
        scene.fog.density = FOGPARAMS.fogDensity;
    });

    gui.addColor(FOGPARAMS, "fogHorizonColor").onChange(function () {
        scene.fog.color.set(FOGPARAMS.fogHorizonColor);
        scene.background = new THREE.Color(FOGPARAMS.fogHorizonColor);
    });

    gui.addColor(FOGPARAMS, "fogNearColor").onChange(function () {
        planeMesh.terrainShader.uniforms.fogNearColor = {
            value: new THREE.Color(FOGPARAMS.fogNearColor)
        };
    });

    gui.add(FOGPARAMS, "fogNoiseFreq", 0, 0.01, 0.0012).onChange(function () {
        planeMesh.terrainShader.uniforms.fogNoiseFreq.value = FOGPARAMS.fogNoiseFreq;
    });

    gui.add(FOGPARAMS, "fogNoiseSpeed", 0, 1000, 100).onChange(function () {
        planeMesh.terrainShader.uniforms.fogNoiseSpeed.value = FOGPARAMS.fogNoiseSpeed;
    });

    gui.add(FOGPARAMS, "fogNoiseImpact", 0, 1).onChange(function () {
        planeMesh.terrainShader.uniforms.fogNoiseImpact.value = FOGPARAMS.fogNoiseImpact;
    });

    gui.open();
}

//

function initStats() {

    var axesHelper = new THREE.AxesHelper( 5 );
    scene.add( axesHelper );

    stats = new Stats();
    document.body.appendChild(stats.dom);

}

//

function animate() {

    let deltaTime = clock.getDelta();

    controls.update(deltaTime);
    stats.update();

    planeMesh.update(deltaTime);

    renderer.render(scene, camera);
    requestAnimationFrame(animate);

}

// EVENT LISTENERS

window.addEventListener("resize", onWindowResize, false);

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
    controls.handleResize();
}
