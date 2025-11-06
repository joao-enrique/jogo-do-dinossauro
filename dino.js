// board
let board
let boardWidth = 750
let boardHeight = 250
let context

// dino
let dinoWidth = 70
let dinoHeight = 80
let dinoX = 50
let dinoY = boardHeight - dinoHeight
let dino = { x: dinoX, y: dinoY, width: dinoWidth, height: dinoHeight }

// física
let velocityX = -8
let velocityY = 0
let gravity = 0.4

// estado do jogo
let gameOver = false
let score = 0
let isDucking = false
let lastObstacle = "cactus" // alternar entre cactus e bird

// arrays
let cactusArray = []
let birdArray = []
let clouds = []

// imagens
let dinoRun = []
let dinoDuck = []
let dinoJumpImg, dinoDeadImg, trackImg, gameOverImg, resetImg
let birdImgs = []
let smallCactus = []
let bigCactus = []
let cloudImg
let currentDinoImg
let runFrame = 0
let duckFrame = 0
let birdFrame = 0
let frameCount = 0

window.onload = function () {
    board = document.getElementById("board")
    board.height = boardHeight
    board.width = boardWidth
    context = board.getContext("2d")

    // dino
    dinoRun = [new Image(), new Image()]
    dinoRun[0].src = "./assets/dino-run1.png"
    dinoRun[1].src = "./assets/dino-run2.png"

    dinoDuck = [new Image(), new Image()]
    dinoDuck[0].src = "./assets/dino-duck1.png"
    dinoDuck[1].src = "./assets/dino-duck2.png"

    dinoJumpImg = new Image()
    dinoJumpImg.src = "./assets/dino-jump.png"

    dinoDeadImg = new Image()
    dinoDeadImg.src = "./assets/dino-dead.png"

    currentDinoImg = dinoRun[0]

    // chão e telas
    trackImg = new Image()
    trackImg.src = "./assets/track.png"

    gameOverImg = new Image()
    gameOverImg.src = "./assets/game-over.png"

    resetImg = new Image()
    resetImg.src = "./assets/reset.png"

    // cactos
    smallCactus = [
        "./assets/cactus1.png",
        "./assets/cactus2.png",
        "./assets/cactus3.png"
    ].map(src => {
        let img = new Image()
        img.src = src
        return img
    })

    bigCactus = [
        "./assets/big-cactus1.png",
        "./assets/big-cactus2.png",
        "./assets/big-cactus3.png"
    ].map(src => {
        let img = new Image()
        img.src = src
        return img
    })

    // pássaros
    birdImgs = [
        "./assets/bird1.png",
        "./assets/bird2.png"
    ].map(src => {
        let img = new Image()
        img.src = src
        return img
    })

    // nuvem
    cloudImg = new Image()
    cloudImg.src = "./assets/cloud.png"

    document.addEventListener("keydown", moveDino)
    document.addEventListener("keyup", stopDuck)
    board.addEventListener("click", handleClickReset)

    requestAnimationFrame(update)
    setInterval(spawnObstacle, 1200)
    setInterval(placeCloud, 2000)
}

