tm.main(function() {
    var app = tm.app.CanvasApp("#main");
    app.fitWindow();
    app.background = "rgba(0,0,0,1)";

    var star = tm.app.Shape(64, 64);
    star.canvas.setColorStyle("white", "yellow").fillStar(32, 32, 32, 5);
    app.currentScene.addChild(star);

    app.currentScene.update = function(a) {
        star.x = Math.cos(app.frame * 0.2) * 200 + app.width / 2;
        star.y = Math.sin(app.frame * 0.2) * 200 + app.height / 2;
    };

    app.run();
});
