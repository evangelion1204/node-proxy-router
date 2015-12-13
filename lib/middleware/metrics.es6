'use strict'

import Logger from '../../lib/logger'

export default function () {
    const metrics = {
        count: {},
        response: {}
    }

    return function *(next) {
        if (this.request.path == '/metrics') {
            this.response.body = metrics

            return
        }

        const start = new Date

        this.res.once('finish', function () {
            const end = new Date

            const total = end - start

            if (!metrics.count[this.request.path]) {
                metrics.count[this.request.path] = 0
                metrics.response[this.request.path] = 0
            }

            metrics.response[this.request.path] = (metrics.response[this.request.path] * metrics.count[this.request.path] + total) / (metrics.count[this.request.path] + 1)
            metrics.count[this.request.path]++
        }.bind(this))

        yield next
    }
}