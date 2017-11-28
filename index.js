'use strict'

const co = require('co')

const utils = require('./src/utils')
const logging = require('./src/logger')


co(function *(){

	
	if(false){
		throw('👻')
	}

	utils.monitorCurrencies('BTC_ETH')    

}).catch(function(err){
    logging.error(err)
})

// quick command line-based service that does the following:

// 1. Takes an argument for a pair of crypto currencies like ETH/BTC (Ethereum and Bitcoin) 
// 2. Connects to the Poloniex exchange (https://poloniex.com) 
// 3. Calculates a 1-minute simple moving average of price for the provided token pair on an ongoing basis 
// 4. Displays the value in the shell while the program is running



//get cryto exchange rate

// while (true){
	
// }

