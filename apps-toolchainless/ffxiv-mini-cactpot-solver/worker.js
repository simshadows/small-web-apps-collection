/*
 * Filename: worker.js
 * Author:   simshadows <contact@simshadows.com>
 * License:  GNU Affero General Public License v3 (AGPL-3.0)
 */

import {calculate} from "./algorithm.js";

onmessage = (e) => {
    const knownNumbers = e.data[0];
    const payouts = e.data[1];
    const startTime = e.data[2];

    const result = calculate(knownNumbers, payouts);
    postMessage([result, knownNumbers, payouts, startTime]);
}

