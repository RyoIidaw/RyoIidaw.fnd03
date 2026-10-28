'use strict'
// 1行目に記載している 'use strict' は削除しないでください

const printMessage = {
    "normal": () => {
        const message = "";
        document.getElementById("othello-result message").innerText = message;
        document.getElementById("othello-result message").className = "";

    },
    "reput": () => {
        const message = "You can't put this area. please reput."
        document.getElementById("othello-result message").innerText = message;
        document.getElementById("othello-result message").className = "alert alert-warning mt-2";
    },
    "gameset": (board) => {
        const message = "game set!"
        document.getElementById("othello-result message").innerText = message;
        document.getElementById("othello-result message").className = "alert alert-light mt-2";

        const winMessageEl = document.getElementById("othello-result win");
        let sum = 0;
        for(const col of board){
            for(const cell of col){
                sum += cell;
            }
        }   
        let winMessage = "";
        if(sum === 0) winMessage = "draw!";
        if(sum > 0) winMessage = "black win!";
        if(sum < 0) winMessage = "white win!";
        winMessageEl.innerText = winMessage;
    },
    "pass": () => {
        const message = "pass";
        document.getElementById("othello-result message").innerText = message;
        document.getElementById("othello-result message").className = "alert alert-primary mt-2";
    },
    "waiting": () => {
        const message = "AI is thinking...";
        document.getElementById("othello-result message").innerText = message;
        document.getElementById("othello-result message").className = "alert alert-light mt-2";
    }
}


