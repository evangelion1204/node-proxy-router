'use strict'

import Logger from '../logger'
import {Tree} from 'radix-tree'
import RouteBuilder from '../builder/route'

const _ = require('lodash')

const logger = Logger.instance()

export default class JSON {
    constructor(router) {
        this._router = router
    }

    read(src) {
        const routes = require(src)

        this.process(routes)

        return this
    }

    process(routes) {
        for (let route of routes) {
            this._router.addRawRoute(route)
        }

        return this
    }
}
