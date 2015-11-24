function Game()
{
	this.stage = new createjs.Stage(canvas);

	this.background = new createjs.Bitmap(preload.getResult("background"));

	this.planetManager = new PlanetManager();

	this.ship = new Ship();

	this.particleManager = new ParticleManager();

	this.transitionStartTime = 2;
	this.transitionMidTime = 1;
	this.transitionEndTime = 1;
	this.transitionTotalTime = this.transitionStartTime + this.transitionMidTime + this.transitionEndTime;
	this.transitionElapsed = 0;
	this.bkgMoveRate = -7;
	this.planetsMoveRate = -1500;
	this.transitioning = false;
	this.nextLevelMade = false;
	this.lastShipPos = new Vector(0,0);
	this.nextShipPos = new Vector(0,0);

	this.cheated = false;

	this.minLaunchLength = 10;
	this.maxLaunchLength = 250;
	this.maxLaunchPower = 350;
	this.minLaunchProp = this.minLaunchLength / this.maxLaunchLength;
	this.minLaunchPower = this.minLaunchProp*this.maxLaunchPower;

	this.levelType = "scan";
	this.scanRequired = 0;

	this.probeManager = new ProbeManager(this.minLaunchPower, this.maxLaunchPower, this.minLaunchProp,
										 this.particleManager);

	this.UI = new UI(this.minLaunchLength, this.maxLaunchLength);
	this.swipe = new Swipe();

	// Initial level setup

	this.setupLevel();

	this.dustEmitter = undefined;

	this.setupParticles();
	this.ship.moveTo(this.nextShipPos.clone());

	this.setStage();	
}

Game.prototype.Update = function(delta) {
	if (this.transitioning)	{
		this.moveToNextLevel(delta);
		this.stage.update();
		return;
	}

	this.swipe.Update();

	if (this.swipe.complete)	{
		if (this.swipe.swipeLength >= this.minLaunchLength)	{
			var launchVec = this.swipe.swipeVec;
			var power = Math.min(this.swipe.swipeLength,this.maxLaunchLength) / this.maxLaunchLength
			this.probeManager.spawnProbe(this.ship.position, toDeg(angleToY(launchVec)), 
											power, this.planetManager);
			this.UI.updateText( 0, 1, 0, 0);
			this.UI.setActiveBar(this.probeManager.quantizeLaunchPower(power));
			this.UI.setRadialBar(toDeg(angleToY(launchVec)));
			var out = this.planetManager.integratePath(this.probeManager.probeList[this.probeManager.probeList.length-1].position, 
											this.probeManager.probeList[this.probeManager.probeList.length-1].velocity,
											2,300, true);
		}	else {
			this.probeManager.stopOrKillProbe();
		}
		// this.UI.drawPath(out.path, 1);
	}

	this.UI.Update(delta, this.swipe, this.probeManager);

	if ( this.UI.cheatDown )	{
		this.probeManager.spawnProbe(this.ship.position, this.planetManager.solutionAngle, 
									this.planetManager.solutionForce, this.planetManager);
		this.UI.setCheatBar(this.planetManager.solutionForce);
		this.UI.setRadialBarCheat(this.planetManager.solutionAngle);
		this.cheated = true;
	}

	this.probeManager.Update(delta, this.planetManager);
	this.planetManager.Update(delta);
	if (this.levelType == "mine")	{
		if (this.planetManager.remake)	{
			this.transitioning = true;
		}
	}	else if (this.levelType == "scan")	{
		if (this.probeManager.checkScans())	{
			this.transitioning = true;
		}
	}

	this.particleManager.update(delta, this.probeManager.camRect);

	this.stage.update();
};

Game.prototype.tick = function(evt)	{
	this.Update(TIMESTEP);
	mouse.last = mouse.down;
};

Game.prototype.setStage = function()	{
	this.stage.addChild(this.background);
	this.stage.addChild(this.particleManager.subStage);
	this.stage.addChild(this.planetManager.stage);
	this.stage.addChild(this.ship.sprite);
	this.stage.addChild(this.probeManager.stage);
	this.stage.addChild(this.particleManager.superStage);
	this.stage.addChild(this.UI.stage);

	if (DEBUG)	{
		this.stage.addChild(this.probeManager.dbgShape);
		this.stage.addChild(this.planetManager.dbgShape);
	}
};

Game.prototype.setupParticles = function()	{
	this.dustEmitterRight = this.particleManager.addEmitterByType("dustCloud", new createjs.Rectangle(canvas.width, 0, 10, canvas.height),
										  new Vector(-100, -50), new Vector(-10, 50), {pm:this.planetManager});
	this.dustEmitterTop = this.particleManager.addEmitterByType("dustCloud", new createjs.Rectangle(0, -10, canvas.width, 10),
										  new Vector(-50, 10), new Vector(50, 100), {pm:this.planetManager});
	this.dustEmitterLeft = this.particleManager.addEmitterByType("dustCloud", new createjs.Rectangle(-10, 0, 10, canvas.height),
										  new Vector(10, -50), new Vector(100, 50), {pm:this.planetManager});
	this.dustEmitterBottom = this.particleManager.addEmitterByType("dustCloud", new createjs.Rectangle(0, canvas.height, canvas.width, 10),
										  new Vector(-50, -100), new Vector(50, -10), {pm:this.planetManager});
	this.dustEmitterTrail = this.particleManager.addEmitterByType("dustCloudTrail", new createjs.Rectangle(canvas.width, 0, 10, canvas.height),
										  new Vector(-100, -100), new Vector(-10, 100));
	this.dustEmitterTrail.canEmit = false;
}

