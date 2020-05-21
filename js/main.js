'use strict'
const BOMB = '💣'
const FLAG = '⛳'
var userLives = 3;
var currLevel;
var gBoard;
var timervar = null
var gGame;
var currlevelText;
var highestscore = {
    easy: localStorage.getItem('BestTimeEasy'),
    medium: localStorage.getItem('BestTimeMedium'),
    expert  : localStorage.getItem('BestTimeHard')
}
const gLevel = {
    easy: { SIZE: 4, MINES: 2 },
    medium: { SIZE: 8, MINES: 12 },
    expert: { SIZE: 12, MINES: 30 }
}
const EMOJI = {
    normal: '😏',
    sad: '😒',
    win: '😋'
}
var emojiReaction = document.querySelector('.reaction')
window.oncontextmenu = function () {
    return false;
}

function initGame(level) {
    emojiReaction.innerText = EMOJI.normal
    document.querySelector('.highest-score').innerText = `Highest Score in this level : ${parseTimer(highestscore[level])}`;
    userLives = 3
    clearInterval(timervar)
    timervar = null;
    gGame = {
        isOn: true,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0,
        isMinesSet: false
    }
    document.querySelector('.timer').innerText = `Time:${parseTimer(0)}`;
    displayLives()
    if (!level) {
        level = currlevelText
    }
    currlevelText = `${level}`
    currLevel = gLevel[level];
    gBoard = buildBoard(currLevel.SIZE)
    renderBoard(gBoard)
    
}
function buildBoard(size) {
    var board = [];
    for (var i = 0; i < size; i++) {
        board.push([])
        for (var j = 0; j < size; j++) {
            board[i][j] = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false
            }
        }
    }
    return board
}
function createMines(row, col) {
    gGame.isMinesSet = true;
    for (var i = 0; i < currLevel.MINES; i++) {
        var freeCell = getFreeCell(row, col)
        var freeRow = freeCell.row
        var freeCol = freeCell.col
        setMinesNegsCount(gBoard, freeRow, freeCol)
        gBoard[freeRow][freeCol].isMine = true;
    }
}
function getFreeCell(row, col) {
    var randomRowCoord = getRandomInteger(0, gBoard.length)
    var randomColumnCoord = getRandomInteger(0, gBoard.length)
    while (gBoard[randomRowCoord][randomColumnCoord].isMine || randomRowCoord === row && randomColumnCoord === col) {
        randomRowCoord = getRandomInteger(0, gBoard.length)
        randomColumnCoord = getRandomInteger(0, gBoard.length)
    }
    return { row: randomRowCoord, col: randomColumnCoord }
}

function renderBoard(board) {
    var strHTML = '';
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>'
        for (var j = 0; j < board[0].length; j++) {
            strHTML += `<td id="${i}-${j}" oncontextmenu="cellMarked(this , ${i},${j})" onclick="cellClicked(this , ${i},${j})" ></td>`
        }
        strHTML += '</tr>'
    }

    var elTbody = document.querySelector('.board');
    elTbody.innerHTML = strHTML;
}

function setMinesNegsCount(board, rowIdx, colIdx) {
    for (var i = 0; i < 3; i++) {
        for (var j = 0; j < 3; j++) {
            var currCell = board[rowIdx - 1 + i] && board[rowIdx - 1 + i][colIdx - 1 + j]
            if (currCell !== undefined && !currCell.isMine) {
                currCell.minesAroundCount += 1
            }
        }
    }
}

function cellClicked(elCell, rowIdx, colIdx) {
    if (!gGame.isOn) return;
    if (!gGame.isMinesSet) createMines(rowIdx, colIdx)
    console.log(gBoard)
    if (!timervar) {
        timervar = setInterval(function () {
            gGame.secsPassed++;
            document.querySelector('.timer').innerText = `Time:${parseTimer(gGame.secsPassed)}`;
        }, 10)
    }
    var currCell = gBoard[rowIdx][colIdx]
    if (currCell.isMine) {
        emojiReaction.innerText = EMOJI.sad;
        onMineClicked(rowIdx, colIdx)
        return
    }
    if (currCell.isMarked) return;
    if (currCell.isShown) return;
    expandShown(gBoard, rowIdx, colIdx)
    checkGameOver()
}

