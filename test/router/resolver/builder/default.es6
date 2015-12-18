'use strict'

const koa = require('koa')
const chai = require('chai')
const sinon = require('sinon')
const sinonChai = require('sinon-chai')
const expect = chai.expect

import DefaultBuilder from '../../../../router/resolver/builder/default'

chai.use(sinonChai)

describe('DefaultBuilder', function() {
    let routesDefinition = {
        strict: {
            matcher: {
                path: {
                    match: '/test',
                    type: 'STRICT'
                }
            },
            endpoint: 'http://domain.tld'
        },
        regexp: {
            matcher: {
                path: {
                    match: '/catalog-*',
                    type: 'REGEX'
                }
            },
            endpoint: 'http://domain.tld'
        }
    }

    let routesWithPostDefinition = Object.assign({}, routesDefinition, {
        strictPost: {
            matcher: {
                path: {
                    match: '/test',
                    type: 'STRICT'
                },
                method: 'POST'
            },
            endpoint: 'http://domain.tld/new'
        }
    })

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

        instance.update(routes, routesDefinition)

        expect(routes.GET['/test'].endpoint).to.be.equal('http://domain.tld')
    })

    it('Update the routes structure including POST', function () {
        let instance = new DefaultBuilder()

        let routes = {GET: {}, POST: {}}

        instance.update(routes, routesWithPostDefinition)

        expect(routes.GET['/test'].endpoint).to.be.equal('http://domain.tld')
        expect(routes.POST['/test'].endpoint).to.be.equal('http://domain.tld/new')
    })
})