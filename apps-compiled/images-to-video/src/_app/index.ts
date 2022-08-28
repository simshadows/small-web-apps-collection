/*
 * Filename: index.ts
 * Author:   simshadows <contact@simshadows.com>
 * License:  GNU Affero General Public License v3 (AGPL-3.0)
 */

import "./index.css";

import {throwIfNull, useDefaultIfNaN} from "./utils";

const framerateInputElem: HTMLInputElement = throwIfNull(document.querySelector("#framerate input"));
const qualityInputElem: HTMLSelectElement = throwIfNull(document.querySelector("#quality select"));
const x264PresetInputElem: HTMLSelectElement = throwIfNull(document.querySelector("#x264-preset select"));

const videoElem: HTMLVideoElement = throwIfNull(document.querySelector("#player"));
const uploaderElem: HTMLInputElement = throwIfNull(document.querySelector("#uploader"));

const progressBarElem: HTMLProgressElement = throwIfNull(document.querySelector("#progress progress"));
const progressMessageElem: HTMLLabelElement = throwIfNull(document.querySelector("#progress label"));

let worker: null | Worker = null;

function createWorker(): Worker {
    const newWorker = new Worker(new URL('./web-worker.ts', import.meta.url));
    newWorker.onmessage = ({data: {videoData, progress}}) => {
        console.log("Received data back from worker.");
        if (videoData) {
            videoElem.src = URL.createObjectURL(new Blob([videoData.buffer], {type: "video/mp4"}));
        }
        setProgress(progress, videoData);
    };
    return newWorker;
}

function setProgress(v: number, done: boolean): void {
    progressBarElem.value = v * 100;
    progressMessageElem.innerHTML = done ? "Done!" : `Running... ${Math.trunc(v * 100)}%`;
}

async function startEncode() {
    setProgress(0, false);
    worker?.terminate();
    worker = createWorker();

    const framerate: number = Math.min(600, Math.max(1, useDefaultIfNaN(parseInt(framerateInputElem.value), 10)));
    const crf: number = (()=>{
        switch (qualityInputElem.value) {
            case "worst-quality": return 51;
            default: console.error("Invalid quality input."); // Intentional fallthrough
            case "decent-quality": return 20;
            case "best-quality":  return 0;
        }
    })();
    const x264Preset: string = x264PresetInputElem.value;

    console.log("Sending data to worker.");
    worker.postMessage({
        files: uploaderElem.files,
        href: document.location.href,
        options: {
            framerate,
            crf,
            x264Preset,
        },
    });
}

uploaderElem.addEventListener("change", startEncode);

