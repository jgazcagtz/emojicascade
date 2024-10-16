// Game Variables
const ROWS = 12;
const COLS = 7;
const gridElement = document.getElementById('grid');
const startScreen = document.getElementById('start-screen');
const tutorialScreen = document.getElementById('tutorial-screen');
const gameOverScreen = document.getElementById('gameover-screen');
const startButton = document.getElementById('start-button');
const tutorialButton = document.getElementById('tutorial-button');
const backButton = document.getElementById('back-button');
const restartButton = document.getElementById('restart-button');
const gameContainer = document.getElementById('game-container');
const scoreElement = document.getElementById('score');
const levelElement = document.getElementById('level');
const finalScoreElement = document.getElementById('final-score');
const leftBtn = document.getElementById('left-btn');
const rightBtn = document.getElementById('right-btn');
const downBtn = document.getElementById('down-btn');

let grid = [];
let currentEmoji = null;
let currentPosition = { row: 0, col: Math.floor(COLS / 2) };
let score = 0;
let level = 1;
let gameInterval = null;
let fallSpeed = 500; // milliseconds
let isGameOver = false;
let isEmojiLocked = false;

// Emojis Array
const emojis = ['👽', '🍎', '🍌', '🍇', '🍉', '😂', '😍', '🐱', '🐶', '🍒', '🌟', '👾'];

// Audio Elements
const dropSound = new Audio('drop.mp3');
const winSound = new Audio('win.mp3');
const backgroundMusic = new Audio('background.mp3');
backgroundMusic.loop = true;

// Initialize Grid
function initializeGrid() {
    grid = [];
    gridElement.innerHTML = '';
    for (let r = 0; r < ROWS; r++) {
        const row = [];
        for (let c = 0; c < COLS; c++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.dataset.row = r;
            cell.dataset.col = c;
            gridElement.appendChild(cell); // Append cell directly to grid
            row.push(null);
        }
        grid.push(row);
    }
}

// Start Game
function startGame() {
    startScreen.classList.remove('active');
    tutorialScreen.classList.remove('active');
    gameOverScreen.classList.remove('active');
    gameContainer.style.display = 'flex';
    initializeGrid();
    score = 0;
    level = 1;
    fallSpeed = 500;
    updateScore();
    updateLevel();
    spawnNewEmoji();
    backgroundMusic.currentTime = 0;
    backgroundMusic.play();
    isGameOver = false;
    clearInterval(gameInterval);
    gameInterval = setInterval(gameLoop, fallSpeed);
}

// Game Loop
function gameLoop() {
    if (!isEmojiLocked) {
        moveDown();
    }
}

// Spawn New Emoji
function spawnNewEmoji() {
    currentEmoji = emojis[Math.floor(Math.random() * emojis.length)];
    currentPosition = { row: 0, col: Math.floor(COLS / 2) };
    if (grid[currentPosition.row][currentPosition.col] !== null) {
        endGame();
        return;
    }
    placeEmoji(currentPosition.row, currentPosition.col, currentEmoji, true);
    isEmojiLocked = false;
}

// Place Emoji in Grid
function placeEmoji(row, col, emoji, isCurrent = false) {
    grid[row][col] = emoji;
    const cell = document.querySelector(`.cell[data-row='${row}'][data-col='${col}']`);
    if (cell) {
        cell.textContent = emoji;
        if (isCurrent) {
            cell.classList.add('current');
        } else {
            cell.classList.remove('current');
        }
    }
}

// Remove Emoji from Grid
function removeEmoji(row, col) {
    if (grid[row][col] !== null) {
        grid[row][col] = null;
        const cell = document.querySelector(`.cell[data-row='${row}'][data-col='${col}']`);
        if (cell) {
            cell.textContent = '';
            cell.classList.remove('current');
        }
    }
}

// Move Down
function moveDown() {
    const { row, col } = currentPosition;
    if (canMove(row + 1, col)) {
        removeEmoji(row, col);
        currentPosition.row += 1;
        placeEmoji(currentPosition.row, col, currentEmoji, true);
    } else {
        lockEmoji();
    }
}

