/*
 * Filename: lsystems.ts
 * Author:   simshadows <contact@simshadows.com>
 * License:  GNU Affero General Public License v3 (AGPL-3.0)
 */

function validateRules(rules: Map<string, string>) {
    for (const [variable, _] of rules.entries()) {
        console.assert(variable.length === 1);
    }
}

export function processLSystem(axiom: string, rules: Map<string, string>, maxDepth: number): string {
    validateRules(rules);
    console.assert((maxDepth % 1 === 0) && (maxDepth > 0));

    let current = axiom;
    for (let i = 0; i < maxDepth; ++i) {
        let next = "";
        for (const character of current) {
            const substitution = rules.get(character);
            next += (substitution === undefined) ? character : substitution;
        }
        if (next === current) break; // Stop processing once it's done
        current = next;
    }
    return current;
}

