function ProtoParticles()
{
	console.log("Setting up protoParticles");
	//This is ugly code that should be made into a component based system. It *should* be good enough for purpose though...
	var linMoveNoPhysFade = function(delta) {
		this.worldPosition.x += this.velocity.x * delta;
		this.worldPosition.y += this.velocity.y * delta;
		this.sprite.x = this.worldPosition.x;
		this.sprite.y = this.worldPosition.y;
		this.sprite.alpha = 1-(Math.max(this.elapsed-this.startFade,0)/(this.ttl-this.startFade));
	};

	var linMoveNoPhysFadeScale = function(delta) {
		this.worldPosition.x += this.velocity.x * delta;
		this.worldPosition.y += this.velocity.y * delta;
		this.sprite.x = this.worldPosition.x;
		this.sprite.y = this.worldPosition.y;
		this.sprite.alpha = 1-(Math.max(this.elapsed-this.startFade,0)/(this.ttl-this.startFade));
		this.sprite.scaleX = this.scale * (1-(this.elapsed/this.ttl));
		this.sprite.scaleY = this.scale * (1-(this.elapsed/this.ttl));
	}

	var linMoveNoPhysFadeScaleRotate = function(delta) {
		this.worldPosition.x += this.velocity.x * delta;
		this.worldPosition.y += this.velocity.y * delta;
		this.sprite.x = this.worldPosition.x;
		this.sprite.y = this.worldPosition.y;
		this.sprite.alpha = 1-(Math.max(this.elapsed-this.startFade,0)/(this.ttl-this.startFade));
		this.sprite.scaleX = this.sprite.scale*(1-Math.max(this.elapsed-this.startFade,0)/(this.ttl-this.startFade));
		this.sprite.scaleY = this.sprite.scale*(1-Math.max(this.elapsed-this.startFade,0)/(this.ttl-this.startFade));
		this.sprite.rotation += this.rotationRate*delta;
	}

	var linMoveNoPhysFadeRotate = function(delta) {
		this.worldPosition.x += this.velocity.x * delta;
		this.worldPosition.y += this.velocity.y * delta;
		this.sprite.x = this.worldPosition.x;
		this.sprite.y = this.worldPosition.y;
		this.sprite.alpha = 1-(Math.max(this.elapsed-this.startFade,0)/(this.ttl-this.startFade));
		this.sprite.rotation += this.rotationRate*delta;
	}

	var linMoveNoPhysSinFade = function(delta) { 	
		this.worldPosition.x += this.velocity.x * delta;
		this.worldPosition.y += this.velocity.y * delta;
		this.sprite.x = this.worldPosition.x - this.sprite.getBounds().width/2;
		this.sprite.y = this.worldPosition.y - this.sprite.getBounds().height/2;
		this.sprite.alpha = Math.sin((this.elapsed/this.ttl)*3.14);
	};
	var linMoveNoPhys = function(delta) { 	
		this.worldPosition.x += this.velocity.x * delta;
		this.worldPosition.y += this.velocity.y * delta;
		this.sprite.x = this.worldPosition.x - this.sprite.getBounds().width/2;
		this.sprite.y = this.worldPosition.y - this.sprite.getBounds().height/2;
	};
	var gravScale = function(delta)	{
		// this.velocity.y  += 10*delta;
		this.worldPosition.x += this.velocity.x * delta;
		this.worldPosition.y += this.velocity.y * delta;
		this.sprite.x = this.worldPosition.x - this.sprite.getBounds().width/2;
		this.sprite.y = this.worldPosition.y - this.sprite.getBounds().height/2;
		this.sprite.scaleX = this.sprite.scale*(1-Math.max(this.elapsed-this.startFade,0)/(this.ttl-this.startFade));
		this.sprite.scaleY = this.sprite.scale*(1-Math.max(this.elapsed-this.startFade,0)/(this.ttl-this.startFade));
	}
	var fallToCenter = function(delta) {
		var centerX = this.parentEmitter.args[0].x + this.parentEmitter.args[0].width/2;
		var centerY = this.parentEmitter.args[0].y + this.parentEmitter.args[0].height/2;
		this.worldPosition.x = (this.worldPosition.x + 0.05 * (centerX - this.worldPosition.x));
		this.worldPosition.y = (this.worldPosition.y + 0.05 * (centerY - this.worldPosition.y));
		this.sprite.x = this.worldPosition.x;
		this.sprite.y = this.worldPosition.y;
	}
	var shapeLineBetween = function(delta) {
		this.worldPosition.x += this.velocity.x * delta;
		this.worldPosition.y += this.velocity.y * delta;
		this.sprite.x = this.worldPosition.x;
		this.sprite.y = this.worldPosition.y;
		this.shape.graphics.clear();
		this.shape.graphics.s("#FFF").ss(2).mt(this.lastPosition.x, this.lastPosition.y);
		this.shape.graphics.lt(this.worldPosition.x, this.worldPosition.y);
		this.shape.graphics.es();
		this.lastPosition.x = this.lastPosition.x + (this.worldPosition.x - this.lastPosition.x) / 2.0;
		this.lastPosition.y = this.lastPosition.y + (this.worldPosition.y - this.lastPosition.y) / 2.0;
		
		if ((this.worldPosition.x < 0)
			)	{
			this.dead = true;
		}

		this.sprite.alpha = 1-(Math.max(this.elapsed-this.startFade,0)/(this.ttl-this.startFade));
		this.shape.alpha = 1-(Math.max(this.elapsed-this.startFade,0)/(this.ttl-this.startFade));
	}
	var gravPlanetFade = function(delta)	{
		this.parentEmitter.args[0].getTotalAttractionVector(this.worldPosition, this.force);
		if (this.parentEmitter.args[0].checkCollisions(this.worldPosition, 1, false))	{
			this.dead = true;
		}
		this.velocity.x += this.force.x * delta;
		this.velocity.y += this.force.y * delta;

		this.worldPosition.x += this.velocity.x * delta;
		this.worldPosition.y += this.velocity.y * delta;
		this.sprite.x = this.worldPosition.x;
		this.sprite.y = this.worldPosition.y;

		this.sprite.alpha = 1-(Math.max(this.elapsed-this.startFade,0)/(this.ttl-this.startFade));
		
	}

	this.dustCloud = new Particle( new createjs.SpriteSheet({
                        "frames":
                        {
                            "width": 2,
                            "height": 2,
                            "regX": 1,
                            "regX": 1,
                            "numFrames": 1
                        },
                        "animations": {
                            "I":[0]
                        },
                        "images": [preload.getResult("pwhitePx")]}),
	                    new Vector(0,0),
						linMoveNoPhysFade,
						5.0, undefined, false, false);
	this.dustCloud.startFade = 4;
	this.dustCloudTrail = new Particle( new createjs.SpriteSheet({
                        "frames":
                        {
                            "width": 2,
                            "height": 2,
                            "regX": 1,
                            "regX": 1,
                            "numFrames": 1
                        },
                        "animations": {
                            "I":[0]
                        },
                        "images": [preload.getResult("pwhitePx")]}),
	                    new Vector(0,0),
						shapeLineBetween,
						1.0, undefined, false, false);
	this.dustCloudTrail.shape = new createjs.Shape();

	this.exploFlame = new Particle( new createjs.SpriteSheet({
						"frames":
						{
							"width": 10,
							"height": 20,
							"regX": 5,
							"regY": 10,
							"numFrames": 1
						},
						"animations": {
                            "I":[0]
						},
						"images": [preload.getResult("pFlame")]}),
						new Vector(0,0),
						linMoveNoPhysFade,
						0.3, undefined, false, false);
	this.exploFlame.startFade = 0.2;
	// this.exploCloud = new Particle( new createjs.SpriteSheet({
	// 					"frames":
	// 					{
	// 						"width": 56,
	// 						"height": 56,
	// 						"regX": 28,
	// 						"regY": 28,
	// 						"numFrames": 10
	// 					},
	// 					"animations": {
 //                            "0":[0],"1":[1],"2":[2],"3":[3],"4":[4],"5":[5],"6":[6],"7":[7],"8":[8],"9":[9]
	// 					},
	// 					"images": [preload.getResult("pCloud")]}),
	// 					new Vector(0,0),
	// 					linMoveNoPhysFadeScaleRotate,
	// 					0.7, undefined, false);
	// this.exploCloud.startFade = 0.3;
	var fr = 0.15;
	this.exploCloud = new Particle( new createjs.SpriteSheet({
						"frames":
						{
							width: 8,
							height: 8,
							regX: 4,
							regY: 4
						},
						animations: {
                            a0:[0,9,"end",fr],a1:[10,19,"end",fr],a2:[20,29,"end",fr],a3:[30,39,"end",fr],
                            a4:[40,49,"end",fr],a5:[50,59,"end",fr],a6:[60,69,"end",fr],a7:[70,79,"end",fr],
                            a8:[80,89,"end",fr],a9:[90,99,"end",fr],end:[9]
						},
						"images": [preload.getResult("pCloud")]}),
						new Vector(0,0),
						gravPlanetFade,
						5, undefined, false, true);
	this.exploCloud.startFade = 1.75;
}