// Lock Emoji
function lockEmoji() {
    const { row, col } = currentPosition;
    placeEmoji(row, col, currentEmoji, false);
    isEmojiLocked = true;
    dropSound.play();
    checkForWins();
    setTimeout(() => {
        if (!isGameOver) {
            spawnNewEmoji();
        }
    }, 500);
}

// Move Left
function moveLeft() {
    if (isEmojiLocked) return;
    const { row, col } = currentPosition;
    if (canMove(row, col - 1)) {
        removeEmoji(row, col);
        currentPosition.col -= 1;
        placeEmoji(row, currentPosition.col, currentEmoji, true);
    }
}

// Move Right
function moveRight() {
    if (isEmojiLocked) return;
    const { row, col } = currentPosition;
    if (canMove(row, col + 1)) {
        removeEmoji(row, col);
        currentPosition.col += 1;
        placeEmoji(row, currentPosition.col, currentEmoji, true);
    }
}

// Can Move
function canMove(row, col) {
    return row >= 0 && row < ROWS && col >= 0 && col < COLS && grid[row][col] === null;
}

// Check for Wins (Match Detection)
function checkForWins() {
    const matches = findAllMatches();
    if (matches.length > 0) {
        winSound.play();
        clearMatches(matches);
        collapseGrid();
        updateScore();
    }
}

// Find All Matches in the Grid
function findAllMatches() {
    const matches = new Set();

    // Helper to add matched cells to the set
    const addMatch = (cells) => {
        cells.forEach(cell => matches.add(cell));
    };

    // Check Horizontal Matches
    for (let r = 0; r < ROWS; r++) {
        let count = 1;
        for (let c = 1; c < COLS; c++) {
            if (grid[r][c] === grid[r][c - 1] && grid[r][c] !== null) {
                count++;
            } else {
                if (count >= 4) { // Changed from 3 to 4
                    for (let k = c - count; k < c; k++) {
                        addMatch([`${r},${k}`]);
                    }
                }
                count = 1;
            }
        }
        if (count >= 4) { // Changed from 3 to 4
            for (let k = COLS - count; k < COLS; k++) {
                addMatch([`${r},${k}`]);
            }
        }
    }

    // Check Vertical Matches
    for (let c = 0; c < COLS; c++) {
        let count = 1;
        for (let r = 1; r < ROWS; r++) {
            if (grid[r][c] === grid[r - 1][c] && grid[r][c] !== null) {
                count++;
            } else {
                if (count >= 4) { // Changed from 3 to 4
                    for (let k = r - count; k < r; k++) {
                        addMatch([`${k},${c}`]);
                    }
                }
                count = 1;
            }
        }
        if (count >= 4) { // Changed from 3 to 4
            for (let k = ROWS - count; k < ROWS; k++) {
                addMatch([`${k},${c}`]);
            }
        }
    }

    // Check Diagonal (Top-Left to Bottom-Right) Matches
    for (let r = 0; r < ROWS - 3; r++) { // Adjusted to ROWS - 3 for 4 in a row
        for (let c = 0; c < COLS - 3; c++) { // Adjusted to COLS - 3 for 4 in a row
            const emoji = grid[r][c];
            if (
                emoji &&
                grid[r + 1][c + 1] === emoji &&
                grid[r + 2][c + 2] === emoji &&
                grid[r + 3][c + 3] === emoji
            ) {
                addMatch([
                    `${r},${c}`,
                    `${r + 1},${c + 1}`,
                    `${r + 2},${c + 2}`,
                    `${r + 3},${c + 3}`
                ]);
            }
        }
    }

    // Check Diagonal (Bottom-Left to Top-Right) Matches
    for (let r = 3; r < ROWS; r++) { // Start from row 3 for 4 in a row
        for (let c = 0; c < COLS - 3; c++) { // Adjusted to COLS - 3 for 4 in a row
            const emoji = grid[r][c];
            if (
                emoji &&
                grid[r - 1][c + 1] === emoji &&
                grid[r - 2][c + 2] === emoji &&
                grid[r - 3][c + 3] === emoji
            ) {
                addMatch([
                    `${r},${c}`,
                    `${r - 1},${c + 1}`,
                    `${r - 2},${c + 2}`,
                    `${r - 3},${c + 3}`
                ]);
            }
        }
    }

    return Array.from(matches).map(coord => {
        const [r, c] = coord.split(',').map(Number);
        return { row: r, col: c };
    });
}

