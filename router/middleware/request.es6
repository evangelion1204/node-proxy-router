'use strict'

import Logger from '../../lib/logger'
const _ = require('lodash')

const logger = Logger.instance()

import {request, post} from '../../lib/request'

const proxyHeaders = ['location', 'set-cookie', 'expires', 'cache-control']

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
            this.response.set(_.pick(proxyResult.headers, proxyHeaders))
        }
        else {
            console.log('POST')
            proxyResult = yield post(this.state.resolver.mapping, this.request.headers, this.req)

            this.response.body = proxyResult.body
            this.response.status = proxyResult.statusCode
            this.response.set(_.pick(proxyResult.headers, proxyHeaders))

            return
        }
    }
}