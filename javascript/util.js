function lerp (A, B, mu)
{
     return A + ((B - A) * mu)
}

function clamp ( input, min, max)
{
	if (input > max) { return max; }
	else if (input < min) { return min; }
	else { return input; }
}

function clampMin ( input, min)
{
	if (input > min) { return input; }
	else { return min; }
}

function clampMax ( input, max)
{
	if (input < max) { return input; }
	else { return max; }
}

function cosineInterpolate(y1, y2, mu)
{
   mu2 = (1-Math.cos(mu*Math.PI))/2;
   return(y1*(1-mu2)+y2*mu2);
}

function sineInterpolate(y1, y2, mu)
{
   mu2 = (1-Math.sin(mu*Math.PI))/2;
   return(y1*(1-mu2)+y2*mu2);
}

function gramSchmidt(inVec, mag)		{
	if (mag == 0 || (inVec.y == 0 && inVec.x == 0))	{
		return new Vector(0,0);
	}
	//var VdW = DDOT(outVec, inVec);
	//var VdV = DDOT(outVec, outVec);
	    
	var retVec = new Vector(inVec.x,inVec.y);
	retVec.normalise();
	var temp = retVec.x;
	retVec.x = retVec.y;
	retVec.y = -temp;
	retVec.scalarMult(mag);
	//retVec.x = outVec.x - (VdW/VdV)*inVec.x;
	//retVec.y = outVec.y - (VdW/VdV)*inVec.y;
	return retVec;
}

function intersectRect(r1, r2) {
  return !(r1.x + r1.width <= r2.x || 
  		   r1.y + r1.height <= r2.y ||
           r1.x >= r2.x + r2.width || 
           r1.y >= r2.y + r2.height
           );
}

function containsRect(r1, r2) {
	return (r1.x <= r2.x &&
			r1.x + r1.width >= r2.x + r2.width &&
			r1.y <= r2.y &&
			r1.y + r1.height > r2.y + r2.height);
}

function analyseIntersectRect(r1, r2) {
	x_min = Math.max(r1.x, r2.x);
	y_min = Math.max(r1.y, r2.y);
	
	x_max = Math.min(r1.x+r1.width, r2.x+r2.width);
	y_max = Math.min(r1.y+r1.height, r2.y+r2.height);
	
	return new createjs.Rectangle(x_min, y_min, x_max-x_min, y_max-y_min);
}

function DDOT(vec1, vec2)
{
	return vec1.x * vec2.x + vec1.y * vec2.y;
}

function AddVectors(vec1, vec2)
{
    return new Vector(vec1.x + vec2.x, vec1.y + vec2.y);
}

function minikowskiDistance(A, B)	{
	Bpoint = new Vector(B.x + B.width/2, B.y + B.height/2);
	
	expandedA = new createjs.Rectangle(A.x-B.width/2, A.y-B.width, 
							A.width+B.width,A.height+B.height);
							
	return rectPointDistance(expandedA, Bpoint)					
}

function rectPointDistance(rect, point)	{
	if (point.x > rect.x && point.x < rect.x + rect.width &&
		point.y > rect.y && point.y < rect.y + rect.height)
		{	return -1; }	//return -1 to indicate contain
	else	
	{
		if (point.x > rect.x + rect.width)	
		{	var dx = point.x - (rect.x + rect.width);	}	
		else	{ 	var dx = point.x - rect.x;	}
		
		if (point.y > rect.y + rect.height)
		{	var dy = point.y - (rect.y + rect.height);	}
		else	{	var dy = point.y - rect.y;	}
		
		return Math.sqrt(dx*dx + dy*dy);
	}
}

function createBoundingBox(startRect, endRect)	{
	//	This assumes the rects are the same size
	
	var nx = Math.min(startRect.x, endRect.x);
	var ny = Math.min(startRect.y, endRect.y);
	
	var nw = Math.max(startRect.x+startRect.width, endRect.x+endRect.width) - nx;
	var nh = Math.max(startRect.y+startRect.height, endRect.y+endRect.height) - ny;
	nw = nw;
	nh = nh;
	return new createjs.Rectangle(nx, ny, nw, nh);
}

function boundingBoxRef(startRect, endRect, outRect)	{
	outRect.x = Math.min(startRect.x, endRect.x);
	outRect.y = Math.min(startRect.y, endRect.y);
	
	outRect.width = Math.max(startRect.x+startRect.width, endRect.x+endRect.width) - outRect.x;
	outRect.height = Math.max(startRect.y+startRect.height, endRect.y+endRect.height) - outRect.y;
}