// Clear Matched Emojis
function clearMatches(matches) {
    matches.forEach(({ row, col }) => {
        removeEmoji(row, col);
    });
    score += matches.length * 15; // Increased points per emoji for longer matches
}

// Collapse Grid After Clearing Matches
function collapseGrid() {
    for (let c = 0; c < COLS; c++) {
        let emptyRows = [];
        for (let r = ROWS - 1; r >= 0; r--) {
            if (grid[r][c] === null) {
                emptyRows.push(r);
            } else if (emptyRows.length > 0) {
                const emptyRow = emptyRows.shift();
                grid[emptyRow][c] = grid[r][c];
                grid[r][c] = null;

                // Update DOM
                const fromCell = document.querySelector(`.cell[data-row='${r}'][data-col='${c}']`);
                const toCell = document.querySelector(`.cell[data-row='${emptyRow}'][data-col='${c}']`);
                if (fromCell && toCell) {
                    toCell.textContent = fromCell.textContent;
                    fromCell.textContent = '';
                }

                emptyRows.push(r);
            }
        }
    }

    // After collapsing, check for new matches recursively
    const newMatches = findAllMatches();
    if (newMatches.length > 0) {
        setTimeout(() => {
            clearMatches(newMatches);
            collapseGrid();
            updateScore();
        }, 300);
    }
}

// Update Score Display
function updateScore() {
    scoreElement.textContent = score;
    const newLevel = Math.floor(score / 800) + 1; // Adjusted score threshold for leveling
    if (newLevel > level) {
        level = newLevel;
        updateLevel();
    }
}

// Update Level and Difficulty
function updateLevel() {
    levelElement.textContent = level;
    fallSpeed = Math.max(200, 500 - (level - 1) * 50);
    clearInterval(gameInterval);
    gameInterval = setInterval(gameLoop, fallSpeed);
}

// End Game
function endGame() {
    isGameOver = true;
    clearInterval(gameInterval);
    backgroundMusic.pause();
    finalScoreElement.textContent = score;
    gameContainer.style.display = 'none';
    gameOverScreen.classList.add('active');
}

// Add Event Listeners
startButton.addEventListener('click', startGame);
tutorialButton.addEventListener('click', () => {
    startScreen.classList.remove('active');
    tutorialScreen.classList.add('active');
});
backButton.addEventListener('click', () => {
    tutorialScreen.classList.remove('active');
    startScreen.classList.add('active');
});
restartButton.addEventListener('click', startGame);
document.addEventListener('keydown', (e) => {
    if (isGameOver) return;
    if (e.key === 'ArrowLeft') moveLeft();
    else if (e.key === 'ArrowRight') moveRight();
    else if (e.key === 'ArrowDown') moveDown();
});

// Touch and Click Controls for Mobile
addControlEvent(leftBtn, 'left');
addControlEvent(rightBtn, 'right');
addControlEvent(downBtn, 'down');

function addControlEvent(button, action) {
    button.addEventListener('touchstart', (e) => {
        e.preventDefault();
        handleControl(action);
    }, { passive: false });

    button.addEventListener('click', (e) => {
        e.preventDefault();
        handleControl(action);
    });
}

function handleControl(action) {
    if (isGameOver) return;
    if (action === 'left') moveLeft();
    if (action === 'right') moveRight();
    if (action === 'down') moveDown();
}

// Initialize on Load
window.onload = initializeGrid;
