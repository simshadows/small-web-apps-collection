/*
 * Filename: utils.js
 * Author:   simshadows <contact@simshadows.com>
 * License:  Creative Commons Zero v1.0 Universal (CC0-1.0)
 */

export const txt = document.createTextNode.bind(document);
export function element(tagName, attributes={}) {
    const elem = document.createElement(tagName);
    for (const [k, v] of Object.entries(attributes)) {
        switch (k) {
            case "class": elem.classList.add(...((v instanceof Array) ? v : [v])); break;
            default: elem.setAttribute(k, v);
        }
    }
    return elem;
}

export function secondsToHumanReadable(totalSeconds) {
    const min = Math.floor(totalSeconds / 60);
    const sec = Math.floor(totalSeconds % 60);
    return `${min}:${String(sec).padStart(2, "0")}`;
}

