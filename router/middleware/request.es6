'use strict'

import Logger from '../../lib/logger'

const logger = Logger.instance()

import request from '../../lib/request'

export default function () {
    return function *(next) {
        if (!this.state.resolver) {
            yield next

            return
        }

        this.response.body = yield request(this.state.resolver.mapping, this.request.headers)

        this.response.set('Content-Type', this.response.body.headers['content-type'])
        this.response.set('Content-Encoding', this.response.body.headers['content-encoding'])
        this.response.set('Transfer-Encoding', this.response.body.headers['transfer-encoding'])
        this.response.set('Content-Length', this.response.body.headers['content-length'])

        yield next
    }
}