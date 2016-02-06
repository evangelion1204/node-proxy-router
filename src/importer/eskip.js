'use strict'

import Logger from '../logger'
import RouteBuilder from '../builder/route'

const _ = require('lodash')
const fs = require('fs')

const logger = Logger.instance()

const formatRegex = /^(\w+):(.+?);?$/
const filterRegex = /^(\w+)\((.*?)\)$/
const matcherRegex = /^(\w+)\((.*?)\)$/

export default class eskip {
    constructor(router) {
        this._router = router
    }

    read(src, cb = null) {
        logger.log(`Reading file ${src}`)

        fs.readFile(src, 'utf8', function (err, content) {
            if (err) {
                return cb(err)
            }

            console.log(content)

            this.process(content.split('\n'))

            if (cb) {
                cb()
            }
        }.bind(this))

        return this
    }

    process(routes) {
        for (let route of routes) {
            if (route.trim() !== '') {
                this._router.addRawRoute(this.parse(route.trim()))
            }
        }

        return this
    }

    parse(definition) {
        let routeParts = definition.replace(formatRegex, '$2').split('->')

        const builder = new RouteBuilder(this._router)

        builder
            .setId(definition.replace(formatRegex, '$1'))
            .toEndpoint(routeParts.pop().trim().replace(/"/g, ''))

        this.parseMatchers(builder, routeParts.splice(0, 1)[0])
        this.parseFilters(builder, routeParts)

        return builder.route
    }

    parseMatchers(builder, part) {
        const matchers = part.split('&&')

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

        return this
    }

    parseFilters(builder, parts) {
        for (let filter of parts) {
            const filterName = filter.trim().replace(filterRegex, '$1')
            const filterParams = filter.trim().replace(filterRegex, '$2').split(',').map(arg => arg.trim().replace(/"/g, ''))

            builder.withFilter(filterName, ...filterParams)
        }

        return this
    }
}
