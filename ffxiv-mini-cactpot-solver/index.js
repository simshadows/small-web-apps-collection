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

import {
    calculate,
    calculateNumbersNotSeen,
} from "./algorithm.js";
import {
    getDefaultPayouts,
    intArraysAreEqual,
    getHardcodedValues,
} from "./hardcoded.js";

const USE_HARDCODED_VALUES = true;
const USE_ASYNC_UI = true;
const FAST_BENCHMARK_MODE = false;

const assert = console.assert;

const rightSection = document.querySelector("#app-right");

const payoutsDisp = document.querySelector("#payouts-disp");
const advancedButton = document.querySelector("#advanced-button");
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

function roundDecPl(n, p) {
    const a = Math.pow(10, p);
    return Math.round(n * a) / a;
}

// Close enough to be considered equal within an arbitrary tolerance.
function floatsAreEqual(a, b) {
    return Math.abs(a - b) < 0.00000000001;
}

/*** DOM Helpers ***/

const txt = document.createTextNode.bind(document);

function element(tagName, attributes={}) {
    const elem = document.createElement(tagName);
    for (const [k, v] of Object.entries(attributes)) {
        switch (k) {
            case "class":
                elem.classList.add(...((v instanceof Array) ? v : [v]));
                break;
            default:
                elem.setAttribute(k, v);
        }
    }
    return elem;
}

function toDisplayedNumberElement(n) {
    if (n === null) {
        if (state.useAsyncUI) {
            const elem = element("div", {class: "la-ball-pulse"});
            elem.appendChild(element("div", {class: "loading-spinner-custom"}));
            elem.appendChild(element("div", {class: "loading-spinner-custom"}));
            elem.appendChild(element("div", {class: "loading-spinner-custom"}));
            return elem;
        } else {
            return txt("?");
        }
    } else {
        return txt(roundDecPl(n, 2).toFixed(2));
    }
}

/*** Rendering: Specifics ***/

function lineCellElement(letter) {
    const ret = element("div", {class: "line-box"});
    const linesAverage = calculated.linesAverages[letter];

    if (state.advancedMode) {
        ret.appendChild(toDisplayedNumberElement(linesAverage));
    }

    if ((calculated.remainToSelect === 0) && floatsAreEqual(linesAverage, calculated.linesAveragesMax)) {
        ret.classList.add("line-box-best");
    }
    return ret;
}

function numCellButtonsElement(position) {
    const ret = element("div", {class: "num-box-buttongrid"});

    if (!state.advancedMode) ret.classList.add("num-box-buttongrid-simplemode");

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
    const ret = element("div", {class: "num-score-box"});
    ret.appendChild(toDisplayedNumberElement(selectionScore));
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

            if (state.advancedMode) {
                const selectionScore = calculated.selectionScores[i];
                cellElemInner.appendChild(numCellSelectionScoreElement(selectionScore));
            }

            cellElemInner.appendChild(numCellButtonsElement(i));
        }

        if ((calculated.remainToSelect !== 4) && floatsAreEqual(calculated.selectionScores[i], calculated.selectionScoresMax)) {
            cellElemInner.classList.add("num-box-highlight");
        }
    }
}

