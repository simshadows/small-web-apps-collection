/*
 * Filename: index.js
 * Author:   simshadows <contact@simshadows.com>
 * License:  Creative Commons Zero v1.0 Universal (CC0-1.0)
*/

import {txt, element} from "./utils.js";

const AudioContext = window.AudioContext || window.webkitAudioContext; // for legacy browsers
const ac = new AudioContext();


/*
 * Bootstrapping stuff
 */

const uploaderElem = document.querySelector("#file-uploader");
const startButtonElem = document.querySelector("#start-button");

uploaderElem.addEventListener("change", () => {
    if (uploaderElem.files.length === 0) {
        startButtonElem.disabled = true;
    } else if (uploaderElem.files.length === 1) {
        startButtonElem.removeAttribute("style");
        startButtonElem.disabled = false;
    } else {
        throw new Error("File upload should never take multiple files.");
    }
});

startButtonElem.addEventListener("click", async () => {
    if (uploaderElem.files.length !== 1) {
        throw new Error("Must have one file uploaded.");
    }
    await run(uploaderElem.files[0]);
});


/*
 * Actual analysis stuff
 */

const liveVisualizerElem = document.querySelector("#live-visualizer");
const liveVisualizerCanvasElem = document.querySelector("#live-visualizer canvas");

async function run(file) {
    liveVisualizerElem.removeAttribute("style");
    const audioBuffer = await ac.decodeAudioData(await file.arrayBuffer());

    // Create nodes
    const sourceNode = new AudioBufferSourceNode(ac, {
        buffer: audioBuffer,
        loop: true,
    });
    const analyserNode = new AnalyserNode(ac);
    const javascriptNode = ac.createScriptProcessor(1024, 1, 1);

    // Connect the nodes together
    sourceNode.connect(ac.destination);
    sourceNode.connect(analyserNode);
    analyserNode.connect(javascriptNode);
    javascriptNode.connect(ac.destination);

    // Play audio
    sourceNode.start(0);

    javascriptNode.onaudioprocess = () => {
        // Read the frequency values
        const amplitudeArray = new Uint8Array(analyserNode.frequencyBinCount);

        // Get the time domain data for this sample
        analyserNode.getByteTimeDomainData(amplitudeArray);

        // Draw the display when the audio is playing
        if (ac.state === "running") {
            // Draw the time domain in the canvas
            requestAnimationFrame(() => {
                // Get the canvas 2d context
                const canvasContext = liveVisualizerCanvasElem.getContext("2d");

                // Clear the canvas
                canvasContext.clearRect(0, 0, liveVisualizerCanvasElem.width, liveVisualizerCanvasElem.height);

                // Draw the amplitude inside the canvas
                for (let i = 0; i < amplitudeArray.length; i++) {
                    const value = amplitudeArray[i] / 256;
                    const y = liveVisualizerCanvasElem.height - liveVisualizerCanvasElem.height * value;
                    canvasContext.fillStyle = "white";
                    canvasContext.fillRect(i, y, 1, 1);
                }
            });
        }
    };
}

