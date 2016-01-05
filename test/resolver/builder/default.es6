'use strict'

const koa = require('koa')
const chai = require('chai')
const sinon = require('sinon')
const sinonChai = require('sinon-chai')
const expect = chai.expect

import DefaultBuilder from '../../../../src/resolver/builder/default'
import * as exampleConfig from './configs'

chai.use(sinonChai)

describe('DefaultBuilder', function() {
    it('Default Builder should be available', function () {
        expect(DefaultBuilder).to.be.a('function')
    })

    it('Update should allow chaining', function () {
        let instance = new DefaultBuilder()

        expect(instance.update({}, {})).to.equal(instance)
    })

    it('Update the routes structure and contain STRICT path routes', function () {
        let instance = new DefaultBuilder()

        let routes = {}

        instance.update(routes, exampleConfig.routesDefinition)

        expect(routes['/test'][0].route.endpoint).to.be.equal('http://domain.tld')
    })

    it('Update the routes structure and contain REGEX path routes', function () {
        let instance = new DefaultBuilder()

        let routes = {}

        instance.update(routes, exampleConfig.regexDefinition)

        expect(routes.ANY[0].route.endpoint).to.be.equal('http://domain.tld/regex')
        expect(routes.ANY[1].route.endpoint).to.be.equal('http://domain.tld/regex-full')
    })

    it('Update the routes structure including POST, sorted by complexity', function () {
        let instance = new DefaultBuilder()

        let routes = {}

        instance.update(routes, exampleConfig.routesWithPostDefinition)

        expect(routes['/test'][0].route.endpoint).to.be.equal('http://domain.tld/new')
        expect(routes['/test'][1].route.endpoint).to.be.equal('http://domain.tld')
    })

    it('Update the routes structure for strict header matching', function () {
        let instance = new DefaultBuilder()

        let routes = {}

        instance.update(routes, exampleConfig.strictHeaderAjaxDefinition)

        expect(routes.ANY[0].route.endpoint).to.be.equal('http://domain.tld/ajax')
        expect(routes.ANY[0].route.endpoint).to.be.equal('http://domain.tld/ajax')
    })

    it('Update the routes structure for strict header and path matching', function () {
        let instance = new DefaultBuilder()

        let routes = {}

        instance.update(routes, exampleConfig.strictPathAndHeaderAjaxDefinition)

        expect(routes['/path/header'][0].route.endpoint).to.be.equal('http://domain.tld/ajax')
        expect(routes['/path/header'][0].route.endpoint).to.be.equal('http://domain.tld/ajax')
    })
})