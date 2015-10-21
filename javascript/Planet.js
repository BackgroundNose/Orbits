function Planet(rad, targetRad, num)	
{
	this.sprite =  new createjs.Sprite(
					new createjs.SpriteSheet({
						"frames": {
                            "width": 100,
                            "height": 100,
                            "regX": 50,
                            "regY": 50,
                            "numFrames": 1
                        },
                        "animations": {
                            "earth":[0]
                        },
                        "images": [preload.getResult("planet")]}) 
					);
	this.sprite.gotoAndStop("earth");

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

	this.radius = rad;
    this.targetRadius = targetRad;

	this.mass = this.radius*210000;

    this.num = num;

	this.sprite.scaleX = rad/50;
	this.sprite.scaleY = rad/50;
    this.targetSprite.scaleX = targetRad/100;
    this.targetSprite.scaleY = targetRad/100;  
}

Planet.prototype.moveTo = function(pos) {
    this.sprite.x = pos.x;
    this.sprite.y = pos.y;
    this.targetSprite.x = pos.x;
    this.targetSprite.y = pos.y;
}