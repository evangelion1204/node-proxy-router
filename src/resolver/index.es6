'use strict'

import Logger from '../../lib/logger'
import {Tree} from 'radix-tree'

const _ = require('lodash')
const url = require('url')

const logger = Logger.instance()

export default class Resolver {
    constructor(routeBuilder) {
        this.routes = new Tree()
        this.routeBuilder = routeBuilder
    }

    init(routes) {
        this.routes = new Tree()
        this.routeBuilder.update(this.routes, routes)

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
