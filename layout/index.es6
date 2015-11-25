'use strict'

import Logger from '../lib/logger'
import initStatsMiddleware from '../lib/middleware/stats'

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

const app = koa()

app.use(initStatsMiddleware())
app.use(function *() {
    this.response.body = 'ok'
})

app.listen(port)

logger.log(`running on ${port}`)