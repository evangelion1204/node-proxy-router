'use strict'

import Logger from '../logger'
import {Tree} from 'radix-tree'

const _ = require('lodash')

const logger = Logger.instance()

export default class eskip {
    constructor(router) {
        this._router = router
    }

    read(src, cb = null) {
        logger.log(`Reading source ${src}`)

        const importRoutes = require(src)
        const registeredIds = this._router.getRegisteredRoutesIds()

        this.process(
            importRoutes,
            _.xor(registeredIds, importRoutes.map(route => route.id))
        )

        if (cb) {
            cb()
        }

        return this
    }

    process(newRoutes, deletedIds = []) {
        for (let route of newRoutes) {
            this._router.addRawRoute(route)
        }

        for (let id of deletedIds) {
            this._router.removeRoute(id)
        }

        return this
    }
}
