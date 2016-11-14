function PlanetManager(pm, hazman)
{
	this.hazman = hazman;

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
	this.minTargetExtraRadius = 45;
	this.maxTargetExtraRadius = 80;

	this.minMineShipDist = 550;

	this.remake = false;

	this.mine = undefined;
	this.solutionForce = undefined;
	this.solutionAngle = undefined;

	this.shipSpawnRect = new createjs.Rectangle(100,100,canvas.width/2.0, canvas.height-100);
}

PlanetManager.prototype.Update = function(delta, probeMan) {
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
			this.dbgShape.graphics.dc(this.mine.position.x, 
								 this.mine.position.y, 
								 this.mine.radius);
			this.dbgShape.graphics.es();
		}
	}

	if (this.mine !== undefined)	{
		this.mine.update(delta, probeMan);
	}	else 	{
		for (var i = 0; i < this.planetList.length; i++)	{
			var planet = this.planetList[i];
			if (planet.scanned)	{
				planet.scannedElapsed += delta;
				planet.targetSprite.alpha = Math.max(0.0, 1.0 - planet.scannedElapsed / planet.scannedFade);
			}	else if (planet.resetting)	{
				planet.resetElapsed += delta;
				if (planet.resetElapsed > planet.resetTime)	{
					planet.resetting = false;
					planet.resetElapsed = 0;
					planet.targetSprite.alpha = 1;
				} 	else 	{
					planet.targetSprite.alpha = planet.resetElapsed / planet.resetTime;
				}
			}
		}
	}

	if (this.mine !== undefined && this.mine.kill)	{
		this.remake = true;
		this.stage.removeChild(this.mine.cont);
		this.mine = undefined;
	}
};

PlanetManager.prototype.spawnPlanetsProgression = function(ilist)	{
	return;
}

PlanetManager.prototype.spawnPlanetsRandomly = function(num, progress) {
	console.log("Making planets", progress);
	this.clearStuff();
	this.planetList = new Array();

	while(num > 0)	{
		var placed = false;
		var planetSize = Math.floor(Math.random()*2.0 + Math.random()*2.0);
		var mass = Math.floor(Math.random()*2.0 + Math.random()*2.0);
		var scanSize = this.minTargetExtraRadius+(Math.random()*(this.maxTargetExtraRadius-this.minTargetExtraRadius));

		var planet = new Planet(planetSize, mass, scanSize, num);

		while (!placed)	{
			placed = true;

			var pos = new Vector(Math.floor(this.planetBorder.x + Math.random()*(canvas.width-this.planetBorder.x*2)),
								Math.floor(this.planetBorder.y + Math.random()*(canvas.height-this.planetBorder.y*2)));

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

	for (var i = 0; i < this.planetList.length; i++)	{
		if (Math.random() < progress)	{
			this.hazman.spawnHazard(this.planetList[i].position, 
				this.planetList[i].radius*(1.1+1.9*Math.random()));
		}
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
	this.hazman.clearAll();
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
		// Nasty use of global code. :(
		this.mine.startMineExplosion(position, game.particleManager);
		return this.mine;
	}
	return undefined;
}

PlanetManager.prototype.checkScans = function(position, rad, hide)	{
	var out = new Array();
	for (var i = 0; i < this.planetList.length; i++)	{
		if (collideCircleCircle(position, rad, this.planetList[i].sprite, this.planetList[i].targetRadius))	{
			out.push(this.planetList[i].num);
			if (hide)	{
				this.planetList[i].scanned = true;
			}
		}
	}
	return out;
}

PlanetManager.prototype.resetScanTargets = function()	{
	for (var i = 0; i < this.planetList.length; i++)	{
		if (this.planetList[i].scanned)	{
			this.planetList[i].resetting = true;
			this.planetList[i].resetElapsed = this.planetList[i].resetTime*(1.0-Math.min(1.0,this.planetList[i].scannedElapsed / this.planetList[i].scannedFade));

			this.planetList[i].scanned = false;
			this.planetList[i].scannedElapsed = 0;	
		}
	}
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
						this.placeMine(step);

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

PlanetManager.prototype.placeMine = function(pos)	{
	this.mine = new Mine();
	this.mine.moveTo(pos);
	this.stage.addChild(this.mine.cont);
}

PlanetManager.prototype.makeScanPath = function(sPos, probeRad, mint, maxt, minScan, probeMan)	{
	aList = this.makeAngleList(probeMan);
	fList = this.makeForceList(probeMan);

	var launchV = new Vector(0,-1);
	var maxStep = Math.floor(maxt/TIMESTEP);
	var minStep = Math.floor(mint/TIMESTEP);

	var best = 0;
	var bestResult = undefined;

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
			}	else if (result.scans.length > best)	{
				best = result.scans.length;
				bestResult = {"path":result.path.slice(),"time":result.time, "scans":result.scans.slice()};
			}
		}
	}
	if (best > 1)	{
		console.log("Good Enough for jazz", best)
		return bestResult;
	}
}

PlanetManager.prototype.makePlanetSaveList = function() {
	var out = []
	for (var i = 0; i < this.planetList.length; i++)	{
		out.push({'x':this.planetList[i].position.x/canvas.width, 'y':this.planetList[i].position.y/canvas.height,
			'mass':this.planetList[i].massIDX, 'size':this.planetList[i].sizeIDX,
			'scanSize':this.planetList[i].targetRadius - this.planetList[i].radius})
	}
	return out;
}

PlanetManager.prototype.loadFromEvent = function(evt)	{
	this.levelType = evt.type;
	this.makePlanetsFromList(evt.layout.planets);
	if (this.levelType == "mine")	{
		this.placeMine(new Vector(evt.layout.mine.x*canvas.width, evt.layout.mine.y*canvas.height));
	}	else if (this.levelType == "scan")	{
		console.log("SCAN")
	}
}

PlanetManager.prototype.loadFromSave = function(save)	{
	this.levelType = save.levelType;

	this.makePlanetsFromList(save.planetList);

	if (this.levelType == "mine")	{
		this.placeMine(save.minePos);
	}	else if (this.levelType == "scan")	{
		console.log("scan load")
		this.addTargetGraphics();
		this.addTargetGraphics();
		this.resetScanTargets();
	}
}

PlanetManager.prototype.makePlanetsFromList = function(inlist)	{
	if (inlist === undefined)	{
		console.log("ERROR: Planets list undefined")
		return;
	}
	this.clearStuff();
	for (var i = 0; i < inlist.length; i++)	{
		var planet = new Planet(inlist[i].size, inlist[i].mass, inlist[i].scanSize, i);
		planet.moveTo(new Vector(inlist[i].x*canvas.width, inlist[i].y*canvas.height));
		this.stage.addChild(planet.sprite);
		this.planetList.push(planet);
	}
}