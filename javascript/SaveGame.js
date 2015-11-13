function SaveGame()	{
	this.saveFile = undefined;

	this.checkExisting = function()	{
		if (JSON.parse(localStorage.getItem("orbitsSave")) == null)	{
			console.log("No saved game found. Welcome to the game.")
			this.saveFile = new SaveFile();
		}	else	{
			this.saveFile = JSON.parse(localStorage.getItem("orbitsSave"))
			console.log("Save File found!")
		}
	}

	this.updateSave = function(launched, passed, skipped, travelled)	{
		console.log("update save");

		this.saveFile.launched = launched;
		this.saveFile.passed = passed;
		this.saveFile.skipped = skipped;
		this.saveFile.travelled = travelled;

		localStorage.setItem("orbitsSave", JSON.stringify(this.saveFile));
	}

	this.resetSave = function()	{
		console.log("Resetting save file");
		this.saveFile = new SaveFile();
	}
}

function SaveFile()	{
	this.launched = 0;
	this.passed = 0;
	this.skipped = 0;
	this.travelled = 0;
}