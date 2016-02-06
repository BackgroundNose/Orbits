function Emitter(name, emitBox, stage, particle, emitRate, maxParticles, numToEmit, emitVelocityLow, emitVelocityHigh, ttl)
{
	this.stage = stage;

	this.particlePrototype = particle.clone();
	this.particlePrototype.parentEmitter = this;

	this.emitBox = emitBox;

	this.emitVelocityLow = emitVelocityLow;
	this.emitVelocityHigh = emitVelocityHigh;

	this.lastEmit = 0;
	this.currentEmitRate = 1/emitRate;
	this.emitRateMin = 1/emitRate;			// to give time between emissions for particles per second
	this.emitRateMax = 1/emitRate;
	this.numToEmit = numToEmit;					// -1 is infinite
	this.maxParticles = maxParticles;

	this.canEmit = true;						// hard stop-go for emission

	this.ttl = ttl;								// -1 indicates eternal emitter.
	this.elapsed = 0;
	this.dead = false;


	this.rangeDependent = false;

	this.name = name;	//Friendly name for the emitter for debugging purposes.

	this.particleList = new Array();

	this.args = new Array();		// This is filled with references to arguments needed for update.
}

Emitter.prototype.Update = function(delta)
{
	delta = delta;
	this.lastEmit += delta;
	this.elapsed  += delta;

	if (this.elapsed >= this.ttl && this.ttl != -1 && !this.dead)	{	// -1 indicates eternal emitter
		this.dead = true;
		console.log("killing "+this.name)
	} 
	else 
	{
		if ( this.canEmit && !this.dead &&
			( this.lastEmit >= this.currentEmitRate) 	// If we are set to emit all at once, or enough time has elapsed
			&& 	( this.numToEmit > 0 || this.numToEmit == -1)				// AND there are still more to emit or it is unlimited (-1)			
			)
		{
			this.emit(Math.floor(this.lastEmit/this.currentEmitRate));
			this.currentEmitRate = this.emitRateMin + Math.random()*(this.emitRateMax-this.emitRateMin);
		}
			
		this.lastEmit %= this.currentEmitRate;	
	}

	this.livingParticles = 0;
	for (var i = 0; i < this.particleList.length; i++)
	{
		if (!this.particleList[i].dead)
		{
			this.particleList[i].elapsed += delta;

			if (this.particleList[i].elapsed > this.particleList[i].ttl)
			{
				this.particleList[i].dead = true;
				this.particleList[i].phase = 0;
				if (this.particleList.onStage)
				{
					this.stage.removeChild(this.particleList[i].sprite);
					if (this.particleList[i].shape !== undefined)	{
						this.stage.removeChild(this.particleList[i].shape);
					}
					this.particleList[i].onStage = false;
				}
			}
			else
			{
				this.livingParticles++;
				if (this.particleList[i].moveFunction !== undefined)
					{this.particleList[i].moveFunction(delta);}
				else
					{console.log("WARNING undefined moveFunction for particle in emitter: "+this.name)}
			}
		}	
		else if (this.particleList[i].onStage)
		{
			this.stage.removeChild(this.particleList[i].sprite);
			if (this.particleList[i].shape !== undefined)	{
				this.stage.removeChild(this.particleList[i].shape);
			}
			this.particleList[i].onStage = false;
		}
	}

	if (this.livingParticles == 0 && this.numToEmit == 0)	{
		this.dead = true;
	}
}

Emitter.prototype.getNewParticle = function()
{
	var done = false;
	var emitIDX = -1;

	for  (var i = 0; i < this.particleList.length; i++)
	{
		if (this.particleList[i].dead)
		{
			emitIDX = i;
			done = true;
		}
	}
	if (!done)
	{
		if (this.particleList.length < this.maxParticles)
		{
			this.particleList.push(this.particlePrototype.clone());
			emitIDX = this.particleList.length-1;
		}
		else
			{	return undefined;	}		// Emitter is at limit and all particles are alive
	}
	return emitIDX;
}

Emitter.prototype.emit = function(toEmit)
{
	var emitIDX = undefined;

	while (toEmit > 0)
	{
		emitIDX = this.getNewParticle();
		if (emitIDX === undefined)
			{	return;	}			
		this.particleList[emitIDX].dead = false;
		this.particleList[emitIDX].sprite.x = this.particleList[emitIDX].worldPosition.x = this.emitBox.x + Math.random()*this.emitBox.width;
		this.particleList[emitIDX].sprite.y = this.particleList[emitIDX].worldPosition.y = this.emitBox.y + Math.random()*this.emitBox.height;
		this.particleList[emitIDX].lastPosition.x = this.particleList[emitIDX].worldPosition.x;
		this.particleList[emitIDX].lastPosition.y = this.particleList[emitIDX].worldPosition.y;
		
		this.particleList[emitIDX].velocity.x = this.emitVelocityLow.x + Math.random()*(this.emitVelocityHigh.x - this.emitVelocityLow.x);
		this.particleList[emitIDX].velocity.y = this.emitVelocityLow.y + Math.random()*(this.emitVelocityHigh.y - this.emitVelocityLow.y);
		this.particleList[emitIDX].ttl = this.particlePrototype.ttl;
		this.particleList[emitIDX].moveFunction = this.particlePrototype.moveFunction;
		this.particleList[emitIDX].elapsed = 0;
		this.particleList[emitIDX].randomFrame = this.particlePrototype.randomFrame;
		this.particleList[emitIDX].randomRotation = this.particlePrototype.randomRotation;
		this.particleList[emitIDX].phase = 0; 


		if (this.particleList[emitIDX].randomAnimation)	{
			this.particleList[emitIDX].setToRandomAnimation();
		}   else if (this.particleList[emitIDX].randomFrame)	{
			this.particleList[emitIDX].setToRandomFrame();
		}

		if (this.particleList[emitIDX].randomRotation)	{
			this.particleList[emitIDX].setToRandomRotation();
		}

		if (!this.particleList[emitIDX].onStage)
		{
			this.stage.addChild(this.particleList[emitIDX].sprite);
			if (this.particleList[emitIDX].shape !== undefined)	{
				this.stage.addChild(this.particleList[emitIDX].shape);
			}
			this.particleList[emitIDX].onStage = true;
		}
		toEmit--;
	}
}

