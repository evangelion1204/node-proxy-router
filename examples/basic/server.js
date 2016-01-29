'use strict'

const Router = require('../..').Server
const program = require('commander')

program
    .version('0.0.1')
    .option('-p, --port [Port]', 'The used port', 3000)
    .parse(process.argv)

const port = program.port

const app = new Router()

app.addRoute('/zalando-lounge', 'http://www.zalando-lounge.de/')

app.listen(port)

console.log(`running on ${port}`)