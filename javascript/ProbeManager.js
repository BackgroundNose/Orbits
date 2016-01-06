function ProbeManager(minP, maxP, minProp, particleManager, planetManager, levelBoundary)	
{
	this.puffEmitter = particleManager.addEmitterByType("sSmokePuff", new createjs.Rectangle(0, 0, 1,1), undefined,
								undefined, {pm:planetManager});
	this.thruster = particleManager.addEmitterByType("fuse", new createjs.Rectangle(0, 0, 1,1), undefined,
								undefined, {pm:planetManager});
	this.scanBurst = particleManager.addEmitterByType("scan", new createjs.Rectangle(0, 0, 1, 1),
		new Vector(0,0), new Vector(0,0), {pm:planetManager, probes:this})

	this.planetManagerRef = planetManager;

	this.puffEmitter.canEmit = false;
	this.stage = new createjs.Container();
	this.probeList = new Array();
	this.dbgShape = new createjs.Shape();

	this.minLaunchPower = minP;
	this.maxLaunchPower = maxP;
	this.minLaunchProp = minProp;
	this.powerRange = this.maxLaunchPower - this.minLaunchPower;

	this.angQuant = 360/360.0;	// 360/steps
	this.powerQuant = 1/100;

	this.scansRequired = 0;
	this.piecesPerScan = 32;
	this.piecesRequired = this.scansRequired*this.piecesPerScan;
	this.piecesCollected = 0;

	this.levelBoundary = levelBoundary;

	this.smokeParticles = 32;
}

