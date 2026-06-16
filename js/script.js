function loadImage(src) {
    var img = new Image();
    img.src = src;
    return img;
}
function createAudio(src) {
    var audio = document.createElement('audio');
    audio.volume = 1;
    //audio.loop   = options.loop;
    audio.src = src;
    audio.playbackRate = 4;
    return audio;
}

function drawPixelText(text, x, y, outline, color="black") {
    ctx.imageSmoothingEnabled = false; 
    ctx.textBaseline = 'top';
    ctx.fillStyle = color; 
    
    charLength = text.toString().length;
    if (charLength == 2) {
        x -= 4
    }

    if (outline) {
        ctx.fillStyle = "#ffffff";
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'black';
        ctx.strokeText(text, x, y);
    }

    ctx.fillText(text, x, y);
}

// Source - https://stackoverflow.com/a/43155027
// Posted by Blindman67
// Retrieved 2026-05-31, License - CC BY-SA 3.0
function drawImageCenter(image, x, y, cx, cy, scale, rotation){
    ctx.setTransform(scale, 0, 0, scale, x, y); // sets scale and origin
    ctx.rotate(rotation);
    ctx.drawImage(image, -cx, -cy);
} 

function vec2(x, y) {
    return {x: x, y: y};
}

let mouseCoords = vec2()

let ballImage = loadImage("./images/ball.png")

const canvas = document.getElementById('canvas');

const ctx = canvas.getContext('2d');
let scalingFactor = 4;
canvas.width =125 * scalingFactor;
canvas.height = 100 * scalingFactor;
ctx.scale(scalingFactor, scalingFactor);

let width = canvas.width / scalingFactor
let height = canvas.height / scalingFactor
const halfWidth = width / 2;
const halfHeight = height / 2;

ctx.imageSmoothingEnabled= false

class Ball {
    constructor() {
        this.px = 0.0;
        this.py = 0.0;
        this.vx = 0.0;
        this.vy = 0.0;
        this.ax = 0.0;
        this.ay = 0.0;
        this.radius = 0.0
        this.id = 0;
        this.hitCooldown = 0;
    }
}

let balls = []
let selectedBall;
let collidingBalls = []
let mousemovements = [{x:0,y:0}]
let trampoline = [vec2(45,height-10), vec2(100,height-10)]
let dt;

function AddBall(x, y, r) {
    let b = new Ball()
    b.px = x; b.py = y;
    b.vx = 0; b.vy = 0;
    b.ax = 0; b.ay = 0;
    b.radius = r;
    b.id = balls.length

    balls.push(b)
}
let defaultRadius = 5;
AddBall(width * 0.25, height * 0.5, defaultRadius )
//AddBall(width * 0.26, height * 0.5, defaultRadius )
//AddBall(width * 0.26, height * 0.5, defaultRadius )

function doCirclesOverlap(x1,y1,r1,x2,y2,r2) {
    let distX = x1 - x2;
    let distY = y1 - y2;
    let distance = Math.sqrt( (distX*distX) + (distY*distY) );
  
    // if the distance is less than the sum of the circle's
    // radii, the circles are touching!
    if (distance <= r1+r2) {
      return true;
    }
    return false;
}

//https://www.jeffreythompson.org/collision-detection/line-circle.php
function lineCircle(x1, y1, x2, y2, cx, cy, r) {
    // is either end INSIDE the circle?
    // if so, return true immediately
    const inside1 = pointCircle(x1, y1, cx, cy, r);
    const inside2 = pointCircle(x2, y2, cx, cy, r);
    if (inside1 || inside2) return true;
  
    const distX = x1 - x2;
    const distY = y1 - y2;
    const len = Math.sqrt((distX * distX) + (distY * distY));
  
    const dot = (((cx - x1) * (x2 - x1)) + ((cy - y1) * (y2 - y1))) / Math.pow(len, 2);
  
    const closestX = x1 + (dot * (x2 - x1));
    const closestY = y1 + (dot * (y2 - y1));
  
    const onSegment = linePoint(x1, y1, x2, y2, closestX, closestY);
    if (!onSegment) return false;
  
    const distX2 = closestX - cx;
    const distY2 = closestY - cy;
    const distance = Math.sqrt((distX2 * distX2) + (distY2 * distY2));
  
    if (distance <= r) {
      return true;
    }
    return false;
  }
function dist(x1, y1, x2, y2) {
    return Math.hypot(x2 - x1, y2 - y1);
  }
  
  function linePoint(x1, y1, x2, y2, px, py) {
    const d1 = dist(px, py, x1, y1);
    const d2 = dist(px, py, x2, y2);
    const lineLen = dist(x1, y1, x2, y2);
    const buffer = 0.1;
  
    return d1 + d2 >= lineLen - buffer && d1 + d2 <= lineLen + buffer;
  }

function pointCircle(px, py, cx, cy, r) {

    // get distance between the point and circle's center
    // using the Pythagorean Theorem
    let distX = px - cx;
    let distY = py - cy;
    let distance = Math.sqrt( (distX*distX) + (distY*distY) );
  
    // if the distance is less than the circle's
    // radius the point is inside!
    if (distance <= r) {
      return true;
    }
    return false;
  }