function cellMarked(elCell, rowIdx, colIdx) {
    if (!gGame.isOn) return;
    var currCell = gBoard[rowIdx][colIdx]
    if (!currCell.isMarked && !currCell.isShown) {
        currCell.isMarked = true;
        elCell.classList.add('flag')
        elCell.innerText = FLAG;
        gGame.markedCount++
        checkGameOver()
    }
    else {
        elCell.classList.remove('flag')
        elCell.innerText = currCell.isShown ? currCell.minesAroundCount : ''
        currCell.isMarked = false;
        gGame.markedCount--
    }
}
function checkGameOver() {
    if (gGame.shownCount === ((gBoard.length ** 2) - currLevel.MINES)) {
        if (gGame.markedCount === currLevel.MINES) {
            emojiReaction.innerText = EMOJI.win;
            gGame.isOn = false;
            clearInterval(timervar)
            if (currlevelText === 'easy') {
                var bestEasy = localStorage.getItem('BestTimeEasy');
                if (bestEasy > gGame.secsPassed || !bestEasy) {
                     localStorage.setItem('BestTimeEasy', gGame.secsPassed);
                     highestscore.easy=localStorage.getItem('BestTimeEasy');
                    
                }
            }
            if (currlevelText === 'medium') {
                var bestMedium = localStorage.getItem('BestTimeMedium');
                if (bestMedium > gGame.secsPassed || !bestMedium) {
                    localStorage.setItem('BestTimeMedium', gGame.secsPassed);
                    highestscore.medium = localStorage.getItem('BestTimeMedium');
                    
                }
            }
            if (currlevelText === 'expert') {

                var bestHard = localStorage.getItem('BestTimeHard');
                if (bestHard > gGame.secsPassed || !bestHard) {
                    localStorage.setItem('BestTimeHard', gGame.secsPassed);
                    highestscore.expert = localStorage.getItem('BestTimeHard');
                }
            }
            
        }
        return true;
    }

}
function expandShown(board, i, j) {
    emojiReaction.innerText = EMOJI.normal;
    var elCell = document.getElementById(`${i}-${j}`)
    elCell.innerHTML = board[i][j].minesAroundCount > 0 ? board[i][j].minesAroundCount : ''
    elCell.classList.add(board[i][j].minesAroundCount > 0 ? 'empty-cell' : 'nonempty-cell')
    board[i][j].isShown = true
    gGame.shownCount++
    if (board[i][j].minesAroundCount > 0) {
        return;
    }
    for (var row = 0; row < 3; row++) {
        for (var col = 0; col < 3; col++) {
            var currCell = board[i - 1 + row] && board[i - 1 + row][j - 1 + col]
            if (currCell !== undefined && !currCell.isShown) {
                expandShown(board, i - 1 + row, j - 1 + col)
            }
        }
    }
}
function onMineClicked(row, col) {
    if (userLives > 1) {
        var currMine = document.getElementById(`${row}-${col}`)
        currMine.classList.add('bomb')
        currMine.innerText = BOMB
        userLives--;
        displayLives()

    }
    else {
        userLives--;
        gGame.isOn = false;
        displayLives()
        for (var i = 0; i < gBoard.length; i++) {
            for (var j = 0; j < gBoard.length; j++) {
                if (gBoard[i][j].isMine) {
                    var currMine = document.getElementById(`${i}-${j}`)
                    currMine.innerText = BOMB
                }
            }
        }
        //var bombs = document.querySelectorAll('.bomb')
        clearInterval(timervar)
        return
    }
}
function displayLives() {
    var livesCount = document.querySelector('.lives')
    livesCount.innerText = userLives ? `${userLives} Lives left` : 'Game Over!'
}