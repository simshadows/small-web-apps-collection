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
        "Auto-Rotate": true,

        "Segment Length":    1,
        "Axis Rotation":     30,
        "Vertical Rotation": 30,
        "Thickness Init.":   1.2,
        "Thickness Mod.":    0.95,
        "Base Width": 16,
        "Sequence Max.": 500000,

        "Axiom": "X",
        "Depth": 6,
        "Start Direction X": 0,
        "Start Direction Y": 1,
        "Start Direction Z": 0,

        rules: {
            "A": "",
            "B": "",
            "F": "FF",
            "X": "F>-[[Y]<+Y]>+F[<+FX]<-X",
            "Y": "F<-[[X]>+X]<+F[>+FX]<-Y",
            "Z": "",
        },

        moreRules: {
            "C": "",
            "D": "",
            "E": "",
            "G": "",
            "H": "",
            "I": "",
            "J": "",
            "K": "",
            "L": "",
            "M": "",
            "N": "",
            "O": "",
            "P": "",
            "Q": "",
            "R": "",
            "S": "",
            "T": "",
            "U": "",
            "V": "",
            "W": "",
        },

        presets: {
            "Tree #1": () => {
                exposedVariables = getDefaultExposedVariables();
                // No operations since it's just the default values
                gui.destroy();
                gui = getGUIObject();
                sceneResetHandler();
            },
            "Tree #2": () => {
                exposedVariables = getDefaultExposedVariables();
                exposedVariables.rules.X = "F*-[[Y]/+Y]*+F[/+FX]*-X";
                exposedVariables.rules.Y = "F/-[[X]*+X]/+F[*+FX]/-Y";
                gui.destroy();
                gui = getGUIObject();
                sceneResetHandler();
            },
        },
    };
}

function getGUIObject() {
    const onFinish = () => {sceneResetHandler();};

    const gui = new dat.GUI({name: "L-Systems Controller"});
    gui.width = 320;
    gui.add(resetVariable, "Reset");
    gui.add(exposedVariables, "Auto-Rotate");

    const rendering = gui.addFolder("Rendering");
    rendering.open();
    rendering.add(exposedVariables, "Segment Length", 1, 100, 1)
        .onFinishChange(onFinish);
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

    const lsBasics = gui.addFolder("L-System Basic Parameters");
    lsBasics.open();
    lsBasics.add(exposedVariables, "Axiom")
        .onFinishChange(onFinish);
    lsBasics.add(exposedVariables, "Depth", 0, 100, 1)
        .onFinishChange(onFinish);
    lsBasics.add(exposedVariables, "Start Direction X", -1, 1, 0.01)
        .onFinishChange(onFinish);
    lsBasics.add(exposedVariables, "Start Direction Y", -1, 1, 0.01)
        .onFinishChange(onFinish);
    lsBasics.add(exposedVariables, "Start Direction Z", -1, 1, 0.01)
        .onFinishChange(onFinish);
    lsBasics.add(exposedVariables, "Sequence Max.", 50)
        .onFinishChange(onFinish);

    const lsRules = gui.addFolder("L-System Rules");
    lsRules.open();
    for (const key of Object.keys(exposedVariables.rules)) {
        lsRules.add(exposedVariables.rules, key)
            .onFinishChange(onFinish);
    }

    const lsMoreRules = gui.addFolder("L-System Rules (Extended)");
    for (const key of Object.keys(exposedVariables.moreRules)) {
        lsMoreRules.add(exposedVariables.moreRules, key)
            .onFinishChange(onFinish);
    }

    const presets = gui.addFolder("Presets");
    presets.open();
    for (const key of Object.keys(exposedVariables.presets)) {
        presets.add(exposedVariables.presets, key);
    }

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
        gui.destroy();
        gui = getGUIObject();
        sceneResetHandler();
    },
}

let sceneResetHandler = () => {};

let gui = getGUIObject();
