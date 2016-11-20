function Game()
{
	this.stage = new createjs.Stage(canvas);

	this.border = 50;
	this.minScale = 0.5;
	this.maxScale = 1.0;

	this.minScaleBox = new createjs.Rectangle(this.border, this.border, canvas.width-this.border, canvas.height-this.border);
	this.maxExtraHor = canvas.width;
	this.maxExtraVert = canvas.height; 
	this.scaledStage = new createjs.Container();
	this.scaledStage.scaleX = this.scaledStage.scaleY = 1.0;

	this.levelBoundary = new createjs.Rectangle(-canvas.width-this.border, -canvas.height-this.border, 3*canvas.width+2*this.border, 3*canvas.height+2*this.border);

	this.screenRect = new createjs.Rectangle(0, 0, canvas.width, canvas.height);

	this.dbgshape = new createjs.Shape();	

	this.backgroundManager = new Background(new createjs.Rectangle(-this.maxExtraHor, -this.maxExtraVert, canvas.width*3, canvas.height*3));

	this.particleManager = new ParticleManager();

	this.hazardManager = new HazardManager(this.particleManager);

	this.planetManager = new PlanetManager(this.particleManager, this.hazardManager);

	this.ship = new Ship(this.particleManager);

	

	this.transitionStartTime = 2;
	this.transitionMidTime = 1;
	this.transitionEndTime = 1.0;
	this.transitionTotalTime = this.transitionStartTime + this.transitionMidTime + this.transitionEndTime;
	this.transitionElapsed = 0;
	this.startEndTransition = true;

	this.warpStartSound = undefined;
	this.warpMidSound = undefined;
	this.warpFinalSound = undefined;

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
										 this.particleManager, this.planetManager, this.levelBoundary);

	this.UI = new UI(this.minLaunchLength, this.maxLaunchLength);
	this.swipe = new Swipe();

	this.eventManager = new EventManager();

	this.textBoxWidth = 700;
	this.textBoxHeight = 500;

	this.midProg = 500;

	this.dustEmitter = undefined;
}

Game.prototype.Update = function(delta) {
	this.swipe.Update();

	if (this.transitioning)	{
		this.moveToNextLevel(delta);
		this.stage.update();
		return;
	}

	if (this.swipe.complete && !this.UI.interrupt)	{
		if (this.swipe.swipeLength >= this.minLaunchLength)	{
			var launchVec = this.swipe.swipeVec;
			var power = Math.min(this.swipe.swipeLength,this.maxLaunchLength) / this.maxLaunchLength;
			this.probeManager.spawnProbe(this.ship.worldPosition, toDeg(angleToY(launchVec)), 
											power, this.planetManager, this.UI);

			var out = this.planetManager.integratePath(this.probeManager.probeList[this.probeManager.probeList.length-1].position, 
											this.probeManager.probeList[this.probeManager.probeList.length-1].velocity,
											2,300, true);
		}	else {
			this.probeManager.stopOrKillProbe();
		}
	}

	this.UI.Update(delta, this.swipe, this.probeManager, this.planetManager, this.ship, this.transitioning);
	this.UI.updateScanBar(this.probeManager.piecesCollected/this.probeManager.piecesRequired);

	this.probeManager.Update(delta, this.planetManager, this.UI, this.particleManager, this.hazardManager, false);
	this.planetManager.Update(delta, this.probeManager);
	this.hazardManager.Update(delta, this.planetManager);

	if (this.planetManager.levelType == "mine")	{
		if (this.planetManager.remake)	{
			this.winLevel();
			createjs.Sound.play("SscanComplete");
		}
	}	else if (this.planetManager.levelType == "scan")	{
		if (this.probeManager.checkScans())	{
			this.winLevel();
			createjs.Sound.play("SscanComplete");
		}
	}

	this.particleManager.update(delta);
	this.setCameraScale();
	this.stage.update();
};

Game.prototype.winLevel = function()	{
	this.sendTrigger("end");
	this.transitioning = true;
}

