'use strict'

import Logger from '../lib/logger'
import initStatsMiddleware from './middleware/stats'

const logger = Logger.instance()
const program = require('commander')
const koa = require('koa')

program
    .version('0.0.1')
    .option('-c, --config [Path to config]', 'The to be used config', '')
    .option('-p, --port [Port]', 'The used port', 3000)
    .parse(process.argv)

const port = program.port
const configPath = program.config

if (configPath) {
    logger.log('Loading config file:', configPath)
}

const routes = require(configPath)
const app = koa()

app.use(initStatsMiddleware())

app.listen(port)

logger.log(`running on ${port}`)