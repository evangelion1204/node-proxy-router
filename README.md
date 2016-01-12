# Router [![Build Status](https://travis-ci.org/evangelion1204/node-proxy-router.svg)](https://travis-ci.org/evangelion1204/node-proxy-router) [![Coverage Status](https://coveralls.io/repos/evangelion1204/node-proxy-router/badge.svg?branch=master&service=github)](https://coveralls.io/github/evangelion1204/node-proxy-router?branch=master)

The router acts as a reverse proxy from defined rules to specified endpoints.

## Type of Routes

Routes are matched against all parts of a HTTP request. Currently implemented are

* Path
    * STRICT - an exact match to the corresponding path
    * REGEX - a regular expression match
* Header matches
    * detect AJAX requests
* Method matches
    * GET, POST ...
 
### Simple Example

To get the proxy running is straight forward.

```js
var NodeProxyRouter = require('node-proxy-router')
var router = new NodeProxyRouter.Server()

router.addRoute('/mytarget', 'http://domain.tld/')

router.listen(3000)
```

### Defining routes

#### STRICT Path routes

The router offers `addRoute(path, endpoint, id = '', method = null, filters = [])` to add simple strict routes. Path and endpoint are mandetory.

```js
router.addRoute('/mytarget', 'http://domain.tld', 'root') // root page
router.addRoute('/mytarget/register', 'http://domain.tld/register', 'register', 'POST') // just handle POST requests for /register
```

#### REGEX Path routes

Always be aware, that REGEX routes are the slowest ones, cause they can't take advantage of the radix tree in the background. The router will loop over every single regex route to find a match. The interface looks like `addRegexRoute(path, endpoint, id = '', method = null, filters = [])`, path and endpoint are mandetory.

```js
router.addRegexRoute('^/mytarget', 'http://domain.tld', 'root') // handle all requests that starts with /mytarget
router.addRoute('/mytarget/register', 'http://domain.tld/register', 'register', 'POST') // expect the register POST
```

#### Method matches

You can see above how to handle different methods, by default all methods are handle by a route.

#### Complex examples

In some cases, especially when headers and other matchers are required, the simple interface might not be enough, in that case it is possible to use
* the raw route config
* use the route builder

If you don't plan to use any automatic route generation from JSON files you can skip the raw config section and continue with the builder.  

##### The raw config

The structure of routes looks the following and is best explained with an example.

```js
var route = {
  id: 'myid',
  matcher: {
    path: {
      match: 'regex|path', // simply add a regex as string '^/abc'
      type: 'POST|STRICT',
    },
    method: 'GET|POST|DELETE|...',
    headers: [{
      name: 'HTTP_X_REQUESTED_WITH', // header name
      value: 'xmlhttprequest', // header value
      type: 'STRICT' // currently only STRICT supported
    }]
  }
}

router.addComplexRoute(route)
```

There can be as many header matchers as required, but only either STRICT path or REGEX path match, same applies for method. 

##### Route Builder

The easier way to build routes is the usage of the builder interface.

```js
router.newRoute()
  .setStrictPath('/mytarget/register')
  .setMethod('POST')
  .setEndpoint('http://domain.tld/register')
  .setId('register')
  .save()
  
router.newRoute()
  .setStrictPath('/mytarget/cart')
  .matchHeader('HTTP_X_REQUESTED_WITH', 'xmlhttprequest')
  .setEndpoint('http://domain.tld/register')
  .setId('register')
  .save()
  
router.newRoute()
  .setRegexPath('^/mytarget')
  .setEndpoint('http://domain.tld')
  .setId('root')
  .save()
```