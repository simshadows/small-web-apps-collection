/*
 * Filename: generateMesh.ts
 * Author:   simshadows <contact@simshadows.com>
 * License:  GNU Affero General Public License v3 (AGPL-3.0)
 */

import * as THREE from "three";

import {
    degToRad,
    getXAxisRotationMatrix,
    getYAxisRotationMatrix,
    getZAxisRotationMatrix,
} from "./threeMath";

function getSimpleLine(start: THREE.Vector3, end: THREE.Vector3, thickness: number, radialSegments: number) {
    const path = new THREE.LineCurve3(start, end);
    return new THREE.Mesh(
        new THREE.TubeGeometry(path, 1, thickness, radialSegments, false), // I have no idea why I can't set closed to true
        new THREE.MeshNormalMaterial(),
    );
}

interface GenerateMeshesOptions {
    specString: string;
    interpreterRules: {[Key in string]: string;};

    segmentLength: number;

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
    let turtle = new THREE.Matrix3();
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

    function draw(length: number, phantom: boolean): void {
        const trueDirection = direction.clone().applyMatrix3(turtle);
        const end = trueDirection.multiplyScalar(length * opts.segmentLength).add(base);
        if (!phantom) meshes.push(getSimpleLine(base, end, thickness, radialSegments));
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
    function matrixMultiplyDirection(matrix: THREE.Matrix3): void {
        turtle.multiply(matrix);
        //direction.normalize();
        thickness *= opts.thicknessModifier;
        radialSegments = Math.max(3, radialSegments - 1);
    }

    const rad = degToRad(opts.axisRotationAngleDeg);
    const rmXPos = getXAxisRotationMatrix(rad);
    const rmXNeg = getXAxisRotationMatrix(-rad);
    const rmYPos = getYAxisRotationMatrix(rad);
    const rmYNeg = getYAxisRotationMatrix(-rad);
    const rmZPos = getZAxisRotationMatrix(rad);
    const rmZNeg = getZAxisRotationMatrix(-rad);
    const rmXTurn = getXAxisRotationMatrix(degToRad(180));
    const rmYTurn = getYAxisRotationMatrix(degToRad(180));
    const rmZTurn = getZAxisRotationMatrix(degToRad(180));

    let currSegmentLength = 0;
    for (const s of opts.specString) {
        const rule = opts.interpreterRules[s];
        if (rule === undefined || rule === "") continue;

        // Optimization to lump multiple consecutive draw commands into one straight mesh.
        if (rule === "draw()") {
            ++currSegmentLength;
            continue;
        } else if (currSegmentLength > 0) {
            draw(currSegmentLength, false);
            currSegmentLength = 0;
        }

        switch (rule) {
            case "move()": draw(1, true); break;
            case "move(-1)": draw(-1, true); break;
            case "push()": push(); break;
            case "pop()":  pop(); break;
            case "vrotate(+)": verticalRotate( opts.verticalRotationAngleDeg); break;
            case "vrotate(-)": verticalRotate(-opts.verticalRotationAngleDeg); break;
            case "xrotate(+)": rotate( opts.axisRotationAngleDeg, new THREE.Vector3(1, 0, 0)); break;
            case "xrotate(-)": rotate(-opts.axisRotationAngleDeg, new THREE.Vector3(1, 0, 0)); break;
            case "yrotate(+)": rotate( opts.axisRotationAngleDeg, new THREE.Vector3(0, 1, 0)); break;
            case "yrotate(-)": rotate(-opts.axisRotationAngleDeg, new THREE.Vector3(0, 1, 0)); break;
            case "zrotate(+)": rotate( opts.axisRotationAngleDeg, new THREE.Vector3(0, 0, 1)); break;
            case "zrotate(-)": rotate(-opts.axisRotationAngleDeg, new THREE.Vector3(0, 0, 1)); break;

            case "xmrotate(+)": matrixMultiplyDirection(rmXPos); break;
            case "xmrotate(-)": matrixMultiplyDirection(rmXNeg); break;
            case "ymrotate(+)": matrixMultiplyDirection(rmYPos); break;
            case "ymrotate(-)": matrixMultiplyDirection(rmYNeg); break;
            case "zmrotate(+)": matrixMultiplyDirection(rmZPos); break;
            case "zmrotate(-)": matrixMultiplyDirection(rmZNeg); break;
            case "xmrotate(+180)": matrixMultiplyDirection(rmXTurn); break;
            case "ymrotate(+180)": matrixMultiplyDirection(rmYTurn); break;
            case "zmrotate(+180)": matrixMultiplyDirection(rmZTurn); break;

            default: // No operation
        }
    }
    // Finish rendering the last segment if needed
    if (currSegmentLength > 0) {
        draw(currSegmentLength, false);
    }

    console.log(`Generated ${meshes.length} meshes.`);
    return meshes;
}

