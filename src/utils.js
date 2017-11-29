'use strict'

const Poloniex = require('poloniex-api-node')
const _ = require('lodash')
const ProgressBar = require('progress')
const logging = require('./logger')

//one minute intervals for displaying new average
const monitorInterval = 2000
//const monitorInterval = 60000
const averageHistoryMax = 10

var mover = []
var averageHistory = []
var moverLock = false //prevent modification to mover 
var screenOn = false
var baseTimestamp = new Date()

//setup dashboard screen
var blessed = require('blessed')
     , contrib = require('blessed-contrib')
     , screen = blessed.screen()
     , line = contrib.line(
         { style:
           { line: "yellow"
           , text: "green"
           , baseline: "black"}
         , xLabelPadding: 3
         , xPadding: 5
         , showLegend: true
         , wholeNumbersOnly: false 	
         , label: ''})

screen.key(['escape', 'q', 'C-c'], function(ch, key) {
 return process.exit(0)
})


module.exports.monitorCurrencies = async function (currencyPair){

	let poloniex = new Poloniex()

	poloniex.subscribe('ticker')

	poloniex.on('message', (channelName, data, seq) => {

	  if (channelName === 'ticker') {
	    if(data.currencyPair == currencyPair){

	    	if(isNaN(data.last)){
	    		data.last = 0
	    	}

	    	mover.push({
	    		currencyPair: currencyPair,
	    		last: parseFloat(data.last),
	    		timestamp: new Date()
	    	})
	    }	

	    checkStreamInterval(currencyPair,mover)
	  }
	})
	 
	poloniex.on('open', () => {
	  console.log('1 Minute Average: ',currencyPair)
	  //LOADING SPINNER HERE!!!
	})
	 
	poloniex.on('close', (reason, details) => {
	  console.log(`Poloniex WebSocket connection disconnected`)
	})
	 
	poloniex.on('error', (error) => {
	  console.log(`An error has occured`)
	})
	 
	poloniex.openWebSocket({ version: 2 })
}

async function checkStreamInterval(currencyPair,mover){

	if(!mover || mover.length < 1){
		return
	}

	//find elapsed time since last base ts
	let latestTime = mover[mover.length - 1].timestamp
	let elapsedTime = latestTime - baseTimestamp

	//check if we should update the average price (it's been a minute since last)
	//&& if mover array isn't locked
	if(elapsedTime >= monitorInterval && moverLock == false){

		moverLock = true

		//find inspected index so we dont accidentally delete any new data added by socket stream
		let latestIndex = _.findLastIndex(mover, function(i) {
		    return i.timestamp == latestTime 
		})

		let average = await getAverage(mover.slice(0,latestIndex))

		// Build Chart
		// - - - - - //
		//prune average history 
		if(averageHistory.length > averageHistoryMax){
			//console.log('TRIMMING HISTORY: ',averageHistory.length)
			averageHistory.splice(0,1)
			//console.log('TRIMMING HISTORY NEW LENGTH: ',averageHistory.length)
		}
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
		if(screenOn == false){
			screenOn = true
			screen.append(line)
		}
		line.setData([series])
		screen.render()
		// - - - - - //

		//prune the mover object array to reduce mem usage overtime
		mover.splice(0,latestIndex)

		//update baseTimestamp
		baseTimestamp = latestTime 

		moverLock = false
	}			
}

async function getAverage(moverSlice){

	//add up all values 
	let total = _.sumBy(moverSlice, function(o) { return o.last; })
	//find average
	let avg = total / moverSlice.length

	return avg
}
