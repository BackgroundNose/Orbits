function Particle(sheet, velocity, moveFunction, ttl, parentEmitter, randFrame)
{
	this.sprite 		= new createjs.Sprite(sheet, "I");
	this.worldPosition 	= new Vector(0,0);
	this.elapsed		= 0; 
	this.ttl 			= ttl;
	this.moveFunction 	= moveFunction;
	this.velocity		= velocity;
	this.offset 		= this.sprite.getBounds();
	this.offset.x 		= this.offset.width/2;
	this.offset.y 		= this.offset.height/2;
	this.startFade 		= 0;

	this.randomFrame = randFrame;
	if (this.randomFrame)	{
		this.setToRandomFrame();
	}

	this.scale = 1;

	this.rotationRate = 0;

	this.dead = false;
	this.onStage = false;

	this.parentEmitter  = parentEmitter;
}

Particle.prototype.clone = function()
{
	var out = new Particle(this.sprite.spriteSheet, this.velocity.clone(), this.moveFunction, this.ttl, this.parentEmitter, this.randomFrame);
	out.sprite = this.sprite.clone();
	out.worldPosition = this.worldPosition.clone();
	out.elapsed = 0;
	out.scale = this.scale;
	out.rotationRate = this.rotationRate;
	out.moveFunction = this.moveFunction;
	out.dead = false;
	out.onStage = false;
	out.parentEmitter = this.parentEmitter;
	out.startFade = this.startFade;

	return out;
}

Particle.prototype.setToRandomFrame = function()	{
	this.sprite.gotoAndStop(this.sprite.spriteSheet.animations[Math.floor(Math.random()*this.sprite.spriteSheet.animations.length)]);
}