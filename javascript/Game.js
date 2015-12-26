function Game()
{
	this.stage = new createjs.Stage(canvas);

	this.minScaleBox = new createjs.Rectangle(20, 20, canvas.width-40, canvas.height-40);
	this.maxdisHor = this.minScaleBox.width;
	this.maxdisVert = this.minScaleBox.height; 
	this.scaledStage = new createjs.Container();
	this.scaledStage.scaleX = this.scaledStage.scaleY = 1.0;

	this.background = new createjs.Bitmap(preload.getResult("background"));

	this.particleManager = new ParticleManager();

	this.planetManager = new PlanetManager(this.particleManager);

	this.ship = new Ship();

	this.transitionStartTime = 2;
	this.transitionMidTime = 1;
	this.transitionEndTime = 0.75;
	this.transitionTotalTime = this.transitionStartTime + this.transitionMidTime + this.transitionEndTime;
	this.transitionElapsed = 0;
	this.bkgMoveRate = -7;

	this.planetsMoveRate = -4500;
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

	this.probeManager = new ProbeManager(this.minLaunchPower, this.maxLaunchPower, this.minLaunchProp,
										 this.particleManager, this.planetManager);

	this.UI = new UI(this.minLaunchLength, this.maxLaunchLength);
	this.swipe = new Swipe();

	// Initial level setup
	this.setupLevel();
	if (this.planetManager.levelType == "scan")	{
		this.UI.scanBar.alpha = 1.0;
	}	else   {
		this.UI.scanBar.alpha = 0.0;
		this.UI.showMineTarget(this.planetManager.mine.position.outScalarMult(this.scaledStage.scaleX));
	}

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
			this.probeManager.spawnProbe(this.ship.worldPosition, toDeg(angleToY(launchVec)), 
											power, this.planetManager);

			this.UI.updateText( 0, 1, 0, 0);
			var out = this.planetManager.integratePath(this.probeManager.probeList[this.probeManager.probeList.length-1].position, 
											this.probeManager.probeList[this.probeManager.probeList.length-1].velocity,
											2,300, true);
		}	else {
			this.probeManager.stopOrKillProbe();
		}

		// this.UI.drawPath(out.path, 1);
	}

	this.UI.Update(delta, this.swipe, this.probeManager);
	this.UI.updateScanBar(this.probeManager.piecesCollected/this.probeManager.piecesRequired);

	this.probeManager.Update(delta, this.planetManager, this.UI);
	this.planetManager.Update(delta);
	if (this.planetManager.levelType == "mine")	{
		if (this.planetManager.remake)	{
			this.transitioning = true;
		}
	}	else if (this.planetManager.levelType == "scan")	{
		if (this.probeManager.checkScans())	{
			this.transitioning = true;
		}
	}

	this.particleManager.update(delta, this.probeManager.camRect);
	this.setCameraScale();
	this.stage.update();
};

Game.prototype.setCameraScale = function()	{
	var probe = this.probeManager.probeList[0];
	if (this.probeManager.probeList.length == 0 ||
		collidePointRect(probe.position, 
			this.minScaleBox))	{
		this.scaledStage.scaleX = this.scaledStage.scaleY = 1.0;
	}	else 	{
		var dispHor = clamp(
			Math.max(this.minScaleBox.x - probe.position.x, 
				probe.position.x - (this.minScaleBox.width+20)),
			0, this.maxdisHor);
		var dispVert = clamp(
			Math.max(this.minScaleBox.y - probe.position.y, 
				probe.position.y - (this.minScaleBox.height+20)),
			0, this.maxdisVert);

		this.scaledStage.scaleX = this.scaledStage.scaleY = Math.min(1.0-dispHor/this.maxdisHor, 1.0-dispVert/this.maxdisVert);

		this.scaledStage.x = -Math.min(0, probe.position.x-20);
		this.scaledStage.y = -Math.min(0, probe.position.y-20);

		console.log(this.scaledStage.scaleX);
	}
}

