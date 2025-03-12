import { PLAYER, DIFFICULTY, DIFFICULTY_ADJUSTMENT, DIRECTION, boardPositionLeft, holeWidth, gameProperties, updateProperty } from '../data/game-data.js';
import { dropPiece, handleHover, checkForWinner } from './game-handler.js';

function doesPieceContainAdjacent(axis, direction, rowIndex, colIndex) {
    console.log(colIndex)
    switch (axis) {
        case 'horizontal':
            // const colLength = gameProperties.pieces[colIndex].length;
            // if ((colIndex > 0 && gameProperties.pieces[colIndex - 1].length >= colLength && gameProperties.pieces[colIndex - 1][rowIndex] === gameProperties.pieces[colIndex][rowIndex] && direction === 'right') || 
            //     (colIndex < gameProperties.columnSize - 1 && gameProperties.pieces[colIndex + 1].length >= colLength && gameProperties.pieces[colIndex + 1][rowIndex] === gameProperties.pieces[colIndex][rowIndex] && direction === 'left')) {
            //         return true;
            //     }
            /*
            IF (THE PIECE LEFT OF THE CURRENT PIECE IS THE SAME) OR (THE PIECE RIGHT OF THE CURRENT PIECE IS THE SAME)
              RETURN TRUE;
            */
            break;
        case 'vertical':
            break;
        case 'diagonal':
            break;
        default:
            break;
    }
    return false;
}

