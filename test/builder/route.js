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

    it('toEndpoint should allow chaining', function () {
        let instance = new Builder()

        expect(instance.toEndpoint('endpoint')).to.equal(instance)
        expect(instance.route).to.deep.equal({matcher: {}, endpoint: 'endpoint'})
    })

    it('matchPath should create a valid route and allow chaining', function () {
        let instance = new Builder()

        expect(instance.matchPath('path')).to.equal(instance)
        expect(instance.route).to.deep.equal({matcher: {path: {match: 'path', type: 'STRICT'}}})
    })

    it('matchRegexPath should create a valid route and allow chaining', function () {
        let instance = new Builder()

        expect(instance.matchRegexPath('path')).to.equal(instance)
        expect(instance.route).to.deep.equal({matcher: {path: {match: 'path', type: 'REGEX'}}})
    })

    it('withFilters should create a valid route and allow chaining', function () {
        let instance = new Builder()

        expect(instance.withFilters([1, 2])).to.equal(instance)
        expect(instance.route).to.deep.equal({matcher: {}, filters: [1, 2]})
    })

    it('withFilter should create a valid route and allow chaining', function () {
        let instance = new Builder()

        expect(instance.withFilter('filter1', 1, 2).withFilter('filter2', 3, 4)).to.equal(instance)
        expect(instance.route).to.deep.equal({
            matcher: {},
            filters: [
                {
                    name: 'filter1',
                    args: [1, 2]
                },
                {
                    name: 'filter2',
                    args: [3, 4]
                }
            ]
        })
    })

    it('withFilter, passing a function should create a valid route and allow chaining', function () {
        let instance = new Builder()

        function *f1() {}
        function *f2() {}

        expect(instance.withFilter(f1).withFilter(f2)).to.equal(instance)
        expect(instance.route).to.deep.equal({
            matcher: {},
            filters: [f1, f2]
        })
    })

    it('matchHeader should create a valid route and allow chaining', function () {
        let instance = new Builder()

        expect(instance.matchHeader('header', 'value')).to.equal(instance)
        expect(instance.route).to.deep.equal({matcher: {headers: [{name: 'header', value: 'value', type: 'STRICT'}]}})
    })

    it('matchRegexHeader should create a valid route and allow chaining', function () {
        let instance = new Builder()

        expect(instance.matchRegexHeader('header', '^value$')).to.equal(instance)
        expect(instance.route).to.deep.equal({matcher: {headers: [{name: 'header', value: '^value$', type: 'REGEX'}]}})
    })

    it('matchMethod should create a valid route and allow chaining', function () {
        let instance = new Builder()

        expect(instance.matchMethod('POST')).to.equal(instance)
        expect(instance.route).to.deep.equal({matcher: {method: 'POST'}})
    })

    it('save should invoke addRawRoute of resolver', function () {
        let mockedResolver = {
            addRawRoute: sinon.spy()
        }

        let instance = new Builder(mockedResolver)

        instance.matchMethod('POST').save()

        expect(instance.route).to.deep.equal({matcher: {method: 'POST'}})
        expect(mockedResolver.addRawRoute).to.be.called
    })

    it('save should throw an exception if resolver is missing', function () {
        let instance = new Builder()

        expect(function () {
            instance.matchMethod('POST').save()
        }).to.throw('A resolver must be set in order to call save()')

    })
})