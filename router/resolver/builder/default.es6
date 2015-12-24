'use strict'

import Logger from '../../../lib/logger'

const _ = require('lodash')

const logger = Logger.instance()

const STRICT = 'STRICT'
const REGEX = 'REGEX'

export default class DefaultBuilder {
    constructor() {

    }

    update(target, newRoutes) {
        this._updateStrictPath(target, newRoutes)
        this._updateOther(target, newRoutes)

        return this
    }

    _updateStrictPath(target, newRoutes) {
        this._updateRoutes(
            target,
            _.filter(newRoutes, (route) => route.matcher && route.matcher.path && route.matcher.path.type === STRICT),
            (route) => route.matcher.path.match
        )
    }

    _updateOther(target, newRoutes) {
        this._updateRoutes(
            target,
            _.filter(newRoutes, (route) => route.matcher && (!route.matcher.path || route.matcher.path.type !== STRICT)),
            (route) => 'ANY'
        )
    }

    _updateRoutes(target, routes, generatePath) {
        _.reduce(routes, function (routes, route, id) {
            route.id = id

            let pathSelector = generatePath(route)

            if (!routes[pathSelector]) {
                routes[pathSelector] = []
            }

            routes[pathSelector].push(this.createMatchDefinition(route))

            routes[pathSelector].sort((a, b) => Object.keys(b).length - Object.keys(a).length)

            return routes
        }.bind(this), target)

    }

    createMatchDefinition(route) {
        let matchers = _.omit(route.matcher, (definition, name) => name === 'path' && definition.type === STRICT)

        return Object.assign(matchers, {route: route})
    }
}
