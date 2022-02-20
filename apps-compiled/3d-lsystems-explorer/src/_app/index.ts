/*
 * Filename: index.ts
 * Author:   simshadows <contact@simshadows.com>
 * License:  GNU Affero General Public License v3 (AGPL-3.0)
 */

import "regenerator-runtime/runtime";

import * as THREE from "three";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";

import {generateMeshes} from "./generateMeshes";

import "./index.css";

function getSimpleBox() {
    return new THREE.Mesh(
        new THREE.BoxGeometry(8.0, 0.8, 8.0),
        new THREE.MeshNormalMaterial(),
    );
}

function resizeCanvas() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
}

function animation() {
    controls.update();
    resizeCanvas();
    renderer.render(scene, camera);
}

const meshes = [
    getSimpleBox(), // Drawing a simple box to indicate the origin
    ...generateMeshes(),
];

const camera = new THREE.PerspectiveCamera(70, window.innerWidth/window.innerHeight, 0.01, 1000);
camera.position.z = 120;
camera.position.y = 100;

const scene = new THREE.Scene();
for (const mesh of meshes) scene.add(mesh);

const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setAnimationLoop(animation);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.autoRotate = true;
controls.autoRotateSpeed = 5;
controls.target = new THREE.Vector3(0, 80, 0);

