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

export const regexpDefinition = {
    regexp: {
        matcher: {
            path: {
                match: '/catalog-*',
                type: 'REGEX'
            }
        },
        endpoint: 'http://domain.tld'
    }
}

export const routesDefinition = Object.assign({}, strictDefinition, regexpDefinition)

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
                valie: 'xmlhttprequest',
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

