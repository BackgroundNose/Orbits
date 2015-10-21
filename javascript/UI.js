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
};

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