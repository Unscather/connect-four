export const PLAYER = Object.freeze({
    ONE: 0,
    TWO: 1
});

export const DIFFICULTY = Object.freeze({
    EASY: 0,
    MEDIUM: 1,
    HARD: 2
});

export const DIFFICULTY_ADJUSTMENT = Object.freeze({
    EASY: 1/3,
    MEDIUM: 2/3,
    HARD: 1
});

export const DIRECTION = Object.freeze({
    LEFT: 0,
    RIGHT: 1,
    UP: 2,
    DOWN: 3,
    NONE: 4
});

export let gameProperties = {
    columnSize: 7,
    rowSize: 6,
    pieces: [],
    winCondition: 4, // number of pieces in a row necessary to win

    currentPlayer: PLAYER.TWO,
    yourPlayerTitle: PLAYER.ONE,
    isGameActive: false,
    currentColumnHover: -1,

    isCPUPlaying: true,
    cpuDifficulty: DIFFICULTY.HARD
}

export const board = document.getElementById('board');
export const boardPositionLeft = 468;
export const boardPositionTop = 25;

export const holeHeight = board.offsetHeight / gameProperties.rowSize;
export const holeWidth = board.offsetWidth / gameProperties.columnSize;

export function updateProperty(propertyName, propertyValue) {
    gameProperties[propertyName] = propertyValue;
}