Game.prototype.setCameraScale = function()	{
	var probe = this.probeManager.probeList[0];
	var border = 50;

	// Probe does not exist, or is inside the scale box.
	if (this.probeManager.probeList.length == 0 ||
		collidePointRect(probe.position, this.minScaleBox))	{

		this.scaledStage.scaleX = this.scaledStage.scaleY = lerp(this.scaledStage.scaleX, 1.0, 0.1);
		this.scaledStage.x = lerp(this.scaledStage.x, 0, 0.1);
		this.scaledStage.y = lerp(this.scaledStage.y, 0, 0.1);

		if (Math.abs(this.scaledStage.x) < 1.0e-8 || Math.abs(this.scaledStage.y) < 1.0e-8 )	{
			this.scaledStage.x = 0;
		} 
		if ( Math.abs(this.scaledStage.y) < 1.0e-8 )	{
			this.scaledStage.y = 0;
		} 

	// We must scale and shift the screen to accomodate the probe.
	}	else 	{

		var rightmost = Math.max(canvas.width, probe.position.x + border);
		var leftmost = Math.min(0, probe.position.x - border);
		var topmost = Math.min(0, probe.position.y - border);
		var lowermost = Math.max(canvas.height, probe.position.y + border);

		var spanX = rightmost - leftmost;
		var spanY = lowermost - topmost;

		var scalX = clamp(canvas.width/spanX, this.minScale, this.maxScale);
		var scalY = clamp(canvas.height/spanY, this.minScale, this.maxScale);

		var scale = lerp(this.scaledStage.scaleX, Math.min(scalX, scalY), 0.1);

		this.scaledStage.scaleX = this.scaledStage.scaleY = scale;

		this.scaledStage.x = -clamp(leftmost, canvas.width - (canvas.width*(1/this.minScale)), 0)*scale;
		this.scaledStage.y = -clamp(topmost, canvas.height - (canvas.height*(1/this.minScale)), 0)*scale;
	}

	this.updateScreenRect();
	this.updateDustEmitters(this.screenRect);
	
	this.backgroundManager.scaleStars(this.scaledStage.scaleX, new Vector(this.scaledStage.x, this.scaledStage.y));
};

Game.prototype.updateScreenRect = function()	{
	this.screenRect.x = -this.scaledStage.x*(1/this.scaledStage.scaleX);
	this.screenRect.y = -this.scaledStage.y*(1/this.scaledStage.scaleY);
	this.screenRect.width = canvas.width * (1/this.scaledStage.scaleX);
	this.screenRect.height = canvas.height * (1/this.scaledStage.scaleY);
};

Game.prototype.tick = function(evt)	{
	this.Update(TIMESTEP);
	mouse.last = mouse.down;
};

Game.prototype.setStage = function()	{
	this.stage.addChild(this.backgroundManager.stage);
	this.scaledStage.addChild(this.particleManager.subStage);
	this.scaledStage.addChild(this.planetManager.stage);
	this.scaledStage.addChild(this.hazardManager.stage);
	this.scaledStage.addChild(this.probeManager.stage);
	this.scaledStage.addChild(this.UI.launchPathShape);
	this.scaledStage.addChild(this.ship.wingTips);
	this.scaledStage.addChild(this.ship.sprite);

	this.scaledStage.addChild(this.particleManager.superStage);

	this.scaledStage.addChild(this.dbgshape);

	this.stage.addChild(this.scaledStage);

	this.stage.addChild(this.UI.stage);

	if (DEBUG)	{
		this.stage.addChild(this.probeManager.dbgShape);
		this.stage.addChild(this.planetManager.dbgShape);
	}
};

