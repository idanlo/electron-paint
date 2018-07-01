module.exports = function Circle(x, y, radius, current_color) {
    this.pos = createVector(x, y);
    this.radius = radius;
    this.color = current_color;

    this.show = function() {
        noStroke();
        fill(this.color);
        ellipse(this.pos.x, this.pos.y, this.radius * 2, this.radius * 2);
    };
};
