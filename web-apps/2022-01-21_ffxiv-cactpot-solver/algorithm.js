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
    function op(remaining, partialSolution, partialSolutionNextIndex) {
        if (remaining.length === 0) {
            ret.push(partialSolution.slice());
        } else {
            for (let i = 0; i < remaining.length; ++i) {
                const newRemaining = remaining.slice();
                partialSolution[partialSolutionNextIndex] = newRemaining.splice(i, 1)[0];
                op(newRemaining, partialSolution, partialSolutionNextIndex + 1);
            }
        }
    }
    op(arr, [], 0);
    return ret;
}

function calculateLinesAverages(knownNumbers, payouts, numbersNotSeen) {
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

    const unknownNumberPositions = [];
    for (const [i, n] of knownNumbers.entries()) {
        if (n === null) unknownNumberPositions.push(i);
    }
    assert(unknownNumberPositions.length === numbersNotSeen.size);

    const numbersNotSeenPermutations = permutationsFullLength(Array.from(numbersNotSeen));
    //console.log("calculateLinesAverages returned " + String(numbersNotSeenPermutations.length) + " items");
    const m = knownNumbers.slice();
    for (const permutation of numbersNotSeenPermutations) {
        for (const i of unknownNumberPositions) {
            m[i] = permutation.pop(); // permutation Array is modified!
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

    const linesAverages = {};
    for (const [k, v] of Object.entries(lineSums)) {
        linesAverages[k] = v / numbersNotSeenPermutations.length;
    }
    return linesAverages;
}

function averageOfLinesMaps(linesMapsArray) {
    assert(linesMapsArray instanceof Array);
    assert(linesMapsArray.length > 0); // Not designed for anything larger
    const ret = {};
    for (const k of Object.keys(linesMapsArray[0])) {
        ret[k] = 0;
    }
    for (const linesMap of linesMapsArray) {
        assert(typeof linesMap === "object");
        assert(Object.keys(linesMap).length === 8);
        for (const [k, v] of Object.entries(linesMap)) {
            assert(typeof v === "number");
            ret[k] += v;
        }
    }
    for (const k of Object.keys(ret)) {
        ret[k] /= linesMapsArray.length;
    }
    return ret;
}

// I need a better name for this...
function calculate2(knownNumbers, payouts, numbersNotSeen, remainToSelect) {
    assert(knownNumbers instanceof Array);
    assert(knownNumbers.length === 9);

    assert(payouts instanceof Array);
    assert(payouts.length === 19);

    assert(numbersNotSeen instanceof Set);
    assert(typeof remainToSelect === "number");

    // selectionScore will be an array of 9 ints, corresponding to a number cell.
    // Entries can be null if that cell already has a number.
    const selectionScores = [];
    let selectionScoresMax = 0;

    // linesAveragesArr will be an array of lines averages, which will eventually be averaged together
    // to form an aggregate lines average.
    const linesAveragesArr = [];

    for (let i = 0; i < knownNumbers.length; ++i) {
        if (knownNumbers[i] !== null) {
            selectionScores.push(null);
        } else {
            let sumOfLinesAveragesMaxVals = 0;
            for (const n of numbersNotSeen) {
                const newKnownNumbers = knownNumbers.slice();
                const newNumbersNotSeen = new Set(numbersNotSeen);
                newKnownNumbers[i] = n;
                newNumbersNotSeen.delete(n);
                const linesAverages = calculateLinesAverages(newKnownNumbers, payouts, newNumbersNotSeen);
                const linesAveragesMax = Math.max(...Object.values(linesAverages));
                sumOfLinesAveragesMaxVals += linesAveragesMax;
                linesAveragesArr.push(linesAverages);
            }
            const selectionScore = sumOfLinesAveragesMaxVals / numbersNotSeen.size;
            if (selectionScoresMax < selectionScore) selectionScoresMax = selectionScore;
            selectionScores.push(selectionScore);
        }
    }

    const linesAverages = averageOfLinesMaps(linesAveragesArr);
    return {
        linesAverages,
        selectionScores,
        selectionScoresMax,
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
    const results = calculate2(knownNumbers, payouts, numbersNotSeen, remainToSelect);

    return {
        linesAverages: results.linesAverages,
        selectionScores: results.selectionScores,
        selectionScoresMax: results.selectionScoresMax,

        numbersNotSeen: numbersNotSeen,
        remainToSelect: remainToSelect,
    };
}

