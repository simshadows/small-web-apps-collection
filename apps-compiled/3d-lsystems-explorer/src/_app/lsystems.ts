/*
 * Filename: lsystems.ts
 * Author:   simshadows <contact@simshadows.com>
 * License:  GNU Affero General Public License v3 (AGPL-3.0)
 */

function validateRules(rules: {[Key in string]: string;}) {
    for (const variable of Object.keys(rules)) {
        console.assert(variable.length === 1);
    }
}

export function processLSystem(axiom: string, rules: {[Key in string]: string;}, maxDepth: number): string {
    console.assert(axiom.length > 0);
    validateRules(rules);
    console.assert((maxDepth % 1 === 0) && (maxDepth > 0));

    let current = axiom;
    for (let i = 0; i < maxDepth; ++i) {
        let next = "";
        for (const character of current) {
            const substitution = rules[character];
            next += (substitution === undefined) ? character : substitution;
        }
        if (next === current) break; // Stop processing once it's done
        current = next;
    }
    return current;
}

