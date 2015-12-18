'use strict'

import Logger from '../lib/logger'
import http from 'http'
import https from 'https'
import Resolver from './resolver'
import Builder from './resolver/builder/default'

const logger = Logger.instance()
const url = require('url')
const agent = new http.Agent({keepAlive: true})


export default class Router {
    constructor (options = {routes: {}}) {
        this.options = options

        this.resolver = new Resolver(new Builder())
        this.resolver.init(this.options.routes)
    }

    listen(port) {
        this._server = http.createServer(function (request, response) {
            try {
                let route = this.resolver.match(request)

                let parsedEndpoint = url.parse(route.endpoint)

                let proxyRequest = http.request(Object.assign({}, parsedEndpoint, {agent: agent, headers: Object.assign({}, request.headers, {host: parsedEndpoint.hostname})}))
                proxyRequest.on('error', function (error) {
                    console.log(error)
                    response.end(error)
                })

                proxyRequest.on('response', function (proxyResponse) {
                    Object.keys(proxyResponse.headers).forEach(function(header) {
                        response.setHeader(header, proxyResponse.headers[header])
                    })

                    response.writeHead(proxyResponse.statusCode)

                    proxyResponse.on('end', function () {
                        response.end()
                    })

                    proxyResponse.pipe(response)
                })

                request.pipe(proxyRequest)
            } catch (error) {
                response.writeHead(404)
                response.end('error')
            }

        }.bind(this))

        this._server.listen(port)
    }
}