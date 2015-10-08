function Probe ()
{
	this.sprite =  new createjs.Sprite(
					new createjs.SpriteSheet({
						"frames": {
                            "width": 30,
                            "height": 30,
                            "regX": 15,
                            "regY": 15,
                            "numFrames": 1
                        },
                        "animations": {
                            "probe":[0]
                        },
                        "images": [preload.getResult("probe")]}) 
					);
	this.sprite.gotoAndStop("probe");

	this.position = new Vector(100,100);
	this.velocity = new Vector(0,0);
	this.force = new Vector(0,0);

	this.radius = 10;
	this.kill = false;

	this.path = new Array();
}

Probe.prototype.Update = function(delta)	{
	this.velocity.x += this.force.x*delta;
	this.velocity.y += this.force.y*delta;

	this.position.x += this.velocity.x*delta;
	this.position.y += this.velocity.y*delta;

	this.sprite.x = this.position.x;
	this.sprite.y = this.position.y;

	this.force.x = this.force.y = 0;
}

Probe.prototype.addForce = function(force)	{
	this.force.x += force.x;
	this.force.y += force.y;
}

Probe.prototype.moveTo = function(pos) {
	this.sprite.x = this.position.x = pos.x;
	this.sprite.y = this.position.y = pos.y;
};