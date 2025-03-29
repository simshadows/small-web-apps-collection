/*
 * Filename: index.js
 * Author:   simshadows <contact@simshadows.com>
 * License:  GNU Affero General Public License v3 (AGPL-3.0)
 */

//const assert = console.assert;

const inputElement = document.querySelector("#input");
const outputElement = document.querySelector("#output");

const calculator = (()=>{
    function calculateString(s) {
        const nums = s.split("*").map(x => BigInt(x.trim()));
        const result = nums.reduce((acc, curr) => acc * curr);
        console.log(result);
        return String(result);
    }
    
    return {
        calculateString,
    }
})();


function render() {
    const inputValue = String(inputElement.value);
    outputElement.value = calculator.calculateString(inputValue);
}

inputElement.addEventListener("change", render);
outputElement.addEventListener("change", render);

render();

