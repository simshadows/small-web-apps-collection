/*
 * Filename: threeMath.ts
 * Author:   simshadows <contact@simshadows.com>
 * License:  GNU Affero General Public License v3 (AGPL-3.0)
 */

import * as THREE from "three";

export function degToRad(deg: number): number {
    return deg * (Math.PI/180);
}

export function getXAxisRotationMatrix(radians: number) {
    const ret = new THREE.Matrix3();
    ret.set( // Row-Major Order
        Math.cos(radians) , Math.sin(radians), 0,
        -Math.sin(radians), Math.cos(radians), 0,
        0                 , 0                , 1,
    );
    return ret;
}

export function getYAxisRotationMatrix(radians: number) {
    const ret = new THREE.Matrix3();
    ret.set( // Row-Major Order
        Math.cos(radians), 0, -Math.sin(radians),
        0                , 1, 0,
        Math.sin(radians), 0, Math.cos(radians),
    );
    return ret;
}

export function getZAxisRotationMatrix(radians: number) {
    const ret = new THREE.Matrix3();
    ret.set( // Row-Major Order
        1, 0                , 0,
        0, Math.cos(radians), -Math.sin(radians),
        0, Math.sin(radians), Math.cos(radians),
    );
    return ret;
}

