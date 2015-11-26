'use strict'

import Logger from '../lib/logger'
import initStatsMiddleware from '../lib/middleware/stats'
import initRenderMiddleware from './middleware/render'

const logger = Logger.instance()
const program = require('commander')
const koa = require('koa')
const hbs = require('koa-hbs')

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

const config = require(configPath)
const app = koa()

console.log(__dirname)

app.use(initStatsMiddleware())
app.use(hbs.middleware({
    viewPath: __dirname + '/views',
    extname: '.handlebars'
}))
app.use(initRenderMiddleware(hbs, config.endpoints))

app.use(function *() {
    yield this.renderAsync('login', {title: "login"})
})

app.listen(port)

logger.log(`running on ${port}`)