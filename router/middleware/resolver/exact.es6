'use strict'

import Logger from '../../../lib/logger'

const _ = require('lodash')
const url = require('url')

const logger = Logger.instance()

export default function (config = {exact: {}}) {
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

        if (!(route = routes[this.request.path])) {
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
    if (_.isArray(routes)) {
        return _.reduce(routes, function (result, route, key) {
            result[route.match] = route

            return result
        }, {})
    }

    return _.reduce(routes, function (result, route, key) {
        result[key] = !_.isString(route) ? route : {
            match: key,
            target: route
        }

        return result
    }, {})
}