Emitter.prototype.circleBurst = function(toEmit, speedMin, speedMax, scaleMin, scaleMax, rotMode, rotMin, rotMax, randFrame, animation)
{
	var angleInc = (2*Math.PI) / toEmit;
	var emitIDX = undefined;
	var emissionList = new Array();
	while (toEmit > 0)	{
		emitIDX = this.getNewParticle();
		if (emitIDX === undefined)
			return emissionList;
		emissionList.push(emitIDX);
		this.particleList[emitIDX].dead = false;
		this.particleList[emitIDX].sprite.x = this.particleList[emitIDX].worldPosition.x = this.emitBox.x + this.emitBox.width/2;
		this.particleList[emitIDX].sprite.y = this.particleList[emitIDX].worldPosition.y = this.emitBox.y + this.emitBox.height/2;

		this.particleList[emitIDX].velocity.x = 0;
		this.particleList[emitIDX].velocity.y = -1;
		this.particleList[emitIDX].velocity.rotate(toEmit*angleInc);
		this.particleList[emitIDX].velocity.scalarMult(speedMin + Math.random()*(speedMax-speedMin));
		this.particleList[emitIDX].ttl = this.particlePrototype.ttl;
		this.particleList[emitIDX].moveFunction = this.particlePrototype.moveFunction;
		this.particleList[emitIDX].elapsed = 0;
		this.particleList[emitIDX].sprite.scale = scaleMin+Math.random()*(scaleMax-scaleMin);
		this.particleList[emitIDX].sprite.scaleX = this.particleList[emitIDX].sprite.scaleY = this.particleList[emitIDX].sprite.scale;
		this.particleList[emitIDX].rotationRate = rotMin + Math.random()*(rotMax-rotMin);
		if (rotMode == "A")	{
			this.particleList[emitIDX].sprite.rotation = toEmit*angleInc/(2*Math.PI)*360;
		}	else if (rotMode == "R")	{
			this.particleList[emitIDX].sprite.rotation = Math.random()*360;
		}	

		if (this.particleList[emitIDX].randomAnimation)	{
			this.particleList[emitIDX].setToRandomAnimation();
		}	else if (randFrame || this.particleList[emitIDX].randomFrame){
			this.particleList[emitIDX].setToRandomFrame();
		}	else {
			this.particleList[emitIDX].sprite.stop();
		}

		if (this.particleList[emitIDX].randomRotation)	{
			this.particleList[emitIDX].setToRandomRotation();
		}
		if (animation !== undefined)	{
			this.particleList[emitIDX].sprite.gotoAndPlay(animation);
		}

		if (!this.particleList[emitIDX].onStage)
		{
			this.stage.addChild(this.particleList[emitIDX].sprite);
			if (this.particleList[emitIDX].shape !== undefined)	{
				this.stage.addChild(this.particleList[emitIDX].shape);
			}
			this.particleList[emitIDX].onStage = true;
		}

		toEmit--;
		emitIDX = undefined;
	}
	return emissionList;
}

Emitter.prototype.killAll = function()	{
	for (var i = 0; i < this.particleList.length; i++)	{
		this.particleList[i].dead = true;
	}
}

Emitter.prototype.directedBurst = function(toEmit, direction, deviation, speedMin, speedMax, scaleMin, scaleMax, rotMode, rotMin, rotMax, randFrame)
{
		var list = this.circleBurst(toEmit, speedMin, speedMax, scaleMin, scaleMax, rotMode, rotMin, rotMax, randFrame);

		for (var i = 0; i < list.length; i++)	{
			this.particleList[list[i]].velocity = direction.outNormalised();
			this.particleList[list[i]].velocity.rotate(toRad(-deviation + Math.random()*(deviation*2)));
			this.particleList[list[i]].velocity.scalarMult(speedMin+Math.random()*(speedMax-speedMin));
		}
		return list;
};

Emitter.prototype.moveBoxTo = function(pos)	{
	this.emitBox.x = pos.x;
	this.emitBox.y = pos.y;
}

Emitter.prototype.moveBy = function(shift)	{
	this.emitBox.x += shift.x;
	this.emitBox.y += shift.y;
}

Emitter.prototype.shiftAllParticles = function(shift)	{
	for (var i = 0; i < this.particleList.length; i++)	{
		this.particleList[i].moveBy(shift);
	}
}

Emitter.prototype.setRandomEmit = function(min, max)	{
	this.emitRateMin = min;
	this.emitRateMax = max;
}