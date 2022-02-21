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
        "Segment Length":  1,
        "Axis Rotation":   30,
        "Thickness Init.": 1.2,
        "Thickness Mod.":  0.95,
        "Base Width":      16,

        "Axiom": "X",
        "Depth": 6,
        "Start Direction X": 0,
        "Start Direction Y": 1,
        "Start Direction Z": 0,

        rules: {
            "F": "FF",
            "X": "F>-[[Y]<+Y]>+F[<+FX]<-X",
            "Y": "F<-[[X]>+X]<+F[>+FX]<-Y",
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
        rules: {
            "X": "F*-[[Y]/+Y]*+F[/+FX]*-X",
            "Y": "F/-[[X]*+X]/+F[*+FX]/-Y",
        },
    });
}

export function getHilbertCurve1Preset(dst: any) {
    return mergeExposedVariables(dst, {
        "Segment Length":  10,
        "Axis Rotation":   90,
        "Thickness Init.": 1.2,
        "Thickness Mod.":  1,

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
            "&":  "xmrotate(+)",
            "^":  "xmrotate(-)",
            "+":  "ymrotate(+)",
            "-":  "ymrotate(-)",
            "/":  "zmrotate(+)",
            "\\": "zmrotate(-)",
            "|":  "ymrotate(+180)",
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
            "&":  "xmrotate(-)",
            "^":  "xmrotate(+)",
            "+":  "ymrotate(+)",
            "-":  "ymrotate(-)",
            "/":  "",
            "\\": "",
            "|":  "",

            ">":  "zmrotate(+)",
            "<":  "zmrotate(-)",
        },
    });
}

