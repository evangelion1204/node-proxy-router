'use strict'

import Logger from '../logger'
import {Tree} from 'radix-tree'
import RouteBuilder from '../builder/route'

const _ = require('lodash')
const url = require('url')

const logger = Logger.instance()

const STRICT = 'STRICT'
const REGEX = 'REGEX'

export default class Resolver {
    constructor() {
        this.init()
    }

    init() {
        this.routes = new Tree()
        this.routeIndex = {}

        return this
    }

    addRoute(path, endpoint, id = '', method = null, filters = []) {
        let builder = new RouteBuilder()

        builder
            .setId(id || path)
            .matchPath(path)
            .withFilters(filters)
            .toEndpoint(endpoint)

        if (method) {
            builder.matchMethod(method)
        }

        this.addRawRoute(builder.route, path)
    }

    addRegexRoute(path, endpoint, id = '', method = null, filters = []) {
        let builder = new RouteBuilder()

        builder
            .setId(id || path)
            .matchRegexPath(path)
            .withFilters(filters)
            .toEndpoint(endpoint)

        if (method) {
            builder.matchMethod(method)
        }

        this.addRawRoute(builder.route, 'ANY')
    }

    addRawRoute(route, path = 'ANY') {
        if (route.matcher.path && route.matcher.path.type === STRICT) {
            path = route.matcher.path.match
        }

        let result = this.routes.find(path)

        if (!result) {
            this.routes.add(path, [])
            result = this.routes.find(path)
        }

        let matcher = this.createMatchDefinition(route)

        this.routeIndex[matcher.route.id] = matcher
        result.data.push(matcher)

        result.data.sort((a, b) => Object.keys(b).length - Object.keys(a).length)
    }

    createMatchDefinition(route) {
        let matchers = _.omit(route.matcher, (definition, name) => name === 'path' && definition.type === STRICT)

        return Object.assign(matchers, {route: route})
    }

    newRoute(id) {
        let builder = new RouteBuilder(this)

        if (id) {
            builder.setId(id)
        }

        return builder
    }

    removeAll() {
        this.routes.removeAll()

        Object.keys(this.routeIndex).forEach(key => delete this.routeIndex[key])

        this.init()

        return this
    }

    removeRoute(id) {
        let matcher = this.routeIndex[id]
        const match = (matcher.route.matcher.path && matcher.route.matcher.path.type === STRICT) ?
            matcher.route.matcher.path.match :
            'ANY'

        let matchers = this.routes.find(match).data
        let index = matchers.indexOf(matcher)

        if (index === -1) {
            return this
        }

        matchers.splice(index, 1)
        delete this.routeIndex[id]

        if (matchers.length > 0) {
            return this
        }

        this.routes.remove(match)

        return this
    }

    match(request) {
        let result

        if (result = this.matchPath(this.routes, request)) {
            return result
        }

        throw new Error(`No matching route found for ${request}`)
    }

    matchPath(tree, request) {
        let lookup = tree.find(request.url) || tree.find('ANY')

        if (!lookup) {
            return false
        }

        logger.log(`Route ${lookup.path} matching, performing further matches`)

        let matchList = lookup.data

        for (let matcher of matchList) {
            if (this.matchMethod(matcher, request) && this.matchHeaders(matcher, request) && this.matchRegexPath(matcher, request)) {
                return matcher.route
            }
        }

        return false
    }

    matchMethod(matcher, request) {
        return !matcher.method || matcher.method == request.method
    }

    matchHeaders(matcher, request) {
        if (!matcher.headers) {
            return true
        }

        return _.every(matcher.headers, header => request.headers[header.name] === header.value)
    }

    matchRegexPath(matcher, request) {
        if (!matcher.path) {
            return true
        }

        let match = new RegExp(matcher.path.match)

        return match.test(request.url)
    }
}
