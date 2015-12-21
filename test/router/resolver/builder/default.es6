'use strict'

const koa = require('koa')
const chai = require('chai')
const sinon = require('sinon')
const sinonChai = require('sinon-chai')
const expect = chai.expect

import DefaultBuilder from '../../../../router/resolver/builder/default'
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

    it('Update the routes structure', function () {
        let instance = new DefaultBuilder()

        let routes = {GET: {}}

        instance.update(routes, exampleConfig.routesDefinition)

        expect(routes.GET['/test'].endpoint).to.be.equal('http://domain.tld')
    })

    it('Update the routes structure including POST', function () {
        let instance = new DefaultBuilder()

        let routes = {GET: {}, POST: {}}

        instance.update(routes, exampleConfig.routesWithPostDefinition)

        expect(routes.GET['/test'].endpoint).to.be.equal('http://domain.tld')
        expect(routes.POST['/test'].endpoint).to.be.equal('http://domain.tld/new')
    })

    it('Update the routes structure for strict header matching', function () {
        let instance = new DefaultBuilder()

        let routes = {GET: {}, POST: {}}

        instance.update(routes, exampleConfig.strictHeaderAjaxDefinition)

        expect(routes.GET.ANY.HEADERS[0].endpoint).to.be.equal('http://domain.tld/ajax')
        expect(routes.POST.ANY.HEADERS[0].endpoint).to.be.equal('http://domain.tld/ajax')
    })
})