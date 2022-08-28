/*
 * Filename: index.ts
 * Author:   simshadows <contact@simshadows.com>
 * License:  GNU Affero General Public License v3 (AGPL-3.0)
 */

import "./index.css";

import {throwIfNull} from "./utils";

const videoElem: HTMLVideoElement = throwIfNull(document.querySelector("#player"));
const uploaderElem: HTMLInputElement = throwIfNull(document.querySelector("#uploader"));

const worker = new Worker(new URL('./web-worker.ts', import.meta.url));

async function startEncode(event: Event) {
    const target = event?.target as undefined | HTMLInputElement; // TODO: Implement proper type narrowing!
    if (!target) throw new Error("Unexpected undefined.");
    const files = target.files;
    if (!files) throw new Error("Unexpected falsy.");

    console.log("Sending data to worker.");
    worker.postMessage({
        files: files,
        href: document.location.href,
    });
}

worker.onmessage = ({data: {videoData}}) => {
    console.log("Received data back from worker.");
    videoElem.src = URL.createObjectURL(new Blob([videoData.buffer], {type: "video/mp4"}));
};

uploaderElem.addEventListener("change", startEncode);

