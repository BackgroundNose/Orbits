
function mouseMove (event){
	mouse.x = event.pageX - canvas.offsetLeft;
	mouse.y = event.pageY - canvas.offsetTop;
}

function mouseDown(event) {
	// mouseMove(event);
	mouse.down = true;
}

function mouseUp(event)	{
	// mouseMove(event);
	mouse.down = false;
}


function init()  {
	DEBUG = false;
	TIMESTEP = 0.015;

    canvas = document.getElementById("gameCanvas");
	createjs.Ticker.setFPS(60);
	createjs.Ticker.timingMode = createjs.Ticker.RAF;

	bar = new LoadingBar( 400, 40, 5, "grey", "black");
	preload = new createjs.LoadQueue(false);

	preload.addEventListener("complete", handleComplete);
	preload.addEventListener("progress", handleProgress);
	
	mouse = new Mouse();
	canvas.addEventListener("mousemove",mouseMove);
	canvas.addEventListener("mousedown",mouseDown);
	canvas.addEventListener("mouseup",mouseUp);
	canvas.addEventListener("touchstart",mouseDown);
	canvas.addEventListener("touchend", mouseUp);

	preload.loadManifest([	
		{id:"planet", src: "Graphics/Planet.png"},
		{id:"background", src: "Graphics/Background.png"},
		{id:"ship", src: "Graphics/Ship.png"},
		{id:"probe", src: "Graphics/Probe.png"}
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
	game = new Game();

	mouse.x = mouse.y = 0;
	mouse.down = false;

	bar.loadProgressLabel.text = "Loading Complete!";
	bar.stage.update();

	stage = new createjs.Stage(canvas);

	createjs.Ticker.on("tick", game.tick,game);
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


