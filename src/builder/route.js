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

    matchPath(path) {
        this._route.matcher.path = {
            match: path,
            type: STRICT
        }

        return this
    }

    matchRegexPath(path) {
        this._route.matcher.path = {
            match: path,
            type: REGEX
        }

        return this
    }

    toEndpoint(endpoint) {
        this._route.endpoint = endpoint

        return this
    }

    matchMethod(method) {
        this._route.matcher.method = method

        return this
    }

    withFilter(filter, ...filterArgs) {
        if (!this._route.filters) {
            this._route.filters = []
        }

        filter = typeof filter === 'function' ? filter : {
            name: filter,
            args: filterArgs
        }

        this._route.filters.push(filter)

        return this
    }

    withFilters(filters) {
        this._route.filters = filters

        return this
    }

    matchHeader(header, value) {
        if (!this._route.matcher.headers) {
            this._route.matcher.headers = []
        }

        this._route.matcher.headers.push({
            name: header,
            value: value,
            type: STRICT
        })

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
