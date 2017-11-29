'use strict'

const co = require('co')

const utils = require('./src/utils')
const logging = require('./src/logger')

const currencyPair = process.env.CURRENCY_PAIR || 'BTC_ETH' 

co(function *(){
	utils.monitorCurrencies(currencyPair)    
}).catch(function(err){
    logging.error(err)
})