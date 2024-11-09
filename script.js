// script.js
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const pauseButton = document.getElementById('pauseButton');

const rows = 20;
const columns = 10;
const blockSize = 30;

const moveSound = new Audio("move.mp3");
const rotateSound = new Audio("rotate.mp3");
const clearRowSound = new Audio("clear.mp3");

let board = Array.from({ length: rows }, () => Array(columns).fill(null));
let gameInterval, activePiece, score = 0, isPaused = false;

// Define pieces and colors
const colors = ["#F26DFA", "#FFEE32"];
const pieces = [
    [[1, 1, 1, 1]],           // Line shape
    [[1, 1], [1, 1]],         // Square shape
    [[1, 1, 1], [0, 1, 0]],   // T shape
    [[1, 1, 0], [0, 1, 1]],   // S shape
    [[0, 1, 1], [1, 1, 0]]    // Z shape
];

function drawBlock(x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x * blockSize, y * blockSize, blockSize, blockSize);
    ctx.strokeStyle = '#1A065D';
    ctx.strokeRect(x * blockSize, y * blockSize, blockSize, blockSize);
}

function drawBoard() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < columns; x++) {
            if (board[y][x]) {
                drawBlock(x, y, board[y][x]);
            }
        }
    }
    activePiece.shape.forEach((row, dy) => {
        row.forEach((value, dx) => {
            if (value) {
                drawBlock(activePiece.x + dx, activePiece.y + dy, activePiece.color);
            }
        });
    });
    scoreElement.innerText = `Score: ${score}`;
}

function spawnPiece() {
    const typeId = Math.floor(Math.random() * pieces.length);
    activePiece = {
        x: 3,
        y: 0,
        shape: pieces[typeId],
        color: colors[typeId % colors.length]
    };
    drawBoard();
}

function movePiece(direction) {
    if (isPaused) return;
    moveSound.play();
    if (direction === "left" && canMove(-1, 0)) activePiece.x--;
    else if (direction === "right" && canMove(1, 0)) activePiece.x++;
    else if (direction === "down" && canMove(0, 1)) activePiece.y++;
    drawBoard();
}

function rotatePiece() {
    if (isPaused) return;
    rotateSound.play();
    const shape = activePiece.shape.map((_, i) => activePiece.shape.map(row => row[i]).reverse());
    if (canMove(0, 0, shape)) activePiece.shape = shape;
    drawBoard();
}

function canMove(offsetX, offsetY, shape = activePiece.shape) {
    return shape.every((row, dy) => row.every((value, dx) => {
        const x = activePiece.x + dx + offsetX;
        const y = activePiece.y + dy + offsetY;
        return !value || (y >= 0 && y < rows && x >= 0 && x < columns && !board[y][x]);
    }));
}

function placePiece() {
    activePiece.shape.forEach((row, dy) => row.forEach((value, dx) => {
        if (value) board[activePiece.y + dy][activePiece.x + dx] = activePiece.color;
    }));
    checkRows();
    if (activePiece.y === 0) gameOver();
    else spawnPiece();
}

function checkRows() {
    for (let y = rows - 1; y >= 0; y--) {
        if (board[y].every(cell => cell)) {
            board.splice(y, 1);
            board.unshift(Array(columns).fill(null));
            score += 100;
            clearRowSound.play();
        }
    }
    drawBoard();
}

function gameOver() {
    clearInterval(gameInterval);
    document.getElementById("gameOverScreen").style.display = "flex";
}

function resetGame() {
    document.getElementById("gameOverScreen").style.display = "none";
    board = Array.from({ length: rows }, () => Array(columns).fill(null));
    score = 0;
    spawnPiece();
    gameInterval = setInterval(() => {
        if (!isPaused) {
            if (canMove(0, 1)) activePiece.y++;
            else placePiece();
            drawBoard();
        }
    }, 500);
}

function togglePause() {
    isPaused = !isPaused;
    pauseButton.innerText = isPaused ? "Resume" : "Pause";
}

canvas.addEventListener("touchstart", event => {
    const touchStartX = event.touches[0].clientX;
    const touchStartY = event.touches[0].clientY;

    canvas.addEventListener("touchend", event => {
        const touchEndX = event.changedTouches[0].clientX;
        const touchEndY = event.changedTouches[0].clientY;
        const diffX = touchEndX - touchStartX;
        const diffY = touchEndY - touchStartY;

        if (Math.abs(diffX) > Math.abs(diffY)) {
            if (diffX > 50) movePiece("right");
            else if (diffX < -50) movePiece("left");
        } else {
            if (diffY > 50) movePiece("down");
            else if (diffY < -50) rotatePiece();
        }
    });
});

document.addEventListener("keydown", event => {
    if (event.key === "ArrowLeft") movePiece("left");
    else if (event.key === "ArrowRight") movePiece("right");
    else if (event.key === "ArrowDown") movePiece("down");
    else if (event.key === "ArrowUp") rotatePiece();
    else if (event.key === "p") togglePause();
});

spawnPiece();
resetGame();
