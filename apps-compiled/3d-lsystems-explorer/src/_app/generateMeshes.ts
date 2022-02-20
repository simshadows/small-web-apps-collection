/*
 * Filename: generateMesh.ts
 * Author:   simshadows <contact@simshadows.com>
 * License:  GNU Affero General Public License v3 (AGPL-3.0)
 */

import * as THREE from "three";

function degToRad(deg: number): number {
    return deg * (Math.PI/180);
}

function getSimpleLine(start: THREE.Vector3, end: THREE.Vector3, thickness: number, radialSegments: number) {
    const path = new THREE.LineCurve3(start, end);
    return new THREE.Mesh(
        new THREE.TubeGeometry(path, 1, thickness, radialSegments, false), // I have no idea why I can't set closed to true
        new THREE.MeshNormalMaterial(),
    );
}

interface GenerateMeshesOptions {
    specString: string;

    initialDirectionX: number;
    initialDirectionY: number;
    initialDirectionZ: number;

    axisRotationAngleDeg: number;
    verticalRotationAngleDeg: number;

    initialThickness: number;
    thicknessModifier: number;

    baseWidth: number;
}

export function generateMeshes(opts: GenerateMeshesOptions) {
    const meshes: THREE.Mesh[] = [];

    if (opts.baseWidth > 0) {
        meshes.push(
            new THREE.Mesh(
                new THREE.BoxGeometry(opts.baseWidth, 0.5, opts.baseWidth),
                new THREE.MeshNormalMaterial(),
            )
        );
    }

    let base = new THREE.Vector3(0, 0, 0);
    let direction = (new THREE.Vector3(opts.initialDirectionX, opts.initialDirectionY, opts.initialDirectionZ)).normalize();
    let thickness = opts.initialThickness;
    let radialSegments = 10;
    let stack: {base: THREE.Vector3; direction: THREE.Vector3, thickness: number}[] = [];

    function push(): void {
        stack.push({base: base.clone(), direction: direction.clone(), thickness: thickness});
    }
    function pop(): void {
        const popped = stack.pop();
        if (popped === undefined) {
            console.error("Unmatched popts.");
            return;
        }
        base = popped.base;
        direction = popped.direction;
        thickness = popped.thickness;
    }

    function draw(length: number): void {
        const end = direction.clone().multiplyScalar(length).add(base);
        meshes.push(getSimpleLine(base, end, thickness, radialSegments));
        base = end;
    }
    function rotate(angleDeg: number, axis: THREE.Vector3): void {
        direction.applyAxisAngle(axis, degToRad(angleDeg));
        thickness *= opts.thicknessModifier;
        radialSegments = Math.max(3, radialSegments - 1);
    }
    function verticalRotate(angleDeg: number): void {
        let axis = (new THREE.Vector3(0, 1, 0)).cross(direction);
        if (axis.equals(new THREE.Vector3(0, 0, 0))) axis = new THREE.Vector3(1, 0, 0);
        axis.normalize();
        direction.applyAxisAngle(axis, degToRad(angleDeg));
        thickness *= opts.thicknessModifier;
        radialSegments = Math.max(3, radialSegments - 1);
    }

    let currSegmentLength = 0;
    for (const s of opts.specString) {

        // Optimization to lump multiple consecutive draw commands into one straight mesh.
        if (s === "F") {
            ++currSegmentLength;
            continue;
        } else if (currSegmentLength > 0) {
            draw(currSegmentLength);
            currSegmentLength = 0;
        }

        switch (s) {
            case "[": push(); break;
            case "]": pop();  break;
            case "+": verticalRotate( opts.verticalRotationAngleDeg); break;
            case "-": verticalRotate(-opts.verticalRotationAngleDeg); break;
            case "a": rotate( opts.axisRotationAngleDeg, new THREE.Vector3(1, 0, 0)); break;
            case "b": rotate(-opts.axisRotationAngleDeg, new THREE.Vector3(1, 0, 0)); break;
            case "r": rotate( opts.axisRotationAngleDeg, new THREE.Vector3(0, 1, 0)); break;
            case "l": rotate(-opts.axisRotationAngleDeg, new THREE.Vector3(0, 1, 0)); break;

            //case "F": draw(1); break; // Use this if you want to try removing the optimization
            default: // No operation
        }
    }
    // Finish rendering the last segment if needed
    if (currSegmentLength > 0) {
        draw(currSegmentLength);
    }

    console.log(`Generated ${meshes.length} meshes.`);
    return meshes;
}

