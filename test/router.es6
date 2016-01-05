'use strict'

const koa = require('koa')
const chai = require('chai')
const sinon = require('sinon')
const sinonChai = require('sinon-chai')
const expect = chai.expect
const compose = require('koa-compose')
const co = require('co')
const cookies = require('cookies')
const request = require('supertest')
const http = require('http')

import Router from '../src/router'

import * as configs from 'resolver/builder/configs'

chai.use(sinonChai)


describe('Router', function() {
    it('should be available', function () {
        expect(Router).to.be.a('function')
    })

    it('a http request should be handled with a 404 if no routes are defined', function (done) {
        let app = new Router()

        request(app.listen())
            .get('/')
            .expect(404, done)
    })

    it('a http request should return the 200 result of the proxied endpoint', function (done) {
        let server = http.createServer(function (request, response) {
            response.writeHead(200)
            response.end()
        }).listen(configs.routerPort)


        let app = new Router({routes: configs.routerBaseDefinition})

        request(app.listen())
            .get('/')
            .expect(200, function () {
                server.close()
                done.apply(this, arguments)
            })
    })

    it('a http request should return the 302 result of the proxied endpoint', function (done) {
        let server = http.createServer(function (request, response) {
            response.writeHead(302, {
                location: '/redirect'
            })
            response.end()
        }).listen(configs.routerPort)

        let app = new Router({routes: configs.routerBaseDefinition})

        request(app.listen())
            .get('/')
            .expect(302)
            .expect('Location', '/redirect')
            .end(function () {
                server.close()
                done.apply(this, arguments)
            })
    })

    it('the filter should add a header to the request', function (done) {
        let server = http.createServer(function (request, response) {
            expect(request.headers['header']).to.be.equal('value')
            response.writeHead(200)
            response.end()
        }).listen(configs.routerPort)

        let app = new Router({routes: configs.routerBaseWithFilterDefinition})

        request(app.listen())
            .get('/')
            .expect(200, function () {
                server.close()
                done.apply(this, arguments)
            })
    })
})