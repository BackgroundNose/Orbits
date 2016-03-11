function UI(min, max)
{
	this.stage = new createjs.Container();

	this.targeter = new createjs.Shape();
	this.pathShape = new createjs.Shape();
	this.pathShape.cache(0,0,canvas.width, canvas.height);

	this.stage.addChild(this.targeter);
	this.stage.addChild(this.pathShape);

	this.minSwipeLength = min;
	this.maxSwipeLength = max;

	this.launched = 0;
	this.passed = 0;
	this.skipped = 0;
	this.probesHere = 0;

	this.textSep = 25;

	this.launchedText = new createjs.Text("0", "36px Aldrich", "#8BD" );
	this.launchedText.x = Math.floor(canvas.width/2.0 - (this.launchedText.getBounds().width/2.0));
	this.launchedText.y = 3;
	this.stage.addChild(this.launchedText);

	this.probesHereText = new createjs.Text("+0", "36px Aldrich", "#8BD" );
	this.probesHereText.x = this.launchedText.x + this.launchedText.getBounds().width;
	this.probesHereText.y = 3;
	this.stage.addChild(this.probesHereText);

	this.passedText = new createjs.Text("0", "36px Aldrich", "#8DB" );
	this.passedText.x = this.probesHereText.x + this.probesHereText.getBounds().width + this.textSep;
	this.passedText.y = 3;
	this.stage.addChild(this.passedText);

	this.scanBarWidth = 300;
	this.scanBarHeight = 15;
	this.scanBarYOffset = 30;
	this.scanBarBackingEdge = 4;
	this.scanBarProp = -1.0;
	this.scanBar = new createjs.Shape();
	this.scanBar.x = canvas.width/2.0 - this.scanBarWidth/2.0;
	this.scanBar.y = canvas.height - (this.scanBarHeight + this.scanBarYOffset);
	this.scanBar.cache(-(this.scanBarBackingEdge+5),-(this.scanBarBackingEdge+5),
		this.scanBarWidth+2*this.scanBarBackingEdge+10,this.scanBarHeight+2*this.scanBarBackingEdge+10);
	this.stage.addChild(this.scanBar);
	this.updateScanBar(0.0);

	this.fallBox = new createjs.Shape()
	this.fallBox.x = this.scanBar.x;
	this.fallBox.cache(0,0, this.scanBarWidth, this.scanBarHeight);
	this.stage.addChild(this.fallBox);
	this.fallBox.alpha = 0.0;
	this.droppingBox = false;
	this.droppingElapsed = 0;
	this.droppingTTL = 0.35;

	this.mineTargetT = undefined;
	this.mineTargetB = undefined;
	this.mineTargetL = undefined;
	this.mineTargetR = undefined;
	this.setupMineTargets();
	this.targettingMine = false;
	this.minePos = new Vector(0,0);
	this.MTelapsed = 0.0;
	this.MTfadeIn = 0.25;
	this.MTmoveIn = 1.00;
	this.MTfadeOut = 0.25;
}

UI.prototype.showMineTarget = function(minePos)	{
	this.minePos.x = minePos.x;
	this.minePos.y = minePos.y;

	this.stage.addChild(this.mineTargetT, this.mineTargetB, this.mineTargetL, this.mineTargetR);
	
	var startOffset = 400;

	this.mineTargetT.x = this.mineTargetB.x = minePos.x;
	this.mineTargetL.x = minePos.x - startOffset;
	this.mineTargetR.x = minePos.x + startOffset;

	this.mineTargetL.y = this.mineTargetR.y = minePos.y;
	this.mineTargetT.y = minePos.y - startOffset;
	this.mineTargetB.y = minePos.y + startOffset;

	this.mineTargetT.alpha = this.mineTargetB.alpha = 
		this.mineTargetL.alpha = this.mineTargetR.alpha = 0.0;

	this.targettingMine = true;
	this.MTelapsed = 0.0;
}

UI.prototype.updateMineTarget = function(delta)	{
	this.MTelapsed += delta;

	var surroundOffset = 55;

	if (this.MTelapsed >= this.MTfadeIn+this.MTmoveIn+this.MTfadeOut)	{
		// We are done. Clean up.
		this.stage.removeChild(this.mineTargetT, this.mineTargetB, this.mineTargetL, this.mineTargetR);
		this.targettingMine = false;
		return;
	}	else if (this.MTelapsed >= this.MTfadeIn+this.MTmoveIn)	{
		// Fade out phase
		var mu = (this.MTelapsed - (this.MTfadeIn+this.MTmoveIn)) / this.MTfadeOut;
		
		this.mineTargetT.alpha = this.mineTargetB.alpha = 
			this.mineTargetL.alpha = this.mineTargetR.alpha = 
				lerp(1.0, 0, mu);
	}	else if (this.MTelapsed >= this.MTfadeIn)	{
		// Move the targets inwards exponentially
		this.mineTargetT.alpha = this.mineTargetB.alpha = 
			this.mineTargetL.alpha = this.mineTargetR.alpha = 1.0;
	 	var t = (this.MTelapsed - (this.MTfadeIn));
	 	var delay = 0.0;
		this.mineTargetT.y = cosineInterpolate(this.mineTargetT.y, this.minePos.y-surroundOffset, 
			Math.min(Math.max(0, t / (this.MTmoveIn-3*delay)), 1));
		this.mineTargetR.x = cosineInterpolate(this.mineTargetR.x, this.minePos.x+surroundOffset, 
			Math.min(Math.max(0, (t-delay)) / (this.MTmoveIn-2*delay), 1));
		this.mineTargetB.y = cosineInterpolate(this.mineTargetB.y, this.minePos.y+surroundOffset, 
			Math.min(Math.max(0, (t-2*delay)) / (this.MTmoveIn-delay), 1));
		this.mineTargetL.x = cosineInterpolate(this.mineTargetL.x, this.minePos.x-surroundOffset, 
			Math.min(Math.max(0, (t-3*delay)) / (this.MTmoveIn), 1));
	} 	else 	{
		// Fade in phase
		var mu = this.MTelapsed / this.MTfadeIn;

		this.mineTargetT.alpha = this.mineTargetB.alpha = 
			this.mineTargetL.alpha = this.mineTargetR.alpha = 
				lerp(0, 1.0, mu);
	}
}

