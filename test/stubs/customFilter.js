'use strict'

const _ = require('lodash')
const util = require('util')

export default function (filterValue) {
    return function *(next) {
        this.request.headers['custom-filter'] = filterValue

        yield next
    }
}
