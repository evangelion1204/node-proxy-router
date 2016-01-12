'use strict'

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

import * as configs from './builder/configs'

chai.use(sinonChai)


describe('Router', function() {
    it('should be available', function () {
        expect(Router).to.be.a('function')
    })

    it('a http request should be handled with a 404 if no routes are defined', function (done) {
        let router = new Router()

        request(router.listen())
            .get('/')
            .expect(404, done)
    })

    it('a http request should return the 200 result of the proxied endpoint', function (done) {
        let server = http.createServer(function (request, response) {
            response.writeHead(200)
            response.end()
        }).listen(configs.routerPort)


        let router = new Router()
        router.addRoute('/',`http://localhost:${configs.routerPort}`)

        request(router.listen())
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

        let router = new Router()
        router.addRoute('/',`http://localhost:${configs.routerPort}`)

        request(router.listen())
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

        let router = new Router()
        router.addRoute('/',`http://localhost:${configs.routerPort}`, 'strict', null, [
            {
                name: 'requestHeader',
                args: ['header', 'value']
            }
        ])

        request(router.listen())
            .get('/')
            .expect(200, function () {
                server.close()
                done.apply(this, arguments)
            })
    })

    it('a http request with a regex route should return the 200 result of the proxied endpoint', function (done) {
        let server = http.createServer(function (request, response) {
            response.writeHead(200)
            response.end()
        }).listen(configs.routerPort)


        let router = new Router()
        router.addRegexRoute('^/abc',`http://localhost:${configs.routerPort}`)

        request(router.listen())
            .get('/abcdef')
            .expect(200, function () {
                server.close()
                done.apply(this, arguments)
            })
    })

    it('a http request with a complex route should return the 200 result of the proxied endpoint', function (done) {
        let server = http.createServer(function (request, response) {
            response.writeHead(200)
            response.end()
        }).listen(configs.routerPort)


        let router = new Router()
        router.addRawRoute({
            matcher: {
                path: {
                    match: '^/abc',
                    type: 'REGEX'
                }
            },
            endpoint: `http://localhost:${configs.routerPort}`
        })

        request(router.listen())
            .get('/abcdef')
            .expect(200, function () {
                server.close()
                done.apply(this, arguments)
            })
    })

    it('using the builder add a header to the request', function (done) {
        let server = http.createServer(function (request, response) {
            expect(request.headers['header']).to.be.equal('value')
            response.writeHead(200)
            response.end()
        }).listen(configs.routerPort)

        let router = new Router()
        let route = router.newRoute('test')
        route
            .matchPath('/')
            .withFilters([
                {
                    name: 'requestHeader',
                    args: ['header', 'value']
                }
            ])
            .toEndpoint(`http://localhost:${configs.routerPort}`)
            .save()

        request(router.listen())
            .get('/')
            .expect(200, function () {
                server.close()
                done.apply(this, arguments)
            })
    })

    it('custom filters from a include directory should be usable', function (done) {
        let server = http.createServer(function (request, response) {
            expect(request.headers['custom-filter']).to.be.equal('value')
            response.writeHead(200)
            response.end()
        }).listen(configs.routerPort)

        let router = new Router()

        expect(router.registerFilterDirectory(__dirname + '/stubs')).to.be.equal(router)

        let route = router.newRoute('test')
        route
            .matchPath('/')
            .withFilter('customFilter', 'value')
            .toEndpoint(`http://localhost:${configs.routerPort}`)
            .save()

        request(router.listen())
            .get('/')
            .expect(200, function () {
                server.close()
                done.apply(this, arguments)
            })
    })

})