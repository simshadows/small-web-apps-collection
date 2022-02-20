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

let gui: dat.GUI;

function setUpGUI() {
    gui = new dat.GUI({name: "L-Systems Controller"});
    gui.add(guiVariables, "Auto Rotate");
    gui.add(guiVariables, "Axis Rot. Angle", 0, 180, 1)
        .onFinishChange(() => {rerender = true;});
    gui.add(guiResetVariable, "Reset");
}

let rerender = true;
let guiVariables = getDefaultGUIVariables();
const guiResetVariable = {
    "Reset": () => {
        if (!confirm("Are you sure you want to reset the app?")) return;
        guiVariables = getDefaultGUIVariables();
        setScene();
        gui.destroy();
        setUpGUI();
    },
}

let scene: THREE.Scene;

function getDefaultGUIVariables() {
    return {
        "Auto Rotate": true,
        "Axis Rot. Angle": 30,
    };
}
function updateGUIVariables() {
    controls.autoRotate = guiVariables["Auto Rotate"];
}

function resizeCanvas() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
}

function setScene() {
    scene = new THREE.Scene();
    const meshes = generateMeshes({
        axisRotationAngleDeg: guiVariables["Axis Rot. Angle"],
    });
    for (const mesh of meshes) scene.add(mesh);
}

function animation() {
    if (rerender) {
        setScene();
        rerender = false;
    }
    updateGUIVariables();
    controls.update();
    resizeCanvas();
    renderer.render(scene, camera);
}

const camera = new THREE.PerspectiveCamera(70, window.innerWidth/window.innerHeight, 0.01, 1000);
camera.position.z = 120;
camera.position.y = 100;

const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setAnimationLoop(animation);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.autoRotateSpeed = 5;
controls.target = new THREE.Vector3(0, 80, 0);

setUpGUI();

