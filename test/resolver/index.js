'use strict'

const chai = require('chai')
const sinon = require('sinon')
const sinonChai = require('sinon-chai')
const expect = chai.expect

import Resolver from '../../src/resolver'
//import Builder from '../../src/builder/default'

import * as exampleConfig from '../builder/configs'

chai.use(sinonChai)

describe('Resolver', function() {
    let mockedBuilder

    beforeEach(function () {
        //mockedBuilder = {
        //    update: sinon.stub()
        //}
    })

    it('should be available', function () {
        expect(Resolver).to.be.a('function')
    })

    it('Resolver constructor should be working', function () {
        expect(new Resolver()).to.be.an('object')
    })

    it('should resolve STRICT path route', function () {
        let resolver = new Resolver()

        resolver.addRoute('/test', 'http://domain.tld')

        expect(resolver.match({url: '/test', method: 'GET'}).endpoint).to.be.equal('http://domain.tld')
    })

    it('should resolve REGEX path route', function () {
        let resolver = new Resolver()

        resolver.addRegexRoute('^/abc', 'http://domain.tld/regex', 'starts')
        resolver.addRegexRoute('^/def$', 'http://domain.tld/regex-full', 'full')

        expect(resolver.match({url: '/abcdefg', method: 'GET'}).endpoint).to.be.equal('http://domain.tld/regex')
        expect(resolver.match({url: '/def', method: 'GET'}).endpoint).to.be.equal('http://domain.tld/regex-full')
    })

    it('should resolve STRICT path route with POST', function () {
        let resolver = new Resolver()

        resolver.addRoute('/test', 'http://domain.tld/', 'get')
        resolver.addRoute('/test', 'http://domain.tld/new', 'post', 'POST')

        expect(resolver.match({url: '/test', method: 'POST'}).endpoint).to.be.equal('http://domain.tld/new')
    })

    it('should resolve STRICT header route', function () {
        let resolver = new Resolver()

        resolver.addRawRoute(exampleConfig.strictHeaderAjaxDefinition.strict)

        expect(resolver.match({url: '/', method: 'GET', 'headers': {HTTP_X_REQUESTED_WITH: 'xmlhttprequest'}}).endpoint).to.be.equal('http://domain.tld/ajax')
    })

    it('should resolve STRICT path route with POST if added via route builder', function () {
        let resolver = new Resolver()

        resolver.newRoute().matchPath('/test').toEndpoint('http://domain.tld/').setId('get').save()
        resolver.newRoute().matchPath('/test').toEndpoint('http://domain.tld/new').setId('post').matchMethod('POST').save()

        expect(resolver.match({url: '/test', method: 'POST'}).endpoint).to.be.equal('http://domain.tld/new')
    })
    
    it('should resolve header route added via route builder', function () {
        let resolver = new Resolver()

        resolver.newRoute().matchPath('/').toEndpoint('http://domain.tld/ajax').setId('ajax').save()

        expect(resolver.match({url: '/', method: 'GET', 'headers': {HTTP_X_REQUESTED_WITH: 'xmlhttprequest'}}).endpoint).to.be.equal('http://domain.tld/ajax')
    })
})