let gravity = 50
function gameUpdate() {
    collidingBalls = [];
    for (let i = 0; i < balls.length; i++) {
        let ball = balls[i]
        for (let j = 0; j < balls.length; j++) {
            let target = balls[j]
            if (ball.id != target.id) {
                if (doCirclesOverlap(ball.px, ball.py, ball.radius, target.px, target.py, target.radius)) {
                    collidingBalls.push([ball, target])

                    let fDistance = Math.sqrt((ball.px - target.px) * (ball.px - target.px) + (ball.py - target.py) * (ball.py - target.py))
    
                    let fOverlap = 0.5 * (fDistance - ball.radius - target.radius)
    
                    ball.px -= fOverlap * (ball.px - target.px) / fDistance
                    ball.py -= fOverlap * (ball.py - target.py) / fDistance;
    
                    target.px += fOverlap * (ball.px - target.px) / fDistance
                    target.py += fOverlap * (ball.py - target.py) / fDistance;
                }
            }
        }
    }

    for (let i = 0; i < balls.length; i++) {
        let ball = balls[i]
        if (ball.hitCooldown > 0) {
            ball.hitCooldown -= dt;
        }
        ball.ax = -ball.vx * 0.5;
        ball.ay = -ball.vy * 0.8;

        ball.ay += gravity;

        ball.vx += ball.ax * dt;
        ball.vy += ball.ay * dt;

        ball.px += ball.vx * dt;
        ball.py += ball.vy * dt;
        // Slow to a stop
        if ((ball.vx * ball.vx + ball.vy * ball.vy) < 0.01) {
            ball.vx = 0;
            ball.vy = 0;
        }
        // Ground
        if (ball.py > height - ball.radius) {
            ball.py = height - ball.radius;
            ball.vy *= -0.9
        }
        // Sides left
        if (ball.px-ball.radius < 0) {
            ball.px = ball.radius;
            ball.vx *= -0.9
        }
        // sides right
        if (ball.px+ball.radius > width) {
            ball.px = width-ball.radius;
            ball.vx *= -0.9
        }
        // Top/sky
        if (ball.py < ball.radius) {
            ball.py = ball.radius;
            ball.vy *= -0.9
        }
        
    }
    // Lines for Collision
    for ( c of collidingBalls) {
        ctx.beginPath(); // Start a new path
        ctx.moveTo(c[0].px, c[0].py); // Move the pen to (30, 50)
        ctx.lineTo(c[1].px, c[1].py); // Draw a line to (150, 100)
        ctx.stroke(); // Render the path
    }
    //console.log(mousemovements)

    // Mouse velocity
    ctx.beginPath(); // Start a new path
    ctx.moveTo(mouseCoords.x, mouseCoords.y);
    let first = mousemovements[0];
    let last = mousemovements[mousemovements.length - 1];
    
    let dx = last.x - first.x;
    let dy = last.y - first.y;
    
    let length = Math.sqrt(dx * dx + dy * dy);
    
    let nx = dx / length;
    let ny = dy / length;
    
    ctx.beginPath();
    ctx.moveTo(mouseCoords.x, mouseCoords.y);
    ctx.lineTo(
        mouseCoords.x + nx * length,
        mouseCoords.y + ny * length
    );
    ctx.stroke();

    for (let i = 0; i < balls.length; i++) {
        let ball = balls[i];
        //console.log(ball.hitCoolDown)
        if (
            ball.hitCooldown <= 0 &&
            pointCircle(mouseCoords.x, mouseCoords.y,
                        ball.px, ball.py,
                        ball.radius)
        ) {
            // mouse hit ball
            ball.vx = 5 * nx * length;
            ball.vy = 5 * ny * length;
    
            ball.hitCooldown = 0.25;
        }
        if (lineCircle(trampoline[0].x,trampoline[0].y,trampoline[1].x,trampoline[1].y,ball.px, ball.py, ball.radius)) {
            console.log("hello")
            ball.vy = -Math.abs(ball.vy) * 1.6;
            ball.vx = ball.vx * 1.2
        }
    }

}
function gameDraw() {
    for (let i = 0; i < balls.length; i++) {
        let ball = balls[i]
        ctx.beginPath();
        ctx.arc(ball.px, ball.py, ball.radius, 0, 2 * Math.PI);
        ctx.stroke();

        // drawImageCenter(
        //     ballImage,
        //     ball.px,
        //     ball.py,
        //     ballImage.width / 2,
        //     ballImage.height  / 2,
        //     ball.radius / 5,
        //     0
        // );

        // Trampoline 6/14/26
        ctx.beginPath();
        ctx.moveTo(trampoline[0].x, trampoline[0].y);
        ctx.lineTo(trampoline[1].x,trampoline[1].y);
        ctx.stroke();
    }
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
    mouseCoords = getMousePosition(canvas, e);

    for (let ball of balls) {
        if (pointCircle(mouseCoords.x, mouseCoords.y,
                        ball.px, ball.py,
                        ball.radius)) {
            selectedBall = ball;
            break;
        }
    }
});

let maxpoints = 20;
document.addEventListener('pointermove', e => {
    mouseCoords = getMousePosition(canvas, e);
    //console.log(mouseCoords);
    if (mousemovements.length < maxpoints) {
        mousemovements.push(mouseCoords)
    } else {
        mousemovements.shift()
    }
    if (selectedBall) {
        selectedBall.px = mouseCoords.x;
        selectedBall.py = mouseCoords.y;
    }
});

document.addEventListener('pointerup', e => {
    selectedBall = null;
});
function getMousePosition(canvas, event) {
    let rect = canvas.getBoundingClientRect();
    let x = Math.floor((event.clientX - rect.left) / scalingFactor);
    let y = Math.floor((event.clientY - rect.top) / scalingFactor);
    return {x: x, y: y};
}