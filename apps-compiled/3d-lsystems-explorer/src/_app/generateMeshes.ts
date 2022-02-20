/*
 * Filename: generateMesh.ts
 * Author:   simshadows <contact@simshadows.com>
 * License:  GNU Affero General Public License v3 (AGPL-3.0)
 */

import * as THREE from "three";

import {processLSystem} from "./lsystems";

function degToRad(deg: number): number {
    return deg * (Math.PI/180);
}

function getSimpleLine(start: THREE.Vector3, end: THREE.Vector3) {
    const path = new THREE.LineCurve3(start, end);
    return new THREE.Mesh(
        new THREE.TubeGeometry(path, 1, 0.2, 3, false), // I have no idea why I can't set closed to true
        new THREE.MeshNormalMaterial(),
    );
}

// Doesn't do anything yet, but we'll use it soon!
const rules: Map<string, string> = new Map([
    ["F", "FF"],
    ["X", "F*-[[Y]/+Y]*+F[/+FX]*-X"],
    ["Y", "F/-[[X]*+X]/+F[*+FX]/-Y"],
]);
const sequence = processLSystem("X", rules, 5);
console.log(`Sequence: ${sequence}`);

export function generateMeshes() {
    const meshes: THREE.Mesh[] = [];

    let base = new THREE.Vector3(0, 0, 0);
    let direction = new THREE.Vector3(0, 1, 0);
    let stack: {base: THREE.Vector3; direction: THREE.Vector3}[] = [];

    function push(): void {
        stack.push({base: base.clone(), direction: direction.clone()});
    }
    function pop(): void {
        const popped = stack.pop();
        if (popped === undefined) {
            console.error("Unmatched pop.");
            return;
        }
        base = popped.base;
        direction = popped.direction;
    }

    function draw(): void {
        const end = base.clone().add(direction);
        meshes.push(getSimpleLine(base, end));
        base = end;
    }
    function rotate(angleDeg: number, axis: THREE.Vector3): void {
        direction.applyAxisAngle(axis, degToRad(angleDeg));
    }

    for (const s of sequence) {
        switch (s) {
            case "[": push(); break;
            case "]": pop();  break;
            case "F": draw(); break;
            case "+": rotate(30, new THREE.Vector3(1, 0, 0)); break;
            case "-": rotate(-30, new THREE.Vector3(1, 0, 0)); break;
            case "*": rotate(30, new THREE.Vector3(0, 1, 0)); break;
            case "/": rotate(-30, new THREE.Vector3(0, 1, 0)); break;
            default: // No operation
        }
    }
    return meshes;
}

