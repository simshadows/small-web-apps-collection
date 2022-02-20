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
        "Axis Rot. Angle": 30,
    };
}

function getGUIObject() {
    const onFinish = () => {sceneResetHandler();};

    const gui = new dat.GUI({name: "L-Systems Controller"});
    gui.add(exposedVariables, "Auto Rotate");
    gui.add(exposedVariables, "Axis Rot. Angle", 0, 180, 1)
        .onFinishChange(onFinish);

    gui.add(resetVariable, "Reset");
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
        if (!confirm("Are you sure you want to reset the app?")) return;
        exposedVariables = getDefaultExposedVariables();
        sceneResetHandler();
        gui.destroy();
        gui = getGUIObject();
    },
}

let sceneResetHandler = () => {};

let gui = getGUIObject();

