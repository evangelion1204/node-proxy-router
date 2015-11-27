'use strict'

import Logger from '../../lib/logger'

const http = require('http')
const https = require('https')
const httpAgent = new http.Agent({ keepAlive: true })
const httpsAgent = new https.Agent({ keepAlive: true })
const url = require('url')
const nodeRequest = require('request')

const logger = Logger.instance()

export function request(uri, headers = {}) {
    return new Promise(function (resolve, reject) {
        nodeRequest.get({url: uri, headers: headers}, function (err, response) {
            resolve(response)
        })
    })
}

export function post(uri, headers = {}, payload) {
    return new Promise(function (resolve, reject) {
        payload.pipe(
            nodeRequest.post({url: uri, headers: headers}, function (err, response) {
                resolve(response)
            })
        )
    })
}