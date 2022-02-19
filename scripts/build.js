import {dirname, resolve} from "path";
import {fileURLToPath} from "url";

import {execute} from "@yarnpkg/shell";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const yarnRoot = resolve(__dirname, "..");

const tclContentsPath = resolve(yarnRoot, "apps-toolchainless", "*");
const distPath = resolve(yarnRoot, "dist");

await execute(`rm -r ${distPath}`);
await execute(`mkdir ${distPath}`);
await execute(`cp -r ${tclContentsPath} ${distPath}`);

const output3dLsystemsExplorer = resolve(yarnRoot, "dist", "3d-lsystems-explorer");

await execute(`yarn workspace 3d-lsystems-explorer build -o ${output3dLsystemsExplorer}`);