ProbeManager.prototype.Update = function(delta, planetManager, UI, particleManager) {
	if (DEBUG)	{
		this.dbgShape.graphics.clear();
	}

	for (var i = 0; i < this.probeList.length; i++)	{
		if (DEBUG)	{
			this.dbgShape.graphics.s("#F55");
		}
		var lastPos = this.probeList[i].position.clone();
		var lastVel = this.probeList[i].velocity.clone();
		if (this.probeList[i].experienceGravity)	{
			var force = new Vector(0,0);
			planetManager.getTotalAttractionVector(this.probeList[i].position, force);
			this.probeList[i].addForce(force);
			this.probeList[i].Update(delta);
		}

		var hit = planetManager.checkCollisions(this.probeList[i].position, this.probeList[i].radius, true);
		if (hit !== undefined)	{
			var shockwave = particleManager.addEmitterByType("shockwave", new createjs.Rectangle(lastPos.x,lastPos.y,1,1), 
				new Vector(0,0), new Vector(0,0), undefined);
			shockwave.circleBurst(32, 80, 130, 1.0, 1.0, "R", 0, 360, false, "wave");
			shockwave.circleBurst(12, 250, 330, 0.5, 1.5, "R", 0, 360, false, "wave");
			
			var tempX = this.thruster.emitBox.x;
			var tempY = this.thruster.emitBox.y;
			this.thruster.emitBox.x = lastPos.x;
			this.thruster.emitBox.y = lastPos.y;
			this.thruster.circleBurst(32, 250, 530, 0.8, 1.2, "R", 0, 360, false);
			
			if (hit === planetManager.mine)	{
				console.log("here")
				shockwave.emitBox.x = hit.position.x;
				shockwave.emitBox.y = hit.position.y;
				this.thruster.emitBox.x = hit.position.x;
				this.thruster.emitBox.y = hit.position.y;
				shockwave.circleBurst(64, 100, 170, 1.0, 1.0, "R", 0, 360, false, "wave");
				shockwave.circleBurst(32, 200, 300, 0.5, 1.5, "R", 0, 360, false, "wave");
				this.thruster.circleBurst(16, 200, 330, 0.8, 1.2, "R", 0, 360, false);
			}

			this.thruster.emitBox.x = tempX;
			this.thruster.emitBox.y = tempY;

			this.probeList[i].kill = true;
		}
		if (!collidePointRect(this.probeList[i].position, this.levelBoundary))	{
			this.probeList[i].kill = true;
		}
		if (planetManager.levelType == "scan")	{
			var scanReturn = planetManager.checkScans(this.probeList[i].position, this.probeList[i].radius, true);
			for (var s = 0; s < scanReturn.length; s++)	{
				if (!contains(this.probeList[i].scannedList, scanReturn[s]))	{
					this.scanBurst.moveBoxTo(this.probeList[i].position);
					this.scanBurst.circleBurst(this.piecesPerScan, 160, 160, 1.0, 1.0, "A", 0, 0, true);
					this.probeList[i].scannedList.push(scanReturn[s]);
				}
			}
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
			if (this.piecesCollected < this.piecesRequired) {
				UI.startBoxDrop();
			}
			this.piecesCollected = 0;
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


ProbeManager.prototype.spawnProbe = function(position, angle, power, pm) {
	if ( this.probeList.length > 0)	{
		this.refireProbe(angle, power);
		return;
	}
	var probe = new Probe(this.scansRequired);
	probe.moveTo(position);
	this.probeList.push(probe);
	this.pushProbe(this.probeList.length-1, angle, power);	
	this.stage.addChild(probe.sprite);

	var smokeVec = new Vector(0,-1);

	smokeVec.rotate(toRad(angle));

	this.puffEmitter.moveBoxTo(position);
	this.puffEmitter.directedBurst(
				this.smokeParticles,smokeVec,20,20*power, 175*power,0.5,1.0,"N",-0,0,true);

};

ProbeManager.prototype.refireProbe = function(angle, power)	{
	if (this.probeList.length == 0)	{
		console.log("Trying to refire non existant probe!");
		return;
	}	
	this.thruster.canEmit = false;
	if (!intersectRect(this.levelBoundary, this.probeList[0].rect))	{
		this.probeList[0].kill = true;
		this.probeList[0].stopAndWait();
	}	else	{

		var smokeVec = new Vector(0,-1);

		smokeVec.rotate(toRad(angle+180));

		this.puffEmitter.moveBoxTo(this.probeList[0].position);
		this.puffEmitter.directedBurst(
				power*this.smokeParticles,smokeVec,20,20*power, 175*power,0.5,1.0,"N",-0,0,true);
		this.pushProbe(0, angle, power);
	}
	return;
}

ProbeManager.prototype.stopOrKillProbe = function()	{
	if (this.probeList.length == 0)	{
		return;
	}

	if (!intersectRect(this.levelBoundary, this.probeList[0].rect))	{
		this.probeList[0].kill = true;
		return;
	}

	var vec = new Vector(0,0);
	this.planetManagerRef.getTotalAttractionVector(this.probeList[0].position, vec);
	vec.normalise();

	this.puffEmitter.moveBoxTo(this.probeList[0].position);
	this.puffEmitter.directedBurst(
				Math.min(Math.floor(this.probeList[0].velocity.norm()), this.smokeParticles), this.probeList[0].velocity.outNormalised(),20,
				0.2*this.probeList[0].velocity.norm(), this.probeList[0].velocity.norm(),
				0.5,1.0,"N",-0,0,true);
	
	this.thruster.moveBoxTo(this.probeList[0].position);
	vec.rotate(toRad(-5));
	this.thruster.emitVelocityLow = vec.outScalarMult(5);
	vec.rotate(toRad(10));
	this.thruster.emitVelocityHigh = vec.outScalarMult(100);
	
	this.thruster.canEmit = true;

	this.probeList[0].stopAndWait();
}

ProbeManager.prototype.pushProbe = function(idx, angle, power)	{
	var probe = this.probeList[idx];
	var newV = new Vector(0,-1);

	newV.rotate(toRad(this.quantizeLaunchAngle(angle)));
	newV.scalarMult(this.quantizeLaunchPower(power) * this.maxLaunchPower);
	probe.velocity.x += newV.x;
	probe.velocity.y += newV.y;
	probe.experienceGravity = true;
}

ProbeManager.prototype.checkScans = function()	{
	for (var i = 0; i < this.probeList.length; i++)	{
		if (this.piecesCollected >= this.piecesRequired)	{
			return true;
		}
	}
	return false;
}

ProbeManager.prototype.setScanRequired = function(required)	{
	this.scansRequired = required;
	this.piecesRequired = this.scansRequired*this.piecesPerScan;
	this.piecesCollected = 0;
}

ProbeManager.prototype.quantizeLaunchAngle = function(ang)	{
	return Math.floor(ang);
}

ProbeManager.prototype.quantizeLaunchPower = function(prop)	{
	return Math.floor(prop*50) / 50;
}
