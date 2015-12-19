'use strict'

const koa = require('koa')
const chai = require('chai')
const sinon = require('sinon')
const sinonChai = require('sinon-chai')
const expect = chai.expect
const compose = require('koa-compose')
const co = require('co')
const cookies = require('cookies')

import Cookie from '../../../router/filter/cookie'

chai.use(sinonChai)


describe('Cookie filter', function() {
    function buildContext() {
        let ctx = {
            request: {headers: {cookie: "cookieName=value"}, connection: {encrypted: false}},
            response: {headers: {headerName: 'newValue'}}
        }

        ctx.response.getHeader = (name) => ctx.response.headers[name]
        ctx.response.setHeader = (name, value) => {ctx.response.headers[name] = value}
        ctx.cookies = cookies(ctx.request, ctx.response)

        return ctx
    }

    it('should be available', function () {
        expect(Cookie).to.be.a('function')
    })

    it('should return a middleware', function () {
        expect(Cookie('cookie', 'header')).to.be.defined
    })

    it('should modify the header', function (done) {
        let ctx = buildContext()
        let middleware = [function *(next) {
            yield next
            expect(this.request.headers['headerName']).to.be.not.undefined
            expect(this.response.headers['headerName']).to.be.undefined
        }, Cookie('cookieName', 'headerName')]

        let composedMiddleware = compose(middleware)

        co.wrap(composedMiddleware).call(ctx).then(function () {
            done()
        }).catch(done)
    })
})