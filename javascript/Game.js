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
	this.planetsMoveRate = -1000;
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
											power);
			this.UI.updateText( 0, 1, 0, 0);
			this.UI.setActiveBar(this.probeManager.quantizeLaunchPower(power));
			this.UI.setRadialBar(toDeg(angleToY(launchVec)));
			var out = this.planetManager.integratePath(this.probeManager.probeList[this.probeManager.probeList.length-1].position, 
											this.probeManager.probeList[this.probeManager.probeList.length-1].velocity,
											2,300, true);
		}	else {
			this.probeManager.stopOrKillProbe();
		}
		// this.UI.drawPath(out.path, 10);
	}

	this.UI.Update(delta, this.swipe, this.probeManager);

	if ( this.UI.cheatDown )	{
		this.probeManager.spawnProbe(this.ship.position, this.planetManager.solutionAngle, 
									this.planetManager.solutionForce);
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
	this.dustEmitter = this.particleManager.addEmitterByType("dustCloud", new createjs.Rectangle(0, 0, canvas.width, canvas.height),
										  new Vector(-100, -100), new Vector(100, 100));
}

Game.prototype.moveToNextLevel = function(delta)	{
	this.transitionElapsed += delta;
	this.probeManager.markers = false;

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

		saveGame.updateSave(this.UI.launched, this.UI.passed, this.UI.skipped, this.background.x);
		return;
	}

	this.background.x += this.bkgMoveRate * delta;

	if (this.transitionElapsed >= this.transitionMidTime + this.transitionStartTime)	{
		// Last Phase
		this.ship.moveTo(this.nextShipPos);
		var mu = (this.transitionElapsed-(this.transitionStartTime+this.transitionMidTime)) / (this.transitionMidTime);
		this.planetManager.stage.x = lerp(canvas.width, 0, mu);
		this.probeManager.stage.x = lerp(canvas.width, 0, mu);
	}	
	else if (this.transitionElapsed >= this.transitionStartTime)	{
		// Mid Phase
		if (!this.nextLevelMade)	{
			this.planetManager.stage.x = canvas.width;
			this.setupLevel();
			this.nextLevelMade = true;
		}
		//double speed in mid
		this.background.x += this.bkgMoveRate * delta;

		this.probeManager.stage.x += this.planetsMoveRate * delta;
		var mu = (this.transitionElapsed-this.transitionStartTime) / (this.transitionMidTime);
		this.ship.moveTo(new Vector(
				cosineInterpolate(this.lastShipPos.x, this.nextShipPos.x, mu),
				cosineInterpolate(this.lastShipPos.y, this.nextShipPos.y, mu)
			));

	}	
	else 	{
		// Start Phase
		this.probeManager.Update(delta, this.planetManager);
		this.planetManager.stage.x += this.planetsMoveRate * delta;
		this.probeManager.stage.x += this.planetsMoveRate * delta;
	}
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