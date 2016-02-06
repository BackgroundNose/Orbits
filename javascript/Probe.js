function Probe (needScanned, position)
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

	this.field = new createjs.Sprite(
					new createjs.SpriteSheet({
						"frames": {
                            "width": 38,
                            "height": 44,
                            "regX": 19,
                            "regY": 22,
                            "numFrames": 1
                        },
                        "animations": {
                            "shield":[0]
                        },
                        "images": [preload.getResult("shield")]}) 
					);
	this.field.gotoAndStop("shield");
	this.field.alpha = 0;
	this.fieldElapsed = 0;
	this.fieldRate = 2.0;

	this.trail = new createjs.Shape();
	this.trailList = new Array()
	for (var i = 0; i < 25; i++)	{
		this.trailList.push(new Vector(position.x,position.y));
	}
	this.trailEndPointer = 0;
	this.trailAddPoint = false;

	this.position = new Vector(0,0);
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

	this.moveTo(position);

}

Probe.prototype.Update = function(delta)	{
	this.velocity.x += this.force.x*delta;
	this.velocity.y += this.force.y*delta;

	this.position.x += this.velocity.x*delta;
	this.position.y += this.velocity.y*delta;

	this.updateRect();

	this.sprite.x = this.field.x = this.position.x;
	this.sprite.y = this.field.y = this.position.y;

	this.fieldElapsed += delta;

	if (this.trailAddPoint)	{
		this.trailList[this.trailEndPointer].x = this.position.x;
		this.trailList[this.trailEndPointer].y = this.position.y;
		this.trailEndPointer = (this.trailEndPointer+1) % this.trailList.length;
	}
	this.trailAddPoint = !this.trailAddPoint;

	this.drawTrail();

	if (!this.experienceGravity)	{
		this.field.alpha = cosineInterpolate(0.2, 0.7, this.fieldElapsed / this.fieldRate);
		this.field.rotation = this.sprite.rotation;
	}	else 	{
		this.field.alpha = 0;
		this.sprite.rotation = this.velocity.angleToY();
	}

	this.force.x = this.force.y = 0;
}

Probe.prototype.drawTrail = function()	{
	var i = this.trailEndPointer-1;
	if (i == -1)	{
		i = this.trailList.length-1;
	}

	this.trail.graphics.clear();
	var lastpos = this.position;
	var mu = 1;
	count = 0
	while (i != this.trailEndPointer)	{
		mu = (this.trailList.length - count)/this.trailList.length;
		this.trail.graphics.s("rgba(167,217,235,"+mu.toString()+")").ss(5*mu); // l orange235,217,167
		this.trail.graphics.mt(lastpos.x, lastpos.y);
		this.trail.graphics.lt(this.trailList[i].x, this.trailList[i].y)
		lastpos = this.trailList[i];
		this.trail.graphics.es();
		i -= 1;
		if (i == -1)	{
			i = this.trailList.length-1;
		}
		count += 1;
	} 

	this.trail.graphics.es();
}

Probe.prototype.addForce = function(force)	{
	this.force.x += force.x;
	this.force.y += force.y;
}

Probe.prototype.moveTo = function(pos) {
	this.sprite.x = this.field.x = this.position.x = pos.x;
	this.sprite.y = this.field.y = this.position.y = pos.y;
	this.updateRect();
};

Probe.prototype.updateRect = function()	{
	this.rect.x = this.position.x - this.box.width/2;
	this.rect.y = this.position.y - this.box.height/2;
}

Probe.prototype.stopAndWait = function(grav)	{
	// this.sprite.rotation = grav.angleToY()+180;
	this.force.x = 0;
	this.force.y = 0;
	this.velocity.x = 0;
	this.velocity.y = 0;
	this.experienceGravity = false;
	this.fieldElapsed = 0;
}