const { ipcRenderer } = require("electron");
const { dialog } = require("electron").remote;
const sizeOf = require("image-size");
const fs = require("fs");
const Circle = require("./types/Circle");
const Square = require("./types/Square");
const Line = require("./types/Line");
const Pixel = require("./types/Pixel");

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
    background(255);

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

function draw() {}

function updateScreen() {
    background(255);
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
            updateScreen();
        } else if (mode === "circle") {
            if (!currentCircle) {
                currentCircle = new Circle(
                    mouseX,
                    mouseY,
                    circleRadius,
                    current_color
                );
                drawing.push(currentCircle);
                updateScreen();
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
                updateScreen();
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
            console.log("FINISHED");
            updatePixels();
            pixels = [];
            // updateScreen();
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
            updateScreen();
        } else if (mode === "circle" && currentCircle) {
            let d = dist(
                mouseX,
                mouseY,
                currentCircle.pos.x,
                currentCircle.pos.y
            );
            currentCircle.radius = d;
            updateScreen();
        } else if (mode === "square" && currentSquare) {
            let xdist =
                max(mouseX, currentSquare.pos.x) -
                min(mouseX, currentSquare.pos.x);
            let ydist =
                max(mouseY, currentSquare.pos.y) -
                min(mouseY, currentSquare.pos.y);
            currentSquare.w = xdist;
            currentSquare.h = ydist;
            updateScreen();
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
    if (drawing.length > 0) {
        cnv.size(windowWidth - 75, windowHeight);
        cnv.position(75, 0);
        updateScreen();
    } else {
        loadPixels();
        cnv.size(windowWidth - 75, windowHeight);
        cnv.position(75, 0);
        updatePixels();
    }
}

function floodFill(x, y, target_col, replace_col) {
    let stack = [[x, y]];
    let drawingBoundTop = 0;
    while (stack.length) {
        let newPos, x, y, pixelPos, reachLeft, reachRight;
        newPos = stack.pop();
        x = newPos[0];
        y = newPos[1];

        pixelPos = (y * width + x) * 4;
        while (
            y-- >= drawingBoundTop &&
            matchStartColor(pixelPos, replace_col) &&
            !matchStartColor(pixelPos, target_col)
        ) {
            pixelPos -= width * 4;
        }
        pixelPos += width * 4;
        ++y;
        reachLeft = false;
        reachRight = false;
        while (
            y++ < height - 1 &&
            matchStartColor(pixelPos, replace_col) &&
            !matchStartColor(pixelPos, target_col)
        ) {
            colorPixel(pixelPos, replace_col);
            // drawing.push(new Pixel(x, y, replace_col));
            if (x > 0) {
                if (
                    matchStartColor(pixelPos - 4, replace_col) &&
                    !matchStartColor(pixelPos - 4, target_col)
                ) {
                    if (!reachLeft) {
                        stack.push([x - 1, y]);
                        reachLeft = true;
                    }
                } else if (reachLeft) {
                    reachLeft = false;
                }
            }

            if (x < width - 1) {
                if (
                    matchStartColor(pixelPos + 4, replace_col) &&
                    !matchStartColor(pixelPos + 4, target_col)
                ) {
                    if (!reachRight) {
                        stack.push([x + 1, y]);
                        reachRight = true;
                    }
                } else if (reachRight) {
                    reachRight = false;
                }
            }

            pixelPos += width * 4;
        }
    }
}

function matchStartColor(pixelPos, curColor) {
    var r = pixels[pixelPos];
    var g = pixels[pixelPos + 1];
    var b = pixels[pixelPos + 2];

    return (
        r !== curColor.levels[0] ||
        g !== curColor.levels[1] ||
        b !== curColor.levels[2]
    );
}

function colorPixel(pixelPos, curColor) {
    pixels[pixelPos] = curColor.levels[0];
    pixels[pixelPos + 1] = curColor.levels[1];
    pixels[pixelPos + 2] = curColor.levels[2];
    pixels[pixelPos + 3] = curColor.levels[3];
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
        updateScreen();
    }
});

ipcRenderer.on("newFile", () => {
    cnv.size(windowWidth - 75, windowHeight);
    cnv.position(75, 0);
});

ipcRenderer.on("saveFile", () => {
    let str = {
        data: []
    };
    drawing.forEach(item => {
        let obj;
        if (item === "separator") {
            obj = {
                type: "separator"
            };
        } else if (item instanceof Circle) {
            obj = {
                type: "Circle",
                x: item.pos.x,
                y: item.pos.y,
                radius: item.radius,
                color: item.color
            };
        } else if (item instanceof Line) {
            obj = {
                type: "Line",
                fromx: item.from.x,
                fromy: item.from.y,
                tox: item.to.x,
                toy: item.to.y,
                color: item.color,
                thickness: item.thickness
            };
        } else if (item instanceof Square) {
            obj = {
                type: "Square",
                x: item.pos.x,
                y: item.pos.y,
                w: item.w,
                h: item.h,
                color: item.color
            };
        }
        str.data.push(obj);
    });
    let jsondata = JSON.stringify(str);
    dialog.showSaveDialog(
        {
            title: "Save your painting",
            filters: [{ name: "Paint Image Data", extensions: ["pnt"] }]
        },
        fileName => {
            fs.writeFile(fileName, jsondata, err => {
                if (err) {
                    console.log(err);
                } else {
                    console.log("The file has been created");
                }
            });
        }
    );
});

ipcRenderer.on("openFile", (event, data) => {
    dialog.showOpenDialog(
        {
            title: "Open existing Paint file",
            filters: [
                {
                    name: "Paint Image Data",
                    extensions: ["pnt"]
                }
            ]
        },
        fileName => {
            if (fileName && fileName.length > 0) {
                fs.readFile(fileName[0], "utf8", (err, data) => {
                    if (err) {
                        console.log(err);
                    } else {
                        let jsondata = JSON.parse(data).data;
                        drawing = [];
                        jsondata.forEach(item => {
                            if (item.type === "separator") {
                                drawing.push(item.type);
                            } else if (item.type === "Circle") {
                                drawing.push(
                                    new Circle(
                                        item.x,
                                        item.y,
                                        item.radius,
                                        item.color
                                    )
                                );
                            } else if (item.type === "Square") {
                                drawing.push(
                                    new Square(
                                        item.x,
                                        item.y,
                                        item.w,
                                        item.h,
                                        item.color
                                    )
                                );
                            } else if (item.type === "Line") {
                                drawing.push(
                                    new Line(
                                        item.fromx,
                                        item.fromy,
                                        item.tox,
                                        item.toy,
                                        item.thickness,
                                        item.color
                                    )
                                );
                            }
                        });
                        updateScreen();
                    }
                });
            }
        }
    );
});
