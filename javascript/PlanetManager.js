function PlanetManager()
{
	this.planetBorder = new Vector(100,100);
	this.stage = new createjs.Container();

	this.dbgShape = new createjs.Shape();

	this.planetList = new Array();

	this.planetExclusionZone = 100;
	this.shipPlanetExclusionZone = 150;

	this.resultVec = new Vector(0,0);
	this.tempVec = new Vector(0,0);
}

PlanetManager.prototype.Update = function(delta) {
	if (DEBUG)	{
		this.dbgShape.graphics.clear();
		
		for (var i = 0; i < this.planetList.length; i++)	{
			this.dbgShape.graphics.s("#5F5");
			this.dbgShape.graphics.dc(this.planetList[i].sprite.x, 
									 this.planetList[i].sprite.y, 
									 this.planetList[i].radius);
			this.dbgShape.graphics.es();
		}
	}
};

PlanetManager.prototype.spawnPlanets = function(num) {
	this.planetList = new Array();

	while(num > 0)	{
		var placed = false;
		var planet = new Planet(0.25+Math.random()*0.75);

		while (!placed)	{
			placed = true;

			var pos = new Vector(this.planetBorder.x + Math.random()*(canvas.width-this.planetBorder.x*2),
								this.planetBorder.y + Math.random()*(canvas.height-this.planetBorder.y*2));

			for (var i = 0; i < this.planetList.length; i++)	{
				if (collideCircleCircle(pos, planet.radius, this.planetList[i].sprite, this.planetList[i].radius+this.planetExclusionZone))	{
					placed = false;
					break;
				}
			}
		}

		planet.sprite.x = pos.x;
		planet.sprite.y = pos.y;

		this.stage.addChild(planet.sprite);
		this.planetList.push(planet);

		num--;
	}
};

PlanetManager.prototype.getShipSpawn = function(shipSize)	{
	var placed = false;
	while (!placed)	{
		placed = true;
		var pos = new Vector(this.planetBorder.x + Math.random()*(canvas.width-this.planetBorder.x*2),
								this.planetBorder.y + Math.random()*(canvas.height-this.planetBorder.y*2));
		for (var i = 0; i < this.planetList.length; i++)	{
			if (collideCircleCircle(pos, shipSize, this.planetList[i].sprite, this.planetList[i].radius+this.shipPlanetExclusionZone))	{
				placed = false;
				break;
			}
		}
	}
	return pos;	
};

PlanetManager.prototype.getTotalAttractionVector = function(pos, output)	{
	output.x = output.y = 0;
	this.tempVec.y = this.tempVec.x = 0;

	for (var i = 0; i < this.planetList.length; i++)	{

		this.tempVec = this.attractionFunction(pos, this.planetList[i]);
		output.x += this.tempVec.x;
		output.y += this.tempVec.y;
	}
}

PlanetManager.prototype.attractionFunction = function(pos, planet)	{
	var result = pos.seperation(planet.sprite);
	result.normalise();
	return result.scalarMult(planet.mass*0.0005 / pos.seperation(planet.sprite).norm() // 1/r
		+ planet.mass / ( Math.pow(pos.seperation(planet.sprite).norm(),2) ) );  // 1/ r^2
}

PlanetManager.prototype.checkCollisions = function(position, rad)	{
	for (var i = 0; i < this.planetList.length; i++)	{
		if (collideCircleCircle(position, rad, this.planetList[i].sprite, this.planetList[i].radius))	{
			return true;
		}
	}
	return false;
}

PlanetManager.prototype.integratePath = function(sPos, sVel, objRad, maxt)	{
	var output = {"path":new Array(), "time":0} ;
	output.path.push(sPos.clone());
	
	var position = sPos.clone();
	var velocity = sVel.clone();
	var force    = new Vector(0,0);
	
	while (output.time <= maxt)	{
		output.time += TIMESTEP;

		force.x = force.y = 0;
		this.getTotalAttractionVector(position, force);

		velocity.x += force.x*TIMESTEP;
		velocity.y += force.y*TIMESTEP;

		position.x += velocity.x*TIMESTEP;
		position.y += velocity.y*TIMESTEP;

		output.path.push(position.clone());
		if ( this.checkCollisions(position, objRad) )	{
			return output;
		}
	}

	return output;
}