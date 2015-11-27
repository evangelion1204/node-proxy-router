'use strict'

import Logger from '../../lib/logger'

const logger = Logger.instance()

import {request, post} from '../../lib/request'

export default function () {
    return function *() {
        if (!this.state.resolver) {
            yield next

            return
        }

        let proxyResult

        if (this.request.method !== 'POST') {
            proxyResult = yield request(this.state.resolver.mapping, this.request.headers)

            this.response.set(proxyResult.headers)
            this.response.body = proxyResult.body
        }
        else {
            console.log('POST')
            proxyResult = yield post(this.state.resolver.mapping, this.request.headers, this.req)

            this.response.status = proxyResult.statusCode
            this.response.set(proxyResult.headers)
            this.response.body = proxyResult.body

            return
        }
    }
}