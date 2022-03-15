/*
 * Filename: index.js
 * Author:   simshadows <contact@simshadows.com>
 * License:  GNU Affero General Public License v3 (AGPL-3.0)
 */

const txt = document.createTextNode.bind(document);
function element(tagName, attributes={}) {
    const elem = document.createElement(tagName);
    for (const [k, v] of Object.entries(attributes)) {
        if (k === "class") {
            elem.classList.add(...((v instanceof Array) ? v : [v]));
        } else {
            elem.setAttribute(k, v);
        }
    }
    return elem;
}

function arraySum(arr) {
    return arr.reduce(((partialSum, x) => partialSum + x), 0);
}
function randomElement(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

// IMPORTANT: Never directly assign fields from outside of the state definition.
//            Never directly access fields/methods that lead with an underscore from outside of the state definition.
//            (We could create field getter methods, but that would be unnecessary complication here.)
const state = {
    reset: function() {
        /*** Core State ***/
        this.mode = "start"; // "start" | "playing"
        this.player1turn = true;
        this._gameBoard = new GameBoard();

        /*** Player Data ***/
        // Note for Odin Project: Player data is too simple to necessitate a factory here.
        this.player1 = {
            name: "Player 1",
            symbol: "X", // "X" | "O"
            type: "Human",  // "Human" | "Computer (Random)"
        };
        this.player2 = {
            name: "Player 2",
            symbol: "O",
            type: "AI (Hard)",
        };
    },
    startGame: function() {
        console.assert(this.mode === "start");
        this.mode = "playing";
        this.player1turn = true;
        this._gameBoard = new GameBoard();
        this._tryExecuteComputerMove();
    },
    closeGame: function() {
        this.mode = "start";
    },

    getGameBoard: function() {
        return this._gameBoard.clone();
    },

    setName: function(player, newName) {
        const playerObj = (player === 1) ? this.player1 : this.player2;
        playerObj.name = newName;
    },
    swapSymbols: function() {
        [this.player1.symbol, this.player2.symbol] = [this.player2.symbol, this.player1.symbol];
    },
    changePlayerType: function(player) {
        const playerObj = (player === 1) ? this.player1 : this.player2;
        const typesList = ["Human", "AI (Loser)", "AI (Easy)", "AI (Medium)", "AI (Hard)", "Human"];
        playerObj.type = typesList[typesList.indexOf(playerObj.type) + 1];
    },
    setMarker: function(position) {
        this._gameBoard.setMarker(position, (this.player1turn) ? 1 : -1);
        this.player1turn = !this.player1turn;
        this._tryExecuteComputerMove();
    },

    _tryExecuteComputerMove: function() {
        const playerObj = (this.player1turn) ? this.player1 : this.player2;
        if ((playerObj.type === "Human") || (this._gameBoard.calculateWinner() !== null)) return;
        this.setMarker(playSuggestors[playerObj.type](this._gameBoard, (this.player1turn ? 1 : -1)));
    },
};

// IMPORTANT: Never directly assign fields directly outside of the constructor definition.
// TODO: Put methods in prototype instead?
function GameBoard() {
    // grid represents a 3x3 board in row-major:
    //      [ 0, 1, 2,
    //        3, 4, 5,
    //        6, 7, 8 ]
    // Each element is either:
    //      0 = no marker
    //      1 = player 1's marker
    //      -1 = player 2's marker
    this.grid = new Array(9).fill(0);

    this.setMarker = function(position, player) {
        console.assert((position >= 0) && (position < 9) && (this.grid[position] === 0));
        console.assert((player === -1) || (player === 1));
        this.grid[position] = player;
    };

    this.calculateWinner = function() {
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
        const winningCells = new Set();
        let winner = 0;
        for (const [lineIndex, cellIndices] of winningLinesTests.entries()) {
            const sum = arraySum(cellIndices.map((e) => this.grid[e]));
            if ((sum === 3) || (sum === -3)) {
                console.assert((winner === 0) || (winner === (sum / 3)));
                winner = sum / 3;
                for (const cellIndex of cellIndices) winningCells.add(cellIndex);
            }
        }

        // If we have no winner, we check if it's a draw.
        if ((winner === 0) && this.grid.some((v) => (v === 0))) return null;
        return {
            player: winner, // This is 0 if it's a draw, 1 if player 1 won, -1 if player 2 won.
            winningCells: winningCells,
        };
    };

    this.clone = function() {
        const obj = new (Object.getPrototypeOf(this).constructor)();
        obj.grid = [...this.grid];
        return obj;
    };
}

const render = (()=>{
    const playAreaElement = document.querySelector("#play-area");
    const bottomBarElement = document.querySelector("#bottom-bar");

    const messageMap = {
        "turn": "Your turn!",
        "draw": "Draw!",
        "winner": "Winner!",
        "loser": "Loser!",
        "none": "",
    };

    function makeSideElement(playerData, messageType) {
        const elem = element("div", {class: ["side", "clipsafe", `is-${messageType}`]});

        const msgElem = elem.appendChild(element("span"));
        msgElem.appendChild(txt(messageMap[messageType]))

        const playerCardElem = elem.appendChild(element("div", {class: "clipsafe"}));
        const symbolElem = playerCardElem.appendChild(element("span", {class: "symbol"}));
        symbolElem.appendChild(txt(playerData.symbol))
        const nameElem = playerCardElem.appendChild(element("span", {class: ["name", "clipsafe"]}));
        nameElem.appendChild(txt(playerData.name))

        return elem;
    }

    function makeBoardElement(currPlayer, winState) {
        const elem = element("div", {id: "board"});
        for (const [i, cellValue] of state.getGameBoard().grid.entries()) {
            const cellElem = elem.appendChild(element("div"));
            if ((winState === null) && (cellValue === 0)) {
                cellElem.classList.add("unmarked-cell");
                cellElem.classList.add("button");
                cellElem.addEventListener("click", () => state.setMarker(i));
                const contentElem = cellElem.appendChild(element("span"));
                contentElem.appendChild(txt(currPlayer.symbol))
            } else {
                cellElem.classList.add("marked-cell");
                if (winState?.winningCells.has(i)) cellElem.classList.add("winning-cell");
                const symbol = (()=>{
                    if (cellValue === 0) return "";
                    return (cellValue === 1) ? state.player1.symbol : state.player2.symbol;
                })();
                const contentElem = cellElem.appendChild(element("span"));
                contentElem.appendChild(txt(symbol))
            }
        }
        return elem;
    }

    function renderPlaying() {
        const winState = state.getGameBoard().calculateWinner();
        const currPlayer = state.player1turn ? state.player1 : state.player2;

        const [p1messageType, p2messageType] = (()=>{
            if (winState === null) return (state.player1turn) ? ["turn", "none"] : ["none", "turn"];
            if (winState.player === 0) return ["draw", "draw"];
            return (winState.player === 1) ? ["winner", "loser"] : ["loser", "winner"];
        })();

        /*** Play Area ***/
        playAreaElement.classList.add("playing");
        playAreaElement.appendChild(makeSideElement(state.player1, p1messageType));
        playAreaElement.appendChild(makeBoardElement(currPlayer, winState))
        playAreaElement.appendChild(makeSideElement(state.player2, p2messageType));

        /*** Bottom Bar ***/
        const restartButtonElem = bottomBarElement.appendChild(element("div", {class: "button"}));
        restartButtonElem.appendChild(txt("Restart"))
        restartButtonElem.addEventListener("click", () => state.closeGame());
    }

    function renderStart() {
        /*** Play Area ***/
        playAreaElement.classList.add("start");
        for (const [i, playerData] of [[1, state.player1], [-1, state.player2]]) {
            const sectionElem = playAreaElement.appendChild(element("div"));

            const symbolBoxElem = sectionElem.appendChild(element("div", {class: ["button", "symbol"]}));
            symbolBoxElem.appendChild(txt(playerData.symbol));
            symbolBoxElem.addEventListener("click", () => state.swapSymbols());

            const nameBoxElem = sectionElem.appendChild(element("input", {value: playerData.name}));
            nameBoxElem.addEventListener("click", (e) => e.stopPropagation()); // Avoid rerender
            nameBoxElem.addEventListener("change", (e) => state.setName(i, e.target.value));

            const typeElem = sectionElem.appendChild(element("div", {class: ["button", "player-type"]}));
            typeElem.appendChild(txt(playerData.type));
            typeElem.addEventListener("click", () => state.changePlayerType(i));
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

const playSuggestors = (()=>{
    function minimax(gameBoard, emptyCells, asPlayer, currPlayer, doMaximize) {
        const ret = {
            suggestedMove: null,
            score: doMaximize ? -2 : 2,
        };
        const winState = gameBoard.calculateWinner();
        if (winState === null) {
            for (const [i, cellIndex] of emptyCells.entries()) {
                const newEmptyCells = [...emptyCells];
                const newGameBoard = gameBoard.clone();
                newEmptyCells.splice(i, 1); // Remove element at i
                newGameBoard.setMarker(cellIndex, currPlayer);
                const result = minimax(newGameBoard, newEmptyCells, asPlayer, (currPlayer * -1), !doMaximize);
                if ((doMaximize && (result.score >= ret.score)) || (!doMaximize && (result.score <= ret.score))) {
                    if ((result.score === ret.score) && (Math.random() > 0.33)) continue; // Adds some stochastic behaviour
                    ret.suggestedMove = cellIndex;
                    ret.score = result.score;
                }
            }
        } else {
            ret.score = asPlayer * winState.player; // 1 if asPlayer matches winner, 0 if winner is 0 (i.e. it's a draw)
        }
        return ret;
    }
    function suggestPlayWithMinimax(gameBoard, asPlayer, doMaximize) {
        const emptyCells = [...gameBoard.grid.entries()].filter(([_, v]) => (v === 0)).map(([i, _]) => i);
        console.assert(emptyCells.length > 0);
        return minimax(gameBoard, emptyCells, asPlayer, asPlayer, doMaximize).suggestedMove;
    }
    function suggestPlayRandomly(gameBoard) {
        const emptyCells = [...gameBoard.grid.entries()].filter(([_, v]) => (v === 0));
        console.assert(emptyCells.length > 0);
        return randomElement(emptyCells)[0];
    }

    function suggestPlayWithMinimaxSometimes(gameBoard, asPlayer, difficulty) {
        if (Math.random() > 0.4) {
            return suggestPlayWithMinimax(gameBoard, asPlayer, true);
        } else {
            return suggestPlayRandomly(gameBoard);
        }
    }

    return {
        "AI (Hard)":   (gameBoard, asPlayer) => suggestPlayWithMinimax(gameBoard, asPlayer, true),
        "AI (Medium)": (gameBoard, asPlayer) => suggestPlayWithMinimaxSometimes(gameBoard, asPlayer, 0.5),
        "AI (Easy)":   (gameBoard, _       ) => suggestPlayRandomly(gameBoard),
        "AI (Loser)":  (gameBoard, asPlayer) => suggestPlayWithMinimax(gameBoard, asPlayer, false),
    };
})();

document.addEventListener("click", render);

state.reset();
render();

