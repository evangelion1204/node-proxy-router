'use strict'

const chai = require('chai')
const sinon = require('sinon')
const sinonChai = require('sinon-chai')
const expect = chai.expect

import Importer from '../../src/importer/json'

import * as exampleConfig from '../builder/configs'

chai.use(sinonChai)

describe('JSON Importer', function() {
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

    it('read should process the content of a file', function (done) {
        let importer = new Importer(mockedRouter)

        importer.process = sinon.spy()

        importer.read(__dirname + '/../stubs/routes.json', function (err) {
            expect(importer.process).to.be.calledWith(require('../stubs/routes.json'))
            done()
        })
    })
})