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
        this._updateHeaders(target, newRoutes)

        return this
    }

    _updateStrictPath(target, newRoutes) {
        let supportedMethods = _.keys(target)
        let strictRoutes = _.filter(newRoutes, (route) => route.matcher && route.matcher.path && route.matcher.path.type === STRICT)

        _.reduce(strictRoutes, function (routes, route, id) {
            let methods = route.matcher.method ? [route.matcher.method] : supportedMethods

            route.id = id

            for (let method of methods) {
                routes[method][route.matcher.path.match] = route
            }

            return routes
        }, target)
    }

    _updateHeaders(target, newRoutes) {
        let supportedMethods = _.keys(target)
        let strictRoutes = _.filter(newRoutes, (route) => route.matcher && route.matcher.headers && route.matcher.headers)

        _.reduce(strictRoutes, function (routes, route, id) {
            let methods = route.matcher.method ? [route.matcher.method] : supportedMethods

            route.id = id

            for (let method of methods) {
                routes[method].ANY = routes[method].ANY || {HEADERS: []}
                routes[method].ANY.HEADERS.push(route)
            }

            return routes
        }, target)
    }

    //_updateRegexPath(target, newRoutes) {
    //    let supportedMethods = _.keys(target)
    //    let strictPathRoutes = _.filter(newRoutes, (route) => route.matcher && route.matcher.path && route.matcher.path.type === REGEX)
    //
    //    _.reduce(strictPathRoutes, function (routes, route, id) {
    //        let methods = route.matcher.method ? [route.matcher.method] : supportedMethods
    //
    //        route.id = id
    //
    //        for (let method of methods) {
    //            routes[method][route.matcher.path.match] = route
    //        }
    //
    //        return routes
    //    }, target)
    //}
}
