function Ship(pm)	
{
	this.sprite = new createjs.Sprite(
					new createjs.SpriteSheet({
						"frames": {
                            "width": 60,
                            "height": 60,
                            "regX": 30,
                            "regY": 30,
                            "numFrames": 2
                        },
                        "animations": {
                            "player":[0],
                            "warping":[1]
                        },
                        "images": [preload.getResult("ship")]}) 
					);
	this.sprite.gotoAndStop("player");
	// this.sprite.rotation = 90;


	this.worldPosition = undefined;
	this.velocity = new Vector(0,0);
	this.force = new Vector(0,0);

	this.engineParticleOffset = new Vector(28,2);
	this.emitBox = new createjs.Rectangle(0,0,3,4);

	this.warpEmitterSub = pm.addEmitterByType("warp", this.emitBox, new Vector(-200,-0), new Vector(-250,0), undefined);
	this.warpEmitterSuper = pm.addEmitterByType("superWarp", this.emitBox, new Vector(-200,0), new Vector(-250,-0), undefined);
	this.warpEmitterSub.canEmit = false;
	this.warpEmitterSuper.canEmit = false;

	this.wingTips = new createjs.Shape();
	this.wingTipOffset = new Vector(-25,13);
	this.centerOffset = new Vector(-20, 0);
	this.tipLength = 55;
	this.centerLength = 35;
}

Ship.prototype.drawTips = function(mu)	{
	this.wingTips.graphics.clear();
	this.wingTips.graphics.ls(["rgba(61,119,204,0.70)", "rgba(112,201,230,0.0)"], [0.0,1.0],
		this.wingTipOffset.x, this.wingTipOffset.y, this.wingTipOffset.x - this.tipLength*mu, this.wingTipOffset.y);
	this.wingTips.graphics.ss(4);
	this.wingTips.graphics.mt(this.wingTipOffset.x, this.wingTipOffset.y);
	this.wingTips.graphics.lt(this.wingTipOffset.x - this.tipLength*mu, this.wingTipOffset.y);
	this.wingTips.graphics.mt( this.wingTipOffset.x, -this.wingTipOffset.y);
	this.wingTips.graphics.lt( this.wingTipOffset.x - this.tipLength*mu, -this.wingTipOffset.y);
	this.wingTips.graphics.es();

	this.wingTips.graphics.ls(["rgba(61,119,204,1.0)", "rgba(122,221,210,0.0)"], [0.0,1.0],
		this.centerOffset.x, this.centerOffset.y, this.centerOffset.x - this.centerLength*mu, this.centerOffset.y);
	this.wingTips.graphics.ss(8);
	this.wingTips.graphics.mt(this.centerOffset.x, this.centerOffset.y);
	this.wingTips.graphics.lt(this.centerOffset.x -this.centerLength*mu, this.centerOffset.y);
	this.wingTips.graphics.es();
}

Ship.prototype.Update = function(delta)	{
	this.velocity.x += this.force.x*delta;
	this.velocity.y += this.force.y*delta;

	this.worldPosition.x += this.velocity.x*delta;
	this.worldPosition.y += this.velocity.y*delta;

	this.sprite.x = this.worldPosition.x;
	this.sprite.y = this.worldPosition.y;

	this.force.x = this.force.y = 0;
}

Ship.prototype.makeLaunchForce = function()	{
	return this.worldPosition.seperation(mouse).outScalarMult(0.5);
}

Ship.prototype.addForce = function(force)	{
	this.force.x += force.x;
	this.force.y += force.y;
}

Ship.prototype.moveTo = function(pos) {
	if (this.worldPosition === undefined)	{
		this.worldPosition = new Vector(0,0);
	}
	this.wingTips.x = this.sprite.x = this.worldPosition.x = Math.floor(pos.x);
	this.wingTips.y = this.sprite.y = this.worldPosition.y = Math.floor(pos.y);
	this.emitBox.x = pos.x-this.engineParticleOffset.x;
	this.emitBox.y = pos.y -this.engineParticleOffset.y;
};