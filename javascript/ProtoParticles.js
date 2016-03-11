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

		// if (!collidePointRect(this.worldPosition, this.parentEmitter.args.extCamRect))	{
		// 	this.dead = true;
		// }
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

		this.sprite.alpha = 0;//1-(Math.max(this.elapsed-this.startFade,0)/(this.ttl-this.startFade));
		this.shape.alpha = 1-(Math.max(this.elapsed-this.startFade,0)/(this.ttl-this.startFade));
	}
	var gravPlanetFade = function(delta)	{
		this.parentEmitter.args[0].getTotalAttractionVector(this.worldPosition, this.force);
		this.force.scalarMult(this.parentEmitter.args[1]);
		if (this.parentEmitter.args[0].checkCollisions(this.worldPosition, 1, false) !== undefined)	{
			this.dead = true;
			this.sprite.alpha = 0;
			return
		}
		this.velocity.x += this.force.x * delta;
		this.velocity.y += this.force.y * delta;

		this.worldPosition.x += this.velocity.x * delta;
		this.worldPosition.y += this.velocity.y * delta;
		this.sprite.x = this.worldPosition.x;
		this.sprite.y = this.worldPosition.y;

		this.sprite.alpha = 1-(Math.max(this.elapsed-this.startFade,0)/(this.ttl-this.startFade));
		
	}

	var scanMove = function(delta)	{
		if (this.parentEmitter.args[1].probeList.length > 0)	{
			var probe = this.parentEmitter.args[1].probeList[this.parentEmitter.args[1].probeList.length-1];
			if (this.phase == 1)	{
				if (this.worldPosition.distance(probe.position) < 700*delta)	{
					this.worldPosition.x = probe.position.x;
					this.worldPosition.y = probe.position.y;
					this.phase = 0;
					this.dead = true;
					this.parentEmitter.args[1].piecesCollected += 1;
					createjs.Sound.play("Sblip"+Math.floor(Math.random()*3).toString());
				}	else 	{
					this.velocity.x = probe.position.x - this.worldPosition.x;
					this.velocity.y = probe.position.y - this.worldPosition.y;
					this.velocity.normalise();
					this.velocity.scalarMult(700);
					this.worldPosition.x += this.velocity.x * delta;
					this.worldPosition.y += this.velocity.y * delta;
				}
				this.sprite.x = this.worldPosition.x;
				this.sprite.y = this.worldPosition.y;
				return;
			}	else if (this.parentEmitter.args[0].checkCollisions(this.worldPosition, 1, false) !== undefined
				||	this.elapsed >= 4)	{
				this.phase = 1;
				
				return;
			}
		
			// Use the gravPlanetFade function above. A better system wouldn't need copypasta.
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
		}	else if (this.phase == 2) 	{
			this.sprite.alpha = 1-(Math.max(this.elapsed-this.startFade,0)/(this.ttl-this.startFade));
		}	else 	{
			this.phase = 2;
			this.ttl = this.elapsed + 0.5;
			this.startFade = this.elapsed;
		}
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

						5.0, undefined, false, false, false);
	this.dustCloud.startFade = 3.5;
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
						1.0, undefined, false, false, false);
	this.dustCloudTrail.shape = new createjs.Shape();


	var fr = 0.15;
	this.exploCloud = new Particle( new createjs.SpriteSheet({
						"frames":
						{
							width: 4,
							height: 4,
							regX: 2,
							regY: 2
						},
						"animations": {
                            a0:[0,9,"end",fr],a1:[10,19,"end",fr],a2:[20,29,"end",fr],a3:[30,39,"end",fr],
                            a4:[40,49,"end",fr],a5:[50,59,"end",fr],a6:[60,69,"end",fr],a7:[70,79,"end",fr],
                            a8:[80,89,"end",fr],a9:[90,99,"end",fr],end:[9]
						},
						"images": [preload.getResult("pCloud")]}),
						new Vector(0,0),
						gravPlanetFade,
						7.5, undefined, false, true, false);
	this.exploCloud.startFade = 5.75;
	fr = 0.55;
	this.spark = new Particle( new createjs.SpriteSheet({
						"frames":
						{
							width: 4,
							height: 4,
							regX: 2,
							regY: 2
						},
						"animations": {
                            a0:[0,9,"end",fr],a1:[10,19,"end",fr],a2:[20,29,"end",fr],a3:[30,39,"end",fr],
                            a4:[40,49,"end",fr],a5:[50,59,"end",fr],a6:[60,69,"end",fr],a7:[70,79,"end",fr],
                            a8:[80,89,"end",fr],a9:[90,99,"end",fr],end:[9]
						},
						"images": [preload.getResult("pCloud")]}),
						new Vector(0,0),
						gravPlanetFade,
						0.5, undefined, false, true, false);
	this.spark.startFade = 0.25;

	this.scan = new Particle( new createjs.SpriteSheet({
						"frames":
						{
							width: 9,
							height: 9,
							regX: 4.5,
							regY: 4.5
						},
						"animations": {
                            a0:[0],a1:[1],a2:[2],a3:[3],
                            a4:[4],a5:[5],a6:[6],a7:[7],
                            a8:[8],a9:[9]
						},
						"images": [preload.getResult("pGreenPix")]}),
						new Vector(0,0),
						scanMove,
						100, undefined, false, true, false);

	this.bits = new Particle( new createjs.SpriteSheet({
		"frames":
		{
			width: 2,
			height: 2,
			regX: 1,
			regY: 1
		},
		"animations":{
  			a0:[0],a1:[1],a2:[2],a3:[3],
            a4:[4],a5:[5],a6:[6],a7:[7],
            a8:[8],a9:[9]
		},
		"images":[preload.getResult("pBits")]}),
		new Vector(0, 0),
		gravPlanetFade,
		2, undefined, true, false, false);
	this.bits.startFade = 1.5;

	this.shockwave = new Particle( new createjs.SpriteSheet({
		"frames":
		{
			width: 10,
			height: 10,
			regX: 5,
			regY: 5
		},
		"animations":{
			wave:[0,9,"end",0.75], end:[9,9,"end",0.5]
		},
		"images":[preload.getResult("pShock")]}),
		new Vector(0,0),
		linMoveNoPhysFade,
		0.4, undefined, false, false, false);

	this.warp = new Particle( new createjs.SpriteSheet({
		"frames":
		{	
			width: 10,
			height: 9,
			regX: 5,
			regY: 4.5
		},
		"animations": {
			"1":[0],
			"2":[1],
			"3":[2],
			"4":[3]
		},
		"images": [preload.getResult("shipWarp")]
		}),
		new Vector(0,0),
		linMoveNoPhysFade,
		0.7, undefined, true, false, false);

	this.gravWarp = new Particle( new createjs.SpriteSheet({
		"frames":
		{	
			width: 2,
			height: 2,
			regX: 1,
			regY: 1
		},
		"animations": {
			"1":[0]
		},
		"images": [preload.getResult("grav")]
		}),
		new Vector(0,0),
		gravPlanetFade,
		2.5, undefined, true, false, true);
	this.gravWarp.alpha = 0.1;
}	