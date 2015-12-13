'use strict'

import {request, requestStream} from '../../lib/request'
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
    constructor(options) {
        this.handlebars = Handlebars.create()
        this.options = options

        this.cache = {}
    }

    init() {
        this.initHelpers()
    }

    initHelpers() {
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
}

class JsonResult {
    constructor (engine, koa, options) {
        this.koa = koa
        this.engine = engine
        this.values = {}
        this.options = options

        Readable.call(this)
    }

    sendHeaders() {
        this.koa.response.body = this
        this.koa.response.type = 'application/json'
        // flush headers
        this.push(' ')
    }

    *renderAndSend() {
        if (!this.template) {
            this.end()
            return
        }

        yield this.engine.prepareTemplate(this.template)

        let output = yield this.engine.render(this.template, yield this.values, this.koa)

        output = JSON.stringify(
            {
                html: output,
                scripts: this.options.resources.scripts,
                styles: this.options.resources.styles
            }
        )

        this.push(output)

        this.end()
    }

    end() {
        this.push(null)
    }

    _read() {}
}

util.inherits(JsonResult, Readable)

export default function (options) {
    const hbs = new StreamHbs(options)
    hbs.init()

    return function *(next) {
        this.result = new JsonResult(hbs, this, options)

        yield next

        this.result.sendHeaders()

        co.wrap(this.result.renderAndSend).call(this.result).catch(this.onerror)
    }
}
