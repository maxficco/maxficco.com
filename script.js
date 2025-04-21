console.log("moo")
const canvas = document.getElementById("background");
const ctx = canvas.getContext("2d");

class circle {
    constructor(radius, link) {
        this.radius = radius;
        this.link = link;
        this.x = 0;
        this.y = 0;
        this.fill = "none";
        this.color = "red";
        this.angle = 0;
    }
    update() {
        let dx = this.link.x - this.x;
        let dy = this.link.y - this.y;
        this.angle = Math.atan2(dy, dx);

        let angleDiff = this.angle - this.link.angle;
        while (angleDiff > Math.PI) angleDiff -= 2*Math.PI
        while (angleDiff < -Math.PI) angleDiff += 2*Math.PI 

        let maxAngleDiff = Math.PI / 4; 

        if (Math.abs(angleDiff) > maxAngleDiff) {
            // Constrain the angle
            let constrainedAngleDiff = angleDiff > 0 ? maxAngleDiff : -maxAngleDiff;
            this.angle = this.link.angle + constrainedAngleDiff;
        }

        let targetDist = 50;
        this.x = this.link.x - Math.cos(this.angle) * targetDist;
        this.y = this.link.y - Math.sin(this.angle) * targetDist;
    }
    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        ctx.fillStyle = this.fill;
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = this.color;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, this.angle);
        ctx.lineWidth = 2;
        ctx.strokeStyle = "blue";
        ctx.stroke();

        ctx.fillStyle = "white";
        ctx.fillRect(this.x + this.radius*Math.cos(this.angle+Math.PI/2),this.y + this.radius*Math.sin(this.angle+Math.PI/2),2,2);
        ctx.fillRect(this.x + this.radius*Math.cos(this.angle-Math.PI/2),this.y + this.radius*Math.sin(this.angle-Math.PI/2),1,2);
        ctx.fillStyle = "none";

    }
    draw_eyes() {
        ctx.lineWidth = 2;
        ctx.strokeStyle = this.color;
        ctx.fillStyle = this.fill;
        ctx.beginPath();
        ctx.ellipse(this.x+this.radius*Math.cos(this.angle+Math.PI/6), this.y+this.radius*Math.sin(this.angle+Math.PI/6), 5, 2, this.angle-Math.PI/6, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(this.x+this.radius*Math.cos(this.angle-Math.PI/6), this.y+this.radius*Math.sin(this.angle-Math.PI/6), 5, 2, this.angle+Math.PI/6, 0, 2*Math.PI);
        ctx.stroke();
        ctx.fill();
    }
}

class chain{
    constructor(radiusList) {
        this.radii = radiusList;
        this.head = new circle(radiusList[0], null);
        this.mouseposx = window.innerWidth*0.9;
        this.mouseposy = window.innerHeight*0.9;
        this.head.x = this.mouseposx + this.head.radius;
        this.head.y = this.mouseposy;
        this.circles = [];
        this.t = 0;
        this.circles.push(this.head);
        for (let i = 1; i < radiusList.length; i++) {
            this.circles.push(new circle(radiusList[i], this.circles[i-1]));
        }
        this.speed = 500;
    }
    update(dt) {
        let dx = this.mouseposx - this.head.x;
        let dy = this.mouseposy - this.head.y;

        let targetAngle = Math.atan2(dy, dx);
        //let targetDist = 100;

        let distToMouse = Math.sqrt(dx*dx + dy*dy);

        let angleDiff = targetAngle - this.head.angle;

        // Normalize angle difference to [-PI, PI]
        while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
        while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;

        // Gradually adjust angle
        //let longestDist = Math.sqrt(canvas.width**2 + canvas.height**2);
        const longestDist = 1740.95; // this is from the dimensions of my browser on my mac, less tight turning looks better even on smaller screens
        let rotationSpeed = (distToMouse/longestDist)**2;
        if (this.speed > 50) {
            this.head.angle += angleDiff * Math.min(1.0, rotationSpeed * 100 * dt);
        }

        if (this.mouseisstopped) this.speed = Math.max(0, this.speed-50*dt);
        else {
            this.speed = 500;
            this.mouseisstopped = true;
        }

        this.head.x += Math.cos(this.head.angle) * this.speed * dt;
        this.head.y += Math.sin(this.head.angle) * this.speed * dt;

        for (let i = 1; i < this.circles.length; i++) {
            this.circles[i].update();
        }

        this.t += dt;
    }

