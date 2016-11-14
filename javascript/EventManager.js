function EventManager()	{
	this.eventList = {
		'0':{
			'start':{'msg':["Welcome to the game. First a little tutorial to show you how we do 'round here."]},
			'end':{'msg':["Nice shot.\n\nI'm sure you will go far."]},
			'type':"mine",
			'layout':{
				planets:[{'x':0.5, 'y':0.5,'mass':1, 'size':2,'scanSize':undefined}],
				ship:{'x':0.25,'y':0.5},
				mine:{'x':0.75,'y':0.5}
			}
		},
		'1':{
			'start':{'msg':["This time you gotta scan the planets. For reasons."]},
			'end':{'msg':["Nice. Nothing, but no worries. I'm sure the next planets will have what we want."]},
			'type':"scan",
			'scans':3,
			'layout':{
				planets:[
					{'x':0.6, 'y':0.35,'mass':0, 'size':3,'scanSize':50},
					{'x':0.5, 'y':0.65,'mass':0, 'size':2,'scanSize':50},
					{'x':0.4, 'y':0.35,'mass':1, 'size':1,'scanSize':50}
				],
				ship:{'x':0.15,'y':0.5}
			}
		},
		'2':{
			'start':{'msg':["I was trying to add another dot to the targeting thingy\nand I accidentally... broke one off.\n\nSorry!\n\nI kept it safe though!\n\n\n\n."],
				'mod':{'tgtmod':5}
			}
		},
		'3':{
			'start':{'msg':["Well, I've got good news and bad!\n\nI was trying to fix the targetting doodads again.","Good news is I re-attached the broken blip!", "Bad news is I broke two more off in the process.\n\n:(\n\n\n\n. ."],
				'mod':{'tgtmod':4}
			}
		},
		'4':{
			'start':{'msg':["Hey! I managed to fix the targeter!"],
				'mod':{'tgtmod':6}
			},
			'end':{'msg':["Aww... They fell off again.\n\n\n\n\n. ."],
				'mod':{'tgtmod':4}
			}
		},
		'5':{
			'start':{'msg':["Hey! I managed to fix the targeter!"],
				'mod':{'tgtmod':6}
			}
		},
		'6':{
			'start':{'msg':["*Someone* just broke another targeter dot.\n\nNot me. I haven't touched the thing in ages.\n\n\n. . ."],
				'mod':{'tgtmod':3}
			},
			'end':{'msg':["Yeah...\nIt was me that broke the targeter again.\n\nBut I really thought I had it this time!\n\nIt feels good to come clean about that."]}
		},
		'7':{
			'start':{'msg':["You know what,\n\nI'm just going to remove the targeter completely and keep it safe.\n\nHopefully the warrantry is still good."],
				'mod':{'tgtmod':0}
			}
		},
		//"movl _stuff+24, %%esi\nmovl _stuff+24, %%edi\nsarl $31, %%esi\nmovl _stuff+32, %%ebp\nsarl $31, %%ebp\nandl %2, %%esi\naddl %%esi, %%edi\nmovl _stuff+32, %%esi\nandl %2, %%ebp\nmovl %%edi, (%0)\naddl %%ebp, %%esi\nmovl _stuff+40, %%edi\nsarl $31, %%edi\nmovl %%esi, 4(%0)\nfstpl _stuff+24\nmovl _stuff+40, %%esi\nmovl _stuff+24, %%ebp\nsarl $31, %%ebp\nandl %2, %%edi\naddl %%edi, %%esi\nmovl _stuff+24, %%edi\nandl %2, %%ebp\nmovl %%esi, 8(%0)\naddl %%ebp, %%edi\nmovl %%edi, 12(%0)\nnop\n"
		'86':{
			'start':{'msg':["...\nmovl %%esi, 4(%0)\nfstpl _stuff+24\nmovl _stuff+40, %%esi\nmovl _stuff+24, %%ebp\nsarl $31, %%ebp\nandl %2, %%edi\naddl %%edi, %%esi\nmovl _stuff+24, %%edi\nandl %2, %%ebp\nmovl %%esi, 8(%0)\naddl %%ebp, %%edi\nmovl %%edi, 12(%0)\nnop\n",
					 "\n\n\n\n\n\nSorry, just thinking aloud..."]
				}
		},
		'1023':{
			'end':{'msg':["We just cleared our 1024th system!\n\nWhat a nice round number."]}
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