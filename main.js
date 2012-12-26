require(tm.app);
require(tm.graphics);
require(tm.geom);
require(tm.event);
require(tm.bulletml);
require(myutil);

var SCREEN_WIDTH = 320;
var SCREEN_HEIGHT = 400;
var BORDER_WIDTH = 4;

var app = null;

tm.preload(function() {
    TextureManager.add("player", "assets/player.png");
    TextureManager.add("backfire", "assets/backfire.png");
});

tm.main(function() {
    app = new CanvasApp("#main");
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
    _fitFunc();
    window.addEventListener("resize", _fitFunc, false);
    window.addEventListener("orientationchange", _fitFunc, false);

    app.fps = 60;
    app.background = "rgb(0,0,80)";

    var screen = new CanvasScreen(SCREEN_WIDTH, SCREEN_HEIGHT);
    screen.x = screen.width / 2 + BORDER_WIDTH;
    screen.y = screen.height / 2 + BORDER_WIDTH;
    screen.drawStroke = true;
    app.currentScene.addChild(screen);

    for (var i = 0; i < 100; i++) {
        var star = tm.app.CircleShape(4, 4, {
            fillStyle: "rgb(80,80,80)",
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

    var player = new Player();
    player.x = SCREEN_WIDTH / 2;
    player.y = SCREEN_HEIGHT - 50;
    screen.addChild(player);

    var boss = new Boss(player);
    boss.x = SCREEN_WIDTH / 2;
    boss.y = 50;
    screen.addChild(boss);

    var attackParam = {
        rank: 0.5,
        target: player,
        testInWorld: function(bullet) {
            return 0 <= bullet.x && bullet.x <= SCREEN_WIDTH &&
                0 <= bullet.y && bullet.y <= SCREEN_HEIGHT;
        },
        bulletFactory: function(spec) {
            return new Bullet(player, spec.label);
        }
    };

    var ptIdx = 0;
    var ptLen = attackPatterns.length;
    var attackPattern = new AttackPattern(attackPatterns[ptIdx]);
    boss.update = attackPattern.createTicker(attackParam);

    // boss.addEventListener("completeattack", function() {
        // ptIdx = (ptIdx + 1) % ptLen;
        // var attackPattern = new AttackPattern(attackPatterns[ptIdx]);
        // boss.update = attackPattern.createTicker(attackParam);
    // });
    // boss.dispatchEvent(new Event("completeattack"));

    app.run();
});

var Boss = tm.createClass({
    superClass: CircleShape,
    init: function(target) {
        this.superInit(32, 32);
    }
})

var Player = tm.createClass({
    superClass: AnimationSprite,
    init: function() {
        this.superInit(48, 48, SpriteSheet({
            frame: {
                width: 64,
                height: 64,
                count: 7
            },
            image: "player"
        }));

        this.radius = 2;
        this.speed = 5;
        this.attitude = 0;

        this.marker = new CircleShape(5, 5, {
            fillStyle: "#f60",
            strokeStyle: "none"
        });
        this.marker.update = function(app) {
            if (~~(app.frame / 10) % 2 === 0) {
                this.alpha = 0.6;
            } else {
                this.alpha = 0.3;
            }
        };
        this.addChild(this.marker);

        this.backfire = new AnimationSprite(24, 24, SpriteSheet({
            frame: {
                width: 64,
                height: 64,
                count : 2
            },
            animations: {
                "main": [ 0, 2, "main", 2 ]
            },
            image: "backfire"
        }));
        this.backfire.gotoAndPlay("main");
        this.backfire.y = 20;
        this.addChild(this.backfire);

        this.beforePosition = this.position;
    },
    update: function(app) {
        var kb = app.keyboard;
        if      (kb.getKey("up"))    this.y -= this.speed;
        else if (kb.getKey("down"))  this.y += this.speed;
        if      (kb.getKey("left"))  this.x -= this.speed;
        else if (kb.getKey("right")) this.x += this.speed;

        var p = app.pointing;
        if (p.getPointing()) {
            this.x += p.deltaPosition.x;
            this.y += p.deltaPosition.y;
        }

        if (this.x < 0) this.x = 0;
        else if (SCREEN_WIDTH < this.x) this.x = SCREEN_WIDTH;
        if (this.y < 0) this.y = 0;
        else if (SCREEN_HEIGHT < this.y) this.y = SCREEN_HEIGHT;

        var deltaX = this.x - this.beforePosition.x;

        if (deltaX < 0) {
            this.attitude -= 0.2;
        } else if (0 < deltaX) {
            this.attitude += 0.2;
        } else {
            this.attitude *= 0.8;
        }

        this.attitude = Math.clamp(this.attitude, -3, 3);
        this.currentFrame = ~~(this.attitude) + 3;

        this.beforePosition = this.position.clone();
    }
});

var Bullet = tm.createClass({
    superClass: CircleShape,
    init: function(target, col) {
        var color;
        if (col === "blue") {
            color = Bullet.BLUE.toStyle();
        } else {
            color = Bullet.RED.toStyle();
        }
        this.superInit(16, 16, {
            fillStyle: color,
            strokeStyle: "none"
        });
        this.radius = 2;
        this.blendMode = "lighter";
        this.target = target;
    },
    update: function() {
        if (this.isHitElement(this.target)) {
            this.remove();
        }
    }
});
Bullet.RED = new RadialGradient(8, 8, 0, 8, 8, 8);
Bullet.RED.addColorStopList([
    { offset: 0.0, color: "rgba(255,255,255,1.0)" },
    { offset: 0.2, color: "rgba(255,255,255,1.0)" },
    { offset: 1.0, color: "rgba(255,0,0,0.0)" }
]);
Bullet.BLUE = new RadialGradient(8, 8, 0, 8, 8, 8);
Bullet.BLUE.addColorStopList([
    { offset: 0.0, color: "rgba(255,255,255,1.0)" },
    { offset: 0.2, color: "rgba(255,255,255,1.0)" },
    { offset: 1.0, color: "rgba(0,0,255,0.0)" }
]);
