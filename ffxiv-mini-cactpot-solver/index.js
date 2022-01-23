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
    ret.appendChild(txt(Math.round(linesAverage).toFixed(0)));
    if ((calculated.remainToSelect === 0) && (linesAverage === Math.max(...Object.values(calculated.linesAverages)))) {
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
            cellElemInner.classList.add("num-box-revealed");
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
    assert(state.knownNumbers[position] === null);
    state.knownNumbers[position] = number;
    checkState();
    doCalculation();
}

function doCalculation() {
    calculated = calculate(state.knownNumbers, payouts);
    console.log(calculated);
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
        selectionScores: [0,0,0,0,0,0,0,0,0],
        selectionScoresMax: 0,

        numbersNotSeen: new Set([1,2,3,4,5,6,7,8,9]),
        remainToSelect: 4,
    };
}

function reset() {
    state = {
        knownNumbers: [
            null, null, null,
            null, null, null,
            null, null, null,
        ],
    };
    //doCalculation(); // If possible, please use this to organically recalculate the initial state
    doCalculationWorkaround(); // Only use this if the algorithm is too slow!
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

