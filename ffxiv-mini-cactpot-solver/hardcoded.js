/*
 * Filename: hardcoded.js
 * Author:   simshadows <contact@simshadows.com>
 * License:  GNU Affero General Public License v3 (AGPL-3.0)
 *
 * The algorithm is quite slow at initial stages, so some hardcoding is done
 * for these few extremely common states.
 */

const assert = console.assert;

const defaultPayouts = [
    10000, // 6
    36, // 7
    720, // 8
    360, // 9
    80, // 10
    252, // 11
    108, // 12
    72, // 13
    54, // 14
    180, // 15
    72, // 16
    180, // 17
    119, // 18
    36, // 19
    306, // 20
    1080, // 21
    144, // 22
    1800, // 23
    3600, // 24
];

export function getDefaultPayouts() {
    return defaultPayouts.slice();
}

// A general-purpose utility function that I don't really know where to put
// without bloating the codebase.
export function intArraysAreEqual(a, b) {
    if (a.length !== b.length) return false;
    for (const [i, v] of a.entries()) {
        if (b[i] !== v) return false;
    }
    return true;
}

export function matchesDefaultPayouts(arr) {
    return intArraysAreEqual(arr, defaultPayouts);
}

export function getHardcodedValues(knownNumbers, payouts) {
    // Hardcoded values only supported for default payouts
    if (!matchesDefaultPayouts(payouts)) return undefined;
    return postprocessedValues.get(knownNumbers.join());
}

const preprocessedValues = [
    [[null,null,null,null,null,null,null,null,null], {
        linesAverages: [360.345, 360.345, 360.345, 360.345, 360.345, 360.345, 360.345, 360.345],
        selectionScores: [1510.480, 1453.197, 1510.480, 1453.197, 1510.140, 1453.197, 1510.480, 1453.197, 1510.480],
    }],
];

const postprocessedValues = (()=>{
    const ret = new Map();
    for (const [knownNumbers, x] of preprocessedValues) {
        const key = knownNumbers.join();
        if (ret.has(key)) console.warn("Duplicate key: " + String(key));
        x.linesAverages = {
            a: x.linesAverages[0],
            b: x.linesAverages[1],
            c: x.linesAverages[2],
            d: x.linesAverages[3],
            e: x.linesAverages[4],
            f: x.linesAverages[5],
            g: x.linesAverages[6],
            h: x.linesAverages[7]
        };
        ret.set(key, x);
    }
    return ret;
})();

