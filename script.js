'use strict'
// 1行目に記載している 'use strict' は削除しないでください

const printMessage = {
    "normal": () => {
        const message = "";
        document.getElementById("reversi-result message").innerText = message;
        document.getElementById("reversi-result message").className = "";

    },
    "reput": () => {
        const message = "You can't put this area. please reput."
        document.getElementById("reversi-result message").innerText = message;
        document.getElementById("reversi-result message").className = "alert alert-warning mt-2";
    },
    "gameset": (board) => {
        const message = "game set!"
        document.getElementById("reversi-result message").innerText = message;
        document.getElementById("reversi-result message").className = "alert alert-light mt-2";

        const winMessageEl = document.getElementById("reversi-result win");
        const sum = boardCount(board);
        let winMessage = "";
        if(sum === 0) winMessage = "draw!";
        if(sum > 0) winMessage = "black win!";
        if(sum < 0) winMessage = "white win!";
        winMessageEl.innerText = winMessage;
    },
    "pass": () => {
        const message = "pass";
        document.getElementById("reversi-result message").innerText = message;
        document.getElementById("reversi-result message").className = "alert alert-primary mt-2";
    },
    "waiting": () => {
        const message = "AI is thinking...";
        document.getElementById("reversi-result message").innerText = message;
        document.getElementById("reversi-result message").className = "alert alert-light mt-2";
    }
}


const reversi = {
    state: "title",
    gameData: {
        board: null,
        firstTurn: null,
        turn: null,
        AIstrength: null,
        AIturn: null,
        AIthinking: null,
    },
    states:{
        title:{
            enter: function(){
                const reversiDisplay = document.getElementById("reversi-display");

                const titleEl = document.createElement("h2");
                titleEl.innerText = "Choose Mode!"
                titleEl.className = "text-center mt-5 mb-5";
                titleEl.id = "chooseModeText";
                document.body.insertBefore(titleEl, document.body.children[1]);
                
                const buttonElement = document.createElement("button");
                buttonElement.id = "reversi-start";
                buttonElement.innerText = "2-player mode";
                buttonElement.type = "button";
                buttonElement.className = "btn btn-primary ms-1 me-1"
                buttonElement.addEventListener("click",(e) => {
                    reversi.onUserInput(1);
                });
                reversiDisplay.appendChild(buttonElement);

                const AI4bButtonElement = document.createElement("button");
                AI4bButtonElement.id = "reversiAI4b-start";
                AI4bButtonElement.innerText = "play with AI (You are black)";
                AI4bButtonElement.type = "button";
                AI4bButtonElement.className = "btn btn-secondary ms-1 me-1"
                AI4bButtonElement.addEventListener("click", () => {
                    reversi.onUserInput(1,5,-1);
                });
                reversiDisplay.appendChild(AI4bButtonElement);
                
                const AI4wButtonElement = document.createElement("button");
                AI4wButtonElement.id = "reversiAI4w-start";
                AI4wButtonElement.innerText = "play with AI (You are white)";
                AI4wButtonElement.type = "button";
                AI4wButtonElement.className = "btn btn-secondary ms-1 me-1"
                AI4wButtonElement.addEventListener("click", () => {
                    reversi.onUserInput(1,5,1);
                });
                reversiDisplay.appendChild(AI4wButtonElement);


                const recordEl = document.createElement("div");
                recordEl.id = "reversi-record";
                recordEl.className = "text-center mt-5";

                const textEl = document.createElement("h3");
                const nameText = localStorage.username ? localStorage.username + "'s" : "Your";
                textEl.innerText = `${nameText} Battle Record with AI`;
                const recordTextEl = document.createElement("div");
                recordTextEl.innerText = `wins👑:${localStorage.wins} loses😂:${localStorage.loses}`;
                
                recordEl.appendChild(textEl);
                recordEl.appendChild(recordTextEl);

                document.body.appendChild(recordEl);

            },
            execute: function(inputFirstTurn, AIstrength, AIturn){
                document.getElementById("chooseModeText").remove();
                document.getElementById("reversi-record").remove();
                document.getElementById("reversi-start").remove();
                document.getElementById("reversiAI4b-start").remove();
                document.getElementById("reversiAI4w-start").remove();

                reversi.functions.printResult();
                inputFirstTurn = 1;
                reversi.gameData.AIstrength = AIstrength || null;
                reversi.gameData.AIturn = AIturn || null;
                reversi.gameData.board = reversi.functions.createBoard();
                reversi.functions.printBoard();
                reversi.gameData.firstTurn = inputFirstTurn;
                reversi.functions.updateBoard(reversi.gameData.board, reversi.gameData.firstTurn);
                reversi.functions.updateResult(reversi.gameData.board, reversi.gameData.turn);
                return "play";
            },
        },
        play:{
            enter: function(){
                reversi.functions.printMessage.normal();
                reversi.gameData.turn = reversi.gameData.turn !== null ? reversi.functions.getTurn(reversi.gameData.board, reversi.gameData.turn) : reversi.gameData.firstTurn;
                reversi.functions.updateBoard(reversi.gameData.board, reversi.gameData.turn);
                reversi.functions.updateResult(reversi.gameData.board, reversi.gameData.turn);


                if(reversi.gameData.AIturn === reversi.gameData.turn){
                    reversi.gameData.AIthinking = true;
                    reversi.functions.printMessage.waiting();
                    setTimeout(() => {
                        const [x , y] = reversi.functions.AI_NegaMax(reversi.gameData.board, reversi.gameData.AIturn, reversi.gameData.AIstrength);
                        reversi.onUserInput(x, y);
                        reversi.functions.printMessage.normal();     
                        reversi.gameData.AIthinking = false;
                    }, 300);
                    
                }
            },
            execute: function(x, y){
                if(!reversi.functions.canPutXY(reversi.gameData.board, reversi.gameData.turn, x, y)){
                    reversi.functions.printMessage.reput();
                    return null;
                }
                reversi.functions.distructivePut(reversi.gameData.board, reversi.gameData.turn, x, y);
                if(!reversi.functions.canPutSomething(reversi.gameData.board)){
                    const userTurn = -reversi.gameData.AIturn;
                    const w = boardCount(reversi.gameData.board) * userTurn;
                    if(w > 0){
                        localStorage.wins++;
                    }else{
                        localStorage.loses++;
                    }
                    return "finish";
                } 
                return "play";
            },
        },
        finish:{
            enter: function() {
                reversi.functions.updateBoard(reversi.gameData.board, reversi.gameData.turn);
                reversi.functions.updateResult(reversi.gameData.board, reversi.gameData.turn);
                reversi.functions.printMessage.gameset(reversi.gameData.board);
            },
            execute: function(){
                reversi.functions.deleteResult();
                reversi.functions.dataInitialize();
                reversi.functions.boardDelete();
                
                return "title";
            },
        },
    },
    transition: function(nextStateName){
        this.state = nextStateName;
        const nextState = this.states[nextStateName];

        if(nextState && typeof nextState.enter === "function"){
            nextState.enter();
        }
    },
    onUserInput: function(...input){
        const stateObj = this.states[this.state];

        if(stateObj && typeof stateObj.execute === 'function'){
            const nextStateName = stateObj.execute(...input);
            if(nextStateName){
                this.transition(nextStateName);
            }
        }
    },
    functions:{
        createBoard,
        printBoard,
        canPutSomething,
        canPut,
        getTurn,
        printResult,
        deleteResult,
        updateBoard,
        updateResult,
        puttablePlaceArray,
        printMessage,
        canPutXY,
        distructivePut,
        putDirectionMaker,
        isInTheBoard,
        dataInitialize,
        boardDelete,
        AI_NegaMax,
        AI_last,
    },
}


