'use strict'

const koa = require('koa')
const request = require('supertest')
const chai = require('chai')
const expect = chai.expect

import middleware from '../../../router/middleware/request'

describe('request middlware', function() {
    let app

    beforeEach(function () {
        app = koa()
    })

    it('init method should return a generator', function () {
        expect(middleware).to.be.defined
        expect(middleware().next).to.be.defined
    })

    it('should resolve target', function (done) {
        app.use(function *(next) {
            this.state.resolver = {
                mapping: 'http://google.de'
            }

            yield next
        })

        app.use(middleware())

        app.use(function *() {
            this.response.body = 'ok'
        })

        request(app.listen())
            .get('/')
            .expect(200, done)

    })
})