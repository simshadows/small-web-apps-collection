/*
 * Filename: index.ts
 * Author:   simshadows <contact@simshadows.com>
 * License:  GNU Affero General Public License v3 (AGPL-3.0)
 */

import "regenerator-runtime/runtime";

import * as THREE from "three";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";
import * as dat from "dat.gui";

import {generateMeshes} from "./generateMeshes";

import "./index.css";

const controlledVariables = {
    "Auto Rotate": true,
}

function updateControlledVariables() {
    controls.autoRotate = controlledVariables["Auto Rotate"];
}

function resizeCanvas() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
}

function animation() {
    updateControlledVariables();
    controls.update();
    resizeCanvas();
    renderer.render(scene, camera);
}

const camera = new THREE.PerspectiveCamera(70, window.innerWidth/window.innerHeight, 0.01, 1000);
camera.position.z = 120;
camera.position.y = 100;

const scene = new THREE.Scene();
const meshes = generateMeshes();
for (const mesh of meshes) scene.add(mesh);

const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setAnimationLoop(animation);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.autoRotateSpeed = 5;
controls.target = new THREE.Vector3(0, 80, 0);

const gui = new dat.GUI({name: "L-Systems Controller"});
gui.add(controlledVariables, "Auto Rotate");

