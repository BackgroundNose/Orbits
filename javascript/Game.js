function Game()
{
	this.stage = new createjs.Stage(canvas);

	this.background = new createjs.Bitmap(preload.getResult("background"));

	this.planetManager = new PlanetManager();

	this.ship = new Ship();

	this.probeManager = new ProbeManager();

	this.minLaunchLength = 10;
	this.maxLaunchLength = 250;
	this.maxLaunchPower = 350;
	this.minLaunchPower = (this.minLaunchLength/this.maxLaunchLength)*this.maxLaunchPower;


	this.UI = new UI(this.minLaunchLength, this.maxLaunchLength);
	this.swipe = new Swipe();

	this.setupLevel();

	this.setStage();	
}

Game.prototype.Update = function(delta) {

	this.swipe.Update();

	if (this.swipe.complete && this.swipe.swipeLength >= this.minLaunchLength)	{
		var launchVec = this.swipe.swipeVec.outNormalised();
		launchVec.scalarMult((Math.min(this.maxLaunchLength,this.swipe.swipeLength)/this.maxLaunchLength) * this.maxLaunchPower);
		this.probeManager.spawnProbe(this.ship.position, launchVec);
		
		var out = this.planetManager.integratePath(this.ship.position, 
										launchVec,
										2,300, true);
		
		this.UI.drawPath(out.path, 10);
	}

	this.UI.Update(delta, this.swipe);

	this.probeManager.Update(delta, this.planetManager);
	this.planetManager.Update(delta);

	if (this.planetManager.remake)	{
		this.setupLevel();
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

	while (result === undefined && i < 5)	{
		i++;
		this.planetManager.spawnPlanets(2+Math.floor(Math.random()*5));
		this.ship.moveTo(this.planetManager.getShipSpawn(10));
		console.time("MineMake");
	 	result = this.planetManager.makeMine(this.ship.position, 2, 
								this.minLaunchPower, this.maxLaunchPower, 
								360, 100, 3, 10);
		console.timeEnd("MineMake");

	}
	console.log(result.time);
	this.UI.drawPath(result.path);
}