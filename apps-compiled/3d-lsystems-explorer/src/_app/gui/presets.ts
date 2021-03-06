/*
 * Filename: presets.ts
 * Author:   simshadows <contact@simshadows.com>
 * License:  GNU Affero General Public License v3 (AGPL-3.0)
 *
 * Bypasses type-checking since I don't want to define the GUI variables object.
 */

// Modifies dst and returns it.
export function mergeExposedVariables(dst: any, src: any) {
    const {
        rules,
        interpreterRules,
        moreRules,
        ...rest
    } = src;
    const inner = {
        rules,
        interpreterRules,
        moreRules,
    };
    Object.assign(dst, rest);
    for (const [k, v] of Object.entries(inner)) {
        if (v === undefined) continue;
        Object.assign(dst[k], v);
    }
    return dst;
}

export function getTree1Preset(dst: any) {
    return mergeExposedVariables(dst, {
        "Segment Length":  0.4,
        "Axis Rotation":   30,
        "Thickness Init.": 0.8,
        "Thickness Mod.":  0.94,
        "Base Width":      16,

        "Axiom": "X",
        "Depth": 7,
        "Start Direction X": 0,
        "Start Direction Y": 1,
        "Start Direction Z": 0,

        rules: {
            "F": "FF",
            "X": "F[>>+X]F[>>>>-X]F[>>>>>+X]+X",
        },

        interpreterRules: {
            "^": "vrotate(+)",
            "v": "vrotate(-)",

            "+": "xrotate(+)",
            "-": "xrotate(-)",

            ">": "yrotate(+)",
            "<": "yrotate(-)",

            "/":  "zrotate(+)",
            "\\": "zrotate(-)",
        },
    });
}

export function getTree2Preset(dst: any) {
    getTree1Preset(dst);
    return mergeExposedVariables(dst, {
        "Segment Length":  1,
        "Thickness Init.": 1.2,
        "Thickness Mod.":  0.95,

        "Depth": 6,
        rules: {
            "X": "F>-[[Y]<+Y]>+F[<+FX]<-X",
            "Y": "F<-[[X]>+X]<+F[>+FX]<-Y",
        },
    });
}

export function getTree3Preset(dst: any) {
    getTree2Preset(dst);
    return mergeExposedVariables(dst, {
        rules: {
            "X": "F*-[[Y]/+Y]*+F[/+FX]*-X",
            "Y": "F/-[[X]*+X]/+F[*+FX]/-Y",
        },
    });
}

export function getTree4Preset(dst: any) {
    return mergeExposedVariables(dst, {
        "Segment Length":  3,
        "Axis Rotation":   23,
        "Thickness Init.": 0.2,
        "Thickness Mod.":  1,
        "Base Width":      16,

        "Axiom": "F",
        "Depth": 4,

        rules: {
            "F": "FF-[-F+F+F]+[+F-F-F]",
        },

        interpreterRules: {
            "+": "xrotate(+)",
            "-": "xrotate(-)",

            ">": "yrotate(+)",
            "<": "yrotate(-)",

            "^": "zrotate(+)",
            "v": "zrotate(-)",
        },
    });
}

export function getHilbertCurve1Preset(dst: any) {
    return mergeExposedVariables(dst, {
        "Segment Length":  10,
        "Axis Rotation":   90,
        "Thickness Init.": 1.2,

        "Axiom": "A",
        "Depth": 3,
        "Start Direction X": 1,
        "Start Direction Y": 0,
        "Start Direction Z": 0,

        rules: {
            "A": "B-F+CFC+F-D&F^D-F+&&CFC+F+B//",
            "B": "A&F^CFB^F^D^^-F-D^|F^B|FC^F^A//",
            "C": "|D^|F^B-F+C^F^A&&FA&F^C+F+B^F^D//",
            "D": "|CFB-F+B|FA&F^A&&FB-F+B|FC//",
        },

        interpreterRules: {
            "&":  "xrotate(+)",
            "^":  "xrotate(-)",
            "+":  "yrotate(+)",
            "-":  "yrotate(-)",
            "/":  "zrotate(+)",
            "\\": "zrotate(-)",
            "|":  "yrotate(+180)",
        },
    });
}

export function getHilbertCurve2Preset(dst: any) {
    getHilbertCurve1Preset(dst);
    return mergeExposedVariables(dst, {
        "Axiom": "X",
        rules: {
            "A": "",
            "B": "",
            "C": "",
            "D": "",
            "X": "^<XF^<XFX-F^>>XFX&F+>>XFX-F>X->",
        },
        interpreterRules: {
            "&":  "xrotate(-)",
            "^":  "xrotate(+)",
            "+":  "yrotate(+)",
            "-":  "yrotate(-)",
            "/":  "",
            "\\": "",
            "|":  "",

            ">":  "zrotate(+)",
            "<":  "zrotate(-)",
        },
    });
}

export function getSpiralPreset(dst: any) {
    return mergeExposedVariables(dst, {
        "Segment Length":  1,
        "Axis Rotation":   89,
        "Thickness Init.": 1.0,

        "Axiom": "A",
        "Depth": 500,
        "Start Direction X": 1,
        "Start Direction Y": 0,
        "Start Direction Z": 0.001,

        rules: {
            "A": "A+X",
            "X": "XF",
        },

        interpreterRules: {
            "+": "xrotate(+)",
            "-": "xrotate(-)",

            ">": "yrotate(+)",
            "<": "yrotate(-)",

            "^": "zrotate(+)",
            "v": "zrotate(-)",
        },
    });
}

export function getDebuggingPreset(dst: any) {
    return mergeExposedVariables(dst, {
        "Segment Length":  30,
        "Thickness Init.": 1.2,
        "Thickness Mod.":  1,
        "Base Width":      16,

        "Axiom": "F-\\F&F",
        "Depth": 6,
        "Start Direction X": 0,
        "Start Direction Y": 1,
        "Start Direction Z": 0,

        rules: {
            "X": "F>-[[Y]<+Y]>+F[<+FX]<-X",
        },

        interpreterRules: {
            "&": "vrotate(+)",

            "+": "xrotate(+)",
            "-": "xrotate(-)",

            ">": "yrotate(+)",
            "<": "yrotate(-)",

            "/":  "zrotate(+)",
            "\\": "zrotate(-)",
        },
    });
}

