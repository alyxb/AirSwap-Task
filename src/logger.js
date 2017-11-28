'use strict'

const winston = require('winston')
const logger = new (winston.Logger)

//only show console logging when not in production
if (process.env.NODE_ENV !== 'production') {
	logger.add(winston.transports.Console, { colorize: true })
}

module.exports = logger