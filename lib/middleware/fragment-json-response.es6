'use strict'

export default function (options) {
    return function *(next) {
        yield next

        this.body = JSON.stringify(
            {
                html: this.body,
                scripts: options.resources.scripts,
                styles: options.resources.styles
            }
        )
        this.response.type = 'application/json'
    }
}