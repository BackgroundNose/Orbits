function PlanetManager(pm)
{
	this.planetBorder = new Vector(100,100);
	this.stage = new createjs.Container();

	this.levelType = "scan";

	this.dbgShape = new createjs.Shape();

	this.planetList = new Array();

	this.planetExclusionZone = 100;
	this.shipPlanetExclusionZone = 150;

	this.resultVec = new Vector(0,0);
	this.tempVec = new Vector(0,0);

	this.minPlanetRadius = 12;
	this.maxPlanetRadius = 50;
	this.minTargetExtraRadius = 35;
	this.maxTargetExtraRadius = 70;

	this.minMineShipDist = 350;

	this.remake = false;

	this.mine = undefined;
	this.solutionForce = undefined;
	this.solutionAngle = undefined;

	this.shipSpawnRect = new createjs.Rectangle(100,100,canvas.width/2.0, canvas.height-100);
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
			this.dbgShape.graphics.s("#AAF");
			this.dbgShape.graphics.dc(this.planetList[i].sprite.x, 
									 this.planetList[i].sprite.y, 
									 this.planetList[i].targetRadius);
			this.dbgShape.graphics.es();
		}
		if (this.mine !== undefined)	{
			this.dbgShape.graphics.s("#F33");
			this.dbgShape.graphics.dc(this.mine.sprite.x, 
								 this.mine.sprite.y, 
								 this.mine.radius);
			this.dbgShape.graphics.es();
		}
	}

	if (this.mine !== undefined)	{
		this.mine.update(delta);
	}

	if (this.mine !== undefined && this.mine.kill)	{
		this.remake = true;
		this.stage.removeChild(this.mine.cont);
		this.mine = undefined;
	}
};

PlanetManager.prototype.spawnPlanets = function(num) {
	console.log("Making planets")
	this.clearStuff();
	this.planetList = new Array();

	while(num > 0)	{
		var placed = false;
		var planetSize = this.minPlanetRadius + Math.random()*(this.maxPlanetRadius-this.minPlanetRadius);
		var scanSize = planetSize + this.minTargetExtraRadius+(Math.random()*(this.maxTargetExtraRadius-this.minTargetExtraRadius));

		var planet = new Planet(planetSize, scanSize, num);

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

		planet.moveTo(pos);

		this.stage.addChild(planet.sprite);
		this.planetList.push(planet);

		num--;
	}
};

PlanetManager.prototype.addTargetGraphics = function()	{
	for (var i = 0; i < this.planetList.length; i++ )	{
		this.stage.addChild(this.planetList[i].targetSprite);
	}
}

PlanetManager.prototype.clearStuff = function()	{
	if (this.mine !== undefined)	{
		this.stage.removeChild(this.mine.cont);
	}

	for (var i = 0; i < this.planetList.length; i++)	{
		this.stage.removeChild(this.planetList[i].sprite);
		this.stage.removeChild(this.planetList[i].targetSprite);
	}
	this.remake = false;
	this.planetList = new Array();
}

PlanetManager.prototype.getShipSpawn = function(shipSize)	{
	var placed = false;
	while (!placed)	{
		placed = true;
		var pos = new Vector(this.shipSpawnRect.x + Math.random()*(this.shipSpawnRect.width-this.shipSpawnRect.x),
								this.shipSpawnRect.y + Math.random()*(this.shipSpawnRect.height-this.shipSpawnRect.y));
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
	return result.scalarMult(planet.mass*0.0000 / pos.seperation(planet.sprite).norm() // 1/r
		+ planet.mass / ( Math.pow(pos.seperation(planet.sprite).norm(),2) ) );  // 1/ r^2
}

PlanetManager.prototype.checkCollisions = function(position, rad, mineCheck)	{
	for (var i = 0; i < this.planetList.length; i++)	{
		if (collideCircleCircle(position, rad, this.planetList[i].sprite, this.planetList[i].radius))	{
			return this.planetList[i];
		}
	}

	if (this.mine !== undefined && mineCheck && collideCircleCircle(position, rad, this.mine.position, this.mine.radius))	{
		this.mine.setupDeath();
		return this.mine;
	}
	return undefined;
}

PlanetManager.prototype.checkScans = function(position, rad, emit)	{
	var out = new Array();
	for (var i = 0; i < this.planetList.length; i++)	{
		if (collideCircleCircle(position, rad, this.planetList[i].sprite, this.planetList[i].targetRadius))	{
			out.push(this.planetList[i].num);
		}
	}
	return out;
}

PlanetManager.prototype.integratePath = function(sPos, sVel, objRad, maxt, record)	{
	if (record)	{
		var output = {"path":new Array(), "time":0, "scans":new Array()} ;
		output.path.push(sPos.clone());
	}

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
		
		var scanned = this.checkScans(position, objRad, false);
		for (var i = 0; i < scanned.length; i++)	{
			if (!contains(output.scans, scanned[i]))	{
				output.scans.push(scanned[i]);
			}
		}

		if ( this.checkCollisions(position, objRad, false) !== undefined )	{
			return output;
		}
	}

	return output;
}

