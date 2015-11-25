'use strict'

const koa = require('koa')
const request = require('supertest')
const chai = require('chai')
const expect = chai.expect

import middleware from '../../../router/middleware/stats'

describe('stats middlware', function() {
    let app
    beforeEach(function () {
        app = koa()
    })

    it('init method should return a generator', function () {
        expect(middleware).to.be.defined
        expect(middleware().next).to.be.defined
    })

    it('should measure the time', function (done) {
        app.use(function *(next) {
            yield next

            expect(this.state.stats).to.be.defined
            expect(this.state.stats.total).to.be.gt(500)
        })
        app.use(middleware())
        app.use(function *() {
            this.response.body = 'ok'
            yield new Promise(function (resolve) {setTimeout(resolve, 500)})
        })

        request(app.listen())
            .get('/')
            .expect(200, done)

    })
})