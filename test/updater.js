'use strict'

const chai = require('chai')
const sinon = require('sinon')
const sinonChai = require('sinon-chai')
const expect = chai.expect

import Updater from '../src/updater'

chai.use(sinonChai)

describe('Updater', function() {
    let mockedRouter

    beforeEach(function () {
        mockedRouter = {
            addRawRoute: sinon.spy(),
            removeRoute: sinon.spy(),
            getRegisteredRoutesIds: sinon.stub()
        }
    })

    it('should be available', function () {
        expect(Updater).to.be.a('function')
    })

    it('constructor should be working', function () {
        expect(new Updater(mockedRouter)).to.be.an('object')
    })

    it('process should add a route and delete no longer existing ones', function () {
        let updater = new Updater(mockedRouter)

        updater.process([{id: 'route1'}, {id: 'route2'}], ['deleted'])

        expect(mockedRouter.addRawRoute).to.be.calledTwice
        expect(mockedRouter.addRawRoute).to.be.calledWith({id: 'route1'})
        expect(mockedRouter.addRawRoute).to.be.calledWith({id: 'route2'})
        expect(mockedRouter.removeRoute).to.be.calledWith('deleted')
    })

    it('read should process the content of a file', function (done) {
        let updater = new Updater(mockedRouter)

        updater.process = sinon.spy()
        mockedRouter.getRegisteredRoutesIds.returns(['route1', 'route2'])

        updater.read(__dirname + '/stubs/delta-routes.json', function (err) {
            expect(updater.process).to.be.calledWith(require(__dirname + '/stubs/delta-routes.json'), ['route1'])
            done()
        })
    })
})