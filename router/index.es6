'use strict'

import Logger from '../lib/logger'
import initStatsMiddleware from '../lib/middleware/stats'
import initExactResolverMiddleware from './middleware/resolver/exact'
import initStartsWithResolverMiddleware from './middleware/resolver/startsWith'
import initRequestMiddleware from './middleware/request'

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
app.use(initExactResolverMiddleware(routes))
app.use(initStartsWithResolverMiddleware(routes))
app.use(initRequestMiddleware())

app.listen(port)

logger.log(`running on ${port}`)