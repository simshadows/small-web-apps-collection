export const millisecondsInADay = 1000 * 60 * 60 * 24;

export function deepcopy(obj) {
    if (obj === null) return null;
    switch (typeof obj) {
        case "undefined":
        case "boolean":
        case "number":
        case "bigint":
        case "string":
            return obj;
        case "object":
            // Hyperspecific type checking to avoid unintended behaviour.
            // This function should not support user-defined classes.
            if (obj.constructor === Map) {
                const newMap = new Map();
                for (const [k, v] of obj.entries()) {
                    newMap.set(deepcopy(k), deepcopy(v));
                }
                return newMap;
            } else if (obj.constructor === Array) {
                return obj.map(deepcopy);
            } else if (obj.constructor === Object) {
                const newObj = {};
                // Only copies enumerable own properties.
                for (const [k, v] of Object.entries(obj)) {
                    newObj[deepcopy(k)] = deepcopy(v); // Doesn't handle symbol keys yet
                }
                return newObj;
            }
            throw "Unsupported prototype.";
        default:
            throw "Unsupported typeof value.";
    }
}

// Decomposes a numeric time delta into components.
//
// Usage example:
//      const a = Date.now();
//      const b = Date.now();
//      const delta = decomposeNumericTimeDelta(b - a);
export function decomposeNumericTimeDelta(numericTimeDelta) {
    const ret = { sign: Math.sign(numericTimeDelta) };
    let d = Math.abs(numericTimeDelta);

    function divide(divisor) {
        const v = d % divisor;
        d = (d - v) / divisor;
        console.assert(Number.isInteger(d), "Expected an integer.");
        return v;
    }
    ret.milliseconds = divide(1000);
    ret.seconds = divide(60);
    ret.minutes = divide(60);
    ret.hours = divide(24);
    ret.days = d;
    return ret;
}

