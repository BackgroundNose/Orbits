function EventManager()	{
	this.eventList = {
		'0':{
			'start':["Welcome to the game. First a little tutorial to show you how we do 'round here."], 
			'end':["Nice shot. I'm sure you will go far."],
			'type':"mine"
		},
		'1':{
			'start':["This time you gotta scan the planets. For reasons."],
			'end':["Nice. Nothing, but no worries. I'm sure the next planets will have what we want."],
			'type':"scan"
		},
		//"movl _stuff+24, %%esi\nmovl _stuff+24, %%edi\nsarl $31, %%esi\nmovl _stuff+32, %%ebp\nsarl $31, %%ebp\nandl %2, %%esi\naddl %%esi, %%edi\nmovl _stuff+32, %%esi\nandl %2, %%ebp\nmovl %%edi, (%0)\naddl %%ebp, %%esi\nmovl _stuff+40, %%edi\nsarl $31, %%edi\nmovl %%esi, 4(%0)\nfstpl _stuff+24\nmovl _stuff+40, %%esi\nmovl _stuff+24, %%ebp\nsarl $31, %%ebp\nandl %2, %%edi\naddl %%edi, %%esi\nmovl _stuff+24, %%edi\nandl %2, %%ebp\nmovl %%esi, 8(%0)\naddl %%ebp, %%edi\nmovl %%edi, 12(%0)\nnop\n"
		'86':{
			'start':["...\nmovl %%esi, 4(%0)\nfstpl _stuff+24\nmovl _stuff+40, %%esi\nmovl _stuff+24, %%ebp\nsarl $31, %%ebp\nandl %2, %%edi\naddl %%edi, %%esi\nmovl _stuff+24, %%edi\nandl %2, %%ebp\nmovl %%esi, 8(%0)\naddl %%ebp, %%edi\nmovl %%edi, 12(%0)\nnop\n",
					 "\n\n\n\n\n\nSorry, just thinking aloud..."]
		}
	}

	this.currentEvent = undefined;
}

EventManager.prototype.checkTrigger = function(trigger)	{
	if (this.currentEvent === undefined)	{
		return undefined;
	}	else	{
		var out = this.currentEvent[trigger];
		this.currentEvent[trigger] = undefined;
		return out;
	}
}

EventManager.prototype.selectEventsForLevel = function(number)	{
	console.log("Setting up event: ", number)
	if (this.eventList[number.toString()] !== undefined)	{
		this.currentEvent = this.eventList[number.toString()];
	}	else	{
		this.currentEvent = undefined;
	}
}