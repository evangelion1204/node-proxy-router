'use strict'

import Logger from '../../lib/logger'

const url = require('url')
const nodeRequest = require('request')
const _ = require('lodash')

const logger = Logger.instance()

export function request(uri, headers = {}) {
    let requestHeaders = _.clone(headers)
    delete requestHeaders['host']

    return new Promise(function (resolve, reject) {
        nodeRequest.get({url: uri, headers: requestHeaders, followRedirect: false, gzip: true}, function (err, response) {
            resolve(response)
        })
    })
}

export function requestStream(uri, headers = {}, callback = undefined) {
    let requestHeaders = _.clone(headers)
    delete requestHeaders['host']

    return nodeRequest.get({url: uri, headers: requestHeaders, followRedirect: false, gzip: true}, callback)
}

export function post(uri, headers = {}, payload) {
    let requestHeaders = _.clone(headers)
    delete requestHeaders['host']

    return new Promise(function (resolve, reject) {
        payload.pipe(
            nodeRequest.post({url: uri, headers: requestHeaders, followRedirect: false, gzip: true}, function (err, response) {
                resolve(response)
            })
        )
    })
}