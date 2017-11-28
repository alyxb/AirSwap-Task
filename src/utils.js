'use strict'

const Poloniex = require('poloniex-api-node')
const _ = require('lodash')
const asciiTable = require('ascii-table')
const logging = require('./logger')

//one minute intervals for displaying new average
//const monitorInterval = 60000 
const monitorInterval = 6000

var mover = []
var moverLock = false //prevent modification to mover 
var baseTimestamp = new Date()


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
	    		last: data.last,
	    		timestamp: new Date()
	    	})
	    }	

	    check(mover,baseTimestamp)

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


async function check(){

	console.log(mover.length)

	if(!mover || mover.length < 1){
		console.log('not enough data')
		return
	}

	//find elapsed time since last base ts
	let latestTime = mover[mover.length - 1].timestamp
	let elapsedTime = latestTime - baseTimestamp

	console.log('elasped: ',elapsedTime)
	// show graphic countdown from 60000 until next update

	//check if we should update the average price (it's been a minute since last)
	if(elapsedTime >= monitorInterval && !moverLock){

		moverLock = true

		console.log('IT"S BEEN ONE MINUTE!!!!!')	

		//so we dont accidentally delete any new data added by socket stream
		let latestIndex = _.findIndex(mover, function(i) {
		    return i.timestamp == latestTime 
		})

		let average = await getAverage(mover,latestIndex)

	}			
	
	
}


async function getAverage(mover,latestIndex){

	console.log('mvoer length ',mover.length)
	console.log('latest index ',latestIndex)
}


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