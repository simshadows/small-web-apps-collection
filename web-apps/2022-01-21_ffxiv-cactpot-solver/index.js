/*
 * Filename: index.js
 * Author:   simshadows <contact@simshadows.com>
 * License:  GNU Affero General Public License v3 (AGPL-3.0)
 */

// Layout:
//        a b c d
//      e 0 1 2
//      f 3 4 5
//      g 6 7 8

const payoutsDisp = document.querySelector("#payouts-disp");

const lineCells = {
    a: document.querySelector("#cell-a"),
    b: document.querySelector("#cell-b"),
    c: document.querySelector("#cell-c"),
    d: document.querySelector("#cell-d"),
    e: document.querySelector("#cell-e"),
    f: document.querySelector("#cell-f"),
    g: document.querySelector("#cell-g"),
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

/*** DOM Helpers ***/

const txt = document.createTextNode.bind(document);

function element(tagName, attributes={}) {
    const elem = document.createElement(tagName);
    if ("id" in attributes) elem.setAttribute("id", attributes.id);
    if ("class" in attributes) {
        console.assert(attributes.class instanceof Array, "Class must be an array.");
        elem.classList.add(...attributes.class);
    }
    return elem;
}

/*** Rendering: Specifics ***/

function numCellElement() {
    const ret = element("div", {class: ["num-button"]});
    for (let i = 1; i <= 9; ++i) {
        const elem = ret.appendChild(element("div"));
        elem.appendChild(txt(String(i)));
    }
    return ret;
}

/*** Rendering: Top Level ***/

function renderLineCells() {
    for (const [letter, cellElem] of Object.entries(lineCells)) {
        cellElem.innerHTML = "";
        const elem = cellElem.appendChild(element("div", {class: ["line-button"]}));
        elem.appendChild(txt("x"));
    }
}

function renderNumCells() {
    for (const [i, cellElem] of numCells.entries()) {
        cellElem.innerHTML = "";
        cellElem.appendChild(numCellElement());
    }
}

function renderPayouts() {
    payoutsDisp.innerHTML = "";
    for (const [i, payout] of payouts.entries()) {
        const elem = payoutsDisp.appendChild(element("div"));
        elem.appendChild(txt(String(i + 6) + " --> " + String(payout)));
    }
}

function render() {
    renderPayouts();
    renderNumCells();
    renderLineCells();
}

render();

