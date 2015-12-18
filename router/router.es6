'use strict'

import Logger from '../lib/logger'
import http from 'http'
import https from 'https'

const logger = Logger.instance()

const agent = new http.Agent({keepAlive: true})


export default class Router {
    constructor (options = {}) {
        this.options = options
        http.globalAgent.keepAlive = true
    }

    listen(port) {
        this._server = http.createServer(function (request, response) {
            let proxyRequest = http.request(Object.assign({}, {agent: agent, hostname: 'fun.mmig.de', path: '/', headers: Object.assign({}, request.headers, {host: 'fun.mmig.de'})}))
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
        }.bind(this))

        this._server.listen(port)
    }
}