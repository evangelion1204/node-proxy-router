'use strict'

const http = require('http')
const keepAliveAgent = new http.Agent({ keepAlive: true });

const server = http.createServer(function (request, response) {
    console.time('Connect')
    console.time('Proxy')
    var options = {
        host: '62.50.56.175',
        port: 80,
        path: request.url,
        method: 'GET',
        headers: request.headers,
        agent: keepAliveAgent
    }

    options.headers['Host'] = 'www.zalando-lounge.de'
    options.headers['Cookie'] = ['BIGipServeritr-lounge_http=2032208394.20480.0000']

    var req = http.request(options, function(res) {
        console.timeEnd('Connect')
        console.time('Server')
        response.writeHead(res.statusCode, res.headers)

        res.on('data', function (chunk) {
            response.write(chunk)
        })

        res.on('end', function() {
            response.end()
            console.timeEnd('Server')
            console.timeEnd('Proxy')
        })
    })

    req.on('error', function(e) {
        console.log('problem with request: ' + e.message)
    })

    req.end()

}).listen(3000)

console.log('running on 3000')