    draw() {
        for (let i = 0; i < this.circles.length; i++) {
            this.circles[i].draw();
        }
    }

    draw_outline() {
        this.circles[1].draw_eyes();
        // Get points on both sides of the spine (left and right sides of the circles)
        let leftPoints = [];
        let rightPoints = [];

        for (let i = 0; i < this.circles.length; i++) {
            const circle = this.circles[i];

            // Calculate perpendicular angles to the movement direction
            const leftAngle = circle.angle + Math.PI/2;
            const rightAngle = circle.angle - Math.PI/2;

            if (i == 0) {
                leftPoints.push({
                    x: circle.x + circle.radius * Math.cos(circle.angle+0.3),
                    y: circle.y + circle.radius * Math.sin(circle.angle+0.3)
                });
                rightPoints.push({
                    x: circle.x + circle.radius * Math.cos(circle.angle-0.3),
                    y: circle.y + circle.radius * Math.sin(circle.angle-0.3)
                });
            }
            for (let i = 0; i<=Math.PI/6; i += Math.PI/12) {
                // Add points on both sides of each circle
                leftPoints.push({
                    x: circle.x + circle.radius * Math.cos(leftAngle-i),
                    y: circle.y + circle.radius * Math.sin(leftAngle-i)
                });

                rightPoints.push({
                    x: circle.x + circle.radius * Math.cos(rightAngle+i),
                    y: circle.y + circle.radius * Math.sin(rightAngle+i)
                });
            }
        }

        // Draw the outline by connecting all points
        ctx.beginPath();

        // Start at the first left point
        ctx.moveTo(leftPoints[0].x, leftPoints[0].y);

        // Draw along the left side
        for (let i = 1; i < leftPoints.length; i++) {
            ctx.lineTo(leftPoints[i].x, leftPoints[i].y);
        }

        // Go to the last right point and draw back along the right side
        ctx.lineTo(rightPoints[rightPoints.length - 1].x, rightPoints[rightPoints.length - 1].y);

        // Draw back along the right side in reverse order
        for (let i = rightPoints.length - 2; i >= 0; i--) {
            ctx.lineTo(rightPoints[i].x, rightPoints[i].y);
        }

        // Close the path back to start
        ctx.closePath();

        // Style and draw the outline
        ctx.fillStyle = "rgba(200, 100, 100, 0.3)"; // Semi-transparent red
        ctx.fill();
        ctx.strokeStyle = "rgba(200, 0, 0, 0.8)"; // More solid red outline
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // draw fins
        ctx.beginPath();
        ctx.moveTo(this.circles[2].x, this.circles[2].y);
        for (let i = 2; i <= this.circles.length-3; i++) {
            let c = this.circles[i];
            ctx.lineTo(c.x+c.radius/2*Math.cos(c.angle-Math.PI), c.y+c.radius/2*Math.sin(c.angle-Math.PI))
        }
        for (let i = this.circles.length-3; i >= 2; i--) {
            let c = this.circles[i];
            ctx.lineTo(c.x, c.y)
        }
        ctx.closePath();
        ctx.fillStyle = "rgba(200, 100, 100, 0.9)"; // Semi-transparent red
        ctx.fill();
        ctx.stroke();
    }

    updateMouse(e) {
        this.mouseposx = e.clientX;
        this.mouseposy = e.clientY;
        this.mouseisstopped = false;
    }

}

let radii = [30, 50, 60, 45, 30, 10, 30];
let fish = new chain(radii);
let body = 0;

// Animation loop
let lastTime = performance.now();
function animate(currentTime) {
    const deltaTime = (currentTime - lastTime) / 1000; // in seconds
    lastTime = currentTime;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    fish.update(deltaTime);
    if (body) fish.draw();
    fish.draw_outline();

    requestAnimationFrame(animate);
}

document.addEventListener('mousemove', (e) => fish.updateMouse(e));
document.addEventListener('keydown', function(event) {
    const key = event.key; // The key that was pressed
    if (key === 'a') {
        body = 1;
    }
    if (key === 'z') {
        body = 0;
    }
});

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

document.addEventListener("DOMContentLoaded", function() {
    const rect =  document.getElementById("quote").getBoundingClientRect();
    fish.mouseposx = rect.x+rect.width;
    fish.mouseposy = rect.y+rect.height;
});

requestAnimationFrame(animate);
