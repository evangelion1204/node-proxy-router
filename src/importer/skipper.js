'use strict'

import Logger from '../logger'
import {Tree} from 'radix-tree'
import RouteBuilder from '../builder/route'

const _ = require('lodash')
const rp = require('request-promise')
import Rest from './rest'

const logger = Logger.instance()

export default class Skipper extends Rest {
    constructor(router) {
        super(router, this.parseSkipperRoutes)
    }

    parseSkipperRoutes(definition) {
        return Object.assign(
            {
                id: definition.id
            },
            definition.route
        )
    }

    read(url, cb = null) {
        logger.log(`Reading from innkeeper at ${url}`)

        const options = {
            uri: url,
            json: true
        };

        rp(options)
            .then(function (routes) {
                this.process(this._transform(routes))
                if (cb) {
                    cb(null)
                }
            }.bind(this))
            .catch(function (err) {
                if (cb) {
                    cb(err)
                }
                else {
                    throw new Error(err)
                }
            })

        return this;
    }

    process(routes) {
        for (let route of routes) {
            this._router.addRawRoute(route)
        }

        return this
    }
}
