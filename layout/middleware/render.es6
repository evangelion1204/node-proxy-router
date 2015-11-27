'use strict'

import {request} from '../../lib/request'
import Logger from '../../lib/logger'

const logger = Logger.instance()

function initHelpers(hbs, contentEndpoints) {
    hbs.registerHelper('content', function(value, ctx) {
        logger.debug(`Fetching content for ${value} via ${contentEndpoints[value]}`)
        ctx.data.koa.state.async[value] = request(contentEndpoints[value], ctx.data.koa.request.headers)

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

            let asyncData = yield this.state.async

            for (let name in asyncData) {
                this.response.body = this.response.body.replace(`@@async/${name}`, asyncData[name].body)
            }
        }

        yield next
    }
}
