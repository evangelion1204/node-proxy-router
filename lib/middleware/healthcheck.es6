'use strict'

import Logger from '../../lib/logger'

export default function () {
    return function *(next) {
        if (this.request.path !== '/health-check') {
            yield next
            return
        }

        this.response.body = 'ok'
    }
}