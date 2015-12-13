'use strict'

import Logger from '../../lib/logger'

export default function () {
    const metrics = {
        count: {

        }
    }
    return function *(next) {
        if (this.request.path == '/metrics') {
            this.response.body = metrics

            return
        }

        metrics.count[this.request.path] = metrics.count[this.request.path] ? metrics.count[this.request.path] + 1 : 1

        yield next
    }
}