import "regenerator-runtime/runtime";

import * as THREE from "three";

import "./index.css";

function getCustomMesh() {
    const points = [
        new THREE.Vector3(-1, 0, 0),
        new THREE.Vector3(0, 1, 0),
        new THREE.Vector3(1, 0, 0),
    ];
    return new THREE.Mesh(
        new THREE.BufferGeometry().setFromPoints(points),
        new THREE.LineBasicMaterial({color: 0x0000ff}),
    );
}

function getSimpleCylinder() {
    const radius = 0.1;
    return new THREE.Mesh(
        new THREE.CylinderGeometry(radius, radius, 2.0, 20),
        new THREE.MeshNormalMaterial(),
    );
}

function getSimpleBox() {
    return new THREE.Mesh(
        new THREE.BoxGeometry(1.0, 0.4, 0.4),
        new THREE.MeshNormalMaterial(),
    );
}

const meshes = [
    getSimpleBox(),
    getCustomMesh(),
    getSimpleCylinder(),
];

const camera = new THREE.PerspectiveCamera(70, window.innerWidth/window.innerHeight, 0.01, 10);
camera.position.z = 2;

const scene = new THREE.Scene();
for (const mesh of meshes) scene.add(mesh);

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

    for (const mesh of meshes) {
        mesh.rotation.x = time / 2000;
        mesh.rotation.y = time / 1000;
    }
    
    renderer.render(scene, camera);
}

