const PLAYER = Object.freeze({
    ONE: 0,
    TWO: 1
});

let columnSize = 7;
let rowSize = 6;
let pieces = [];
let winCondition = 4; // number of pieces in a row necessary to win
let hoverSpace = new Array(columnSize);

let board = document.getElementById('board');
const boardPositionLeft = 468;
const boardPositionTop = 25;

const holeHeight = board.offsetHeight / rowSize;
const holeWidth = board.offsetWidth / columnSize;

let currentPlayer = PLAYER.TWO;
let isGameActive = false;
let currentColumnHover = -1;

function initializeGame() {
    // Remove board elements
    board.innerHTML = '';
    board.style.marginTop = `${25 + holeHeight}px`;

    // Create default pieces
    pieces = [];
    for (let i = 0; i < columnSize; i++) {
        pieces.push([]);
    }

    drawBoardHoles();
}

// Create individual piece at given location
function createPiece(colIndex, rowIndex) {
    let pieceElement = document.createElement('div');
    pieceElement.style.height = `${holeHeight}px`;
    pieceElement.style.width = `${holeHeight}px`; // ensures square
    pieceElement.style.left = `${boardPositionLeft + colIndex * holeWidth + (holeWidth - holeHeight) / 2}px`;
    pieceElement.style.top = `${boardPositionTop + holeHeight + rowIndex * holeHeight}px`;

    return pieceElement;
}

// Draw the holes on the board
function drawBoardHoles() {
    let hole = null;

    for (let i = 0; i < columnSize; i++) {
        for (let j = 0; j < rowSize; j++) {
            hole = createPiece(i, j);
            hole.className = 'board-piece';

            board.appendChild(hole);
        }
    }
}

// Draw player's dropped piece
function drawDroppedPiece(colIndex) {
    const rowPosition = rowSize - pieces[colIndex].length - 1;

    let piece = createPiece(colIndex, rowPosition);
    piece.className = `player-piece player-piece-${currentPlayer === PLAYER.ONE ? 'one' : 'two'}`;

    board.appendChild(piece);
    pieces[colIndex].push(currentPlayer);
}

// Updates position of piece to be dropped
function handleHover(event) {
    if (isGameActive) {
        let colPosition = Math.floor((event.x - boardPositionLeft) / holeWidth); // fix to improve accuracy of mouse position on edges
        if (currentColumnHover !== colPosition) {
            const hoverPieceElement = document.getElementById('hover-piece');
    
            if (hoverPieceElement) {
                hoverPieceElement.remove();
            }
        
            if (colPosition < columnSize && colPosition >= 0) {
                let piece = createPiece(colPosition, -1);
                piece.id = 'hover-piece';
                piece.className = `player-piece player-piece-${currentPlayer === PLAYER.ONE ? 'one' : 'two' }`;
    
                board.appendChild(piece);
                currentColumnHover = colPosition;
            } else {
                currentColumnHover = -1;
            }
        }
    }
}

function changePlayer() {
    const playerTextElement = document.getElementById('current-player');

    if (currentPlayer === PLAYER.ONE) {
        currentPlayer = PLAYER.TWO;
        playerTextElement.innerText = 'PLAYER TWO';
        playerTextElement.className = 'player-two';
    } else {
        currentPlayer = PLAYER.ONE;
        playerTextElement.innerText = 'PLAYER ONE';
        playerTextElement.className = 'player-one';
    }

}

function dropPiece() {
    if (isGameActive && currentColumnHover >= 0 && pieces[currentColumnHover].length < columnSize - 1) {
        drawDroppedPiece(currentColumnHover);
        changePlayer(); 
        let originalColumnHover = currentColumnHover;

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

function checkForWinner() {
    for (let i = 0; i < pieces.length; i++) { // column
        for (let j = 0; j < pieces[i].length; j++) { // row
            // check for horizontal win
            if (i + winCondition <= columnSize && pieces[i][j] === pieces[i + 1][j] && pieces[i][j] === pieces[i + 2][j] && pieces[i][j] === pieces[i + 3][j]) {
                return pieces[i][j];
            }
            // check for vertical win
            if (j + winCondition < columnSize && pieces[i][j] === pieces[i][j + 1] && pieces[i][j] === pieces[i][j + 2] && pieces[i][j] === pieces[i][j + 3]) {
                return pieces[i][j];
            }
            // check for diagonal win (TRBL)
            if (i + winCondition <= columnSize && j + winCondition < columnSize && pieces[i][j] === pieces[i + 1][j + 1] && pieces[i][j] === pieces[i + 2][j + 2] &&
                pieces[i][j] === pieces[i + 3][j + 3]) {
                return pieces[i][j];
            }
        }
    }

    for (let i = pieces.length - 1; i >= 0; i--) { // column
        for (let j = 0; j < pieces[i].length; j++) { // row
            // check for diagonal win (TLBR)
            if (i >= winCondition - 1 && j + winCondition < columnSize && pieces[i][j] === pieces[i - 1][j + 1] && pieces[i][j] === pieces[i - 2][j + 2] &&
                pieces[i][j] === pieces[i - 3][j + 3]) {
                return pieces[i][j];
            }
        }
    }

    let piecesPlayed = 0;

    for (let i = 0; i < pieces.length; i++) {
        for (let j = 0; j < pieces[i].length; j++) {
            piecesPlayed++;
        }
    }

    // TO DO: SET UP ENUM FOR GAME STATUS, 2 is tie, -1 is continuing
    return piecesPlayed === columnSize * rowSize ? 2 : -1; // no winner
}

function startGame() {
    initializeGame();
    changePlayer();
    isGameActive = true;
}

function endGame() {
    handleHover({x : 0});
    isGameActive = false;
    currentPlayer = PLAYER.TWO;
    const playerTextElement = document.getElementById('current-player');
    playerTextElement.innerText = '';
}

initializeGame();
