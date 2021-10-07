import * as THREE from 'three';
import * as dat from 'three/examples/jsm/libs/dat.gui.module.js';
import { fogParsVert, fogVert, fogParsFrag, fogFrag } from './src/fog/fogShader.js';

import { ImprovedNoise } from 'three/examples/jsm/math/ImprovedNoise';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

require('normalize.css/normalize.css');
require('./src/css/index.css');

var container;
var camera, controls, scene, renderer;
var mesh, terrainShader;

const worldWidth = 256,
    worldDepth = 256;
var clock = new THREE.Clock();

var params = {
    fogNearColor: 0xfc4848,
    fogHorizonColor: 0xe4dcff,
    fogDensity: 0.0025,
    fogNoiseSpeed: 100,
    fogNoiseFreq: .0012,
    fogNoiseImpact: .5
};

window.onload = function() {
    init();
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
    scene.background = new THREE.Color(params.fogHorizonColor);
    scene.fog = new THREE.FogExp2(params.fogHorizonColor, params.fogDensity);

    camera.position.set(100, 800, -800);
    camera.lookAt(-100, 810, -800);

    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    window.addEventListener("resize", onWindowResize, false);

}

//

function initObjects() {

    var data = generateHeight(worldWidth, worldDepth);

    var geometry = new THREE.PlaneBufferGeometry(
        7500,
        7500,
        worldWidth - 1,
        worldDepth - 1
    );

    geometry.rotateX(-Math.PI / 2);

    var vertices = geometry.attributes.position.array;

    for (var i = 0, j = 0, l = vertices.length; i < l; i++, j += 3) {
        vertices[j + 1] = data[i] * 10;
    }

    mesh = new THREE.Mesh(
        geometry,
        new THREE.MeshBasicMaterial({ color: new THREE.Color(0xefd1b5) })
    );

    mesh.material.onBeforeCompile = shader => {
        shader.vertexShader = shader.vertexShader.replace(
            `#include <fog_pars_vertex>`,
            fogParsVert
        );
        shader.vertexShader = shader.vertexShader.replace(
            `#include <fog_vertex>`,
            fogVert
        );
        shader.fragmentShader = shader.fragmentShader.replace(
            `#include <fog_pars_fragment>`,
            fogParsFrag
        );
        shader.fragmentShader = shader.fragmentShader.replace(
            `#include <fog_fragment>`,
            fogFrag
        );

        const uniforms = ({
            fogNearColor: { value: new THREE.Color(params.fogNearColor) },
            fogNoiseFreq: { value: params.fogNoiseFreq },
            fogNoiseSpeed: { value: params.fogNoiseSpeed },
            fogNoiseImpact: { value: params.fogNoiseImpact },
            time: { value: 0 }
        });

        shader.uniforms = THREE.UniformsUtils.merge([shader.uniforms, uniforms]);
        terrainShader = shader;
        
    };
    scene.add(mesh);
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
        terrainShader.uniforms.fogNearColor = {
            value: new THREE.Color(params.fogNearColor)
        };
    });
    gui.add(params, "fogNoiseFreq", 0, 0.01, 0.0012).onChange(function () {
        terrainShader.uniforms.fogNoiseFreq.value = params.fogNoiseFreq;
    });
    gui.add(params, "fogNoiseSpeed", 0, 1000, 100).onChange(function () {
        terrainShader.uniforms.fogNoiseSpeed.value = params.fogNoiseSpeed;
    });
    gui.add(params, "fogNoiseImpact", 0, 1).onChange(function () {
        terrainShader.uniforms.fogNoiseImpact.value = params.fogNoiseImpact;
    });

    gui.open();
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
    controls.handleResize();
}

function generateHeight(width, height) {
    var seed = Math.PI / 4;
    window.Math.random = function () {
        const x = Math.sin(seed++) * 10000;
        return x - Math.floor(x);
    };

    var size = width * height,
        data = new Uint8Array(size);
    var perlin = new ImprovedNoise(),
        quality = 1,
        z = Math.random() * 100;

    for (var j = 0; j < 4; j++) {
        for (var i = 0; i < size; i++) {
            var x = i % width,
                y = ~~(i / width);
            data[i] += Math.abs(
                perlin.noise(x / quality, y / quality, z) * quality * 1.75
            );
        }

        quality *= 5;
    }

    return data;
}

function animate() {
    requestAnimationFrame(animate);

    render();
}

function render() {
    let deltaTime = clock.getDelta();
    controls.update(deltaTime);
    renderer.render(scene, camera);

    if (terrainShader) {
        terrainShader.uniforms.time.value += deltaTime;
    }
}
