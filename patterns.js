var attackPatterns = [];
tm.preload(function() {
    var syncGet = function(url, patternIndex) {
        var check = {
            loaded: false,
            isLoaded: function() {
                return this.loaded;
            }
        };
        tm.addLoadCheckList(check);
        tm.util.Ajax.load({
            url: url,
            dataType: "xml",
            type: "GET",
            success: function(xml) {
                attackPatterns[patternIndex] = BulletML.build(xml);
                check.loaded = true;
                console.log(attackPatterns[0]);
            }
        });
    };

    BulletML.dsl();
    // attackPatterns[0] = new BulletML.Root({
    //     top: action(actionRef("a1", 0), repeat(10, action(actionRef("a2", 0), wait(5)))),
    //     a1: action(fire(bullet(direction("$1-10")))),
    //     a2: action(fire(bullet(direction("$1+10"))))
    // });
    syncGet("assets/[Daiouzyou]_round_4_boss_2.xml", 0);

    // attackPatterns[5] = new BulletML.Root({
    //     top : action([
    //         fire(bulletRef("parentbit", 1), direction(30, "aim")),
    //         fire(bulletRef("parentbit", -1), direction(-30, "aim")),
    //         wait(300)
    //     ]),
    //     parentbit : bullet(
    //         speed(2.0),
    //         action([
    //             actionRef("cross", 75, 0),
    //             actionRef("cross", 70, 0),
    //             actionRef("cross", 65, 0),
    //             actionRef("cross", 60, 0),
    //             actionRef("cross", 55, 0),
    //             actionRef("cross", 50, 0),
    //             actionRef("cross", 80, "15 * $1"),
    //             actionRef("cross", 75, "10 * $1"),
    //             actionRef("cross", 70, "6 * $1"),
    //             actionRef("cross", 65, "3 * $1"),
    //             actionRef("cross", 60, "1 * $1"),
    //             actionRef("cross", 55, 0),
    //             vanish()
    //         ])
    //     ),
    //     cross : action([
    //         fire(bulletRef("aimbit", "$1", "$2"), direction(0, "absolute")),
    //         fire(bulletRef("aimbit", "$1", "$2"), direction(90, "absolute")),
    //         fire(bulletRef("aimbit", "$1", "$2"), direction(180, "absolute")),
    //         fire(bulletRef("aimbit", "$1", "$2"), direction(270, "absolute")),
    //         wait(5)
    //     ]),
    //     aimbit : bullet(
    //         null,
    //         speed(0.6),
    //         action([
    //             wait("$1"),
    //             fire(
    //                 bullet(),
    //                 direction("$2", "aim"),
    //                 speed("1.6 * (0.5 + 0.5 * $rank)")
    //             ),
    //             repeat("2 + 5 * $rank", action([
    //                 fire(bullet(), direction(0, "sequence"), speed(0.1, "sequence"))
    //             ]))
    //         ])
    //     )
    // });

    // attackPatterns[1] = new BulletML.Root({
    //     top: action([
    //         fire(bullet())
    //     ])
    // });

    // attackPatterns[2] = new BulletML.Root({
    //     top: action([
    //         repeat(50, action([
    //             fire(bullet()),
    //             wait(5)
    //         ]))
    //     ])
    // });

    // attackPatterns[3] = new BulletML.Root({
    //     top: action(
    //         repeat(5, action(
    //             function() {
    //                 var a = [];
    //                 for (var i = 0; i < 4; i++) {
    //                     a.push(action(
    //                         fire(bullet(), direction(i)),
    //                         repeat(30,
    //                             action(fire(bullet(), direction(12, "sequence")))
    //                         ),
    //                         wait(3)
    //                     ));
    //                 }

    //                 a.push(wait(20));
    //                 return a;
    //             }
    //         ))
    //     )
    // });

    // syncGet("assets/[G_DARIUS]_homing_laser.xml", 4);

});
