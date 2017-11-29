'use strict'

const Poloniex = require('poloniex-api-node')
const _ = require('lodash')

const logging = require('./logger')
const render = require('./rendering')

//one minute intervals for displaying new average
const monitorInterval = 60000
var baseTimestamp = new Date()
var mover = [] //raw stream from Poloniex
var moverLock = false //prevent modification to mover 
var buildInitialChart = true
var showingCountdown = false

//sets up an ongoing stream of data with Poloniex
module.exports.monitorCurrencies = async function (currencyPair){

	let poloniex = new Poloniex()

	poloniex.subscribe('ticker')

	poloniex.on('message', (channelName, data, seq) => {

	  if (channelName === 'ticker') {
	    if(data.currencyPair == currencyPair){

	    	if(isNaN(data.last)){data.last = 0;}

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
		render.spinner(currencyPair)
	})
	 
	poloniex.on('close', (reason, details) => {
	  console.log(`Poloniex WebSocket connection disconnected`)
	})
	 
	poloniex.on('error', (error) => {
	  console.log(`A Poloniex error has occured`)
	})

	//using version 2, much faster than 1 but not fully supported (experimental)
	poloniex.openWebSocket({ version: 2 }) 
}

//checks for next interval to calculate currency pair average
async function checkStreamInterval(currencyPair,mover){

	if(!mover || mover.length < 1){
		return
	}

	//find elapsed time since last base timestamp
	let latestTime = mover[mover.length - 1].timestamp
	let elapsedTime = latestTime - baseTimestamp

	//Render initial chart to screen
	if(buildInitialChart && mover.length > 2){
		elapsedTime = monitorInterval + 1
		buildInitialChart = false
	}

	//check if we should update the average price (it's been a minute since last)
	//&& if mover array isn't locked
	if(elapsedTime >= monitorInterval && moverLock == false){

		moverLock = true
		
		//display a countdown timer until we calc average again
		if(showingCountdown == false){
			showingCountdown = true
			render.countdown(currencyPair,monitorInterval)
		}

		//find inspected index so we dont accidentally delete any new data added by socket stream
		let latestIndex = _.findLastIndex(mover, function(i) {
		    return i.timestamp == latestTime 
		})

		let average = await getAverage(mover.slice(0,latestIndex))

		//render chart to show averages over time
		render.lineChart(average,latestTime)

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
