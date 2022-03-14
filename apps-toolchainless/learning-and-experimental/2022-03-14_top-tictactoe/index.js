const txt = document.createTextNode.bind(document);
function element(tagName, attributes={}) {
    const elem = document.createElement(tagName);
    for (const [k, v] of Object.entries(attributes)) {
        switch (k) {
            case "class":
                elem.classList.add(...((v instanceof Array) ? v : [v]));
                break;
            default:
                elem.setAttribute(k, v);
        }
    }
    return elem;
}

const state = {
    reset: function() {
        this.mode = "start"; // "start" | "playing"
        this.gb = new GameBoard();
    },
    startGame: function() {
        console.assert(this.mode === "start");
        this.mode = "playing";
    },
};

function GameBoard() {
    return {
        // grid represents a 3x3 board in row-major:
        //      [ 0, 1, 2,
        //        3, 4, 5,
        //        6, 7, 8 ]
        grid: new Array(9).fill(null),
    };
}

const render = (()=>{
    const playAreaElement = document.querySelector("#play-area");
    const bottomBarElement = document.querySelector("#bottom-bar");

    function renderPlaying() {
        console.log("UNIMPLEMENTED");
    }

    function renderStart() {
        const startButtonElem = bottomBarElement.appendChild(element("div", {class: "button"}));
        startButtonElem.appendChild(txt("Start Game!"))
        startButtonElem.addEventListener("click", () => state.startGame());
    }

    return function() {
        console.log(state);

        //playAreaElement.innerHTML = "";
        bottomBarElement.innerHTML = "";
        switch (state.mode) {
            case "start":   renderStart();   break;
            case "playing": renderPlaying(); break;
            default: throw `Unknown state ${state.mode}`;
        }
    }
})();

document.addEventListener("click", render);

state.reset();
render();

