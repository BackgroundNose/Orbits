function Particle(sheet, velocity, moveFunction, ttl, parentEmitter, randFrame, randomAnimation, randomRotation)
{
	this.sprite 		= new createjs.Sprite(sheet, "I");
	this.worldPosition 	= new Vector(0,0);
	this.lastPosition   = new Vector(0,0);
	this.shape 			= undefined;
	this.elapsed		= 0; 
	this.ttl 			= ttl;
	this.moveFunction 	= moveFunction;
	this.velocity		= velocity;

	this.force 		    = new Vector(0,0);

	this.offset 		= this.sprite.getBounds();
	this.offset.x 		= this.offset.width/2;
	this.offset.y 		= this.offset.height/2;
	this.startFade 		= 0;

	this.phase 			= 0;	// Allows the particle to move through behaviours

	this.randomFrame = randFrame;
	this.randomAnimation = randomAnimation;
	this.randomRotation = randomRotation;

	if (this.randomAnimation)	{
		this.setToRandomAnimation();
	} 	else if (this.randomFrame)	{
		this.setToRandomFrame();
	}

	if (this.randomRotation)	{
		this.setToRandomRotation();
	}

	this.scale = 1;

	this.rotationRate = 0;

	this.dead = false;
	this.onStage = false;

	this.parentEmitter  = parentEmitter;
}

Particle.prototype.clone = function()
{
	var out = new Particle(this.sprite.spriteSheet, this.velocity.clone(),
	 	this.moveFunction, this.ttl, this.parentEmitter, this.randomFrame, this.randomAnimation);
	out.sprite = this.sprite.clone();
	out.worldPosition = this.worldPosition.clone();
	out.lastPosition = this.worldPosition.clone();

	out.elapsed = 0;
	out.scale = this.scale;
	out.rotationRate = this.rotationRate;
	out.moveFunction = this.moveFunction;
	out.dead = false;
	out.onStage = false;
	out.parentEmitter = this.parentEmitter;
	out.startFade = this.startFade;


	if (this.shape !== undefined)	{
		out.shape = new createjs.Shape();
	}

	if (this.randomAnimation)	{
		out.setToRandomAnimation();
	}	else if (this.randomFrame)	{
		out.setToRandomFrame();
	}	
	if (this.randomRotation)	{
		out.setToRandomRotation();
	}

	return out;
}

Particle.prototype.setToRandomFrame = function()	{
	this.sprite.gotoAndStop(Math.random() * this.sprite.spriteSheet.getNumFrames());
}

Particle.prototype.setToRandomAnimation = function()	{
	var anim = this.sprite.spriteSheet.animations[Math.floor(Math.random()*this.sprite.spriteSheet.animations.length)];
	this.sprite.gotoAndPlay(anim);
}

Particle.prototype.setToRandomRotation = function()	{
	this.sprite.rotation = 360*Math.random();		
}

Particle.prototype.moveBy = function(shift)	{
	this.lastPosition.x = this.worldPosition.x;
	this.lastPosition.y = this.worldPosition.y;
	this.worldPosition.x += shift.x;
	this.worldPosition.y += shift.y;
	this.sprite.x = this.worldPosition.x;
	this.sprite.y = this.worldPosition.y;
}