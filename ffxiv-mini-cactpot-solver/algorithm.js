/*
 * Filename: algorithm.js
 * Author:   simshadows <contact@simshadows.com>
 * License:  GNU Affero General Public License v3 (AGPL-3.0)
 */

const assert = console.assert;

/*** Helpers ***/

class IntArrayToObjMap {
    constructor() {
        // knownNumbers --> newObj
        this._data = new Map();
    }
    get(knownNumbers) {
        return this._data.get(knownNumbers.join());
    }
    has(knownNumbers) {
        return this._data.has(knownNumbers.join());
    }
    set(knownNumbers, newObj) {
        this._data.set(knownNumbers.join(), newObj);
    }
}

// General-purpose permutator
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

function calculateLinePayouts(state, payouts) {
    assert(state instanceof Array);
    assert(state.length === 9);

    assert(payouts instanceof Array);
    assert(payouts.length === 19);

    return {
        a: payouts[state[0] + state[4] + state[8] - 6],
        b: payouts[state[0] + state[3] + state[6] - 6],
        c: payouts[state[1] + state[4] + state[7] - 6],
        d: payouts[state[2] + state[5] + state[8] - 6],
        e: payouts[state[2] + state[4] + state[6] - 6],
        f: payouts[state[0] + state[1] + state[2] - 6],
        g: payouts[state[3] + state[4] + state[5] - 6],
        h: payouts[state[6] + state[7] + state[8] - 6],
    };
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

/*** Stages ***/

function getAllPossibleStates(knownNumbers, payouts, numbersNotSeen) {
    assert(knownNumbers instanceof Array);
    assert(knownNumbers.length === 9);

    assert(payouts instanceof Array);
    assert(payouts.length === 19);

    assert(numbersNotSeen instanceof Set);

    const unknownNumberPositions = [];
    for (const [i, n] of knownNumbers.entries()) {
        if (n === null) unknownNumberPositions.push(i);
    }
    assert(unknownNumberPositions.length === numbersNotSeen.size);

    const ret = [];

    const numbersNotSeenPermutations = permutationsFullLength(Array.from(numbersNotSeen));
    //console.log("permutationsFullLength returned " + String(numbersNotSeenPermutations.length) + " items");
    for (const permutation of numbersNotSeenPermutations) {
        const m = knownNumbers.slice();
        for (const i of unknownNumberPositions) {
            m[i] = permutation.pop(); // permutation Array is modified!
        }
        assert(permutation.length === 0);
        ret.push({
            configuration: m,
            linePayouts: calculateLinePayouts(m, payouts),
        });
    }
    return ret;
}

function calculateLinesAverages(allPossibleStates) {
    assert(allPossibleStates instanceof Array);

    // Layout:
    //      a b c d e
    //      f 0 1 2
    //      g 3 4 5
    //      h 6 7 8
    const ret = {
        a: 0,
        b: 0,
        c: 0,
        d: 0,
        e: 0,
        f: 0,
        g: 0,
        h: 0,
    };

    for (const obj of allPossibleStates) {
        ret.a += obj.linePayouts.a;
        ret.b += obj.linePayouts.b;
        ret.c += obj.linePayouts.c;
        ret.d += obj.linePayouts.d;
        ret.e += obj.linePayouts.e;
        ret.f += obj.linePayouts.f;
        ret.g += obj.linePayouts.g;
        ret.h += obj.linePayouts.h;
    }
    for (const k of Object.keys(ret)) {
        ret[k] /= allPossibleStates.length;
    }
    return ret;
}

/*** Top-Level ***/

// I need a better name for this...
function calculate2(knownNumbers, memo0, allPossibleStates, numbersNotSeen, remainToSelect) {
    assert(allPossibleStates instanceof Array);
    assert(allPossibleStates.length > 0);
    assert(allPossibleStates[0].configuration instanceof Array); // Spot Checks
    assert(allPossibleStates[0].configuration.length === 9);

    assert(knownNumbers instanceof Array);
    assert(knownNumbers.length === 9);

    assert(numbersNotSeen instanceof Set);
    assert(typeof remainToSelect === "number");

    // selectionScore will be an array of 9 ints, corresponding to a number cell.
    // Entries can be null if that cell already has a number.
    const selectionScores = [];

    // linesAveragesArr will be an array of lines averages, which will eventually be averaged together
    // to form an aggregate lines average.
    const linesAveragesArr = [];

    if (remainToSelect <= 1) {
        // We only have one cell remaining to select.
        // After we select this cell, we will pick the line with the highest average MGP earning.
        // Therefore, for each unknown cell, we calculate this value for each possible number that can be in that cell,
        // and the average is the cell's selection score.

        // TL;DR: selection score of a cell = average of all maximum-line-averages

        // (Yes, this block will also run if remainToSelect is zero because we don't really care at that point.)

        for (let i = 0; i < knownNumbers.length; ++i) {
            if (knownNumbers[i] !== null) {
                selectionScores.push(null);
                continue;
            }

            let sumOfLinesAveragesMaxVals = 0;
            for (const n of numbersNotSeen) {
                const statesSubset = allPossibleStates.filter((x) => (x.configuration[i] === n));
                const linesAverages = calculateLinesAverages(statesSubset);
                const linesAveragesMax = Math.max(...Object.values(linesAverages));
                sumOfLinesAveragesMaxVals += linesAveragesMax;
                linesAveragesArr.push(linesAverages);
            }
            selectionScores.push(sumOfLinesAveragesMaxVals / numbersNotSeen.size);
        }
    } else {
        // We have more than one more cell to select.
        // After we select this cell, the next cell we pick will also have the highest selection score.
        // Therefore, for each unknown cell, we calculate this value for each possible number that can be in that cell,
        // and the average is the cell's selection score.

        // TL;DR: selection score of a cell = average of all maximum-selection-scores

        for (let i = 0; i < knownNumbers.length; ++i) {
            if (knownNumbers[i] !== null) {
                selectionScores.push(null);
                continue;
            }

            let sumOfSelectionScores = 0;
            const newKnownNumbers = knownNumbers.slice();
            const newNumbersNotSeen = new Set(numbersNotSeen);
            for (const n of numbersNotSeen) {
                newKnownNumbers[i] = n;
                let result = memo0.get(newKnownNumbers);
                if (!result) {
                    newNumbersNotSeen.delete(n);
                    const statesSubset = allPossibleStates.filter((x) => (x.configuration[i] === n));
                    result = calculate2(newKnownNumbers, memo0, statesSubset, newNumbersNotSeen, remainToSelect - 1);
                    memo0.set(newKnownNumbers, result);
                    newNumbersNotSeen.add(n);
                }
                linesAveragesArr.push(result.linesAverages);
                sumOfSelectionScores += result.selectionScoresMax;
            }
            selectionScores.push(sumOfSelectionScores / numbersNotSeen.size);
        }
    }

    const linesAverages = averageOfLinesMaps(linesAveragesArr);

    return {
        linesAverages: linesAverages,
        selectionScores: selectionScores,
        selectionScoresMax: Math.max(...selectionScores),
    };
}

export function calculateNumbersNotSeen(knownNumbers) {
    const ret = new Set([1,2,3,4,5,6,7,8,9]);
    for (const knownNumber of knownNumbers) {
        if (knownNumber === null) continue;
        const success = ret.delete(knownNumber);
        if (!success) throw "Duplicate number found: " + String(knownNumber);
    }
    return ret;
}

export function calculate(knownNumbers, payouts) {
    assert(knownNumbers instanceof Array);
    assert(knownNumbers.length === 9);

    const numbersNotSeen = calculateNumbersNotSeen(knownNumbers);
    const remainToSelect = numbersNotSeen.size - 5;

    const allPossibleStates = getAllPossibleStates(knownNumbers, payouts, numbersNotSeen);
    assert(allPossibleStates instanceof Array);
    assert(allPossibleStates.length > 0);
    assert(allPossibleStates[0].configuration.length === 9); // Spot check. All elements are length-9 arrays.
    console.log("Generated " + String(allPossibleStates.length) + " possible states.");

    const memo0 = new IntArrayToObjMap();

    const results = calculate2(knownNumbers, memo0, allPossibleStates, numbersNotSeen, remainToSelect);

    return {
        linesAverages: results.linesAverages,
        linesAveragesMax: Math.max(...Object.values(results.linesAverages)),
        selectionScores: results.selectionScores,
        selectionScoresMax: results.selectionScoresMax,

        numbersNotSeen: numbersNotSeen,
        remainToSelect: remainToSelect,
    };
}

