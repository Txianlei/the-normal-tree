let modInfo = {
	name: "The normal tree",
	id: "mymod",
	author: "User incremental",
	pointsName: "point",
	discordName: "",
	discordLink: "",
	initialStartPoints: new ExpantaNum (0), // Used for hard resets and new players
	
	offlineLimit: 0,  // In hours
}

// Set your version in num and name
let VERSION = {
	num: "1.0",
	name: "True release",
}

let changelog = `<h1>Changelog:</h1><br>
	<h3>v1.0</h3><br>
		- Added basic.<br>
		- Added prestige.`

let winText = `So...Why do you play this rubbish for so long?`

// If you add new functions anywhere inside of a layer, and those functions have an effect when called, add them here.
// (The ones here are examples, all official functions are already taken care of)
var doNotCallTheseFunctionsEveryTick = ["blowUpEverything"]

function getStartPoints(){
    return new ExpantaNum(modInfo.initialStartPoints)
}

// Determines if it should show points/sec
function canGenPoints(){
	return true
}

// Calculate points/sec!
function getPointGen() {
	if(!canGenPoints())
		return new ExpantaNum(0)

	let gain = new ExpantaNum(1)
	if (inChallenge("b",11)||inChallenge("b",31)) gain = gain.div(100)
	if (hasChallenge("b",11)) gain = gain.times(2)
	if (inChallenge("b",12)||inChallenge("b",31)) gain = gain.div(666)
	if (hasChallenge("b",12)) gain = gain.times(3)
	
	if (!inChallenge("b",42)) {
		if (hasUpgrade("b",11)) gain = gain.times(2)
		if (hasUpgrade("b",51)) gain = gain.times(4)	
		if (hasUpgrade("b",13)&&!(inChallenge("b",22)||inChallenge("b",31)||inChallenge("b",41))) gain = gain.times(upgradeEffect("b",13))
		if (hasUpgrade("b",21)) gain = gain.times(upgradeEffect("b",21))
		if (getBuyableAmount("b",11).gte(1) && !inChallenge("p",12) && !inChallenge("p",31)) gain = gain.times(buyableEffect("b",11))
		if (hasUpgrade("p",11)) gain = gain.times(2)
		if (hasUpgrade("p",14)) gain = gain.times(20)
		if (hasUpgrade("b",53)) gain = gain.times(buyableEffect("b",12).pow(0.7))
		if (hasUpgrade("p",54)) gain = gain.times(upgradeEffect("p",54))
	}

	if (hasUpgrade("b",31)&&!inChallenge("b",41)) gain = gain.pow(1.5)
	if (hasUpgrade("p",11)) gain = gain.pow(1.1)
	if (hasUpgrade("b",62)) gain = gain.pow(1.15)
	if (hasUpgrade("b",73)) gain = gain.pow(1.2)
	if (hasUpgrade("b",64)) gain = gain.pow(upgradeEffect("b",64))
	if (inChallenge("b",21)||inChallenge("b",31)) gain = gain.pow(0.3)
	if (inChallenge("b",32)) gain = gain.pow(0.111)
 	if (inChallenge("b",32)) gain = gain.pow(0.111)
	if (inChallenge("p",12)||inChallenge("p",31)) gain = gain.pow(0.0375)
	if (hasUpgrade("p",52)) gain = gain.pow(1.15)
	if (player.p.unlocked&&!inChallenge("b",42)) gain = gain.times(tmp.p.effect)
	return gain
}

// You can add non-layer related variables that should to into "player" and be saved here, along with default values
function addedPlayerData() { return {
}}

// Display extra things at the top of the page
var displayThings = [
]

// Determines when the game "ends"
function isEndgame() {
	return false
}



// Less important things beyond this point!

// You can change this if you have things that can be messed up by long tick lengths
function maxTickLength() {
	return(3600) // Default is 1 hour which is just arbitrarily large
}

// Use this if you need to undo inflation from an older version. If the version is older than the version that fixed the issue,
// you can cap their current resources with this.
function fixOldSave(oldVersion){
}