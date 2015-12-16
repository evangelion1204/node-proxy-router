'use strict'

import Logger from '../lib/logger'
import http from 'http'
import https from 'https'

const logger = Logger.instance()


export default class Router {
    constructor (options = {}) {
        this.options = options
    }

    listen(port) {
        this._server = http.createServer(function (request, response) {
            let proxyRequest = http.request(Object.assign({}, {agent: false, hostname: 'www.golem.de', port: 80, path: '/', headers: Object.assign({}, request.headers, {host: 'www.golem.de'})}))

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
                    //console.log('END')
                })

                proxyResponse.pipe(response)
            })

            request.pipe(proxyRequest)
        }.bind(this))

        this._server.listen(port)
    }
}