(() => {
	// plugins
	Matter.use(MatterAttractors);

	// constants
	const AUDIO = {
		BANG01: new Audio('../bang01.mp3'),
		BING01: new Audio('../bing01.mp3'),
		BING02: new Audio('../bing02.mp3'),
		BING03: new Audio('../bing03.mp3'),
		BONG01: new Audio('../bong01.mp3'),
		BING_TOILET: new Audio('../bing_toilet.mp3'),
		KIDNAP_BABY: new Audio('../kidnap_baby.mp3'),
		HAVE_CHINA: new Audio('../have_china.mp3'),
		CHINA_LEARN: new Audio('../china_learn_china.mp3'),
		ASIAN_BABY: new Audio('../asian_baby.mp3'),
		POLITICAL_CORRECTNESS: new Audio('../political_correctness.mp3'),
		PUPPETS: new Audio('../puppets.mp3'),
		WOMAN_BABY: new Audio('../woman_baby.mp3'),
		BING_END: new Audio('../bing_end.mp3'),
		BING_ROCKET: new Audio('../bing_rocketship.mp3'),
		BING_TACKLE: new Audio('../bing_tackle.mp3'),
		CHINA: new Audio('../CHINA.mp3'),
		AXIOS_LAST: new Audio('../axios_last_first.mp3'),
		YOSEMITE: new Audio('../yosemite.mp3'),
		SIR: new Audio('../sir.mp3'),
		PWMCT: new Audio('../PWMCT.mp3'),
		PUTIN: new Audio('../putin.mp3')
	}

	const PATHS = {
		DOME: '0 0 0 250 19 250 20 231.9 25.7 196.1 36.9 161.7 53.3 129.5 74.6 100.2 100.2 74.6 129.5 53.3 161.7 36.9 196.1 25.7 231.9 20 268.1 20 303.9 25.7 338.3 36.9 370.5 53.3 399.8 74.6 425.4 100.2 446.7 129.5 463.1 161.7 474.3 196.1 480 231.9 480 250 500 250 500 0 0 0',
		DROP_LEFT: '0 0 20 0 70 100 20 150 0 150 0 0',
		DROP_RIGHT: '50 0 68 0 68 150 50 150 0 100 50 0',
		APRON_LEFT: '0 0 180 120 0 120 0 0',
		APRON_RIGHT: '180 0 180 120 0 120 180 0',
	};

	const COLOR = {
		BACKGROUND: '../Baby_Trump_BG_credits.png',
		OUTER: '#963524',
		INNER: '#963524',
		BUMPER: '#fab005',
		BUMPER_LIT: '#fff3bf',
		PADDLE: '#bcbcbc',
		PINBALL: '#dee2e6'
	};
	const GRAVITY = 0.75;
	const WIREFRAMES = false;
	const BUMPER_BOUNCE = 1.5;
	const PADDLE_PULL = 0.002;
	const MAX_VELOCITY = 50;
	const initialBumperCount = 3;

	//regulates bumper audio
	let bumperCount = initialBumperCount;
	const bumperTimer = setInterval(() => {
		bumperCount = bumperCount < initialBumperCount ? bumperCount + 1 : bumperCount;
	}, 333);


	// score elements
	let $currentScore = $('.current-score span');
	let $highScore = $('.high-score span');

	// shared variables
	let currentScore, highScore;
	let engine, world, render, pinball, stopperGroup;
	let leftPaddle, leftUpStopper, leftDownStopper, isLeftPaddleUp;
	let rightPaddle, rightUpStopper, rightDownStopper, isRightPaddleUp;

	function load() {
		init();
		createStaticBodies();
		createPaddles();
		createPinball();
		createEvents();
	}

	function init() {
		// engine (shared)
		engine = Matter.Engine.create();

		// world (shared)
		world = engine.world;
		world.bounds = {
			min: { x: 0, y: 0},
			max: { x: 800, y: 1100 }
		};
		world.gravity.y = GRAVITY; // simulate rolling on a slanted table

		// render (shared)
		render = Matter.Render.create({
			element: $('.container')[0],
			engine: engine,
			options: {
				width: world.bounds.max.x,
				height: world.bounds.max.y,
				wireframes: WIREFRAMES,
				background: COLOR.BACKGROUND
			},
		});
		Matter.Render.run(render);

		// runner
		let runner = Matter.Runner.create();
		Matter.Runner.run(runner, engine);

		// used for collision filtering on various bodies
		stopperGroup = Matter.Body.nextGroup(true);

		// starting values
		currentScore = 0;
		highScore = 0;
		isLeftPaddleUp = false;
		isRightPaddleUp = false;
	}

	function createStaticBodies() {
		Matter.World.add(world, [

			// side bumpers (left, right)
			sideBumper(60, 470, PATHS.DROP_LEFT.split(' ').map(val => {
				return (parseFloat(val) * 1.15).toString();}).join(' ')),
			sideBumper(657, 470, PATHS.DROP_RIGHT.split(' ').map(val => {
				return (parseFloat(val) * 1.15).toString();}).join(' ')),

			path(60, 473, PATHS.DROP_LEFT.split(' ').map(val => {
				return (parseFloat(val) * 1.1).toString();}).join(' ')),
			path(657, 473, PATHS.DROP_RIGHT.split(' ').map(val => {
				return (parseFloat(val) * 1.1).toString();}).join(' ')),

			// dome
			path(380, 120, PATHS.DOME.split(' ').map(val => {
				return (parseFloat(val) * 1.5).toString();}).join(' ')),

			// table boundaries (top, bottom, left, right)
			boundary(250, -100, 500, 100),
			boundary(250, 1050, 1100, 100),
			boundary(5, 500, 100, 1100),
			boundary(790, 500, 100, 1100),



			// pegs (left, mid, right)
			wall(250, 170, 18, 80, COLOR.INNER),
			wall(375, 170, 18, 80, COLOR.INNER),
			wall(500, 170, 18, 80, COLOR.INNER),

			// top bumpers (left, mid, right)
			bumper1(255, 280),
			bumper2(375, 280),
			bumper3(495, 280),

			// bottom bumpers (left, right)
			bumper4(315, 380),
			bumper5(435, 380),

			// shooter lane wall
			wall(675, 750, 22, 850, COLOR.OUTER),

			// slingshots (left, right)
			wall(200, 675, 20, 150, COLOR.INNER),
			wall(520, 675, 20, 150, COLOR.INNER),

			// out lane walls (left, right)
			wall(120, 690, 20, 175, COLOR.INNER),
			wall(600, 690, 20, 175, COLOR.INNER),

			// flipper walls (left, right);
			wall(180, 810, 20, 150, COLOR.INNER, -0.96),
			wall(545, 810, 20, 150, COLOR.INNER, 0.96),

			// reset zones (center, right)
			reset(358, 600),
			reset(712.5, 55),

			//reset zones (out of bounds)
			resetTop(400, 1000),
			resetLeft(25, 1120),
			resetRight(775, 1120),
			resetLeftCorner(100, 400),
			resetRightCorner(700, 400),

			// aprons (left, right)
			path(145, 970, PATHS.APRON_LEFT.split(' ').map(val => {
				return (parseFloat(val) * 1.5).toString();}).join(' ')),
			path(577, 970, PATHS.APRON_RIGHT.split(' ').map(val => {
				return (parseFloat(val) * 1.5).toString();}).join(' '))
		]);
	}

	function createPaddles() {
		// these bodies keep paddle swings contained, but allow the ball to pass through
		leftUpStopper = stopper(550, 600, 'left', 'up');
		leftDownStopper = stopper(500, 1000, 'left', 'down');
		rightUpStopper = stopper(200, 600, 'right', 'up');
		rightDownStopper = stopper(150, 1050, 'right', 'down');
		Matter.World.add(world, [leftUpStopper, leftDownStopper, rightUpStopper, rightDownStopper]);

		// this group lets paddle pieces overlap each other
		let paddleGroup = Matter.Body.nextGroup(true);

		// Left paddle mechanism
		let paddleLeft = {};
		paddleLeft.paddle = Matter.Bodies.trapezoid(280, 660, 20, 110, 0.33, {
			label: 'paddleLeft',
			angle: 1.57,
			chamfer: {},
			render: {
				fillStyle: COLOR.PADDLE
			}
		});
		paddleLeft.brick = Matter.Bodies.rectangle(280, 672, 60, 100, {
			angle: 1.57,
			chamfer: {},
			render: {
				visible: false
			}
		});
		paddleLeft.comp = Matter.Body.create({
			label: 'paddleLeftComp',
			parts: [paddleLeft.paddle, paddleLeft.brick]
		});
		paddleLeft.hinge = Matter.Bodies.circle(238, 850, 5, {
			isStatic: true,
			render: {
				visible: false
			}
		});
		Object.values(paddleLeft).forEach((piece) => {
			piece.collisionFilter.group = paddleGroup
		});
		paddleLeft.con = Matter.Constraint.create({
			bodyA: paddleLeft.comp,
			pointA: { x: -39.5, y: -8.5 },
			bodyB: paddleLeft.hinge,
			length: 0,
			stiffness: 0
		});
		Matter.World.add(world, [paddleLeft.comp, paddleLeft.hinge, paddleLeft.con]);
		Matter.Body.rotate(paddleLeft.comp, 0.57, { x: 142, y: 660 });

		// right paddle mechanism
		let paddleRight = {};
		paddleRight.paddle = Matter.Bodies.trapezoid(280, 660, 20, 110, 0.33, {
			label: 'paddleRight',
			angle: -1.57,
			chamfer: {},
			render: {
				fillStyle: COLOR.PADDLE
			}
		});
		paddleRight.brick = Matter.Bodies.rectangle(278, 672, 60, 100, {
			angle: -1.57,
			chamfer: {},
			render: {
				visible: false
			}
		});
		paddleRight.comp = Matter.Body.create({
			label: 'paddleRightComp',
			parts: [paddleRight.paddle, paddleRight.brick]
		});
		paddleRight.hinge = Matter.Bodies.circle(485, 850, 5, {
			isStatic: true,
			render: {
				visible: false
			}
		});
		Object.values(paddleRight).forEach((piece) => {
			piece.collisionFilter.group = paddleGroup
		});
		paddleRight.con = Matter.Constraint.create({
			bodyA: paddleRight.comp,
			pointA: { x: 39.5, y: -8.5 },
			bodyB: paddleRight.hinge,
			length: 0,
			stiffness: 0
		});
		Matter.World.add(world, [paddleRight.comp, paddleRight.hinge, paddleRight.con]);
		Matter.Body.rotate(paddleRight.comp, -0.57, { x: 308, y: 660 });
	}

	function createPinball() {
		// x/y are set to when pinball is launched
		pinball = Matter.Bodies.circle(0, 0, 23, {
			label: 'pinball',
			collisionFilter: {
				group: stopperGroup
			},
			render: {
				fillStyle: COLOR.PINBALL,
				sprite: {
					xScale:0.08,
					yScale: 0.08,
					texture: '../republican_pinball.png'
				}
			}
		});
		Matter.World.add(world, pinball);
		launchPinball();
	}

	function createEvents() {
		// events for when the pinball hits stuff
		Matter.Events.on(engine, 'collisionStart', function(event) {
			let pairs = event.pairs;
			pairs.forEach(function(pair) {
				if (pair.bodyB.label === 'pinball') {
					switch (pair.bodyA.label) {
						case 'reset':
							launchPinball();
							resetPing();
							break;
						case 'resetTop':
							launchPinballKeepScore();
							break;
						case 'resetLeft':
							launchPinballKeepScore();
							break;
						case 'resetRight':
							launchPinballKeepScore();
							break;
						case 'resetRightCorner':
							launchPinballKeepScore();
							break;
						case 'resetLeftCorner':
							launchPinballKeepScore();
							break;
						case 'bumper':
							pingBumper(pair.bodyA);
							break;
						case 'sideBumper':
							pingSideBumper(pair.bodyA);
							break;
					}
				}
			});
		});

		// regulate pinball
		Matter.Events.on(engine, 'beforeUpdate', function(event) {
			// bumpers can quickly multiply velocity, so keep that in check
			Matter.Body.setVelocity(pinball, {
				x: Math.max(Math.min(pinball.velocity.x, MAX_VELOCITY), -MAX_VELOCITY),
				y: Math.max(Math.min(pinball.velocity.y, MAX_VELOCITY), -MAX_VELOCITY),
			});

			// cheap way to keep ball from going back down the shooter lane
			if (pinball.position.x > 700 && pinball.velocity.y > 0) {
				Matter.Body.setVelocity(pinball, { x: 0, y: -10 });
			}
		});

		// mouse drag (god mode for grabbing pinball)
		Matter.World.add(world, Matter.MouseConstraint.create(engine, {
			mouse: Matter.Mouse.create(render.canvas),
			constraint: {
				stiffness: 0.2,
				render: {
					visible: false
				}
			}
		}));

		// keyboard paddle events
		$('body').on('keydown', function(e) {
			if (e.which === 37) { // left arrow key
				isLeftPaddleUp = true;
			} else if (e.which === 39) { // right arrow key
				isRightPaddleUp = true;
			}
		});
		$('body').on('keyup', function(e) {
			if (e.which === 37) { // left arrow key
				isLeftPaddleUp = false;
			} else if (e.which === 39) { // right arrow key
				isRightPaddleUp = false;
			}
		});

		// click/tap paddle events
		$('.left-trigger')
			.on('mousedown touchstart', function(e) {
				isLeftPaddleUp = true;
			})
			.on('mouseup touchend', function(e) {
				isLeftPaddleUp = false;
			});
		$('.right-trigger')
			.on('mousedown touchstart', function(e) {
				isRightPaddleUp = true;
			})
			.on('mouseup touchend', function(e) {
				isRightPaddleUp = false;
			});
	}

	function launchPinball() {
		updateScore(0);
		Matter.Body.setPosition(pinball, { x: 725, y: 950 });
		Matter.Body.setVelocity(pinball, { x: 0, y: -50 + rand(-5, 5) });
		Matter.Body.setAngularVelocity(pinball, 0);
	}

	function launchPinballKeepScore() {
		Matter.Body.setPosition(pinball, { x: 725, y: 950 });
		Matter.Body.setVelocity(pinball, { x: 0, y: -50 + rand(-5, 5) });
		Matter.Body.setAngularVelocity(pinball, 0);
	}

	function pingBumper(bumper) {
		updateScore(currentScore + 10);

		// expands & retracts bumper heads
		bumper.render.sprite.xScale = .24;
		bumper.render.sprite.yScale = .26;
		bumper.audio.play();
		setTimeout(function () {
			bumper.render.sprite.xScale = .2;
			bumper.render.sprite.yScale = .22;
		}, 100);
		bumperCount--;

	}

	function pingSideBumper(sideBumper) {
		updateScore(currentScore + 5);
		// flash color & randomizes sfx
		sideBumper.render.fillStyle = COLOR.BUMPER_LIT;
		if (initialBumperCount >= 3) {
			let random = (Math.floor(Math.random() * 10) + 1);
			if (random >= 9) {
				AUDIO.KIDNAP_BABY.play();
			} else if (random >= 8) {
				AUDIO.CHINA.play();
			} else if (random >= 7) {
				AUDIO.SIR.play();
			} else if (random >= 6) {
				AUDIO.BING_TACKLE.play();
			} else if (random >= 5) {
				AUDIO.WOMAN_BABY.play();
			}else if (random >= 4) {
				AUDIO.CHINA_LEARN.play();
			}else if (random >= 3) {
				AUDIO.PUTIN.play();
			}else if (random >= 2) {
				AUDIO.PUPPETS.play();
			}else {
				AUDIO.POLITICAL_CORRECTNESS.play();
			}
		}
		setTimeout(function() {
			sideBumper.render.fillStyle = COLOR.BUMPER;
		}, 100);
	}

	function updateScore(newCurrentScore) {
		currentScore = newCurrentScore;
		$currentScore.text(currentScore);

		highScore = Math.max(currentScore, highScore);
		$highScore.text(highScore);
	}

	// matter.js has a built in random range function, but it is deterministic
	function rand(min, max) {
		return Math.random() * (max - min) + min;
	}

	// outer edges of pinball table
	function boundary(x, y, width, height) {
		return Matter.Bodies.rectangle(x, y, width, height, {
			isStatic: true,
			render: {
				fillStyle: COLOR.OUTER
			}
		});
	}

	// wall segments
	function wall(x, y, width, height, color, angle = 0) {
		return Matter.Bodies.rectangle(x, y, width, height, {
			angle: angle,
			isStatic: true,
			chamfer: { radius: 10 },
			render: {
				fillStyle: color
			}
		});
	}

	// bodies created from SVG paths
	function path(x, y, path) {
		let vertices = Matter.Vertices.fromPath(path);
		return Matter.Bodies.fromVertices(x, y, vertices, {
			isStatic: true,
			render: {
				fillStyle: COLOR.OUTER,

				// add stroke and line width to fill in slight gaps between fragments
				strokeStyle: COLOR.OUTER,
				lineWidth: 1
			}
		});
	}

	//Bodies that repel pinball

	//McConnell Bumper
	function bumper1(x, y,) {
		let bumper01 = Matter.Bodies.circle(x, y, 25, {
			label: 'bumper',
			isStatic: true,
			render: {
				fillStyle: COLOR.BUMPER,
				sprite:{
					xScale: .22,
					yScale: .22,
					texture: '../McConnell_head_fixed_2.png'
				}

			},
			audio:AUDIO.BING02
		});

		// for some reason, restitution is reset unless it's set after body creation
		bumper01.restitution = BUMPER_BOUNCE;

		return bumper01;
	}
	// Pence Bumper
	function bumper2(x, y,) {
		let bumper02 = Matter.Bodies.circle(x, y, 25, {
			label: 'bumper',
			isStatic: true,
			render: {
				fillStyle: COLOR.BUMPER,
				sprite:{
					xScale: .2,
					yScale: .22,
					texture: '../Pence_head_fixed_2.png'
				}

			},
			audio:AUDIO.BING01
		});

		// for some reason, restitution is reset unless it's set after body creation
		bumper02.restitution = BUMPER_BOUNCE;

		return bumper02;
	}

	// Barr Bumper
	function bumper3(x, y,) {
		let bumper03 = Matter.Bodies.circle(x, y, 25, {
			label: 'bumper',
			isStatic: true,
			render: {
				fillStyle: COLOR.BUMPER,
				sprite:{
					xScale: .2,
					yScale: .22,
					texture: '../Barr_head_2.png'
				}

			},
			audio:AUDIO.BONG01
		});

		// for some reason, restitution is reset unless it's set after body creation
		bumper03.restitution = BUMPER_BOUNCE;

		return bumper03;
	}

	// Collins Bumper
	function bumper4(x, y,) {
		let bumper04 = Matter.Bodies.circle(x, y, 25, {
			label: 'bumper',
			isStatic: true,
			render: {
				fillStyle: COLOR.BUMPER,
				sprite:{
					xScale: .2,
					yScale: .22,
					texture: '../Collings_mid_head_fixed.png'
				}

			},
			audio:AUDIO.BING03

		});

		// for some reason, restitution is reset unless it's set after body creation
		bumper04.restitution = BUMPER_BOUNCE;

		return bumper04;
	}

	// Gaetz Bumper
	function bumper5(x, y,) {
		let bumper05 = Matter.Bodies.circle(x, y, 25, {
			label: 'bumper',
			isStatic: true,
			render: {
				fillStyle: COLOR.BUMPER,
				sprite:{
					xScale: .2,
					yScale: .22,
					texture: '../Gaetz_head_3.png'
				}

			},
			audio:AUDIO.BANG01
		});

		// for some reason, restitution is reset unless it's set after body creation
		bumper05.restitution = BUMPER_BOUNCE;

		return bumper05;
	}

	function sideBumper(x, y, path) {
		let bumperVertices = Matter.Vertices.fromPath(path);
		let bumperSide = Matter.Bodies.fromVertices(x, y, bumperVertices, {
			label: 'sideBumper',
			isStatic: true,
			render: {
				fillStyle: COLOR.BUMPER
			},
		});

		bumperSide.restitution = BUMPER_BOUNCE;

		return bumperSide;
	}

	// invisible bodies to constrict paddles
	function stopper(x, y, side, position) {
		// determine which paddle composite to interact with
		let attracteeLabel = (side === 'left') ? 'paddleLeftComp' : 'paddleRightComp';

		return Matter.Bodies.circle(x, y, 40, {
			isStatic: true,
			render: {
				visible: false,
			},
			collisionFilter: {
				group: stopperGroup
			},
			plugin: {
				attractors: [
					// stopper is always a, other body is b
					function(a, b) {
						if (b.label === attracteeLabel) {
							let isPaddleUp = (side === 'left') ? isLeftPaddleUp : isRightPaddleUp;
							let isPullingUp = (position === 'up' && isPaddleUp);
							let isPullingDown = (position === 'down' && !isPaddleUp);
							if (isPullingUp || isPullingDown) {
								return {
									x: (a.position.x - b.position.x) * PADDLE_PULL,
									y: (a.position.y - b.position.y) * PADDLE_PULL,
								};
							}
						}
					}
				]
			}
		});
	}
	// plays audio when ball is reset
	function resetPing(reset) {
		reset = (Math.floor(Math.random() * 10) + 1);
			if (reset >= 8) {
				AUDIO.BING_TOILET.play();
			} else if (reset >= 6) {
				AUDIO.AXIOS_LAST.play();
			} else if (reset >= 4) {
				AUDIO.BING_END.play();
			} else if (reset >= 2) {
				AUDIO.BING_ROCKET.play();
			} else {
				AUDIO.PWMCT.play();
			}
		}


	// contact with these bodies causes pinball to be relaunched
	function reset(x, width) {
		return Matter.Bodies.rectangle(x, 1000, width, 2, {
			label: 'reset',
			isStatic: true,
			render: {
				fillStyle: '#fff'
			},
		});
	}

	function resetTop(x, width) {
		return Matter.Bodies.rectangle(x, 5, width, 8, {
			label: 'resetTop',
			isStatic: true,
			render: {
				visible: false,
				fillStyle: '#fff'
			}
		});
	}

	function resetLeft(x, width) {
		return Matter.Bodies.rectangle(x, 550, width, 20, {
			label: 'resetLeft',
			isStatic: true,
			angle: 1.555,
			render: {
				visible: false,
				fillStyle: '#fff'
			}
		});
	}

	function resetRight(x, width) {
		return Matter.Bodies.rectangle(x, 550, width, 20, {
			label: 'resetRight',
			isStatic: true,
			angle: 1.555,
			render: {
				visible: false,
				fillStyle: '#fff'
			}
		});
	}

	function resetLeftCorner(x, width) {
		return Matter.Bodies.rectangle(x, 150, width, 20, {
			label: 'resetLeftCorner',
			isStatic: true,
			angle: 14.8,
			render: {
				visible: false,
				fillStyle: '#fff'
			}
		});
	}

	function resetRightCorner(x, width) {
		return Matter.Bodies.rectangle(x, 150, width,20, {
			label: 'resetRightCorner',
			isStatic: true,
			angle: -14.8,
			render: {
				visible: false,
				fillStyle: '#fff'
			}
		});
	}

	window.addEventListener('load', load, false);
})();