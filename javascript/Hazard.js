function Hazard(type, hitrad, orbrad, center, angvel)	{
	this.sprite = new createjs.Sprite(this.setupSS());
	this.sprite.gotoAndPlay("roid1");

	this.type = type;
	this.orbitalCenter = center;
	this.orbitalRadius = orbrad;
	this.orbitalAngularVelocity = angvel; 	// Rad/s


	this.radius = hitrad;

	this.dangerMax = this.orbitalRadius + this.radius/2.0;
	this.dangerMin = this.orbitalRadius - this.radius/2.0; 

	this.position = new Vector(0,1);
	this.orbitAngle = Math.random()*2*Math.PI;
	this.setPosition(this.orbitAngle);
	
	this.position.scalarMult(this.orbitalRadius);
}

Hazard.prototype.update = function(delta)	{
	this.orbitAngle += this.orbitalAngularVelocity*delta;
	this.setPosition(this.orbitAngle);
}

Hazard.prototype.setPosition = function(angle)	{
	this.orbitAngle = angle;
	this.position.x = 0;
	this.position.y = 1;
	this.position.rotate(this.orbitAngle);
	this.position.scalarMult(this.orbitalRadius);
	this.position.x += this.orbitalCenter.x;
	this.position.y += this.orbitalCenter.y;

	this.sprite.x = this.position.x;
	this.sprite.y = this.position.y;
}

Hazard.prototype.setupSS = function()	{
	return new createjs.SpriteSheet({
				"frames": {
                    "width": 100,
                    "height": 100,
                    "regX": 50,
                    "regY": 50,
                    "numFrames": 12*8
                },
                "animations":{
                	"roid1":[0]
                }
                "images": [preload.getResult("hazards")]});
}