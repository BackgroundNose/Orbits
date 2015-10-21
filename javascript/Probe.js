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

	this.radius = 2;
	this.kill = false;

	this.scannedList = new Array();

	this.path = new Array();

	this.scannedText = new createjs.Text("0", "bold 32px Courier", "#FFF")
}

Probe.prototype.Update = function(delta)	{
	this.velocity.x += this.force.x*delta;
	this.velocity.y += this.force.y*delta;

	this.position.x += this.velocity.x*delta;
	this.position.y += this.velocity.y*delta;

	this.sprite.x = this.position.x;
	this.sprite.y = this.position.y;

	this.force.x = this.force.y = 0;

	this.scannedText.x = this.position.x-10;
	this.scannedText.y = this.position.y-15;
	this.scannedText.text = this.scannedList.length.toString();
	
}

Probe.prototype.addForce = function(force)	{
	this.force.x += force.x;
	this.force.y += force.y;
}

Probe.prototype.moveTo = function(pos) {
	this.sprite.x = this.position.x = pos.x;
	this.sprite.y = this.position.y = pos.y;
};