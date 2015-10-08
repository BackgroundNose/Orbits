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

UI.prototype.Update = function(delta, swipe) {
	this.targeter.graphics.clear();


	if (swipe.swiping == true && swipe.swipeLength >= this.minSwipeLength)	{
		this.targeter.graphics.s("#F55").ss(2);
		this.targeter.graphics.mt(swipe.start.x, swipe.start.y);
		if (swipe.swipeLength <= this.maxSwipeLength)	{
			this.targeter.graphics.lt(swipe.end.x, swipe.end.y);
		}	else 	{
			var clamped = swipe.swipeVec.outScalarMult(this.maxSwipeLength/swipe.swipeLength);
			this.targeter.graphics.lt(swipe.start.x + clamped.x, swipe.start.y + clamped.y)
		}
		this.targeter.graphics.es();
	}
};

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