'use strict'

const Router = require('../..').Server
const program = require('commander')

program
    .version('0.0.1')
    .option('-p, --port [Port]', 'The used port', 3000)
    .parse(process.argv)

const port = program.port

const app = new Router()

app.newRoute()
    .matchPath('/')
    .toEndpoint('http://www.zalando-lounge.de')
    .withFilter('requestHeader', 'Host', 'www.zalando-lounge.de')
    .save()

app.newRoute()
    .matchPath('/*path')
    .toEndpoint('http://www.zalando-lounge.de')
    .withFilter('requestHeader', 'Host', 'www.zalando-lounge.de')
    .save()

app.listen(port)

console.log(`running on ${port}`)