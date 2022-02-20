/*
 * Filename: generateMesh.ts
 * Author:   simshadows <contact@simshadows.com>
 * License:  GNU Affero General Public License v3 (AGPL-3.0)
 */

import * as THREE from "three";

import {processLSystem} from "./lsystems";

function getSimpleLine(start: THREE.Vector3, end: THREE.Vector3) {
    const path = new THREE.LineCurve3(start, end);
    return new THREE.Mesh(
        new THREE.TubeGeometry(path, 1, 0.2, 8, false), // I have no idea why I can't set closed to true
        new THREE.MeshNormalMaterial(),
    );
}

// Doesn't do anything yet, but we'll use it soon!
const rules: Map<string, string> = new Map([
    ["F", "FF"],
    ["X", "F-[[X]+X]+F[+FX]-X"],
]);
const sequence = processLSystem("X", rules, 5);
console.log(`Sequence: ${sequence}`);

export function generateMeshes() {
    return [
        getSimpleLine(
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(2, 2, 2),
        ),
        getSimpleLine(
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(2, -2, 2),
        ),
    ];
}

