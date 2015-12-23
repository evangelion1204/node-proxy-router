'use strict'

import Logger from '../lib/logger'
import http from 'http'
import https from 'https'
import Resolver from './resolver'
import Builder from './resolver/builder/default'
import FilterBuilder from './filter/builder'

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
        this.filterBuilder = new FilterBuilder(options)
        this.resolver.init(this.options.routes)
    }

    listen(port) {
        this._server = http.createServer(this.onRequest.bind(this))

        return this._server.listen(port)
    }

    onRequest(request, response) {
        logger.debug(`Receiving request "${request.url}"`)

        try {
            console.time('resolving')
            let route = this.resolver.match(request)
            console.timeEnd('resolving')
            let context = this.createContext(request, response, route)

            logger.debug(`Resolved route ${JSON.stringify(route)}`)

            if (!route.composedFilters) {
                logger.debug(`Composing filters`)

                let filters = this.filterBuilder.buildFilters(route.filters)
                route.composedFilters = compose([this.streamProxyMiddleware, ...filters ,this.requestProxyMiddleware])
            }

            logger.debug(`Passing execution to composed filters`)

            console.time('middlware')
            co.wrap(route.composedFilters).call(context)
                .then(function () {
                    console.timeEnd('middlware')
                })
                .catch(function (error) {
                    console.timeEnd('middlware')
                    logger.debug(`Error handling request "${error}"`)
                    response.writeHead(500)
                    response.end()
                })
        } catch (error) {
            logger.debug(`Error serving request ${error}`)
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