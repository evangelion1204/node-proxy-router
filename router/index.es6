'use strict'

import Logger from '../lib/logger'
import initStatsMiddleware from '../lib/middleware/stats'
import initHealthCheckResolverMiddleware from '../lib/middleware/healthcheck'
import initExactResolverMiddleware from './middleware/resolver/exact'
import initStartsWithResolverMiddleware from './middleware/resolver/startsWith'
import initCookieMiddleware from './middleware/cookie'
import initRequestMiddleware from './middleware/request'
import initMetricsMiddleware from '../lib/middleware/metrics'

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

app.use(initHealthCheckResolverMiddleware())
app.use(initMetricsMiddleware())
app.use(initStatsMiddleware('router'))
app.use(initExactResolverMiddleware(routes))
app.use(initStartsWithResolverMiddleware(routes))

for (let name of config.middleware.enabled) {
    let middleware = loadMiddleware(name)

    app.use(middleware(config.middleware[name] ? config.middleware[name] : undefined))
}

function loadMiddleware(name) {
    let paths = [name, `./middleware/${name}`]

    for (let path of paths) {
        try {
            let middleware = require(path)

            return typeof middleware === 'function' ? middleware : middleware.default
        }
        catch (error) {

        }
    }

    throw new Error(`Middleware "${$name}" could not be found.`)
}

app.use(initCookieMiddleware(config.middleware.cookie))

app.use(initRequestMiddleware(config.middleware))

app.listen(port)

logger.log(`running on ${port}`)