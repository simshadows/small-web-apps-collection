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

// IMPORTANT: Never directly assign fields directly outside of the state definition.
//            Never directly access fields leading with an underscore.
//            (We could create field getter methods, but that would be unnecessary complication here.)
const state = {
    reset: function() {
        /*** Core State ***/
        this.mode = "start"; // "start" | "playing"
        this.player1turn = true;
        this._gameBoard = new GameBoard();

        /*** Player Data ***/
        // Note for Odin Project: Player data is too simple to necessitate a factory right now.
        this.player1isX = true;
        this.player1 = {
            name: "Player 1",
        };
        this.player2 = {
            name: "Player 2",
        };
    },
    startGame: function() {
        console.assert(this.mode === "start");
        this.mode = "playing";
    },
    closeGame: function() {
        this.mode = "start";
        this._gameBoard = new GameBoard();
    },

    getBoard: function() {
        return [...this._gameBoard.grid];
    },
    setMarker: function(position) {
        this._gameBoard.setMarker(position, (this.player1turn) ? 1 : -1);
        this.player1turn = !this.player1turn;
    },
};

// IMPORTANT: Never directly assign fields directly outside of the constructor definition.
// TODO: Put methods in prototype instead?
function GameBoard() {
    return {
        // grid represents a 3x3 board in row-major:
        //      [ 0, 1, 2,
        //        3, 4, 5,
        //        6, 7, 8 ]
        // Each element is either:
        //      0 = no marker
        //      1 = player 1's marker
        //      -1 = player 2's marker
        grid: new Array(9).fill(0),
        setMarker: function(position, player) {
            console.assert((position >= 0) && (position < 9));
            console.assert(this.grid[position] === 0);
            console.assert((player === -1) || (player === 1));
            this.grid[position] = player;
        }
    };
}

const render = (()=>{
    const playAreaElement = document.querySelector("#play-area");
    const bottomBarElement = document.querySelector("#bottom-bar");

    function renderPlaying() {
        /*** Play Area ***/
        playAreaElement.classList.add("playing");
        const boardElem = playAreaElement.appendChild(element("div", {id: "board"}));
        for (const [i, cellValue] of state.getBoard().entries()) {
            const cellElem = boardElem.appendChild(element("div", {"data-cell-index": String(i)}));
            if (cellValue === 0) {
                cellElem.classList.add("button");
                cellElem.addEventListener("click", (e) => {
                    const position = parseInt(e.target.dataset.cellIndex);
                    state.setMarker(position);
                });
            } else {
                cellElem.classList.add("marked-cell");
                const renderX = (cellValue === 1) !== (state.player1isX);
                cellElem.appendChild(txt(renderX ? "X" : "O"))
            }
        }

        /*** Bottom Bar ***/
        const restartButtonElem = bottomBarElement.appendChild(element("div", {class: "button"}));
        restartButtonElem.appendChild(txt("Restart"))
        restartButtonElem.addEventListener("click", () => state.closeGame());
    }

    function renderStart() {
        /*** Play Area ***/
        playAreaElement.classList.add("start");
        for (const [i, playerData] of [state.player1, state.player2].entries()) {
            const sectionElem = playAreaElement.appendChild(element("div"));

            const nameBoxElem = sectionElem.appendChild(element("div"));
            nameBoxElem.appendChild(txt(playerData.name));

            const isO = (!i) !== state.player1isX;

            const symbolBoxElem = sectionElem.appendChild(element("div"));
            symbolBoxElem.appendChild(txt(isO ? "O" : "X"));
        }

        /*** Bottom Bar ***/
        const startButtonElem = bottomBarElement.appendChild(element("div", {class: "button"}));
        startButtonElem.appendChild(txt("Start Game!"))
        startButtonElem.addEventListener("click", () => state.startGame());
    }

    return function() {
        console.log(state);

        playAreaElement.innerHTML = "";
        playAreaElement.removeAttribute("class");
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