function createBoard(){
    const board = Array.from({length:8}, () => Array.from({length:8}, () => 0));
    board[3][3] = -1;
    board[4][4] = -1;
    board[3][4] = 1;
    board[4][3] = 1;

    
    return board;
}

function printBoard(){
    const table = document.createElement("table");
    table.className = "reversi-board";
    const tbody = document.createElement("tbody");
    for(let i = 0; i < 8; i++){
        const tr = document.createElement("tr");
        tr.className = "reversi-row";
        tr.id = i;
        for(let j = 0; j < 8; j++){
            const td = document.createElement("td");
            td.className = "reversi-cell ";
            td.id = j;
            td.addEventListener("click", () => reversi.onUserInput(i, j));
            tr.appendChild(td);
        }
        tbody.appendChild(tr);
    }
    table.appendChild(tbody);
    
    const reversiMessageEl = document.createElement("div");
    reversiMessageEl.id = "reversi-result message";
    
    const reversiMainEl = document.createElement("div");
    reversiMainEl.id = "reversi-main";
    
    reversiMainEl.appendChild(table);
    reversiMainEl.appendChild(reversiMessageEl);
    document.getElementById("reversi-display").appendChild(reversiMainEl);

    // function getXY(event){
    //     const row = event.target.id;
    //     const col = event.target.parentElement.id;
    //     const x = Number(col);
    //     const y = Number(row)
    //     reversi.onUserInput(x, y);
    // }
}


function canPutSomething(board){
    return canPut(board, 1) || canPut(board, -1);
}

