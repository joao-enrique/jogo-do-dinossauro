// board
let board
let boardWidth = 750
let boardHeight = 250
let context 

// dino
let dinoWidth = 88
let dinoHeight = 94
let dinoX = 50
let dinoY = boardHeight - dinoHeight

let dino = {
    x: dinoX,
    y: dinoY,
    width: dinoWidth,
    height: dinoHeight
}

window.onload = function () {
    board = document.getElementById("board")
    board.height = boardHeight
    board.width = boardWidth

    context = board.getContext("2d") // used drawing on the board

    // draw initial dinosaur
    // context.fillStyle="green"
    // context.fillRect(dino.x, dino.y, dino.width, dino.height)

    dinoImg = new Image()
    dinoImg.src = "./assets/dino.png"
    dinoImg.onload = function() {
        context.drawImage(dinoImg, dino.x, dino.y, dino.width, dino.height)
    }

    requestAnimationFrame(update)
}

function update(){
    requestAnimationFrame(update)

    context.drawImage(dinoImg, dino.x, dino.y, dino.width, dino.height)
}