require(tm.app);
require(tm.graphics);
require(tm.geom);

tm.preload(function() {
    TextureManager.add("kuma", "chara1.png");
});

tm.main(function() {
    var app = CanvasApp("#main");
    app.fitWindow();
    app.background = "rgba(0,0,0,0.3)";

    var kuma = Sprite(32, 32, TextureManager.get("kuma"));
    kuma.x = (app.width - kuma.width) / 2;
    kuma.y = (app.height - kuma.height) / 2;
    kuma.frame = 0;
    kuma.stars = [];
    kuma.update = function() {
        this.setFrameIndex(this.frame);
    };
    app.currentScene.addChild(kuma);

    var Star = tm.createClass({
        superClass : Shape,
        init : function() {
            this.superInit(32, 32);
            this.canvas.setColorStyle("white", "yellow")
                    .fillStar(16, 16, 16, 5);
        },
        update : function() {
            var a = Math.PI * 2 / kuma.stars.length;
            var index = kuma.stars.indexOf(this);
            this.x = Math.cos(app.frame * 0.2 + a * index) * 100;
            this.y = Math.sin(app.frame * 0.2 + a * index) * 100;
        }
    });

    app.currentScene.update = function(a) {
        if (a.pointing.getPointingStart()) {
            var x = a.pointing.x;
            var y = a.pointing.y;
            kuma.animation.moveTo(x, y, 1000, "easeInOutQuad");
        }

        if (app.frame % 150 === 0) {
            var newStar = new Star();
            kuma.stars.push(newStar);
            kuma.addChild(newStar);
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
