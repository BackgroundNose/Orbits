function UI(min, max)
{
	this.stage = new createjs.Container();

	this.targeter = new createjs.Shape();
	this.pathShape = new createjs.Shape();
	this.pathShape.cache(0,0,canvas.width, canvas.height);

	this.powerStage = new createjs.Container();
	this.powerStage.x = canvas.width - 106;
	this.powerStage.y = 3;
	this.powerBars = new Array();
	this.loadSprites();
	this.activatedBar = undefined;
	this.cheatBar = undefined;

	this.cheatDown = false;
	this.cheatRect = this.cheatButton.getBounds();
	this.cheatRect.x += this.cheatButton.x;
	this.cheatRect.y += this.cheatButton.y;

	this.radialBar = new createjs.Shape();
	this.radialRad = 45;

	this.stage.addChild(this.powerStage);
	this.stage.addChild(this.radial);
	this.stage.addChild(this.radialBar);
	this.stage.addChild(this.cheatButton);

	this.stage.addChild(this.targeter);
	this.stage.addChild(this.pathShape);

	this.minSwipeLength = min;
	this.maxSwipeLength = max;

	this.angText = new createjs.Text("000", "bold 16px Courier", "#2F2");
	this.forceText = new createjs.Text("000", "bold 16px Courier", "#2F2");

	this.angText.x = canvas.width - 100;
	this.angText.y = this.radial.y + 50 + 5;
	this.stage.addChild(this.angText);

	this.forceText.x = canvas.width - 45;
	this.forceText.y = this.radial.y + 50 + 5;
	this.stage.addChild(this.forceText);

	this.launched = 0;
	this.passed = 0;
	this.skipped = 0;
	this.probesHere = 0;

	this.textSep = 25;

	this.launchedText = new createjs.Text("0", "bold 36px Courier", "#8BD" );
	this.launchedText.x = Math.floor(canvas.width/2.0 - (this.launchedText.getBounds().width/2.0));
	this.launchedText.y = 3;
	this.stage.addChild(this.launchedText);

	this.probesHereText = new createjs.Text("+0", "bold 36px Courier", "#8BD" );
	this.probesHereText.x = this.launchedText.x + this.launchedText.getBounds().width;
	this.probesHereText.y = 3;
	this.stage.addChild(this.probesHereText);

	this.passedText = new createjs.Text("0", "bold 36px Courier", "#8DB" );
	this.passedText.x = this.probesHereText.x + this.probesHereText.getBounds().width + this.textSep;
	this.passedText.y = 3;
	this.stage.addChild(this.passedText);

	this.skipText = new createjs.Text("0", "bold 36px Courier", "#D33");
	this.skipText.x = this.passedText.x + this.passedText.getBounds().width  + this.textSep;
	this.skipText.y = 3;
	this.stage.addChild(this.skipText);
}

UI.prototype.updateText = function(launch, here, pass, skip)	{
	if (launch === undefined) {launch = 0;}
	if (here === undefined) {here = 0;}
	if (pass === undefined) {pass = 0;}
	if (skip === undefined) {skip = 0;}

	this.launched += launch;
	this.probesHere += here;
	this.passed	+= pass;
	this.skipped += skip;

	this.launchedText.text = this.launched.toString();
	this.probesHereText.text = "+"+this.probesHere.toString();
	this.passedText.text = this.passed.toString();
	this.skipText.text = this.skipped.toString();

	var startX = canvas.width/2.0 - (this.launchedText.getBounds().width + 
									this.probesHereText.getBounds().width + 
									this.passedText.getBounds().width + 
									this.skipText.getBounds().width)/2.0;

	this.launchedText.x = startX;
	this.probesHereText.x = this.launchedText.x + this.launchedText.getBounds().width;
	this.passedText.x = this.probesHereText.x + this.probesHereText.getBounds().width + this.textSep;
	this.skipText.x = this.passedText.x + this.passedText.getBounds().width  + this.textSep;
}

UI.prototype.applyProbesHere = function()	{
	this.launched += this.probesHere;
	this.probesHere = 0;
	this.updateText(0,0,0,0);
}

UI.prototype.Update = function(delta, swipe, probeMan) {
	this.targeter.graphics.clear();

	if ((!mouse.down && mouse.last) && collidePointRect(mouse, this.cheatRect))	{
		this.cheatDown = true;
	}	else	{
		this.cheatDown = false;
	}

	if (swipe.swiping == true && swipe.swipeLength >= this.minSwipeLength)	{
		var len = probeMan.quantizeLaunchPower(Math.min(swipe.swipeLength,this.maxSwipeLength)/this.maxSwipeLength);
		len *= this.maxSwipeLength;	
		var dVec = new Vector(0,-1);
		dVec.rotate(toRad(probeMan.quantizeLaunchAngle(toDeg(angleToY(swipe.swipeVec)))));
		dVec.scalarMult(len);
		this.drawTargeterArrow(swipe.start.x, swipe.start.y, swipe.start.x+dVec.x, swipe.start.y+dVec.y);
	}
};

UI.prototype.updateScore = function(launch, pass, skip)	{
	this.launched += launch;
	this.passed	+= pass;
	this.skipped += skip;
}

