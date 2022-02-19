import "regenerator-runtime/runtime";

import * as THREE from "three";

import "./index.css";

const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 10);
camera.position.z = 1;

const scene = new THREE.Scene();

const geometry = new THREE.BoxGeometry(0.5, 0.2, 0.2);
const material = new THREE.MeshNormalMaterial();

const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setAnimationLoop(animation);
document.body.appendChild(renderer.domElement);

function resizeCanvas() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
}

function animation(time: number) {
    resizeCanvas();

    mesh.rotation.x = time / 2000;
    mesh.rotation.y = time / 1000;
    
    renderer.render(scene, camera);
}