Game.prototype.updateDustEmitters = function(screenRect)	{
	this.dustEmitterRight.emitBox.x = screenRect.x + screenRect.width;
	this.dustEmitterRight.emitBox.height = this.dustEmitterLeft.emitBox.height = screenRect.width + 20;
	this.dustEmitterLeft.emitBox.x = screenRect.x - 10;
	this.dustEmitterRight.emitBox.y = this.dustEmitterLeft.y = screenRect.y - 10;

	this.dustEmitterTop.emitBox.x = this.dustEmitterBottom.emitBox.x = screenRect.x - 10;
	this.dustEmitterTop.emitBox.width = this.dustEmitterBottom.emitBox.width = screenRect.width + 20;
	this.dustEmitterTop.emitBox.y = screenRect.y - 10;
	this.dustEmitterBottom.emitBox.y = screenRect.y + screenRect.height;

	// this.dustEmitter.emitBox.x = screenRect.x;
	// this.dustEmitter.emitBox.width = screenRect.width;
	// this.dustEmitter.emitBox.y = screenRect.y;
	// this.dustEmitter.emitBox.height = screenRect.height;
	var rate = 1/((screenRect.width*screenRect.height)/(canvas.width*canvas.height));
	this.dustEmitterRight.setRandomEmit(this.dustRateLow*rate,this.dustRateHigh*rate);
	this.dustEmitterLeft.setRandomEmit(this.dustRateLow*rate,this.dustRateHigh*rate);
	this.dustEmitterTop.setRandomEmit(this.dustRateLow*rate,this.dustRateHigh*rate);
	this.dustEmitterBottom.setRandomEmit(this.dustRateLow*rate,this.dustRateHigh*rate);
}

Game.prototype.setupParticles = function()	{
	this.dustEmitterRight = this.particleManager.addEmitterByType("dustCloud", new createjs.Rectangle(canvas.width, 0, 10, canvas.height),
										  new Vector(-100, -50), new Vector(-10, 50), {pm:this.planetManager});
	this.dustEmitterTop = this.particleManager.addEmitterByType("dustCloud", new createjs.Rectangle(0, -10, canvas.width, 10),
										  new Vector(-50, 10), new Vector(50, 100), {pm:this.planetManager});
	this.dustEmitterLeft = this.particleManager.addEmitterByType("dustCloud", new createjs.Rectangle(-10, 0, 10, canvas.height),
										  new Vector(10, -50), new Vector(100, 50), {pm:this.planetManager});
	this.dustEmitterBottom = this.particleManager.addEmitterByType("dustCloud", new createjs.Rectangle(0, canvas.height, canvas.width, 10),
										  new Vector(-50, -100), new Vector(50, -10), {pm:this.planetManager});
	// this.dustEmitter = this.particleManager.addEmitterByType("dustCloud", new createjs.Rectangle(0, 0, canvas.width, canvas.height),
	// 									  new Vector(-100, -100), new Vector(100, 100), {pm:this.planetManager});
	this.dustRateLow = 3.0;
	this.dustRateHigh = 6.5;
	this.dustEmitterRight.setRandomEmit(this.dustRateLow,this.dustRateHigh);
	this.dustEmitterTop.setRandomEmit(this.dustRateLow,this.dustRateHigh);
	this.dustEmitterLeft.setRandomEmit(this.dustRateLow,this.dustRateHigh);
	this.dustEmitterBottom.setRandomEmit(this.dustRateLow,this.dustRateHigh);

	this.dustEmitterTrail = this.particleManager.addEmitterByType("dustCloudTrail", new createjs.Rectangle(canvas.width, 0, 10, canvas.height),
										  new Vector(-100, -100), new Vector(-10, 100));
	this.dustEmitterTrail.canEmit = false;
}

