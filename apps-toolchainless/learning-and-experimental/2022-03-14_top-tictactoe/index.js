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

function arraySum(arr) {
    return arr.reduce(((partialSum, x) => partialSum + x), 0);
}

// IMPORTANT: Never directly assign fields directly outside of the state definition.
//            Never directly access fields leading with an underscore. Those are private fields.
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
        this.player1turn = true;
        this._gameBoard = new GameBoard();
    },
    closeGame: function() {
        this.mode = "start";
    },

    getBoard: function() {
        return [...this._gameBoard.grid];
    },
    setMarker: function(position) {
        this._gameBoard.setMarker(position, (this.player1turn) ? 1 : -1);
        this.player1turn = !this.player1turn;
    },
    calculateWinConditions: function() {
        return this._gameBoard.calculateWinConditions();
    }
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
        },
        // calculateWinConditions returns line indices in the following scheme:
        //      0    1  2  3    4
        //           _______
        //      5   |X  X  X|
        //      6   |X  X  X|
        //      7   |X  X  X|
        calculateWinConditions: function() {
            const winningLinesTests = [
                [0, 4, 8],
                [0, 3, 6],
                [1, 4, 7],
                [2, 5, 8],
                [2, 4, 6],
                [0, 1, 2],
                [3, 4, 5],
                [6, 7, 8],
            ];
            const winningLines = [];
            const winningCells = new Set();
            let winner = 0;
            for (const [lineIndex, cellIndices] of winningLinesTests.entries()) {
                const sum = arraySum(cellIndices.map((e) => this.grid[e]));
                if ((sum === 3) || (sum === -3)) {
                    if (winner === 0) winner = sum / 3;
                    if (winner !== (sum / 3)) throw "There should never be two winners.";
                    winningLines.push(lineIndex);
                    for (const cellIndex of cellIndices) winningCells.add(cellIndex);
                }
            }
            return {
                player: winner,
                winningLines: winningLines,
                winningCells: winningCells,
            };
        },
    };
}

const render = (()=>{
    const playAreaElement = document.querySelector("#play-area");
    const bottomBarElement = document.querySelector("#bottom-bar");

    function makeSideElement(message) {
        const elem = element("div", {class: "side"});
        if (message) {
            const msgElem = elem.appendChild(element("span"));
            msgElem.appendChild(txt(message))
        }
        return elem;
    }

    function makeBoardElement(winState) {
        const elem = element("div", {id: "board"});
        for (const [i, cellValue] of state.getBoard().entries()) {
            const cellElem = elem.appendChild(element("div", {"data-cell-index": String(i)}));
            if ((cellValue === 0) && (winState.player === 0)) {
                cellElem.classList.add("button");
                cellElem.addEventListener("click", (e) => {
                    const position = parseInt(e.target.dataset.cellIndex);
                    state.setMarker(position);
                });
            } else {
                cellElem.classList.add("marked-cell");
                if (winState.winningCells.has(i)) cellElem.classList.add("winning-cell");
                const symbol = (()=>{
                    if (cellValue === 0) return "";
                    const renderX = (cellValue === -1) !== (state.player1isX);
                    return (renderX) ? "X" : "O";
                })();
                const contentElem = cellElem.appendChild(element("span"));
                contentElem.appendChild(txt(symbol))
            }
        }
        return elem;
    }

    function renderPlaying() {
        const winState = state.calculateWinConditions();

        /*** Play Area ***/
        const gameIsFinished = (winState.player !== 0);
        const message = (()=>{
            if (gameIsFinished) {
                const playerName = (winState.player === 1) ? state.player1.name : state.player2.name;
                const symbol = ((winState.player === 1) === state.player1isX) ? "X" : "O";
                return {
                    forPlayer1: (winState.player === 1),
                    contents: `${playerName} wins! Their symbol is ${symbol}.`,
                };
            } else {
                const playerName = state.player1turn ? state.player1.name : state.player2.name;
                const symbol = (state.player1turn === state.player1isX) ? "X" : "O";
                return {
                    forPlayer1: state.player1turn,
                    contents: `${playerName}'s turn! Your symbol is ${symbol}.`,
                };
            } 
        })();
        playAreaElement.classList.add("playing");
        playAreaElement.appendChild(makeSideElement(message.forPlayer1 ? message.contents : ""))
        playAreaElement.appendChild(makeBoardElement(winState))
        playAreaElement.appendChild(makeSideElement(message.forPlayer1 ? "" : message.contents))

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

