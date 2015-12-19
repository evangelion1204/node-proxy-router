'use strict'

const _ = require('lodash')
const util = require('util')

export default function (cookieName, headerName) {
    return function *(next) {
        if (this.cookies.get(cookieName)) {
            this.request.headers[headerName] = this.cookies.get(cookieName)
        }

        yield next

        if (this.response.headers[headerName]) {
            this.cookies.set(cookieName, this.response.headers[headerName])

            delete this.response.headers[headerName]
        }
    }
}
