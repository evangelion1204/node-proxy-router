'use strict'

const koa = require('koa')
const chai = require('chai')
const sinon = require('sinon')
const sinonChai = require('sinon-chai')
const expect = chai.expect

import Resolver from '../../../router/resolver'
import Builder from '../../../router/resolver/builder/default'

import * as exampleConfig from './builder/configs'

chai.use(sinonChai)

describe('Resolver', function() {
    let mockedBuilder

    beforeEach(function () {
        mockedBuilder = {
            update: sinon.stub()
        }
    })

    it('Resolver should be available', function () {
        expect(Resolver).to.be.a('function')
    })

    it('Resolver constructor should be working', function () {
        expect(new Resolver(mockedBuilder)).to.be.an('object')
    })

    it('Resolver init should use passed builder', function () {
        let resolver = new Resolver(mockedBuilder)

        expect(resolver.init({test: {}})).to.be.equal(resolver)

        expect(mockedBuilder.update).to.be.calledWith(
            {GET: {}, POST: {}},
            {test: {}}
        )
        expect(mockedBuilder.update).to.be.calledOnce
    })

    it('Resolver should resolve STRICT path route', function () {
        let resolver = new Resolver(new Builder())

        resolver.init(exampleConfig.routesWithPostDefinition)

        expect(resolver.match({url: '/test', method: 'GET'}).endpoint).to.be.equal('http://domain.tld')
    })

    it('Resolver should resolve STRICT path route with POST', function () {
        let resolver = new Resolver(new Builder())

        resolver.init(exampleConfig.routesWithPostDefinition)

        expect(resolver.match({url: '/test', method: 'POST'}).endpoint).to.be.equal('http://domain.tld/new')
    })

    it('Resolver should resolve STRICT header route', function () {
        let resolver = new Resolver(new Builder())

        resolver.init(exampleConfig.strictHeaderAjaxDefinition)

        expect(resolver.match({url: '/', method: 'GET', 'headers': {HTTP_X_REQUESTED_WITH: 'xmlhttprequest'}}).endpoint).to.be.equal('http://domain.tld/ajax')
    })
})