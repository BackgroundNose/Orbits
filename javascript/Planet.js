function Planet(size, mass, targetRad, num)	
{
	this.sprite =  new createjs.Sprite(
					new createjs.SpriteSheet({
						"frames": {
                            "width": 120,
                            "height": 120,
                            "regX": 60,
                            "regY": 60,
                            "numFrames": 16
                        },
                        "animations": {
                            "0":[0],"1":[1],"2":[2],"3":[3],
                            "4":[4],"5":[5],"6":[6],"7":[7],
                            "8":[8],"9":[9],"10":[10],"11":[11],
                            "12":[12],"13":[13],"14":[14],"15":[15]
                        },
                        "images": [preload.getResult("planets")]}) 
					);
	this.sprite.gotoAndStop((mass*4)+size);

    this.targetSprite = new createjs.Sprite(
                    new createjs.SpriteSheet({
                        "frames": {
                            "width": 200,
                            "height": 200,
                            "regX": 100,
                            "regY": 100,
                            "numFrames": 1
                        },
                        "animations": {
                            "target":[0]
                        },
                        "images": [preload.getResult("target")]}) 
                    );
    this.sprite.gotoAndStop("target");

	this.radius = size*10 + 20;
    this.targetRadius = this.radius + targetRad;

	this.mass = ((mass+1)*20 + (size+1))*255000;

    this.num = num;

    this.position = new Vector(0,0);

    this.targetSprite.scaleX = this.targetRadius/100;
    this.targetSprite.scaleY = this.targetRadius/100;

    this.scanned = false;
    this.scannedElapsed = 0;
    this.scannedFade = 0.25;

    this.resetting = false;
    this.resetElapsed = 0;
    this.resetTime = 1.0;
}

Planet.prototype.moveTo = function(pos) {
    this.position.x = pos.x;
    this.position.y = pos.y;
    this.sprite.x = pos.x;
    this.sprite.y = pos.y;
    this.targetSprite.x = pos.x;
    this.targetSprite.y = pos.y;
}