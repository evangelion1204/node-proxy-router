'use strict'

import {request} from '../../lib/request'
import Logger from '../../lib/logger'
const Readable = require('stream').Readable

const path = require('path')
const fs = require('fs')
const util = require('util')
const co = require('co')

const _ = require('lodash')
const Handlebars = require('handlebars')

const logger = Logger.instance()

class StreamHbs {
    constructor(options, contentEndpoints) {
        this.handlebars = Handlebars.create()
        this.contentEndpoints = contentEndpoints

        this.cache = {}

        this.options = options
    }

    init() {
        this.initHelpers()
    }

    initHelpers() {
        this.handlebars.registerHelper('content', function(name, options) {
            logger.debug(`Fetching content for ${name} via ${this.contentEndpoints[name]}`)
            options.data.koa.state.async[name] = request(this.contentEndpoints[name], options.data.koa.request.headers)

            return `<div id="async-${name}"></div>`
        }.bind(this))

        this.handlebars.registerHelper('primary', function(name, options) {
            logger.debug(`Fetching content for ${name} via ${this.contentEndpoints[name]}`)
            options.data.koa.state.async[name] = request(this.contentEndpoints[name], options.data.koa.request.headers)
            options.data.koa.state.async[name].primary = true

            return `<div id="async-${name}"></div>`
        }.bind(this))
    }

    *prepareTemplate(tpl) {
        if (this.cache[tpl]) {
            return
        }

        const fullTemplatePath = path.join(this.options.viewPath, tpl + this.options.extname)
        logger.debug(`Template ${tpl} not cached, loading ${fullTemplatePath}`)
        const rawTemplate = yield this.readFile(fullTemplatePath)

        this.cache[tpl] = this.handlebars.compile(rawTemplate)
    }

    readFile(path) {
        return function (callback) {
            fs.readFile(path, {encoding: 'utf8'}, callback)
        }
    }

    *render(tpl, ctx, koa) {
        koa.state.async = {}

        logger.debug(`Rendering template ${tpl}`)
        const template = this.cache[tpl]

        return (
            template(
                _.merge(ctx, {data: {koa: koa}}),
                {data: {koa: koa}}
            )
        )
    }

    *injectAsyncContent(output, koa) {
        let asyncResponses = yield this.getAsyncContent(koa)

        if (this.handlePrimaryResponse(asyncResponses, koa)) {
            return false
        }

        for (let name in asyncResponses) {
            let response = asyncResponses[name]
            output = output.replace(`<div id="async-${name}"></div>`, response.body)

            let responseHeader = _.find(response.headers, (headerValue, headerName) => headerName.startsWith('x-response'))
            if (responseHeader !== undefined) {
                koa.response.set(`x-response-time-${name}`, responseHeader)
            }
        }

        return output
    }

    handlePrimaryResponse(asyncResponses, koa) {
        let primaryName = _.findKey(this.getAsyncContent(koa), (content) => content.primary === true)

        if (!primaryName) {
            return
        }

        let response = asyncResponses[primaryName]

        if (response.statusCode !== 200) {
            koa.response.status = response.statusCode
            koa.response.set(response.headers)
            koa.response.body = response.body

            return true
        }
    }

    getAsyncContent(koa) {
        return koa.state.async
    }
}

class View {
    constructor (engine, koa) {
        this.koa = koa
        this.engine = engine
        this.values = {}

        this.mode = 'parallel'

        Readable.call(this)
    }

    *render() {
        this.koa.response.body = this

        yield this.engine.prepareTemplate(this.template)

        this.koa.response.type = 'text/html'

        let output = yield this.engine.render(this.template, this.values, this.koa)

        if (this.mode === 'parallel') {
            output = yield this.engine.injectAsyncContent(output, this.koa)

            if (output === false) {
                // close view
                this.close()
                return
            }

            this.push(output)
        } else {
            this.push(output)

            let asyncContent = this.engine.getAsyncContent(this.koa)

            for (let name in asyncContent) {
                let promise = asyncContent[name]

                promise.then(function (response) {
                    this.push(this._wrapScriptTag(name, response.body.replace(/\n/g, '')))
                }.bind(this))
            }

            yield asyncContent
        }

        this.close()
    }

    close() {
        this.push(null)
    }

    _wrapScriptTag(name, content) {
        return `<script type="application/javascript">document.getElementById("async-${name}").innerHTML = ${JSON.stringify(content)};</script>`
    }

    _read() {}
}

util.inherits(View, Readable)

export default function (options, contentEndpoints) {
    const hbs = new StreamHbs(options, contentEndpoints)
    hbs.init()

    return function *(next) {
        this.view = new View(hbs, this)

        yield next

        co.wrap(this.view.render).call(this.view).catch(this.onerror)

    }
}
