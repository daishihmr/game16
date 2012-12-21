require(tm.app);
require(tm.graphics);
require(tm.geom);

tm.preload(function() {
    TextureManager.add("player", "assets/player.png");
    TextureManager.add("backfire", "assets/backfire.png");
});

tm.main(function() {
    var app = CanvasApp("#main");
    app.fps = 30;
    app.resize(320, 480);
    app.fitWindow();
    app.background = "rgba(0, 0, 0, 0.3)";

    var player = Player();
    player.x = (app.width - player.width) / 2;
    player.y = (app.height - player.height) / 2;
    app.currentScene.addChild(player);

    var boss = Boss();
    boss.x = (app.width - player.width) / 2;
    boss.y = 50;
    app.currentScene.addChild(boss);

    app.currentScene.update = function(app) {
    };

    app.run();
});

var Boss = tm.createClass({
    superClass: CircleShape,
    init: function() {
        this.superInit(64, 64);
    },
    update: function(app) {

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

        this.speed = 5;
        this.attitude = 0;

        this.backfire = AnimationSprite(24, 24, SpriteSheet({
            frame: {
                width: 64,
                height: 64,
                count : 2
            },
            image: "backfire"
        }));
        this.backfire.gotoAndPlay();
        this.backfire.y = 20;
        this.addChild(this.backfire);
    },
    update: function(app) {
        var kb = app.keyboard;
        if      (kb.getKey("up"))    this.y -= this.speed;
        else if (kb.getKey("down"))  this.y += this.speed;
        if      (kb.getKey("left"))  this.x -= this.speed;
        else if (kb.getKey("right")) this.x += this.speed;

        var angle = kb.getKeyAngle();
        if (angle === null) {
            this.attitude *= 0.8;
        } else if (90 < angle && angle < 270) {
            this.attitude -= 0.2;
        } else if (angle < 90 || 270 < angle) {
            this.attitude += 0.2;
        } else {
            this.attitude *= 0.8;
        }

        this.attitude = Math.clamp(this.attitude, -3, 3);
        this.currentFrame = ~~(this.attitude) + 3;

        // for (var i = -5; i <= 5; i+= 5) {
        //     Bullet(this, Vector2(0, 0).setAngle(-90 + i, 15));
        // }
    }
});

var Bullet = tm.createClass({
    superClass: CircleShape,
    init: function(firer, velocity) {
        this.superInit(10, 10, {
            fillStyle: "red"
        });
        this.velocity = velocity;
        this.rotation = velocity.toAngle() * Math.RAD_TO_DEG + 90;
        this.x = firer.x + velocity.x;
        this.y = firer.y + velocity.y;
        firer.parent.addChild(this);
    },
    update: function(app) {
        this.position.add(this.velocity)
        if (this.y < -20) {
            this.remove();
        }
    }
})

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