UI.prototype.drawTargeterArrow = function(startX, startY, endX, endY)	{
	var lineNorm = new Vector(endX - startX, endY - startY);
	var arrowSplay = 30;
	var arrowLength = 5;
	lineNorm.normalise();
	this.targeter.graphics.s("#F55").ss(2);
	this.targeter.graphics.mt(startX + lineNorm.y*5, startY - lineNorm.x*5);
	this.targeter.graphics.lt(startX + lineNorm.y*-5, startY - lineNorm.x*-5);
	this.targeter.graphics.mt(startX, startY);
	this.targeter.graphics.lt(endX, endY);
	lineNorm.rotate(toRad(180-arrowSplay));
	this.targeter.graphics.lt(endX+lineNorm.x*arrowLength, endY+lineNorm.y*arrowLength);
	lineNorm.rotate(toRad(2*arrowSplay));
	this.targeter.graphics.mt(endX, endY);
	this.targeter.graphics.lt(endX+lineNorm.x*arrowLength, endY+lineNorm.y*arrowLength);
	this.targeter.graphics.es();
}

UI.prototype.clearStuff = function()	{
	if (this.cheatBar !== undefined)	{
		this.powerBars[this.cheatBar].gotoAndStop("ina");
	}

	if (this.activatedBar !== undefined)	{
		this.powerBars[this.activatedBar].gotoAndStop("ina");
	}

	this.radialBar.graphics.clear();

	this.cheatBar = undefined;

	this.pathShape.graphics.clear();
	this.pathShape.updateCache();

	this.angText.text = "000";
	this.forceText.text = "000";
}

UI.prototype.drawPath = function(path, decimate)	{
	this.pathShape.graphics.clear();
	this.pathShape.graphics.s("#55F");

	this.pathShape.graphics.mt(path[0].x,path[0].y);

	if (decimate === undefined)	{
		decimate = 1;
	}

	for (var i = 1; i < path.length; i += decimate)	{
		this.pathShape.graphics.lt(path[i].x, path[i].y);
	}

	this.pathShape.graphics.lt(path[path.length-1].x, path[path.length-1].y);

	this.pathShape.graphics.es();

	this.pathShape.updateCache();
}

UI.prototype.setActiveBar = function(pwr)	{
	var str = "" + Math.floor(pwr*100);
	var pad = "000";
	this.forceText.text = pad.substring(0, pad.length - str.length) + str;
	if (this.activatedBar !== undefined)	{
		this.powerBars[this.activatedBar].gotoAndStop("ina");
	}
	this.activatedBar = Math.floor(pwr * (this.powerBars.length-1));
	this.powerBars[this.activatedBar].gotoAndStop("act");
}

UI.prototype.setCheatBar = function(pwr)	{
	if (this.cheatBar !== undefined)	{
		this.powerBars[this.cheatBar].gotoAndStop("ina");
	}
	this.cheatBar = Math.floor(pwr * (this.powerBars.length-1));
	this.powerBars[this.cheatBar].gotoAndStop("red");
}

UI.prototype.setRadialBar = function(ang)	{
	var vec = new Vector(0,-1);
	var str = "" + Math.floor(ang);
	var pad = "000";
	this.angText.text = pad.substring(0, pad.length - str.length) + str;
	vec.rotate(toRad(ang));
	vec.scalarMult(this.radialRad);
	this.radialBar.graphics.clear();
	this.radialBar.graphics.s("#0fbc0d").ss(2);
	this.radialBar.graphics.mt(this.radial.x, this.radial.y)
	this.radialBar.graphics.lt(this.radial.x + vec.x, this.radial.y + vec.y);
	this.radialBar.graphics.es();
}

UI.prototype.setRadialBarCheat = function(ang)	{
	var vec = new Vector(0,-1);
	vec.rotate(toRad(ang));
	vec.scalarMult(this.radialRad);
	this.radialBar.graphics.clear();
	this.radialBar.graphics.s("#C11").ss(2);
	this.radialBar.graphics.mt(this.radial.x, this.radial.y)
	this.radialBar.graphics.lt(this.radial.x + vec.x, this.radial.y + vec.y);
	this.radialBar.graphics.es();
}

UI.prototype.loadSprites = function()	{
	var spacing = 7;
	var offsetY = 5;
	var offsetX = 3;
	var ss = new createjs.SpriteSheet({
						"frames": {
                            "width": 100,
                            "height": 5,
                            "regX": 0,
                            "regY": 0,
                            "numFrames": 3
                        },
                        "animations": {
                            "act":[0],
                            "ina":[1],
                            "red":[2]
                        },
                        "images": [preload.getResult("powerBar")]});

	for (var i = 0; i < 50; i++)	{
		this.powerBars.push(new createjs.Sprite(ss));
		this.powerBars[i].x = offsetX;
		this.powerBars[i].y = (50*spacing - i*spacing);
		this.powerBars[i].gotoAndStop("ina");
		this.powerStage.addChild(this.powerBars[i]);
	}

	this.radial = new createjs.Sprite(
					new createjs.SpriteSheet({
						"frames": {
                            "width": 100,
                            "height": 100,
                            "regX": 50,
                            "regY": 50,
                            "numFrames": 1
                        },
                        "animations": {
                            "rad":[0]
                        },
                        "images": [preload.getResult("radial")]}) 
					);
	this.radial.gotoAndStop("rad");

	this.radial.x = canvas.width - (3 + 50);
	this.radial.y = canvas.height - (150 + 50);

	this.cheatButton = new createjs.Sprite(
					new createjs.SpriteSheet({
						"frames": {
                            "width": 100,
                            "height": 100,
                            "regX": 50,
                            "regY": 50,
                            "numFrames": 2
                        },
                        "animations": {
                            "ina":[0],
                            "act":[1]
                        },
                        "images": [preload.getResult("cheatButton")]})
					);
	this.cheatButton.gotoAndStop("ina");

	this.cheatButton.x = canvas.width - (3 + 50);
	this.cheatButton.y = canvas.height - (3 + 50);
}