'use strict'

import Logger from '../../lib/logger'

const http = require('http')
const https = require('https')
const httpAgent = new http.Agent({ keepAlive: true })
const httpsAgent = new https.Agent({ keepAlive: true })
const url = require('url')

const logger = Logger.instance()

export default function () {
    return function *(next) {
        if (!this.state.resolver) {
            yield next

            return
        }

        console.log(this.state.resolver)

        const parsedUrl = url.parse(this.state.resolver.mapping)
        const protocol = parsedUrl.protocol === 'https:' ? https : http

        var options = {
            hostname: parsedUrl.hostname,
            port: parsedUrl.port ? parsedUrl.port : (parsedUrl.protocol === 'https:' ? 443 : 80),
            path: parsedUrl.path ? parsedUrl.path : '/',
            method: 'GET',
            headers: this.request.headers,
            //agent: parsedUrl.protocol === 'https:' ? httpsAgent : httpAgent
        }

        options.headers['host'] = parsedUrl.host
        delete options.headers['referer']

        console.log(options)

        this.response.body = yield new Promise(function (resolve, reject) {
            var req = protocol.request(options, function(res) {
                resolve(res)
            })

            req.on('error', function(e) {
                console.log('problem with request: ' + e.message)
                reject(e)
            })

            req.end()
        })

        this.response.set('Content-Type', this.response.body.headers['content-type'])
        this.response.set('Content-Encoding', this.response.body.headers['content-encoding'])
        this.response.set('Transfer-Encoding', this.response.body.headers['transfer-encoding'])
        this.response.set('Content-Length', this.response.body.headers['content-length'])

        yield next
    }
}