'use strict'

const chai = require('chai')
const sinon = require('sinon')
const sinonChai = require('sinon-chai')
const expect = chai.expect

import Importer from '../../src/importer/eskip'

chai.use(sinonChai)

describe('eskip Importer', function() {
    let mockedRouter

    beforeEach(function () {
        mockedRouter = {
            addRawRoute: sinon.spy()
        }
    })

    it('should be available', function () {
        expect(Importer).to.be.a('function')
    })

    it('constructor should be working', function () {
        expect(new Importer(mockedRouter)).to.be.an('object')
    })

    it('process should add a route', function () {
        let importer = new Importer(mockedRouter)

        importer.process(['route1: Path("/") -> "http://www.domain.tld";', 'route2: Path("/") -> "http://www.domain.tld";'])

        expect(mockedRouter.addRawRoute).to.be.calledTwice
        expect(mockedRouter.addRawRoute).to.be.calledWith({id: 'route1', matcher: {path: {type: 'STRICT', match: '/'}}, endpoint: 'http://www.domain.tld'})
        expect(mockedRouter.addRawRoute).to.be.calledWith({id: 'route2', matcher: {path: {type: 'STRICT', match: '/'}}, endpoint: 'http://www.domain.tld'})
    })

    it('parse should return a strict route', function () {
        let importer = new Importer(mockedRouter)

        expect(importer.parse('myroute: Path("/test") -> "http://domain.tld";')).to.deep.equal({
            id: 'myroute',
            matcher: {
                path: {
                    match: '/test',
                    type: 'STRICT'
                }
            },
            endpoint: 'http://domain.tld'
        })
    })

    it('parse should return a regexp route', function () {
        let importer = new Importer(mockedRouter)

        expect(importer.parse('myroute: PathRegexp("^/test") -> "http://domain.tld";')).to.deep.equal({
            id: 'myroute',
            matcher: {
                path: {
                    match: '^/test',
                    type: 'REGEX'
                }
            },
            endpoint: 'http://domain.tld'
        })
    })

    it('parse should return a combined rule matcher route', function () {
        let importer = new Importer(mockedRouter)

        expect(importer.parse('myroute: Path("/test") && Method("POST") && Header("Accept", "application/json") -> "http://domain.tld";')).to.deep.equal({
            id: 'myroute',
            matcher: {
                path: {
                    match: '/test',
                    type: 'STRICT'
                },
                headers: [
                    {
                        name: 'Accept',
                        type: 'STRICT',
                        value: 'application/json'
                    }
                ],
                method: 'POST'
            },
            endpoint: 'http://domain.tld'
        })
    })

    it('parse should return a matcher and filter route', function () {
        let importer = new Importer(mockedRouter)

        expect(importer.parse('myroute: Path("/test") -> RequestHeader("X-Server", "Custom") -> "http://domain.tld";')).to.deep.equal({
            id: 'myroute',
            matcher: {
                path: {
                    match: '/test',
                    type: 'STRICT'
                },
            },
            filters: [
                {
                    name: 'RequestHeader',
                    args: ['X-Server', 'Custom']
                }
            ],
            endpoint: 'http://domain.tld'
        })
    })

    it('parse should return a matcher and multiple filters route', function () {
        let importer = new Importer(mockedRouter)

        expect(importer.parse('myroute: Path("/test") -> RequestHeader("X-Server", "Custom") -> Cookie("Name", "Header") -> "http://domain.tld";')).to.deep.equal({
            id: 'myroute',
            matcher: {
                path: {
                    match: '/test',
                    type: 'STRICT'
                },
            },
            filters: [
                {
                    name: 'RequestHeader',
                    args: ['X-Server', 'Custom']
                },
                {
                    name: 'Cookie',
                    args: ['Name', 'Header']
                }
            ],
            endpoint: "http://domain.tld"
        })
    })

    it('read should process the content of a file', function (done) {
        let importer = new Importer(mockedRouter)

        importer.process = sinon.spy()

        importer.read(__dirname + '/../stubs/routes.eskip', function (err) {
            expect(importer.process).to.be.calledWith(['route1: Path("/") -> "http://domain.tld";'])
            done()
        })
    })
})