'use strict'

import Logger from '../../../lib/logger'

const _ = require('lodash')

const logger = Logger.instance()

const STRICT = 'STRICT'

export default class DefaultBuilder {
    constructor () {

    }

    update(target, newRoutes) {
        let supportedMethods = _.keys(target)

        let strictPathRoutes = _.filter(newRoutes, (route) => route.matcher && route.matcher.path && route.matcher.path.type === STRICT)

        _.reduce(strictPathRoutes, function (routes, route, id) {
            let methods = route.matcher.method ? [route.matcher.method] : supportedMethods

            route.id = id

            for (let method of methods) {
                routes[method][route.matcher.path.match] = route
            }

            return routes
        }, target)

        return this
    }
}
