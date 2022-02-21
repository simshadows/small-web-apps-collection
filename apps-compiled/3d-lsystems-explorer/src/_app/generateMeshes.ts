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

interface TurtleState {
    position:       THREE.Vector3;
    base:           THREE.Vector3;
    orientation:    THREE.Matrix3;
    thickness:      number;
    radialSegments: number;
}

function cloneTurtleState(obj: TurtleState): TurtleState {
    return {
        position:       obj.position.clone(),
        base:           obj.base.clone(),
        orientation:    obj.orientation.clone(),
        thickness:      obj.thickness,
        radialSegments: obj.radialSegments,
    };
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

    let state: TurtleState = {
        position:    new THREE.Vector3(0, 0, 0),
        base:        (new THREE.Vector3(opts.initialDirectionX, opts.initialDirectionY, opts.initialDirectionZ)).normalize(),
        orientation: new THREE.Matrix3(),
        thickness:   opts.initialThickness,
        radialSegments: 10,
    };
    let stack: TurtleState[] = [];

    function push(): void {
        stack.push(cloneTurtleState(state));
    }
    function pop(): void {
        const popped = stack.pop();
        if (popped === undefined) {
            console.error("Unmatched pop.");
            return;
        }
        state = popped;
    }

    function draw(length: number, phantom: boolean): void {
        const direction = state.base.clone().applyMatrix3(state.orientation);
        const end = direction.multiplyScalar(length * opts.segmentLength).add(state.position);
        if (!phantom) meshes.push(getSimpleLine(state.position, end, state.thickness, state.radialSegments));
        state.position = end;
    }
    function bRotate(angleDeg: number, axis: THREE.Vector3): void {
        state.base.applyAxisAngle(axis, degToRad(angleDeg));
        afterRotate();
    }
    function verticalBRotate(angleDeg: number): void {
        let axis = (new THREE.Vector3(0, 1, 0)).cross(state.base);
        if (axis.equals(new THREE.Vector3(0, 0, 0))) axis = new THREE.Vector3(1, 0, 0);
        axis.normalize();
        state.base.applyAxisAngle(axis, degToRad(angleDeg));
        afterRotate();
    }
    function matMulOrientation(matrix: THREE.Matrix3): void {
        state.orientation.multiply(matrix);
        //state.base.normalize();
        afterRotate();
    }
    //function orientationVerticalRotate(angleDeg: number): void {
    //    // TODO
    //    afterRotate();
    //}

    function afterRotate(): void {
        state.thickness *= opts.thicknessModifier;
        state.radialSegments = Math.max(4, state.radialSegments - 1);
    }

    const rad = degToRad(opts.axisRotationAngleDeg);
    const rmXPos = getXAxisRotationMatrix( rad);
    const rmXNeg = getXAxisRotationMatrix(-rad);
    const rmYPos = getYAxisRotationMatrix( rad);
    const rmYNeg = getYAxisRotationMatrix(-rad);
    const rmZPos = getZAxisRotationMatrix( rad);
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

            //case "vrotate(+)": orientationVerticalRotate( opts.verticalRotationAngleDeg); break;
            //case "vrotate(-)": orientationVerticalRotate(-opts.verticalRotationAngleDeg); break;
            case "xrotate(+)": matMulOrientation(rmXPos); break;
            case "xrotate(-)": matMulOrientation(rmXNeg); break;
            case "yrotate(+)": matMulOrientation(rmYPos); break;
            case "yrotate(-)": matMulOrientation(rmYNeg); break;
            case "zrotate(+)": matMulOrientation(rmZPos); break;
            case "zrotate(-)": matMulOrientation(rmZNeg); break;
            case "xrotate(+180)": matMulOrientation(rmXTurn); break;
            case "yrotate(+180)": matMulOrientation(rmYTurn); break;
            case "zrotate(+180)": matMulOrientation(rmZTurn); break;

            case "vbrotate(+)": verticalBRotate( opts.verticalRotationAngleDeg); break;
            case "vbrotate(-)": verticalBRotate(-opts.verticalRotationAngleDeg); break;
            case "xbrotate(+)": bRotate( opts.axisRotationAngleDeg, new THREE.Vector3(1, 0, 0)); break;
            case "xbrotate(-)": bRotate(-opts.axisRotationAngleDeg, new THREE.Vector3(1, 0, 0)); break;
            case "ybrotate(+)": bRotate( opts.axisRotationAngleDeg, new THREE.Vector3(0, 1, 0)); break;
            case "ybrotate(-)": bRotate(-opts.axisRotationAngleDeg, new THREE.Vector3(0, 1, 0)); break;
            case "zbrotate(+)": bRotate( opts.axisRotationAngleDeg, new THREE.Vector3(0, 0, 1)); break;
            case "zbrotate(-)": bRotate(-opts.axisRotationAngleDeg, new THREE.Vector3(0, 0, 1)); break;

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

