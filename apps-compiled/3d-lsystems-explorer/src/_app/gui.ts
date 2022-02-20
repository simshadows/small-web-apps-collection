/*
 * Filename: index.ts
 * Author:   simshadows <contact@simshadows.com>
 * License:  GNU Affero General Public License v3 (AGPL-3.0)
 */

import "regenerator-runtime/runtime";

import * as dat from "dat.gui";

import "./index.css";

function getDefaultExposedVariables() {
    return {
        "Auto Rotate": true,

        "Axis Rotation": 30,
        "Vertical Rotation": 30,
        "Thickness Init.": 1.2,
        "Thickness Mod.": 0.95,

        "Base Width": 16,
    };
}

function getGUIObject() {
    const onFinish = () => {sceneResetHandler();};

    const gui = new dat.GUI({name: "L-Systems Controller"});
    gui.add(resetVariable, "Reset");
    gui.add(exposedVariables, "Auto Rotate");

    const rendering = gui.addFolder("Rendering");
    rendering.add(exposedVariables, "Axis Rotation", 0, 180, 1)
        .onFinishChange(onFinish);
    rendering.add(exposedVariables, "Vertical Rotation", -180, 180, 1)
        .onFinishChange(onFinish);
    rendering.add(exposedVariables, "Thickness Init.", 0.1, 10, 0.1)
        .onFinishChange(onFinish);
    rendering.add(exposedVariables, "Thickness Mod.", 0.8, 1, 0.01)
        .onFinishChange(onFinish);
    rendering.add(exposedVariables, "Base Width", 0, 100, 1)
        .onFinishChange(onFinish);

    return gui;
}

export function guiValues() {
    return exposedVariables;
}

export function setSceneResetHandler(fn: () => void) {
    sceneResetHandler = fn;
}

let exposedVariables = getDefaultExposedVariables();
const resetVariable = {
    "Reset": () => {
        if (!confirm("Are you sure you want to reset all values?")) return;
        exposedVariables = getDefaultExposedVariables();
        sceneResetHandler();
        gui.destroy();
        gui = getGUIObject();
    },
}

let sceneResetHandler = () => {};

let gui = getGUIObject();

