'use strict'

const _ = require('lodash')
const util = require('util')

export default function (headerName, headerValue) {
    return function *(next) {
        this.request.headers[headerName] = headerValue

        yield next
    }
}
