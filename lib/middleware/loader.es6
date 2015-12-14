'use strict'

import Logger from '../../lib/logger'
const path = require('path')
const _ = require('lodash')

export default function (app, config) {
    for (let name of config.enabled) {
        let middleware = loadMiddleware(name, config.paths)

        app.use(middleware(config[name] ? config[name] : undefined))
    }
}

function loadMiddleware(name, paths = []) {
    let includePaths = [''].concat(paths)

    includePaths = _.map(includePaths, function (includePath) {
        return includePath.length ? `${includePath}/${name}` : name
    })

    for (let includePath of includePaths) {
        try {
            let middleware = require(includePath)

            return typeof middleware === 'function' ? middleware : middleware.default
        }
        catch (error) {}
    }

    throw new Error(`Middleware "${name}" could not be found.`)
}