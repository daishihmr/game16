var attackPatterns = [];
tm.preload(function() {
    BulletML.dsl();
    attackPatterns[0] = new BulletML.Root({
        top : action([
            fire(bulletRef("parentbit", 1), direction(30, "aim")),
            fire(bulletRef("parentbit", -1), direction(-30, "aim")),
            wait(300)
        ]),
        parentbit : bullet(
            speed(2.0),
            action([
                actionRef("cross", 75, 0),
                actionRef("cross", 70, 0),
                actionRef("cross", 65, 0),
                actionRef("cross", 60, 0),
                actionRef("cross", 55, 0),
                actionRef("cross", 50, 0),
                actionRef("cross", 80, "15 * $1"),
                actionRef("cross", 75, "10 * $1"),
                actionRef("cross", 70, "6 * $1"),
                actionRef("cross", 65, "3 * $1"),
                actionRef("cross", 60, "1 * $1"),
                actionRef("cross", 55, 0),
                vanish()
            ])
        ),
        cross : action([
            fire(bulletRef("aimbit", "$1", "$2"), direction(0, "absolute")),
            fire(bulletRef("aimbit", "$1", "$2"), direction(90, "absolute")),
            fire(bulletRef("aimbit", "$1", "$2"), direction(180, "absolute")),
            fire(bulletRef("aimbit", "$1", "$2"), direction(270, "absolute")),
            wait(5)
        ]),
        aimbit : bullet(
            null,
            speed(0.6),
            action([
                wait("$1"),
                fire(
                    bullet(),
                    direction("$2", "aim"),
                    speed("1.6 * (0.5 + 0.5 * $rank)")
                ),
                repeat("2 + 5 * $rank", action([
                    fire(bullet(), direction(0, "sequence"), speed(0.1, "sequence"))
                ]))
            ])
        )
    });

    attackPatterns[1] = new BulletML.Root({
        top: action([
            fire(bullet("b"))
        ])
    });

    attackPatterns[2] = new BulletML.Root({
        top: action([
            repeat(1000, action([
                fire(bullet("b")),
                wait(5)
            ]))
        ])
    });
});
