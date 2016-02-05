'use strict'

import Logger from '../logger'
import RouteBuilder from '../builder/route'

const _ = require('lodash')
const fs = require('fs')

const logger = Logger.instance()

export default class eskip {
    constructor(router) {
        this._router = router
    }

    read(src, cb = null) {
        fs.readFile(src, function (err, content) {
            if (err) {
                return cb(err)
            }

            this.process(JSON.parse(content))

            if (cb) {
                cb()
            }

        }.bind(this))

        return this
    }

    parse(definition) {
        const formatRegex = /^(\w+):(.+?);?$/
        const matcherRegex = /^(\w+)\((.*?)\)$/
        const filterRegex = /^(\w+)\((.*?)\)$/
        let routeParts = definition.replace(formatRegex, '$2').split('->')

        const builder = new RouteBuilder(this._router)

        builder
            .setId(definition.replace(formatRegex, '$1'))
            .toEndpoint(routeParts.pop().trim().replace(/"/g, ''))
            //.withFilter('requestHeader', 'Host', 'www.zalando-lounge.de')

        const matchers = routeParts.splice(0, 1)[0].split('&&')

        for (let matcher of matchers) {
            const matcherType = matcher.trim().replace(matcherRegex, '$1')
            const matcherParams = matcher.trim().replace(matcherRegex, '$2').split(',').map(arg => arg.trim().replace(/"/g, ''))

            switch (matcherType.toLowerCase()) {
                case "path":
                    builder.matchPath.apply(builder, matcherParams)
                    break;
                case "pathregexp":
                    builder.matchRegexPath.apply(builder, matcherParams)
                    break;
                case "method":
                    builder.matchMethod.apply(builder, matcherParams)
                    break;
                case "header":
                    builder.matchHeader.apply(builder, matcherParams)
                    break;
                case "headerregexp":
                    builder.matchRegexHeader.apply(builder, matcherParams)
                    break;
                default:
                    throw new Error(`Unknown matcher ${matcherType}`)
            }
        }

        for (let filter of routeParts) {
            const filterName = filter.trim().replace(filterRegex, '$1')
            const filterParams = filter.trim().replace(filterRegex, '$2').split(',').map(arg => arg.trim().replace(/"/g, ''))

            builder.withFilter(filterName, ...filterParams)
        }

        return builder.route
    }

    process(routes) {
        for (let route of routes) {
            this._router.addRawRoute(route)
        }

        return this
    }
}
