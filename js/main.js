'use strict'

// debugger;
const MINE = '💣';
const FLAG = '🚩';

var gBoard;
var gNums = [];


var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0
};

var gLevel = {
    SIZE: 4,
    MINES: 2
};


function initGame() {
    gBoard = buildBoard();
    // console.log('gBoard[0][0]', gBoard[0][0]);
    renderBoard(gBoard);
    // countUpTimer();

}

function buildBoard() {
    var board = [];
    for (var i = 0; i < gLevel.SIZE; i++) {
        board.push([]);
        for (var j = 0; j < gLevel.SIZE; j++) {
            board[i][j] = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false
            };
            // if (i === 1 && j === 1 || i === 2 && j === 2) {
            //     board[i][j].isMine = true;
            // }
        }
    }
    setRandomMines(board);
    // console.log('gBoard1', board);
    setMinesNegsCount(board);
    // console.log('gBoard2', board);
    return board;
}

function setRandomMines(board) {
    for (var i = 0; i < (gLevel.SIZE * gLevel.SIZE); i++) {
        gNums[i] = i;
    }
    for (var i = 0; i < gLevel.MINES; i++) {
        var mineIdx = drawNum(gNums);
        var posI = Math.floor(mineIdx / gLevel.SIZE);
        var posJ = mineIdx - (gLevel.SIZE * posI);
        console.log('posI', posI);
        console.log('posJ', posJ);
        board[posI][posJ].isMine = true;
    }
}

function renderBoard(board) {
    var strHTML = '';
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>';
        for (var j = 0; j < board[0].length; j++) {
            var cell = board[i][j];
            var className = 'cell cell' + i + '-' + j;
            strHTML += `<td class="' + ${className} + '" onclick="cellClicked(this, ${i}, ${j})"
            oncontextmenu="cellMarked(this, ${i}, ${j})">
            </td>`;  // ${className}
            // oncontextmenu="return false;" oncontextmenu="cellMarked(this, ${i}, ${j})">
            // ' + ${cell.isMine} + ' ' + ${cell.minesAroundCount} + ' </td>`;
        }
        strHTML += '</tr>';
    }
    var elBoard = document.querySelector('.board');
    elBoard.innerHTML = strHTML;
}

function renderCell(i, j, value) {
    var elCell = document.querySelector(`.cell${i}-${j}`);
    elCell.innerHTML = value;
    console.log('gGame render', gGame);
}

function cellClicked(elCell, i, j) {
    if (!gGame.isOn) countUpTimer();
    gGame.isOn = true;
    if (gBoard[i][j].isShown === true) return;
    var value;
    console.log('elCell', elCell)
    console.log('elCell2', elCell.innerHTML)
    if (gBoard[i][j].isMine) {
        value = MINE;
    } else if (gBoard[i][j].minesAroundCount) {
        value = gBoard[i][j].minesAroundCount;
        gGame.shownCount++;
    } else if (!gBoard[i][j].minesAroundCount) {
        // value = '';
        expandShown(gBoard, elCell, i, j)
        return;
    }
    gBoard[i][j].isShown = true;
    // elCell.innerText = gBoard[i][j];
    renderCell(i, j, value);
    checkGameOver();
}


function setMinesNegsCount(board) {
    for (var cellI = 0; cellI < board.length; cellI++) {
        for (var cellJ = 0; cellJ < board[0].length; cellJ++) {
            for (var i = cellI - 1; i <= cellI + 1; i++) {
                if (i < 0 || i >= board.length) continue;
                for (var j = cellJ - 1; j <= cellJ + 1; j++) {
                    if (i === cellI && j === cellJ) continue;
                    if (j < 0 || j >= board[0].length) continue;
                    if (board[i][j].isMine) board[cellI][cellJ].minesAroundCount++;
                }
            }
        }
    }
    return board;
}


function cellMarked(elCell, i, j) {
    if (!gGame.isOn) countUpTimer();
    gGame.isOn = true;
    var value;
    if (elCell.innerHTML !== FLAG) {
        gBoard[i][j].isMarked = true;
        gGame.markedCount++;
        value = FLAG;
    } else {
        gBoard[i][j].isMarked = false;
        gGame.markedCount--;
        value = '';
    }
    renderCell(i, j, value);
    checkGameOver();
    // var strHTML = `oncontextmenu="return false;"`;
    // var elBoard = document.querySelector('.board');
    // elBoard.innerHTML = strHTML;
    // var elCell = document.querySelector(`.cell${i}-${j}`);
    // elCell.innerHTML = strHTML;
}


function checkGameOver() {
    if ((gGame.shownCount + gGame.markedCount) === (gLevel.SIZE * gLevel.SIZE)) {
        console.log('Game over - WIN');
    }


}

function expandShown(board, elCell, cellI, cellJ) {
    var value;
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= board.length) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (j < 0 || j >= board[i].length) continue;
            if(board[i][j].isShown || board[i][j].isMarked) continue;
            if (board[i][j].minesAroundCount) {
                value = board[i][j].minesAroundCount;
            } else if (!board[i][j].minesAroundCount) {
                value = 'non';
            }
            gBoard[i][j].isShown = true;
            gGame.shownCount++;
            renderCell(i, j, value);
        }
    }
}

// function handleKey(event) {
    //     console.log('ev:', event);

    // }
