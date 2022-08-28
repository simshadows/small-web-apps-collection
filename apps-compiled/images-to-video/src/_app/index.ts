/*
 * Filename: index.ts
 * Author:   simshadows <contact@simshadows.com>
 * License:  GNU Affero General Public License v3 (AGPL-3.0)
 */

import "./index.css";

import {throwIfNull, useDefaultIfNaN} from "./utils";

const framerateInputElem: HTMLInputElement = throwIfNull(document.querySelector("#framerate input"));
const crfInputElem: HTMLInputElement = throwIfNull(document.querySelector("#crf input"));

const videoElem: HTMLVideoElement = throwIfNull(document.querySelector("#player"));
const progressBarElem: HTMLProgressElement = throwIfNull(document.querySelector("#progress-bar"));
const uploaderElem: HTMLInputElement = throwIfNull(document.querySelector("#uploader"));

const worker = new Worker(new URL('./web-worker.ts', import.meta.url));

async function startEncode(event: Event) {
    const target = event?.target as undefined | HTMLInputElement; // TODO: Implement proper type narrowing!
    if (!target) throw new Error("Unexpected undefined.");
    const files = target.files;
    if (!files) throw new Error("Unexpected falsy.");

    // TODO: Implement input validation
    const framerate: number = useDefaultIfNaN(parseInt(framerateInputElem.value), 10);
    const crf: number = useDefaultIfNaN(parseInt(crfInputElem.value), 20);

    console.log("Sending data to worker.");
    worker.postMessage({
        files: files,
        href: document.location.href,
        options: {
            framerate,
            crf,
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

uploaderElem.addEventListener("change", startEncode);