Game.prototype.moveToNextLevel = function(delta)	{
	this.transitionElapsed += delta;
	this.probeManager.markers = false;

	this.dustEmitterRight.canEmit = false;
	this.dustEmitterTop.canEmit = false;
	this.dustEmitterLeft.canEmit = false;
	this.dustEmitterBottom.canEmit = false;
	this.dustEmitterTrail.canEmit = true;

	if (this.transitionElapsed >= this.transitionTotalTime)	{
		this.transitioning = false;
		this.transitionElapsed = 0;
		this.planetManager.stage.x = 0;
		this.probeManager.stage.x = 0;
		this.background.x += this.bkgMoveRate * delta;
		this.nextLevelMade = false;
		this.UI.applyProbesHere();
		if (this.cheated)	{
			this.UI.updateText(0,0,0,1);
		}	else 	{
			this.UI.updateText(0,0,1,0);
		}
		this.cheated = false;
		this.probeManager.markers = true;

		this.dustEmitterRight.canEmit = true;
		this.dustEmitterTop.canEmit = true;
		this.dustEmitterLeft.canEmit = true;
		this.dustEmitterBottom.canEmit = true;
		this.dustEmitterTrail.canEmit = false;

		saveGame.updateSave(this.UI.launched, this.UI.passed, this.UI.skipped, this.background.x);
		return;
	}

	var globalMove = this.bkgMoveRate * delta;
	
	if (this.transitionElapsed >= this.transitionMidTime + this.transitionStartTime)	{
		// Last Phase
		this.ship.moveTo(this.nextShipPos);
		var mu = (this.transitionElapsed-(this.transitionStartTime+this.transitionMidTime)) / (this.transitionMidTime);
		var shiftTo = lerp(canvas.width, 0, mu);
		var diff = lerp(this.planetsMoveRate, 0, mu) * delta;
		this.planetManager.stage.x = shiftTo;
		this.probeManager.stage.x = shiftTo;
	}	
	else if (this.transitionElapsed >= this.transitionStartTime)	{
		// Mid Phase
		if (!this.nextLevelMade)	{
			this.planetManager.stage.x = canvas.width;
			this.setupLevel();
			this.nextLevelMade = true;
		}

		var diff = this.planetsMoveRate * delta;

		this.probeManager.stage.x += this.planetsMoveRate * delta;
		var mu = (this.transitionElapsed-this.transitionStartTime) / (this.transitionMidTime);
		this.ship.moveTo(new Vector(
				lerp(this.lastShipPos.x, this.nextShipPos.x, mu),
				lerp(this.lastShipPos.y, this.nextShipPos.y, mu)
			));
	}	
	else 	{
		// Start Phase
		this.probeManager.Update(delta, this.planetManager);
		var diff = this.planetsMoveRate * delta
		this.planetManager.stage.x += diff;
		this.probeManager.stage.x += diff;
	}

	this.background.x += globalMove;

	this.particleManager.shiftAllParticles(new Vector(diff, 0));
	this.particleManager.update(delta, this.probeManager.camRect);
}

Game.prototype.setupLevel = function()	{
	var result = undefined;
	var i = 0;

	this.planetManager.clearStuff();
	this.probeManager.clearStuff();
	this.UI.clearStuff();

	while (result === undefined && i < 5)	{
		i++;
		this.planetManager.spawnPlanets(2+Math.floor(Math.random()*6));
		this.lastShipPos = this.ship.position.clone();
		this.nextShipPos = this.planetManager.getShipSpawn(10);
		console.time("MakeLevel");
		
		if (this.planetManager.planetList.length > 3 && Math.random() >= 0.4)	{
			console.log("Scan Path")
			var toScan = 2 + Math.floor(Math.random()*(this.planetManager.planetList.length-2));
			result = this.planetManager.makeScanPath(this.nextShipPos, 2, 5, 15, 
						toScan, this.probeManager);
			if (result !== undefined)	{
				if (DEBUG)	{
					this.UI.drawPath(result.path);
				}
				this.levelType = "scan";
				this.scanRequired = toScan;
				this.planetManager.addTargetGraphics();
				this.probeManager.scansRequired = toScan;
			}
			
		}	else 	{
			console.log("Mine Path")
	 		result = this.planetManager.makeMine(this.nextShipPos, 2, 
	 							3, 10, this.probeManager);
			this.levelType = "mine";
			this.probeManager.scansRequired = 0;
		}
							
		console.timeEnd("MakeLevel");

	}
	// this.UI.drawPath(result.path);
}

Game.prototype.loadFromSave = function(save)	{
	this.UI.updateText(save.launched, 0, save.passed, save.skipped);
	this.background.x = save.travelled;

	console.log(save);
}