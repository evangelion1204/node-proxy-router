'use strict'

const chai = require('chai')
const sinon = require('sinon')
const sinonChai = require('sinon-chai')
const expect = chai.expect

import Builder from '../../src/builder/route'

chai.use(sinonChai)

describe('Route Builder', function() {
    it('should be available', function () {
        expect(Builder).to.be.a('function')
    })

    it('setId should create a valid route and allow chaining', function () {
        let instance = new Builder()

        expect(instance.setId('id')).to.equal(instance)
        expect(instance.route).to.deep.equal({matcher: {}, id: 'id'})
    })

    it('setEndpoint should allow chaining', function () {
        let instance = new Builder()

        expect(instance.setEndpoint('endpoint')).to.equal(instance)
        expect(instance.route).to.deep.equal({matcher: {}, endpoint: 'endpoint'})
    })

    it('setStrictPath should create a valid route and allow chaining', function () {
        let instance = new Builder()

        expect(instance.setStrictPath('path')).to.equal(instance)
        expect(instance.route).to.deep.equal({matcher: {path: {match: 'path', type: 'STRICT'}}})
    })

    it('setRegexPath should create a valid route and allow chaining', function () {
        let instance = new Builder()

        expect(instance.setRegexPath('path')).to.equal(instance)
        expect(instance.route).to.deep.equal({matcher: {path: {match: 'path', type: 'REGEX'}}})
    })

    it('setFilters should create a valid route and allow chaining', function () {
        let instance = new Builder()

        expect(instance.setFilters([1, 2])).to.equal(instance)
        expect(instance.route).to.deep.equal({matcher: {}, filters: [1, 2]})
    })

    it('setMethod should create a valid route and allow chaining', function () {
        let instance = new Builder()

        expect(instance.setMethod('POST')).to.equal(instance)
        expect(instance.route).to.deep.equal({matcher: {method: 'POST'}})
    })

    it('save should invoke addRawRoute of resolver', function () {
        let mockedResolver = {
            addRawRoute: sinon.spy()
        }

        let instance = new Builder(mockedResolver)

        instance.setMethod('POST').save()

        expect(instance.route).to.deep.equal({matcher: {method: 'POST'}})
        expect(mockedResolver.addRawRoute).to.be.called
    })

    it('save should throw an exception if resolver is missing', function () {
        let instance = new Builder()

        expect(function () {
            instance.setMethod('POST').save()
        }).to.throw('A resolver must be set in order to call save()')

    })
})