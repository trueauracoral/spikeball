import {ctx} from "./script.js"

export function loadImage(src) {
    var img = new Image();
    img.src = src;
    return img;
}
// POLYGON/CIRCLE
export function polyCircle(vertices, cx, cy, r) {

    // go through each of the vertices, plus
    // the next vertex in the list
    let next = 0;
    for (let current=0; current<vertices.length; current++) {
  
      // get next vertex in list
      // if we've hit the end, wrap around to 0
      next = current+1;
      if (next == vertices.length) next = 0;
  
      // get the PVectors at our current position
      // this makes our if statement a little cleaner
      let vc = vertices[current];    // c for "current"
      let vn = vertices[next];       // n for "next"
  
      // check for collision between the circle and
      // a line formed between the two vertices
      let collision = lineCircle(vc.x,vc.y, vn.x,vn.y, cx,cy,r);
      if (collision) return true;
    }
  
    // the above algorithm only checks if the circle
    // is touching the edges of the polygon – in most
    // cases this is enough, but you can un-comment the
    // following code to also test if the center of the
    // circle is inside the polygon
  
    // boolean centerInside = polygonPoint(vertices, cx,cy);
    // if (centerInside) return true;
  
    // otherwise, after all that, return false
    return false;
  }

  
export function createAudio(src) {
    var audio = document.createElement('audio');
    audio.volume = 1;
    //audio.loop   = options.loop;
    audio.src = src;
    audio.playbackRate = 4;
    return audio;
}

export function drawPixelText(text, x, y, outline, color="black") {
    ctx.imageSmoothingEnabled = false; 
    ctx.textBaseline = 'top';
    ctx.fillStyle = color; 
    
    let charLength = text.toString().length;
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

export function vec2(x, y) {
    return {x: x, y: y};
}

export function doCirclesOverlap(x1,y1,r1,x2,y2,r2) {
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
export function lineCircle(x1, y1, x2, y2, cx, cy, r) {
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
export function dist(x1, y1, x2, y2) {
    return Math.hypot(x2 - x1, y2 - y1);
  }
  
export function linePoint(x1, y1, x2, y2, px, py) {
  const d1 = dist(px, py, x1, y1);
  const d2 = dist(px, py, x2, y2);
  const lineLen = dist(x1, y1, x2, y2);
  const buffer = 0.1;

  return d1 + d2 >= lineLen - buffer && d1 + d2 <= lineLen + buffer;
}

export function pointCircle(px, py, cx, cy, r) {

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