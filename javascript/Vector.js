function Vector(X, Y)
{
    this.x = X;
    this.y = Y;
}

Vector.prototype.toString= function()
{
	return ("x: " + this.x + ", y: " + this.y);
}

Vector.prototype.norm = function()
{
	if (this.x != 0 || this.y != 0)
	{
		return Math.sqrt(this.x * this.x + this.y * this.y);
	}
	else {return 0;}

}

Vector.prototype.normalise = function()
{
    var tempNorm = this.norm();
	if (tempNorm != 0 )
	{
		this.x = this.x / tempNorm;
		this.y = this.y / tempNorm;			
	}
	else
	{ return 0; }
}

Vector.prototype.outNormalised = function()
{
	var outvec = new Vector(this.x, this.y);
	outvec.normalise();
	return outvec;
}

Vector.prototype.grad = function()
{
	return this.y/this.x;
}
  
Vector.prototype.outScalarMult = function(scalar)
{
    return new Vector(this.x * scalar, this.y * scalar);
}

Vector.prototype.scalarMult = function(scalar)
{
    this.x *= scalar;
    this.y *= scalar;
    return this;
}

Vector.prototype.projectToVec = function(invec)	{
	var temp = new Vector(this.x, this.y);
	temp.normalise();
	var a1 = DDOT(invec, temp);
	var unit = invec.outNormalised();
	this.x = a1 * unit.x;
	this.y = a1 * unit.y;
}

Vector.prototype.getMajorAxis = function()
{
    if (Math.abs(this.x) > Math.abs(this.y))    {
        return new Vector(this.x, 0);
    }
    else
    {   return new Vector(0, this.y);   }
}   

Vector.prototype.seperation = function(invec)
{	return new Vector(invec.x - this.x, invec.y - this.y);	}

Vector.prototype.accumulate = function(invec)	{
	this.x += invec.x;
	this.y += invec.y;
}

Vector.prototype.clone = function()	{
	return new Vector(this.x,this.y);
}

Vector.prototype.zero = function()	{	
	this.x = 0;
	this.y = 0;
}

Vector.prototype.inArray = function(array)	{
	for (var i = 0; i < array.length; i++)
	{
		if (array[i].x == this.x && array[i].y == this.y)
			{	return true;	}
	}
	return false;
}

Vector.prototype.toString = function()
{  	return("X: "+this.x+", Y: "+this.y);	}

Vector.prototype.set = function(x, y)
{
	this.x = x;
	this.y = y;
};

Vector.prototype.equate = function(inp)
{
	this.x = inp.x;
	this.y = inp.y;
}

Vector.prototype.rotate = function(rad)
{
	var cs = Math.cos(rad);
	var sn = Math.sin(rad);
	var tx = this.x;
	this.x = this.x * cs - this.y * sn;
	this.y = tx * sn + this.y * cs; 
	return this;
}

Vector.prototype.outRotate = function(rad)
{
	var out = this.clone();
	out.rotate(rad);
	return out;
}

Vector.prototype.angleToY = function()  
{
    var t = this.outNormalised();
    return  (360 - toDeg(Math.atan2(-t.x, -t.y))) % 360;
}

Vector.Zero = new Vector(0,0);