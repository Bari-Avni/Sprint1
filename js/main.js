'use strict'
// Minesweeper GAME

const MINE = '💣';
const FLAG = '🚩';

var gBoard;
var gGameTimer;

var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0,
    isEnd: false,
    lives: 0,
    isHint: false,
    isHintToggle: false,
    hintIdx: 0,
    safeClicks: 3,
    safeClickToggle: false
};

var gLevel = {
    SIZE: 4,
    MINES: 2,
};

function initGame() {
    gBoard = buildBoard();
    renderBoard(gBoard);
    getBestScores();
}

function gameLevel(level) {
    switch (level) {
        case 1:
            gLevel.SIZE = 4;
            gLevel.MINES = 2;
            break
        case 2:
            gLevel.SIZE = 8;
            gLevel.MINES = 12;
            break
        case 3:
            gLevel.SIZE = 12;
            gLevel.MINES = 30;
            break
        default: return null;
    }
    // update level buttons
    for (var i = 0; i < 3; i++) {
        var elLevel = document.querySelector(`.level-${i + 1}`);
        if (level === (i + 1)) {
            if (!elLevel.style.backgroundColor) {
                elLevel.style.backgroundColor = '#C0C0C0';
                continue;
            } else {
                continue;
            }
        }
        elLevel.style.backgroundColor = '';
    }
    playAgain();
}

function getLives(elBtn, lives) {
    if (gGame.isEnd) return;
    if (!gGame.isOn) {
        switch (lives) {
            case 1:
                gGame.lives = 1;
                break
            case 2:
                gGame.lives = 2;
                break
            case 3:
                gGame.lives = 3;
                break
            default: return null;
        }
        // update lives buttons
        for (var i = 0; i < 3; i++) {
            if (lives === (i + 1)) {
                if (!elBtn.style.backgroundColor) {
                    elBtn.style.backgroundColor = '#C0C0C0';
                    continue;
                } else {
                    elBtn.style.backgroundColor = '';
                    gGame.lives = 0;
                    continue;
                }
            }
            var elLives = document.querySelector(`.lives${i + 1}`);
            elLives.style.backgroundColor = '';
        }
        initGame();
    }
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
            }
        }
    }
    return board;
}

function setRandomMines(cellI, cellJ) {
    var nums = [];
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            if (i === cellI && j === cellJ) continue;
            var emptyCells = { i: i, j: j };
            nums.push(emptyCells);
        }
    }
    for (var i = 0; i < gLevel.MINES; i++) {
        var mineCell = drawNum(nums);
        gBoard[mineCell.i][mineCell.j].isMine = true;
    }
}

function renderBoard(board) {
    var strHTML = '';
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>';
        for (var j = 0; j < board[0].length; j++) {
            var className = 'cell cell' + i + '-' + j;
            strHTML += `<td class="' + ${className} + '" onclick="cellClicked(this, ${i}, ${j})"
            oncontextmenu="cellMarked(this, ${i}, ${j});return false;">
            </td>`;
        }
        strHTML += '</tr>';
    }
    var elBoard = document.querySelector('.board');
    elBoard.innerHTML = strHTML;
}

function renderCell(i, j, value) {
    var elCell = document.querySelector(`.cell${i}-${j}`);
    if (value !== FLAG && value !== ' ') {
        elCell.style.backgroundColor = "#7A7A7A";
        if (gGame.isHintToggle) {
            elCell.style.backgroundColor = "#C0C0C0";
        }
        if (gGame.safeClickToggle) {
            elCell.style.backgroundColor = "#C0C0C0";
        }
    }
    elCell.innerHTML = value;
    checkGameOver();
}