function checkForPattern() {
    const humanPlayer = gameProperties.currentPlayer === PLAYER.ONE ? PLAYER.TWO : PLAYER.ONE;

    // START HERE - VERIFY CONDITIONS OF COLUMN CHECKING SINCE LOOP MAY NOT BE NECESSARY, JUST NEED COLUMN INDEX TO DETERMINE IMMEDIATE NEIGHBORS!!!
    function getPossibleDrops(player) {
        let possibleDrops = Array(gameProperties.columnSize).fill(0); // reward score
        let significantPieces = [];

        for (let i = 0; i < gameProperties.columnSize; i++) {
            const rowIndex = gameProperties.pieces[i].length;
            // check for vertical strategy
            if (rowIndex > 0 && rowIndex <= gameProperties.rowSize - gameProperties.winCondition) {
                if (gameProperties.pieces[i][rowIndex - 1] === player && gameProperties.pieces[i][rowIndex - 2] === player) {
                    possibleDrops[i]++;
                }
            }
            
            // check for horizontal strategy
            if (rowIndex <= gameProperties.rowSize) { // Can we place a piece down in the column?
                let direction = DIRECTION.LEFT;
                let possibleSpaces = 1; // how many pieces in a row is possible to make with the current board
                let movementAmount = 0; // how much from the piece we check
                let piecesConnected = []; // the pieces are currently in a row for the player

                while (direction !== DIRECTION.NONE) {
                    // Can we go to the left?
                    if (direction === DIRECTION.LEFT && i - movementAmount - 1 >= 0) { 
                        // Does the piece to the left match the selected player's piece?
                        if ((rowIndex === 0 && gameProperties.pieces[i - movementAmount - 1].length === 1 && gameProperties.pieces[i - movementAmount - 1][rowIndex] === player) ||
                            (gameProperties.pieces[i - movementAmount - 1].length >= rowIndex + 1 && gameProperties.pieces[i - movementAmount - 1][rowIndex] === player)) {
                            possibleSpaces++;
                            movementAmount++;
                            piecesConnected.push(i - movementAmount - 1);
                        // Does the piece to the left have a piece below it?
                        } else if ((rowIndex === 0 && gameProperties.pieces[i - movementAmount - 1].length === 0) ||
                                    gameProperties.pieces[i - movementAmount - 1].length === rowIndex) {
                            possibleSpaces++;
                            movementAmount++;
                        // Cannot move to the left anymore.
                        } else { 
                            movementAmount = 0;
                            direction = DIRECTION.RIGHT;
                        }
                    // Can we go to the right?
                    } else if (direction === DIRECTION.RIGHT && i + movementAmount + 1 <= gameProperties.columnSize - 1) { 
                        // Does the piece to the right match the selected player's piece?
                        if ((rowIndex === 0 && gameProperties.pieces[i + movementAmount + 1]. length === 1 && gameProperties.pieces[i + movementAmount + 1][rowIndex] === player) ||
                            (gameProperties.pieces[i + movementAmount + 1].length >= rowIndex + 1 && gameProperties.pieces[i + movementAmount + 1][rowIndex] === player)) { 
                            possibleSpaces++;
                            movementAmount++;
                            piecesConnected.push(i + movementAmount + 1);
                        // Does the piece to the right have a piece below it?
                        } else if ((rowIndex === 0 && gameProperties.pieces[i + movementAmount + 1].length === 0) ||
                                    gameProperties.pieces[i + movementAmount + 1].length === rowIndex) { 
                            possibleSpaces++;
                            movementAmount++;
                        // Cannot move to the right anymore.
                        } else { 
                            direction = direction.NONE;
                        }
                    // No more options left.
                    } else { 
                        movementAmount = 0;
                        direction = direction === DIRECTION.LEFT ? DIRECTION.RIGHT : DIRECTION.NONE;
                    }
                }

                // (May need to consider recursive logic where we conditionally set a lesser amount of pieces in a row for less significant strategies)
                // ex. win condition is 6, then check for 4, then 3, then 2 if the prior length yields nothing
                if (possibleSpaces >= gameProperties.winCondition && piecesConnected.length > 1) {
                    possibleDrops[i]++;
                }
            }

            // Verify piece is significant based on potential 2-piece arrangements which can immediately win the game.
            if ((i > 0 && gameProperties.pieces[i - 1][rowIndex] === player) || (i < gameProperties.columnSize - 1 && gameProperties.pieces[i + 1][rowIndex] === player)) {
                if (!significantPieces.includes(i)) {
                    significantPieces.push(i);
                }
            }

            // check for diagonal (TRBL) strategy
    
            // check for diagonal (TLBR) strategy
        }

        // check for significant pieces
        let maxScore = 0;
        possibleDrops.forEach((x) => maxScore = x > maxScore ? x : maxScore);
        if (maxScore > 0 && possibleDrops.filter(x => x === maxScore).length > 2) {
            for (let i = 0; i < possibleDrops.length; i++) {
                if (significantPieces.includes(i)) {
                    possibleDrops[i]++;
                }
            }
        }

        console.log(player, possibleDrops)
        return possibleDrops;
    }
    
    let cpuPatternRewards = getPossibleDrops(gameProperties.currentPlayer);
    let humanPatternRewards = getPossibleDrops(humanPlayer);
    let sumPatternRewards = [];
    let maxIndexes = [];

    let max = 0;

    for (let i = 0; i < gameProperties.columnSize; i++) {
        sumPatternRewards.push(cpuPatternRewards[i] + humanPatternRewards[i]);
        if (sumPatternRewards[i] > max) {
            max = sumPatternRewards[i];
            maxIndexes = [i];
        } else if (sumPatternRewards[i] === max) {
            maxIndexes.push(i);
        }
    }

    if (max > 0) {
        return maxIndexes[Math.floor(Math.random() * maxIndexes.length)];
    }

    return -1;

    // for (let i = 0; i < pieces.length; i++) { // column
    //     for (let j = 0; j < pieces[i].length; j++) { // row
    //         // check for horizontal win
    //         if (i + winCondition <= columnSize && pieces[i][j] === pieces[i + 1][j] && pieces[i][j] === pieces[i + 2][j] && pieces[i][j] === pieces[i + 3][j]) {
    //             return pieces[i][j];
    //         }
    //         // check for vertical win
    //         if (j + winCondition < columnSize && pieces[i][j] === pieces[i][j + 1] && pieces[i][j] === pieces[i][j + 2] && pieces[i][j] === pieces[i][j + 3]) {
    //             return pieces[i][j];
    //         }
    //         // check for diagonal win (TRBL)
    //         if (i + winCondition <= columnSize && j + winCondition < columnSize && pieces[i][j] === pieces[i + 1][j + 1] && pieces[i][j] === pieces[i + 2][j + 2] &&
    //             pieces[i][j] === pieces[i + 3][j + 3]) {
    //             return pieces[i][j];
    //         }
    //     }
    // }

    // for (let i = pieces.length - 1; i >= 0; i--) { // column
    //     for (let j = 0; j < pieces[i].length; j++) { // row
    //         // check for diagonal win (TLBR)
    //         if (i >= winCondition - 1 && j + winCondition < columnSize && pieces[i][j] === pieces[i - 1][j + 1] && pieces[i][j] === pieces[i - 2][j + 2] &&
    //             pieces[i][j] === pieces[i - 3][j + 3]) {
    //             return pieces[i][j];
    //         }
    //     }
    // }

    // let piecesPlayed = 0;

    // for (let i = 0; i < pieces.length; i++) {
    //     for (let j = 0; j < pieces[i].length; j++) {
    //         piecesPlayed++;
    //     }
    // }

    // // TO DO: SET UP ENUM FOR GAME STATUS, 2 is tie, -1 is continuing
    // return piecesPlayed === columnSize * rowSize ? 2 : -1; // no winner
}

