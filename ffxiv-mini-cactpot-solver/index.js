/*
 * Filename: index.js
 * Author:   simshadows <contact@simshadows.com>
 * License:  GNU Affero General Public License v3 (AGPL-3.0)
 */

// Layout:
//      a b c d e
//      f 0 1 2
//      g 3 4 5
//      h 6 7 8

import {calculate} from "./algorithm.js";

const USE_WORKAROUND = true;
const FAST_BENCHMARK = false;

const assert = console.assert;

const payoutsDisp = document.querySelector("#payouts-disp");
const resetButton = document.querySelector("#reset-button");

const lineCells = {
    a: document.querySelector("#cell-a"),
    b: document.querySelector("#cell-b"),
    c: document.querySelector("#cell-c"),
    d: document.querySelector("#cell-d"),
    e: document.querySelector("#cell-e"),
    f: document.querySelector("#cell-f"),
    g: document.querySelector("#cell-g"),
    h: document.querySelector("#cell-h"),
}
const numCells = [
    document.querySelector("#cell-0"),
    document.querySelector("#cell-1"),
    document.querySelector("#cell-2"),
    document.querySelector("#cell-3"),
    document.querySelector("#cell-4"),
    document.querySelector("#cell-5"),
    document.querySelector("#cell-6"),
    document.querySelector("#cell-7"),
    document.querySelector("#cell-8"),
]

const payouts = [
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

function roundDecPl(n, p) {
    const a = Math.pow(10, p);
    return Math.round(n * a) / a;
}

/*** DOM Helpers ***/

const txt = document.createTextNode.bind(document);

function element(tagName, attributes={}) {
    const elem = document.createElement(tagName);
    if ("id" in attributes) elem.setAttribute("id", attributes.id);
    if ("class" in attributes) {
        assert(attributes.class instanceof Array, "Class must be an array.");
        elem.classList.add(...attributes.class);
    }
    return elem;
}

/*** Rendering: Specifics ***/

function lineCellElement(letter) {
    const ret = element("div", {class: ["line-box"]});
    const linesAverage = calculated.linesAverages[letter];
    ret.appendChild(txt(roundDecPl(linesAverage, 2).toFixed(2)));
    if ((calculated.remainToSelect === 0) && (linesAverage === calculated.linesAveragesMax)) {
        ret.classList.add("line-box-best");
    }
    return ret;
}

function numCellButtonsElement(position) {
    const ret = element("div", {class: ["num-box-buttongrid"]});
    for (let i = 1; i <= 9; ++i) {
        const elem = ret.appendChild(element("div"));
        if (calculated.numbersNotSeen.has(i)) {
            elem.classList.add("button");
            elem.appendChild(txt(String(i)));
            elem.addEventListener("click", e => {
                setNumber(position, i);
                render();
            });
        }
        // If number has been seen, the button won't be rendered
    }
    return ret;
}

function numCellSelectionScoreElement(selectionScore) {
    const ret = element("div", {class: ["num-score-box"]});
    ret.appendChild(txt(String(roundDecPl(selectionScore, 2).toFixed(2))));
    return ret;
}

/*** Rendering: Top Level ***/

function renderLineCells() {
    for (const [letter, cellElem] of Object.entries(lineCells)) {
        cellElem.innerHTML = "";
        cellElem.appendChild(lineCellElement(letter));
    }
}

function renderNumCells() {
    for (const [i, cellElem] of numCells.entries()) {
        cellElem.innerHTML = "";
        const cellElemInner = cellElem.appendChild(element("div"));

        const currNumber = state.knownNumbers[i];
        if (currNumber !== null) {
            cellElemInner.classList.add("button");
            cellElemInner.classList.add("num-box-revealed");
            cellElemInner.addEventListener("click", e => {
                setNumber(i, null);
                render();
            });
            cellElemInner.appendChild(txt(String(currNumber)));
        } else {
            if (calculated.remainToSelect === 0) continue;

            cellElemInner.classList.add("num-box");
            const selectionScore = calculated.selectionScores[i];
            assert(selectionScore !== null);
            cellElemInner.appendChild(numCellSelectionScoreElement(selectionScore));
            cellElemInner.appendChild(numCellButtonsElement(i));
        }

        if ((calculated.remainToSelect !== 4) && (calculated.selectionScores[i] === calculated.selectionScoresMax)) {
            cellElemInner.classList.add("num-box-highlight");
        }
    }
}

function renderPayouts() {
    payoutsDisp.innerHTML = "";
    for (const [i, payout] of payouts.entries()) {
        const elem = payoutsDisp.appendChild(element("div"));

        const scoreBox = elem.appendChild(element("div", {class: ["payouts-score-box"]}));
        scoreBox.appendChild(txt(String(i + 6)));

        const mgpBox = elem.appendChild(element("div", {class: ["payouts-mgp-box"]}));
        mgpBox.appendChild(txt(String(payout)));
    }
}

function render() {
    renderPayouts();
    renderNumCells();
    renderLineCells();
}

resetButton.addEventListener("click", e => {
    reset();
    render();
})

/*** State ***/

function setNumber(position, number) {
    state.knownNumbers[position] = number;
    checkState();
    doCalculation();
}

function doCalculation() {
    const noSelections = state.knownNumbers.every((e) => (e === null));
    if (USE_WORKAROUND && noSelections) {
        // Empty board is slow, so we use this hacky solution to speed it up.
        doCalculationWorkaround(); 
        return;
    }

    const start = new Date();
    calculated = calculate(state.knownNumbers, payouts);
    const end = new Date();
    const durationStr = roundDecPl(((end - start) / 1000), 2).toFixed(2) + "s";
    console.log(calculated);
    console.log("calculate() ran for " + durationStr + " (real time)");
}

function doCalculationWorkaround() {
    calculated = {
        linesAverages: {
            a: 360.3452380952381,
            b: 360.3452380952381,
            c: 360.3452380952381,
            d: 360.3452380952381,
            e: 360.3452380952381,
            f: 360.3452380952381,
            g: 360.3452380952381,
            h: 360.3452380952381,
        },
        selectionScores: [
            1510.4806216931217, // Cell 0
            1453.1979497354498, // Cell 1
            1510.4806216931217, // Cell 2
            1453.1979497354498, // Cell 3
            1510.1404431216934, // Cell 4
            1453.1979497354498, // Cell 5
            1510.4806216931217, // Cell 6
            1453.1979497354498, // Cell 7
            1510.4806216931217, // Cell 8
        ],
        selectionScoresMax: 0,

        numbersNotSeen: new Set([1,2,3,4,5,6,7,8,9]),
        remainToSelect: 4,
    };
}

function reset() {
    state = {
        knownNumbers: [
            null                         , null, null,
            ((FAST_BENCHMARK) ? 1 : null), null, null,
            null                         , null, null,
        ],
    };
    doCalculation();
    checkState();
}

function checkState() {
    const seenNumbers = new Set();
    for (const n of state.knownNumbers) {
        if (n === null) continue;
        assert((n > 0) && (n <= 9));
        assert(!seenNumbers.has(n));
        seenNumbers.add(n);
    }
}

let state = {}; // Minimal set of app state
let calculated = {}; // Values calculated from that state

reset();
render();
