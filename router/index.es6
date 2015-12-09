'use strict'

import Logger from '../lib/logger'
import initStatsMiddleware from '../lib/middleware/stats'
import initHealthCheckResolverMiddleware from '../lib/middleware/healthCheck'
import initExactResolverMiddleware from './middleware/resolver/exact'
import initStartsWithResolverMiddleware from './middleware/resolver/startsWith'
import initRequestMiddleware from './middleware/request'

const logger = Logger.instance()
const program = require('commander')
const koa = require('koa')

program
    .version('0.0.1')
    .option('-c, --config [Path to config]', 'The to be used config', '')
    .option('-r, --routes [Path to routes]', 'The to be used routes', '')
    .option('-p, --port [Port]', 'The used port', 3000)
    .parse(process.argv)

const port = program.port
const configPath = program.config
const routesPath = program.routes

if (configPath) {
    logger.log('Loading config file:', configPath)
}

if (routesPath) {
    logger.log('Loading routes file:', routesPath)
}

const config = require(configPath)
const routes = require(routesPath)
const app = koa()

app.use(initStatsMiddleware('router'))
app.use(initHealthCheckResolverMiddleware())
app.use(initExactResolverMiddleware(routes))
app.use(initStartsWithResolverMiddleware(routes))
app.use(initRequestMiddleware())

app.listen(port)

logger.log(`running on ${port}`)