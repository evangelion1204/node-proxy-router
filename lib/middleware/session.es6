'use strict'

const Memcached = require('memcached')
const _ = require('lodash')
const uuid = require('uuid')

const cache = new Memcached('session:11211')

export const SESSION_HEADER = 'x-user-id'

export function session(app) {
    app.use(function* (next) {
        let sessionId = this.request.get(SESSION_HEADER)

        this.session = (sessionId ? yield read(sessionId) : {}) || {}

        yield next

        if (!_.isEmpty(this.session)) {
            if (!sessionId) {
                sessionId = uuid.v4()
            }

            save(sessionId, this.session)

            this.response.set(SESSION_HEADER, sessionId)
        }
    })
}

function read(key) {
    return new Promise(function (resolve) {
        cache.get(key, function (err, data) {
            resolve(data)
        })
    })
}

function save(key, session) {
    cache.set(key, session, 3600, function () {
        console.log(arguments)
    })
}