function canPut(board, turn){
    const puttableArray = puttablePlaceArray(board, turn);
    let puttable = false;
    for(const col of puttableArray){
        for(const cell of col){
            puttable ||= cell;
        }
    }
    return puttable;
}


function getTurn(board, currentTurn) {
  if (!canPutSomething(board)) {
    return 0;
  }
  if (canPut(board, -currentTurn)) {
    return -currentTurn;
  } else {
    printMessage.pass();
    return currentTurn;
  }
}

function updateBoard(board, turn){
    const turnElement = document.getElementById("reversi-result turn");
    turnElement.innerText = turn === 1 ? "black" : "white";
    
    const tableElement = document.getElementsByClassName("reversi-board")[0];
    const boardElement = tableElement.children[0];
    const puttableArray = puttablePlaceArray(board, turn);
    for (const colElement of boardElement.children){
        const colId = colElement.id;
        for(const cellElement of colElement.children){
            const rowId = cellElement.id;
            cellElement.innerHTML = "";
            const stoneElement = createStoneElement(board[colId][rowId], puttableArray[colId][rowId]);
            cellElement.appendChild(stoneElement);
        }
    }


}

function createStoneElement(colorNum, puttable, tagType = "div"){
    const stone = document.createElement(tagType);
    if(colorNum === 1) stone.className = "stone-black";
    if(colorNum === -1) stone.className = "stone-white";
    if(puttable) stone.className = "stone-puttable";
    stone.style.pointerEvents = "none";
    stone.style.width = "2em";
    stone.style.height = "2em";
    stone.style.margin = "0.5em 0.5em 0.5em 0.5em";
    return stone;
}

function puttablePlaceArray(board, turn){
    const colSize = board.length;
    const rowSize = board[0].length;
    const puttablePlaceArr = Array.from({length: colSize}, () => Array(rowSize).fill(false));

    for(let col = 0; col < colSize; col++){
        for(let row = 0; row < rowSize; row++){
            puttablePlaceArr[col][row] = canPutXY(board, turn, col, row);
        }
    }
    return puttablePlaceArr;
}





function canPutXY(board, turn, x, y){
    if(board[x][y] !== 0) return false;
    for(let dx = -1; dx <= 1; dx++){
        for(let dy = -1; dy <= 1; dy++){
            if(!(dx || dy)) continue;
            const directionPuttableCheck = putDirectionMaker(dx, dy, false);
            if(directionPuttableCheck(board, turn, x, y)) return true;
        }
    }
    return false;
}

function distructivePut(board, turn, x, y){
    for(let dx = -1; dx <= 1; dx++){
        for(let dy = -1; dy <= 1; dy++){
            if(!(dx || dy)) continue;

            const putDirection = putDirectionMaker(dx, dy, true);
            putDirection(board, turn, x, y);
        }
    }
}

function nonDistructivePut(board, turn, x, y){
    const copyBoard = JSON.parse(JSON.stringify(board));
    distructivePut(copyBoard, turn, x, y);
    return copyBoard;
}

function putDirectionMaker(dx, dy, distructive){
    distructive = distructive || false;
    return function(board, turn, x, y){
       let nx = x + dx;
       let ny = y + dy;
       let canPut = false;
       while(isInTheBoard(board, nx, ny)){
            if(board[nx][ny] === -turn){
                canPut = true;
                nx += dx;
                ny += dy;
            }else{
                break;
            }
       }
       canPut = isInTheBoard(board, nx, ny) && board[nx][ny] === turn && canPut;
       
       if(distructive && canPut){
            board[x][y] = turn;
            nx = x + dx;
            ny = y + dy;
            while(isInTheBoard(board, nx, ny) && board[nx][ny] === -turn){
                board[nx][ny] = turn;
                nx += dx;
                ny += dy;
            }
       }
       return canPut;
    }
}

function isInTheBoard(board, x, y){
    const col = board.length;
    const row = board[0].length;

    if(x < 0) return false;
    if(x >= col) return false;
    if(y < 0) return false;
    if(y >= row) return false;
    return true;
}

function dataInitialize(data){
    for(const key in data){
        data[key] = null;
    }
}

function boardDelete(){
    const main = document.getElementById("reversi-main");
    main.remove();
    
}

function reset(){
    reversi.transition("finish");
    reversi.onUserInput(1);
}

