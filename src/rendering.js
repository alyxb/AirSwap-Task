'use strict'

//setup dashboard screen
var blessed = require('blessed')
     , contrib = require('blessed-contrib')
     , screen = blessed.screen()
     , line = contrib.line(lineDefault())

screen.key(['escape', 'q', 'C-c'], function(ch, key) {
 return process.exit(0)
})

const Spinner = require('cli-spinner').Spinner

var averageHistory = []
const averageHistoryMax = 10
var screenOn = false

//spinner animation
module.exports.spinner = function(currencyPair){
	//Build loading spinner
	let spinner = new Spinner(`Loading data for: ${currencyPair}.. %s`)

	spinner.setSpinnerString('|/-\\')
	spinner.start()

	setTimeout(function () {
	  spinner.stop(true)
	}, 2000)
}

//line chart screen display
module.exports.lineChart = function(average,latestTime){

	//prune average history 
	if(averageHistory.length > averageHistoryMax){
		averageHistory.splice(0,1)
	}

	//make date readable
	let dateString = latestTime.toLocaleTimeString()

	//add new item to history
	averageHistory.push({
		dateString: dateString,
		average: average
	})

	//build average history for rendered chart
	let series = {
		title: average.toString(),
		x: averageHistory.map(i => i.dateString),
		y: averageHistory.map(i => i.average)
	}

	//turn on screen
	if(screenOn == false){
		screenOn = true
		screen.append(line)
	}

	line.setData([series])
	screen.render()
}

//display a countdown timer
module.exports.countdown = function(currencyPair,monitorInterval){

	let counter = 1000

	setInterval(function() {
		if(counter >= monitorInterval){
			counter = 1000
		}

		let timeLeft = (monitorInterval - counter) / 1000
		timeLeft = Math.floor(timeLeft)

		process.stdout.write("\r\x1b[K")
		process.stdout.write(timeLeft.toString() + ` seconds until next ${currencyPair} average`)

		counter = (counter / 1.003) + 1000

	}, 1000)
}

//line chart default settings
function lineDefault(){
	return { style:
		       { line: "yellow"
		       , text: "green"
		       , baseline: "black"}
		     , xLabelPadding: 3
		     , xPadding: 5
		     , showLegend: true
		     , wholeNumbersOnly: false 	
		     , label: ''}
}
