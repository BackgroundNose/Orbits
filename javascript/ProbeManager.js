function ProbeManager(minP, maxP, minProp, particleManager, planetManager, levelBoundary)	
{
	this.puffEmitter = particleManager.addEmitterByType("sSmokePuff", new createjs.Rectangle(0, 0, 1,1), undefined,
								undefined, {pm:planetManager});
	this.puffEmitter.canEmit = false;
	this.thruster = particleManager.addEmitterByType("fuse", new createjs.Rectangle(0, 0, 1,1), undefined,
								undefined, {pm:planetManager});
	this.gravPart = particleManager.addEmitterByType("gravWarp", new createjs.Rectangle(0, 0, 30,30), new Vector(0,0),
								new Vector(0,0), {pm:planetManager});
	this.gravPart.setRandomEmit(0.2,1.0);
	this.gravPart.canEmit = false;
	this.scanBurst = particleManager.addEmitterByType("scan", new createjs.Rectangle(0, 0, 1, 1),
		new Vector(0,0), new Vector(0,0), {pm:planetManager, probes:this})

	this.planetManagerRef = planetManager;

	
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
	this.scanSounds = [["Sscan01", "Sscan05"], ["Sscan01", "Sscan03", "Sscan05"],  
						["Sscan01", "Sscan02", "Sscan03", "Sscan05"], 
						["Sscan01", "Sscan02", "Sscan03", "Sscan04","Sscan05"]];

	this.probeExplosionSounds = ["SexpP1","SexpP2","SexpP3","SexpP4","SexpP5"];

	this.levelBoundary = levelBoundary;

	this.smokeParticles = 32;
}

ProbeManager.prototype.Update = function(delta, planetManager, UI, particleManager, hazardManager, transition) {
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
			
		}

		this.probeList[i].Update(delta);

		var hit = planetManager.checkCollisions(this.probeList[i].position, this.probeList[i].radius, true);
		if (hit === undefined)	{
			hit = hazardManager.checkCollisions(this.probeList[i].position, this.probeList[i].radius);
		}

		if (hit !== undefined)	{
			if (!transition)	{
				createjs.Sound.play(this.probeExplosionSounds[Math.floor(Math.random()*this.probeExplosionSounds.length)]);
				var shockwave = particleManager.addEmitterByType("shockwave", 
					new createjs.Rectangle(this.probeList[i].position.x + this.stage.x,this.probeList[i].position.y,1,1), 
					new Vector(0,0), new Vector(0,0), undefined);
				shockwave.circleBurst(32, 80, 130, 1.0, 1.0, "R", 0, 360, false, "wave");
				shockwave.circleBurst(12, 250, 330, 0.5, 1.5, "R", 0, 360, false, "wave");
				
				// here we reuse the thruster emitter. We will make a backup of the box position
				var tempX = this.thruster.emitBox.x;
				var tempY = this.thruster.emitBox.y;
				this.thruster.emitBox.x = lastPos.x+ this.stage.x;
				this.thruster.emitBox.y = lastPos.y;
				this.thruster.circleBurst(32, 250, 530, 0.8, 1.2, "R", 0, 360, false);

				// and restore the backup.
				this.thruster.emitBox.x = tempX;
				this.thruster.emitBox.y = tempY;
			}
			this.probeList[i].kill = true;

			if (hit.objname == "HAZARD")	{
				hit.makePhysical(this.probeList[i].position, this.probeList[i].velocity);
			}
		}

		if (!collidePointRect(this.probeList[i].position, this.levelBoundary))	{
			this.probeList[i].kill = true;
		}

		if (planetManager.levelType == "scan")	{
			var scanReturn = planetManager.checkScans(this.probeList[i].position, this.probeList[i].radius, true);
			for (var s = 0; s < scanReturn.length; s++)	{
				if (!contains(this.probeList[i].scannedList, scanReturn[s]) && !transition)	{
					this.scanBurst.moveBoxTo(this.probeList[i].position);
					this.scanBurst.circleBurst(this.piecesPerScan, 160, 160, 1.0, 1.0, "A", 0, 0, true);
					this.probeList[i].scannedList.push(scanReturn[s]);
					this.playScanSound(i);
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
			this.stage.removeChild(this.probeList[i].field);
			this.stage.removeChild(this.probeList[i].trail);
			this.probeList.splice(i,1);
			planetManager.resetScanTargets();
			if (this.piecesCollected < this.piecesRequired) {
				UI.startBoxDrop();
			}
			this.piecesCollected = 0;
			i--;
		}
	}
};

ProbeManager.prototype.playScanSound = function(probe)	{
	createjs.Sound.play(
		this.scanSounds[this.scansRequired-2][Math.min(this.scanSounds[this.scansRequired-2].length-1, this.probeList[probe].scannedList.length-1)]);
} 

ProbeManager.prototype.clearStuff = function()	{
	for (var i = 0; i < this.probeList.length; i++)	{
		this.stage.removeChild(this.probeList[i].sprite);
		this.stage.removeChild(this.probeList[i].field);
		this.stage.removeChild(this.probeList[i].trail);
	}
	this.probeList.length = 0;
}


ProbeManager.prototype.spawnProbe = function(position, angle, power, pm, UI) {
	if ( this.probeList.length > 0)	{
		this.refireProbe(angle, power);
		return;
	}

	UI.updateText(0, 1, 0, 0);

	var probe = new Probe(this.scansRequired, position);
	this.probeList.push(probe);
	this.pushProbe(this.probeList.length-1, angle, power);	
	this.stage.addChild(probe.trail);
	this.stage.addChild(probe.sprite);
	this.stage.addChild(probe.field);

	createjs.Sound.play("Slaunch");

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
		this.gravPart.canEmit = false;
		this.pushProbe(0, angle, power);
		createjs.Sound.play("Slaunch");
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

	
	this.gravPart.moveBoxTo(new Vector(this.probeList[0].position.x - this.gravPart.emitBox.width/2.0, this.probeList[0].position.y- this.gravPart.emitBox.height/2.0 ));
	this.gravPart.directedBurst(
				Math.min(Math.floor(this.probeList[0].velocity.norm()), this.smokeParticles), this.probeList[0].velocity.outNormalised(),36,
				0.2*this.probeList[0].velocity.norm(), this.probeList[0].velocity.norm(),
				0.5,1.0,"N",-0,0,true);
	this.gravPart.emitVelocityLow = vec.outScalarMult(5);
	this.gravPart.emitVelocityHigh = vec.outScalarMult(100);
	
	this.gravPart.canEmit = true;

	createjs.Sound.play("Sgrav");

	this.probeList[0].stopAndWait(vec.rotate(toRad(-5)));
}

ProbeManager.prototype.pushProbe = function(idx, angle, power)	{
	var newV = new Vector(0,-1);

	newV.rotate(toRad(this.quantizeLaunchAngle(angle)));
	newV.scalarMult(this.quantizeLaunchPower(power) * this.maxLaunchPower);

	if (idx !== undefined)	{
		var probe = this.probeList[idx];
		probe.velocity.x += newV.x;
		probe.velocity.y += newV.y;
		probe.experienceGravity = true;
	}	else 	{
		return newV;
	}
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
