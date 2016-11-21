function EventManager()	{
	this.eventList = {
		'0':{
			'start':{'msg':["Welcome science officer.\n\nI'll get you settled in with your interface, and we can begin our journey across the sky!",
							"o_o\n\nLooks like an anti-ship mine has wandered into the system.\n\nWe should clean up any mines we find!",
							"You're in charge of launching our exploratory probes.\n\nSimply touch and drag to line up a launch path,\nthen release when you are happy and watch the probe go sailing forth.",
							"When the probe is in flight you can give it a kick with further swipes.\n\nOr tap the screen to halt the probe and correct the course.",
							"Now.\n\nI'll highlight the mine,\n\nYou smash it!"
							]},
			'end':{'msg':["Nice shot!\n\nWe should smash all the mines we find!",
			"And don't worry about the probes.\n\nWe've got loads of 'em!",
			"Now.\n\nLets start the journey.\n\nWarp speed 9!"]},
			'type':"mine",
			'layout':{
				planets:[{'x':0.5, 'y':0.5,'mass':1, 'size':2,'scanSize':undefined}],
				ship:{'x':0.15,'y':0.5},
				mine:{'x':0.85,'y':0.5}
			}
		},
		'1':{
			'start':{'msg':["Aha!\n\nA pristine system.\n\nLets scan the planets and see what's here.",
							"I've marked the target zones with dashed lines.\n\nLaunch a probe like last time, visit the zones and collect science doops.\n\nWe'll need to fill the whole science bar to get something publishable."]},
			'end':{'msg':["Nice!\n\nWe'll have a Science paper together in no time!","Onwards!"]},
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
			'start':{'msg':["By the way,\n\nI always make sure to park us somewhere you can get a good shot from.",
							"You can pass any system with a single, well aimed, shot.\n\nNo adjustments needed.",
							"Not saying its easy...\n\nBut possible!"
							]}
		},
		'21':{
			'start':{'msg':["I was trying to add another dot to the targeting thingy\nand I accidentally...","...broke one off.","Sorry!\n\nI kept it safe though!\n\n\n\n."],
				'mod':{'tgtmod':5}
			}
		},
		'23':{
			'start':{'msg':["Well, I've got good news and bad!\n\nI was trying to fix the targeting doodads again...",
							"Good news is I re-attached the broken blip!", 
							"Bad news is I broke two more off.\n\n:(\n\n\n\n. ."],
				'mod':{'tgtmod':4}
			}
		},
		'26':{
			'start':{'msg':["Hey! I managed to fix the targeter!"],
				'mod':{'tgtmod':6}
			},
			'end':{'msg':["Aww... They fell off again.\n\n\n\n\n. ."],
				'mod':{'tgtmod':4}
			}
		},
		'32':{
			'start':{'msg':["*Someone* just broke another targeter dot.\n\nNot me. I haven't touched the thing in ages.\n\n\n. . ."],
				'mod':{'tgtmod':3}
			},
			'end':{'msg':["Yeah...\n\nIt was me that broke the targeter again.\n\nBut I really thought I had it this time!","It feels good to come clean about that.\n\nMorality remains an important part of me."]}
		},
		'38':{
			'start':{'msg':["With a roll of vacuum tape and some quantum string I've pieced the dots back together.\n\nNo more messing with them!"],
				'mod':{'tgtmod':6}
			}
		},
		//"movl _stuff+24, %%esi\nmovl _stuff+24, %%edi\nsarl $31, %%esi\nmovl _stuff+32, %%ebp\nsarl $31, %%ebp\nandl %2, %%esi\naddl %%esi, %%edi\nmovl _stuff+32, %%esi\nandl %2, %%ebp\nmovl %%edi, (%0)\naddl %%ebp, %%esi\nmovl _stuff+40, %%edi\nsarl $31, %%edi\nmovl %%esi, 4(%0)\nfstpl _stuff+24\nmovl _stuff+40, %%esi\nmovl _stuff+24, %%ebp\nsarl $31, %%ebp\nandl %2, %%edi\naddl %%edi, %%esi\nmovl _stuff+24, %%edi\nandl %2, %%ebp\nmovl %%esi, 8(%0)\naddl %%ebp, %%edi\nmovl %%edi, 12(%0)\nnop\n"
		'86':{
			'start':{'msg':["...\nmovl %%esi, 4(%0)\nfstpl _stuff+24\nmovl _stuff+40, %%esi\nmovl _stuff+24, %%ebp\nsarl $31, %%ebp\nandl %2, %%edi\naddl %%edi, %%esi\nmovl _stuff+24, %%edi\nandl %2, %%ebp\nmovl %%esi, 8(%0)\naddl %%ebp, %%edi\nmovl %%edi, 12(%0)\nnop\n",
					 "\n\n\n\n\n\nSorry, just thinking aloud..."]
				}
		},
		'301':{
			'start':{'msg':["Do you ever wonder if there are people in those probes?"]
			}
		},
		'1023':{
			'end':{'msg':["We just cleared our 1024th system!\n\nWhat a nice round number."]}
		},
		'1782':{
			'end':{'msg':["There's no sound in space.\n\nSo I have to make up the sound of probes exploding.",
						  "I hope you appreciate the effort I put in for you."]}
		},
		'2047':{
			'end':{'msg':["2^N\n\nwhere N is pretty big now!"]}
		},
		'3122':{
			'end':{'msg':["Some of these planets are starting to look pretty familiar..."]}
		},
		'4922':{
			'end':{'msg':["One system cleared for every year I've been alive..."]}
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