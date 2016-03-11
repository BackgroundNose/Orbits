function mouseMove (event){
	mouse.x = event.pageX - canvas.offsetLeft;
	mouse.y = event.pageY - canvas.offsetTop;
}

function touchStart(evnt)	{
	mouse.x = event.touches[0].pageX - canvas.offsetLeft;
	mouse.y = event.touches[0].pageY - canvas.offsetTop;
	mouse.down = true;
}

function touchMove(event)	{
	mouse.x = event.touches[0].pageX - canvas.offsetLeft;
	mouse.y = event.touches[0].pageY - canvas.offsetTop;
}

function touchEnd(evnt)	{
	mouse.down = false;
}

function mouseDown(event) {
	mouse.down = true;
}

function mouseUp(event)	{
	mouse.down = false;
}


function init()  {
	DEBUG = false;
	TIMESTEP = 0.015;

    canvas = document.getElementById("gameCanvas");
    document.getElementById("gameCanvas").style.background = '#000000';
	createjs.Ticker.setFPS(60);
	createjs.Ticker.timingMode = createjs.Ticker.RAF;

	if (typeof(Storage) !== undefined)	{
		console.log("There is storage :)")
		canSave = true;
	}	else 	{
		console.log("No browser storage... :(");
		canSave = false;
	}

	bar = new LoadingBar( 400, 40, 5, "grey", "white");
	preload = new createjs.LoadQueue(false);

	preload.addEventListener("complete", handleComplete);
	preload.addEventListener("progress", handleProgress);
	
	mouse = new Mouse();
	canvas.addEventListener("mousemove",mouseMove);
	canvas.addEventListener("mousedown",mouseDown);
	canvas.addEventListener("mouseup",mouseUp);
	canvas.addEventListener("touchstart",touchStart);
	canvas.addEventListener("touchmove",touchMove);
	canvas.addEventListener("touchend", touchEnd);

	preload.loadManifest([	
		{id:"planets", src: "Graphics/PlanetArray2.png"},
		{id:"background", src: "Graphics/Background.png"},
		{id:"ship", src: "Graphics/Ship4.png"},
		{id:"probe", src: "Graphics/Probe.png"},
		{id:"mine", src: "Graphics/MineParts.png"},
		{id:"target", src: "Graphics/ScanTarget.png"},
		{id:"powerBar", src: "Graphics/PowerBar.png"},
		{id:"radial", src: "Graphics/Radial.png"},
		{id:"cheatButton", src: "Graphics/CheatButton.png"},
		{id:"pTrail", src: "Graphics/Particles/Trail.png"},
		{id:"pBasic", src: "Graphics/Particles/Basic.png"},
		{id:"pExit", src: "Graphics/Particles/Exit.png"},
		{id:"pFlame", src: "Graphics/Particles/ExplosionFlame.png"},
		{id:"pCloud", src: "Graphics/Particles/ExplosionCloud2.png"},
		{id:"pSpark", src: "Graphics/Particles/Sparks.png"},
		{id:"pwhitePx", src: "Graphics/Particles/whitePx.png"},
		{id:"pGreenPix", src: "Graphics/Particles/Scan.png"},
		{id:"mineTarget", src: "Graphics/MineTarget.png"},
		{id:"pBits", src: "Graphics/Particles/Bits.png"},
		{id:"pShock", src: "Graphics/Particles/Shockwave.png"},
		{id:"mineLight", src: "Graphics/MineLight.png"},
		{id:"mineCover", src: "Graphics/MineCover.png"},
		{id:"shipWarp", src: "Graphics/Particles/ShipWarp.png"},
		{id:"shield", src: "Graphics/Grav.png"},
		{id:"grav", src: "Graphics/Particles/Grav.png"},
		{id:"stars", src: "Graphics/Stars.png"},
		{id:"smallStars", src: "Graphics/SmallStars.png"},
		{id:"interestStars", src: "Graphics/InterestStars.png"},
				]);

	var audioPath = "Sound/"
	var sounds = [
			{id:"Sscan01", src: "Scan01.ogg"},
			{id:"Sscan02", src: "Scan02.ogg"},
			{id:"Sscan03", src: "Scan03.ogg"},
			{id:"Sscan04", src: "Scan04.ogg"},
			{id:"Sscan05", src: "Scan05.ogg"},
			{id:"SscanComplete", src:"ScanComplete.ogg"},
			{id:"SexpMine", src:"MineExplosion.ogg"},
			{id:"SexpP1", src:"ExplosionProbe1.ogg"},
			{id:"SexpP2", src:"ExplosionProbe2.ogg"},
			{id:"SexpP3", src:"ExplosionProbe3.ogg"},
			{id:"SexpP4", src:"ExplosionProbe4.ogg"},
			{id:"SexpP5", src:"ExplosionProbe5.ogg"},
			{id:"Swarp", src:"WarpStart.ogg"},
			{id:"Sblip0", src:"ScanBlip1.ogg"},
			{id:"Sblip1", src:"ScanBlip2.ogg"},
			{id:"Sblip2", src:"ScanBlip3.ogg"},
			{id:"Slaunch", src:"Thrust.ogg"},
			{id:"Sgrav", src:"Launch2.ogg"}
		];

	createjs.Sound.registerSounds(sounds, audioPath)

	bar.stage.update();
	stage = new createjs.Stage(canvas);

	canvas.onmousemove = mouseMove;
	canvas.ondrag = mouseMove;

}


function handleProgress()
{
	bar.loadingBar.scaleX = preload.progress;
	
	progressPercentage = Math.round(preload.progress*100);
	bar.loadProgressLabel.text = progressPercentage + "% Loaded";
	
	bar.stage.update();
}


function handleComplete()
{
	saveGame = new SaveGame();
	saveGame.checkExisting();
	game = new Game();

	game.loadFromSave(saveGame.saveFile);

	mouse.x = mouse.y = 0;
	mouse.down = false;

	bar.loadProgressLabel.text = "Loading Complete!";
	bar.stage.update();

	stage = new createjs.Stage(canvas);

	createjs.Ticker.on("tick", game.tick, game);
}



// document.onkeydown = function(event)
// {
// 	for (var i = stateMachine.keyList.length -1; i >= 0; i--)
// 	{
// 		if (stateMachine.keyList[i] == String.fromCharCode(event.which))
// 		{
// 			return;
// 		}
// 	}

// 	stateMachine.keyList.push(String.fromCharCode(event.which));
// }

// document.onkeyup = function(event)
// {	
// 	for (var i = stateMachine.keyList.length -1; i >= 0; i--)
// 	{
// 		if (stateMachine.keyList[i] == String.fromCharCode(event.which))
// 		{
// 			stateMachine.keyList.splice(i,1);
// 		}
// 	}
// }