Game.prototype.moveToNextLevel = function(delta)	{
	if (this.UI.interrupt)	{
		this.particleManager.update(delta, this.probeManager.camRect);
		this.UI.Update(delta, this.swipe, this.probeManager, this.planetManager, this.ship, this.transitioning);
		this.probeManager.Update(delta, this.planetManager, this.UI, this.particleManager, this.hazardManager, true);
		return;
	}

	this.transitionElapsed += delta;
	this.probeManager.markers = false;

	this.dustEmitterRight.canEmit = false;
	this.dustEmitterTop.canEmit = false;
	this.dustEmitterLeft.canEmit = false;
	this.dustEmitterBottom.canEmit = false;
	// this.dustEmitter.canEmit = false;
	this.dustEmitterTrail.canEmit = true;

	this.UI.launchPathShape.alpha = 0;


	if (this.transitionElapsed >= this.transitionTotalTime)	{
		this.transitioning = false;
		this.transitionElapsed = 0;
		this.planetManager.stage.x = 0;
		this.probeManager.stage.x = 0;
		this.hazardManager.stage.x = 0;
		this.nextLevelMade = false;
		this.cheated = false;
		this.probeManager.markers = true;

		this.dustEmitterRight.canEmit = true;
		this.dustEmitterTop.canEmit = true;
		this.dustEmitterLeft.canEmit = true;
		this.dustEmitterBottom.canEmit = true;
		// this.dustEmitter.canEmit = true;
		this.dustEmitterTrail.canEmit = false;

		if (this.planetManager.levelType == "mine")	{
			this.UI.showMineTarget(this.planetManager.mine.position.outScalarMult(this.scaledStage.scaleX));
		}	else {
			 this.UI.scanBar.alpha = 1.0;
		}

		this.ship.warpEmitterSub.canEmit = false;
		this.ship.warpEmitterSuper.canEmit = false;
		this.ship.sprite.gotoAndStop("player");
		this.ship.wingTips.graphics.clear();

		this.warpStartSound.volume = 0;
		this.warpStartSound.stop()
		this.warpStartSound = undefined;

		this.probeManager.scanBurst.canEmit = true;

		saveGame.updateSave(this.UI.launched, this.UI.passed, this.UI.skipped, 
			this.planetManager, this.ship.worldPosition, this.probeManager.scansRequired, this.backgroundManager,
			this.hazardManager, this.UI.targetPoints);
		this.sendTrigger("start");
		return;
	}

	var globalMove = this.bkgMoveRate * delta;
	
	if (this.transitionElapsed >= this.transitionMidTime + this.transitionStartTime)	{
		// Last Phase
		this.ship.moveTo(this.nextShipPos);

		var mu = (this.transitionElapsed-(this.transitionStartTime+this.transitionMidTime)) / (this.transitionEndTime);
		var shiftTo = lerp(canvas.width+300, 0, mu);

	
		var diff = this.planetsMoveRate*delta*(1-mu);

		// var diff = lerp(this.planetsMoveRate, 0, mu) * delta;

		this.ship.drawTips(1.0-mu);
		this.ship.warpEmitterSub.particlePrototype.ttl = this.ship.warpEmitterSub.basettl*(1-mu);
		this.ship.warpEmitterSuper.particlePrototype.ttl = this.ship.warpEmitterSuper.basettl*(1-mu);

		this.planetManager.stage.x = shiftTo;
		this.probeManager.stage.x = shiftTo;
		this.hazardManager.stage.x = shiftTo;
		this.hazardManager.Update(delta, this.planetManager);

		if (this.planetManager.levelType == "scan")	{
			this.UI.scanBar.alpha = lerp(0, 1.0, mu);
		}
		this.warpStartSound.volume = (1-mu);
	}	
	else if (this.transitionElapsed >= this.transitionStartTime)	{
		// Mid Phase
		if (!this.nextLevelMade)	{
			this.UI.applyProbesHere();
			this.UI.updateText(0,0,1,0);
			this.eventManager.selectEventsForLevel(this.UI.passed.toString());
			this.probeManager.Update(delta, this.planetManager, this.UI, this.particleManager, this.hazardManager, true);
			this.probeManager.piecesCollected = 0;
			this.UI.updateScanBar(0);
			this.probeManager.scanBurst.killAll();
			this.probeManager.puffEmitter.killAll();
			this.probeManager.thruster.killAll();
			this.probeManager.thruster.canEmit = false;
			this.planetManager.stage.x = canvas.width+10;
			this.hazardManager.stage.x = canvas.width+10;
			this.hazardManager.clearAll();
			this.setupLevel();
			this.nextLevelMade = true;
			this.probeManager.scanBurst.canEmit = false;

			this.scaledStage.x = this.scaledStage.y = 0;
			this.scaledStage.scaleX = this.scaledStage.scaleY = 1;
		}

		var diff = this.planetsMoveRate * delta;

		this.probeManager.stage.x += diff;
		var mu = (this.transitionElapsed-this.transitionStartTime) / (this.transitionMidTime);
		var shipDX = cosineInterpolate(this.lastShipPos.x, this.nextShipPos.x, mu);
		var shipDY = cosineInterpolate(this.lastShipPos.y, this.nextShipPos.y, mu);
		var partDX = shipDX - this.ship.worldPosition.x;
		var partDY = shipDY - this.ship.worldPosition.y;
		this.ship.moveTo(new Vector(shipDX, shipDY));
		this.ship.warpEmitterSub.shiftAllParticles(new Vector(partDX, partDY));
		this.ship.warpEmitterSuper.shiftAllParticles(new Vector(partDX, partDY));
		this.ship.warpEmitterSub.particlePrototype.ttl = this.ship.warpEmitterSub.basettl;
		this.ship.warpEmitterSuper.particlePrototype.ttl = this.ship.warpEmitterSuper.basettl;
		this.ship.drawTips(1.0);
	}	
	else 	{
		// Start Phase
		this.probeManager.Update(delta, this.planetManager, this.UI, this.particleManager, this.hazardManager, false);
		this.hazardManager.Update(delta, this.planetManager);
		var mu = (this.transitionElapsed) / (this.transitionMidTime);
		var shiftTo = lerp(0, canvas.width, mu);
		var diff = lerp(0, this.planetsMoveRate, mu) * delta;
		this.UI.scanBar.alpha = lerp(this.UI.scanBar.alpha, 0, mu);
		this.planetManager.stage.x += diff;
		this.probeManager.stage.x += diff;
		this.probeManager.gravPart.canEmit = false;
		this.hazardManager.stage.x += diff;

		this.scaledStage.x = lerp(this.scaledStage.x, 0, mu);
		this.scaledStage.y = lerp(this.scaledStage.y, 0, mu);
		this.scaledStage.scaleX = lerp(this.scaledStage.scaleX, 1, mu);
		this.scaledStage.scaleY = lerp(this.scaledStage.scaleY, 1, mu);

		this.ship.warpEmitterSub.canEmit = true;
		this.ship.warpEmitterSuper.canEmit = true;
		this.ship.warpEmitterSub.particlePrototype.ttl = this.ship.warpEmitterSub.basettl*mu;
		this.ship.warpEmitterSuper.particlePrototype.ttl = this.ship.warpEmitterSuper.baseRate/mu;
		this.ship.drawTips(Math.min(1.0, mu));
		this.ship.sprite.gotoAndStop("warping");

		if (this.warpStartSound === undefined)	{
			this.warpStartSound = createjs.Sound.play("Swarp");
		}
	}

	this.backgroundManager.shiftThings(delta);

	this.particleManager.shiftAllParticles(new Vector(diff, 0));
	this.ship.warpEmitterSub.shiftAllParticles(new Vector(-diff, 0));
	this.ship.warpEmitterSuper.shiftAllParticles(new Vector(-diff, 0));
	this.probeManager.thruster.moveBy({x:diff, y:0});
	this.particleManager.update(delta, this.probeManager.camRect);
	this.UI.Update(delta, this.swipe, this.probeManager, this.planetManager, this.ship, this.transitioning);
}

