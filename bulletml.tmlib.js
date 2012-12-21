tm.bulletml = tm.bulletml || {};

(function() {

    tm.bulletml.AttackPattern = tm.createClass({
        init: function(bulletml) {
            this._bulletml = bulletml;
        },
        _bulletml: null,
        createTicker: function(config, action) {
            return this._createTicker(config, action);
        },
        _createTicker: function(config, action) {
            config = (function(base) {
                var result = {};
                var d = tm.bulletml.AttackPattern.DEFAULT_CONFIG;
                for (var prop in d) {
                    if (d.hasOwnProperty(prop)) {
                        result[prop] = d[prop];
                    }
                }
                if (base !== undefined) {
                    for (var prop in base) {
                        if (base.hasOwnProperty(prop)) {
                            result[prop] = base[prop];
                        }
                    }
                }

                return result;
            })(config);

            action = action || "top";
            var ticker = function() {
                ticker.age += 1;
                var conf = ticker.config;
                var ptn = ticker._pattern;

                if (!ptn) {
                    return;
                }

                // update direction
                if (ticker.age < ticker.chDirEnd) {
                    ticker.direction += ticker.dirIncr;
                } else if (ticker.age == ticker.chDirEnd) {
                    ticker.direction = ticker.dirFin;
                }

                // update speed
                if (ticker.age < ticker.chSpdEnd) {
                    ticker.speed += ticker.spdIncr;
                } else if (ticker.age == ticker.chSpdEnd) {
                    ticker.speed = ticker.spdFin;
                }

                // update accel
                if (ticker.age < ticker.aclEnd) {
                    ticker.speedH += ticker.aclIncrH;
                    ticker.speedV += ticker.aclIncrV;
                } else if (ticker.age == ticker.aclEnd) {
                    ticker.speedH = ticker.aclFinH;
                    ticker.speedV = ticker.aclFinV;
                }

                // move sprite
                this.x += Math.cos(ticker.direction) * ticker.speed * conf.speedRate;
                this.y += Math.sin(ticker.direction) * ticker.speed * conf.speedRate;
                this.x += ticker.speedH * conf.speedRate;
                this.y += ticker.speedV * conf.speedRate;

                // proccess walker
                if (ticker.age < ticker.waitTo || ticker.completed) {
                    return;
                }
                var cmd;
                while (cmd = ticker.walker.next()) {
                    switch (cmd.commandName) {
                    case "fire":
                        ptn._fire.call(this, cmd, conf, ticker, ptn);
                        break;
                    case "wait":
                        var v = 0;
                        if (typeof(cmd.value) === "number") {
                            ticker.waitTo = ticker.age + cmd.value;
                        } else if ((v = ~~(cmd.value)) !== 0) {
                            ticker.waitTo = ticker.age + v;
                        } else {
                            ticker.waitTo = ticker.age + eval(cmd.value);
                        }
                        return;
                    case "changeDirection":
                        ptn._changeDirection.call(this, cmd, conf, ticker);
                        break;
                    case "changeSpeed":
                        ptn._changeSpeed.call(this, cmd, ticker);
                        break;
                    case "accel":
                        ptn._accel.call(this, cmd, ticker);
                        break;
                    case "vanish":
                        this.remove();
                        break;
                    }
                }

                ticker.completed = true;
            };

            if (typeof(action) === "string") {
                ticker.walker = this._bulletml.getWalker(action, config.rank);
            } else if (action instanceof BulletML.Bullet) {
                ticker.walker = action.getWalker(config.rank);
            } else {
                throw new Error("argument is invalid.");
            }

            ticker._pattern = this;
            ticker.config = config;
            ticker.age = -1;
            ticker.waitTo = -1;
            ticker.completed = false;
            ticker.direction = 0;
            ticker.lastDirection = 0;
            ticker.speed = 0;
            ticker.lastSpeed = 0;
            ticker.speedH = 0;
            ticker.speedV = 0;
            ticker.dirIncr = 0;
            ticker.dirFin = 0;
            ticker.chDirEnd = -1;
            ticker.spdIncr = 0;
            ticker.spdFin = 0;
            ticker.chSpdEnd = -1;
            ticker.aclIncrH = 0;
            ticker.aclFinH = 0;
            ticker.aclIncrV = 0;
            ticker.aclFinV = 0;
            ticker.aclEnd = -1;

            ticker.isDanmaku = true;
            return ticker;
        },
        _fire: function(cmd, config, ticker, pattern) {
            var b = config.bulletFactory({
                label: cmd.bullet.label
            });
            if (!b) {
                return
            }

            var bt = pattern.createTicker(config, cmd.bullet);

            var attacker = this;
            var calcDirection = function(d) {
                var dv = eval(d.value) * Math.DEG_TO_RAD;
                switch(d.type) {
                case "aim":
                    if (config.target) {
                        return radiusAtoB(attacker, config.target) + dv;
                    } else {
                        return dv - Math.PI / 2;
                    }
                case "absolute":
                    return dv - Math.PI / 2;
                case "relative":
                    return ticker.direction + dv;
                case "sequence":
                default:
                    return ticker.lastDirection + dv;
                }
            };
            ticker.lastDirection = bt.direction = calcDirection(cmd.direction || cmd.bullet.direction);

            var calcSpeed = function(s) {
                var sv = eval(s.value);
                switch (s.type) {
                case "relative":
                case "sequence":
                    return ticker.lastSpeed + sv;
                case "absolute":
                default:
                    return sv;
                }
            };
            ticker.lastSpeed = bt.speed = calcSpeed(cmd.speed || cmd.bullet.speed);

            b.x = this.x;
            b.y = this.y;

            b.update = function() {
                bt.apply(this);
            };
            if (config.addTarget) {
                config.addTarget.addChild(b);
            } else if (this.parent) {
                this.parent.addChild(b);
            }
        },
        _changeDirection: function(cmd, config, ticker) {

        },
        _changeSpeed: function(cmd, ticker) {

        },
        _accel: function(cmd, ticker) {

        }
    });

    tm.bulletml.defaultBulletFactory = function(spec) {
        var result = tm.app.CircleShape(8, 8);
        result.label = spec.label;
        return result;
    };

    tm.bulletml.defaultTestInWorld = function(bullet) {
        return true;
    };

    tm.bulletml.AttackPattern.DEFAULT_CONFIG = {
        bulletFactory: tm.bulletml.defaultBulletFactory,
        testInWorld: tm.bulletml.defaultTestInWorld,
        rank: 0,
        updateProperties: false,
        speedRate: 2
    };

    tm.bulletml.Bullet = tm.createClass({
        superClass: tm.app.CanvasElement,
        init: function() {
            this.superInit();
        }
    });

    function radiusAtoB(a, b) {
        var ca = {
            x : a.x + (a.width || 0) / 2,
            y : a.y + (a.height || 0) / 2
        };
        var cb = {
            x : b.x + (b.width || 0) / 2,
            y : b.y + (b.height || 0) / 2
        };
        return Math.atan2(cb.y - ca.y, cb.x - ca.x);
    }
})();
