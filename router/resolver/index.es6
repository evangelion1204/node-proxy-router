'use strict'

import Logger from '../../lib/logger'

const _ = require('lodash')
const url = require('url')

const logger = Logger.instance()

const supportedMethods = ['GET', 'POST']

export default class Resolver {
    constructor(routeBuilder) {
        this.routes = {}
        this.routeBuilder = routeBuilder
    }

    init(routes) {
        this.routes = _.reduce(supportedMethods, function (result, method) {
            result[method] = {}

            return result
        }, {})

        this.routeBuilder.update(this.routes, routes)

        return this
    }

    match(request) {
        let result
        if (result = this.matchMethod(this.routes, request)) {
            return result
        }

        throw new Error(`No matching route found for ${request}`)
    }

    matchMethod(tree, request) {
        let result = tree[request.method]

        if (!result) {
            return false
        }

        return this.matchPath(result, request)
    }

    matchPath(tree, request) {
        let result = tree[request.url] || tree.ANY

        if (!result) {
            return false
        }

        return this.matchHeaders(result, request)
    }

    matchHeaders(tree, request) {
        if (!tree.HEADERS) {
            return tree
        }

        for (let headerMatchRoute of tree.HEADERS) {
            _.every(headerMatchRoute.match.headers, {header} => request.headers[header.name] === header.value)
            for (header of ) {
                if (!request.headers[header.name] !== header.value) {
                    break
                }
            }
        }
    }
}

/*
(config = {exact: {}}) {
    assertConfig(config)

    let routes = prepareRoutes(config.exact)

    return function *(next) {
        if (!!this.state.resolver) {
            logger.log(`Already resolved, skipping!`)

            yield next

            return
        }

        let route

        logger.debug(`Exact matching for ${this.request.path}`)

        if (!(route = routes[this.request.method][this.request.path])) {
            logger.log(`No mapping found for ${this.request.path}, skipping!`)

            yield next

            return
        }

        this.state.resolver = {
            mapping: route.target
        }

        yield next
    }
}


function assertConfig(config) {
    if (!config.exact) {
        throw new Error('Missing configuration for exact resolver!')
    }
}

function prepareRoutes(routes) {

}
*/