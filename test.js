var SCREEN_WIDTH = 320;
var SCREEN_HEIGHT = 420;
var BORDER_WIDTH = 4;

tm.main(function() {

    var app = tm.app.CanvasApp("#world");
    var _fitFunc = function() {
        if (window.innerWidth > window.innerHeight) {
            app.resize(SCREEN_HEIGHT + BORDER_WIDTH*2, SCREEN_HEIGHT + BORDER_WIDTH*2);
        } else {
            app.resize(SCREEN_WIDTH + BORDER_WIDTH*2,
                (SCREEN_WIDTH + BORDER_WIDTH*2) * window.innerHeight/window.innerWidth);
        }

        var e = this.element;
        var s = e.style;

        s.position = "absolute";
        s.left = "0px";
        s.top  = "0px";

        var rateWidth = e.width/window.innerWidth;
        var rateHeight= e.height/window.innerHeight;
        var rate = e.height/e.width;

        if (rateWidth > rateHeight) {
            s.width  = innerWidth+"px";
            s.height = innerWidth*rate+"px";
        }
        else {
            s.width  = innerHeight/rate+"px";
            s.height = innerHeight+"px";
        }
    }.bind(app);

    // 一度実行しておく
    _fitFunc();
    // リサイズ時のリスナとして登録しておく
    window.addEventListener("resize", _fitFunc, false);
    window.addEventListener("orientationchange", _fitFunc, false);

    var screen = CanvasScreen(SCREEN_WIDTH, SCREEN_HEIGHT);
    screen.x = screen.width / 2 + BORDER_WIDTH;
    screen.y = screen.height / 2 + BORDER_WIDTH;
    screen.drawStroke = true;
    app.currentScene.addChild(screen);

    for (var i = 0; i < 100; i++) {
        var star = tm.app.CircleShape(4, 4, {
            fillStyle: "rgba(255,255,255,0.3)",
            strokeStyle: "none"
        });
        star.x = tm.util.Random.randint(0, SCREEN_WIDTH);
        star.y = tm.util.Random.randint(0, SCREEN_HEIGHT);
        star.speed = tm.util.Random.randint(5, 15);
        star.update = function() {
            this.y += this.speed;
            if (this.y > SCREEN_HEIGHT + 10) {
                this.y -= SCREEN_HEIGHT + 10;
                this.speed = tm.util.Random.randint(5, 15);
            }
        }
        screen.addChild(star);
    }

    app.currentScene.update = function() {
    };

    var startLabel = tm.app.Label("start " + new Date());
    startLabel.debugBox = true;
    startLabel.width = 300;
    startLabel.x = screen.width + BORDER_WIDTH * 2 + 10;
    startLabel.y = 50;
    app.currentScene.addChild(startLabel);

    app.run();

});
