function Game()
{
	this.stage = new createjs.Stage(canvas);

	this.background = new createjs.Bitmap(preload.getResult("background"));

	this.planetManager = new PlanetManager();

	this.ship = new Ship();



	this.minLaunchLength = 10;
	this.maxLaunchLength = 250;
	this.maxLaunchPower = 350;
	this.minLaunchProp = this.minLaunchLength / this.maxLaunchLength;
	this.minLaunchPower = this.minLaunchProp*this.maxLaunchPower;

	this.levelType = "scan";
	this.scanRequired = 0;

	this.probeManager = new ProbeManager(this.minLaunchPower, this.maxLaunchPower, this.minLaunchProp);

	this.UI = new UI(this.minLaunchLength, this.maxLaunchLength);
	this.swipe = new Swipe();

	this.setupLevel();

	this.setStage();	
}

Game.prototype.Update = function(delta) {

	this.swipe.Update();

	if (this.swipe.complete && this.swipe.swipeLength >= this.minLaunchLength)	{
		var launchVec = this.swipe.swipeVec
		this.probeManager.spawnProbe(this.ship.position, toDeg(angleToY(launchVec)), 
										Math.min(this.swipe.swipeLength,this.maxLaunchLength) / this.maxLaunchLength);
		
		var out = this.planetManager.integratePath(this.probeManager.probeList[this.probeManager.probeList.length-1].position, 
										this.probeManager.probeList[this.probeManager.probeList.length-1].velocity,
										2,300, true);
		
		// this.UI.drawPath(out.path, 10);
	}

	this.UI.Update(delta, this.swipe, this.probeManager);

	this.probeManager.Update(delta, this.planetManager);
	this.planetManager.Update(delta);
	if (this.levelType == "mine")	{
		if (this.planetManager.remake)	{
			this.setupLevel();
		}
	}	else if (this.levelType == "scan")	{
		if (this.probeManager.checkScans(this.scanRequired))	{
			this.setupLevel();
		}
	}

	this.stage.update();
};

Game.prototype.tick = function(evt)	{
	this.Update(TIMESTEP);
	mouse.last = mouse.down;
};

Game.prototype.setStage = function()	{
	this.stage.addChild(this.background);
	this.stage.addChild(this.planetManager.stage);
	this.stage.addChild(this.ship.sprite);
	this.stage.addChild(this.probeManager.stage);
	this.stage.addChild(this.UI.stage);

	if (DEBUG)	{
		this.stage.addChild(this.probeManager.dbgShape);
		this.stage.addChild(this.planetManager.dbgShape);
	}
};

Game.prototype.setupLevel = function()	{
	var result = undefined;
	var i = 0;

	this.planetManager.clearStuff();
	this.probeManager.clearStuff();
	this.UI.clearStuff();

	while (result === undefined && i < 5)	{
		i++;
		this.planetManager.spawnPlanets(2+Math.floor(Math.random()*6));
		this.ship.moveTo(this.planetManager.getShipSpawn(10));
		console.time("MakeLevel");
		
		if (this.planetManager.planetList.length > 3 && Math.random() >= 0.4)	{
			console.log("Scan Path")
			var toScan = 2 + Math.floor(Math.random()*(this.planetManager.planetList.length-3));
			result = this.planetManager.makeScanPath(this.ship.position, 2, 5, 15, 
						toScan, this.probeManager);
			if (result !== undefined)	{
				this.UI.drawPath(result.path);
				this.levelType = "scan";
				this.scanRequired = toScan;
				this.planetManager.addTargetGraphics();
				this.probeManager.addScanTexts = true;
			}
			
		}	else 	{
			console.log("Mine Path")
	 		result = this.planetManager.makeMine(this.ship.position, 2, 
	 							3, 10, this.probeManager);
			this.levelType = "mine";
			this.probeManager.addScanTexts = false;
		}
							
		console.timeEnd("MakeLevel");

	}
	// this.UI.drawPath(result.path);
}