'use strict'

const _ = require('lodash')

const STRICT = 'STRICT'
const REGEX = 'REGEX'

export default class Route {
    constructor() {
        this._route = {
            matcher: {}
        }
    }

    setId(id) {
        this._route.id = id

        return this
    }

    setStrictPath(path) {
        this._route.matcher.path = {
            match: path,
            type: STRICT
        }

        return this
    }

    setRegexPath(path) {
        this._route.matcher.path = {
            match: path,
            type: REGEX
        }

        return this
    }

    setEndpoint(endpoint) {
        this._route.endpoint = endpoint

        return this
    }

    setMethod(method) {
        this._route.matcher.method = method

        return this
    }

    setFilters(filters) {
        this._route.filters = filters

        return this
    }

    get route() {
        return this._route
    }
}
