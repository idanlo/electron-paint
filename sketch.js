const { ipcRenderer } = require("electron");

let cnv;
let mode;
let current_color;
let circleRadius;
let lineThickness;
let squareWidth;
let currentCircle;
let currentSquare;
let drawing;

function setup() {
    cnv = createCanvas(windowWidth - 75, windowHeight);
    cnv.style("display", "block"); // so that it wont have scroll bars
    cnv.position(75, 0);
    mode = "line";
    current_color = "black";
    lineThickness = 20;
    circleRadius = 5;
    squareWidth = 10;
    currentCircle = null;
    currentSquare = null;
    drawing = [];

    let divs = document.getElementsByClassName("controls");
    for (let i = 0; i < divs.length; i++) {
        divs[i].addEventListener("click", () => {
            if (divs[i].getAttribute("id") === "fill") {
                mode = "fill";
            } else {
                current_color = divs[i].getAttribute("id");
            }
        });
    }
}

function draw() {
    background(255);
    stroke("blue");
    strokeWeight(1);
    point(100, 100);
    for (let i = 0; i < drawing.length; i++) {
        if (drawing[i] !== "separator") {
            drawing[i].show();
        }
    }
}

function mousePressed() {
    if (mouseX >= 0) {
        if (mode === "line") {
            drawing.push(
                new Line(
                    pmouseX,
                    pmouseY,
                    mouseX,
                    mouseY,
                    lineThickness,
                    current_color
                )
            );
        } else if (mode === "circle") {
            if (!currentCircle) {
                currentCircle = new Circle(
                    mouseX,
                    mouseY,
                    circleRadius,
                    current_color
                );
                drawing.push(currentCircle);
            }
        } else if (mode === "square") {
            if (!currentSquare) {
                currentSquare = new Square(
                    mouseX,
                    mouseY,
                    squareWidth,
                    squareWidth,
                    current_color
                );
                drawing.push(currentSquare);
            }
        } else if (mode === "fill") {
            loadPixels();
            let index = (mouseX + mouseY * width) * 4;

            // target_color = what the user wants to replace
            let target_color = color(
                pixels[index],
                pixels[index + 1],
                pixels[index + 2],
                pixels[index + 3]
            );
            // replacement_color = the color that will be instead of the target_color
            let replacement_color = color(current_color);
            floodFill(mouseX, mouseY, target_color, replacement_color);
        }
    }
}

function mouseDragged() {
    if (mouseX >= 0) {
        if (mode === "line") {
            drawing.push(
                new Line(
                    pmouseX,
                    pmouseY,
                    mouseX,
                    mouseY,
                    lineThickness,
                    current_color
                )
            );
        } else if (mode === "circle" && currentCircle) {
            let d = dist(
                mouseX,
                mouseY,
                currentCircle.pos.x,
                currentCircle.pos.y
            );
            currentCircle.radius = d;
        } else if (mode === "square" && currentSquare) {
            let xdist =
                max(mouseX, currentSquare.pos.x) -
                min(mouseX, currentSquare.pos.x);
            let ydist =
                max(mouseY, currentSquare.pos.y) -
                min(mouseY, currentSquare.pos.y);
            currentSquare.w = xdist;
            currentSquare.h = ydist;
        }
    }
}

function mouseReleased() {
    if (currentCircle) {
        currentCircle = null;
    } else if (currentSquare) {
        currentSquare = null;
    }
    drawing.push("separator");
}

function windowResized() {
    loadPixels();
    cnv.size(windowWidth - 75, windowHeight);
    cnv.position(75, 0);
    updatePixels();
}

ipcRenderer.on("changecurrent_color", (event, data) => {
    if (data.current_color === "eraser") {
        current_color = "white";
    } else {
        current_color = data.current_color;
    }
});

ipcRenderer.on("changeMode", (event, data) => {
    mode = data.mode;
});

ipcRenderer.on("changeLineThickness", (event, data) => {
    lineThickness = data.thickness;
});

ipcRenderer.on("changeCircleRadius", (event, data) => {
    circleRadius = data.radius;
});

ipcRenderer.on("changeSquareWidth", (event, data) => {
    squareWidth = data.width;
});

ipcRenderer.on("Undo", (event, data) => {
    if (drawing.length > 0) {
        // clear the last element of the drawing including its separator
        if (drawing[drawing.length - 1] === "separator") {
            // splice the element itself and the separator
            drawing.splice(drawing.length - 2, 2);
        } else {
            drawing.pop();
        }

        // clear the entire line and not just a part of it:
        // it is a line if it has .from and .to
        while (
            drawing[drawing.length - 1] &&
            drawing[drawing.length - 1].from &&
            drawing[drawing.length - 1].to
        ) {
            drawing.pop();
        }
    }
});

ipcRenderer.on("newFile", () => {
    cnv.size(windowWidth - 75, windowHeight);
    cnv.position(75, 0);
});

ipcRenderer.on("saveFile", () => {
    saveCanvas(cnv, "myDrawing", "jpg");
});

function Circle(x, y, radius, current_color) {
    this.pos = createVector(x, y);
    this.radius = radius;
    this.current_color = current_color;

    this.show = function() {
        noStroke();
        fill(this.current_color);
        ellipse(this.pos.x, this.pos.y, this.radius * 2, this.radius * 2);
    };
}

function Square(x, y, w, h, current_color) {
    this.pos = createVector(x, y);
    this.w = w;
    this.h = h;
    this.current_color = current_color;

    this.show = function() {
        noStroke();
        fill(this.current_color);
        rect(this.pos.x, this.pos.y, this.w, this.h);
    };
}

function Line(xfrom, yfrom, xto, yto, thickness, current_color) {
    this.from = createVector(xfrom, yfrom);
    this.to = createVector(xto, yto);
    this.thickness = thickness;
    this.current_color = current_color;

    this.show = function() {
        stroke(this.current_color);
        noFill();
        strokeWeight(this.thickness);
        line(this.from.x, this.from.y, this.to.x, this.to.y);
    };
}
function Pixel(x, y, color) {
    this.pos = createVector(x, y);
    this.color = color;

    this.show = function() {
        strokeWeight(1);
        stroke(this.color);
        point(this.pos.x, this.pos.y);
    };
}

function floodFill(x, y, target_col, replace_col) {
    if (x >= 0 && y >= 0 && x <= width && y <= height) {
        let index = (x + y * width) * 4;
        if (target_col === replace_col) {
            return;
        } else if (
            (pixels[index] !== target_col.levels[0] &&
                pixels[index + 1] !== target_col.levels[1] &&
                pixels[index + 2] !== target_col.levels[2]) ||
            pixels[index + 3] !== target_col.levels[3]
        ) {
            return;
        } else {
            drawing.push(new Pixel(x, y, replace_col));
            floodFill(x, y - 1, target_col, replace_col);
            floodFill(x - 1, y, target_col, replace_col);
            floodFill(x, y + 1, target_col, replace_col);
            floodFill(x + 1, y, target_col, replace_col);
            return;
        }
    }
}
