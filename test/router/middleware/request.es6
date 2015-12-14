'use strict'

const koa = require('koa')
const request = require('supertest')
const chai = require('chai')
const expect = chai.expect

import middleware from '../../../router/middleware/request'

describe('request middlware', function() {
    let app

    beforeEach(function () {
        app = koa()
    })

    it('init method should return a generator', function () {
        expect(middleware).to.be.defined
        expect(middleware().next).to.be.defined
    })
})