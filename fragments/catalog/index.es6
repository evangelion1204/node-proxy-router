'use strict'

import Logger from '../../lib/logger'
import initStatsMiddleware from '../../lib/middleware/stats'
import initFragmentJsonResponse from '../../lib/middleware/fragment-json-response'
import {session} from '../../lib/middleware/session'
import Catalog from '../../lib/api/catalog'

const logger = Logger.instance()
const program = require('commander')
const koa = require('koa')
const hbs = require('koa-hbs')
const body = require('koa-body')

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

app.use(body())
session(app)
app.use(initStatsMiddleware('catalog'))
app.use(initFragmentJsonResponse(Object.assign({}, config, {
    viewPath: __dirname + '/views',
    extname: '.handlebars'
})))

app.use(function *() {
    //if (!this.session.user) {
    //    this.redirect('/login')
    //    return
    //}

    this.result.template = 'catalog'
    this.result.values = {
        articles: Catalog.instance().articles()
    }
})

app.listen(port)

logger.log(`running on ${port}`)