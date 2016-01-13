'use strict'

import Logger from '../logger'

const _ = require('lodash')

const logger = Logger.instance()

export default class FilterBuilder {
    constructor (options = {}) {
        this.options = options

        this.addIncludePath('.')
    }

    addIncludePath(path) {
        if (!this.paths) {
            this.paths = []
        }

        this.paths.push(path)

        return this
    }

    buildFilters(filters) {
        logger.debug(`Building filters ${JSON.stringify(filters)}`)

        return _.map(filters, function (filter) {
            if (typeof filter === 'function') {
                return filter
            }

            let filterInitializer = this.loadFilter(filter.name)

            return filterInitializer.apply(this, filter.args)
        }.bind(this))
    }

    loadFilter(name) {
        logger.debug(`Loading filter ${name}`)

        let includePaths = _.map(this.paths, function (includePath) {
            return includePath.length ? `${includePath}/${name}` : name
        })

        for (let includePath of includePaths) {
            try {
                let filter = require(includePath)

                return typeof filter === 'function' ? filter : filter.default
            }
            catch (error) {}
        }

        throw new Error(`Could not load filter ${name}`)
    }
}