Game.prototype.setupLevel = function()	{
	var result = undefined;
	var i = 0;

	this.planetManager.clearStuff();
	this.probeManager.clearStuff();
	this.UI.clearStuff();

	this.eventManager.selectEventsForLevel(this.UI.passed.toString());

	if ( this.eventManager.currentEvent !== undefined &&
			this.eventManager.currentEvent.layout !== undefined)	{
		console.log("LOADING FROM EVENT!!");
		var evt = this.eventManager.currentEvent;
		console.log(evt.layout.planets)
		this.planetManager.loadFromEvent(evt);
		if (this.ship.worldPosition === undefined)	{
			this.ship.worldPosition = new Vector(evt.layout.ship.x*canvas.width, evt.layout.ship.y*canvas.height);
			this.ship.moveTo(this.ship.worldPosition);
		}
		if (evt.type == "scan")	{
			if (evt.scans === undefined)	{
				console.log("ERROR: NO SCAN NUMBER IN SCAN EVENT!");
				this.probeManager.setScanRequired(evt.layout.planets.length);
			}	else 	{
				this.probeManager.setScanRequired(evt.scans);
			}
			this.planetManager.addTargetGraphics();
			this.planetManager.resetScanTargets();
		}	else 	{
			this.probeManager.setScanRequired(0);
		}
		this.lastShipPos = this.nextShipPos.clone();
		this.nextShipPos = new Vector(evt.layout.ship.x*canvas.width, evt.layout.ship.y*canvas.height);
		return;
	}

	while (result === undefined && i < 5)	{
		i++;
		var prog = Math.min(this.UI.passed**2/(this.UI.passed**2+this.midProg**2), 0.9);
		this.planetManager.spawnPlanetsRandomly(2+Math.floor(Math.random()*6), prog);

		var shipSpawn = this.planetManager.getShipSpawn(10);
		console.time("MakeLevel");
		
		if (this.planetManager.planetList.length > 3 && Math.random() >= 0.3)	{
			console.log("Scan Path")
			var toScan = Math.min(5, 2 + Math.floor(Math.random()*(this.planetManager.planetList.length-2)));
			result = this.planetManager.makeScanPath(shipSpawn, 2, 5, 15, 
						toScan, this.probeManager);
			if (result !== undefined)	{
				if (DEBUG)	{
					this.UI.drawPath(result.path);
				}
				this.planetManager.levelType = "scan";
				this.planetManager.addTargetGraphics();
				this.probeManager.setScanRequired(toScan);
				this.planetManager.resetScanTargets();
			}	else 	{
				console.log("Panic making Mine Path")
		 		result = this.planetManager.makeMine(shipSpawn, 2, 
		 							3, 10, this.probeManager);
				this.planetManager.levelType = "mine";
				this.probeManager.setScanRequired(0);
			}
			
		}	else 	{
			console.log("Mine Path")
	 		result = this.planetManager.makeMine(shipSpawn, 2, 
	 							3, 10, this.probeManager);
			this.planetManager.levelType = "mine";
			this.probeManager.setScanRequired(0);
		}
		console.timeEnd("MakeLevel");
	}

	if (this.ship.worldPosition === undefined)	{
		this.ship.worldPosition = new Vector(0,0);
		this.ship.moveTo(shipSpawn);
		this.nextShipPos = this.ship.worldPosition.clone();
		this.lastShipPos = this.ship.worldPosition.clone();
	}	else {
		this.lastShipPos = this.nextShipPos.clone();
		this.nextShipPos = shipSpawn.clone();
	}

	// this.UI.drawPath(result.path);
}

