function Mine()	{
	this.position = new Vector(0,0);
	this.sprite = new createjs.Sprite(
		new createjs.SpriteSheet({
						"frames": {
                            "width": 75,
                            "height": 75,
                            "regX": 37.5,
                            "regY": 37.5,
                            "numFrames": 9
                        },
                        "animations": {
                            "mine":[0],
                            "break":[1,7,"dead",0.25],
                            "dead":[8]
                        },
                        "images": [preload.getResult("mine")]})
		);
    this.sprite.gotoAndStop("mine");
	this.sprite.rotation = 360*Math.random();

	this.radius = 35;
    this.kill = false;
}

Mine.prototype.moveTo = function(pos)	{
	this.sprite.x = this.position.x = pos.x;
	this.sprite.y = this.position.y = pos.y;
}

killMine = function(evt)   {
    game.planetManager.mine.kill = true;
    console.log("MineDead")
}

Mine.prototype.setupDeath = function()  {
    this.sprite.gotoAndPlay("break");
    this.sprite.addEventListener("animationend", killMine);
}