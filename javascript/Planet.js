function Planet(scale)	
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

	this.radius = scale*50;

	this.mass = this.radius*100000;

	this.sprite.scaleX = scale;
	this.sprite.scaleY = scale; 
}