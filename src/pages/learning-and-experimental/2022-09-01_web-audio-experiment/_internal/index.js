/*
 * Filename: index.js
 * Author:   simshadows <contact@simshadows.com>
 * License:  Creative Commons Zero v1.0 Universal (CC0-1.0)
*/

import {runLivePlayer} from "./live-player.js";

const uploaderElem = document.querySelector("#file-uploader");
const startButtonElem = document.querySelector("#start-button");

async function startExperiments() {
    startButtonElem.disabled = true;
    if (uploaderElem.files.length !== 1) {
        throw new Error("Must have one file uploaded.");
    }
    const arrayBuffer = await uploaderElem.files[0].arrayBuffer();
    await runLivePlayer(arrayBuffer);
    startButtonElem.textContent = "Rerun Analysis";
    startButtonElem.disabled = false;
}

uploaderElem.addEventListener("change", () => {
    if (uploaderElem.files.length === 0) {
        startButtonElem.disabled = true;
    } else if (uploaderElem.files.length === 1) {
        startButtonElem.removeAttribute("style");
        startButtonElem.disabled = false;
    } else {
        throw new Error("File upload should never take multiple files.");
    }
    startButtonElem.textContent = "Start Analysis";
    if (uploaderElem.files.length === 1) {
        startExperiments();
    }
});

startButtonElem.addEventListener("click", startExperiments);

