'use strict'

export default class Logger {
    static instance() {
        return new Logger()
    }

    log() {
        console.log.apply(console, arguments)
    }

    debug() {
        //console.log.apply(console, arguments)
    }
}
