'use strict'

const Poloniex = require('poloniex-api-node')
const _ = require('lodash')
const ProgressBar = require('progress')
const asciiTable = require('ascii-table')
const logging = require('./logger')

//one minute intervals for displaying new average
const monitorInterval = 60000

var mover = []
var moverLock = false //prevent modification to mover 
// var averageDisplay = 'Loading...'
var baseTimestamp = new Date()
// var bar
// var barLock = false


module.exports.monitorCurrencies = async function (currencyPair){


	//START ACTUAL FILE HERE

	console.log('CURRENCY ARR ',currencyPair)

	let poloniex = new Poloniex()

	poloniex.subscribe('ticker')
	//poloniex.subscribe('BTC_ETH')

	poloniex.on('message', (channelName, data, seq) => {

	  if (channelName === 'ticker') {

	    if(data.currencyPair == currencyPair){
	    	mover.push({
	    		currencyPair: currencyPair,
	    		last: parseFloat(data.last),
	    		timestamp: new Date()
	    	})
	    }	

	    checkStreamInterval(currencyPair,mover)

	    //push value to OBJECT ARRAY, STORE IN MEMORY, PRUNE MEMORY
	  }

	  // if (channelName === 'ETH') {
	  // 	console.log('ETH >>> ',data)
	  // }
	 
	  // if (channelName === 'BTC') {
	  // 	console.log('BTC >>> ',data)
	  //   // console.log(`order book and trade updates received for currency pair ${channelName}`)
	  //   // console.log(`data sequence number is ${seq}`)
	  // }
	})
	 
	poloniex.on('open', () => {
	  console.log(`Poloniex WebSocket connection open`)
	})
	 
	poloniex.on('close', (reason, details) => {
	  console.log(`Poloniex WebSocket connection disconnected`)
	})
	 
	poloniex.on('error', (error) => {
	  console.log(`An error has occured`)
	})
	 
	poloniex.openWebSocket({ version: 2 })


	//while(true){


	//}



	//PRUNE THE MOVER ARRAY!


	//DISPLAY IN CHART 
	//SHOW THE TWO CURRENCY VALUES IN CHART

	//SHOW BAR LOADING ANIMATION FOR EACH MINUTE TO SHOW WE ARE COLLECTING DATA!!!!





	// var jsonQ = []
	// for (let i = 0; i < htmlArr.length; i++) { 
	// 	//passes to request scraper
	// 	jsonQ.push(parse.htmlProcess(htmlArr[i]))
	// }
	// return await Promise.all(jsonQ)


}


async function checkStreamInterval(currencyPair,mover){


	if(!mover || mover.length < 1){
		return
	}

	//console.log(mover)

	//find elapsed time since last base ts
	let latestTime = mover[mover.length - 1].timestamp
	let elapsedTime = latestTime - baseTimestamp


	// show graphic countdown from 60000 until next update
	//console.log('. e: ', elapsedTime)

	// if (elapsedTime % 2 === 0){
	// 	console.log('.')
	// 	//bar.tick()
	// }


	
	// if(!barLock){
	// 	bar = new ProgressBar('  Collecting Prices [:bar] :etas', {
	// 		complete: '=',
	// 		incomplete: ' ',
	// 		width: 60,
	// 		total: monitorInterval
	// 	})
	// 	barLock = true
	// }else {
	// 	if(bar.complete){
	// 		barLock = false
	// 	}else {
	// 		bar.tick(elapsedTime / 1000)
	// 	}
	// }



	

	  // if (bar.complete) {
	  //   console.log('\ncomplete\n')
	  //   clearInterval(timer)
	  // }

	// console.log('MOVER LOCK ',moverLock)
	// console.log('ELAPSED TIME_____ ',elapsedTime)

	//check if we should update the average price (it's been a minute since last)
	//&& if mover array isn't locked
	if(elapsedTime >= monitorInterval && moverLock == false){

		moverLock = true

		//console.log('👻👻👻👻')

		//console.log('MOVER LENGTH >>>>>> ',mover.length)	

		// //so we dont accidentally delete any new data added by socket stream

		let latestIndex = _.findLastIndex(mover, function(i) {
		    return i.timestamp == latestTime 
		})

		let average = await getAverage(mover.slice(0,latestIndex))

		//let average = await getAverage(mover)


		// mover.unshift({
  //   		currencyPair: currencyPair,
  //   		last: mover[latestIndex].last,
  //   		timestamp: new Date()
  //   	})


		//mover = []

		console.log('AVERAGE ✨: ',average)

		//console.log('mover length pre-splice ',mover.length)

		// //prune the mover object array to reduce mem usage overtime
		mover.splice(0,latestIndex)

		//console.log('mover length post-splice ',mover.length)
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

	return avg.toFixed(8)
}


// function showTimer(){
// 	let latestTime = mover[mover.length - 1].timestamp
// 	let elapsedTime = latestTime - baseTimestamp

// 	let timeLeft = monitorInterval - elapsedTime

// 	var min = timeLeft / 1000 / 60
// 	var r = min % 1
// 	var sec = Math.floor(r * 60)
// 	if (sec < 10) {
// 	    sec = '0'+sec
// 	}
// 	min = Math.floor(min)
// 	console.log(min+':'+sec)
// }


//FIND SIMPLE MOVING AVERAGE

// The simplest form of a moving average, appropriately known as a simple moving average (SMA), 
// is calculated by taking the arithmetic mean of a given set of values. For example, to calculate 
// a basic 10-day moving average you would add up the closing prices from the past 10 days and then divide the result by 10.


	  	//USE SEQUENCE AS THE KEY

	  	//console.log('SEQEUNCE: ',seq)

	  	//https://stackoverflow.com/questions/39347965/building-an-orderbook-representation-for-a-bitcoin-exchange
	    // if(event.seq_num == expected_seq_num){
	    //    process_ws_event(event)
	    //    update_expected_seq_num
	    // }
	    // else{
	    //     if(in_cache(expected_seq_num){
	    //         process_ws_event(from_cache(expected_seq_num))
	    //         update_expected_seq_num
	    //     }
	    //     else{
	    //         cache_event(event)
	    //     }  
	    // }


/**
 * Build a table for download results
 * @param {array} Download verification results
 * @returns {object} Returns table object to render
 */
module.exports.buildResultsTable = function * (results){
	var table = new asciiTable('Top '+results.length+' depended on NPM packages')
	table.setBorder('*').setHeading('Download Status', 'Name')

	for (let i = 0; i < results.length; i++) { 
		table.addRow(results[i].status,results[i].name)
	}
	return table
}