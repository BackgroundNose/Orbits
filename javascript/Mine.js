function Mine()	{
	this.position = new Vector(0,0);
    this.cont = new createjs.Container();
	this.sprite = new createjs.Sprite(
		new createjs.SpriteSheet({
						"frames": {
                            "width": 70,
                            "height": 70,
                            "regX": 35,
                            "regY": 35,
                            "numFrames": 9
                        },
                        "animations": {
                            "mine":[0],
                            "tr":[1],
                            "tl":[2],
                            "br":[3],
                            "bl":[4]
                        },
                        "images": [preload.getResult("mine")]})
		);
    this.sprite.gotoAndStop("mine");

    this.cover = new createjs.Sprite(
        new createjs.SpriteSheet({
                        "frames": {
                            "width": 70,
                            "height": 70,
                            "regX": 35,
                            "regY": 35,
                            "numFrames": 1
                        },
                        "animations": {
                            "mine":[0],
                        },
                        "images": [preload.getResult("mineCover")]})
        );

    this.armList = undefined; //Set in setupContainer 

    this.partVelocities = new Array(); // Set to zeros in setupContainer
    this.partAngularVelocities = new Array(); // Set to zeros in setupContainer

    this.eyeLight = undefined; //Set in setupContainer
    this.eyeLightElapsed = 0;

	this.radius = 35;
    this.exploding = false;
    this.explodeElapsed = 0;
    this.explodeDuration = 2;
    this.kill = false;

    this.lightList = new Array();
    this.lightElapsed = new Array();
    this.eyeScanRate = Math.PI*1.5;
    this.eyeMu = 0.0;

    this.eyePosLeft = -9;
    this.eyePosRight = 11;
    this.eyePosTop = 0;
    this.eyePosBottom = 4;

    this.lastTimeProbe = false; 

    this.lookVec = new Vector();

    this.setupContainer();
    this.randomiseLights();
}

Mine.prototype.update = function (delta, probeMan) {
    if (this.exploding) {
        this.explodeUpdate(delta);
    }   else    {
        for (var i = 0; i < this.lightList.length; i++) {
                this.lightElapsed[i] += delta;
                this.lightList[i].alpha = cosineInterpolate(0.25,1,this.lightElapsed[i]);
        }

        if (probeMan.probeList.length == 0) {
            // No probe on the map. Scan left and right.
            if (this.lastTimeProbe) {
                this.eyeLightElapsed = this.eyeScanRate * this.eyeMu;
            }   else    {
                this.eyeLightElapsed += delta;
            }
            
            this.eyeMu = this.eyeLightElapsed/this.eyeScanRate;

            this.eyeLight.x = cosineInterpolate(this.eyePosLeft, this.eyePosRight, this.eyeMu);
            this.eyeLight.y = cosineInterpolate(this.eyePosTop, this.eyePosBottom, this.eyeMu*2);

            this.lastTimeProbe = false;
        }   else    {
            // Look at the probe.
            var probe = probeMan.probeList[0];

            if (probe.position.y < this.position.y) {
                if (probe.position.x < this.position.x) {
                    if (this.eyeLight)
                    this.eyeLight.x = lerp(this.eyeLight.x, this.eyePosLeft, 0.075);
                    this.eyeLight.y = lerp(this.eyeLight.y, this.eyePosTop, 0.075);
                }   else    {
                    this.eyeLight.x = lerp(this.eyeLight.x, this.eyePosRight, 0.075);
                    this.eyeLight.y = lerp(this.eyeLight.y, this.eyePosTop, 0.075);
                }
            }   else    {
                this.lookVec.x = probe.position.x - this.position.x;
                this.lookVec.y = probe.position.y - this.position.y;
                var ang = this.lookVec.angleToY();
                var mu = 1 - ((ang-90) / 180);

                this.eyeLight.x = lerp(this.eyeLight.x, cosineInterpolate(this.eyePosLeft, this.eyePosRight, mu), 0.1);
                this.eyeLight.y = lerp(this.eyeLight.y, cosineInterpolate(this.eyePosTop, this.eyePosBottom, mu*2), 0.1);
            }

            this.eyeMu = (this.eyeLight.x - this.eyePosLeft) / (this.eyePosRight - this.eyePosLeft);
            this.lastTimeProbe = true;
        }
    }
}

