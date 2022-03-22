/*
 * Filename: index.js
 * Author:   simshadows <contact@simshadows.com>
 * License:  GNU Affero General Public License v3 (AGPL-3.0)
 */

const txt = document.createTextNode.bind(document);
function element(tagName, attributes={}) {
    const elem = document.createElement(tagName);
    for (const [k, v] of Object.entries(attributes)) {
        switch (k) {
            case "class": elem.classList.add(...((v instanceof Array) ? v : [v])); break;
            default: elem.setAttribute(k, v);
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
        this.whoseTurn = 1; // 1 | -1, where 1 is Player 1, and -1 is Player 2
        this._gameBoard = new GameBoard();

        /*** Player Data ***/
        // Note for Odin Project: Player data is too simple to necessitate a factory here.
        this._player1 = {
            name: "Player 1",
            symbol: "X", // "X" | "O"
            type: "Human",  // "Human", or one of the AI names
        };
        this._player2 = {
            name: "Player 2",
            symbol: "O",
            type: "AI (Medium S)",
        };
    },
    startGame: function() {
        console.assert(this.mode === "start");
        this.mode = "playing";
        this.whoseTurn = 1;
        this._gameBoard = new GameBoard();
        this._tryExecuteComputerMove();
    },
    closeGame: function() {
        this.mode = "start";
    },

    getGameBoard: function() {
        return this._gameBoard.clone();
    },
    _getPlayer: function(playerID) {
        console.assert((playerID === 1) || (playerID === -1));
        return (playerID === 1) ? this._player1 : this._player2;
    },
    getPlayer: function(playerID) {
        return {...this._getPlayer(playerID)};
    },

    setName: function(playerID, newName) {
        this._getPlayer(playerID).name = newName;
    },
    swapSymbols: function() {
        [this._player1.symbol, this._player2.symbol] = [this._player2.symbol, this._player1.symbol];
    },
    changePlayerType: function(playerID) {
        const playerObj = this._getPlayer(playerID);
        const typesList = [
            "Human",
            "AI (Minimax)",
            "AI (Loser)",
            "AI (Easy)",
            "AI (Medium R)",
            "AI (Medium S)",
            "AI (Hard)",
            "Human",
        ];
        playerObj.type = typesList[typesList.indexOf(playerObj.type) + 1];
    },
    setMarker: function(position) {
        this._gameBoard.setMarker(position, this.whoseTurn);
        this.whoseTurn = this.whoseTurn * -1;
        this._tryExecuteComputerMove();
    },

    _tryExecuteComputerMove: function() {
        const playerObj = this._getPlayer(this.whoseTurn);
        if ((playerObj.type === "Human") || (this._gameBoard.calculateWinner() !== null)) return;
        const timeout = ((this._player1.type !== "Human") && (this._player2.type !== "Human")) ? 20 : 500; // AI vs. AI is faster
        setTimeout(() => {
            this.setMarker(playSuggestors[playerObj.type](this._gameBoard, this.whoseTurn));
            render();
        }, timeout);
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

    // This is a useful static field for algorithms that checks lines.
    this.lineIndices = [
        [0, 4, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [2, 4, 6],
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
    ];

    this.setMarker = function(position, player) {
        console.assert((position >= 0) && (position < 9) && (this.grid[position] === 0));
        console.assert((player === -1) || (player === 1));
        this.grid[position] = player;
    };

    this.calculateWinner = function() {
        const winningCells = new Set();
        let winner = 0;
        for (const [lineIndex, cellIndices] of this.lineIndices.entries()) {
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
        "thinking": "Thinking...",
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
            if ((currPlayer.type === "Human") && (winState === null) && (cellValue === 0)) {
                cellElem.classList.add("unmarked-cell", "button");
                cellElem.addEventListener("click", () => state.setMarker(i));
                const contentElem = cellElem.appendChild(element("span"));
                contentElem.appendChild(txt(currPlayer.symbol))
            } else {
                cellElem.classList.add("marked-cell");
                if (winState?.winningCells.has(i)) cellElem.classList.add("winning-cell");
                const contentElem = cellElem.appendChild(element("span"));
                contentElem.appendChild(txt((cellValue === 0) ? "" : state.getPlayer(cellValue).symbol))
            }
        }
        return elem;
    }

    function renderPlaying() {
        const winState = state.getGameBoard().calculateWinner();
        const currPlayer = state.getPlayer(state.whoseTurn);
        const [p1messageType, p2messageType] = (()=>{
            const turnType = (currPlayer.type === "Human") ? "turn" : "thinking";
            if (winState === null) return (state.whoseTurn === 1) ? [turnType, "none"] : ["none", turnType];
            if (winState.player === 0) return ["draw", "draw"];
            return (winState.player === 1) ? ["winner", "loser"] : ["loser", "winner"];
        })();

        playAreaElement.classList.add("playing");
        playAreaElement.appendChild(makeSideElement(state.getPlayer(1), p1messageType));
        playAreaElement.appendChild(makeBoardElement(currPlayer, winState))
        playAreaElement.appendChild(makeSideElement(state.getPlayer(-1), p2messageType));

        const restartButtonElem = bottomBarElement.appendChild(element("div", {class: "button"}));
        restartButtonElem.appendChild(txt("Restart"))
        restartButtonElem.addEventListener("click", () => state.closeGame());
    }

    function renderStart() {
        playAreaElement.classList.add("start");
        for (const playerID of [1, -1]) {
            const playerObj = state.getPlayer(playerID);

            const sectionElem = playAreaElement.appendChild(element("div"));

            const symbolBoxElem = sectionElem.appendChild(element("div", {class: ["button", "symbol"]}));
            symbolBoxElem.appendChild(txt(playerObj.symbol));
            symbolBoxElem.addEventListener("click", () => state.swapSymbols());

            const nameBoxElem = sectionElem.appendChild(element("input", {value: playerObj.name}));
            nameBoxElem.addEventListener("click", (e) => e.stopPropagation()); // Avoid rerender
            nameBoxElem.addEventListener("change", (e) => state.setName(playerID, e.target.value));

            const typeElem = sectionElem.appendChild(element("div", {class: ["button", "player-type"]}));
            typeElem.appendChild(txt(playerObj.type));
            typeElem.addEventListener("click", () => state.changePlayerType(playerID));
        }

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
    function minimaxFor(gameBoard, emptyCells, asPlayer, currPlayer, doMaximize) {
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
                    if ((result.score === ret.score) && (Math.random() > 0.33)) continue; // Randomization
                    ret.suggestedMove = cellIndex;
                    ret.score = result.score;
                }
            }
        } else {
            ret.score = asPlayer * winState.player; // 1 if asPlayer matches winner, 0 if winner is 0 (i.e. it's a draw)
        }
        return ret;
    }

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
                    if ((result.score === ret.score) && (Math.random() > 0.33)) continue; // Randomization
                    ret.suggestedMove = cellIndex;
                    ret.score = result.score;
                }
            }
        } else {
            ret.score = asPlayer * winState.player; // 1 if asPlayer matches winner, 0 if winner is 0 (i.e. it's a draw)
        }
        return ret;
    }

    // Cannot lose (Or, cannot win if doMaximize is false)
    function suggestPlayWithMinimax(gameBoard, asPlayer, doMaximize) {
        const emptyCells = [...gameBoard.grid.entries()].filter(([_, v]) => (v === 0)).map(([i, _]) => i);
        console.assert(emptyCells.length > 0);
        return minimax(gameBoard, emptyCells, asPlayer, asPlayer, doMaximize).suggestedMove;
    }

    // Very dumb
    function suggestPlayRandomly(gameBoard) {
        const emptyCells = [...gameBoard.grid.entries()].filter(([_, v]) => (v === 0));
        console.assert(emptyCells.length > 0);
        return randomElement(emptyCells)[0];
    }

    // Perfect expert system algorithm
    function suggestPlayWithCrowleySieglerAlgorithm(gameBoard, asPlayer) {
        const emptyCells = [...gameBoard.grid.entries()].filter(([_, v]) => (v === 0)).map(([i, _]) => i);
        console.assert(emptyCells.length > 0);
        // Step 0: Precalculate winning and losing lines
        const emptyLines = []; // Shared array between winning and losing lines.
        const winningLines = [emptyLines, [], []]; // winningLines[how many marks asPlayer has in the line] = array of lines
        const losingLines = [emptyLines, [], []]; // similar
        for (const cellIndices of gameBoard.lineIndices) {
            const lineContents = cellIndices.map(e => gameBoard.grid[e]);

            const hasOurMarks = lineContents.includes(asPlayer);
            const hasOpponentMarks = lineContents.includes(asPlayer * -1);

            if (hasOurMarks && hasOpponentMarks) continue; // Both players are blocked. We do nothing.
            const markerCount = Math.abs(arraySum(lineContents));
            console.assert(markerCount >= 0);
            const linesArray = (hasOurMarks) ? winningLines : losingLines;
            linesArray[markerCount].push(cellIndices);
        }
        // Step 1: Can we win next turn? If so, we take it.
        if (winningLines[2].length > 0) {
            console.log("Hard AI wins!");
            const emptyIndices = randomElement(winningLines[2]).filter(i => (gameBoard.grid[i] === 0));
            console.assert(emptyIndices.length === 1);
            return emptyIndices[0];
        }
        // Step 2: We check if we must block.
        if (losingLines[2].length > 0) {
            console.log("Hard AI blocked a line.");
            const emptyIndices = randomElement(losingLines[2]).filter((i) => (gameBoard.grid[i] === 0));
            console.assert(emptyIndices.length === 1);
            return emptyIndices[0];
        }
        // Step 3: Set up a fork.
        function setUpFork(linesWithOneMark) {
            const possibleMoves = [];
            const possibleIntersectionCellIndices = new Set();
            for (const cellIndices of linesWithOneMark) {
                const emptyIndices = cellIndices.filter((i) => (gameBoard.grid[i] === 0));
                console.assert(emptyIndices.length === 2);
                for (const i of emptyIndices) {
                    if (possibleIntersectionCellIndices.has(i)) possibleMoves.push(i);
                    possibleIntersectionCellIndices.add(i);
                }
            }
            return possibleMoves;
        }
        const movesToCreateFork = setUpFork(winningLines[1]);
        if (movesToCreateFork.length > 0) {
            console.log("Hard AI created a fork!");
            return randomElement(movesToCreateFork);
        }
        // Step 4: Block fork.
        const opponentPossibleForkMoves = setUpFork(losingLines[1]);
        if (opponentPossibleForkMoves.length > 0) {
            // There's one more part of this step, outlined by the paper!
            // The paper has an if-statement for:
            //      "If there is an empty location that creates a two-in-a-row for me
            //      (thus forcing my opponent to block rather than fork),"
            if (winningLines[1].length > 0) {
                const possibleMoves = new Set();
                for (const cellIndices of winningLines[1]) {
                    // TODO: Somehow simplify this logic down?
                    const [c1, c2] = cellIndices.filter(i => (gameBoard.grid[i] === 0));
                    const [o1, o2] = [opponentPossibleForkMoves.includes(c1), opponentPossibleForkMoves.includes(c2)];
                    if (o1 && !o2) {
                        possibleMoves.add(c1);
                    } else if (!o1 && o2) {
                        possibleMoves.add(c2);
                    } else if (!o1 && !o2) {
                        possibleMoves.add(c1);
                        possibleMoves.add(c2);
                    }
                }
                console.log(possibleMoves);
                if (possibleMoves.size > 0) {
                    console.log("Hard AI blocked a fork by forcing the opponent to block next turn!");
                    return randomElement(Array.from(possibleMoves));
                }
                console.log(opponentPossibleForkMoves);
                console.log("FALLTHROUGH");
                // Intentional fallthrough
            }
            console.log("Hard AI blocked a fork by blocking an intersecting line!");
            return randomElement(opponentPossibleForkMoves);
        }
        // Step 5: Play center.
        if (gameBoard.grid[4] === 0) {
            console.log("Hard AI plays center.");
            return 4;
        }
        // Step 6: Play opposite corner.
        for (const [testCorner, placementCorner] of [[0,8], [8,0], [2,6], [6,2]]) {
            const opponentHasMark = (gameBoard.grid[testCorner] === asPlayer * -1);
            const oppositeIsEmpty = (gameBoard.grid[placementCorner] === 0);
            if (opponentHasMark && oppositeIsEmpty) {
                console.log("Hard AI plays the opposite corner.");
                return placementCorner;
            }
        }
        // Step 7: Play empty corner.
        for (const candidateCellIndex of [0, 2, 6, 8]) {
            if (gameBoard.grid[candidateCellIndex] === 0) {
                console.log("Hard AI plays an empty corner.");
                return candidateCellIndex;
            }
        }
        // Step 8: Play empty side.
        for (const candidateCellIndex of [1, 3, 5, 7]) {
            if (gameBoard.grid[candidateCellIndex] === 0) {
                console.log("Hard AI plays an empty side.");
                return candidateCellIndex;
            }
        }
        // Step 9: Last resort. (We should only reach this step if there's anything wrong with the algorithm.)
        console.error("Hard AI should never reach the end of the decision tree without a choice.");
        return suggestPlayRandomly(gameBoard);
    }

    // Intelligent, but only cares about the next move, so it has weaknesses
    function suggestPlayWithShallowAlgorithm(gameBoard, asPlayer) {
        const emptyCells = [...gameBoard.grid.entries()].filter(([_, v]) => (v === 0)).map(([i, _]) => i);
        console.assert(emptyCells.length > 0);
        // Step 1: We calculate the move with the shortest line to victory.
        let bestNumberOfRoundsToWin = 4;
        let bestCellIndices = [];
        for (const cellIndices of gameBoard.lineIndices) {
            const lineContents = cellIndices.map((e) => gameBoard.grid[e]);
            if (lineContents.includes(asPlayer * -1)) continue; // Skip this line if we're blocked
            const emptyMarkerCount = 3 - Math.abs(arraySum(lineContents));
            if (emptyMarkerCount <= bestNumberOfRoundsToWin) { // Check if it's better
                if ((emptyMarkerCount === bestNumberOfRoundsToWin) && (Math.random() > 0.5)) continue; // Randomization
                bestNumberOfRoundsToWin = emptyMarkerCount;
                bestCellIndices = cellIndices;
            }
        }
        // Step 2: Can we win next turn? If so, we take it.
        if (bestNumberOfRoundsToWin === 1) {
            console.log("Shallow AI wins!");
            return bestCellIndices.filter((cellIndex) => (gameBoard.grid[cellIndex] === 0))[0];
        }
        // Step 3: We check if we must block. (If defeat is inevitable, this step will still attempt to block!)
        for (const [i, cellIndex] of emptyCells.entries()) {
            const newGameBoard = gameBoard.clone();
            newGameBoard.setMarker(cellIndex, asPlayer * -1); // Place opposite player's marker
            const winState = newGameBoard.calculateWinner();
            if ((winState !== null) && (winState.player === asPlayer * -1)) {
                console.log("Shallow AI blocked a line.");
                return cellIndex; // We must block!
            }
        }
        // Step 4: If there's no possible path to victory, we pick a random cell.
        if (bestNumberOfRoundsToWin === 4) {
            console.log("Shallow AI found no possible path to victory. A random move will be selected.");
            return suggestPlayRandomly(gameBoard);
        }
        // Step 5: There's a possible path to victory, we take the best one we found.
        console.log(`Shallow AI's fastest path to victory is ${bestNumberOfRoundsToWin} turns.`);
        console.assert((bestNumberOfRoundsToWin >= 0) && (bestNumberOfRoundsToWin < 4));
        return randomElement(bestCellIndices.filter((cellIndex) => (gameBoard.grid[cellIndex] === 0)));
    }

    function suggestPlayWithCrowleySieglerSometimes(gameBoard, asPlayer, difficulty) {
        if (Math.random() <= difficulty) {
            return suggestPlayWithCrowleySieglerAlgorithm(gameBoard, asPlayer);
        } else {
            return suggestPlayRandomly(gameBoard);
        }
    }

    return {
        "AI (Hard)":     (gameBoard, asPlayer) => suggestPlayWithCrowleySieglerAlgorithm(gameBoard, asPlayer),
        "AI (Medium S)": (gameBoard, asPlayer) => suggestPlayWithShallowAlgorithm(gameBoard, asPlayer),
        "AI (Medium R)": (gameBoard, asPlayer) => suggestPlayWithCrowleySieglerSometimes(gameBoard, asPlayer, 0.7),
        "AI (Easy)":     (gameBoard, _       ) => suggestPlayRandomly(gameBoard),
        "AI (Minimax)":  (gameBoard, asPlayer) => suggestPlayWithMinimax(gameBoard, asPlayer, true),
        "AI (Loser)":    (gameBoard, asPlayer) => suggestPlayWithMinimax(gameBoard, asPlayer, false),
    };
})();

document.addEventListener("click", render);

state.reset();
render();

