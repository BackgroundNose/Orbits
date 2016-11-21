function Hazard(type, orbrad, center, angvel)	{
	console.log(type)
	this.radius = this.properties[type].hitrad;

	this.sprite = new createjs.Sprite(this.setupSS());
	this.sprite.gotoAndPlay(type);

	this.dbg = new createjs.Shape();
	this.dbg.graphics.s("rgba(255,0,0,0.5)").f("rgba(0,255,0,0.5)");
	this.dbg.graphics.dc(0,0,this.radius);
	this.dbg.graphics.es().ef();

	this.type = type;
	this.orbitalCenter = center;
	this.orbitalRadius = orbrad;
	this.orbitalAngularVelocity = angvel; 	// Rad/s


	if (this.properties[type].lock == "R")	{
		this.tidalLock = Math.random() > 0.5;
	} 	else if (this.properties[type].lock == "F")	{
		this.tidalLock = false;
	}	else	{
		this.tidalLock = true;
	}

	if (this.properties[type].direction && angvel < 0)	{
		this.sprite.scaleX = -1;
	}

	this.dangerMax = this.orbitalRadius + this.radius/2.0;
	this.dangerMin = this.orbitalRadius - this.radius/2.0; 

	this.position = new Vector(0,0);
	this.velocity = new Vector(0,0);
	this.force = new Vector(0,0);

	this.orbitAngle = Math.random()*2*Math.PI;
	this.setPosition(this.orbitAngle);
	
}

Hazard.prototype.update = function(delta, planman)	{
	if (this.obeyPhysics) {
		this.force.zero();
		planman.getTotalAttractionVector(this.position, this.force);
		this.velocity.x += this.force.x*delta;
		this.velocity.y += this.force.y*delta;

		this.position.x += this.velocity.x*delta;
		this.position.y += this.velocity.y*delta;

		var hit = planman.checkCollisions(this.position, this.radius, true);
		if (hit !== undefined)	{
			this.kill = true;
		}
		this.updateGraphics();

	} 	else 	{
		this.orbitAngle += this.orbitalAngularVelocity*delta;
		this.setPosition(this.orbitAngle);
	}
}

Hazard.prototype.setPosition = function(angle)	{
	this.orbitAngle = angle;
	this.position.x = 0;
	this.position.y = this.orbitalRadius;
	this.position.rotate(this.orbitAngle);
	this.position.x += this.orbitalCenter.x;
	this.position.y += this.orbitalCenter.y;

	this.updateGraphics();
	this.dbg.x = this.position.x;
	this.dbg.y = this.position.y;

	if (this.tidalLock)	{
		this.sprite.rotation = toDeg(this.orbitAngle);
	}
};

Hazard.prototype.updateGraphics = function()	{
	this.sprite.x = this.position.x;
	this.sprite.y = this.position.y;
}

Hazard.prototype.makePhysical = function(impactPos, impactVec) {
	this.velocity = this.getRealVelocity();
	
	this.velocity.x += impactVec.x;
	this.velocity.y += impactVec.y;
	this.obeyPhysics = true;
};

Hazard.prototype.getRealVelocity = function()	{
	var tangent = this.position.seperation(this.orbitalCenter);
	var vel = tangent.tangent();
	vel.normalise();
	var speed = this.orbitalAngularVelocity*this.orbitalRadius;
	vel.scalarMult(speed);
	return vel;
};

Hazard.prototype.setupSS = function()	{
	return new createjs.SpriteSheet({
				"frames": {
                    "width": 50,
                    "height": 50,
                    "regX": 25,
                    "regY": 25
                },
                "animations":{
                	"sroid1":0,
                	"moon1":1,
                	"lroid1":2,
                	"lroid2":3,
                	"lroid3":4,
                	"hobj1":5,
                	"hobj2":6,
                	"snotroid":7,
                	"toasterB":[12, 16,"toasterB",0.25],
                	"whale":[17, 22,"whale",0.15],
                	"toasterG":[24, 28,"toasterG",0.25],
                	"toasterS":[36, 40,"toasterS",0.25]
                },
                "images": [preload.getResult("hazards")]});
}

Hazard.prototype.properties = {
	"sroid1":{direction:false,lock:"R",hitrad:8},
	"moon1":{direction:false,lock:"F",hitrad:7},
	"lroid1":{direction:false,lock:"F",hitrad:18},
	"lroid2":{direction:false,lock:"T",hitrad:18},
	"lroid3":{direction:false,lock:"T",hitrad:14},
	"hobj1":{direction:false,lock:"T",hitrad:11},
	"hobj2":{direction:false,lock:"T",hitrad:12},
	"snotroid":{direction:false,lock:"F",hitrad:12},
	"toasterB":{direction:true,lock:"T",hitrad:12},
	"whale":{direction:true,lock:"T",hitrad:12},
	"toasterG":{direction:true,lock:"T",hitrad:12},
	"toasterS":{direction:true,lock:"T",hitrad:12},
}

Hazard.prototype.common = [
	"sroid1", "moon1", "lroid1", "lroid2", "lroid3","snotroid"
	];
Hazard.prototype.rare = [
	"hobj1", "hobj2"
	];
Hazard.prototype.superRare = [
		"toasterB", "toasterG", "toasterS","whale"
	];

Hazard.prototype.objname = "HAZARD";