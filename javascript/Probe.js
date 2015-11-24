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

	this.scannedText = new createjs.Text("0", "bold 32px Courier", "#FFF")
}

Probe.prototype.Update = function(delta, camRect, markers)	{
	this.velocity.x += this.force.x*delta;
	this.velocity.y += this.force.y*delta;

	this.position.x += this.velocity.x*delta;
	this.position.y += this.velocity.y*delta;

	this.updateRect();

	if (!markers || intersectRect(this.rect, camRect))	{
		this.sprite.gotoAndStop("probe");
		this.sprite.rotation = 0;

		this.sprite.x = this.position.x;
		this.sprite.y = this.position.y;
	}	else	{
		this.sprite.gotoAndStop("marker");

		this.sprite.x = this.position.x;
		this.sprite.y = this.position.y;

		if (this.sprite.x > camRect.x + camRect.width)	{
			this.sprite.x = camRect.width - (this.rect.width/2);
			this.sprite.rotation = 90;
		}	else if (this.sprite.x < camRect.x)	{
			this.sprite.x = this.rect.width/2;
			this.sprite.rotation = 270;
		}

		if (this.sprite.y > camRect.y + camRect.height)	{
			this.sprite.y = camRect.height - (this.rect.height/2);
			this.sprite.rotation = 180;
		}	else if (this.sprite.y < camRect.y)	{
			this.sprite.y = this.rect.width/2;
			this.sprite.rotation = 0;
		}
	}

	

	this.force.x = this.force.y = 0;

	this.scannedText.x = this.position.x-10;
	this.scannedText.y = this.position.y-15;
	this.scannedText.text = (this.needScanned - this.scannedList.length).toString();
	
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