/*
 * Filename: live-player.js
 * Author:   simshadows <contact@simshadows.com>
 * License:  Creative Commons Zero v1.0 Universal (CC0-1.0)
*/

import {
    txt,
    element,
    secondsToHumanReadable,
} from "./utils.js";

const AudioContext = window.AudioContext || window.webkitAudioContext; // for legacy browsers
const ac = new AudioContext();

const canvasElem = document.querySelector("#live-player-simple-line-vis");
//const timeSliderElem = document.querySelector("#live-player-time-slider");

//const startButtonElem = document.querySelector("#live-player-start");
const stopButtonElem = document.querySelector("#live-player-stop");

const contextTimeTxtElem = document.querySelector("#live-player-context-time");
const performanceTimeTxtElem = document.querySelector("#live-player-performance-time");
const loopEnabledTxtElem = document.querySelector("#live-player-loop-enabled");
const loopStartTxtElem = document.querySelector("#live-player-loop-start");
const loopEndTxtElem = document.querySelector("#live-player-loop-end");

const callbacks = {
    cleanup:       () => {},
    //startPlayback: () => {},
    stopPlayback:  () => {},
}

//startButtonElem.addEventListener("click", () => callbacks.startPlayback());
stopButtonElem.addEventListener("click", () => callbacks.stopPlayback());

export async function runLivePlayer(arrayBuffer) {
    const audioBuffer = await ac.decodeAudioData(arrayBuffer);

    // Create nodes
    const sourceNode = new AudioBufferSourceNode(ac, {
        buffer: audioBuffer,
        loop: true,
    });
    const analyserNode = new AnalyserNode(ac);
    const scriptProcessorNode = ac.createScriptProcessor(1024, 1, 1);

    // Connect the nodes together
    sourceNode.connect(ac.destination);
    sourceNode.connect(analyserNode);
    analyserNode.connect(scriptProcessorNode);
    scriptProcessorNode.connect(ac.destination);

    // Play audio
    sourceNode.start(0);

    scriptProcessorNode.onaudioprocess = () => {
        contextTimeTxtElem.textContent = secondsToHumanReadable(ac.getOutputTimestamp().contextTime);
        performanceTimeTxtElem.textContent = secondsToHumanReadable(ac.getOutputTimestamp().performanceTime / 1000);
        loopEnabledTxtElem.textContent = sourceNode.loop;
        loopStartTxtElem.textContent = secondsToHumanReadable(sourceNode.loopStart);
        loopEndTxtElem.textContent = secondsToHumanReadable(sourceNode.loopEnd);

        const amplitudeArray = new Uint8Array(analyserNode.frequencyBinCount);
        analyserNode.getByteTimeDomainData(amplitudeArray);

        if (ac.state === "running") {
            requestAnimationFrame(() => {
                const canvasContext = canvasElem.getContext("2d");
                canvasContext.clearRect(0, 0, canvasElem.width, canvasElem.height);
                canvasContext.fillStyle = "white";
                for (let i = 0; i < amplitudeArray.length; i++) {
                    const value = amplitudeArray[i] / 256;
                    const y = canvasElem.height - canvasElem.height * value;
                    canvasContext.fillRect(i, y, 1, 1);
                }
            });
        }
    };

    // Doesn't work
    //callbacks.startPlayback = () => {
    //    console.log("Starting playback.");
    //    sourceNode.start();
    //};

    callbacks.stopPlayback = () => {
        console.log("Stopping playback.");
        sourceNode.stop();
    };

    callbacks.cleanup();
    callbacks.cleanup = () => {
        console.log("Cleaning up audio player.");
        // TODO: I'm actually not sure if this is appropriate cleanup
        sourceNode.disconnect();
        analyserNode.disconnect();
        scriptProcessorNode.disconnect();
    };
}

