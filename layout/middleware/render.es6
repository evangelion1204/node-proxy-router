'use strict'

import {request} from '../../lib/request'
import Logger from '../../lib/logger'

const _ = require('lodash')
const logger = Logger.instance()

export default function (hbs, contentEndpoints) {
    initHelpers(hbs, contentEndpoints)

    return function *(next) {
        this.renderAsync = function *(template, data) {
            this.state.async = {}

            yield this.render(template, data)

            let asyncResponses = yield this.state.async

            handleNonSuccessResponses(asyncResponses, this)

            for (let name in asyncResponses) {
                let response = asyncResponses[name]

                this.response.body = this.response.body.replace(`@@async/${name}`, response.body)

                let responseHeader = _.find(response.headers, (headerValue, headerName) => headerName.startsWith('x-response'))
                if (responseHeader !== undefined) {
                    this.response.set(`x-response-time-${name}`, responseHeader)
                }
            }
        }

        yield next
    }
}

function initHelpers(hbs, contentEndpoints) {
    hbs.registerHelper('content', function(value, ctx) {
        logger.debug(`Fetching content for ${value} via ${contentEndpoints[value]}`)
        ctx.data.koa.state.async[value] = request(contentEndpoints[value], ctx.data.koa.request.headers)

        return `@@async/${value}`;
    })

    hbs.registerHelper('lazyContent', function () {

    })
}

function handleNonSuccessResponses(asyncResponses, ctx) {
    for (let name in asyncResponses) {
        let response = asyncResponses[name]
        if (response.statusCode !== 200) {
            ctx.response.status = response.statusCode
            ctx.response.set(response.headers)
            ctx.response.body = response.body

            return
        }
    }
}