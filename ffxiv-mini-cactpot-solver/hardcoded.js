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

export function addDefaultInitialValues(calculated) {
    calculated.linesAverages = {
        a: 360.3452380952381,
        b: 360.3452380952381,
        c: 360.3452380952381,
        d: 360.3452380952381,
        e: 360.3452380952381,
        f: 360.3452380952381,
        g: 360.3452380952381,
        h: 360.3452380952381,
    };
    calculated.selectionScores = [
        1510.4806216931217, // Cell 0
        1453.1979497354498, // Cell 1
        1510.4806216931217, // Cell 2
        1453.1979497354498, // Cell 3
        1510.1404431216934, // Cell 4
        1453.1979497354498, // Cell 5
        1510.4806216931217, // Cell 6
        1453.1979497354498, // Cell 7
        1510.4806216931217, // Cell 8
    ];
}

