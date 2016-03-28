function Background(totalRect)	{
	this.interestss = new createjs.SpriteSheet({
				"frames": {
                    "width": 50,
                    "height": 50,
                    "regX": 25,
                    "regY": 25,
                    "numFrames": 12
                },
                "images": [preload.getResult("interestStars")]}) 
	this.ss = new createjs.SpriteSheet({
				"frames": {
                    "width": 25,
                    "height": 25,
                    "regX": 12.5,
                    "regY": 12.5,
                    "numFrames": 36
                },
                "images": [preload.getResult("stars")]}) 
	this.smallss = new createjs.SpriteSheet({
				"frames": {
                    "width": 1,
                    "height": 1,
                    "regX": 0.5,
                    "regY": 0.5,
                    "numFrames": 625
                },
                "images": [preload.getResult("smallStars")]}) 

	this.starArray = new Array();
	this.totalRect = totalRect;
	this.interestCount = 0;
	this.underCount = 0;
	this.overCount = 0;
	this.overStars = 30;
	this.underStars = 40;
	this.interestStars = 12;

	this.stage = new createjs.Container();

	this.stage.addChild(this.underStage);

	this.moveRate = -150;

	this.dbgshape = new createjs.Shape();
	this.stage.addChild(this.dbgshape);
}

Background.prototype.clearAllThings = function()	{
	this.stage.removeAllChildren();
	this.starArray.length = 0;
}

Background.prototype.scaleStars = function(scale, shift)	{
	var center = new Vector(canvas.width/2.0, canvas.height/2.0);

	for (var i = 0; i < this.starArray.length; i++)	{
		this.starArray[i].setScreenPos(center, scale, shift);
	}
}

Background.prototype.shiftThings = function(delta)	{
	var mov = this.moveRate*delta;


	for (var i = 0; i < this.starArray.length; i++)	{
		this.starArray[i].moveBy({'x':mov*this.starArray[i].depthvar, 'y':0});
	}

	for (var i = 0; i < this.starArray.length; i++)	{
		if (this.starArray[i].position.x+27 < 0)	{
			if (this.starArray[i].type == "U")	{
				this.underCount--;
			}	else if (this.starArray[i].type == "O")	{
				this.overCount--;
			}	else if (this.starArray[i].type == "I") {
				this.interestCount--;
			}	else {
				console.log("What the hell kind of star is this anyway?", this.starArray[i].type);
			}
			this.stage.removeChild(this.starArray[i].sprite);
			this.starArray.splice(i,1);
			this.newStar(false);
			i--;
		}
	}
}

Background.prototype.newStar = function(init)	{
	while (Math.random() >= this.underCount/this.underStars)	{
		var sp = new Star(this.smallss, Math.random()*0.1+0.1, "U");
		
		if (init)	{
			var ix = Math.random()*(canvas.width+200);
		}	else	{
			var ix = Math.random()*50 + canvas.width+50;
		}
		var iy = Math.random()*(canvas.height + 10) - 20;

		sp.moveTo(new Vector(ix, iy));

		this.stage.addChild(sp.sprite);
		this.starArray.push(sp);
		this.underCount++;
	}

	while (Math.random() > this.overCount/this.overStars)	{
		var sp = new Star(this.ss, Math.random()*0.4+0.2, "O");

		if (init)	{
			var ix = Math.random()*canvas.width;
		}	else	{
			var ix = Math.random()*50 + canvas.width+50;
		}
		var iy = Math.random()*(canvas.height + 50) - 100;

		sp.moveTo(new Vector(ix, iy));

		this.stage.addChild(sp.sprite);
		this.starArray.push(sp);
		this.overCount++;
	}

	while (Math.random() > (this.interestCount+10)/this.interestStars)	{
		var sp = new Star(this.interestss, Math.random()*0.4+0.6, "I");
		if (init)	{
			var ix = Math.random()*canvas.width;
		}	else	{
			var ix = Math.random()*50 + canvas.width+50;
		}
		var iy = Math.random()*(canvas.height + 100) - 200;

		sp.moveTo(new Vector(ix, iy));

		this.stage.addChild(sp.sprite);
		this.starArray.push(sp);
		this.interestCount++;
	}
}

Background.prototype.spawnInitialStars = function() {	
	var j  = 0;

	while (j < this.underStars + this.overStars + this.interestStars)	{
		this.newStar(true);
		j++;
	}
};

Background.prototype.saveToList = function()	{
	var out = [];
	for (var i = 0; i < this.starArray.length; i++)	{
		var star = this.starArray[i]
		out.push(star.getSaveRep());
	}
	return out;
}

Background.prototype.loadFromSave = function(inlist)	{
	this.clearAllThings();
	for (var i = 0; i < inlist.length; i++)	{
		var ss = undefined;
		if (inlist[i].type == "U")	{
			ss = this.smallss;
		}	else if (inlist[i].type == "O")	{
			ss = this.ss;
		} 	else if (inlist[i].type == "I")	{
			ss = this.interestss;
		} 	else 	{
			console.error("UNKNOWN STAR TYPE: ", inlist[i].type);
		}
		star = new Star(ss, inlist[i].depth, inlist[i].type);
		star.moveTo(new Vector(inlist[i].x, inlist[i].y));
		star.sprite.gotoAndStop(inlist[i].frame);
		this.stage.addChild(star.sprite);
		this.starArray.push(star);
	}
}

function Star(ss, depth, type)	{
	this.sprite =  new createjs.Sprite(ss);
	this.sprite.gotoAndStop(Math.random() * this.sprite.spriteSheet.getNumFrames());
	this.position = new Vector();
	this.depthvar = depth;
	this.type = type;
}

Star.prototype.moveBy = function(diff)	{
	this.position.x += diff.x;
	this.position.y += diff.y;

	this.sprite.x += diff.x;
	this.sprite.y += diff.y;
}

Star.prototype.moveTo = function(pos) {
	this.position.x = pos.x;
	this.position.y = pos.y;

	this.sprite.x = pos.x;
	this.sprite.y = pos.y;
};

Star.prototype.setScreenPos = function(center, scale, shift)	{
	var dispVec = new Vector(center.x - this.position.x + shift.x, center.y - this.position.y + shift.y);
	dispVec.scalarMult((1-scale)/2*this.depthvar);

	this.sprite.x = this.position.x + dispVec.x;
	this.sprite.y = this.position.y + dispVec.y;
}

Star.prototype.getSaveRep = function()	{
	return {'x':this.position.x,'y':this.position.y,'type':this.type, 
		'depth':this.depthvar,'frame':this.sprite.currentFrame};
}