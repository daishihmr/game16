require(tm.app);
require(tm.graphics);

tm.preload(function() {
    TextureManager.add("kuma", "chara1.png");
});

tm.main(function() {
    var app = CanvasApp("#main");
    app.fitWindow();
    app.background = "rgba(0,0,0,0.5)";

    var kuma = Sprite(32, 32, TextureManager.get("kuma"));
    kuma.x = (app.width - kuma.width) / 2;
    kuma.y = (app.height - kuma.height) / 2;
    kuma.frame = 0;
    kuma.update = function() {
        this.setFrameIndex(this.frame);
    };
    app.currentScene.addChild(kuma);

    var a = Math.PI * 2 / 3;
    for ( var i = 0; i < 3; i++) {
        var star = Shape(32, 32);
        star.index = i;
        star.canvas.setColorStyle("white", "yellow").fillStar(16, 16, 16, 5);
        star.update = function() {
            this.x = Math.cos(app.frame * 0.2 + a * this.index) * 100;
            this.y = Math.sin(app.frame * 0.2 + a * this.index) * 100;
        };
        kuma.addChild(star);
    }

    app.currentScene.update = function(a) {
        if (a.pointing.getPointingStart()) {
            var x = a.pointing.x;
            var y = a.pointing.y;
            kuma.animation.moveTo(x, y, 1000, "easeInOutQuad");
        }
    };

    app.run();
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
