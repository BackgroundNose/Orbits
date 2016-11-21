function TextBox()	{
	this.display = new createjs.Container();
	this.background = new createjs.Shape();
	this.spanRect = new createjs.Rectangle();
	this.text = new createjs.Text("THIS TEXT IS THE PLACEHOLDER TEXT", "22px Aldrich", "#434" );
	this.text.lineWidth = 400;
	this.textBorder = new Vector(30,40);
	this.charWidth = 18;

	this.sprite = new createjs.Sprite(new createjs.SpriteSheet({
			"frames": {
                "width": 70,
                "height": 189,
                "regX": 0,
                "regY": 0
            },
            "animations":{
            	"happy":0,
            	"blank":1
            },
            "images": [preload.getResult("computer")]})
		);
	this.sprite.gotoAndStop("blank");
	this.compBackground = new createjs.Bitmap(preload.getResult("compBackground"));
}

TextBox.prototype.formBox = function(text, img, width, height, buttonText) {
	var cpl = Math.floor((width-(2*this.textBorder.x))/this.charWidth);

	this.display.addChild(this.background);
	
	this.background.graphics.clear();
	this.background.graphics.f("#55555d");
	this.background.graphics.rr(4,4,width,height,7);
	this.background.graphics.f("#d5d5dd");
	this.background.graphics.rr(0,0,width,height,7);
	this.background.graphics.es().ef();

	this.messages = text;

	this.display.addChild(this.text);
	// this.text.text = lineBreakString(this.messages[0], cpl);
	this.text.text = this.messages[0];
	this.messages.splice(0,1);
	
	this.text.x = this.textBorder.x;
	this.text.y = this.textBorder.y;

	if (img !== undefined)	{
		this.sprite.gotoAndStop(img);
	}	else	{
		this.sprite.gotoAndStop("blank");
	}

	this.display.addChild(this.compBackground);
	this.compBackground.x = this.text.x + this.text.lineWidth + 20;
	this.compBackground.y = this.text.y;

	this.display.addChild(this.sprite);
	this.sprite.x = this.compBackground.x + 70;
	this.sprite.y = this.compBackground.y + 20;

	var buttonWidth = 175;
	var buttonHeight = 50;
	this.button = new Button("Continue", new createjs.Rectangle(0,0,buttonWidth,buttonHeight)); 
	this.button.moveTo({'x':width-(buttonWidth+30), 'y':height-(buttonHeight+20)});

	this.display.addChild(this.button.stage);

	this.spanRect = new createjs.Rectangle(0,0,width,height);

	return this.display;
};

TextBox.prototype.nextMessage = function()	{
	if (this.messages.length == 0)	{
		return true;
	}	else	{
		this.text.text = this.messages[0];
		this.messages.splice(0,1);
		return false;
	}
}

function Button(text, rect)	{
	this.stage = new createjs.Container();

	this.hitrect = rect;

	this.shape = new createjs.Shape();
	this.shape.graphics.s("#000").f("#990099");
	this.shape.graphics.rr(0,0,rect.width, rect.height,2);
	this.shape.graphics.ef().es().f("rgba(1,1,1,0.25)").rr(2,2,rect.width, rect.height,2)
	this.shape.graphics.ef();

	this.text = new createjs.Text("PLACEHOLDER", "28px Aldrich", "#878");
	this.text.text = text;
	var textpos = this.text.getBounds();
	this.text.x = rect.width/2.0 - textpos.width/2.0-13;
	this.text.y = rect.height/2.0 - textpos.height/2.0-1;

	this.stage.addChild(this.shape);
	this.stage.addChild(this.text);
}

Button.prototype.moveTo = function(pos, screenPos)	{
	this.hitrect.x = this.stage.x = pos.x;
	this.hitrect.y = this.stage.y = pos.y;
}