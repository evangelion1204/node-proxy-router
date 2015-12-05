'use strict'

import Logger from '../../lib/logger'
const _ = require('lodash')
const Readable = require('stream').Readable
const util = require('util')

const logger = Logger.instance()

import {request, requestStream, post} from '../../lib/request'

const proxyPickHeaders = ['location', 'set-cookie', 'expires', 'cache-control']

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


export default function () {
    return function *() {
        if (!this.state.resolver) {
            return
        }

        let proxyResult

        if (this.request.method !== 'POST') {
            this.response.body = new ResponseStream()
            this.response.type = 'html'

            let stream = requestStream(this.state.resolver.mapping, this.request.header)

            stream.on('response', function (response) {
                this.response.status = response.statusCode
                this.response.set(extractHeadersToProxy(response.headers))
            }.bind(this))

            stream.on('data', function (data) {
                this.response.body.push(data)
            }.bind(this))

            stream.on('end', function () {
                this.response.body.end()
            }.bind(this))


        }
        else {
            proxyResult = yield post(this.state.resolver.mapping, this.request.headers, this.req)

            this.response.body = proxyResult.body
            this.response.status = proxyResult.statusCode
            this.response.set(extractHeadersToProxy(proxyResult.headers))

            return
        }
    }
}

function extractHeadersToProxy(headers) {
    return _.extend(
        {},
        _.pick(headers, proxyPickHeaders),
        _.pick(headers, function (value, key) {return key.startsWith('x-response')})
    )
}