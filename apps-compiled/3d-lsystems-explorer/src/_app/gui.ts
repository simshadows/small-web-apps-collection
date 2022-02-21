/*
 * Filename: index.ts
 * Author:   simshadows <contact@simshadows.com>
 * License:  GNU Affero General Public License v3 (AGPL-3.0)
 */

import "regenerator-runtime/runtime";

import * as dat from "dat.gui";

import "./index.css";

function setUpHilbertCurveVariables() {
    exposedVariables["Auto-Rotate"] = false;
    exposedVariables["Segment Length"] = 10;
    exposedVariables["Axis Rotation"] = 90;
    exposedVariables["Thickness Mod."] = 1;
    exposedVariables["Base Width"] = 0;
    exposedVariables["Axiom"] = "A";
    exposedVariables["Depth"] = 3;
    exposedVariables["Start Direction X"] = 1;
    exposedVariables["Start Direction Y"] = 0;
    exposedVariables["Start Direction Z"] = 0;
    exposedVariables.rules.F = "";
    exposedVariables.rules.X = "";
    exposedVariables.rules.Y = "";
    exposedVariables.rules.A = "B-F+CFC+F-D&F^D-F+&&CFC+F+B//";
    exposedVariables.rules.B = "A&F^CFB^F^D^^-F-D^|F^B|FC^F^A//";
    exposedVariables.rules.C = "|D^|F^B-F+C^F^A&&FA&F^C+F+B^F^D//";
    exposedVariables.rules.D = "|CFB-F+B|FA&F^A&&FB-F+B|FC//";
    exposedVariables.interpreterRules["[" ] = "";
    exposedVariables.interpreterRules["]" ] = "";
    exposedVariables.interpreterRules["^" ] = "xmrotate(-)";
    exposedVariables.interpreterRules["v" ] = "";
    exposedVariables.interpreterRules["+" ] = "ymrotate(+)";
    exposedVariables.interpreterRules["-" ] = "ymrotate(-)";
    exposedVariables.interpreterRules[">" ] = "";
    exposedVariables.interpreterRules["<" ] = "";
    exposedVariables.interpreterRules["/" ] = "zmrotate(+)";
    exposedVariables.interpreterRules["\\"] = "zmrotate(-)";
    exposedVariables.interpreterRules["&" ] = "xmrotate(+)";
    exposedVariables.interpreterRules["|" ] = "ymrotate(+180)";
}

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
            "F": "FF",
            "X": "F>-[[Y]<+Y]>+F[<+FX]<-X",
            "Y": "F<-[[X]>+X]<+F[>+FX]<-Y",
            "Z": "",
            "A": "",
            "B": "",
            "C": "",
            "D": "",
        },

        moreRules: {
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

        interpreterRules: {
            "F": "draw()",
            "f": "move()",
            "x": "",
            "y": "",
            "z": "",
            "[": "push()",
            "]": "pop()",

            "&": "",
            "^": "vrotate(+)",
            "v": "vrotate(-)",

            "+": "xrotate(+)",
            "-": "xrotate(-)",

            ">": "yrotate(+)",
            "<": "yrotate(-)",

            "/":  "zrotate(+)",
            "\\": "zrotate(-)",

            "|": "",
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
            "WIP: 3D Hilbert Curve, v1": () => {
                exposedVariables = getDefaultExposedVariables();
                setUpHilbertCurveVariables();
                gui.destroy();
                gui = getGUIObject();
                sceneResetHandler();
            },
            "WIP: 3D Hilbert Curve, v2": () => {
                exposedVariables = getDefaultExposedVariables();
                setUpHilbertCurveVariables();
                exposedVariables["Axiom"] = "X";
                exposedVariables.rules.X = "^<XF^<XFX-F^>>XFX&F+>>XFX-F>X->";
                exposedVariables.interpreterRules["^" ] = "xmrotate(+)";
                exposedVariables.interpreterRules["v" ] = "";
                exposedVariables.interpreterRules["+" ] = "ymrotate(+)";
                exposedVariables.interpreterRules["-" ] = "ymrotate(-)";
                exposedVariables.interpreterRules[">" ] = "zmrotate(+)";
                exposedVariables.interpreterRules["<" ] = "zmrotate(-)";
                exposedVariables.interpreterRules["/" ] = "";
                exposedVariables.interpreterRules["\\"] = "";
                exposedVariables.interpreterRules["&" ] = "xmrotate(-)";
                exposedVariables.interpreterRules["|" ] = "";
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

    const interpreter = gui.addFolder("Interpreter");
    interpreter.open();
    for (const key of Object.keys(exposedVariables.interpreterRules)) {
        interpreter.add(exposedVariables.interpreterRules, key)
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

