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
const progressBarElem: HTMLProgressElement = throwIfNull(document.querySelector("#progress-bar"));
const uploaderElem: HTMLInputElement = throwIfNull(document.querySelector("#uploader"));

const worker = new Worker(new URL('./web-worker.ts', import.meta.url));

async function startEncode(event: Event) {
    const target = event?.target as undefined | HTMLInputElement; // TODO: Implement proper type narrowing!
    if (!target) throw new Error("Unexpected undefined.");
    const files = target.files;
    if (!files) throw new Error("Unexpected falsy.");

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
        files: files,
        href: document.location.href,
        options: {
            framerate,
            crf,
            x264Preset,
        },
    });
}

worker.onmessage = ({data: {videoData, progress}}) => {
    console.log("Received data back from worker.");
    if (videoData) {
        videoElem.src = URL.createObjectURL(new Blob([videoData.buffer], {type: "video/mp4"}));
    }
    progressBarElem.value = progress * 100;
};

uploaderElem.addEventListener("change", startEncode);

