'use strict'

function initHelpers(hbs, contentEndpoints) {
    hbs.registerHelper('content', function(value, ctx) {
        ctx.data.koa.state.async[value] = new Promise(function (resolve, reject) {
            setTimeout(function () {resolve(value)}, 1000)
        })

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
                this.response.body = this.response.body.replace(`@@async/${name}`, asyncData[name])
            }
        }

        yield next
    }
}
