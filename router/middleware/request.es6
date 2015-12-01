'use strict'

import Logger from '../../lib/logger'
const _ = require('lodash')

const logger = Logger.instance()

import {request, post} from '../../lib/request'

const proxyPickHeaders = ['location', 'set-cookie', 'expires', 'cache-control']

export default function () {
    return function *() {
        if (!this.state.resolver) {
            return
        }

        let proxyResult

        if (this.request.method !== 'POST') {
            proxyResult = yield request(this.state.resolver.mapping, this.request.headers)

            this.response.body = proxyResult.body
            this.response.status = proxyResult.statusCode
            this.response.set(extractHeadersToProxy(proxyResult.headers))
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