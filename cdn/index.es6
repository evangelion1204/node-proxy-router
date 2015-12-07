'use strict'

import Logger from '../lib/logger'
import initStatsMiddleware from '../lib/middleware/stats'

const logger = Logger.instance()
const program = require('commander')
const koa = require('koa')
const koaStatic = require('koa-static')

program
    .version('0.0.1')
    .option('-p, --port [Port]', 'The used port', 3000)
    .parse(process.argv)

const port = program.port

const app = koa()

app.use(initStatsMiddleware('cdn'))
app.use(koaStatic(__dirname + '/assets'))

app.listen(port)

logger.log(`running on ${port}`)