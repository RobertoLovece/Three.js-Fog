import * as THREE from 'three';
import * as dat from 'three/examples/jsm/libs/dat.gui.module.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

import FogPlane from './src/fog/fogPlane.js'

require('normalize.css/normalize.css');
require('./src/css/index.css');

let camera, scene, renderer;
let container, controls;
let planeMesh;

let clock = new THREE.Clock();

let params = {
    fogNearColor: 0xfc4848,
    fogHorizonColor: 0xe4dcff,
    fogDensity: 0.0025,
    fogNoiseSpeed: 100,
    fogNoiseFreq: .0012,
    fogNoiseImpact: .5
};

window.onload = function() {
    init();
    initFog();
    initObjects();
    initControls();
    initGUI();

    animate();
}

function init() {
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

    scene.background = new THREE.Color(params.fogHorizonColor);
    scene.fog = new THREE.FogExp2(params.fogHorizonColor, params.fogDensity);

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

    gui.add(params, "fogDensity", 0, 0.01).onChange(function () {
        scene.fog.density = params.fogDensity;
    });

    gui.addColor(params, "fogHorizonColor").onChange(function () {
        scene.fog.color.set(params.fogHorizonColor);
        scene.background = new THREE.Color(params.fogHorizonColor);
    });

    gui.addColor(params, "fogNearColor").onChange(function () {
        planeMesh.terrainShader.uniforms.fogNearColor = {
            value: new THREE.Color(params.fogNearColor)
        };
    });

    gui.add(params, "fogNoiseFreq", 0, 0.01, 0.0012).onChange(function () {
        planeMesh.terrainShader.uniforms.fogNoiseFreq.value = params.fogNoiseFreq;
    });

    gui.add(params, "fogNoiseSpeed", 0, 1000, 100).onChange(function () {
        planeMesh.terrainShader.uniforms.fogNoiseSpeed.value = params.fogNoiseSpeed;
    });

    gui.add(params, "fogNoiseImpact", 0, 1).onChange(function () {
        planeMesh.terrainShader.uniforms.fogNoiseImpact.value = params.fogNoiseImpact;
    });

    gui.open();
}

//

function animate() {

    let deltaTime = clock.getDelta();

    controls.update(deltaTime);

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
