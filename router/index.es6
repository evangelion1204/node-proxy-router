'use strict'

import Logger from '../lib/logger'
import Router from './router'

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

const config = require(configPath)
const routes = require(routesPath)
const http = require('http')

const app = new Router()

app.listen(port)

logger.log(`running on ${port}`)