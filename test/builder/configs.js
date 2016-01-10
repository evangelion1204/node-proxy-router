'use strict'

export const strictDefinition = {
    strict: {
        matcher: {
            path: {
                match: '/test',
                type: 'STRICT'
            }
        },
        endpoint: 'http://domain.tld'
    }
}

export const regexDefinition = {
    regex: {
        matcher: {
            path: {
                match: '^/abc',
                type: 'REGEX'
            }
        },
        endpoint: 'http://domain.tld/regex'
    },
    regexFull: {
        matcher: {
            path: {
                match: '^/def$',
                type: 'REGEX'
            }
        },
        endpoint: 'http://domain.tld/regex-full'
    }
}

export const routesDefinition = Object.assign({}, strictDefinition, regexDefinition)

export const routesWithPostDefinition = Object.assign({}, routesDefinition, {
    strictPost: {
        matcher: {
            path: {
                match: '/test',
                type: 'STRICT'
            },
            method: 'POST'
        },
        endpoint: 'http://domain.tld/new'
    }
})

export const strictHeaderAjaxDefinition = {
    strict: {
        matcher: {
            headers: [{
                name: 'HTTP_X_REQUESTED_WITH',
                value: 'xmlhttprequest',
                type: 'STRICT'
            }]
        },
        endpoint: 'http://domain.tld/ajax'
    }
}

export const strictPathAndHeaderAjaxDefinition = {
    strict: {
        matcher: {
            path: {
                match: '/path/header',
                type: 'STRICT'
            },
            headers: [{
                name: 'HTTP_X_REQUESTED_WITH',
                value: 'xmlhttprequest',
                type: 'STRICT'
            }]
        },
        endpoint: 'http://domain.tld/ajax'
    }
}

export const routerPort = 4444

export const routerBaseDefinition = {
    strict: {
        matcher: {
            path: {
                match: '/',
                type: 'STRICT'
            }
        },
        endpoint: 'http://localhost:' + routerPort
    }
}

export const routerBaseWithFilterDefinition = {
    strict: {
        matcher: {
            path: {
                match: '/',
                type: 'STRICT'
            }
        },
        filters: [
            {
                name: 'requestHeader',
                args: ['header', 'value']
            }
        ],
        endpoint: 'http://localhost:' + routerPort
    }
}

