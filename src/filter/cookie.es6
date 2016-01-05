'use strict'

const _ = require('lodash')
const util = require('util')

export default function (cookieName, headerName) {
    return function *(next) {
        if (this.cookies.get(cookieName)) {
            this.request.headers[headerName] = this.cookies.get(cookieName)
        }

        yield next

        if (this.proxyResponse.headers[headerName]) {
            this.cookies.set(cookieName, this.proxyResponse.headers[headerName])

            delete this.proxyResponse.headers[headerName]
        }
    }
}
