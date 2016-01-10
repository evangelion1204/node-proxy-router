# Router [![Build Status](https://travis-ci.org/evangelion1204/node-proxy-router.svg)](https://travis-ci.org/evangelion1204/node-proxy-router) [![Coverage Status](https://coveralls.io/repos/evangelion1204/node-proxy-router/badge.svg?branch=master&service=github)](https://coveralls.io/github/evangelion1204/node-proxy-router?branch=master)

The router acts as a reverse proxy from defined rules to specified endpoints.

## Route definitions

Routes are matched against all parts of a HTTP request. Currently implemented are

* Path
    * STRICT - an exact match to the corresponding path
    * REGEX - a regular expression match
 