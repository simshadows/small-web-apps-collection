import {
    type CreateFFmpegOptions,
    createFFmpeg,
    fetchFile,
} from "@ffmpeg/ffmpeg";

self.onmessage = async ({data: {files, href}}) => {
    console.log("Worker starting.");

    // TODO: The ffmpeg library should update their type declarations so we can fix this.
    const ffmpegOptions: CreateFFmpegOptions & {mainName: string} = {
        corePath: new URL("ffmpeg-n4-3-1-wasm-single-threaded/ffmpeg-core.js", href).href,
        mainName: "main",
        log: true,
    };
    const ffmpeg = createFFmpeg(ffmpegOptions);
    await ffmpeg.load();

    for (const file of files) {
        console.log(`Worker will process file: ${file.name}`);
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
    self.postMessage({
        videoData: ffmpeg.FS("readFile", "output.mp4"),
    });
};