function getCPUColumnIndex() {
    let indexPos = -1;
    let difficultyRandomizer = Math.random();
    let isMoveRandom = false; // move can be randomized if difficulty is lower

    function getCriticalIndex(player) {
        let pieces = [...gameProperties.pieces];
        for (let i = 0; i < gameProperties.columnSize; i++) {
            pieces[i].push(player);
            if (checkForWinner() === player) {
                pieces[i].pop();
                return i;
            }
            pieces[i].pop();
        }
        return -1;
    }

    // check for winner
    indexPos = getCriticalIndex(gameProperties.currentPlayer);

    // check for blocking opponent
    if (indexPos === -1) {
        const humanPlayer = gameProperties.currentPlayer === PLAYER.ONE ? PLAYER.TWO : PLAYER.ONE;
        indexPos = getCriticalIndex(humanPlayer);
    }

    // determine best piece for strategy
    if (indexPos === -1) {
        indexPos = checkForPattern();
    }

    // randomize position based on difficulty
    switch(gameProperties.cpuDifficulty) {
        case DIFFICULTY.EASY:
            isMoveRandom = difficultyRandomizer > DIFFICULTY_ADJUSTMENT.EASY;
            break;
        case DIFFICULTY.MEDIUM:
            isMoveRandom = difficultyRandomizer > DIFFICULTY_ADJUSTMENT.MEDIUM;
            break;
        case DIFFICULTY.HARD:
            isMoveRandom = difficultyRandomizer > DIFFICULTY_ADJUSTMENT.HARD;
            break;
        default:
            break;
    }

    if (indexPos === -1 || isMoveRandom) {
        let isValidMove = false;
        while (!isValidMove) {
            indexPos = Math.floor(Math.random() * gameProperties.columnSize);
            if (gameProperties.pieces[indexPos].length < gameProperties.rowSize - 1) {
                isValidMove = true;
            }
        }
    }
    return indexPos;
}

export function playCPUTurn() {
    // determine the best move
    let columnIndex = getCPUColumnIndex();
    
    // hover the piece for a second before dropping
    handleHover({x: 0, type: 'cpu'}); 
    handleHover({x: boardPositionLeft + columnIndex * holeWidth + 10, type: 'cpu' });

    setTimeout(() => {
        // play the move at the specified column
        dropPiece();

        // move the hover position to remove floating piece
        handleHover({x: -1, type: 'mousemove'});
    }, 1000);

}