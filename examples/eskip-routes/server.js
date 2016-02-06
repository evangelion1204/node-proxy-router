'use strict'

const Router = require('../..').Server
const Importer = require('../..').Importer.Eskip
const program = require('commander')

program
    .version('0.0.1')
    .option('-p, --port [Port]', 'The used port', 3000)
    .parse(process.argv)

const port = program.port

const app = new Router()
const importer = new Importer(app)

importer.read(__dirname + '/routes.eskip')
app.listen(port)

console.log(`running on ${port}`)