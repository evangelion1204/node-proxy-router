'use strict'

import Logger from '../logger'
import eskipReader from '../reader/eskip'

const _ = require('lodash')
const fs = require('fs')

const logger = Logger.instance()

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
}
