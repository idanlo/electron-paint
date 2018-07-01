module.exports = function Line(
    xfrom,
    yfrom,
    xto,
    yto,
    thickness,
    current_color
) {
    this.from = createVector(xfrom, yfrom);
    this.to = createVector(xto, yto);
    this.thickness = thickness;
    this.color = current_color;

    this.show = function() {
        stroke(this.color);
        noFill();
        strokeWeight(this.thickness);
        line(this.from.x, this.from.y, this.to.x, this.to.y);
    };
};
