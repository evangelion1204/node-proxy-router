'use strict'

import Logger from '../../lib/logger'
import initStatsMiddleware from '../../lib/middleware/stats'
import {session} from '../../lib/middleware/session'

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

    const config = require(configPath)
}

const app = koa()

app.use(body())
session(app)
app.use(initStatsMiddleware('legacy'))
app.use(hbs.middleware({
    viewPath: __dirname + '/views',
    extname: '.handlebars'
}))

app.use(function *() {
    if (this.request.method == 'POST') {
        logger.debug('Trying login with', this.request.body)

        if (this.request.body.username === 'miiwersen' && this.request.body.password === '123456') {
            logger.debug('Login successful')
            this.session.user = {
                username: this.request.body.username
            }

            this.response.redirect('/catalog')

            return
        } else {
            logger.debug('Login failed, deleting session')
            this.session = null
            this.response.redirect('/login')

            return
        }
    }

    yield this.render('register')
})

app.listen(port)

logger.log(`running on ${port}`)