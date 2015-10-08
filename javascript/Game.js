function Game()
{
	this.stage = new createjs.Stage(canvas);

	this.background = new createjs.Bitmap(preload.getResult("background"));

	this.planetManager = new PlanetManager();
	this.planetManager.spawnPlanets(2+Math.floor(Math.random()*5));

	this.ship = new Ship();
	this.ship.moveTo(this.planetManager.getShipSpawn(10));

	this.probeManager = new ProbeManager();

	this.minLaunchLength = 10;
	this.maxLaunchLength = 250;
	this.launchPowerMult = 50;

	this.UI = new UI(this.minLaunchLength, this.maxLaunchLength);

	this.swipe = new Swipe();

	this.setStage();	
}

Game.prototype.Update = function(delta) {

	this.swipe.Update();

	if (this.swipe.complete)	{
		this.probeManager.spawnProbe(this.ship.position, this.swipe.swipeVec.outScalarMult(this.launchPowerMult+this.swipe.swipeLength));
		console.time("integration");
		var out = this.planetManager.integratePath(this.ship.position, 
										this.swipe.swipeVec.outScalarMult(this.launchPowerMult+this.swipe.swipeLength),
										10,300);
		console.timeEnd("integration");
		console.log("Probe survived "+out.time.toString()+" s.");

		this.UI.drawPath(out.path, 10);
	}

	this.UI.Update(delta, this.swipe);

	this.probeManager.Update(delta, this.planetManager);
	this.planetManager.Update(delta);
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
}