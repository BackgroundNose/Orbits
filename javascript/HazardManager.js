function HazardManager(particleManager)	{
	this.stage = new createjs.Container();

	this.hazardList = [];

	this.pm = particleManager;
}

HazardManager.prototype.Update = function(delta, planetMan) {
	for (var i = 0; i < this.hazardList.length; i++)	{
		var haz = this.hazardList[i]
		if (haz.kill)	{
			this.destroyHazard(i);
			this.makeExposion(haz.position, false)
		}	else if (!collidePointRect(haz.position, game.levelBoundary)
						&& !game.transitioning)	{
			haz.kill = true;
		}

		for (var j = i+1; j < this.hazardList.length; j++)	{
			if (collideCircleCircle(haz.position, haz.radius,
					this.hazardList[j].position, this.hazardList[j].radius))	{
				this.hazardList[j].makePhysical(haz.position, haz.getRealVelocity().outScalarMult(1.2));
				haz.makePhysical(this.hazardList[j].position, this.hazardList[j].getRealVelocity().outScalarMult(1.2));
				this.makeExposion(haz.position,true);
			}
		}
		haz.update(delta, planetMan);	
	}
};

HazardManager.prototype.makeExposion = function(pos, small)	{
	explode = this.pm.addEmitterByType("shockwave", 
                    new createjs.Rectangle(pos.x,pos.y,1,1), 
                    new Vector(0,0), new Vector(0,0), undefined);
	if (small)	{
		explode.circleBurst(24, 80, 130, 0.25, 0.5, "R", 0, 360, false, "wave");
		explode.circleBurst(12, 150, 230, 0.5, 0.75, "R", 0, 360, false, "wave");
	}	else 	{
		explode.circleBurst(32, 80, 130, 0.5, 1.0, "R", 0, 360, false, "wave");
		explode.circleBurst(24, 250, 330, 0.5, 1.5, "R", 0, 360, false, "wave");
		createjs.Sound.play("SexpMine");
	}			
}

HazardManager.prototype.spawnHazard = function(center, rad)	{
	console.log("SPAWNING")

	var num = Math.random()*100;
	if (num < 0.2)	{
		var type = Hazard.prototype.superRare[Math.floor(Math.random()*Hazard.prototype.superRare.length)];
	}	else if (num < 1)	{
		var type = Hazard.prototype.rare[Math.floor(Math.random()*Hazard.prototype.rare.length)];
	}	else	{
		var type = Hazard.prototype.common[Math.floor(Math.random()*Hazard.prototype.common.length)];
	}

	var haz = new Hazard(type, rad, center, (1.0+Math.random())*Math.sign(Math.random()-0.5));
	this.hazardList.push(haz);
	this.stage.addChild(haz.sprite);
};

HazardManager.prototype.destroyHazard = function(IDX) {
	if (IDX > this.hazardList.length)	{
		console.log("ATTEMPTED TO REMOVE NON-EXISTENT HAZARD: ", IDX);
		return;
	}

	this.stage.removeChild(this.hazardList[IDX].sprite);
	this.hazardList.splice(IDX,1);
};

HazardManager.prototype.clearAll = function()	{
	this.stage.removeAllChildren();
	this.hazardList = [];
};

HazardManager.prototype.checkCollisions = function(point, rad)	{
	for (var i = 0; i < this.hazardList.length; i++)	{
		if (collideCircleCircle(this.hazardList[i].position, this.hazardList[i].radius, 
			point, rad))	{
			return this.hazardList[i]
		}
	}
}

HazardManager.prototype.makeHazardSaveList = function()	{
	out = [];
	for (var i = 0; i < this.hazardList.length; i++)	{
		var haz = this.hazardList[i]
		out.push(
		{
			type:haz.type,
			orbCenter:haz.orbitalCenter,
			orbRad:haz.orbitalRadius,
			orbVel:haz.orbitalAngularVelocity
		})
	}
	return out;
}

HazardManager.prototype.loadFromSave = function(save)	{
	console.log("LOADING")
	this.makeHazardsFromList(save.hazardList);
}

HazardManager.prototype.makeHazardsFromList = function(inlist)	{
	if (inlist === undefined)	{
		console.log("ERROR: Attempted to load from empty hazard list.");
		return;
	}
	// this.clearAll();
	console.log(inlist.length)
	for (var i = 0; i < inlist.length; i++)	{
		var haz = new Hazard(
			inlist[i].type, inlist[i].orbRad, 
			inlist[i].orbCenter, inlist[i].orbVel
			);
		this.hazardList.push(haz);
		this.stage.addChild(haz.sprite);
	}
}