function cellClicked(elCell, i, j) {
    if (gGame.isEnd) return;
    if (!gGame.isOn) {
        setRandomMines(i, j);
        setMinesNegsCount(gBoard);
        countUpTimer();
    }
    gGame.isOn = true;
    if (elCell.innerText !== '') return;
    var value;
    // check if user press hint
    if (gGame.isHint) {
        pressedHint(i, j);
        return;
    }
    if (gGame.safeClickToggle) return;
    // check if user press LIVES
    if (gBoard[i][j].isMine) {
        if (gGame.lives) {
            gGame.lives--;
            var elLives = document.querySelector(`.lives${gGame.lives + 1}`);
            elLives.style.backgroundColor = '';
            if (gGame.lives) {
                var elLives = document.querySelector(`.lives${gGame.lives}`);
                elLives.style.backgroundColor = '#C0C0C0';
            }
            showMineAlert();
            return;
        }
        revealMines();
        gameOver(false);
        return;
    } else if (gBoard[i][j].minesAroundCount) {
        value = gBoard[i][j].minesAroundCount;
        gGame.shownCount++;
    } else if (!gBoard[i][j].minesAroundCount) {
        expandShownFull(gBoard, i, j);
        return;
    }
    gBoard[i][j].isShown = true;
    renderCell(i, j, value);
}

function pressedHint(i, j) {
    if (gGame.isHintToggle) return;
    expandShownFull(gBoard, i, j);
    gGame.isHintToggle = true;
    setTimeout(function () {
        expandShownFull(gBoard, i, j);
        gGame.isHint = false;
        gGame.isHintToggle = false;
        var elHint = document.querySelector(`.hint${gGame.hintIdx}`);
        elHint.style.visibility = 'hidden';
    }, 1000);
}

function revealMines() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            if (gBoard[i][j].isMine) renderCell(i, j, MINE);
        }
    }
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
    if (gGame.isEnd) return;
    if (!gGame.isOn) {
        setRandomMines(i, j);
        setMinesNegsCount(gBoard);
        countUpTimer();
    }
    gGame.isOn = true;
    var value;
    if (elCell.innerText !== FLAG) {
        if (elCell.innerText !== '') return;
        gBoard[i][j].isMarked = true;
        gGame.markedCount++;
        value = FLAG;
    } else {
        gBoard[i][j].isMarked = false;
        gGame.markedCount--;
        value = ' ';
    }
    renderCell(i, j, value);
}

function checkGameOver() {
    if ((gGame.shownCount + gGame.markedCount) === (gLevel.SIZE * gLevel.SIZE)
        && gGame.markedCount === gLevel.MINES) {
        gameOver(true);
    }
}

// check if win or loose in game over
function gameOver(isWin) {
    gGame.isOn = false;
    gGame.isEnd = true;
    clearInterval(gGameTimer);
    gGameTimer = null;
    if (isWin) {
        var elStartBtn = document.querySelector('.start');
        elStartBtn.innerText = '😎';
        setBestScore();
    } else {
        var elStartBtn = document.querySelector('.start');
        elStartBtn.innerText = '🤯';
    }
}

function playAgain() {
    gGame = {
        isOn: false,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0,
        isEnd: false,
        lives: 0,
        isHint: false,
        isHintToggle: false,
        hintIdx: 0,
        safeClicks: 3,
        safeClickToggle: false
    };
    clearInterval(gGameTimer);
    gGameTimer = null;
    var elGameTimer = document.querySelector('.minutes');
    elGameTimer.innerText = '00';
    var elGameTimer = document.querySelector('.seconds');
    elGameTimer.innerText = '00';
    var elStartBtn = document.querySelector('.start');
    elStartBtn.innerText = '😀';
    for (var i = 1; i < 4; i++) {
        var elHint = document.querySelector(`.hint${i}`);
        elHint.innerText = '💡';
        elHint.style.visibility = 'visible'
        elHint.style.display = 'inline-block';
    }
    for (var i = 0; i < 3; i++) {
        var elLives = document.querySelector(`.lives${i + 1}`);
        elLives.style.backgroundColor = '';
    }
    var elSafe = document.querySelector('.safe-click span');
    elSafe.innerText = 3;
    initGame();
}

