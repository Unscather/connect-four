import { PLAYER, holeHeight, boardPositionLeft, holeWidth, boardPositionTop, gameProperties, updateProperty } from "../data/game-data.js";

// Create individual piece at given location
export function createPiece(colIndex, rowIndex) {
    let pieceElement = document.createElement('div');
    pieceElement.style.height = `${holeHeight}px`;
    pieceElement.style.width = `${holeHeight}px`; // ensures square
    pieceElement.style.left = `${boardPositionLeft + colIndex * holeWidth + (holeWidth - holeHeight) / 2}px`;
    pieceElement.style.top = `${boardPositionTop + holeHeight + rowIndex * holeHeight}px`;

    return pieceElement;
}

// Draw player's dropped piece
export function drawDroppedPiece(colIndex) {
    let pieces = gameProperties.pieces;
    const rowPosition = gameProperties.rowSize - pieces[colIndex].length - 1;

    let piece = createPiece(colIndex, rowPosition);
    piece.className = `player-piece player-piece-${gameProperties.currentPlayer === PLAYER.ONE ? 'one' : 'two'}`;

    board.appendChild(piece);
    pieces[colIndex].push(gameProperties.currentPlayer);

    updateProperty('pieces', pieces);
}

// Draw the holes on the board
export function drawBoardHoles() {
    let hole = null;

    for (let i = 0; i < gameProperties.columnSize; i++) {
        for (let j = 0; j < gameProperties.rowSize; j++) {
            hole = createPiece(i, j);
            hole.className = 'board-piece';

            board.appendChild(hole);
        }
    }
}