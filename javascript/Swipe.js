function Swipe()	{
	this.start = new Vector(0,0);
	this.end = new Vector(0,0);
	this.complete = false;
	this.swipeVec = new Vector(0,0);
	this.swipeLength = 0;

	this.swiping = false;

	this.lastSwipeStart =  new Vector(0,0);
	this.lastSwipeEnd = new Vector(0,0);
}

Swipe.prototype.done = function()	{
	this.complete = true;
	this.swiping = false;
	this.swipeVec.x = this.end.x - this.start.x;
	this.swipeVec.y = this.end.y - this.start.y;

	this.swipeVec.scalarMult(-1);

	this.swipeLength = this.swipeVec.norm();
	this.swipeVec.normalise();
	return;
}

Swipe.prototype.Update = function()	{
	this.complete = false;
	if (mouse.down && !mouse.last)	{
		
		this.swiping = true;
		this.lastSwipeStart = this.start.clone();
		this.lastSwipeEnd = this.end.clone();

		this.start.x = mouse.x;
		this.start.y = mouse.y;
		
		this.end.x = mouse.x;
		this.end.y = mouse.y;

	}	else if (!mouse.down && mouse.last)	{
		this.end.x = mouse.x;
		this.end.y = mouse.y;
		this.done();

	}	else if (mouse.down && mouse.last )	{
		this.end.x = mouse.x;
		this.end.y = mouse.y;
	}

	if (this.swiping)	{
		this.swipeVec.x = this.end.x - this.start.x;
		this.swipeVec.y = this.end.y - this.start.y;

		this.swipeVec.scalarMult(-1);

		this.swipeLength = this.swipeVec.norm();
	}


}