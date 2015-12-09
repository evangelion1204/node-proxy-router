'use strict'

import Logger from '../../lib/logger'
const _ = require('lodash')
const Readable = require('stream').Readable
const util = require('util')
import {SESSION_HEADER} from '../../lib/middleware/session'

const logger = Logger.instance()

import {request, requestStream, post} from '../../lib/request'

const proxyPickHeaders = ['location', 'set-cookie', 'expires', 'cache-control']
const persistHeaders = [SESSION_HEADER]

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


        let persistedHeaders = _.transform(persistHeaders, function (result, header) {
            result[persistHeaders] = this.cookies.get(header)
        }.bind(this))

        console.log(_.extend({}, this.request.header, persistedHeaders))

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

            let persistHeaders = extractHeadersToPersist(proxyResult.headers)

            _.forEach(persistHeaders, function (value, header) {
                this.cookies.set(header, value)
            }.bind(this))

            return
        }
    }
}

function extractHeadersToProxy(headers) {
    return extractHeaders(headers, proxyPickHeaders)
}

function extractHeadersToPersist(headers) {
    return extractHeaders(headers, persistHeaders)
}

function extractHeaders(headers, selection) {
    return _.extend(
        {},
        _.pick(headers, selection)
        //_.pick(headers, function (value, key) {return key.startsWith('x-response')})
    )
}