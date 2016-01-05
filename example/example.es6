'use strict'

import Logger from '../lib/logger'
import Router from './../src/router'

const logger = Logger.instance()
const program = require('commander')

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

const routes = require(routesPath)

const app = new Router({
    routes: routes
})

app.listen(port)

logger.log(`running on ${port}`)