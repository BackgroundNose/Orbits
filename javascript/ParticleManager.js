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
		var sepScal = 0;

		for (var i=0; i < this.emitterList.length; i++)
		{
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
											8, 64, 16, vectorLow, vectorHi, -1));
			this.emitterList[this.emitterList.length-1].particlePrototype.ttl = 10;
			this.emitterList[this.emitterList.length-1].args.push(additionals.pm);
			return this.emitterList[this.emitterList.length-1];
		case "dustCloudTrail":
			this.emitterList.push(new Emitter(type+this.getEID().toString(), emitBox, this.subStage, this.protoParticles.dustCloudTrail.clone(),
											15, 32, 32, vectorLow, vectorHi, -1));
			this.emitterList[this.emitterList.length-1].particlePrototype.ttl = 5;
			return this.emitterList[this.emitterList.length-1];
		case "fuse":
			this.emitterList.push(new Emitter(type+this.getEID().toString(), emitBox, this.subStage, this.protoParticles.spark, 
                      35, 64, -1, new Vector(-15,-15), new Vector(25, -95), -1));
			this.emitterList[this.emitterList.length-1].setRandomEmit(0.15,0.2);
			this.emitterList[this.emitterList.length-1].canEmit = false;
			this.emitterList[this.emitterList.length-1].args.push(additionals.pm);
			this.emitterList[this.emitterList.length-1].args.push(1.0);
			return this.emitterList[this.emitterList.length-1];
		case "sSmokePuff":
			this.emitterList.push(new Emitter(type+this.getEID().toString(), emitBox, this.subStage, this.protoParticles.exploCloud,
											1,256,-1, new Vector(-15,-15), new Vector(25, -95), -1));
			this.emitterList[this.emitterList.length-1].args.push(additionals.pm);
			this.emitterList[this.emitterList.length-1].args.push(1.0);
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
											0, 256, 0, new Vector(0,0), new Vector(0,0), 0.1));
			return this.emitterList[this.emitterList.length-1];
		case "warp":
			this.emitterList.push(new Emitter(type+this.getEID().toString(), emitBox, this.subStage, this.protoParticles.warp,
											32, 256, -1, vectorLow, vectorHi, -1));
			this.emitterList[this.emitterList.length-1].basettl = this.emitterList[this.emitterList.length-1].particlePrototype.ttl;
			return this.emitterList[this.emitterList.length-1];
		case "superWarp":
			this.emitterList.push(new Emitter(type+this.getEID().toString(), emitBox, this.superStage, this.protoParticles.warp,
											32, 42, -1, vectorLow, vectorHi, -1));
			this.emitterList[this.emitterList.length-1].basettl = this.emitterList[this.emitterList.length-1].particlePrototype.ttl;
			return this.emitterList[this.emitterList.length-1];
		case "gravWarp":
			this.emitterList.push(new Emitter(type+this.getEID().toString(), emitBox, this.superStage, this.protoParticles.gravWarp,
											1, 256, -1, vectorLow, vectorHi, -1));
			this.emitterList[this.emitterList.length-1].basettl = this.emitterList[this.emitterList.length-1].particlePrototype.ttl;
			this.emitterList[this.emitterList.length-1].args.push(additionals.pm);
			this.emitterList[this.emitterList.length-1].args.push(0.1);
			return this.emitterList[this.emitterList.length-1];
		default:
			console.log("Unknown particle type!: ",type);
			return undefined;
	}

	
};