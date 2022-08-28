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

const uploaderElem: HTMLInputElement = throwIfNull(document.querySelector("#uploader"));

const progressBarElem: HTMLProgressElement = throwIfNull(document.querySelector("#progress progress"));
const progressMessageElem: HTMLLabelElement = throwIfNull(document.querySelector("#progress label"));

const restartButtonElem: HTMLButtonElement = throwIfNull(document.querySelector("#restart-button"));

const videoElem: HTMLVideoElement = throwIfNull(document.querySelector("#player"));

let worker: null | Worker = null;

function createWorker(): Worker {
    const newWorker = new Worker(new URL('./web-worker.ts', import.meta.url));
    newWorker.onmessage = ({data: {videoData, progress}}) => {
        console.log("Received data back from worker.");
        if (videoData) {
            videoElem.src = URL.createObjectURL(new Blob([videoData.buffer], {type: "video/mp4"}));
            videoElem.removeAttribute("style");
            restartButtonElem.innerHTML = "Rerun";
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
    const files = uploaderElem.files;
    if (files?.length === 0) return;

    setProgress(0, false);
    restartButtonElem.innerHTML = "Restart";
    restartButtonElem.removeAttribute("style");
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
        files,
        href: document.location.href,
        options: {
            framerate,
            crf,
            x264Preset,
        },
    });
}

uploaderElem.addEventListener("change", startEncode);
restartButtonElem.addEventListener("click", startEncode);

