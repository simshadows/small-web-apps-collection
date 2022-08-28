# images-to-video

## Workarounds Used

Getting ffmpeg working was quite challenging due to `SharedArrayBuffer` being a highly restricted browser feature, but I mostly got it working via. [this issue](https://github.com/ffmpegwasm/ffmpeg.wasm/issues/137#issuecomment-1014956114). I obtained a compiled single-threaded copy of `@ffmpeg/core` (part of Jerome Wu's ffmpeg.wasm project) by creating a [ffmpegwasm/ffmpeg.wasm-core](https://github.com/ffmpegwasm/ffmpeg.wasm-core) fork on GitHub, enabling GitHub Workflows (their CI thing), checking out `n4.3.1-wasm`, pushing a dummy commit, and then waiting for GitHub Workflows to finish building the single-threaded ffmpeg. Massive pain in the ass.

`@ffmpeg/ffmpeg` also contains a hack that directly references a file within `node_modules`, which kept breaking my compilation. To fix it, I created a dummy Javascript file `node_modules\@ffmpeg\core\dist\ffmpeg-core.js`.

