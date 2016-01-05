'use strict'

import Logger from '../../lib/logger'

const _ = require('lodash')

const logger = Logger.instance()

export default class FilterBuilder {
    constructor (options = {}) {
        this.options = options
    }

    buildFilters(filters) {
        logger.debug(`Building filters ${JSON.stringify(filters)}`)

        return _.map(filters, function (filter) {
            let filterInitializer = this.loadFilter(filter.name)

            return filterInitializer.apply(this, filter.args)
        }.bind(this))
    }

    loadFilter(name) {
        logger.debug(`Loading filter ${name}`)
        let includePaths = ['.'].concat(this.paths || [])

        includePaths = _.map(includePaths, function (includePath) {
            return includePath.length ? `${includePath}/${name}` : name
        })

        for (let includePath of includePaths) {
            try {
                let filter = require(includePath)

                return typeof filter === 'function' ? filter : filter.default
            }
            catch (error) {}
        }

    }
}
