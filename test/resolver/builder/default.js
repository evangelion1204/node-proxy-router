'use strict'

const chai = require('chai')
const sinon = require('sinon')
const sinonChai = require('sinon-chai')
const expect = chai.expect

import DefaultBuilder from '../../../src/resolver/builder/default'
import * as exampleConfig from './configs'
import {Tree} from 'radix-tree'

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

        let routes = new Tree()

        instance.update(routes, exampleConfig.routesDefinition)

        expect(routes.find('/test').data[0].route.endpoint).to.be.equal('http://domain.tld')
    })

    it('Update the routes structure and contain REGEX path routes', function () {
        let instance = new DefaultBuilder()

        let routes = new Tree()

        instance.update(routes, exampleConfig.regexDefinition)

        expect(routes.find('ANY').data[0].route.endpoint).to.be.equal('http://domain.tld/regex')
        expect(routes.find('ANY').data[1].route.endpoint).to.be.equal('http://domain.tld/regex-full')
    })

    it('Update the routes structure including POST, sorted by complexity', function () {
        let instance = new DefaultBuilder()

        let routes = new Tree()

        instance.update(routes, exampleConfig.routesWithPostDefinition)

        expect(routes.find('/test').data[0].route.endpoint).to.be.equal('http://domain.tld/new')
        expect(routes.find('/test').data[1].route.endpoint).to.be.equal('http://domain.tld')
    })

    it('Update the routes structure for strict header matching', function () {
        let instance = new DefaultBuilder()

        let routes = new Tree()

        instance.update(routes, exampleConfig.strictHeaderAjaxDefinition)

        expect(routes.find('ANY').data[0].route.endpoint).to.be.equal('http://domain.tld/ajax')
    })

    it('Update the routes structure for strict header and path matching', function () {
        let instance = new DefaultBuilder()

        let routes = new Tree()

        instance.update(routes, exampleConfig.strictPathAndHeaderAjaxDefinition)

        expect(routes.find('/path/header').data[0].route.endpoint).to.be.equal('http://domain.tld/ajax')
    })
})