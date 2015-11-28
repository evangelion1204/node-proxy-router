'use strict'

import Logger from '../../lib/logger'

const url = require('url')
const nodeRequest = require('request')

const logger = Logger.instance()

export function request(uri, headers = {}) {
    return new Promise(function (resolve, reject) {
        nodeRequest.get({url: uri, headers: headers, followRedirect: false}, function (err, response) {
            resolve(response)
        })
    })
}

export function post(uri, headers = {}, payload) {
    return new Promise(function (resolve, reject) {
        payload.pipe(
            nodeRequest.post({url: uri, headers: headers, followRedirect: false}, function (err, response) {
                resolve(response)
            })
        )
    })
}