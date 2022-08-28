export function throwIfNull<T>(obj: T | null): T {
    if (obj === null) throw new Error("Unexpected null.");
    return obj;
}

export function useDefaultIfNaN(n: number, defaultValue: number): number {
    if (isNaN(n)) return defaultValue;
    return n;
}

// Don't need these yet
//export const txt = document.createTextNode.bind(document);
//
//export function element(tagName: string, attributes: {[k: string]: any;} = {}) {
//    const elem = document.createElement(tagName);
//    for (const [k, v] of Object.entries(attributes)) {
//        switch (k) {
//            case "class":
//                elem.classList.add(...((v instanceof Array) ? v : [v]));
//                break;
//            default:
//                elem.setAttribute(k, v);
//        }
//    }
//    return elem;
//}

