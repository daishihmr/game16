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

    app.currentScene.update = function() {
    };

    var startLabel = tm.app.Label("start " + new Date());
    startLabel.debugBox = true;
    startLabel.width = 300;
    startLabel.y = 50;
    screen.addChild(startLabel);
    app.run();
});