Mine.prototype.explodeUpdate = function(delta)  {
    for (var i = 0; i < this.lightList.length; i++) {
        this.lightList[i].alpha = Math.max(0, this.lightList[i].alpha - 2.0*delta);
    }

    this.sprite.x += this.partVelocities[0].x*delta;
    this.sprite.y += this.partVelocities[0].y*delta;
    this.sprite.rotation += this.partAngularVelocities[0]*delta;
    this.sprite.alpha -= delta*0.5;

    for (var i = 1; i < this.partVelocities.length; i++)    {
        this.armList[i-1].x += this.partVelocities[i].x*delta;
        this.armList[i-1].y += this.partVelocities[i].y*delta;
        this.armList[i-1].rotation += this.partAngularVelocities[i]*delta;
        this.armList[i-1].alpha -= delta*0.5;
    }

    this.explodeElapsed += delta;
    if (this.explodeElapsed >= this.explodeDuration)    {
        this.kill = true;
    }
}

Mine.prototype.startMineExplosion = function(hitPos)  {
    this.exploding = true;

    this.cont.removeChild(this.cover);
    this.cont.removeChild(this.eyeLight);

    var maxForce = 170;
    var minForce = 40;
    var maxAngVel = 720; //deg per sec

    var hitang = hitPos.seperation(this.position).angleToY();

    for (var i = 0; i < this.partVelocities.length; i++)    {
        this.partVelocities[i].x = 0;
        this.partVelocities[i].y = -1;
        this.partVelocities[i].rotate(toRad(hitang-45+Math.random()*90));
        this.partVelocities[i].scalarMult(Math.random()*(maxForce-minForce) + minForce);
        var rnd = Math.random()+Math.random() - 1; // [-1,1] gaussian around 0
        this.partAngularVelocities[i] = rnd * maxAngVel;
    }
}

Mine.prototype.randomiseLights = function  () {
    for (var i = 0; i < this.lightElapsed.length; i++)  {
        this.lightElapsed[i] = Math.random();
        this.lightList[i].alpha = cosineInterpolate(0.25,1,this.lightElapsed[i]);
    }
}

Mine.prototype.setupContainer = function() {
    var width = this.sprite.getBounds().width/2.0;
    var height = this.sprite.getBounds().height/2.0;

    this.partVelocities.push(new Vector(0,0));  // Core's velocity
    this.partAngularVelocities.push(0);         // Core's Angular Velocity

    this.armList = new Array();
    this.armList.push(this.sprite.clone());
    this.armList[0].x = 48 - width;
    this.armList[0].y = 21 - height;
    this.armList[0].gotoAndStop("tr");
    this.armList.push(this.sprite.clone());
    this.armList[1].x = 21 - width;
    this.armList[1].y = 21 - height;
    this.armList[1].gotoAndStop("tl");
    this.armList.push(this.sprite.clone());
    this.armList[2].x = 48 - width;
    this.armList[2].y = 47 - height;
    this.armList[2].gotoAndStop("br");
    this.armList.push(this.sprite.clone());
    this.armList[3].x = 21 - width;
    this.armList[3].y = 47 - height;
    this.armList[3].gotoAndStop("bl");

    for (var i = 0; i < this.armList.length; i++)   {
        this.cont.addChild(this.armList[i]);
        this.partVelocities.push(new Vector(0,0));
        this.partAngularVelocities.push(0);
    }

    this.lightList = new Array();
    var light = new createjs.Sprite(
        new createjs.SpriteSheet(
            {
                        "frames": {
                            "width": 14,
                            "height": 14,
                            "regX": 7,
                            "regY": 7,
                            "numFrames": 1
                        },
                        "animations": {
                            "i":[0]
                        },
                        "images": [preload.getResult("mineLight")]}
            )
        );

    light.x = 9 - width; light.y = 6 - height;
    this.lightList.push(light.clone());
    light.x = 65 - width; light.y = 7 - height;
    this.lightList.push(light.clone());
    light.x = 9 - width; light.y = 63 - height;
    this.lightList.push(light.clone());
    light.x = 65 - width; light.y = 62 - height;
    this.lightList.push(light);

    this.eyeLight = light.clone();
    this.eyeLight.scaleX = this.eyeLight.scaleY = 1.5;
    this.eyeLight.x = cosineInterpolate(-10,10,this.eyeLightElapsed);
    this.eyeLight.y = 0;
    this.eyeLightElapsed = Math.random();

    this.cont.addChild(this.sprite);

    this.cont.addChild(this.eyeLight);

    for (var i = 0; i < this.lightList.length; i++) {
        this.lightElapsed.push(0);
        this.cont.addChild(this.lightList[i]);
    }
    this.cont.addChild(this.cover);
}

Mine.prototype.moveTo = function(pos)	{
	this.cont.x = this.position.x = pos.x;
	this.cont.y = this.position.y = pos.y;
}