function update() {
    requestAnimationFrame(update)
    context.clearRect(0, 0, board.width, board.height)

    // chão
    context.drawImage(trackImg, 0, boardHeight - 20, boardWidth, 20)

    // nuvens
    for (let i = 0; i < clouds.length; i++) {
        let cloud = clouds[i]
        cloud.x += velocityX / 4
        context.drawImage(cloudImg, cloud.x, cloud.y, 84, 101)
    }
    clouds = clouds.filter(c => c.x + 60 > 0)

    if (gameOver) {
        context.drawImage(gameOverImg, boardWidth / 2 - 100, 80, 200, 40)
        context.drawImage(resetImg, boardWidth / 2 - 25, 130, 50, 50)
        return
    }

    // física do dino
    velocityY += gravity
    dino.y = Math.min(dino.y + velocityY, dinoY)

    // animação
    frameCount++
    if (dino.y < dinoY) {
        currentDinoImg = dinoJumpImg
    } else if (isDucking) {
        if (frameCount % 10 === 0) duckFrame = (duckFrame + 1) % 2
        currentDinoImg = dinoDuck[duckFrame]
    } else {
        if (frameCount % 10 === 0) runFrame = (runFrame + 1) % 2
        currentDinoImg = dinoRun[runFrame]
    }

    // centralizar duck
    let drawY = isDucking ? dinoY + dinoHeight / 2.2 : dino.y
    let drawHeight = isDucking ? dinoHeight / 1.8 : dino.height
    context.drawImage(currentDinoImg, dino.x, drawY, dino.width, drawHeight)

    // cactos
    for (let i = 0; i < cactusArray.length; i++) {
        let cactus = cactusArray[i]
        cactus.x += velocityX
        context.drawImage(cactus.img, cactus.x, cactus.y, 65, 70)
        if (detectCollision(dino, cactus)) endGame()
    }
    cactusArray = cactusArray.filter(c => c.x + c.width > 0)

    // pássaros
    for (let i = 0; i < birdArray.length; i++) {
    let bird = birdArray[i]
    bird.x += velocityX * 1.2
    if (frameCount % 10 === 0) birdFrame = (birdFrame + 1) % 2
    context.drawImage(birdImgs[birdFrame], bird.x, bird.y, bird.width, bird.height)

    // colisão ajustada
    if (detectCollision(dino, bird)) endGame()
}
birdArray = birdArray.filter(b => b.x + b.width > 0)

    // score
    context.fillStyle = "black"
    context.font = "20px Courier"
    score += 0.1
    context.fillText("Score: " + Math.floor(score), 5, 20)
}

// === Lógica de spawn unificada ===
function spawnObstacle() {
    if (gameOver) return

    // a partir de 80 pontos, chance de aparecer pássaro
    if (score > 80 && Math.random() < 0.4 && lastObstacle !== "bird") {
        placeBird()
        lastObstacle = "bird"
    } else {
        placeCactus()
        lastObstacle = "cactus"
    }
}

function placeCactus() {
    let cactus = { img: null, x: 750, y: boardHeight - 70, width: null, height: 70 }
    let chance = Math.random()
    if (chance > 0.7) {
        let img = bigCactus[Math.floor(Math.random() * bigCactus.length)]
        cactus.img = img
        cactus.width = 40 + Math.random() * 20
    } else {
        let img = smallCactus[Math.floor(Math.random() * smallCactus.length)]
        cactus.img = img
        cactus.width = 30 + Math.random() * 15
    }
    cactusArray.push(cactus)
    if (cactusArray.length > 5) cactusArray.shift()
}

function placeBird() {
    let yPositions = [110, 150, 190]
    let bird = {
        x: 750,
        y: yPositions[Math.floor(Math.random() * yPositions.length)],
        width: 97,   // largura real da imagem
        height: 68   // altura real da imagem
    }
    birdArray.push(bird)
    if (birdArray.length > 3) birdArray.shift()
}

function placeCloud() {
    let cloud = { x: 750, y: Math.random() * 100 + 10 }
    clouds.push(cloud)
    if (clouds.length > 6) clouds.shift()
}

function detectCollision(a, b) {
    let dinoTop = isDucking ? a.y + a.height / 2.2 : a.y
    let dinoHeightAdjusted = isDucking ? a.height / 1.8 : a.height

    return (
        a.x + 10 < b.x + b.width &&
        a.x + a.width - 20 > b.x &&
        dinoTop + 10 < b.y + b.height &&
        dinoTop + dinoHeightAdjusted - 10 > b.y
    )
}

function endGame() {
    gameOver = true
    currentDinoImg = dinoDeadImg
}

function moveDino(e) {
    if (gameOver) return
    if ((e.code === "Space" || e.code === "ArrowUp") && dino.y === dinoY) {
        velocityY = -10
    } else if (e.code === "ArrowDown" && dino.y === dinoY) {
        isDucking = true
    }
}

function stopDuck(e) {
    if (e.code === "ArrowDown") isDucking = false
}

function handleClickReset(e) {
    if (!gameOver) return
    let mouseX = e.offsetX
    let mouseY = e.offsetY
    if (
        mouseX >= boardWidth / 2 - 25 &&
        mouseX <= boardWidth / 2 + 25 &&
        mouseY >= 130 &&
        mouseY <= 180
    ) {
        restartGame()
    }
}

function restartGame() {
    cactusArray = []
    birdArray = []
    clouds = []
    score = 0
    velocityY = 0
    dino.y = dinoY
    gameOver = false
    currentDinoImg = dinoRun[0]
    lastObstacle = "cactus"
}
