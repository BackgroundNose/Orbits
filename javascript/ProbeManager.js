function ProbeManager(minP, maxP, minProp, particleManager)	
{
	this.particleManager = particleManager;
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

	this.markers = true;

	this.camRect = new createjs.Rectangle(0,0,canvas.width, canvas.height);	//What the camera covers in world space

}

ProbeManager.prototype.Update = function(delta, planetManager) {
	if (DEBUG)	{
		this.dbgShape.graphics.clear();
	}

	for (var i = 0; i < this.probeList.length; i++)	{
		if (DEBUG)	{
			this.dbgShape.graphics.s("#F55");
		}
		if (this.probeList[i].experienceGravity)	{
			var force = new Vector(0,0);
			planetManager.getTotalAttractionVector(this.probeList[i].position, force);
			this.probeList[i].addForce(force);
			this.probeList[i].Update(delta, this.camRect, this.markers);
		}

		if (planetManager.checkCollisions(this.probeList[i].position, this.probeList[i].radius, true))	{
			this.probeList[i].kill = true;
		}
		var scanReturn = planetManager.checkScans(this.probeList[i].position, this.probeList[i].radius);
		for (var s = 0; s < scanReturn.length; s++)	{
			if (!contains(this.probeList[i].scannedList, scanReturn[s]))	{
				this.probeList[i].scannedList.push(scanReturn[s]);
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
			this.stage.removeChild(this.probeList[i].scannedText);
			this.probeList.splice(i,1);
			i--;
		}
	}
};

ProbeManager.prototype.clearStuff = function()	{
	for (var i = 0; i < this.probeList.length; i++)	{
		this.stage.removeChild(this.probeList[i].sprite);
		this.stage.removeChild(this.probeList[i].scannedText);
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

	smokeVec = new Vector(0,-1);
	smokeVec.rotate(toRad(angle+180));
	this.particleManager.addEmitterByType("sSmokePuff", new createjs.Rectangle(position.x, position.y, 1,1), undefined,
										  undefined, {direction:smokeVec, pm:pm, force:power});

	if (this.scansRequired > 0)	{
		this.stage.addChild(probe.scannedText);
	}
};

ProbeManager.prototype.refireProbe = function(angle, power)	{
	if (this.probeList.length == 0)	{
		console.log("Trying to refire non existant probe!");
		return;
	}	

	if (!intersectRect(this.camRect, this.probeList[0].rect))	{
		this.probeList[0].kill = true;
		this.probeList[0].stopAndWait();
	}	else	{
		this.pushProbe(0, angle, power);
	}
	return;
}

ProbeManager.prototype.stopOrKillProbe = function()	{
	if (this.probeList.length == 0)	{
		return;
	}

	if (!intersectRect(this.camRect, this.probeList[0].rect))	{
		this.probeList[0].kill = true;
		return;
	}
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
		if (this.probeList[i].scannedList.length >= this.scansRequired)	{
			return true;
		}
	}
	return false;
}

ProbeManager.prototype.quantizeLaunchAngle = function(ang)	{
	return Math.floor(ang);
}

ProbeManager.prototype.quantizeLaunchPower = function(prop)	{
	return Math.floor(prop*50) / 50;
}