UI.prototype.startBoxDrop = function()	{
	this.droppingElapsed = 0;

	this.fallBox.y = this.scanBar.y;
	this.fallBox.alpha = 1.0;

	// Draw it in the same way as the real bar.
	this.fallBox.graphics.clear();
	this.fallBox.graphics.f("#9F9");
	this.fallBox.graphics.r(0, 0, this.scanBarWidth*this.scanBarProp, 4);

	this.fallBox.graphics.f("#0F0");
	this.fallBox.graphics.r(0, 4, this.scanBarWidth*this.scanBarProp, this.scanBarHeight-9);

	this.fallBox.graphics.f("#090");
	this.fallBox.graphics.r(0, this.scanBarHeight-5, this.scanBarWidth*this.scanBarProp, 6);
	this.fallBox.updateCache();

	this.droppingBox = true;
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

	var startX = canvas.width/2.0 - (this.launchedText.getBounds().width + 
									this.probesHereText.getBounds().width + 
									this.passedText.getBounds().width)/2.0; 

	this.launchedText.x = startX;
	this.probesHereText.x = this.launchedText.x + this.launchedText.getBounds().width;
	this.passedText.x = this.probesHereText.x + this.probesHereText.getBounds().width + this.textSep;
}

UI.prototype.applyProbesHere = function()	{
	this.launched += this.probesHere;
	this.probesHere = 0;
	this.updateText(0,0,0,0);
}

UI.prototype.Update = function(delta, swipe, probeMan) {
	this.targeter.graphics.clear();

	if (swipe.swiping == true && swipe.swipeLength >= this.minSwipeLength)	{
		var len = probeMan.quantizeLaunchPower(Math.min(swipe.swipeLength,this.maxSwipeLength)/this.maxSwipeLength);
		len *= this.maxSwipeLength;	
		var dVec = new Vector(0,-1);
		dVec.rotate(toRad(probeMan.quantizeLaunchAngle(toDeg(angleToY(swipe.swipeVec)))));
		dVec.scalarMult(len);
		this.drawTargeterArrow(swipe.start.x, swipe.start.y, swipe.start.x+dVec.x, swipe.start.y+dVec.y);
	}

	if (this.droppingBox)	{
		this.droppingElapsed += delta;

		if (this.droppingElapsed > this.droppingTTL)	{
			this.droppingBox = false;
			this.fallBox.alpha = 0.0;
		}	else 	{
			this.fallBox.y = easeInBack(0, this.droppingElapsed, 
										this.fallBox.y, 10, this.droppingTTL,1.50)
			this.fallBox.alpha = lerp(1.0, 0, this.droppingElapsed/this.droppingTTL);
		}
	}

	if (this.targettingMine)	{
		this.updateMineTarget(delta);
	}
};

UI.prototype.updateScanBar = function(prop)	{
	if (prop == this.scanBarProp)	{
		return;
	}
	this.scanBarProp = prop;
	this.scanBar.graphics.clear();

	// Bar Back drop
	this.scanBar.graphics.f("#333")
	this.scanBar.graphics.rr(-this.scanBarBackingEdge+2,-this.scanBarBackingEdge+2,
		this.scanBarWidth+2*this.scanBarBackingEdge,this.scanBarHeight+2*this.scanBarBackingEdge, 4)
	this.scanBar.graphics.f("#555")
	this.scanBar.graphics.rr(-this.scanBarBackingEdge,-this.scanBarBackingEdge,
		this.scanBarWidth+2*this.scanBarBackingEdge,this.scanBarHeight+2*this.scanBarBackingEdge, 4)

	// Bar itself
	this.scanBar.graphics.f("#9F9");
	this.scanBar.graphics.r(0, 0, this.scanBarWidth*prop, 4);

	this.scanBar.graphics.f("#0F0");
	this.scanBar.graphics.r(0, 4, this.scanBarWidth*prop, this.scanBarHeight-9);

	this.scanBar.graphics.f("#090");
	this.scanBar.graphics.r(0, this.scanBarHeight-5, this.scanBarWidth*prop, 6);
	this.scanBar.updateCache();
}

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
	this.pathShape.graphics.clear();
	this.pathShape.updateCache();
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

UI.prototype.setupMineTargets = function()	{
	var temp = new createjs.Sprite(
					new createjs.SpriteSheet({
						"frames": {
                            "width": 100,
                            "height": 30,
                            "regX": 50,
                            "regY": 15,
                            "numFrames": 1
                        },
                        "animations": {
                            "i":[0]
                        },
                        "images": [preload.getResult("mineTarget")]})
					);
	this.mineTargetT = temp.clone();
	this.mineTargetT.rotation = 180;
	this.mineTargetB = temp.clone();

	this.mineTargetL = temp.clone();
	this.mineTargetL.rotation = 90;
	this.mineTargetR = temp.clone();
	this.mineTargetR.rotation = 270;
}