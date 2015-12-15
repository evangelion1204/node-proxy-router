'use strict'

import Logger from '../../../lib/logger'

const _ = require('lodash')
const url = require('url')

const logger = Logger.instance()

export default function (config = {startsWith: []}) {
    assertConfig(config)

    let routes = prepareRoutes(config.startsWith)

    return function *(next) {
        if (!!this.state.resolver) {
            logger.log(`Already resolved, skipping!`)

            yield next

            return
        }

        if (!routes) {
            logger.log(`No starts with mappings found, skipping!`)

            yield next

            return
        }

        logger.debug(`StartsWith matching for ${this.request.path}`)

        for (let index in routes) {
            let route = routes[index]
            if (this.request.path.indexOf(route.match) === 0) {
                this.state.resolver = {
                    mapping: mergeRouteAndPath(route, this.request.path)
                }

                logger.debug(`Match found for ${route.match} mapping to ${this.state.resolver.mapping}`)

                break
            }
        }

        yield next
    }
}


function assertConfig(config) {
    if (!config.startsWith) {
        throw new Error('Missing configuration for startsWith resolver!')
    }
}

function prepareRoutes(routes) {
    return _.map(routes, function (route, key) {
        return !_.isString(route) ? route : _.defaults({
            match: key,
            target: route
        }, {
            keepPath: false,
            trimMatch: false
        })

        return result
    }, {})
}

function mergeRouteAndPath(route, path) {
    if (!route.keepPath) {
        return route.target
    }

    const parsedUrl = url.parse(route.target)

    parsedUrl.pathname = path

    if (route.trimMatch) {
        parsedUrl.pathname = parsedUrl.pathname.substr(route.match.length)
    }

    return url.format(parsedUrl)
}
