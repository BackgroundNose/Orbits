function ParticleManager()
{
	console.log("Setting up particles...");
	this.emitterList = new Array();
	this.subStage = new createjs.Container();
	this.superStage = new createjs.Container();

	this.protoParticles = new ProtoParticles();
	console.log("Setting up particles... Done!");

	this.subStage.x = 0;
	this.subStage.y = 0;

	this.superStage.x = 0;
	this.superStage.y = 0;

	this.updateRange = 600;

	this.eID = 0;

	this.boxSepVec =  new Vector(0,0);

	this.update = function(delta)
	{
		// this.subStage.x = -camrect.x;
		// this.subStage.y = -camrect.y;

		// this.superStage.x = -camrect.x;
		// this.superStage.y = -camrect.y;

		var sepScal = 0;

		for (var i=0; i < this.emitterList.length; i++)
		{
			// this.boxSepVec.x = ((this.emitterList[i].emitBox.x + this.emitterList[i].emitBox.width/2) - (camrect.x + camrect.width/2) );
			// this.boxSepVec.y = ((this.emitterList[i].emitBox.y + this.emitterList[i].emitBox.height/2) - (camrect.y + camrect.height/2) );

			// sepScal = this.boxSepVec.norm();

			// if (this.emitterList[i].rangeDependent && sepScal > this.updateRange)	{
			// 	this.emitterList[i].canEmit = false;
			// }	else if ( this.emitterList[i].rangeDependent)	{
			// 	this.emitterList[i].canEmit = true;
			// }

			if (this.emitterList[i].dead && this.emitterList[i].livingParticles == 0)	{	
				for (var j = 0; j < this.emitterList[i].particleList.length; j++)	{
					if (this.emitterList[i].particleList[j].onStage)
						{	this.emitterList[i].stage.removeChild(this.emitterList[i].particleList[j].sprite);	}
				}
				this.emitterList.splice(i, 1);
				i--;
			}
			else 
			{	
				this.emitterList[i].Update(delta);
			}
		}
	}

	this.moveEmitterBy = function(name, moveBy)
	{
		for (var i = 0; i < this.emitterList.length; i++ )
		{
			if (this.emitterList[i].name == name)
			{
				this.emitterList[i].emitBox.x += moveBy.x;
				this.emitterList[i].emitBox.y += moveBy.y;
				return;
			}
		}
		console.log("WARNING: Emitter: " + name + " not found for moving By!");
	}

	this.moveEmitterTo = function(name, moveTo)
	{
		for (var i = 0; i < this.emitterList.length; i++ )
		{
			if (this.emitterList[i].name == name)
			{
				this.emitterList[i].emitBox.x = moveTo.x;
				this.emitterList[i].emitBox.y = moveTo.y;
				return;
			}
		}
		console.log("WARNING: Emitter: " + name + " not found for moving To!");
	}

	this.getEmitterByName = function(name)
	{
		for (var i = 0; i < this.emitterList.length; i++)
		{
			if (this.emitterList[i].name == name)
			{return this.emitterList[i]}
		}
	}

	this.getEID = function()
	{	
		return this.eID++; 	
	}	
};

ParticleManager.prototype.shiftAllParticles = function(shift)	{
	for (var i = 0; i < this.emitterList.length; i++)	{
		this.emitterList[i].shiftAllParticles(shift);
	}
}


ParticleManager.prototype.addEmitterByType = function(type, emitBox, vectorLow, vectorHi, additionals)
{
	if (emitBox.width === undefined || emitBox.height === undefined)	{
		emitBox.width = 1;
		emitBox.height = 1;
	}
	switch (type)	
	{
		case "dustCloud":
			this.emitterList.push(new Emitter(type+this.getEID().toString(), emitBox, this.subStage, this.protoParticles.dustCloud.clone(),
											8, 64, 8, vectorLow, vectorHi, -1));
			this.emitterList[this.emitterList.length-1].particlePrototype.ttl = 10;
			this.emitterList[this.emitterList.length-1].args.push(additionals.pm);
			this.emitterList[this.emitterList.length-1].setRandomEmit(2.0,5.1);
			return this.emitterList[this.emitterList.length-1];
		case "dustCloudTrail":
			this.emitterList.push(new Emitter(type+this.getEID().toString(), emitBox, this.subStage, this.protoParticles.dustCloudTrail.clone(),
											15, 32, 32, vectorLow, vectorHi, -1));
			this.emitterList[this.emitterList.length-1].particlePrototype.ttl = 5;
			return this.emitterList[this.emitterList.length-1];
		case "fuse":
			this.emitterList.push(new Emitter(type+this.getEID().toString(), emitBox, this.superStage, this.protoParticles.spark, 
                      35, 64, -1, new Vector(-15,-15), new Vector(25, -95), -1));
			this.emitterList[this.emitterList.length-1].setRandomEmit(0.15,0.2);
			this.emitterList[this.emitterList.length-1].canEmit = false;
			this.emitterList[this.emitterList.length-1].args.push(additionals.pm);
			return this.emitterList[this.emitterList.length-1];
		case "sSmokePuff":
			this.emitterList.push(new Emitter(type+this.getEID().toString(), emitBox, this.superStage, this.protoParticles.exploCloud,
											1,256,-1, new Vector(-15,-15), new Vector(25, -95), -1));
			this.emitterList[this.emitterList.length-1].args.push(additionals.pm);
			return this.emitterList[this.emitterList.length-1];
		case "scan":
			this.emitterList.push(new Emitter(type+this.getEID().toString(), emitBox, this.superStage, this.protoParticles.scan,
											0,1024,-1, new Vector(-15,-15), new Vector(25, -95), -1));
			this.emitterList[this.emitterList.length-1].args.push(additionals.pm);
			this.emitterList[this.emitterList.length-1].args.push(additionals.probes);
			return this.emitterList[this.emitterList.length-1];
		case "bits":
			this.emitterList.push(new Emitter(type+this.getEID().toString(), emitBox, this.superStage, this.protoParticles.bits,
											0, 64, 0,new Vector(0,0), new Vector(0,0), 0.1));
			this.emitterList[this.emitterList.length-1].args.push(additionals.pm);
			return this.emitterList[this.emitterList.length-1];
		case "shockwave":
			this.emitterList.push(new Emitter(type+this.getEID().toString(), emitBox, this.superStage, this.protoParticles.shockwave,
											0, 32, 0, new Vector(0,0), new Vector(0,0), 0.1));
			return this.emitterList[this.emitterList.length-1];
		default:
			console.log("Unknown particle type!: ",type);
			return undefined;
	}

	
};