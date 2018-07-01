module.exports = function Pixel(x, y, color) {
    this.pos = createVector(x, y);
    this.color = color;

    this.show = function() {
        strokeWeight(1);
        stroke(this.color);
        point(this.pos.x, this.pos.y);
    };
};
