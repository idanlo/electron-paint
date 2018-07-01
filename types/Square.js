module.exports = function Square(x, y, w, h, current_color) {
    this.pos = createVector(x, y);
    this.w = w;
    this.h = h;
    this.color = current_color;

    this.show = function() {
        noStroke();
        fill(this.color);
        rect(this.pos.x, this.pos.y, this.w, this.h);
    };
};
