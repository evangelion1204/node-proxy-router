'use strict'

import RouteBuilder from '../builder/route'

const _ = require('lodash')
const fs = require('fs')

const formatRegex = /^(\w+):(.+?);?$/
const filterRegex = /^(\w+)\((.*?)\)$/
const matcherRegex = /^(\w+)\((.*?)\)$/

export default class eskipReader {
    constructor(src) {
        this._src = src
    }

    read(cb = null) {
        fs.readFile(this._src, 'utf8', function (err, content) {
            if (err && cb) {
                return cb(err)
            }

            this.process(content.split('\n'))

            if (cb) {
                cb()
            }
        }.bind(this))

        return this
    }

    process(lines) {
        const result = []
        for (let line of lines) {
            if (line.trim() !== '') {
                result.push(this._parse(line.trim()))
            }
        }

        return result
    }

    _parse(definition) {
        let routeParts = definition.replace(formatRegex, '$2').split('->')

        const builder = new RouteBuilder()

        builder
            .setId(definition.replace(formatRegex, '$1'))
            .toEndpoint(routeParts.pop().trim().replace(/"/g, ''))

        this._parseMatchers(builder, routeParts.splice(0, 1)[0])
        this._parseFilters(builder, routeParts)

        return builder.route
    }

    _parseMatchers(builder, part) {
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

    _parseFilters(builder, parts) {
        for (let filter of parts) {
            const filterName = filter.trim().replace(filterRegex, '$1')
            const filterParams = filter.trim().replace(filterRegex, '$2').split(',').map(arg => arg.trim().replace(/"/g, ''))

            builder.withFilter(filterName, ...filterParams)
        }

        return this
    }
}