function seperatingAxisAABB(rect1, rect2)	{	//rect1 = finRect rect2 = cellRect
	var cent1  = new Vector(rect1.x+rect1.width/2, rect1.y+rect1.height/2);
	var cent2  = new Vector(rect2.x+rect2.width/2, rect2.y+rect2.height/2);

    var halfVec1 = new Vector(rect1.width/2, rect1.height/2);
    var halfVec2 = new Vector(rect2.width/2, rect2.height/2);
    
	var sepVec = new Vector(cent1.x - cent2.x, cent1.y - cent2.y);
	
	var projection = new Vector(0,0);
	//console.log(Math.abs(sepVec.x)+"(x) vs. "+Math.abs(halfVec1.x)+","+Math.abs(halfVec2.x));
	//console.log(Math.abs(sepVec.y)+"(y) vs. "+Math.abs(halfVec1.y)+","+Math.abs(halfVec2.y));
	
	if (Math.abs(sepVec.x) < halfVec1.x + halfVec2.x && 
		Math.abs(sepVec.y) < halfVec1.y + halfVec2.y)
	{
		if (sepVec.x > 0)	{
			projection.x = rect2.x + rect2.width - rect1.x;
		}	else {
			projection.x = -1*(rect1.x + rect1.width - rect2.x);
		}
		
		if (sepVec.y > 0)	{
			projection.y = rect2.y + rect2.height - rect1.y;
		}	else {
			projection.y = -1*(rect1.y + rect1.height - rect2.y);
		}
		if (Math.abs(projection.y) <= Math.abs(projection.x))	{
			projection.x = 0;
		}	else	{
			projection.y = 0;
		}
	}
	return projection;
}

function collidePointRect( point, rect)	{
	return !(
		point.x < rect.x || 
		point.x > rect.x+rect.width ||
		point.y < rect.y ||
		point.y > rect.y+rect.height
		);
}

function collideRectCircle(rect, center, radius)	{
	// Transform to relative center rect.
	var pointMid = new Vector(Math.abs(center.x - (rect.x+rect.width/2)), Math.abs(center.y - (rect.y+rect.height/2)));

	// Check if circle overlaps edge
	if (pointMid.x - radius < rect.width/2 && pointMid.y - radius < rect.width/2 )	{
		return true;
	}

	// Failing that check for corner inside circle
	var rectCorner = new Vector(rect.width/2, rect.height/2);
	return collidePointCircle(rectCorner, pointMid, radius);
}

function collidePointCircle(point, center, radius)	{
	return ((point.x - center.x) * (point.x - center.x) + (point.y - center.y) * (point.y - center.y) < radius * radius);
}

function collideCircleCircle(pointA, radA, pointB, radB)	{
	return Math.pow(pointA.x-pointB.x,2) + Math.pow(pointA.y-pointB.y,2) < Math.pow(radA+radB,2);
}

function toPoundsPence(number)	{
	if (number != 0)
	{
		var pounds =  Math.floor(number/100.0).toString();
		var pence = Math.floor(((number/100.0) % 1)*100).toString();
		if (pence.length == 1 && Math.floor(((number/100.0) % 1)*100) > 9)
			{ pence += "0";	}
		else if (pence.length == 1 )
			{ pence = "0" + pence;	}
	
		return "\u00A3" + pounds + "." + pence;	
	}
	else 
	{
		return "\u00A3"+"0.00";
	}
}

function contains(a, obj) {
    var i = a.length;
    while (i--) {
       if (a[i] === obj) {
           return true;
       }
    }
    return false;
}

function toDeg(rad) {
    return rad*57.2957795;
}

function toRad(deg) {
    return deg*0.0174532925;
}

var LoadingBar = function(width, height, padding, color, frameColor) {

        //setting default values for our arguments if no value is given
        width = typeof width !== 'undefined' ? width : 300;
        height = typeof height !== 'undefined' ? height : 20;
        padding = typeof padding !== 'undefined' ? padding : 3;
        color = typeof color !== 'undefined' ? color : "black";
        frameColor = typeof frameColor !== 'undefined' ? frameColor : "black";

        this.stage = new createjs.Stage(canvas);

        //calling the initialize function that we have written
        this.initialize(width, height, padding, color, frameColor);
};

//the initialize function for our LoadingBar class
LoadingBar.prototype.initialize = function(width, height, padding, color, frameColor) {

        //the height, width, padding, color and frame color of the loading bar
        this.width = width;
        this.height = height;
        this.padding = padding;
        this.color = color;
        this.frameColor = frameColor;

        //placing of the container

        //creating the loading bar
        this.loadingBar = new createjs.Shape();
        var barOrigin = new Vector(canvas.width/2 - this.width/2, canvas.height/2 - 2*this.height);
        this.loadingBar.x = barOrigin.x;
        this.loadingBar.y = barOrigin.y;
        this.loadingBar.graphics.beginFill(this.color).drawRect(0, 0, this.width, this.height).endFill();
        this.loadingBar.scaleX = 0.0;
        //creating the frame around the loading bar
        this.frame = new createjs.Shape();
        this.frame.graphics.setStrokeStyle(1).beginStroke(this.frameColor).drawRect(barOrigin.x-this.padding/2, barOrigin.y-this.padding/2, this.width+this.padding, this.height+this.padding).endStroke();

        //adding the loading bar and the frame to our container
        this.stage.addChild(this.loadingBar, this.frame);
			
		
	    this.loadProgressLabel = new createjs.Text("", "18px Verdana", "black");
		this.loadProgressLabel.lineWidth = 200;
		this.loadProgressLabel.textAlign = "center";
		this.loadProgressLabel.x = barOrigin.x + this.width/2;
		this.loadProgressLabel.y = barOrigin.y - 40;

		this.stage.addChild(this.loadProgressLabel);
			
};