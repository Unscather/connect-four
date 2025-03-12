import { PLAYER, DIFFICULTY, boardPositionLeft, holeHeight, holeWidth, gameProperties, updateProperty } from '../data/game-data.js';
import { drawBoardHoles, createPiece, drawDroppedPiece } from './render.js';
import { playCPUTurn } from './cpu-logic.js';

export function initializeGame() {
    // Remove board elements
    board.innerHTML = '';
    board.style.marginTop = `${25 + holeHeight}px`;

    // Create default pieces

    let pieces = [];
    for (let i = 0; i < gameProperties.columnSize; i++) {
        pieces.push([]);
    }
    //pieces = [[], [1], [0, 0, 1], [0, 0, 0, 1], [0, 1, 0], [1, 1, 0, 1], [1]]; //temporary
    updateProperty('pieces', pieces);

    drawBoardHoles();
}

// Updates position of piece to be dropped
export function handleHover(event) {
    if (gameProperties.isGameActive && ((gameProperties.currentPlayer === gameProperties.yourPlayerTitle && event.type === 'mousemove') ||
       (gameProperties.currentPlayer !== gameProperties.yourPlayerTitle && event.type === 'cpu'))) { // may need to change this for human players
        let colPosition = Math.floor((event.x - boardPositionLeft) / holeWidth); // fix to improve accuracy of mouse position on edges
        if (gameProperties.currentColumnHover !== colPosition) {
            const hoverPieceElement = document.getElementById('hover-piece');
    
            if (hoverPieceElement) {
                hoverPieceElement.remove();
            }
        
            if (colPosition < gameProperties.columnSize && colPosition >= 0) {
                let piece = createPiece(colPosition, -1);
                piece.id = 'hover-piece';
                piece.className = `player-piece player-piece-${gameProperties.currentPlayer === PLAYER.ONE ? 'one' : 'two' }`;
    
                board.appendChild(piece);
                updateProperty('currentColumnHover', colPosition);
            } else {
                updateProperty('currentColumnHover', -1);
            }
        }
    }
}

export function changePlayer() {
    const playerTextElement = document.getElementById('current-player');

    if (gameProperties.currentPlayer === PLAYER.ONE) {
        updateProperty('currentPlayer', PLAYER.TWO);
        playerTextElement.innerText = 'PLAYER TWO';
        playerTextElement.className = 'player-two';
    } else {
        updateProperty('currentPlayer', PLAYER.ONE);
        playerTextElement.innerText = 'PLAYER ONE';
        playerTextElement.className = 'player-one';
    }

    if (gameProperties.isCPUPlaying && gameProperties.currentPlayer !== gameProperties.yourPlayerTitle) {
        playCPUTurn();
    }
}

export function dropPiece() {
    if (gameProperties.isGameActive && gameProperties.currentColumnHover >= 0 &&
        gameProperties.pieces[gameProperties.currentColumnHover].length < gameProperties.columnSize - 1) {
        drawDroppedPiece(gameProperties.currentColumnHover);
        changePlayer(); 
        let originalColumnHover = gameProperties.currentColumnHover;

        // Simulate player moving out of area to force color change
        handleHover({x: 0}); 
        handleHover({x: boardPositionLeft + originalColumnHover * holeWidth });

        let winner = checkForWinner();
        if (winner !== -1) {
            if (winner !== 2) {
                alert(`Player ${winner === PLAYER.ONE ? 'One' : 'Two'} Wins!`);
            } else {
                alert('It\'s a tie!');
            }
            endGame();
        }
    }
}

export function checkForWinner() {
    for (let i = 0; i < gameProperties.pieces.length; i++) { // column
        for (let j = 0; j < gameProperties.pieces[i].length; j++) { // row
            // check for horizontal win
            if (i + gameProperties.winCondition <= gameProperties.columnSize && gameProperties.pieces[i][j] === gameProperties.pieces[i + 1][j] &&
                gameProperties.pieces[i][j] === gameProperties.pieces[i + 2][j] && gameProperties.pieces[i][j] === gameProperties.pieces[i + 3][j]) {
                return gameProperties.pieces[i][j];
            }
            // check for vertical win
            if (j + gameProperties.winCondition < gameProperties.columnSize && gameProperties.pieces[i][j] === gameProperties.pieces[i][j + 1] &&
                gameProperties.pieces[i][j] === gameProperties.pieces[i][j + 2] && gameProperties.pieces[i][j] === gameProperties.pieces[i][j + 3]) {
                return gameProperties.pieces[i][j];
            }
            // check for diagonal win (TRBL)
            if (i + gameProperties.winCondition <= gameProperties.columnSize && j + gameProperties.winCondition < gameProperties.columnSize &&
                gameProperties.pieces[i][j] === gameProperties.pieces[i + 1][j + 1] && gameProperties.pieces[i][j] === gameProperties.pieces[i + 2][j + 2] &&
                gameProperties.pieces[i][j] === gameProperties.pieces[i + 3][j + 3]) {
                return gameProperties.pieces[i][j];
            }
        }
    }

    for (let i = gameProperties.pieces.length - 1; i >= 0; i--) { // column
        for (let j = 0; j < gameProperties.pieces[i].length; j++) { // row
            // check for diagonal win (TLBR)
            if (i >= gameProperties.winCondition - 1 && j + gameProperties.winCondition < gameProperties.columnSize &&
                gameProperties.pieces[i][j] === gameProperties.pieces[i - 1][j + 1] && gameProperties.pieces[i][j] === gameProperties.pieces[i - 2][j + 2] &&
                gameProperties.pieces[i][j] === gameProperties.pieces[i - 3][j + 3]) {
                return gameProperties.pieces[i][j];
            }
        }
    }

    let piecesPlayed = 0;

    for (let i = 0; i < gameProperties.pieces.length; i++) {
        for (let j = 0; j < gameProperties.pieces[i].length; j++) {
            piecesPlayed++;
        }
    }

    // TO DO: SET UP ENUM FOR GAME STATUS, 2 is tie, -1 is continuing
    return piecesPlayed === gameProperties.columnSize * gameProperties.rowSize ? 2 : -1; // no winner
}

function setDifficulty() {
    const difficultyElement = document.getElementById('difficulty-dropdown');
    const difficultyString = difficultyElement.value;
    updateProperty('cpuDifficulty', DIFFICULTY[difficultyString]);
    difficultyElement.setAttribute('disabled', 'disabled');
}

export function startGame() {
    setDifficulty();
    initializeGame();
    changePlayer();
    updateProperty('isGameActive', true);
}

export function endGame() {
    handleHover({x : 0}); //TODO, FIX PIECE REMAINING AFTER GAME
    updateProperty('isGameActive', false);
    updateProperty('currentPlayer', PLAYER.TWO);
    const playerTextElement = document.getElementById('current-player');
    playerTextElement.innerText = '';
    const difficultyElement = document.getElementById('difficulty-dropdown');
    difficultyElement.removeAttribute('disabled');
}

window.handleHover = handleHover;
window.dropPiece = dropPiece;
window.startGame = startGame;