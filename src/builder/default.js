'use strict'

import Logger from '../../logger'

const _ = require('lodash')

const logger = Logger.instance()

const STRICT = 'STRICT'
const REGEX = 'REGEX'

export default class DefaultBuilder {
    constructor(resolver) {
        this.resolver = resolver
    }
}
