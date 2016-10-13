function Hazard(type, hitrad, orbrad, center, angvel)	{
	this.radius = hitrad;

	this.sprite = new createjs.Sprite(this.setupSS());
	this.sprite.gotoAndPlay("roid1");

	this.dbg = new createjs.Shape();
	this.dbg.graphics.s("rgba(255,0,0,0.5)").f("rgba(0,255,0,0.5)");
	this.dbg.graphics.dc(0,0,this.radius);
	this.dbg.graphics.es().ef();

	this.type = type;
	this.orbitalCenter = center;
	this.orbitalRadius = orbrad;
	this.orbitalAngularVelocity = angvel; 	// Rad/s

	this.tidalLock = Math.random() > 0.5;

	this.dangerMax = this.orbitalRadius + this.radius/2.0;
	this.dangerMin = this.orbitalRadius - this.radius/2.0; 

	this.position = new Vector(0,0);
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
	this.position.y = this.orbitalRadius;
	this.position.rotate(this.orbitAngle);
	this.position.x += this.orbitalCenter.x;
	this.position.y += this.orbitalCenter.y;

	this.sprite.x = this.position.x;
	this.sprite.y = this.position.y;
	this.dbg.x = this.position.x;
	this.dbg.y = this.position.y;

	if (this.tidalLock)	{
		this.sprite.rotation = toDeg(this.orbitAngle);
	}
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
                },
                "images": [preload.getResult("hazards")]});
}