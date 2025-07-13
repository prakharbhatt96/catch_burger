const config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    backgroundColor: '#000',
    physics: {
        default: 'arcade',
        arcade: { debug: false }
    },
    scene: { preload, create, update },
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    }
};

let basket, cursors, foodGroup, score = 0;
let scoreText, timerText, timerEvent, foodTimer;
const FOOD_SPEED = 200;
const GAME_TIME = 60;

const game = new Phaser.Game(config);

function preload() {
    this.load.image('food', './assets/food.png');
    this.load.image('board', './assets/board1.png');
    this.load.image('basket', './assets/basket.png');
}

function create() {
    const { width, height } = this.scale;
    const board = this.add.image(width / 2, height / 2, 'board').setOrigin(0.5);
    const boardRatio = board.width / board.height;
    const gameRatio = width / height;
    if (boardRatio > gameRatio) {
        board.setDisplaySize(height * boardRatio, height);
    } else {
        board.setDisplaySize(width, width / boardRatio);
    }
    basket = this.physics.add.sprite(width / 2, height * 0.95, 'basket')
        .setOrigin(0.5)
        .setCollideWorldBounds(true)
        .setScale(0.2);
    foodGroup = this.physics.add.group();
    cursors = this.input.keyboard.createCursorKeys();
    this.physics.add.overlap(basket, foodGroup, catchFood, null, this);
    scoreText = this.add.text(10, 10, 'Score: 0', { font: "bold 22px Arial", fill: '#fff' });
    timerText = this.add.text(width / 2, 50, 'Time: 01:00', { font: 'bold 32px Arial', fill: '#fff' }).setOrigin(0.5);
    timerEvent = this.time.addEvent({ delay: GAME_TIME * 1000, callback: gameOver, callbackScope: this });
    this.time.addEvent({ delay: 1000, callback: updateTimer, callbackScope: this, loop: true });
    foodTimer = this.time.addEvent({ delay: 1000, callback: spawnFood, callbackScope: this, loop: true });
}

function update() {
    if (cursors.left.isDown) {
        basket.setVelocityX(-300);
    } else if (cursors.right.isDown) {
        basket.setVelocityX(300);
    } else {
        basket.setVelocityX(0);
    }
    foodGroup.children.each(food => {
        if (food.y > this.scale.height + 50) {
            food.destroy();
        }
    });
}

function spawnFood() {
    const x = Phaser.Math.Between(50, this.scale.width - 50);
    const food = foodGroup.create(x, -10, 'food');
    food.setVelocityY(FOOD_SPEED);
    food.setScale(0.1);
}

function catchFood(basket, food) {
    score++;
    scoreText.setText(`Score: ${score}`);
    food.destroy();
    if (score >= 10) {
        showWinText.call(this);
    }
}

function updateTimer() {
    const remaining = Math.ceil(timerEvent.getRemainingSeconds());
    const minutes = String(Math.floor(remaining / 60)).padStart(2, '0');
    const seconds = String(remaining % 60).padStart(2, '0');
    timerText.setText(`Time: ${minutes}:${seconds}`);
}

function gameOver() {
    this.physics.pause();
    foodTimer.remove();
    this.add.text(this.scale.width / 2, this.scale.height / 2, 'Time’s up!', {
        font: 'bold 48px Arial', fill: '#ff0000'
    }).setOrigin(0.5);
    showRestartButton.call(this);
}

function showWinText() {
    this.physics.pause();
    foodTimer.remove();
    this.add.text(this.scale.width / 2, this.scale.height / 2, 'You Win!', {
        font: 'bold 48px Arial', fill: '#00ff00'
    }).setOrigin(0.5);
    showRestartButton.call(this);
}

function showRestartButton() {
    const restartText = this.add.text(this.scale.width / 2, this.scale.height * 0.6, 'RESTART GAME', {
        font: 'bold 32px Arial', fill: '#fff', backgroundColor: '#000'
    }).setOrigin(0.5).setInteractive();
    restartText.on('pointerdown', () => {
        score = 0;
        this.scene.restart();
    });
}

window.addEventListener('resize', () => {
    game.scale.resize(window.innerWidth, window.innerHeight);
});
