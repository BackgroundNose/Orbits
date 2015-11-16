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
						1.0, undefined, false);

	this.trail = new Particle( new createjs.SpriteSheet({
                        "frames":
                        {
                            "width": 16,
                            "height": 16,
                            "regX": 0,
                            "regX": 0,
                            "numFrames": 1
                        },
                        "animations": {
                            "I":[0]
                        },
                        "images": [preload.getResult("pTrail")]}),
	                        new Vector(0,0),
						linMoveNoPhysFade,
						0.3, undefined, false);

	this.basic = new Particle( new createjs.SpriteSheet({
						"frames":
						{
							"width": 32,
							"height": 32,
							"regX": 0,
							"regY": 0,
							"numFrames": 1
						},
						"animations": {
							"I":[0]
						},
						"images": [preload.getResult("pBasic")]}),
						new Vector(0,0),
						linMoveNoPhys,
						10.0, undefined, false);

	this.exit = new Particle( new createjs.SpriteSheet({
						"frames":
						{
							"width": 16,
							"height": 16,
							"regX": 0,
							"regY": 0,
							"numFrames": 40
						},
						"animations": {
                            "G":[0,9,"G",0.15],
                            "R":[10,19,"R",0.15],
                            "B":[20,29,"B",0.15],
                            "P":[30,39,"P",0.15],
						},
						"images": [preload.getResult("pExit")]}),
						new Vector(0,0),
						fallToCenter,
						1.5, undefined, false);
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
						0.3, undefined, false);
	this.exploFlame.startFade = 0.2;
	this.exploCloud = new Particle( new createjs.SpriteSheet({
						"frames":
						{
							"width": 56,
							"height": 56,
							"regX": 28,
							"regY": 28,
							"numFrames": 10
						},
						"animations": {
                            "0":[0],"1":[1],"2":[2],"3":[3],"4":[4],"5":[5],"6":[6],"7":[7],"8":[8],"9":[9]
						},
						"images": [preload.getResult("pCloud")]}),
						new Vector(0,0),
						linMoveNoPhysFadeScaleRotate,
						0.7, undefined, false);
	this.exploCloud.startFade = 0.3;
	this.spark = new Particle( new createjs.SpriteSheet({
						"frames":
						{
							"width": 5,
							"height": 5,
							"regX": 2,
							"regY": 2,
							"numFrames": 5
						},
						"animations": {
                            "0":[0],"1":[1],"2":[2],"3":[3],"4":[4],"5":[5],"I":[0,5,"I",0.15]
						},
						"images": [preload.getResult("pSpark")]}),
						new Vector(0,0),
						linMoveNoPhys,
						0.25, undefined, true);
}