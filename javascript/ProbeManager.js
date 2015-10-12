function ProbeManager()	
{
	this.stage = new createjs.Container();
	this.probeList = new Array();
	this.dbgShape = new createjs.Shape();
}

ProbeManager.prototype.Update = function(delta, planetManager) {
	if (DEBUG)	{
		this.dbgShape.graphics.clear();
	}

	for (var i = 0; i < this.probeList.length; i++)	{
		if (DEBUG)	{
			this.dbgShape.graphics.s("#F55");
		}
		var force = new Vector(0,0);
		planetManager.getTotalAttractionVector(this.probeList[i].position, force);
		this.probeList[i].addForce(force);
		this.probeList[i].Update(delta);

		if (planetManager.checkCollisions(this.probeList[i].position, this.probeList[i].radius, true))	{
			this.probeList[i].kill = true;
		}
		
		if (DEBUG)	{
			this.dbgShape.graphics.dc(this.probeList[i].position.x, this.probeList[i].position.y,
									  this.probeList[i].radius);
			this.dbgShape.graphics.es();
		}
	}

	
	for (var i = 0; i < this.probeList.length; i++)	{
		if (this.probeList[i].kill)	{
			this.stage.removeChild(this.probeList[i].sprite);
			this.probeList.splice(i,1);
			i--;
		}
	}
};

ProbeManager.prototype.clearStuff = function()	{
	for (var i = 0; i < this.probeList.length; i++)	{
		this.stage.removeChild(this.probeList[i].sprite);
	}

	this.probeList.length = 0;
}

ProbeManager.prototype.spawnProbe = function(position, velocity) {
	var probe = new Probe()
	probe.moveTo(position);
	probe.velocity = velocity.clone();
	this.probeList.push(probe);
	this.stage.addChild(probe.sprite);
};