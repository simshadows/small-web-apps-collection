import "regenerator-runtime/runtime";

import * as THREE from "three";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";

import "./index.css";

function getSimpleCylinder() {
    const radius = 0.1;
    return new THREE.Mesh(
        new THREE.CylinderGeometry(radius, radius, 10.0, 20),
        new THREE.MeshNormalMaterial(),
    );
}

function getSimpleBox() {
    return new THREE.Mesh(
        new THREE.BoxGeometry(2.0, 0.8, 0.8),
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
    getSimpleBox(),
    getSimpleCylinder(),
];

const camera = new THREE.PerspectiveCamera(70, window.innerWidth/window.innerHeight, 0.01, 100);
camera.position.z = 10;

const scene = new THREE.Scene();
for (const mesh of meshes) scene.add(mesh);

const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setAnimationLoop(animation);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.autoRotate = true;
controls.autoRotateSpeed = 5;

