tm.bulletml = tm.bulletml || {};

(function() {

    tm.bulletml.AttackPattern = tm.createClass({
        init: function(bulletml) {
            this._bulletml = bulletml;
        },
        _bulletml: null,
        createTicker: function(config, action) {
            var topLabels = this._bulletml.getTopActionLabels();
            if (action === undefined && topLabels.length > 0) {
                var tickers = [];
                for (var i = 0, end = topLabels.length; i < end; i++) {
                    tickers[tickers.length] = this._createTicker(config, topLabels[i]);
                }
                var parentTicker = function() {
                    if (parentTicker.completed) return;

                    for (var i = tickers.length; i--; ) {
                        tickers[i].call(this);
                    }
                    if (parentTicker.compChildCount == tickers.length) {
                        parentTicker.completed = true;
                        this.dispatchEvent(tm.event.Event("completeattack"));
                    }
                };
                for (var i = tickers; i--; ) {
                    tickers[i].parentTicker = parentTicker;
                }

                parentTicker.compChildCount = 0;
                parentTicker.completeChild = function() {
                    this.compChildCount++;
                };

                parentTicker.compChildCount = 0;
                parentTicker.completed = false;
                parentTicker.isDanmaku = true;

                return parentTicker;
            } else {
                return this._createTicker(config, action);
            }
        },
        _createTicker: function(config, action) {
            config = (function(base) {
                var result = {};
                var def = tm.bulletml.AttackPattern.DEFAULT_CONFIG;
                for (var prop in def) {
                    if (def.hasOwnProperty(prop)) {
                        if (base !== undefined) {
                            result[prop] = base[prop] || def[prop];
                        } else {
                            result[prop] = def[prop];
                        }
                    }
                }

                return result;
            })(config);

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

                if (!conf.testInWorld(this)) {
                    this.remove();
                    this.dispatchEvent(tm.event.Event("removed"));
                    return;
                }

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
                        this.dispatchEvent(tm.event.Event("removed"));
                        break;
                    }
                }

                ticker.completed = true;
                this.dispatchEvent(tm.event.Event("completeattack"));
            };

            action = action || "top";
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

            b.addEventListener("enterframe", bt);
            if (config.addTarget) {
                config.addTarget.addChild(b);
            } else if (this.parent) {
                this.parent.addChild(b);
            }
        },
        _changeDirection: function(cmd, config, ticker) {
            var d = eval(cmd.direction.value);
            var t = eval(cmd.term);
            switch (cmd.direction.type) {
            case "aim":
                var tar = config.target;
                if (!tar) {
                    return;
                }
                ticker.dirFin = radiusAtoB(this, tar) + d * Math.DEG_TO_RAD;
                ticker.dirIncr = normalizeRadian(ticker.dirFin - ticker.direction) / t;
                break;
            case "absolute":
                ticker.dirFin = d * Math.DEG_TO_RAD - Math.PI / 2;
                ticker.dirIncr = normalizeRadian(ticker.dirFin - ticker.direction) / t;
                break;
            case "relative":
                ticker.dirFin = ticker.direction + d * Math.DEG_TO_RAD;
                ticker.dirIncr = normalizeRadian(ticker.dirFin - ticker.direction) / t;
                break;
            case "sequence":
                ticker.dirIncr = d * Math.DEG_TO_RAD;
                ticker.dirFin = ticker.direction + ticker.dirIncr * t;
                break;
            }
            ticker.chDirEnd = ticker.age + t;
        },
        _changeSpeed: function(cmd, ticker) {
            var s = eval(cmd.speed.value);
            var t = eval(cmd.term);
            switch (cmd.speed.type) {
            case "absolute":
                ticker.spdFin = s;
                ticker.spdIncr = (ticker.spdFin - ticker.speed) / t;
                break;
            case "relative":
                ticker.spdFin = s + ticker.speed;
                ticker.spdIncr = (ticker.spdFin - ticker.speed) / t;
                break;
            case "sequence":
                ticker.spdIncr = s;
                ticker.spdFin = ticker.speed + ticker.spdIncr * t;
                break;
            }
            ticker.chSpdEnd = ticker.age + t;
        },
        _accel: function(cmd, ticker) {
            var t = eval(cmd.term);
            ticker.aclEnd = ticker.age + t;

            if (cmd.horizontal) {
                var h = eval(cmd.horizontal.value);
                switch (cmd.horizontal.type) {
                case "absolute":
                case "sequence":
                    ticker.aclIncrH = (h - ticker.speedH) / t;
                    ticker.aclFinH = h;
                    break;
                case "relative":
                    ticker.aclIncrH = h;
                    ticker.aclFinH = (h - ticker.speedH) * t;
                    break;
                }
            } else {
                ticker.aclIncrH = 0;
                ticker.aclFinH = ticker.speedH;
            }

            if (cmd.vertical) {
                var v = eval(cmd.vertical.value);
                switch (cmd.vertical.type) {
                case "absolute":
                case "sequence":
                    ticker.aclIncrV = (v - ticker.speedV) / t;
                    ticker.aclFinV = v;
                    break;
                case "relative":
                    ticker.aclIncrV = v;
                    ticker.aclFinV = (v - ticker.speedV) * t;
                    break;
                }
            } else {
                ticker.aclIncrV = 0;
                ticker.aclFinV = ticker.speedV;
            }
        }
    });

    tm.bulletml.defaultBulletFactory = function(spec) {
        var result = tm.app.CircleShape(4, 4);
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
        speedRate: 2,
        target: null
    };

    function normalizeRadian(radian) {
        while (radian <= -Math.PI) {
            radian += Math.PI * 2;
        }
        while (Math.PI < radian) {
            radian -= Math.PI * 2;
        }
        return radian;
    }

    function radiusAtoB(a, b) {
        var ca = {
            x : a.x,
            y : a.y
        };
        var cb = {
            x : b.x,
            y : b.y
        };
        return Math.atan2(cb.y - ca.y, cb.x - ca.x);
    }
})();
