'use strict'

import Logger from '../../lib/logger'

const http = require('http')
const https = require('https')
const httpAgent = new http.Agent({ keepAlive: true })
const httpsAgent = new https.Agent({ keepAlive: true })
const url = require('url')

const logger = Logger.instance()

export function request(uri, headers = {}) {
    const parsedUrl = url.parse(uri)
    const protocol = isHttps(parsedUrl) ? https : http

    const options = buildOptions(parsedUrl, headers)

    return new Promise(function (resolve, reject) {
        var req = protocol.request(options, function(res) {
            resolve(res)
        })

        req.on('error', function(e) {
            console.log('problem with request: ' + e.message)
            reject(e)
        })

        req.end()
    })
}

export function requestEndOfStream(uri, headers = {}) {
    const parsedUrl = url.parse(uri)
    const protocol = isHttps(parsedUrl) ? https : http

    const options = buildOptions(parsedUrl, headers)

    return new Promise(function (resolve, reject) {
        var req = protocol.request(options, function(res) {
            let completeData = ''
            res.on('data', function (chunk) {
                logger.debug(`Receiving chunk of length ${chunk.length}: ${chunk}`)
                completeData += chunk
            })
            res.on('end', function () {
                resolve(completeData)
            })
        })

        req.on('error', function(e) {
            console.log('problem with request: ' + e.message)
            reject(e)
        })

        req.end()
    })
}

function buildOptions(parsedUrl, headers) {
    let options = {
        hostname: parsedUrl.hostname,
        port: parsedUrl.port ? parsedUrl.port : (isHttps(parsedUrl) ? 443 : 80),
        path: parsedUrl.path ? parsedUrl.path : '/',
        method: 'GET',
        headers: headers,
        agent: isHttps(parsedUrl) ? httpsAgent : httpAgent
    }

    delete options.headers['referer']
    options.headers['host'] = parsedUrl.host

    return options
}

function isHttps(parsedUrl) {
    return parsedUrl.protocol === 'https:'
}
