function Background(totalRect)	{
	this.ss = new createjs.SpriteSheet({
				"frames": {
                    "width": 25,
                    "height": 25,
                    "regX": 12.5,
                    "regY": 12.5,
                    "numFrames": 25
                },
                "images": [preload.getResult("stars")]}) 

	this.background = new createjs.Bitmap(preload.getResult("background"));

	this.underArray = new Array();
	this.overArray = new Array();
	this.totalRect = totalRect;
	this.overStars = 27;
	this.underStars = 7;

	this.stage = new createjs.Container();

	this.underStage = new createjs.Container();
	this.stage.addChild(this.underStage);
	// this.stage.addChild(this.background);
	this.overStage = new createjs.Container();
	this.stage.addChild(this.overStage);

	this.moveRate = -150;
}

Background.prototype.shiftThings = function(delta)	{
	var mov = this.moveRate*delta;

	this.background.x += mov * 0.1;

	for (var i = 0; i < this.underArray.length; i++)	{
		this.underArray[i].x += mov*this.underArray[i].depthvar;
	}

	for (var i = 0; i < this.overArray.length; i++)	{
		this.overArray[i].x += mov*this.overArray[i].depthvar;
	}

	for (var i = 0; i < this.underArray.length; i++)	{
		if (this.underArray[i].x+27 < 0)	{
			this.underArray.splice(i,1);
			this.newStar(false);
			i--;
		}
	}

	for (var i = 0; i < this.overArray.length; i++)	{
		if (this.overArray[i].x+27 < 0)	{
			this.overArray.splice(i,1);
			this.newStar(false);
			i--;
		}
	}
}

Background.prototype.newStar = function(init)	{
	console.log("trying")
	while (Math.random() >= this.underArray.length/this.underStars)	{
		console.log("New Under", this.underArray.length/this.underStars);
		var sp = new createjs.Sprite(this.ss);
		sp.gotoAndStop(Math.random() * sp.spriteSheet.getNumFrames());
		
		if (init)	{
			sp.x = Math.random()*(canvas.width+200);
		}	else	{
			sp.x = Math.random()*100 + canvas.width+100;
		}
		sp.y = Math.random()*canvas.height;

		sp.depthvar = Math.random()*0.1+0.1;
		// sp.alpha = sp.depthvar+Math.random()*0.8
		this.underStage.addChild(sp);
		this.underArray.push(sp);
	}

	while (Math.random() > this.overArray.length/this.overStars)	{
		console.log("New Over", this.overArray.length/this.overStars);
		var sp = new createjs.Sprite(this.ss);
		sp.gotoAndStop(Math.random() * sp.spriteSheet.getNumFrames());

		if (init)	{
			sp.x = Math.random()*canvas.width;
		}	else	{
			sp.x = Math.random()*(canvas.width+200);
		}
		sp.y = Math.random()*canvas.height;

		sp.depthvar = Math.random()*0.9+0.2;
		// sp.alpha = sp.depthvar+Math.random()*0.8;
		this.overStage.addChild(sp);
		this.overArray.push(sp);
	}
}

Background.prototype.spawnInitialStars = function() {	
	var j  = 0;
	while (j < this.underStars + this.overStars)	{
		this.newStar(true);
		j++;
	}
};