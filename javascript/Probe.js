function Probe (needScanned)
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
                        	"marker":[0],
                            "probe":[1]
                        },
                        "images": [preload.getResult("probe")]}) 
					);
	this.sprite.gotoAndStop("probe");

	this.position = new Vector(100,100);
	this.velocity = new Vector(0,0);
	this.force = new Vector(0,0);

	this.experienceGravity = true;

	this.radius = 2;
	this.kill = false;

	this.scannedList = new Array();
	this.needScanned = needScanned;

	this.box = this.sprite.getBounds();
	this.rect = new createjs.Rectangle(this.position.x - this.box.width/2, 
										this.position.y - this.box.height/2, 
										this.box.width, this.box.height);

	this.path = new Array();

}

Probe.prototype.Update = function(delta)	{
	this.velocity.x += this.force.x*delta;
	this.velocity.y += this.force.y*delta;

	this.position.x += this.velocity.x*delta;
	this.position.y += this.velocity.y*delta;

	this.updateRect();

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
	this.updateRect();
};

Probe.prototype.updateRect = function()	{
	this.rect.x = this.position.x - this.box.width/2;
	this.rect.y = this.position.y - this.box.height/2;
}

Probe.prototype.stopAndWait = function()	{
	this.force.x = 0;
	this.force.y = 0;
	this.velocity.x = 0;
	this.velocity.y = 0;
	this.experienceGravity = false;
}