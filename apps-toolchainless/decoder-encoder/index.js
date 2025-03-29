/*
 * Filename: index.js
 * Author:   simshadows <contact@simshadows.com>
 * License:  GNU Affero General Public License v3 (AGPL-3.0)
 */

//const assert = console.assert;

const inputElement = document.querySelector("#input");
const outputElement = document.querySelector("#output");

function encodeWithEscape(s) {
    return escape(s);
}

function render() {
    const inputValue = String(inputElement.value);
    outputElement.value = encodeWithEscape(inputValue);
}

inputElement.addEventListener("change", render);
outputElement.addEventListener("change", render);

render();