Game.prototype.loadFromSave = function(save)	{
	console.log("Load",save);
	this.UI.clearStuff();
	if (!save.NEW)	{
		var sp = new Vector(save.shipPos.x, save.shipPos.y);
		this.nextShipPos = sp.clone();
		this.lastShipPos = sp.clone();
		this.ship.worldPosition = sp.clone();
		this.ship.moveTo(this.ship.worldPosition);
		this.UI.updateText(save.launched, 0, save.passed, save.skipped);
		this.UI.targetPoints = save.tgtDots;
		this.planetManager.loadFromSave(save);
		this.hazardManager.loadFromSave(save);
		if (this.planetManager.levelType == "scan")	{
			this.probeManager.setScanRequired(save.toScan);
		} 	else if (this.planetManager.levelType == "mine") {
			this.probeManager.setScanRequired(0);
		}
		this.backgroundManager.loadFromSave(save.starList);
	} 	else 	{
		// Initial level setup
		console.log("New game. No save found.");
		this.setupLevel();
		this.backgroundManager.spawnInitialStars();
	}

	if (this.planetManager.levelType == "scan")	{
		this.UI.scanBar.alpha = 1.0;
	}	else if (this.planetManager.levelType == "mine") {
		this.UI.scanBar.alpha = 0.0;
		this.UI.showMineTarget(this.planetManager.mine.position.outScalarMult(this.scaledStage.scaleX));
	}

	this.setupParticles();
	
	this.setStage();
	this.eventManager.selectEventsForLevel(this.UI.passed.toString());
	this.sendTrigger("start");
}

Game.prototype.sendTrigger = function(trigger)	{
	var evt = this.eventManager.checkTrigger(trigger);
	if (evt !== undefined)	{
		if (evt.msg !== undefined)	{
			var tb = new TextBox();
			tb.formBox(evt.msg, undefined, this.textBoxWidth, this.textBoxHeight);
			this.UI.showTextBox(tb);
		}
		if (evt.mod !== undefined)	{
			if (evt.mod['tgtmod'] !== undefined)	{
				this.UI.targetPoints = evt.mod["tgtmod"];
			}
		}
	}
}