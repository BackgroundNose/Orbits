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
	createjs.Ticker.setFPS(60);
	createjs.Ticker.timingMode = createjs.Ticker.RAF;

	if (typeof(Storage) !== undefined)	{
		console.log("There is storage :)")
		canSave = true;
	}	else 	{
		console.log("No browser storage... :(");
		canSave = false;
	}

	bar = new LoadingBar( 400, 40, 5, "grey", "black");
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
		{id:"planet", src: "Graphics/Planet2.png"},
		{id:"background", src: "Graphics/Background2.png"},
		{id:"ship", src: "Graphics/Ship2.png"},
		{id:"probe", src: "Graphics/Probe.png"},
		{id:"mine", src: "Graphics/Mine.png"},
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
		{id:"pGreenPix", src: "Graphics/Particles/Scan.png"}
				]);
	
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


