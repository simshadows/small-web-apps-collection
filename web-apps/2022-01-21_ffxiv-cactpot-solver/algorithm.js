/*
 * Filename: algorithm.js
 * Author:   simshadows <contact@simshadows.com>
 * License:  GNU Affero General Public License v3 (AGPL-3.0)
 */

const assert = console.assert;

function permutationsFullLength(arr) {
    assert(arr instanceof Array);
    if (arr.length == 0) return [[]];

    const ret = [];
    function op(remaining, partialSolution) {
        if (remaining.length === 0) {
            ret.push(partialSolution);
        } else {
            for (let i = 0; i < remaining.length; ++i) {
                const newRemaining = remaining.slice();
                const extracted = newRemaining.splice(i, 1);
                const newPartialSolution = partialSolution.concat(extracted);
                op(newRemaining, newPartialSolution);
            }
        }
    }
    op(arr, []);
    return ret;
}

function calculateLineAverages(knownNumbers, payouts, numbersNotSeen) {
    assert(knownNumbers instanceof Array);
    assert(knownNumbers.length === 9);

    assert(payouts instanceof Array);
    assert(payouts.length === 19);

    assert(numbersNotSeen instanceof Set);

    // Layout:
    //      a b c d e
    //      f 0 1 2
    //      g 3 4 5
    //      h 6 7 8
    const lineSums = {
        a: 0,
        b: 0,
        c: 0,
        d: 0,
        e: 0,
        f: 0,
        g: 0,
        h: 0,
    };

    const numbersNotSeenPermutations = permutationsFullLength(Array.from(numbersNotSeen));
    for (const permutation of numbersNotSeenPermutations) {
        const m = [];
        for (const k of knownNumbers) {
            // permutation Array is modified!
            m.push((k === null) ? permutation.pop() : k);
        }
        lineSums.a += payouts[m[0] + m[4] + m[8] - 6];
        lineSums.b += payouts[m[0] + m[3] + m[6] - 6];
        lineSums.c += payouts[m[1] + m[4] + m[7] - 6];
        lineSums.d += payouts[m[2] + m[5] + m[8] - 6];
        lineSums.e += payouts[m[2] + m[4] + m[6] - 6];
        lineSums.f += payouts[m[0] + m[1] + m[2] - 6];
        lineSums.g += payouts[m[3] + m[4] + m[5] - 6];
        lineSums.h += payouts[m[6] + m[7] + m[8] - 6];
    }

    const lineAverages = {};
    for (const [k, v] of Object.entries(lineSums)) {
        lineAverages[k] = v / numbersNotSeenPermutations.length;
    }
    return lineAverages;
}

function calculateRecursive(knownNumbers, payouts, numbersNotSeen, remainToSelect) {
    assert(knownNumbers instanceof Array);
    assert(knownNumbers.length === 9);

    assert(payouts instanceof Array);
    assert(payouts.length === 19);

    assert(numbersNotSeen instanceof Set);
    assert(typeof remainToSelect === "number");

    const lineAverages = calculateLineAverages(knownNumbers, payouts, numbersNotSeen);

    return {
        lineAverages,
    };
}

export function calculate(knownNumbers, payouts) {
    assert(knownNumbers instanceof Array);
    assert(knownNumbers.length === 9);

    const numbersNotSeen = new Set([1,2,3,4,5,6,7,8,9]);
    for (const knownNumber of knownNumbers) {
        if (knownNumber === null) continue;
        const success = numbersNotSeen.delete(knownNumber);
        if (!success) throw "Duplicate number found: " + String(knownNumber);
    }

    const remainToSelect = numbersNotSeen.size - 5;
    const results = calculateRecursive(knownNumbers, payouts, numbersNotSeen, remainToSelect);

    return {
        lineAverages: results.lineAverages,
        numbersNotSeen: numbersNotSeen,
        remainToSelect: remainToSelect,
    };
}

