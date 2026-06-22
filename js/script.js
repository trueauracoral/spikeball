import { polyCircle, lineCircle, linePoint, pointCircle, drawPixelText, vec2 } from "./globals.js";

const canvas = document.getElementById('canvas');

export const ctx = canvas.getContext('2d');
let scalingFactor = 4;
canvas.width =160 * scalingFactor;
canvas.height = 144 * scalingFactor;
ctx.scale(scalingFactor, scalingFactor);

let width = canvas.width / scalingFactor
let height = canvas.height / scalingFactor
const halfWidth = width / 2;
const halfHeight = height / 2;

ctx.imageSmoothingEnabled= false

class Ball {
    constructor() {
        this.x = 0.0;
        this.y = 0.0;
        this.vx = 0.0;
        this.vy = 0.0;
        this.ax = 0.0;
        this.ay = 0.0;
        this.angle = 0;
        this.radius = 0.0
        this.id = 0;
        this.hitCooldown = 0;
        this.speed = 5;
    }
}

let player = new Ball()
player.radius = 5
let lastPush = vec2(0,0)
var levels = [
    {
        "level": [
            vec2(141,99),
            vec2(39,99),
            vec2(39,95),
            vec2(141,95),
            vec2(141,43),
            vec2(21,43),
            vec2(21,62),
            vec2(116,60),
            vec2(116,70),
            vec2(20,70),
            vec2(20,119),
            vec2(107,119),
            vec2(110,140),
            vec2(140,140),
        ],
        "start": vec2(124,126),
        "angle": 3*Math.PI/2,
        "finish": [vec2(34,62), vec2(34, 43)]
    },
    {
        "level": [
            vec2(135,134),
            vec2(113,134),
            vec2(109,55),
            vec2(94,55),
            vec2(93,133),
            vec2(60,133),
            vec2(60,133),
            vec2(60,57),
            vec2(60,57),
            vec2(34,57),
            vec2(34,133),
            vec2(6,133),
            vec2(6,109),
            vec2(17,109),
            vec2(17,109),
            vec2(17,30),
            vec2(77,30),
            vec2(77,115),
            vec2(79,115),
            vec2(79,30),
            vec2(135,30),
            
        ],
        "start": vec2(124,126),
        "angle": 3*Math.PI/2,
        "finish": [vec2(11,109), vec2(11, 133)]
    },
]
let level = 0;
function restart() {
    player.x = levels[level].start.x
    player.y = levels[level].start.y
    player.angle = levels[level].angle
    lastPush = vec2(0,0)
}
restart()
let dt;

  const keys = {
    //ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false,
    Space:false,
    ShiftLeft: false,
    ShiftRight: false,
    KeyA: false,
    KeyC: false,
    KeyD: false,
    KeyE: false,
    KeyF: false,
    KeyI: false,
    KeyJ: false,
    KeyL: false,
    KeyW: false,
    KeyS: false,
    KeyQ: false,
    KeyX: false,
    KeyZ: false,
};

window.addEventListener("keydown", (e) => {
    if ((e.code === "ArrowUp" || e.code === "ArrowDown") && !e.repeat) {
        lastPush = vec2(
            Math.cos(player.angle) * player.radius,
            Math.sin(player.angle) * player.radius
        );
    }
    if (keys.hasOwnProperty(e.code)) {
        keys[e.code] = true;
    }
});
window.addEventListener("keyup", (e) => {
    if (keys.hasOwnProperty(e.code)) {
        keys[e.code] = false;
    }
});