Game.prototype.tick = function(evt)	{
	this.Update(TIMESTEP);
	mouse.last = mouse.down;
};

Game.prototype.setStage = function()	{
	this.stage.addChild(this.background);
	this.scaledStage.addChild(this.particleManager.subStage);
	this.scaledStage.addChild(this.planetManager.stage);
	this.scaledStage.addChild(this.ship.sprite);
	this.scaledStage.addChild(this.probeManager.stage);
	this.scaledStage.addChild(this.particleManager.superStage);

	this.stage.addChild(this.scaledStage);

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

		this.UI.scanBar.aplha = 1.0;
		if (this.planetManager.levelType == "mine")	{
			this.UI.showMineTarget(this.planetManager.mine.position.outScalarMult(this.scaledStage.scaleX));
		}

		this.probeManager.scanBurst.canEmit = true;

		saveGame.updateSave(this.UI.launched, this.UI.passed, this.UI.skipped, this.background.x);
		return;
	}

	var globalMove = this.bkgMoveRate * delta;
	
	if (this.transitionElapsed >= this.transitionMidTime + this.transitionStartTime)	{
		// Last Phase
		this.ship.moveTo(this.nextShipPos);
		var mu = (this.transitionElapsed-(this.transitionStartTime+this.transitionMidTime)) / (this.transitionEndTime);
		var shiftTo = lerp(canvas.width, 0, mu);
		var diff = shiftTo - this.planetManager.stage.x;
		// var diff = lerp(this.planetsMoveRate, 0, mu) * delta;
		this.planetManager.stage.x = shiftTo;
		this.probeManager.stage.x = shiftTo;

		if (this.planetManager.levelType == "scan")	{
			this.UI.scanBar.alpha = lerp(0, 1.0, mu);
		}
	}	
	else if (this.transitionElapsed >= this.transitionStartTime)	{
		// Mid Phase
		if (!this.nextLevelMade)	{
			this.probeManager.scanBurst.killAll();
			this.probeManager.puffEmitter.killAll();
			this.probeManager.thruster.killAll();
			this.probeManager.thruster.canEmit = false;
			this.planetManager.stage.x = canvas.width;
			this.setupLevel();
			this.nextLevelMade = true;
			this.probeManager.scanBurst.canEmit = false;
		}

		var diff = this.planetsMoveRate * delta;

		this.probeManager.stage.x += diff;
		var mu = (this.transitionElapsed-this.transitionStartTime) / (this.transitionMidTime);
		this.ship.moveTo(new Vector(
				cosineInterpolate(this.lastShipPos.x, this.nextShipPos.x, mu),
				cosineInterpolate(this.lastShipPos.y, this.nextShipPos.y, mu)
			));
	}	
	else 	{
		// Start Phase
		this.probeManager.Update(delta, this.planetManager, this.UI);
		var mu = (this.transitionElapsed) / (this.transitionMidTime);
		var shiftTo = lerp(0, canvas.width, mu);
		var diff = lerp(0, this.planetsMoveRate, mu) * delta;
		this.UI.scanBar.alpha = lerp(this.UI.scanBar.alpha, 0, mu);
		this.planetManager.stage.x += diff;
		this.probeManager.stage.x += diff;
	}

	this.background.x += globalMove;

	this.particleManager.shiftAllParticles(new Vector(diff, 0));
	this.probeManager.thruster.moveBy({x:diff, y:0});
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
		this.lastShipPos = this.ship.worldPosition.clone();
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
				this.planetManager.levelType = "scan";
				this.planetManager.addTargetGraphics();
				this.probeManager.setScanRequired(toScan);
			}
			
		}	else 	{
			console.log("Mine Path")
	 		result = this.planetManager.makeMine(this.nextShipPos, 2, 
	 							3, 10, this.probeManager);
			this.planetManager.levelType = "mine";
			this.probeManager.setScanRequired(0);
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