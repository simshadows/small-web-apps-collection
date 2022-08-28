import {
    type CreateFFmpegOptions,
    createFFmpeg,
    fetchFile,
} from "@ffmpeg/ffmpeg";

const reExtension = /\.[a-z0-9]+$/;

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

        // Fetch files while also counting extensions
        let extensions: Map<string, number> = new Map();
        for (const file of files) {
            const extension: string | undefined = file.name.toLowerCase().match(reExtension)?.[0];
            if (extension) {
                extensions.set(extension, (extensions.get(extension) || 0) + 1);
            }
            ffmpeg.FS("writeFile", file.name, await fetchFile(file));
        }
        const dominantExtension: string = [...extensions.entries()].sort((a,b) => b[1] - a[1])?.[0]?.[0] || ".jpg";

        ffmpeg.setProgress(({ratio}) => {
            self.postMessage({
                videoData: null,
                progress: ratio,
            });
        });

        await ffmpeg.run(
            "-framerate", String(options.framerate),
            "-pattern_type", "glob",
            "-i", `*${dominantExtension}`,
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

