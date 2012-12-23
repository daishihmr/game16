require(tm.app);
require(tm.graphics);
require(tm.geom);

tm.preload(function() {
    TextureManager.add("player", "assets/player.png");
    TextureManager.add("backfire", "assets/backfire.png");
});

var SCREEN_WIDTH = 465;
var SCREEN_HEIGHT = 465;
var SCREEN_CENTER_X = SCREEN_WIDTH / 2;
var SCREEN_CENTER_Y = SCREEN_HEIGHT / 2;

var app = null;

tm.main(function() {
    app = CanvasApp("#main");
    app.fps = 60;
    app.resize(SCREEN_WIDTH, SCREEN_HEIGHT);
    app.fitWindow();
    app.background = "rgba(0, 0, 0, 0.3)";

    var player = Player();
    player.x = SCREEN_CENTER_X;
    player.y = SCREEN_HEIGHT - 50;
    app.currentScene.addChild(player);

    var boss = Boss(player);
    boss.x = SCREEN_CENTER_X;
    boss.y = 50;
    app.currentScene.addChild(boss);

    var bulletList = [];

    var attackParam = {
        target: player,
        testInWorld: function(bullet) {
            return 0 <= bullet.x && bullet.x <= SCREEN_WIDTH &&
                0 <= bullet.y && bullet.y <= SCREEN_HEIGHT;
        },
        bulletFactory: function(spec) {
            var bullet = Bullet();
            bulletList.push(bullet);
            return bullet;
        }
    };
    var attackPattern = tm.bulletml.AttackPattern(attackPatterns[2]);
    boss.update = attackPattern.createTicker(attackParam);

    boss.addEventListener("completeattack", function() {
        attackPattern = tm.bulletml.AttackPattern(attackPatterns[3]);
        this.update = attackPattern.createTicker(attackParam);
    });

    app.currentScene.update = function() {
        for (var i = 0, end = bulletList.length; i < end; i++) {
            var bullet = bulletList[i];
            if (bullet.active && player.isHitElement(bullet)) {
                app.stop();
                break;
            }
        }
    };

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
        this.superInit(32, 32, SpriteSheet({
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

        this.marker = CircleShape(6, 6, {
            fillStyle: "#f00",
            strokeStyle: "none"
        });
        this.addChild(this.marker);

        this.backfire = AnimationSprite(24, 24, SpriteSheet({
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
            this.x += p.deltaPosition.x * 1.25;
            this.y += p.deltaPosition.y * 1.25;
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

        // for (var i = -5; i <= 5; i+= 5) {
        //     Bullet(this, Vector2(0, 0).setAngle(-90 + i, 15));
        // }
    }
});

var Bullet = tm.createClass({
    superClass: StarShape,
    init: function() {
        this.superInit(16, 16, {
            strokeStyle: "none"
        });
        this.radius = 5;
        this.active = true;
        this.addEventListener("removed", function() {
            this.active = false;
        });
    },
    update: function(app) {
        this.rotation += 10;
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
