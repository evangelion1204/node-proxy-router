'use strict'

import Logger from '../lib/logger'
import http from 'http'
import https from 'https'
import Resolver from './resolver'
import Builder from './resolver/builder/default'

const logger = Logger.instance()
const url = require('url')
const cookies = require('cookies')
const compose = require('koa-compose')
const co = require('co')

const agent = new http.Agent({keepAlive: true})


export default class Router {
    constructor (options = {routes: {}}) {
        this.options = options

        this.resolver = new Resolver(new Builder())
        this.resolver.init(this.options.routes)
    }

    listen(port) {
        this._server = http.createServer(this.onRequest.bind(this))

        return this._server.listen(port)
    }

    onRequest(request, response) {
        try {
            let route = this.resolver.match(request)
            let context = this.createContext(request, response, route)

            if (!route.composedFilters) {
                route.composedFilters = compose([this.streamProxyMiddleware, this.requestProxyMiddleware])
            }

            co.wrap(route.composedFilters).call(context).then(function () {

            }).catch(function () {
                response.writeHead(500)
                response.end()
            })
        } catch (error) {
            response.writeHead(404)
            response.end()
        }

    }

    createContext(request, response, route) {
        return {
            request: request,
            response: response,
            route: route,
            cookies: cookies(request, response)
        }
    }

    *requestProxyMiddleware() {
        let parsedEndpoint = url.parse(this.route.endpoint)
        let proxyRequest = http.request(Object.assign({}, parsedEndpoint, {method: this.request.method , agent: agent, headers: Object.assign({}, this.request.headers)}))

        proxyRequest.on('error', function (error) {
            this.response.writeHead(500)
            this.response.end()
        }.bind(this))

        this.request.pipe(proxyRequest)

        this.proxyResponse = yield new Promise(function (resolve) {
            proxyRequest.on('response', resolve)
        })
    }

    *streamProxyMiddleware(next) {
        yield next

        Object.keys(this.proxyResponse.headers).forEach(function(header) {
            this.response.setHeader(header, this.proxyResponse.headers[header])
        }.bind(this))

        this.response.writeHead(this.proxyResponse.statusCode)

        this.proxyResponse.pipe(this.response)
    }
}