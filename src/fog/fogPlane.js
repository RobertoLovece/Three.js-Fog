import * as THREE from 'three';
import { ImprovedNoise } from 'three/examples/jsm/math/ImprovedNoise';

import { fogParsVert, fogVert, fogParsFrag, fogFrag } from './shader/fogShader.js';
import {FOGPARAMS, WORLDWIDTH, WORLDDEPTH} from  '../../src/const.js'

//

export default class FogPlane extends THREE.Mesh {

    //

    constructor(noise) {

        super();

        this.geometry = this.initGeometry(noise);
        // this.terrainShader is created here too
        this.material = this.initMaterial();

    }

    //

    initGeometry(noise) {

        let geometry = new THREE.PlaneBufferGeometry(
            7500,
            7500,
            WORLDWIDTH - 1,
            WORLDDEPTH - 1
        );

        geometry.rotateX(-Math.PI / 2);

        if (noise == true) {
            var vertices = geometry.attributes.position.array;

            var data = this.generateHeight(WORLDWIDTH, WORLDDEPTH);

            for (var i = 0, j = 0, l = vertices.length; i < l; i++, j += 3) {
                vertices[j + 1] = data[i] * 10;
            }
        }

        return geometry
    }

    //

    initMaterial() {

        let material = new THREE.MeshBasicMaterial({ 
            color: new THREE.Color(0xefd1b5) 
        });

        material.onBeforeCompile = shader => {
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
                fogNearColor: { value: new THREE.Color( FOGPARAMS.fogNearColor ) },
                fogNoiseFreq: { value: FOGPARAMS.fogNoiseFreq },
                fogNoiseSpeed: { value: FOGPARAMS.fogNoiseSpeed },
                fogNoiseImpact: { value: FOGPARAMS.fogNoiseImpact },
                time: { value: 0 }
            });
    
            shader.uniforms = THREE.UniformsUtils.merge([shader.uniforms, uniforms]);

            this.terrainShader = shader;
        }

        return material;

    }
    
    //

    generateHeight(width, height) {
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

    //

    update(deltaTime) {
        if (this.terrainShader) {
            this.terrainShader.uniforms.time.value += deltaTime;
        }
    }
}