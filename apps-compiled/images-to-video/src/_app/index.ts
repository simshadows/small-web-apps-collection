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

import {throwIfNull} from "./utils";

const videoElem: HTMLVideoElement = throwIfNull(document.querySelector("#player"));
const uploaderElem: HTMLInputElement = throwIfNull(document.querySelector("#uploader"));

// TODO: The ffmpeg library should update their type declarations so we can fix this.
const ffmpegOptions: CreateFFmpegOptions & {mainName: string} = {
    corePath: new URL("ffmpeg-n4-3-1-wasm-single-threaded/ffmpeg-core.js", document.location.href).href,
    mainName: "main",
    log: true,
};
const ffmpeg = createFFmpeg(ffmpegOptions);
const ffmpegLoadPromise = ffmpeg.load(); // Await this before running any ffmpeg commands

function run() {
    const transcode = async (event: Event) => {
        await ffmpegLoadPromise;

        const target = event?.target as undefined | HTMLInputElement; // TODO: Implement proper type narrowing!
        if (!target) throw new Error("Unexpected undefined.");
        const files = target.files;
        if (!files) throw new Error("Unexpected falsy.");

        for (const file of files) {
            console.log(file.name);
            ffmpeg.FS("writeFile", file.name, await fetchFile(file));
        }

        await ffmpeg.run(
            "-framerate", "10",
            "-pattern_type", "glob",
            "-i", "*.jpg",
            "-c:v", "libx264",
            "-pix_fmt", "yuv420p",
            "-crf", "15", // Very poor quality, should change it later
            "-preset", "ultrafast",
            "output.mp4",
        );
        const data = ffmpeg.FS("readFile", "output.mp4");

        videoElem.src = URL.createObjectURL(new Blob([data.buffer], {type: "video/mp4"}));
    }
    uploaderElem.addEventListener("change", transcode);
}

run();