function gameUpdate() {
    //console.log(level)
    let currentLevel = levels[level];
    // Turn
    let turnForce = 5
    if (keys.ArrowLeft) {
        player.angle -= turnForce*dt
    }
    if (keys.ArrowRight) {
        player.angle += turnForce * dt
    }
    // push
    // if (keys.ArrowUp) {
    //     //console.log(lastPush)
    //     lastPush = vec2(Math.cos(player.angle)*player.radius, Math.sin(player.angle)*player.radius)
    //     pressedUp = true;
    // }
    
    player.x += player.speed * lastPush.x * dt
    player.y += player.speed * lastPush.y * dt
    // Collide
    let collided = polyCircle(levels[level].level,player.x,player.y,player.radius -2)
    drawPixelText(collided, 0, 0)
    if (collided) {
        let currentLevel = levels[level]
        let startPos = currentLevel.start;
        player.x = startPos.x
        player.y = startPos.y
        let levelangle = currentLevel.angle
        player.angle = levelangle
        lastPush = vec2(0,0)
    }
    let finishedLine = currentLevel.finish
    let finished = lineCircle(finishedLine[0].x,finishedLine[0].y,
                              finishedLine[1].x,finishedLine[1].y,
                              player.x, player.y, player.radius)
    drawPixelText(finished, 0, 10)
    if (finished) {
        level+=1
        restart()
    }

}
function gameDraw() {
    let currentLevel = levels[level];
    ctx.lineWidth = 0.6
    // level polygon
    ctx.save()
    ctx.shadowColor = "#5C5C5C";
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 5;
    ctx.shadowOffsetX = -5;
    ctx.fillStyle = '#f89f44';
    
    ctx.beginPath();
    let points = currentLevel.level
    ctx.moveTo(points[0].x, points[0].y);
    for (var i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x,points[i].y)
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke()
    ctx.restore()

    // player
    ctx.fillStyle = '#ffffff';
    ctx.lineWidth = 0;
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.radius, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.fill()
    ctx.beginPath(); // Start a new path
    ctx.moveTo(player.x, player.y); // Move the pen to (30, 50)
    ctx.lineTo(player.x+Math.cos(player.angle)*player.radius, player.y+Math.sin(player.angle)*player.radius); // Draw a line to (150, 100)
    ctx.closePath()
    // player direction arrow
    let triangleLength = 1.7
    let triangleWidth = 2
    ctx.fillStyle = '#ffffff';
    ctx.lineWidth = 0.3;
    ctx.beginPath();
    let basePoint = vec2(player.x + (player.radius + 1)*Math.cos(player.angle),player.y+ (player.radius + 1) * Math.sin(player.angle))
    ctx.lineTo(basePoint.x + triangleWidth*Math.cos(player.angle + Math.PI/2), basePoint.y+triangleWidth*Math.sin(player.angle + Math.PI/2))
    ctx.lineTo(player.x + triangleLength * (player.radius + 1)*Math.cos(player.angle), player.y+ triangleLength*(player.radius + 1) * Math.sin(player.angle))
    ctx.lineTo(basePoint.x - triangleWidth*Math.cos(player.angle + Math.PI/2), basePoint.y-triangleWidth*Math.sin(player.angle + Math.PI/2))
    ctx.closePath()
    ctx.fill()

    // finish line
    ctx.lineWidth = 1
    ctx.strokeStyle = "white"
    let finishPoints = currentLevel.finish;
    let firstFinish = finishPoints[0]
    let secondFinish = finishPoints[1]
    ctx.beginPath()
    ctx.moveTo(firstFinish.x,firstFinish.y)
    ctx.lineTo(secondFinish.x,secondFinish.y)
    ctx.closePath()
    ctx.stroke()
}
let lastTime = performance.now();
function gameLoop() {
    let now = performance.now();
    dt = (now - lastTime) / 1000;
    //console.log(now-lastTime)
    lastTime = now;
    if (dt > 0.05) {
        dt = 0.05;
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    window.requestAnimationFrame(gameLoop);
    
    gameUpdate();
    gameDraw()
}

gameLoop();

document.addEventListener('pointerdown', e => {
    console.log(getMousePosition(canvas, e));

});

function getMousePosition(canvas, event) {
    let rect = canvas.getBoundingClientRect();
    let x = Math.floor((event.clientX - rect.left) / scalingFactor);
    let y = Math.floor((event.clientY - rect.top) / scalingFactor);
    return {x: x, y: y};
}