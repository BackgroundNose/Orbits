function HazardManager()	{
	this.stage = new createjs.Container();

	this.dbg = new createjs.Shape();
	this.stage.addChild(this.dbg)
	this.hazardList = [];
}

HazardManager.prototype.Update = function(delta) {
	this.dbg.graphics.clear();
	this.dbg.graphics.s("#55F").f("#F00");

	for (var i = 0; i < this.hazardList.length; i++)	{
		this.dbg.graphics.mt(this.hazardList[i].orbitalCenter.x, this.hazardList[i].orbitalCenter.y).lt(this.hazardList[i].position.x, this.hazardList[i].position.y)
		this.hazardList[i].update(delta);
	}
	this.dbg.graphics.ef();
};

HazardManager.prototype.spawnHazard = function(center, rad)	{
	var haz = new Hazard("roid", 21, rad, center, Math.random());
	this.hazardList.push(haz);
	this.stage.addChild(haz.sprite);
	// this.stage.addChild(haz.dbg);
};

HazardManager.prototype.clearAll = function()	{
	this.stage.removeAllChildren();
	this.hazardList = [];
};

// HazardManager.prototype.checkCollisions = function(point, rad)	{
// 	for (var i = 0; i < this.hazardList.length, i++)	{
// 		if ()
// 	}
// }