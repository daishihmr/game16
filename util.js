var myutil = {};
myutil.CanvasScreen = tm.createClass({
    superClass: tm.app.CanvasElement,
    init: function(width, height) {
        this.superInit();
        this.width = width;
        this.height = height;
        this.background = "black";
        this.drawStroke = false;
        this.myCanvas = tm.graphics.Canvas();
        this.myCanvas.resize(width, height);
    },
    _draw: function(canvas) {
        this.myCanvas.clearColor(this.background, 0, 0);

        if (this.visible === false) return;

        if (this.children.length > 0) {
            var tempChildren = this.children.slice();
            for (var i = 0, len = tempChildren.length; i < len; i++) {
                tempChildren[i]._draw(this.myCanvas);
            }
        }

        var context = canvas.context;

        context.save();

        context.fillStyle = this.fillStyle;
        context.strokeStyle = this.strokeStyle;
        context.globalAlpha *= this.alpha;
        context.globalComppositeOperation = this.blendMode;

        if (this.shadowBlur > 0) {
            context.shadowColor = this.shadowColor;
            context.shadowOffsetX = this.shadowOffsetX;
            context.shadowOffsetY = this.shadowOffsetY;
            context.shadowBlur = this.shadowBlur;
        }

        context.translate(this.position.x, this.position.y);
        context.rotate(this.rotation * Math.DEG_TO_RAD);
        context.scale(this.scale.x, this.scale.y);

        context.drawImage(this.myCanvas.canvas,
            0, 0, this.width, this.height,
            -this.width*this.originX, -this.height*this.originY, this.width, this.height);

        if (this.drawStroke) this.drawStrokeRect(context);

        context.restore();
    }
});

function require(namespace) {
    if (namespace === undefined || typeof (namespace) !== "object")
        return;

    for ( var member in namespace) {
        if (namespace.hasOwnProperty(member)) {
            if ('A' <= member[0] && member[0] <= 'Z') {
                if (tm.global[member] === undefined) {
                    tm.global[member] = namespace[member];
                }
            }
        }
    }
}
