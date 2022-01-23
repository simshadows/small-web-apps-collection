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

// Usage example:
//      const s = toShortFormString(decomposeNumericTimeDelta(x));
const ddtssFormats = {
    short: {d: "d", h: "h", m: "m", s: "s"},
    long: {d: " days", h: " hours", m: " minutes", s: " seconds"},
};
export function decomposedDeltaToString(decomposedTimeDelta, format="short") {
    const f = ddtssFormats[format];
    return ((decomposedTimeDelta.sign < 0) ? "-" : "") + (()=>{
        if (decomposedTimeDelta.days > 0) {
            return decomposedTimeDelta.days.toString() + f["d"];
        } else if (decomposedTimeDelta.hours > 0) {
            return decomposedTimeDelta.hours.toString() + f["h"];
        } else if (decomposedTimeDelta.minutes > 0) {
            return decomposedTimeDelta.minutes.toString() + f["m"];
        } else {
            return decomposedTimeDelta.seconds.toString() + f["s"];
        }
    })();
}

// This function was taken from:
//      <https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API#feature-detecting_localstorage>
//      (Accessed 2022-01-13)
//
// Typical usage:
//      storageAvailable("localStorage");
export function storageAvailable(type) {
    var storage;
    try {
        storage = window[type];
        var x = '__storage_test__';
        storage.setItem(x, x);
        storage.removeItem(x);
        return true;
    }
    catch(e) {
        return e instanceof DOMException && (
            // everything except Firefox
            e.code === 22 ||
            // Firefox
            e.code === 1014 ||
            // test name field too, because code might not be present
            // everything except Firefox
            e.name === 'QuotaExceededError' ||
            // Firefox
            e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
            // acknowledge QuotaExceededError only if there's something already stored
            (storage && storage.length !== 0);
    }
}

