import {dirname, resolve} from "path";
import {fileURLToPath} from "url";

import {execute} from "@yarnpkg/shell";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const yarnRoot = resolve(__dirname, "..");

const tclContentsPath = resolve(yarnRoot, "apps-toolchainless", "*");

/*** Argument Parse ***/

const args = process.argv.slice(2);
console.log("Build arguments:");
console.log(args);
console.log();

let buildOutputPath = resolve(yarnRoot, "dist");

let currOption = "";
for (const s of args) {
    if (currOption === "") {
        switch (s) {
            case "-o":
                currOption = "output";
                break;
            default:
                console.error(`Unknown argument: ${s}`);
        }
    } else {
        switch (currOption) {
            case "output":
                buildOutputPath = resolve(yarnRoot, s);
                break;
            default:
                console.error(`Unknown option: ${currOption}`);
        }
        currOption = "";
    }
}
if (currOption) {
    throw "Invalid arguments.";
}

console.log("");
console.log(`buildOutputPath = ${buildOutputPath}`);
console.log();


/*** Build ***/

let exitCode = 0;

async function compileWorkspace(workspaceName, outputRelPath) {
    const output3dLsystemsExplorer = resolve(buildOutputPath, outputRelPath);
    exitCode ||= await execute(`yarn workspace ${workspaceName} build -o ${output3dLsystemsExplorer}`);
}


await execute(`rm -r ${buildOutputPath}`);
exitCode ||= await execute(`mkdir ${buildOutputPath}`);
exitCode ||= await execute(`cp -r ${tclContentsPath} ${buildOutputPath}`);

await compileWorkspace("3d-lsystems-explorer", "3d-lsystems-explorer");
await compileWorkspace("images-to-video", "images-to-video");

console.log();
console.log(`Returning with exit code: ${exitCode}`);
process.exit(exitCode);

