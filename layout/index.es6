'use strict'

import Logger from '../lib/logger'
import initStatsMiddleware from '../lib/middleware/stats'
import initRenderMiddleware from './middleware/render'

const logger = Logger.instance()
const program = require('commander')
const koa = require('koa')

program
    .version('0.0.1')
    .option('-c, --config [Path to config]', 'The to be used config', '')
    .option('-p, --port [Port]', 'The used port', 3000)
    .option('-m, --mode [Mode]', 'The mode (bigbipe/parallel', 'parallel')
    .parse(process.argv)

const port = program.port
const configPath = program.config
const renderMode = program.mode

if (configPath) {
    logger.log('Loading config file:', configPath)
}

const config = require(configPath)
const app = koa()

console.log(__dirname)

app.use(initStatsMiddleware('layout'))
app.use(initRenderMiddleware({
    viewPath: __dirname + '/views',
    extname: '.handlebars'
}, config.endpoints))

app.use(function *() {
    console.log(this.request.query)
    this.view.mode = this.request.query.mode || renderMode
    this.view.template = this.request.path.replace(/$\//, '')
    this.view.values = {title: "login"}
})

app.listen(port)

logger.log(`running on ${port}`)