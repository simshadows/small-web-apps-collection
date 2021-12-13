const display = document.querySelector("#display");
const buttons = document.querySelectorAll(".button");

let state;

function resetState() {
    state = {
        curr: "", // String
        prev: 0, // Number
        op: "add", // "add" | "subtract" | "multiply" | "divide"
        mode: "show-prev", // "show-prev" | "show-curr" | "error"
    }
}

function roundDecPl(n, p) {
    const a = Math.pow(10, p);
    return Math.round(n * a) / a;
}

function parseCurrStr(v) {
    if (v == "" || v == "-") return 0;
    return parseFloat(v);
}

function toDisplayablePrev(v) {
    if (v == 0) return "0";

    const magnitude = Math.floor(Math.log10(Math.abs(v)));
    if (magnitude > 9 || magnitude < -10) {
        const smallestStr = v.toExponential(0);
        if (smallestStr.length > 12) return "too long";
        return v.toExponential(12 - smallestStr.length);
    } else {
        const s = roundDecPl(v, 12 - Math.round(v).toFixed(0).length);
        return s.toFixed(12 - s.toFixed(0).length);
    }
}

function updateUI() {
    display.innerHTML = (()=>{
        switch (state.mode) {
            case "show-prev": return toDisplayablePrev(state.prev);
            case "show-curr": return (state.curr == "") ? "0" : state.curr;
            case "error": return "&macr;\\_(&#12484;)_/&macr;";
            default: "Unknown error.";
        }
    })();
}

// The exercise also required add/subtract/multiply/divide to be their own functions, but
// I don't want to do it that way.
function operate(a, b, op) {
    switch (op) {
        case "add":      return a + b;
        case "subtract": return a - b;
        case "multiply": return a * b;
        case "divide":   return a / b;
        default: throw "Invalid operation.";
    }
}

function doInput(v) {
    if (v == "clear") {
        resetState();
        updateUI();
        return;
    } else if (state.mode == "error") {
        return;
    }

    switch (v) {
        case "delete":
            state.curr = state.curr.slice(0, -1);
            state.mode = "show-curr";
            break;
        case "equals":
            state.prev = operate(state.prev, parseCurrStr(state.curr), state.op);
            state.curr = "";
            state.op = "add";
            state.mode = "show-prev";
            break;
        case "subtract":
            if (state.mode == "show-prev") {
                state.curr = "-";
                state.mode = "show-curr";
                break;
            }
        case "add":
        case "multiply":
        case "divide":
            state.prev = operate(state.prev, parseCurrStr(state.curr), state.op);
            state.op = v;
            state.mode = "show-prev";
            break;
        case ".":
            if (state.mode == "show-curr" && state.curr.includes(".")) break;
        default: // Assume to be a digit
            if (state.mode == "show-curr" && state.curr.length == 13) break;
            if (v == "0" && (state.curr == "0" || state.curr == "-")) break;
            state.curr = (state.mode == "show-prev") ? v : state.curr.concat(v);
            state.mode = "show-curr";
    }

    if (!isFinite(state.prev)) {
        state.mode = "error";
    }
    updateUI();
}

buttons.forEach(elem => {
    elem.addEventListener("click", e => {
        doInput(e.target.dataset.value);
    })
});

document.addEventListener("keydown", e => {
    const code = (()=>{
        if (e.key.match(/^[0-9]$/)) return e.key;
        switch (e.key) {
            case ".": return ".";
            case "+": return "add";
            case "-": return "subtract";
            case "*":
            case "x": return "multiply";
            case "/":
            case "\\": return "divide";
            case "=":
            case "Enter": return "equals";
            case "Escape": return "clear";
            case "z": if (!e.ctrlKey) return null;
            case "Backspace": return "delete";
            default: return null;
        }
    })();
    if (code != null) doInput(code);
});

resetState();
updateUI();

