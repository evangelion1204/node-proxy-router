'use strict'

const chai = require('chai')
const sinon = require('sinon')
const sinonChai = require('sinon-chai')
const expect = chai.expect
const http = require('http')

import Importer from '../../src/importer/rest'

import * as exampleConfig from '../builder/configs'

chai.use(sinonChai)

describe('Rest Importer', function() {
    let mockedRouter

    beforeEach(function () {
        mockedRouter = {
            addRawRoute: sinon.spy()
        }
    })

    it('should be available', function () {
        expect(Importer).to.be.a('function')
    })

    it('constructor should be working', function () {
        expect(new Importer(mockedRouter)).to.be.an('object')
    })

    it('process should add a route', function () {
        let importer = new Importer(mockedRouter)

        importer.process([{id: 'route1'}, {id: 'route2'}])

        expect(mockedRouter.addRawRoute).to.be.calledTwice
        expect(mockedRouter.addRawRoute).to.be.calledWith({id: 'route1'})
        expect(mockedRouter.addRawRoute).to.be.calledWith({id: 'route2'})
    })

    it('read should process consume a rest endpoint', function (done) {
        let server = http.createServer(function (request, response) {
            response.writeHead(200, {"Content-Type": "application/json"})
            response.end(JSON.stringify(require('../stubs/routes.json')))
        }).listen(4000)


        let importer = new Importer(mockedRouter)

        importer.process = sinon.spy()

        importer.read('http://localhost:4000', function (err) {
            server.close()
            expect(importer.process).to.be.calledWith(require('../stubs/routes.json'))
            done(err)
        })
    })

    it('read should process consume a rest endpoint and transform the result', function (done) {
        let server = http.createServer(function (request, response) {
            response.writeHead(200, {"Content-Type": "application/json"})
            response.end(JSON.stringify({routes: require('../stubs/routes.json')}))
        }).listen(4000)


        let importer = new Importer(mockedRouter, data => data.routes)

        importer.process = sinon.spy()

        importer.read('http://localhost:4000', function (err) {
            server.close()
            expect(importer.process).to.be.calledWith(require('../stubs/routes.json'))
            done(err)
        })
    })
})