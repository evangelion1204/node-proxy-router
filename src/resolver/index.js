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

        return this
    }

    //update(target, newRoutes) {
    //    this._updateStrictPath(target, newRoutes)
    //    this._updateOther(target, newRoutes)
    //
    //    return this
    //}
    //
    //_updateStrictPath(target, newRoutes) {
    //    this._updateRoutes(
    //        target,
    //        _.filter(newRoutes, (route) => route.matcher && route.matcher.path && route.matcher.path.type === STRICT),
    //        (route) => route.matcher.path.match
    //    )
    //}
    //
    //_updateOther(target, newRoutes) {
    //    this._updateRoutes(
    //        target,
    //        _.filter(newRoutes, (route) => route.matcher && (!route.matcher.path || route.matcher.path.type !== STRICT)),
    //        (route) => 'ANY'
    //    )
    //}
    //
    //_updateRoutes(target, routes, generatePath) {
    //    _.reduce(routes, function (routes, route, id) {
    //        route.id = id
    //
    //        let pathSelector = generatePath(route)
    //
    //        if (!routes[pathSelector]) {
    //            routes[pathSelector] = []
    //        }
    //
    //        let result = routes.find(pathSelector)
    //
    //        if (!result) {
    //            routes.add(pathSelector, [])
    //            result = routes.find(pathSelector)
    //        }
    //
    //        result.data.push(this.createMatchDefinition(route))
    //
    //        result.data.sort((a, b) => Object.keys(b).length - Object.keys(a).length)
    //
    //        return routes
    //    }.bind(this), target)
    //
    //}

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

        result.data.push(this.createMatchDefinition(route))

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