function expandShownFull(board, cellI, cellJ) {
    var value;
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= board.length) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (j < 0 || j >= board[i].length) continue;
            if (board[i][j].isShown || board[i][j].isMarked) continue;
            if (board[i][j].minesAroundCount) {
                value = board[i][j].minesAroundCount;
            } else if (!board[i][j].minesAroundCount) {
                value = '';
            }
            // if press hint only reveal cells (including MINE), do not update global variables
            if (!gGame.isHint) {
                gBoard[i][j].isShown = true;
                gGame.shownCount++;
            } else {
                if (board[i][j].isMine) {
                    value = MINE;
                }
            }
            // if press hint, after 1 second stop reveal the cells
            if (gGame.isHintToggle) {
                value = '';
            }
            renderCell(i, j, value);
            // recuirsion for expand all empty cells that are connected and their numbered neighbors
            if (gGame.isHint) continue;
            if (!board[i][j].minesAroundCount) {
                if (i === cellI && j === cellJ) continue;
                expandShownFull(board, i, j);
            }
        }
    }

}

function showMineAlert() {
    var elMineAlert = document.querySelector('.mine-alert');
    elMineAlert.style.display = 'block';
    setTimeout(function () {
        elMineAlert.style.display = 'none';
    }, 1000);
}

function getHint(elHint, idx) {
    if (!gGame.isOn) return;
    if (gGame.isEnd) return;
    if (gGame.isHint) return;
    if (gGame.safeClickToggle) return;
    if ((gGame.shownCount + gGame.markedCount) === (gLevel.SIZE * gLevel.SIZE)) return;
    gGame.isHint = true;
    gGame.hintIdx = idx;
    elHint.innerText = '💥';
}

function getBestScores() {
    var classNames = ['.beginner', '.medium', '.expert'];
    for (var i = 0; i < classNames.length; i++) {
        if (!localStorage.getItem(`level${i + 1}`)) continue;
        var elBestScore = document.querySelector(classNames[i]);
        elBestScore.innerText = localStorage.getItem(`level${i + 1}`);
    }
}

function setBestScore() {
    // score is consider the fastest time to WIN the game, per level
    // Check browser support
    var className;
    var idx;
    if (typeof (Storage) !== "undefined") {
        // keep best score in local storage
        switch (gLevel.SIZE) {
            case 4:
                className = '.beginner';
                idx = 1;
                break
            case 8:
                className = '.medium';
                idx = 2;
                break
            case 12:
                className = '.expert';
                idx = 3;
                break
            default: return null;
        }
        if (!localStorage.getItem(`level${idx}`)) {
            localStorage.setItem(`level${idx}`, gGame.secsPassed);
        } else if (gGame.secsPassed < localStorage.getItem(`level${idx}`)) {
            localStorage.setItem(`level${idx}`, gGame.secsPassed);
        } else return;
        // Retrieve from storage and update
        var elBestScore = document.querySelector(className);
        elBestScore.innerText = localStorage.getItem(`level${idx}`);
    } else return;
}

function resetBestScores() {
    var classNames = ['.beginner', '.medium', '.expert'];
    for (var i = 0; i < classNames.length; i++) {
        localStorage.removeItem(`level${i + 1}`);
        var elBestScore = document.querySelector(classNames[i]);
        elBestScore.innerText = 0;
    }
}

function safeClick() {
    if (!gGame.isOn) return;
    if (gGame.isEnd) return;
    if (gGame.isHint) return;
    if (gGame.safeClickToggle) return;
    if (gGame.safeClicks === 0) return;
    var value;
    var nums = [];
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            if (gBoard[i][j].isMine || gBoard[i][j].isShown || gBoard[i][j].isMarked) continue;
            var safeCells = { i: i, j: j };
            nums.push(safeCells);
        }
    }
    var safeCell = drawNum(nums);
    if (!safeCell) return;
    if (gBoard[safeCell.i][safeCell.j].minesAroundCount) {
        value = gBoard[safeCell.i][safeCell.j].minesAroundCount;
    } else if (!gBoard[safeCell.i][safeCell.j].minesAroundCount) {
        value = '';
    }
    renderCell(safeCell.i, safeCell.j, value);
    gGame.safeClicks--;
    gGame.safeClickToggle = true;
    var elSafe = document.querySelector('.safe-click span');
    elSafe.innerText = gGame.safeClicks;
    setTimeout(function () {
        value = '';
        renderCell(safeCell.i, safeCell.j, value);
        gGame.safeClickToggle = false;
    }, 1000);
}
