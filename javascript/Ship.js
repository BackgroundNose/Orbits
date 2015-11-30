function Ship()	
{
	this.sprite = new createjs.Sprite(
					new createjs.SpriteSheet({
						"frames": {
                            "width": 30,
                            "height": 48,
                            "regX": 15,
                            "regY": 24,
                            "numFrames": 1
                        },
                        "animations": {
                            "player":[0]
                        },
                        "images": [preload.getResult("ship")]}) 
					);
	this.sprite.gotoAndStop("player");
	this.sprite.rotation = 90;

	this.position = new Vector(100,100);
	this.velocity = new Vector(0,0);
	this.force = new Vector(0,0);

}

Ship.prototype.Update = function(delta)	{
	this.velocity.x += this.force.x*delta;
	this.velocity.y += this.force.y*delta;

	this.position.x += this.velocity.x*delta;
	this.position.y += this.velocity.y*delta;

	this.sprite.x = this.position.x;
	this.sprite.y = this.position.y;

	this.force.x = this.force.y = 0;
}

Ship.prototype.makeLaunchForce = function()	{
	return this.position.seperation(mouse).outScalarMult(0.5);
}

Ship.prototype.addForce = function(force)	{
	this.force.x += force.x;
	this.force.y += force.y;
}

Ship.prototype.moveTo = function(pos) {
	this.sprite.x = this.position.x = pos.x;
	this.sprite.y = this.position.y = pos.y;
};