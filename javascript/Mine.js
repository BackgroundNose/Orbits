function Mine()	{
	this.position = new Vector(0,0);
    this.cont = new createjs.Container();
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

	this.radius = 35;
    this.kill = false;

    this.lightList = new Array();
    this.lightElapsed = new Array();

    this.setupContainer();
    this.randomiseLights();
}

Mine.prototype.update = function (delta) {
    for (var i = 0; i < this.lightList.length; i++) {
        this.lightElapsed[i] += delta;
        this.lightList[i].alpha = cosineInterpolate(0.25,1,this.lightElapsed[i]);
    }
}

Mine.prototype.randomiseLights = function  () {
    for (var i = 0; i < this.lightElapsed.length; i++)  {
        this.lightElapsed[i] = Math.random();
        this.lightList[i].alpha = cosineInterpolate(0.25,1,this.lightElapsed[i]);
    }
}

Mine.prototype.setupContainer = function() {
    this.lightList = new Array();
    var light = new createjs.Sprite(
        new createjs.SpriteSheet(
            {
                        "frames": {
                            "width": 14,
                            "height": 14,
                            "regX": 7,
                            "regY": 7,
                            "numFrames": 1
                        },
                        "animations": {
                            "i":[0]
                        },
                        "images": [preload.getResult("mineLight")]}
            )
        );
    var width = this.sprite.getBounds().width/2.0;
    var height = this.sprite.getBounds().height/2.0;
    
    // light.x = 0; light.y = 0;
    // this.lightList.push(light.clone());
    light.x = 14 - width; light.y = 9 - height;
    this.lightList.push(light.clone());
    light.x = 67 - width; light.y = 9 - height;
    this.lightList.push(light.clone());
    light.x = 11 - width; light.y = 65 - height;
    this.lightList.push(light.clone());
    light.x = 69 - width; light.y = 64 - height;
    this.lightList.push(light);
    
    this.cont.addChild(this.sprite);

    for (var i = 0; i < this.lightList.length; i++) {
        this.lightElapsed.push(0);
        this.cont.addChild(this.lightList[i]);
    }
}

Mine.prototype.moveTo = function(pos)	{
	this.cont.x = this.position.x = pos.x;
	this.cont.y = this.position.y = pos.y;
}

killMine = function(evt)   {
    game.planetManager.mine.kill = true;
    console.log("MineDead")
}

Mine.prototype.setupDeath = function()  {
    this.sprite.gotoAndPlay("break");
    this.sprite.addEventListener("animationend", killMine);
}