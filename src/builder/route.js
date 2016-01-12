'use strict'

const _ = require('lodash')

const STRICT = 'STRICT'
const REGEX = 'REGEX'

export default class Route {
    constructor(resolver) {
        this._route = {
            matcher: {}
        }

        this._resolver = resolver
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

    save() {
        if (!this._resolver) {
            throw new Error('A resolver must be set in order to call save()')
        }

        this._resolver.addRawRoute(this.route)

        return this._resolver
    }
}