function renderPayouts() {
    rightSection.style.display = (state.advancedMode) ? "" : "none";

    payoutsDisp.innerHTML = "";
    for (const [i, payout] of state.payouts.entries()) {
        const elem = payoutsDisp.appendChild(element("div"));

        const scoreBox = elem.appendChild(element("div", {class: "payouts-score-box"}));
        scoreBox.appendChild(txt(String(i + 6)));

        const mgpBox = elem.appendChild(element("div", {class: "payouts-mgp-box"}));
        const textbox = mgpBox.appendChild(element("input", {type: "text"}));
        textbox.value = String(payout);
        textbox.addEventListener("change", e => {
            const mgpPayoutInput = e.target.value;
            setPayout(i + 6, mgpPayoutInput);
            render();
        });
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

advancedButton.addEventListener("click", e => {
    toggleAdvancedMode();
    render();
})

/*** Calculation ***/

const calcWrapper = (()=>{
    let calcWorker;

    function initWorker() {
        if (calcWorker !== undefined) calcWorker.terminate();
        calcWorker = new Worker("./worker.js", {type: "module"});
        calcWorker.onmessage = function(e) {
            const result = e.data[0];
            const knownNumbers = e.data[1];
            const payouts = e.data[2];
            const startTime = e.data[3];

            // We make sure state didn't change since it was called
            if (!intArraysAreEqual(knownNumbers, state.knownNumbers)) return;
            if (!intArraysAreEqual(payouts, state.payouts)) return;

            handleCalculationResult(result, startTime);
            render();
        };

        // We do a synchronous calculation as a fallback for browsers without
        // worker module support.
        calcWorker.onerror = function(e) {
            //e.preventDefault(); // We'll let the browser log the errors for debugging
            calcWorker.terminate()
            console.warn("Falling back to non-async calculations.");
            state.useAsyncUI = false;
            doCalculationSync(); // Complete the calculation in main thread
            render();
        };
    }

    function setDummyCalculatedValues() {
        // All these nulls should render as a placeholder in the Ui until real numbers are loaded in.
        const numbersNotSeen = calculateNumbersNotSeen(state.knownNumbers);
        calculated = {
            linesAverages: {
                a: null,
                b: null,
                c: null,
                d: null,
                e: null,
                f: null,
                g: null,
                h: null,
            },
            selectionScores: [null,null,null,null,null,null,null,null,null],
            selectionScoresMax: -1,

            numbersNotSeen: numbersNotSeen,
            remainToSelect: numbersNotSeen.size - 5,
        };
    }

    function handleCalculationResult(result, startTime) {
        calculated = result;
        const endTime = new Date();
        const durationStr = roundDecPl(((endTime - startTime) / 1000), 2).toFixed(2) + "s";
        console.log(calculated);
        console.log("calculate() ran for " + durationStr + " (real time)");
    }

    function applyHardcodedValues(hardcodedValues) {
        calculated.linesAverages = hardcodedValues.linesAverages;
        calculated.linesAveragesMax = Math.max(...Object.values(hardcodedValues.linesAverages));
        calculated.selectionScores = hardcodedValues.selectionScores;
        calculated.selectionScoresMax = Math.max(...hardcodedValues.selectionScores);
    }

    function doCalculationSync() {
        if (USE_HARDCODED_VALUES) {
            setDummyCalculatedValues();
            const hardcodedValues = getHardcodedValues(state.knownNumbers, state.payouts);
            if (hardcodedValues) {
                applyHardcodedValues(hardcodedValues);
                return;
            }

            const noSelections = state.knownNumbers.every((e) => (e === null));
            if (noSelections) return; // Initial state will have no calculated values
        }

        const start = new Date();
        const result = calculate(state.knownNumbers, state.payouts);
        handleCalculationResult(result, start);
    }

    function doCalculationAsync() {
        setDummyCalculatedValues();
        if (USE_HARDCODED_VALUES) {
            const hardcodedValues = getHardcodedValues(state.knownNumbers, state.payouts);
            if (hardcodedValues) {
                applyHardcodedValues(hardcodedValues);
                return;
            }
        }

        initWorker();
        const start = new Date();
        calcWorker.postMessage([state.knownNumbers, state.payouts, start]);
    }

    function doCalculation() {
        if (state.useAsyncUI) {
            doCalculationAsync();
        } else {
            doCalculationSync();
        }
    }

    // Run once to immediately fall back to non-async UI if needed
    initWorker();

    return {
        doCalculation,
    };
})();

/*** State ***/

function setNumber(position, number) {
    state.knownNumbers[position] = number;
    checkState();
    calcWrapper.doCalculation();
}

function setPayout(lineSum, mgpPayoutInput) {
    const mgpPayout = parseFloat(mgpPayoutInput);
    if (typeof mgpPayout !== "number") {
        console.warn("Invalid MGP payout input. Must parse to a number. Actual value: " + String(mgpPayoutInput));
        return;
    }
    if (Number.isNaN(mgpPayout)) {
        console.warn("Invalid MGP payout input. Must not be NaN. Actual value: " + String(mgpPayoutInput));
        return;
    }
    if (String(mgpPayout) !== mgpPayoutInput) {
        console.warn("Invalid MGP payout input. Must not partially parse. Actual value: " + String(mgpPayoutInput));
        return;
    }
    state.payouts[lineSum - 6] = mgpPayout;
    checkState();
    calcWrapper.doCalculation();
}

function reset() {
    state.knownNumbers = [
        null, null, null,
        null, null, null,
        null, null, null,
    ];
    if (FAST_BENCHMARK_MODE) state.knownNumbers[3] = 1;
    calcWrapper.doCalculation();
    checkState();
}

function toggleAdvancedMode() {
    state.advancedMode = !state.advancedMode;
    console.log(`Advanced Mode = ${state.advancedMode}`);
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

const state = {
    useAsyncUI: USE_ASYNC_UI && window.Worker,
    advancedMode: false,
    knownNumbers: undefined,
    payouts: getDefaultPayouts(),
};
let calculated = {};

reset();
render();

