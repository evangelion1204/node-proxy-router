'use strict'

import Logger from '../../lib/logger'
const _ = require('lodash')
const Readable = require('stream').Readable
const util = require('util')
import {SESSION_HEADER} from '../../lib/middleware/session'

const logger = Logger.instance()

import {request, requestStream, post} from '../../lib/request'

class ResponseStream {
    constructor() {
        Readable.call(this)
    }

    _read() {}

    end() {
        this.push(null)
    }
}

util.inherits(ResponseStream, Readable)


export default function (rawConfig) {
    let config = prepareConfig(rawConfig)

    return function *() {
        if (!this.state.resolver) {
            return
        }

        let proxyResult


        let persistedHeaders = _.transform(config.cookie, function (result, transform) {
            result[transform.from] = this.cookies.get(transform.to)
        }.bind(this))

        if (this.request.method !== 'POST') {
            this.response.body = new ResponseStream()
            this.response.type = 'html'

            let stream = requestStream(this.state.resolver.mapping, _.extend({}, this.request.header, persistedHeaders))

            stream.on('response', function (response) {
                this.response.status = response.statusCode
                this.response.set(extractHeadersToProxy(response.headers))

                if (this.response.status !== 200) {
                    this.response.body.end()
                }
            }.bind(this))

            stream.on('data', function (data) {
                this.response.body.push(data)
            }.bind(this))

            stream.on('end', function () {
                this.response.body.end()
            }.bind(this))
        }
        else {
            proxyResult = yield post(this.state.resolver.mapping, _.extend({}, this.request.header, persistedHeaders), this.req)

            this.response.body = proxyResult.body
            this.response.status = proxyResult.statusCode
            this.response.set(extractHeadersToProxy(proxyResult.headers))

            _.forEach(config.cookie, function (transform) {
                this.cookies.set(transform.to, proxyResult.headers[transform.from])
            }.bind(this))

            return
        }
    }

    function extractHeadersToProxy(headers) {
        return extractHeaders(headers, config.proxy)
    }

    function extractHeaders(headers, selection) {
        return _.extend(
            {},
            _.pick(headers, selection)
            //_.pick(headers, function (value, key) {return key.startsWith('x-response')})
        )
    }
}

function prepareConfig(config) {
    let result = _.extend({}, config)

    return result
}