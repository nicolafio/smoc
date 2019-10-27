/* jshint esnext: true */

// functions

function middle(x, y) {
    return (x + y) / 2;
}

var isPhone = isPhone = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

dev.element.get(document.body).css('overflow', 'hidden');

var
    // settings

    background = dev.color('#fff'),

    foreground = dev.color('#111'),

    effects = dev.color('#00caff'),

    viewWidth = isPhone ? window.innerWidth : 1000,

    viewHeight = isPhone ? window.innerHeight : 720,

    // styles

    particlesColor = effects.clone().l(middle(effects.l(), foreground.l())),

    backgroundElementStyle = {
        background: foreground,
        color: background
    },

    foregroundElementStyle = {
        background: null,
        color: foreground
    },

    // behaviours

    buttonBehaviour = function () {
        this.css({
            userSelect: 'none',
            cursor: 'pointer',
            border: '1px solid ' + dev.color(foreground).a(0.1),
            margin: '3px'
        }).hover(
            backgroundElementStyle,
            foregroundElementStyle
        ).click(foregroundElementStyle);
    },

    // factories

    createMenu = function (items) {
        var menu = dev.div().css({
                pointerEvents: 'all',
                margin: 'auto',
                width: '400px'
            });
        for (var item of items) menu.add(
            dev.div(item[0], buttonBehaviour).css('padding', '15px').click(item[1])
        );
        return menu;
    },

    createKeyBindingsInfo = function () {
        if (isPhone) return dev.div();
        return dev.div([
            dev.div(dev.i('How to play')).css('padding-bottom', '5px'),
            dev.div([
                dev.div([dev.b('W'), ' / ', dev.b('↑'), ': Move up']),
                dev.div([dev.b('A'), ' / ', dev.b('←'), ': Move left']),
                dev.div([dev.b('S'), ' / ', dev.b('↓'), ': Move down']),
                dev.div([dev.b('D'), ' / ', dev.b('→'), ': Move right']),
                dev.div([dev.b('Q'), ': Rotate clockwise']),
                dev.div([dev.b('E'), ': Rotate anticlockwise']),
                dev.div([dev.b('P'), ': Pause']),
                dev.div(dev.i('You can use your mouse to aim enemies.'))
            ]).css({
                textAlign: 'left'
            })
        ]).css({
            display: 'inline-block',
            padding: '10px',
            margin: '10px',
            borderRadius: '5px',
            border: '1px solid ' + dev.color(foreground).a(0.1).rgba()
        });
    },

    // objects

    gameWrapper = dev.center(function () {
        var shadowColor = dev.color(foreground).l((background.l() + foreground.l()) / 2);
        this.css({
            position: 'relative',
            top: dev.dynamicValue(function () {
                dev.element.get(window).on('resize', (function () {
                    this.value(innerHeight / 2- viewHeight / 2 + 'px');
                }).bind(this)).trigger('resize');
            }),
            margin: 'auto',
            width: viewWidth + 'px',
            height:  viewHeight + 'px',
            background: 'radial-gradient(circle 2000px at 50% 50%, ' + background + ', ' + shadowColor.clone().a(0.2) + ')',
            color: foreground,
            boxShadow:
                isPhone ?
                'none' :
                'inset 0 0 0 1px ' + shadowColor,
            overflow: 'hidden'
        });
    }).appendTo(
        dev.element.get(document.body).css({
            margin: 0,
            background: dev.color(background).l(Math.round(background.l())),
            fontFamily: "monospace"
        })
    ),

    hud = dev.centered().css({
        position: 'absolute',
        width: '90%',
        height: '90%',
        pointerEvents: 'none',
        userSelect: 'none',
        cursor: 'default',
        zIndex: 1
    }).appendTo(gameWrapper),

    mainMenu = dev.div([
        dev.div('SMOC').css({
            paddingTop: '80px',
            paddingBottom: '80px',
            fontSize: '40px',
            userSelect: 'none'
        }),
        isPhone ?
        dev.div('The game is meant to be played on a computer with a keyboard and a mouse. Unfortunately phones are not supported.') :
        createMenu([
            [
                'Play',
                function () {

                    mainMenu.remove();
                    var origin = [viewWidth / 2, viewHeight / 2],
                        viewRect = [[0, 0], viewWidth, viewHeight],

                        destroyIfOutOfView = function () {
                            if (!joy.utils.pointInRect(this.position(), viewRect)) {
                                this.destroy();
                                return false;
                            }
                        },

                        buffsTime = 10000,
                        buffsBarWidth = 300,
                        buffs = [
                            "Follow Enemies",
                            "Double Damage",
                            "Rapid Fire",
                            "Triple Fire",
                            "Slow Enemies",
                            "Bouncing Bullets",
                            "Double Fire"
                        ],

                        gameOver = (function () {
                            var gameOverMenu = dev.centered([
                                    dev.div(dev.b('Game Over')).css('padding', '20px'),
                                    createMenu([
                                        [
                                            'Try again',
                                            function () {
                                                gameOverMenu.remove();
                                                var ind = game.length,
                                                    object, player;
                                                loop: while (ind--) {
                                                    object = game[ind];
                                                    if (object === camera) continue;
                                                    for (player of players)
                                                        if (player === object)
                                                            continue loop;
                                                    object.destroy();
                                                }
                                                score.value(0);
                                                for (player of players) player.position(camera.position());
                                                view.css({
                                                    webkitFilter: null,
                                                    opacity: null,
                                                    cursor: 'none'
                                                });
                                                time.start();
                                            }
                                        ],
                                        [
                                            'Back to main menu',
                                            function () {
                                                view.remove();
                                                game.destroy();
                                                gameOverMenu.replaceWith(mainMenu);
                                            }
                                        ]
                                    ]),
                                    createKeyBindingsInfo()
                                ]);
                            return function () {
                                for (var key in buffTimes) buffTimes[key].value(0);
                                time.stop();
                                view.css({
                                    webkitFilter: 'blur(10px)',
                                    opacity: 0.5,
                                    cursor: 'default'
                                });
                                hud.add(gameOverMenu);
                            };
                        })(),

                        togglePause = (function () {
                            var paused = false,
                                pauseMenu = dev.centered([
                                    dev.div(dev.b('pause')).css('padding', '20px'),
                                    createMenu([
                                        [
                                            'Resume',
                                            function () {
                                                togglePause();
                                            }
                                        ],
                                        [
                                            'Back to main menu',
                                            function () {
                                                view.remove();
                                                game.destroy();
                                                pauseMenu.replaceWith(mainMenu);
                                            }
                                        ]
                                    ]),
                                    createKeyBindingsInfo()
                                ]);
                            return function () {
                                var key;
                                if (paused) {
                                    pauseMenu.remove();
                                    view.css({
                                        webkitFilter: null,
                                        opacity: null
                                    });
                                    for (key in buffTimes) buffTimes[key].target(0);
                                    time.start();
                                }
                                else {
                                    time.stop();
                                    view.css({
                                        webkitFilter: 'blur(10px)',
                                        opacity: 0.5
                                    });
                                    hud.add(pauseMenu);
                                    for (key in buffTimes) buffTimes[key].target(buffTimes[key].value());
                                }
                                paused = !paused;
                            };
                        })(),

                        enemies = dev.collection(),

                        players = dev.collection(),

                        game = joy.dynamicObject(function () {
                            // pause
                            (function () {
                                dev.element.get(window).on('keyup', onkeyup);
                                this.destroy(function () {
                                    dev.element.get(window).off('keyup', onkeyup);
                                });
                                function onkeyup(event) {
                                    if (event.which == 80) togglePause();
                                }
                            }).bind(this)();
                            var enemyUpdateListener = function (deltaTime) {
                                    if (!joy.utils.pointInRect(this.position(), viewRect)) {
                                        this.aim(players[Math.round(Math.random() * (players.length - 1))].position());
                                    }
                                    for (var enemy of enemies) if (enemy !== this && enemy.collidesWith(this)) {
                                        this.aim(enemy.position()).rotate(Math.PI);
                                        break;
                                    }
                                    for (var player of players)
                                        if (player.collidesWith(this)) gameOver();
                                },
                                enemyDestroyListener = function (deltaTime) { enemies.remove(this); },
                                buffPolygon = joy.polygon([-5, -5, 5, -5, 5, 5, -5, 5]).background(dev.color(foreground).a(0.7)),
                                buffChaseSpeed = 0.2,
                                spawnEnemy = (function () {
                                    var x = Math.random(),
                                        y = Math.round(Math.random()),
                                        health = dev.dynamicValue().value(function (value) {
                                            if (value === 0) {
                                                if (Math.random() < buffSpawnChance) {
                                                    game.add(
                                                        joy.dynamicObject()
                                                            .transformation(enemy.transformation())
                                                            .update(destroyIfOutOfView)
                                                            .update(function (deltaTime) {
                                                                for (var player of players)
                                                                    if (player.collidesWith(this)) {
                                                                        var buff = buffs[Math.floor(Math.random() * buffs.length)],
                                                                            buffTime = buffTimes[buff];
                                                                        buffTime.value(buffTime.value() + buffsTime)
                                                                            .target(1)
                                                                            .target(0);
                                                                        this.destroy();
                                                                        return false;
                                                                    }
                                                                    else if (player.distanceTo(this) < 100) {
                                                                        var transformation = player.relativeTo(this),
                                                                            x = transformation[0],
                                                                            y = transformation[1],
                                                                            distance = Math.sqrt(x * x + y * y),
                                                                            cosDirection = x / distance,
                                                                            sinDirection = y / distance;
                                                                        this.translate([
                                                                            cosDirection * deltaTime * buffChaseSpeed,
                                                                            sinDirection * deltaTime * buffChaseSpeed
                                                                        ]);
                                                                        break;
                                                                    }
                                                                this.forward(deltaTime * speed / 6);
                                                            })
                                                            .add(
                                                                joy.dynamicObject()
                                                                    .update(function (deltaTime) {
                                                                        this.rotate(deltaTime * 0.01);
                                                                    })
                                                                    .add(buffPolygon)
                                                            )
                                                    );
                                                }
                                                enemy.destroy();
                                                score.value(score.value() + 1);
                                            }
                                        }),
                                        speed = minEnemySpeed + enemySpeedRangeSize * Math.random(),
                                        enemy = (
                                            joy.dynamicObject()
                                                .update(function (deltaTime) { this.forward(deltaTime * speed * (buffTimes["Slow Enemies"].value() ? 0.2 : 1)); })
                                                .update(enemyUpdateListener)
                                                .add(
                                                    joy.circle(function () {
                                                        var radius = dev.animatedNumber().value((function (value) {
                                                                this.radius(value);
                                                            }).bind(this)).delta(0.1);
                                                        health.value((function (value) {
                                                            radius.target(minEnemyRadius + enemyRadiusRangeSize * value / maxEnemyHealth);
                                                        }).bind(this));
                                                    }).background(foreground)
                                                )
                                                .position(
                                                    Math.round(Math.random()) ?
                                                    [x * viewWidth, y * viewHeight] :
                                                    [y * viewWidth, x * viewHeight]
                                                )
                                                .rotate(Math.random() * Math.PI * 2)
                                                .destroy(enemyDestroyListener)
                                        );
                                    this.add(enemy);
                                    enemy.hit = function () {
                                        health.value(health.value() - 1);
                                    };
                                    health.value(1 + Math.round(Math.random() * (maxEnemyHealth - 1) * difficulty));
                                    enemies.add(enemy);
                                }).bind(this),
                                minDifficulty = 0.1,
                                difficultyRangeSize = 1 - minDifficulty,
                                difficulty = minDifficulty,
                                maxEnemyHealth = 30,
                                minEnemySpeed = 0.2,
                                maxEnemySpeed = 0.4,
                                enemySpeedRangeSize = maxEnemySpeed - minEnemySpeed,
                                minEnemyRadius = 15,
                                maxEnemyRadius = 75,
                                enemyRadiusRangeSize = maxEnemyRadius - minEnemyRadius,
                                spawnDelayTime = 500,
                                spawnDelay = 0,
                                maxEnemiesNum = 10,
                                buffSpawnChance = 0.15,
                                maxEnemies = 1;
                            setTimeout(function () {
                                score.value((function (value) {
                                    difficulty = minDifficulty + difficultyRangeSize * (1 - (1 / (1 + value / 30)));
                                    maxEnemies = Math.round(maxEnemiesNum * difficulty);
                                }).bind(this));
                            });
                            this.update(function (deltaTime) {
                                spawnDelay -= deltaTime;
                                if (spawnDelay < 0) {
                                    spawnDelay += spawnDelayTime;
                                    if (
                                        (Math.random() < difficulty &&
                                        enemies.length !== maxEnemies) ||
                                        enemies.length === 0
                                    ) spawnEnemy();
                                }
                            });
                        }),

                        score = dev.dynamicValue(0, function () {
                            var scoreSpan = dev.span('0').css('marginRight', '20px'),
                                recordSpan = dev.span('0'),
                                record = 0,
                                div = dev.div([
                                    'Score: ', scoreSpan,
                                    'Record: ', recordSpan
                                ]);
                            game.destroy(function () {
                                div.remove();
                            });
                            this.value(function (value) {
                                scoreSpan.text(value * 100);
                                if (value > record) recordSpan.text((record = value) * 100);
                            });
                            hud.add(div);
                        }),

                        buffTimes = (function () {
                            var buffsBox = dev.left().css({
                                    position: 'absolute',
                                    top: '100%',
                                    transform: 'translateY(-100%)'
                                }).appendTo(hud),
                                buffTimes = {};
                            game.destroy(function () {
                                buffsBox.remove();
                            });
                            buffs.forEach(function (buffName) {
                                var buffTime = dev.animatedNumber(0);
                                buffsBox.add(
                                    dev.div()
                                        .css('display', 'none')
                                        .css({
                                            position: 'relative',
                                            display: dev.dynamicValue(function () {
                                                buffTime.value((function (value) {
                                                    this.value(value ? 'block' : 'none');
                                                }).bind(this));
                                            })
                                        }).add(
                                            dev.div(buffName),
                                            dev.div().css({
                                                height: '3px',
                                                width: dev.dynamicValue(function () {
                                                    buffTime.value((function (value) {
                                                        this.value(value / buffsTime * buffsBarWidth + 'px');
                                                    }).bind(this));
                                                }),
                                                background: foreground,
                                                opacity: 0.3
                                            })
                                        )
                                );
                                buffTimes[buffName] = buffTime;
                            });
                            return buffTimes;
                        })(),

                        camera = joy.camera().update(function () {
                            this.drawView();
                        }).position(origin).appendTo(game),

                        view = camera.view().applyBehaviour(function () {
                            var element = this.element();
                            element.width = viewWidth;
                            element.height = viewHeight;
                        }).appendTo(gameWrapper),

                        spawnPlayer = (function () {
                            var moveListener = function () {
                                    var position = this.position(),
                                        x = position[0],
                                        y = position[1];
                                    if (x < 0) this.position([x = 0, y]);
                                    if (y < 0) this.position([x, y = 0]);
                                    if (x > viewWidth) this.position([viewWidth, y]);
                                    if (y > viewHeight) this.position([x, viewHeight]);
                                },
                                playerSpeed = 0.3;
                            return function (up, down, left, right, clockwise, counterClockwise) {
                                players.add(joy.dynamicObject(function () {
                                    // move player
                                    [
                                        ['forward', right],
                                        ['backward', left],
                                        ['leftward', down],
                                        ['rightward', up]
                                    ].forEach((function (item) {
                                        item[1].forEach((function (key) {
                                            var move = (
                                                    dev.animationFrameLoop()
                                                        .update((function (deltaTime) {
                                                            this[item[0]](deltaTime * playerSpeed);
                                                        }).bind(this))
                                                        .update(moveListener.bind(this))
                                                );
                                            dev.element.get(window)
                                                .on('keydown', onkeydown)
                                                .on('keyup', onkeyup);
                                            this.destroy(function () {
                                                dev.element.get(window)
                                                    .off('keydown', onkeydown)
                                                    .off('keyup', onkeyup);
                                            });
                                            function onkeydown(event) {
                                                if (event.key === key) move.start();
                                            }
                                            function onkeyup(event) {
                                                if (event.key === key) move.stop();
                                            }
                                        }).bind(this))
                                    }).bind(this));
                                    this.position(camera.position()).add(
                                        joy.dynamicObject(function () {
                                            var coolDownTime = 70,
                                                coolDown = 0,
                                                bulletSpeed = 0.5,
                                                bulletChaseRotationSpeed = 0.005,
                                                bulletUpdateListener = function (deltaTime) {
                                                    this.forward(deltaTime * bulletSpeed);
                                                    var enemy;
                                                    if (buffTimes["Follow Enemies"].value()) {
                                                        var closestEnemyDistance = Infinity,
                                                            closestEnemy,
                                                            distance;
                                                        for (enemy of enemies) {
                                                            distance = enemy.distanceTo(this);
                                                            if (distance < closestEnemyDistance) {
                                                                closestEnemyDistance = distance;
                                                                closestEnemy = enemy;
                                                            }
                                                        }
                                                        if (closestEnemy) {
                                                            this.rotate(
                                                                (closestEnemy.relativeTo(this)[1] > 0 ? 1 : -1) *
                                                                deltaTime *
                                                                bulletChaseRotationSpeed
                                                            );
                                                        }
                                                    }
                                                    [...enemies].forEach((enemy) => {
                                                        if (this.collidesWith(enemy)) {
                                                            const explosionCircle = joy.circle().background(foreground.clone().a(0.2));
                                                            joy.dynamicObject()
                                                                .appendTo(game)
                                                                .position(this.position())
                                                                .add(explosionCircle)
                                                                .update(function (deltaTime) {
                                                                    const r = (explosionCircle.radius() || 0) + 0.1 * deltaTime;
                                                                    const a = Math.max(explosionCircle.background().a() - 0.0005 * deltaTime, 0);
                                                                    if (a === 0) this.destroy();
                                                                    else {
                                                                        explosionCircle
                                                                            .radius(r)
                                                                            .background().a(a);
                                                                    }
                                                                });
                                                            this.destroy();
                                                            enemy.hit();
                                                            if (buffTimes["Double Damage"].value()) enemy.hit();
                                                        }
                                                    });
                                                    if (!joy.utils.pointInRect(this.position(), viewRect)) {
                                                        if (buffTimes["Bouncing Bullets"].value()) {
                                                            var transformation = this.transformation(),
                                                                x = transformation[0],
                                                                y = transformation[1],
                                                                cos = transformation[2],
                                                                sin = transformation[3];
                                                            if (
                                                                (x < 0 && cos < 0) ||
                                                                (x > viewWidth && cos > 0)
                                                            ) this.rotation([cos = -cos, sin]);
                                                            if (
                                                                (y < 0 && sin < 0) ||
                                                                (y > viewHeight && sin > 0)
                                                            ) this.rotation([cos, -sin]);
                                                        }
                                                        else {
                                                            this.destroy();
                                                            return false;
                                                        }
                                                    }
                                                },
                                                bulletPoly = (
                                                    joy.polygon([
                                                        -3, 0,
                                                        3, 0
                                                    ], function () {
                                                        var normal = dev.color(foreground).a(0.7),
                                                            bold = foreground;
                                                        this.stroke(normal);
                                                        buffTimes["Double Damage"].value((function (value) {
                                                            this.stroke(value ? bold : normal);
                                                        }).bind(this));
                                                    })
                                                ),
                                                rotationSpeed = 0.005;
                                            [
                                                [clockwise, 1],
                                                [counterClockwise, -1]
                                            ].forEach((function (item) {
                                                item[0].forEach((function (key) {
                                                    var rotate = dev.animationFrameLoop().update((function (deltaTime) {
                                                            this.rotate(item[1] * deltaTime * rotationSpeed);
                                                        }).bind(this));
                                                    dev.element.get(window)
                                                        .on('keydown', function (event) {
                                                            if (event.key === key) rotate.start();
                                                        })
                                                        .on('keyup', function (event) {
                                                            if (event.key === key) rotate.stop();
                                                        });
                                                }).bind(this));
                                            }).bind(this));
                                            this.update(function (deltaTime) {
                                                coolDown -= deltaTime;
                                                if (coolDown < 0) {
                                                    coolDown += coolDownTime * (buffTimes["Rapid Fire"].value() ? 0.5 : 1);
                                                    var ind = buffTimes["Triple Fire"].value() ? 3 : 1,
                                                        bullet;
                                                    while (ind--) {
                                                        var handler = buffTimes["Double Fire"].value(),
                                                            ind1 = handler ? 2 : 1;
                                                        while (ind1--) {
                                                            bullet = (
                                                                joy.dynamicObject()
                                                                    .transformation(this.absoluteTransformation())
                                                                    .update(bulletUpdateListener)
                                                                    .add(bulletPoly)
                                                            );
                                                            switch (ind) {
                                                                case 1:
                                                                    bullet.rotate(Math.PI / 8);
                                                                    break;
                                                                case 2:
                                                                    bullet.rotate(-Math.PI / 8);
                                                            }
                                                            if (handler) {
                                                                if (ind1) bullet.leftward(3);
                                                                else bullet.rightward(3);
                                                            }
                                                            game.add(bullet);
                                                        }
                                                    }
                                                }
                                            });
                                        }).add(
                                            joy.polygon([
                                                0, -3,
                                                6 ,0,
                                                0, 3
                                            ]).background(foreground)
                                        ),
                                        joy.circle()
                                            .background(foreground)
                                            .radius(3)
                                    ).appendTo(game);
                                }));
                            };
                        })(),

                        time = dev.animationFrameLoop().update(
                            game.update.bind(game)
                        ).start();

                    spawnPlayer(['w', 'ArrowUp'], ['s', 'ArrowDown'], ['a', 'ArrowLeft'], ['d', 'ArrowRight'], ['e'], ['q']);

                    var firstPlayer = players[0],
                    	cameraView = camera.view();

                    cameraView.on('mousemove', onmousemove);

                    function onmousemove (event) {
                        const rect = cameraView.rect();
                        const pos = camera.pointInSpace([event.clientX - rect.left, event.clientY - rect.top]);
                        firstPlayer[0].aim(pos);
                    }

                    firstPlayer.destroy(function () {
                    	cameraView.off("mousemove", onmousemove);
                    });

                }
            ],
            [
                'Info',
                (function () {
                    var about = dev.centered(
                            dev.inline().css({
                                pointerEvents: 'all',
                                textAlign: 'left'
                            }).add(
                                dev.div('SMOC').css('fontSize', '25px'),
                                dev.div().css('padding', '20px 0').add(
                                    dev.div(['Game developed by ', dev.b('Nicola Fiori'), '.']),
                                    dev.div(['Using ', dev.b('HTML5'), ' and ', dev.b(['javascript']), ',']),
                                    dev.div(['based on the ', dev.b('game engine Joy2D'), ' and the ', dev.b('Deviser.js library'), '.'])
                                ),
                                dev.right(
                                    dev.inline('Main menu', buttonBehaviour).click(function () {
                                        about.replaceWith(mainMenu);
                                    }).css('padding', '5px')
                                )
                            )
                        );
                    return function () { mainMenu.replaceWith(about); };
                })()
            ]
        ]).css('pointerEvents', 'all'),
        createKeyBindingsInfo()
    ]);
if (isPhone) {
    hud.add(mainMenu);
}
else {
    gameWrapper.add(
        // run intro
        dev.canvas2D(function () {
            var element = this.element();
            element.width = viewHeight;
            element.height = viewHeight;
            runIntro(this.context(), (function () {
                setTimeout((function () {
                    // intro finished, show main menu
                    this.remove();
                    hud.add(mainMenu);
                }).bind(this), 1000);
            }).bind(this));
        })
    );
}
