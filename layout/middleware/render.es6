'use strict'

import {requestEndOfStream} from '../../lib/request'
import Logger from '../../lib/logger'

const logger = Logger.instance()

function initHelpers(hbs, contentEndpoints) {
    hbs.registerHelper('content', function(value, ctx) {
        logger.debug(`Fetching content for ${value} via ${contentEndpoints[value]}`)
        ctx.data.koa.state.async[value] = requestEndOfStream(contentEndpoints[value])

        return `@@async/${value}`;
    })

    hbs.registerHelper('lazyContent', function () {

    })
}

export default function (hbs, contentEndpoints) {
    initHelpers(hbs, contentEndpoints)

    return function *(next) {
        this.renderAsync = function *(template, data) {
            this.state.async = {}

            yield this.render(template, data)

            console.log(this.state.async)
            let asyncData = yield this.state.async
            console.log(asyncData)

            for (let name in asyncData) {
                this.response.body = this.response.body.replace(`@@async/${name}`, asyncData[name])
            }
        }

        yield next
    }
}
