/*
 * Filename: index.ts
 * Author:   simshadows <contact@simshadows.com>
 * License:  GNU Affero General Public License v3 (AGPL-3.0)
 */

import "regenerator-runtime/runtime";
import {
    type CreateFFmpegOptions,
    createFFmpeg,
    fetchFile,
} from "@ffmpeg/ffmpeg";

import "./index.css";

import {element} from "./utils";

const bodyElem = document.querySelector("body")!;

function initialRender() {
    bodyElem.appendChild(element("video", {
        id:       "player",
        controls: true,
    }));
    bodyElem.appendChild(element("input", {
        id:   "uploader",
        type: "file",
    }));
}

function run() {
    // TODO: The ffmpeg library should update their type declarations so we can fix this.
    const ffmpegOptions: CreateFFmpegOptions & {mainName: string} = {
        corePath: new URL("ffmpeg-n4-3-1-wasm-single-threaded/ffmpeg-core.js", document.location.href).href,
        //corePath: 'static/js/ffmpeg-core.js',
        mainName: "main",
        log: true,
    };
    const ffmpeg = createFFmpeg(ffmpegOptions);

    const transcode = async (event: Event) => {
        const target = event?.target as undefined | HTMLInputElement; // TODO: Implement proper type narrowing!
        if (!target) throw new Error("Unexpected undefined.");
        const files = target.files;
        if (!files) throw new Error("Unexpected falsy.");
        const file = files[0];
        if (!file) throw new Error("Unexpected falsy.");
        const name = file.name;

        await ffmpeg.load();
        ffmpeg.FS("writeFile", name, await fetchFile(file));
        await ffmpeg.run("-i", name,  "output.mp4");
        const data = ffmpeg.FS("readFile", "output.mp4");

        const video = document.getElementById("player") as undefined | HTMLVideoElement;
        if (!video) throw new Error("Unexpected falsy.");
        video.src = URL.createObjectURL(new Blob([data.buffer], {type: "video/mp4"}));
    }
    document.getElementById("uploader")!.addEventListener("change", transcode);
}

initialRender();
run();

