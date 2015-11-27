'use strict'

const session = require('koa-session')

export default function (app) {
    app.keys = ['my secret']
    app.use(session(app))
}
