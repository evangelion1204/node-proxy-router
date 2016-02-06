'use strict'

import Logger from '../logger'
import {Tree} from 'radix-tree'
import RouteBuilder from '../builder/route'

const _ = require('lodash')
const rp = require('request-promise')

const logger = Logger.instance()

export default class Rest {
    constructor(router, transform = (data) => data) {
        this._router = router
        this._transform = transform
    }

    read(url, cb = null) {
        logger.log(`Reading from url ${url}`)

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
