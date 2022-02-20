/*
 * Filename: index.ts
 * Author:   simshadows <contact@simshadows.com>
 * License:  GNU Affero General Public License v3 (AGPL-3.0)
 */

import "regenerator-runtime/runtime";

import * as THREE from "three";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";

import {
    guiValues,
    setSceneResetHandler,
} from "./gui";
import {processLSystem} from "./lsystems";
import {generateMeshes} from "./generateMeshes";

import "./index.css";

setSceneResetHandler(setScene);

let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let controls: OrbitControls;

function resizeCanvas() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
}

function setScene(resetCamera: boolean = false) {
    const gv = guiValues();

    let sequence = processLSystem(gv["Axiom"], gv.rules, gv["Depth"], Math.floor(gv["Sequence Max."]));
    console.log(`Final Sequence: ${sequence}`);
    console.log(`Final Sequence Length: ${sequence.length}`);

    scene = new THREE.Scene();
    const meshes = generateMeshes({
        specString:               sequence,

        segmentLength:            gv["Segment Length"],

        initialDirectionX:        gv["Start Direction X"],
        initialDirectionY:        gv["Start Direction Y"],
        initialDirectionZ:        gv["Start Direction Z"],

        axisRotationAngleDeg:     gv["Axis Rotation"],
        verticalRotationAngleDeg: gv["Vertical Rotation"],

        initialThickness:         gv["Thickness Init."],
        thicknessModifier:        gv["Thickness Mod."],

        baseWidth:                gv["Base Width"],
    });
    for (const mesh of meshes) scene.add(mesh);

    if (resetCamera) {
        camera = new THREE.PerspectiveCamera(70, window.innerWidth/window.innerHeight, 0.01, 10000);
        camera.position.z = 120;
        camera.position.y = 100;

        if (controls) controls.dispose();
        controls = new OrbitControls(camera, renderer.domElement);
        controls.autoRotateSpeed = 2;
        controls.target = new THREE.Vector3(0, 80, 0);
    }
}

function animation() {
    controls.autoRotate = guiValues()["Auto-Rotate"];
    controls.update();
    resizeCanvas();
    renderer.render(scene, camera);
}

const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setAnimationLoop(animation);
document.body.appendChild(renderer.domElement);

setScene(true);

