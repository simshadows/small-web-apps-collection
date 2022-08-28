import {
    type CreateFFmpegOptions,
    createFFmpeg,
    fetchFile,
} from "@ffmpeg/ffmpeg";

self.onmessage = async ({data: {files, href, options}}) => {
    console.log("Worker starting.");
    console.log(`Framerate: ${options.framerate}`);
    console.log(`CRF: ${options.crf}`);
    console.log(`x264 Preset: ${options.x264Preset}`);

    // TODO: The ffmpeg library should update their type declarations so we can fix this.
    const ffmpegOptions: CreateFFmpegOptions & {mainName: string} = {
        corePath: new URL("ffmpeg-n4-3-1-wasm-single-threaded/ffmpeg-core.js", href).href,
        mainName: "main",
        log: true,
    };
    const ffmpeg = createFFmpeg(ffmpegOptions);

    try {
        await ffmpeg.load();

        for (const file of files) {
            console.log(`Worker will process file: ${file.name}`);
            ffmpeg.FS("writeFile", file.name, await fetchFile(file));
        }

        ffmpeg.setProgress(({ratio}) => {
            self.postMessage({
                videoData: null,
                progress: ratio,
            });
        });

        await ffmpeg.run(
            "-framerate", String(options.framerate),
            "-pattern_type", "glob",
            "-i", "*.jpg",
            "-c:v", "libx264",
            "-pix_fmt", "yuv420p",
            "-crf", String(options.crf),
            "-preset", options.x264Preset,
            "output.mp4",
        );
        console.log("Worker has finished encoding.");
        self.postMessage({
            videoData: ffmpeg.FS("readFile", "output.mp4"),
            progress: 1,
        });
    } finally {
        await ffmpeg.exit();
    }
};

