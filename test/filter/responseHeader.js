'use strict'

const chai = require('chai')
const sinon = require('sinon')
const sinonChai = require('sinon-chai')
const expect = chai.expect
const compose = require('koa-compose')
const co = require('co')
const cookies = require('cookies')

import Filter from '../../src/filter/responseHeader'

chai.use(sinonChai)


describe('RequestHeader filter', function() {
    function buildContext() {
        let ctx = {
            request: {headers: {}},
            proxyResponse: {headers: {}},
            response: {headers: {}}
        }

        return ctx
    }

    it('should be available', function () {
        expect(Filter).to.be.a('function')
    })

    it('should return a middleware', function () {
        expect(Filter('header', 'value')).to.be.defined
    })

    it('should modify the response header', function (done) {
        let ctx = buildContext()
        let middleware = [function *(next) {
            yield next
            expect(this.proxyResponse.headers['header']).to.be.equal('value')
        }, Filter('header', 'value')]

        let composedMiddleware = compose(middleware)

        co.wrap(composedMiddleware).call(ctx).then(function () {
            done()
        }).catch(done)
    })
})