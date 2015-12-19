'use strict'

const _ = require('lodash')
const util = require('util')

export default function (headerName, headerValue) {
    return function *(next) {
        yield next

        this.proxyResponse.headers[headerName] = headerValue
    }
}