PlanetManager.prototype.makeAngleList = function(probeMan)	{
	var aList = new Array();

	for (var ang = 0; ang < 360; ang += probeMan.angQuant)	{
		aList.push(probeMan.quantizeLaunchAngle(ang));
	}
	shuffleArray(aList);

	return aList;
}

PlanetManager.prototype.makeForceList = function(probeMan)	{
	var fList = new Array();
	for (var force = probeMan.minLaunchProp; force <= 1.0; force += probeMan.powerQuant)	{
		fList.push(probeMan.quantizeLaunchPower(force));
	} 

	shuffleArray(fList);
	return fList;
}

PlanetManager.prototype.makeMine = function(sPos, probeRad, mint, maxt, probeMan)	{

	var aList = this.makeAngleList(probeMan);
	var fList = this.makeForceList(probeMan);

	var launchV = new Vector(0,-1);

	var maxStep = Math.floor(maxt/TIMESTEP);
	var minStep = Math.floor(mint/TIMESTEP);

	for (var f = 0; f < fList.length; f++)	{
		for (var a = 0; a < aList.length; a++)	{
			launchV.x = 0;
			launchV.y = -1;
			launchV.rotate(toRad(aList[a]));
			launchV.scalarMult(fList[f]*probeMan.maxLaunchPower);

			var result = this.integratePath(sPos, launchV, probeRad, maxt, true);
			if ( result.path.length-1 > maxStep)	{
				for (var it = Math.min(maxStep,result.path.length-1); it >= minStep; it--)	{
					var step = result.path[it];
					if ( step.x <= canvas.width - this.planetBorder.x 
						&& step.x >= this.planetBorder.x
						&& step.y <= canvas.height - this.planetBorder.y
						&& step.y >= this.planetBorder.y 
						&& Math.sqrt(Math.pow(step.x-sPos.x,2) + Math.pow(step.y-sPos.y,2)) >= this.minMineShipDist)
					{
						this.mine = new Mine();
						this.mine.moveTo(step);
						this.stage.addChild(this.mine.cont);
						
						console.log(aList[a], fList[f]);

						this.solutionForce = fList[f];
						this.solutionAngle = aList[a];
						return result;
					}
				}
			}
		}
	}

	console.log("Failed to make mine");
	return undefined;
}

PlanetManager.prototype.makeScanPath = function(sPos, probeRad, mint, maxt, minScan, probeMan)	{
	aList = this.makeAngleList(probeMan);
	fList = this.makeForceList(probeMan);

	var launchV = new Vector(0,-1);
	var maxStep = Math.floor(maxt/TIMESTEP);
	var minStep = Math.floor(mint/TIMESTEP);

	for (var f = 0; f < fList.length; f++)	{
		for (var a = 0; a < aList.length; a++)	{
			launchV.x = 0;
			launchV.y = -1;
			launchV.rotate(toRad(aList[a]));
			launchV.scalarMult(fList[f]*probeMan.maxLaunchPower);

			var result = this.integratePath(sPos, launchV, probeRad, maxt, true);

			if (result.scans.length >= minScan)	{
				this.mine = undefined;

				console.log(aList[a], fList[f], "To Scan:", result.scans.length);
				
				this.solutionForce = fList[f];
				this.solutionAngle = aList[a];	
				return result;
			}
		}
	}
}