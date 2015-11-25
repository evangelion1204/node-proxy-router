'use strict'

const koa = require('koa')
const request = require('supertest')
const chai = require('chai')
const expect = chai.expect

import middleware from '../../../../router/middleware/resolver/exact'

describe('Exact resolver middlware', function() {
    let app

    beforeEach(function () {
        app = koa()
    })

    it('init method should return a generator', function () {
        expect(middleware).to.be.defined
        expect(middleware().next).to.be.defined
    })

    it('should resolve target', function (done) {
        app.use(middleware({
            exact: {
                '/': 'http://www.google.com/doodles'
            }
        }))
        app.use(function *() {
            expect(this.state.resolver.mapping).to.be.defined
            expect(this.state.resolver.mapping).to.equal('http://www.google.com/doodles')

            this.response.body = 'ok'
        })

        request(app.listen())
            .get('/')
            .expect(200, done)

    })
})