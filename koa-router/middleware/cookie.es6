'use strict'

const _ = require('lodash')
const util = require('util')

import {request, requestStream, post} from '../../lib/request'

export default function (rawConfig) {
    let config = prepareConfig(rawConfig)

    return function *(next) {
        let persistedHeaders = _.transform(config, function (result, transform) {
            if (!this.cookies.get(transform.to)) {
                return
            }

            result[transform.from] = this.cookies.get(transform.to)
        }.bind(this))

        this.req.headers = _.extend(this.req.headers, persistedHeaders)

        yield next

        _.forEach(config, function (transform) {
            if (!this.response.headers[transform.from]) {
                return
            }

            this.cookies.set(transform.to, this.response.headers[transform.from])
            delete this.response.headers[transform.from]
        }.bind(this))
    }
}

function prepareConfig(config) {
    let result = _.extend({}, config)

    return result
}