function AI_NegaMax(board, turn, strength){


    function solution(board, turn, strength){
        const puttableArray = puttablePlaceArray(board, turn);
        if(strength <= 0){
            const r = 5, k = 0.5;
            let w = 0;
            let a = 0, b = 0, c = 0;
            const colSize = puttableArray.length;
            const rowSize = puttableArray[0].length; 
            for(let i = 0; i < colSize; i++){
                for(let j = 0; j < rowSize; j++){
                    a += puttableArray[i][j];
                    c -= board[i][j] * turn;
                }
            }
            if(puttableArray[0][0] || board[0][0] === turn) b += 10;
            if(puttableArray[0][rowSize-1] || board[0][rowSize-1] === turn) b += 10;
            if(puttableArray[colSize-1][0] || board[colSize-1][0] === turn) b += 10;
            if(puttableArray[colSize-1][rowSize-1] || board[colSize-1][rowSize-1] === turn) b += 10;
            w = a + r * b + k * c;
            return [w, -1, -1];
        }

        const puttableXYs = [];
        const colSize = puttableArray.length;
        const rowSize = puttableArray[0].length;
        for(let i = 0; i < colSize; i++){
            for(let j = 0; j < rowSize; j++){
                if(puttableArray[i][j]){
                    puttableXYs.push([i, j]);
                }
            }
        }
        
        let maximum = -1000;
        let goodX = -1;
        let goodY = -1;
        for(const xy of puttableXYs){
            const x = xy[0];
            const y = xy[1];

            const putBoard = nonDistructivePut(board, turn, x, y);
            const [thisW, thisX, thisY] = solution(putBoard, -turn, strength-1);
            if(maximum < -thisW ){
                maximum = -thisW;
                goodX = x;
                goodY = y;
            }
        }

        return [maximum, goodX, goodY];
    }
    
    let [w, x, y] = solution(board, turn, strength);
    if(!isInTheBoard(board, x, y)){
        return AI_last(board, turn, strength);
    }
    return [x, y];
}

function AI_last(board, turn, strength){
    const puttableArray = puttablePlaceArray(board, turn);
    let x = 0;
    let y = 0;

    const colSize = board.length;
    const rowSize = board[0].length;

    for(let i = 0; i < colSize; i++){
        for(let j = 0; j < rowSize; j++){
            if(puttableArray[i][j]){
                x = i;
                y = j;
            }
        }
    }
    return [x, y];

}

function boardCount(board){
    let sum = 0;
    for(const col of board){
        for(const cell of col){
            sum += cell;
        }
    }
    return sum;
}

function updateResult(board, turn){

    const turnEl = document.getElementById("reversi-result turn");
    const stoneAmountEl = document.getElementById("reversi-result stone amount");

    const turnStr = turn === 1 ? "black" : "white";
    turnEl.innerText = `turn: ${turnStr}`;
    
    let blackAmount = 0, whiteAmount = 0;
    for(const col of board){
        for(const cell of col){
            if(cell === 1) blackAmount++;
            if(cell === -1) whiteAmount++;
        }
    }

    stoneAmountEl.innerHTML = `black:${blackAmount} <br> white:${whiteAmount}`;
}

function printResult(){

    const resultEl = document.createElement("div");
    resultEl.id = "reversi-result";
    resultEl.className = "card d-flex flex-column justify-content-around align-items-center";
    const turnEl = document.createElement("div");
    turnEl.id = "reversi-result turn";
    const amountEl = document.createElement("div");
    amountEl.id = "reversi-result stone amount";
    const winMessage = document.createElement("div");
    winMessage.id = "reversi-result win";
    const resetEl = document.createElement("button");
    resetEl.id = "reversi-result reset";
    resetEl.type = "button";
    resetEl.className = "btn btn-secondary w-50"
    resetEl.addEventListener("click", () => reset());
    resetEl.innerHTML = "return to Menu";
    resultEl.appendChild(turnEl);
    resultEl.appendChild(amountEl);
    resultEl.appendChild(winMessage);
    resultEl.appendChild(resetEl);
    const display = document.getElementById("reversi-display");
    display.appendChild(resultEl);
}

function deleteResult(){
    document.getElementById("reversi-result").remove();
}

// gameset pattern
// reversi.onUserInput([4,2]);
// reversi.onUserInput([5,4]);
// reversi.onUserInput([4,5]);
// reversi.onUserInput([3,2]);
// reversi.onUserInput([2,3]);
// reversi.onUserInput([5,2]);
// reversi.onUserInput([4,1]);
// reversi.onUserInput([5,3]);
// reversi.onUserInput([6,3]);


(function(){
    if(!localStorage.username){
        const username = window.prompt("please type username");
        if(username !== null){
            localStorage.setItem("username", username);
        }
    }
    if(!localStorage.wins){
        localStorage.setItem("wins", 0);
    }
    if(!localStorage.loses){
        localStorage.setItem("loses", 0);
    }

})();


(reversi.states.title.enter)();