const othello = {
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
                const othelloDisplay = document.getElementById("othello-display");

                const titleEl = document.createElement("h2");
                titleEl.innerText = "Choose Mode!"
                titleEl.className = "text-center mt-5 mb-5";
                titleEl.id = "chooseModeText";
                document.body.insertBefore(titleEl, document.body.children[1]);
                
                const buttonElement = document.createElement("button");
                buttonElement.id = "othello-start";
                buttonElement.innerText = "play";
                buttonElement.type = "button";
                buttonElement.className = "btn btn-primary ms-1 me-1"
                buttonElement.addEventListener("click",(e) => {
                    // console.log(e);
                    othello.onUserInput(1);
                });
                othelloDisplay.appendChild(buttonElement);

                const AI4bButtonElement = document.createElement("button");
                AI4bButtonElement.id = "othelloAI4b-start";
                AI4bButtonElement.innerText = "play with AI (You are black)";
                AI4bButtonElement.type = "button";
                AI4bButtonElement.className = "btn btn-secondary ms-1 me-1"
                AI4bButtonElement.addEventListener("click", () => {
                    othello.onUserInput(1,5,-1);
                });
                othelloDisplay.appendChild(AI4bButtonElement);
                
                const AI4wButtonElement = document.createElement("button");
                AI4wButtonElement.id = "othelloAI4w-start";
                AI4wButtonElement.innerText = "play with AI (You are white)";
                AI4wButtonElement.type = "button";
                AI4wButtonElement.className = "btn btn-secondary ms-1 me-1"
                AI4wButtonElement.addEventListener("click", () => {
                    othello.onUserInput(1,5,1);
                });
                othelloDisplay.appendChild(AI4wButtonElement);


                const recordEl = document.createElement("div");
                recordEl.id = "othello-record";
                recordEl.className = "text-center mt-5";

                // const iconEl = document.createElement("i");
                // iconEl.className = "bi bi-bar-chart fs-3";
                const textEl = document.createElement("h3");
                textEl.innerText = `${localStorage.username}'s Battle Record with AI`;
                const recordTextEl = document.createElement("div");
                recordTextEl.innerText = `wins👑:${localStorage.wins} loses😂:${localStorage.loses}`;
                
                // recordEl.appendChild(iconEl);
                recordEl.appendChild(textEl);
                recordEl.appendChild(recordTextEl);

                document.body.appendChild(recordEl);

            },
            execute: function(inputFirstTurn, AIstrength, AIturn){
                document.getElementById("chooseModeText").remove();
                document.getElementById("othello-record").remove();
                othello.functions.printResult();
                inputFirstTurn = 1;
                othello.gameData.AIstrength = AIstrength || null;
                othello.gameData.AIturn = AIturn || null;
                // console.log(othello.gameData.board);
                document.getElementById("othello-start").remove();
                document.getElementById("othelloAI4b-start").remove();
                document.getElementById("othelloAI4w-start").remove();
                othello.gameData.board = othello.functions.createBoard();
                othello.gameData.firstTurn = inputFirstTurn;
                // othello.gameData.turn = inputFirstTurn;
                othello.functions.updateBoard(othello.gameData.board, othello.gameData.firstTurn);
                othello.functions.updateResult(othello.gameData.board, othello.gameData.turn);
                return "play";
            },
        },
        play:{
            enter: function(){
                othello.functions.printMessage.normal();
                othello.gameData.turn = othello.gameData.turn !== null ? othello.functions.getTurn(othello.gameData.board, othello.gameData.turn) : othello.gameData.firstTurn;
                othello.functions.updateBoard(othello.gameData.board, othello.gameData.turn);
                othello.functions.updateResult(othello.gameData.board, othello.gameData.turn);

                // while(othello.gameData.AIthinking){
                //     console.log("waiting");
                // }

                if(othello.gameData.AIturn === othello.gameData.turn){
                    
                    othello.gameData.AIthinking = true;
                    othello.functions.printMessage.waiting();
                    // setTimeout(() => {
                        const [x , y] = othello.functions.AI_NegaMax(othello.gameData.board, othello.gameData.AIturn, othello.gameData.AIstrength);
                        othello.onUserInput(x, y);
                        othello.functions.printMessage.normal();     
                        othello.gameData.AIthinking = false;
                    // }, 100);
                    
                }
            },
            execute: function(x, y){
                // const x = xyarr[0];
                // const y = xyarr[1];
                // othello.functions.updateBoard(othello.gameData.board, othello.gameData.turn);
                if(!othello.functions.canPutXY(othello.gameData.board, othello.gameData.turn, x, y)){
                    // console.log(x, y);
                    othello.functions.printMessage.reput();
                    return null;
                }
                othello.functions.distructivePut(othello.gameData.board, othello.gameData.turn, x, y);
                if(!othello.functions.canPutSomething(othello.gameData.board)){
                    const userTurn = -othello.gameData.AIturn;
                    const w = boardCount(othello.gameData.board) * userTurn;
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
                othello.functions.updateBoard(othello.gameData.board, othello.gameData.turn);
                othello.functions.updateResult(othello.gameData.board, othello.gameData.turn);
                othello.functions.printMessage.gameset(othello.gameData.board);
            },
            execute: function(){
                othello.functions.deleteResult();
                othello.functions.dataInitialize();
                othello.functions.boardDelete();
                
                // const boardElement = document.getElementById("othello-board");
                // console.log(boardElement);
                // boardElement.remove();
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
    },
}

// function othello_(){

//     const board = createBoard();
//     const firstTurn = 1;
    
//     updateBoard(board, firstTurn);

//     const getTurn = getTurnMaker(firstTurn);
//     while(canPutSomething(board)){

//         const turn = getTurn(board);
//         updateBoard(board, turn);
//         printMessage.put(turn);
//         let {x, y} = getPlace();
//         while(!canPutXY(board, turn, x, y)){
//             printMessage.reput(turn);
//             updateBoard(board, turn);
//         x = getPlaceX();
//         y = getPlaceY();
//         }
//         distructivePut(board, turn, x, y)

//     }
//     printMessage.gameset(board);
    
// }

function createBoard(){
    const board = Array.from({length:8}, () => Array.from({length:8}, () => 0));
    board[3][3] = 1;
    board[4][4] = 1;
    board[3][4] = -1;
    board[4][3] = -1;

    const table = document.createElement("table");
    table.className = "othello-board";
    const tbody = document.createElement("tbody");
    for(let i = 0; i < 8; i++){
        const tr = document.createElement("tr");
        tr.className = "othello-row";
        tr.id = i;
        for(let j = 0; j < 8; j++){
            const td = document.createElement("td");
            td.className = "othello-cell ";
            td.id = j;
            td.addEventListener("click", putClick);
            tr.appendChild(td);
        }
        tbody.appendChild(tr);
    }
    table.appendChild(tbody);

    const othelloMessageEl = document.createElement("div");
    othelloMessageEl.id = "othello-result message";
    // othelloMessageEl.className = "mt-2";
    
    const othelloMainEl = document.createElement("div");
    othelloMainEl.id = "othello-main";

    othelloMainEl.appendChild(table);
    othelloMainEl.appendChild(othelloMessageEl);
    document.getElementById("othello-display").appendChild(othelloMainEl);

    return board;
}

function putClick(event){
    if(othello.state === "title"){

    }
    if(othello.state === "play"){
        // console.log(event.target);
        const row = event.target.id;
        const col = event.target.parentElement.id;
        // console.log(col, row);
        const x = Number(col);
        const y = Number(row)
        othello.onUserInput(x, y);
    }
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

// function getTurnMaker(firstTurn){
//     let turn = -firstTurn;
//     // return board => canPut(board, turn) ? -turn : turn;
//     return board => {
//         if(!canPutSomething(board)){return 0;}
//         if(canPut(board,turn)){
//             return -turn;
//         }else{
//             printMessage.pass();
//             return turn;
//         }
//     }
// }

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
    //status update for dom
    // stone amount
    // stone status after putted

    const turnElement = document.getElementById("othello-result turn");
    // console.log(turnElement);
    turnElement.innerText = turn === 1 ? "black" : "white";

    
    const colSize = board.length;
    const rowSize = board[0].length;
    const tableElement = document.getElementsByClassName("othello-board")[0];
    // console.log(tableElement);
    const boardElement = tableElement.children[0];
    // console.log(boardElement);
    const puttableArray = puttablePlaceArray(board, turn);
    // console.log(puttableArray);
    // console.log(turn);
    for (const colElement of boardElement.children){
        const colId = colElement.id;
        // console.log(colElement);
        for(const cellElement of colElement.children){
            const rowId = cellElement.id;
            // console.log(cellElement);
            // cellElement.innerText = `${colId} ${rowId}`;
            cellElement.innerHTML = "";
            const stoneElement = createStoneElement(board[colId][rowId], puttableArray[colId][rowId]);
            cellElement.appendChild(stoneElement);
        }
    }


}

function createStoneElement(colorNum, puttable, tagType){
    tagType ||= "div";
    const stone = document.createElement(tagType);
    // stone.className = "stone";
    if(colorNum === 1) stone.className = "stone-black";
    if(colorNum === -1) stone.className = "stone-white";
    if(puttable) stone.className = "stone-puttable";
    stone.style.pointerEvents = "none";
    // stone.style.margin = "0px 13px";
    stone.style.width = "2em";
    stone.style.height = "2em";
    stone.style.margin = "0.5em 0.5em 0.5em 0.5em";
    // if(colorNum === 1 || colorNum === -1){
    //     stone.style.width = "2em";
    //     stone.style.height = "2em";
    //     stone.style.margin = "0.5em 0.5em 0.5em 0.5em";
    // }
    // if(puttable){
    //     stone.style.width = "1.5em";
    //     stone.style.height = "1.5em";
    //     stone.style.margin = "0.5em 0.5em 0.5em 0.5em";
    // }
    return stone;
}

function puttablePlaceArray(board, turn){
    // console.log(turn);
    // console.log("call puttablePlaceArray function");
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

// const printMessage = {
//     "put" : board => {},
//     "reput" : board => {},
//     "gameset" : board => {},
//     "pass" : () => {},
// }




function canPutXY(board, turn, x, y){
    if(board[x][y] !== 0) return false;
    // console.log("hello");
    for(let dx = -1; dx <= 1; dx++){
        for(let dy = -1; dy <= 1; dy++){
            if(!(dx || dy)) continue;
            // console.log(dx)
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
            // console.log(turn);
            // console.log(typeof turn);
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
        // console.log(turn);
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
    // const table = document.getElementsByClassName("othello-board")[0];
    // // console.log(table);
    // table.remove();
    const main = document.getElementById("othello-main");
    main.remove();
    
}

function reset(){
    othello.transition("finish");
    othello.onUserInput(1);
}

function AI_NegaMax(board, turn, strength){


    function solution(board, turn, strength){
        const puttableArray = puttablePlaceArray(board, turn);
        if(strength <= 0){
            const r = 1, k = 0.2;
            let w = 0;
            let a = 0, b = 0, c = 0;
            // for(const col of board){
            //     for(const cell of col){
            //         w += cell * turn;
            //     }
            // }
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

    const [w, x, y] = solution(board, turn, strength);
    return [x, y];
}

function AI_last(board, turn, strength){
    for(let i = 0; i< 10000; i++){
        console.log(i);
    }
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
    //turn, message, amount, gameset
    //       <div id = "othello-result turn">turn</div>
    //   <div id = "othello-result message">message</div>
    //   <div id = "othello-result stone amount">stone amount</div>
    //   <div id = "othello-result gameset">gameset</div>
    //   <button id = "othello-result reset" onclick="reset()">reset</button>

    const turnEl = document.getElementById("othello-result turn");
    const stoneAmountEl = document.getElementById("othello-result stone amount");

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
    resultEl.id = "othello-result";
    resultEl.className = "card d-flex flex-column justify-content-around align-items-center";
    const turnEl = document.createElement("div");
    turnEl.id = "othello-result turn";
    // const messageEl = document.createElement("div");
    // messageEl.id = "othello-result message";
    const amountEl = document.createElement("div");
    amountEl.id = "othello-result stone amount";
    const winMessage = document.createElement("div");
    winMessage.id = "othello-result win";
    const resetEl = document.createElement("button");
    resetEl.id = "othello-result reset";
    resetEl.type = "button";
    resetEl.className = "btn btn-secondary w-50"
    resetEl.addEventListener("click", () => reset());
    resetEl.innerHTML = "return to Menu";
    // const icon = document.createElement("");
    // icon.className = "bi bi-box-arrow-right";
    // resetEl.appendChild(icon);
    resultEl.appendChild(turnEl);
    // resultEl.appendChild(messageEl);
    resultEl.appendChild(amountEl);
    resultEl.appendChild(winMessage);
    resultEl.appendChild(resetEl);
    const display = document.getElementById("othello-display");
    display.appendChild(resultEl);
}

function deleteResult(){
    document.getElementById("othello-result").remove();
}


// othello.onUserInput([4,2]);
// othello.onUserInput([5,4]);
// othello.onUserInput([4,5]);
// othello.onUserInput([3,2]);
// othello.onUserInput([2,3]);
// othello.onUserInput([5,2]);
// othello.onUserInput([4,1]);
// othello.onUserInput([5,3]);
// othello.onUserInput([6,3]);


(function(){
    console.log(localStorage);
    if(!localStorage.username){
        const username = window.prompt("please type username");
        localStorage.setItem("username", username);
    }
    if(!localStorage.wins){
        localStorage.setItem("wins", 0);
    }
    if(!localStorage.loses){
        localStorage.setItem("loses", 0);
    }

})();

(othello.states.title.enter)();



